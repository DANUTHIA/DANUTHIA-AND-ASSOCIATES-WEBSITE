import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, storage, handleFirestoreError, OperationType, uploadLargeFile, downloadLargeFile, MAX_FILE_SIZE } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, or, updateDoc, doc, getDoc, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, FileText, Calendar, Clock, Download, MessageSquare, 
  Send, Upload, CheckCircle2, Loader2, Circle, Box, CreditCard, 
  Bell, ChevronRight, Check, AlertCircle, X, Maximize2, Shield,
  FileCheck, Activity, Edit
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Gltf, Environment } from '@react-three/drei';
import Magnetic from '../components/Magnetic';
import { Skeleton } from '../components/Skeleton';
import OnboardingWizard from '../components/OnboardingWizard';
import BlueprintAnnotation from '../components/BlueprintAnnotation';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

interface VaultDocument {
  id: string;
  clientId: string;
  fileName: string;
  fileType: string;
  fileData: string;
  uploadedBy: string;
  createdAt: any;
  hasChunks?: boolean;
  totalChunks?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

interface Milestone {
  id: string;
  clientId: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  date?: string;
  order: number;
  createdAt: any;
}

interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  description: string;
  status: 'unpaid' | 'paid';
  dueDate: string;
  createdAt: any;
}

interface ProjectModel {
  id: string;
  clientId: string;
  title: string;
  modelUrl: string;
  createdAt: any;
}

interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

interface ProjectUpdate {
  id: string;
  clientId: string;
  title: string;
  description: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: any;
  hasChunks?: boolean;
}

const ResolvedUpdate = ({ update }: { update: ProjectUpdate }) => {
  const [resolvedData, setResolvedData] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (update.hasChunks && !resolvedData && !resolving) {
      setResolving(true);
      downloadLargeFile(update)
        .then(data => setResolvedData(data))
        .catch(err => console.error("Update resolution failed", err))
        .finally(() => setResolving(false));
    }
  }, [update, resolvedData, resolving]);

  const finalUrl = resolvedData || update.imageUrl || update.fileUrl;
  const isImage = (update.imageUrl || (resolvedData && resolvedData.startsWith('data:image'))) && !update.fileName;

  const handleUpdateDownload = () => {
    if (!finalUrl) return;
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = update.fileName || 'update-asset';
    link.click();
  };

  return (
    <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 hover:border-accent/30 transition-colors duration-500">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete transition-colors duration-500">{update.title}</h3>
        <span className="text-[10px] font-mono text-steel uppercase tracking-widest border border-steel/20 dark:border-concrete/20 px-3 py-1.5 transition-colors duration-500">
          {update.createdAt?.toDate().toLocaleDateString()}
        </span>
      </div>
      <p className="text-charcoal/70 dark:text-concrete/70 font-light leading-relaxed mb-6 transition-colors duration-500">{update.description}</p>
      
      {(update.fileName || (resolvedData && !isImage)) && (
        <div className="mb-6 p-4 bg-charcoal/5 dark:bg-concrete/5 border border-steel/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-charcoal dark:text-concrete">
              {update.fileName || 'Attached Document'}
            </span>
          </div>
          {resolving ? (
            <div className="flex items-center gap-2 px-4 py-2 text-steel font-mono text-[10px] uppercase">
              <Loader2 size={12} className="animate-spin" /> Resolving...
            </div>
          ) : (
            <button 
              onClick={handleUpdateDownload}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-accent hover:text-white transition-colors"
            >
              <Download size={14} /> Download
            </button>
          )}
        </div>
      )}

      {isImage && (
        <div className="mt-6 aspect-[16/9] bg-concrete dark:bg-charcoal relative overflow-hidden transition-colors duration-500">
          {resolving ? (
            <div className="absolute inset-0 flex items-center justify-center bg-steel/5">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          ) : (
            <img 
              src={finalUrl} 
              alt="Project Update" 
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" 
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Loading states
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [milestonesLoading, setMilestonesLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Data states
  const [updates, setUpdates] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [models, setModels] = useState<ProjectModel[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docConsent, setDocConsent] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<VaultDocument | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [technicalReports, setTechnicalReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ProjectModel | null>(null);
  const [isModelFullScreen, setIsModelFullScreen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [isResolvingBlueprint, setIsResolvingBlueprint] = useState(false);

  const handleOpenBlueprint = async (doc: VaultDocument) => {
    setIsResolvingBlueprint(true);
    try {
      const fullData = await downloadLargeFile(doc);
      setSelectedBlueprint({ ...doc, fileData: fullData });
    } catch (error) {
      console.error("Resolution failed", error);
    } finally {
      setIsResolvingBlueprint(false);
    }
  };
  
  // Testimonial states
  const [testimonial, setTestimonial] = useState({ rating: 5, comment: '', projectType: 'Residential' });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const fetchUserData = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let role = userData.role;
        const adminEmails = [
          'machariag605@gmail.com',
          'danuthiaandassociates@gmail.com'
        ];
        
        if (adminEmails.includes(currentUser.email)) {
          role = 'admin';
          if (userData.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
          }
        }

        setUser({ 
          ...currentUser, 
          role: role, 
          needsOnboarding: userData.needsOnboarding, 
          officialName: userData.officialName,
          assignedPM: userData.assignedPM,
          photoUrl: userData.photoUrl
        });
        setDisplayName(userData.officialName || '');
        setPhotoUrl(userData.photoUrl || null);
        setShowOnboarding(userData.needsOnboarding || !userData.officialName || false);

        if (userData.assignedPM) {
          const pmDoc = await getDoc(doc(db, 'users', userData.assignedPM));
          if (pmDoc.exists()) {
            setProjectData(prev => ({ ...prev, pmInfo: pmDoc.data() }));
          }
        }

        const projectDoc = await getDoc(doc(db, 'projects', currentUser.uid));
        if (projectDoc.exists()) {
          setProjectData(prev => ({ ...prev, ...projectDoc.data() }));
        }
      } else {
        const adminEmails = [
          'machariag605@gmail.com',
          'danuthiaandassociates@gmail.com'
        ];
        let role = adminEmails.includes(currentUser.email) ? 'admin' : 'pending';
        setUser({ ...currentUser, role: role });
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUser({ ...currentUser, role: 'pending' });
    } finally {
      setProjectLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        navigate('/login');
      } else {
        if (!currentUser.emailVerified) {
          setEmailUnverified(true);
          setLoading(false);
          return;
        }
        await fetchUserData(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Push Notifications Logic
  useEffect(() => {
    if (!user || user.role === 'pending') return;

    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };

    requestNotificationPermission();

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = change.doc.data() as AppNotification;
          if (Notification.permission === 'granted' && document.hidden) {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/logo.png'
            });
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || user.role === 'pending') return;

    const q = query(
      collection(db, 'projectUpdates'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUpdates = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdates(data);
      setUpdatesLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projectUpdates');
    });

    const messagesQuery = query(
      collection(db, 'messages'),
      or(
        where('senderId', '==', user.uid),
        where('receiverId', '==', user.uid)
      ),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(data);
      setMessagesLoading(false);
      
      // Mark unread messages as read carefully to avoid snapshot loops
      const unreadForMe = data.filter(msg => msg.receiverId === user.uid && !msg.read);
      if (unreadForMe.length > 0) {
        unreadForMe.forEach(msg => {
          updateDoc(doc(db, 'messages', msg.id), { read: true }).catch(() => {});
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });

    const docsQuery = query(
      collection(db, 'documents'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeDocs = onSnapshot(docsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VaultDocument[];
      setDocuments(data);
      setDocumentsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'documents');
    });

    const milestonesQuery = query(
      collection(db, 'milestones'),
      where('clientId', '==', user.uid),
      orderBy('order', 'asc')
    );

    const unsubscribeMilestones = onSnapshot(milestonesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Milestone[];
      setMilestones(data);
      setMilestonesLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'milestones');
    });

    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      setInvoices(data);
      setInvoicesLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'invoices');
    });

    const modelsQuery = query(
      collection(db, 'projectModels'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeModels = onSnapshot(modelsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectModel[];
      setModels(data);
      setModelsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projectModels');
    });

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppNotification[];
      setNotifications(data);
      setNotificationsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    const reportsQuery = query(
      collection(db, 'technicalReports'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTechnicalReports(data);
      setReportsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'technicalReports');
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeMessages();
      unsubscribeDocs();
      unsubscribeMilestones();
      unsubscribeInvoices();
      unsubscribeModels();
      unsubscribeNotifications();
      unsubscribeReports();
    };
  }, [user]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setPayingInvoice(invoiceId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.amount,
          description: invoice.description,
          clientId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      setPayingInvoice(null);
      setUploadError('Failed to initiate payment. Please try again.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const pmId = projectData?.pmInfo?.id || user.assignedPM || 'admin';

    setSendingMessage(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: pmId,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      setNewMessage('');

      // Send email notification to architect/PM
      fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "machariag605@gmail.com", // Send to our firm email ideally, or pm email
          name: "Architect",
          projectTitle: "New Client Message: " + newMessage.trim().substring(0, 20) + "..."
        })
      }).catch(err => console.error(err));

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setSendingMessage(false);
    }
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("DANUTHIA & CO.", 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("123 Architecture Blvd, Nairobi, Kenya", 20, 40);
    doc.text("hello@danuthia.com | +254 700 000000", 20, 45);

    doc.setFontSize(16);
    doc.text("INVOICE / RECEIPT", 20, 70);
    
    doc.setFontSize(12);
    doc.text(`Invoice ID: #${invoice.id.toUpperCase()}`, 20, 85);
    doc.text(`Date Issued: ${new Date(invoice.createdAt?.seconds * 1000).toLocaleDateString() || new Date().toLocaleDateString()}`, 20, 95);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 105);

    doc.setDrawColor(200);
    doc.line(20, 115, 190, 115);

    doc.text("Description", 20, 130);
    doc.text("Amount", 160, 130);
    
    doc.line(20, 135, 190, 135);

    doc.text(invoice.description, 20, 150);
    doc.text(`$${invoice.amount.toLocaleString()}`, 160, 150);

    doc.line(20, 160, 190, 160);

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 120, 180);
    doc.text(`$${invoice.amount.toLocaleString()}`, 160, 180);

    doc.save(`Danuthia_Invoice_${invoice.id}.pdf`);
  };

  const handleSignOut = async () => {
    try {
      setUser(null);
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingDoc(true);
    setUploadError('');

    let uploadedRef = null;
    try {
      const storageRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      uploadedRef = snapshot.ref;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await addDoc(collection(db, 'documents'), {
        clientId: user.uid,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileData: downloadURL,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // Send email notification to architect/PM
      fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "machariag605@gmail.com", 
          name: "Architect",
          projectTitle: "New Client Document Uploaded: " + file.name
        })
      }).catch(err => console.error(err));
      
      setUploadingDoc(false);
      e.target.value = '';
    } catch (error) {
      console.error(error);
      if (uploadedRef) {
        await deleteObject(uploadedRef).catch(console.error);
      }
      handleFirestoreError(error, OperationType.CREATE, 'documents');
      setUploadError('Failed to upload document.');
      setUploadingDoc(false);
    }
  };

  const handleDownload = async (doc: VaultDocument) => {
    try {
      const fullData = await downloadLargeFile(doc);
      const link = document.createElement('a');
      link.href = fullData;
      link.download = doc.fileName;
      link.click();
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to reconstruct file. Please try again.");
    }
  };

  const updateDocumentStatus = async (documentId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'documents', documentId), {
        status: newStatus
      });
      // Notify PM
      const targetDoc = documents.find(d => d.id === documentId);
      if (user && targetDoc) {
        await addDoc(collection(db, 'internalLogs'), {
          projectId: user.uid,
          staffName: "Client Portal",
          role: "client",
          message: `The client has **${newStatus.toUpperCase()}** the document: "${targetDoc.fileName}".`,
          status: 'pending_review',
          createdAt: serverTimestamp(),
          type: 'log'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'documents');
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingTestimonial(true);
    try {
      await addDoc(collection(db, 'testimonials'), {
        clientId: user.uid,
        clientName: user.displayName || 'Anonymous Client',
        rating: testimonial.rating,
        comment: testimonial.comment,
        projectType: testimonial.projectType,
        approved: false,
        createdAt: serverTimestamp()
      });
      setTestimonialSuccess(true);
      setTestimonial({ rating: 5, comment: '', projectType: 'Residential' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setTestimonialSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials');
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-concrete dark:bg-charcoal transition-colors duration-500">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (emailUnverified) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-concrete dark:bg-charcoal p-6 text-center transition-colors duration-500">
        <div className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-none border border-concrete/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-500">
              <Shield size={20} className="text-concrete" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight mb-4 text-concrete">Verify Email</h1>
          <p className="text-concrete/70 font-light leading-relaxed mb-8">
            Access restricted to verified email addresses exclusively. Please verify your email address to continue.
          </p>
          <Magnetic className="w-full">
            <button 
              onClick={handleSignOut}
              className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 text-xs"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </Magnetic>
        </div>
      </div>
    );
  }

  // Deny access to Staff Roles in the Client Portal
  const STAFF_ROLES = ['project_manager', 'architect', 'surveyor', 'planner', 'financial_analyst', 'engineer', 'pending_staff'];
  if (user && STAFF_ROLES.includes(user.role)) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-concrete dark:bg-charcoal p-6 text-center transition-colors duration-500">
        <div className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-none border border-red-500/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-colors duration-500">
              <AlertCircle size={20} className="text-red-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight mb-4 text-concrete uppercase tracking-widest">Access Denied</h1>
          <p className="text-concrete/70 font-mono text-[10px] uppercase tracking-widest leading-relaxed mb-8">
            Account classification detected: PROFESSIONAL/STAFF. Access to the Client Portal is restricted to Active Clients and Administrators exclusively. 
          </p>
          <Magnetic className="w-full">
            <button 
              onClick={handleSignOut}
              className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 text-xs"
            >
              <LogOut size={16} />
              Secure Sign Out
            </button>
          </Magnetic>
        </div>
      </div>
    );
  }

  if (user?.role === 'pending' && !showOnboarding) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-concrete dark:bg-charcoal p-6 text-center transition-colors duration-500">
        <div className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-none border border-concrete/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-500">
              <Clock size={20} className="text-concrete" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight mb-4 text-concrete">Pending Approval</h1>
          <p className="text-concrete/70 font-light leading-relaxed mb-8">
            Confirmation mandated by an administrator. Your account is currently pending approval. Access to the client portal is restricted to active clients of Danuthia Associates Construction LLc. We will notify you once your account has been verified.
          </p>
          <Magnetic className="w-full">
            <button 
              onClick={handleSignOut}
              className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 text-xs"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </Magnetic>
        </div>
      </div>
    );
  }

  if (user?.role === 'client' && !projectData && !projectLoading && !showOnboarding) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-concrete dark:bg-charcoal p-6 text-center transition-colors duration-500">
        <div className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-none border border-concrete/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-500">
              <Shield size={20} className="text-concrete" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight mb-4 text-concrete">Assigning Manager</h1>
          <p className="text-concrete/70 font-light leading-relaxed mb-8">
            You will be notified on the portal once assigned to a project manager.
          </p>
          <Magnetic className="w-full">
            <button 
              onClick={handleSignOut}
              className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 text-xs"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </Magnetic>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete py-12 px-6 md:px-12 transition-colors duration-500">
      {showOnboarding && user && (
        <OnboardingWizard 
          userId={user.uid} 
          onComplete={async () => {
            setShowOnboarding(false);
            setProjectLoading(true);
            await fetchUserData(auth.currentUser);
          }} 
        />
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-steel/20 dark:border-concrete/20 pb-8 transition-colors duration-500 relative">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-light tracking-tight mb-4">
              Client Portal
            </h1>
            <p className="text-steel font-mono text-xs uppercase tracking-[0.2em]">
              Profile: {user?.officialName || user?.displayName || 'Establishing Identity...'}
            </p>
          </div>
          
          <div className="flex items-center gap-6 mt-8 md:mt-0">
            {/* Profile Matrix */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="group cursor-pointer flex items-center gap-4 px-4 py-2 border border-steel/10 hover:border-accent transition-all bg-charcoal/5 dark:bg-concrete/5"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/20 group-hover:border-accent transition-all shadow-sm">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent font-mono text-[10px] font-bold">CP</div>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="font-mono text-[8px] text-steel uppercase tracking-[0.2em] mb-0.5">Tactical Profile</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest truncate max-w-[100px]">Edit Details</span>
                  <Edit size={10} className="text-accent" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 border border-charcoal dark:border-concrete hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-all duration-300 relative"
              >
                <Bell size={18} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-concrete dark:text-charcoal text-[10px] flex items-center justify-center rounded-none font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 shadow-2xl z-[100] p-4 transition-colors duration-500"
                  >
                    <div className="flex justify-between items-center mb-4 border-b border-steel/10 pb-2">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel">Notifications</h4>
                      <div className="flex items-center gap-3">
                        {notifications.some(n => !n.read) && (
                          <button 
                            onClick={handleMarkAllNotificationsRead}
                            className="text-[8px] font-bold uppercase tracking-tighter text-accent hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                        <button onClick={() => setShowNotifications(false)} className="text-steel hover:text-accent"><X size={14} /></button>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-steel font-light text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-3 border-l-2 transition-colors ${n.read ? 'border-steel/20 bg-transparent' : 'border-accent bg-accent/5'}`}
                            onClick={() => handleMarkNotificationRead(n.id)}
                          >
                            <h5 className="text-xs font-bold mb-1">{n.title}</h5>
                            <p className="text-[10px] text-steel leading-relaxed">{n.message}</p>
                            <span className="text-[8px] text-steel/50 mt-2 block uppercase tracking-tighter">
                              {n.createdAt?.toDate().toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Magnetic>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-6 py-3 border border-charcoal dark:border-concrete hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-all duration-500 font-bold uppercase tracking-widest text-xs"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </Magnetic>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-8 mb-12 border-b border-steel/10 pb-4 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Project HQ', icon: Box },
            { id: 'project', label: 'Project Overview', icon: Activity },
            { id: 'resources', label: 'Asset Vault', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-accent' : 'text-steel hover:text-charcoal dark:hover:text-concrete'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-12">
                {user?.role === 'admin' && (
                  <div className="flex justify-end pt-4 pb-2">
                    <Link to="/staff-portal" className="flex items-center gap-2 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent dark:hover:bg-accent hover:text-white transition-all shadow-md">
                      <Edit size={14} /> Update via PM Dashboard
                    </Link>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500">
                     <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Days Remaining</h3>
                     <p className="font-display text-4xl text-charcoal dark:text-concrete">{projectData?.daysRemaining ?? 'TBD'}</p>
                   </div>
                   <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500">
                     <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Budget Utilized</h3>
                     <div className="w-full bg-steel/20 h-2 mb-2">
                       <div className="bg-accent h-full" style={{ width: `${projectData?.budgetUtilized ?? 0}%` }}></div>
                     </div>
                     <p className="font-display text-xl text-charcoal dark:text-concrete">{projectData?.budgetUtilized ?? 0}%</p>
                   </div>
                   <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500 flex justify-between items-center">
                     <div>
                       <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Current Phase</h3>
                       <p className="font-display text-2xl text-charcoal dark:text-concrete">{projectData?.currentPhase ?? 'Initializing'}</p>
                     </div>
                     <a href="https://calendly.com/your-firm/consultation" target="_blank" rel="noopener noreferrer" className="bg-accent text-concrete dark:text-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors">
                       Schedule
                     </a>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                   <div className="lg:col-span-8 space-y-12">
                     {/* Project Summary */}
                     <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20">
                       <h2 className="font-display text-xl font-light tracking-tight mb-4 flex items-center gap-3">
                         <Activity size={18} className="text-accent" />
                         Project Status Update
                       </h2>
                       <p className="text-steel font-light leading-relaxed">
                         {projectData?.dailySummary || 'Welcome to your client portal. Here you can access all the resources and information you need to stay updated on your project.'}
                       </p>
                       {projectData?.nextActivity && (
                         <div className="mt-8 pt-8 border-t border-steel/10">
                           <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">Next Activity</h4>
                           <p className="text-sm font-medium">{projectData.nextActivity}</p>
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="lg:col-span-4">
                     <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 transition-colors duration-500 sticky top-24">
                       <h2 className="font-display text-xl font-light tracking-tight mb-8 flex items-center gap-3 text-charcoal dark:text-concrete transition-colors duration-500">
                         <Calendar className="text-accent" size={18} strokeWidth={1.5} />
                         Next Milestone
                       </h2>
                       {milestones.find(m => m.status === 'in-progress') ? (
                         <div className="space-y-4">
                           <h4 className="font-bold text-sm uppercase tracking-widest text-charcoal dark:text-concrete">
                             {milestones.find(m => m.status === 'in-progress')?.title}
                           </h4>
                           <p className="text-xs text-steel leading-relaxed">
                             Currently in progress. Estimated completion: {milestones.find(m => m.status === 'in-progress')?.date || 'TBD'}
                           </p>
                           <div className="w-full bg-steel/10 h-1">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '45%' }}
                               className="bg-accent h-full"
                             />
                           </div>
                         </div>
                       ) : (
                         <p className="text-xs text-steel font-mono">No active milestones.</p>
                       )}
                     </div>
                   </div>
                 </div>
              <div className="max-w-4xl mx-auto">
                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 flex flex-col h-[600px] transition-colors duration-500">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-steel/10">
                    <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-3 text-charcoal dark:text-concrete transition-colors duration-500">
                      <MessageSquare className="text-accent" size={20} strokeWidth={1.5} />
                      {projectData?.pmInfo?.officialName || 'Project Manager'}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-steel uppercase tracking-widest">
                        {projectData?.pmInfo?.title || 'Direct Liaison'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-steel text-sm font-light text-center">
                        Send a message to your project manager to get started.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.senderId === user?.uid;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 ${isMine ? 'bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal rounded-none transition-colors duration-500' : 'bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete border border-steel/20 dark:border-concrete/20 rounded-none transition-colors duration-500'}`}>
                              <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                              <span className="text-[10px] font-mono opacity-50 mt-2 block text-right uppercase tracking-widest">
                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-3 mt-auto">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 px-4 py-4 text-sm font-light focus:outline-none focus:border-accent dark:focus:border-accent text-charcoal dark:text-concrete transition-colors duration-500"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-8 py-4 hover:bg-accent dark:hover:bg-accent transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
              </div>
            )}

            {activeTab === 'project' && (
              <div className="space-y-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                    <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-4">
                      <Clock className="text-accent" size={20} strokeWidth={1.5} />
                      Recent Updates
                    </h2>
                    
                    {updatesLoading ? (
                      <div className="space-y-8">
                        {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full" />)}
                      </div>
                    ) : updates.length === 0 ? (
                      <div className="border border-steel/20 dark:border-concrete/20 p-12 text-center transition-colors duration-500">
                        <p className="text-steel font-light">No recent updates for your project.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {updates.map((update) => (
                          <ResolvedUpdate key={update.id} update={update} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8">
                      <h3 className="text-steel font-mono text-[10px] uppercase tracking-widest border-b border-steel/10 pb-4 mb-4">Project Parameters</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-steel uppercase tracking-widest text-[10px]">Scale</span>
                          <span className="font-light text-charcoal dark:text-concrete capitalize">{projectData?.scope?.scale || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-steel uppercase tracking-widest text-[10px]">Type</span>
                          <span className="font-light text-charcoal dark:text-concrete capitalize">{projectData?.scope?.type || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-steel uppercase tracking-widest text-[10px]">Budget Target</span>
                          <span className="font-light text-charcoal dark:text-concrete capitalize">{projectData?.scope?.budget || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-steel uppercase tracking-widest text-[10px]">Timeline</span>
                          <span className="font-light text-charcoal dark:text-concrete capitalize">{projectData?.scope?.timeline || 'Unknown'}</span>
                        </div>
                      </div>
                      
                      {projectData?.scope?.description && (
                        <div className="mt-8 pt-4 border-t border-steel/10">
                           <span className="font-mono text-steel uppercase tracking-widest text-[10px] block mb-2">Primary Objective</span>
                           <p className="text-xs text-charcoal/80 dark:text-concrete/80 leading-relaxed font-light">
                             {projectData.scope.description}
                           </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="font-display text-3xl font-light tracking-tight mb-2">Project Roadmap</h2>
                      <p className="text-steel font-mono text-[10px] uppercase tracking-widest">Visual Gantt Chart & Progress Tracker</p>
                    </div>
                    <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest text-steel">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-accent" />
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-charcoal dark:bg-concrete" />
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-steel/30" />
                        <span>Upcoming</span>
                      </div>
                    </div>
                  </div>

                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 overflow-x-auto transition-colors duration-500">
                  <div className="min-w-[800px] p-8">
                    {milestonesLoading ? (
                      <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                      </div>
                    ) : milestones.length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-steel font-mono">No milestones defined yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Timeline Header */}
                        <div className="grid grid-cols-12 gap-4 mb-8 border-b border-steel/10 pb-4 text-[10px] font-mono uppercase tracking-widest text-steel">
                          <div className="col-span-3">Phase / Milestone</div>
                          <div className="col-span-9 grid grid-cols-4 gap-4">
                            <div>Q1</div>
                            <div>Q2</div>
                            <div>Q3</div>
                            <div>Q4</div>
                          </div>
                        </div>

                        {/* Gantt Bars */}
                        {milestones.sort((a, b) => a.order - b.order).map((milestone, idx) => (
                          <motion.div 
                            key={milestone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="grid grid-cols-12 gap-4 items-center group"
                          >
                            <div className="col-span-3 py-4">
                              <h4 className={`text-xs font-bold uppercase tracking-wider ${
                                milestone.status === 'completed' ? 'text-accent' : 
                                milestone.status === 'in-progress' ? 'text-charcoal dark:text-concrete' : 
                                'text-steel'
                              }`}>
                                {milestone.title}
                              </h4>
                              <p className="text-[9px] font-mono text-steel/60 mt-1">{milestone.date || 'TBD'}</p>
                            </div>
                            <div className="col-span-9 relative h-8 bg-steel/5 rounded-none overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: milestone.status === 'completed' ? '100%' : 
                                         milestone.status === 'in-progress' ? '65%' : '0%',
                                  x: `${(idx % 4) * 20}%` // Mocking horizontal position
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`absolute h-full rounded-none ${
                                  milestone.status === 'completed' ? 'bg-accent' : 
                                  milestone.status === 'in-progress' ? 'bg-charcoal dark:bg-concrete' : 
                                  'bg-transparent'
                                }`}
                              />
                              {milestone.status === 'upcoming' && (
                                <div className="absolute inset-0 border border-dashed border-steel/20" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 border border-steel/10 bg-concrete dark:bg-charcoal">
                    <p className="text-[10px] font-mono uppercase text-steel mb-2">Overall Progress</p>
                    <p className="text-3xl font-display font-light">
                      {Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100) || 0}%
                    </p>
                  </div>
                  <div className="p-6 border border-steel/10 bg-concrete dark:bg-charcoal">
                    <p className="text-[10px] font-mono uppercase text-steel mb-2">Active Phase</p>
                    <p className="text-xl font-display font-light">
                      {milestones.find(m => m.status === 'in-progress')?.title || 'None'}
                    </p>
                  </div>
                  <div className="p-6 border border-steel/10 bg-concrete dark:bg-charcoal">
                    <p className="text-[10px] font-mono uppercase text-steel mb-2">Next Milestone</p>
                    <p className="text-xl font-display font-light">
                      {milestones.find(m => m.status === 'upcoming')?.title || 'Project Complete'}
                    </p>
                  </div>
                </div>

                <div className="bg-concrete dark:bg-charcoal p-8 md:p-12 border border-steel/20 dark:border-concrete/20 transition-colors duration-500 overflow-x-auto">
                  <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-12 flex items-center gap-2"><Activity size={16} className="text-accent" /> Live Project Tracker</h3>
                  <div className="flex items-center min-w-[600px] px-4">
                    {milestones.length === 0 ? (
                      <p className="text-steel font-mono text-xs">Awaiting project roadmap...</p>
                    ) : (
                      milestones.sort((a, b) => a.order - b.order).map((milestone, idx) => (
                        <div key={milestone.id} className="flex-1 relative">
                          {/* Connecting Line */}
                          {idx !== milestones.length - 1 && (
                            <div className="absolute top-3 left-1/2 w-full h-[2px] bg-steel/20 dark:bg-steel/40">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: milestone.status === 'completed' ? '100%' : '0%' }}
                                className="h-full bg-accent"
                                transition={{ duration: 1, delay: idx * 0.2 }}
                              />
                            </div>
                          )}
                          
                          {/* Node */}
                          <div className="relative flex flex-col items-center group">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mb-4 transition-colors duration-500 z-10 bg-concrete dark:bg-charcoal ${
                              milestone.status === 'completed' ? 'border-accent text-accent' : 
                              milestone.status === 'in-progress' ? 'border-charcoal dark:border-concrete border-dashed animate-pulse' : 
                              'border-steel/30 dark:border-steel/50'
                            }`}>
                              {milestone.status === 'completed' && <Check size={12} strokeWidth={4} />}
                              {milestone.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-charcoal dark:bg-concrete" />}
                            </div>
                            <span className={`text-[10px] font-mono uppercase tracking-widest text-center max-w-[120px] ${
                              milestone.status === 'completed' ? 'text-accent font-bold' : 
                              milestone.status === 'in-progress' ? 'text-charcoal dark:text-concrete font-bold' : 
                              'text-steel'
                            }`}>
                              {milestone.title}
                            </span>
                            <span className="text-[9px] font-mono text-steel mt-2">{milestone.date || 'TBD'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="font-display text-3xl font-light tracking-tight mb-2">Interactive 3D Models</h2>
                      <p className="text-steel font-mono text-[10px] uppercase tracking-widest">Explore your project in three dimensions</p>
                    </div>
                  </div>

                {modelsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full" />)}
                  </div>
                ) : models.length === 0 ? (
                  <div className="border border-steel/20 p-24 text-center">
                    <Box size={48} className="text-steel/20 mx-auto mb-6" strokeWidth={1} />
                    <p className="text-steel font-light">No 3D models have been uploaded for your project yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                      <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 aspect-video relative overflow-hidden transition-colors duration-500">
                        {selectedModel ? (
                          <div className="w-full h-full">
                            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                              <Stage environment="city" intensity={0.5}>
                                <Gltf src={selectedModel.modelUrl} castShadow receiveShadow />
                              </Stage>
                              <OrbitControls autoRotate autoRotateSpeed={0.5} />
                              <Environment preset="city" />
                            </Canvas>
                            <div className="absolute bottom-6 right-6 flex gap-3">
                              <button 
                                onClick={() => setIsModelFullScreen(true)}
                                className="p-3 bg-charcoal/80 dark:bg-concrete/80 text-concrete dark:text-charcoal hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-colors"
                              >
                                <Maximize2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-steel">
                            <Box size={48} className="mb-4 opacity-20" />
                            <p className="text-xs font-mono uppercase tracking-widest">Select a model to view</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                      <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Available Models</h3>
                      {models.map(model => (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModel(model)}
                          className={`w-full text-left p-6 border transition-all duration-300 ${
                            selectedModel?.id === model.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-steel/20 hover:border-accent/30 bg-concrete dark:bg-charcoal'
                          }`}
                        >
                          <h4 className="font-display text-lg font-light mb-2">{model.title}</h4>
                          <p className="text-[10px] text-steel font-mono uppercase tracking-tighter">
                            Uploaded: {model.createdAt?.toDate().toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                  <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 transition-colors duration-500">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-3">
                        <FileText className="text-accent" size={20} strokeWidth={1.5} />
                        Document Repository
                      </h2>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex bg-concrete/50 dark:bg-charcoal border border-steel/20 p-1">
                          {['all', 'pdf', 'image'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setCategoryFilter(cat)}
                              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                categoryFilter === cat ? 'bg-accent text-concrete dark:text-charcoal' : 'text-steel hover:text-charcoal dark:hover:text-concrete'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          className="bg-concrete/50 dark:bg-charcoal border border-steel/20 px-4 py-2 text-xs font-mono focus:outline-none focus:border-accent transition-colors"
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input 
                              type="checkbox" 
                              id="consent-checkbox-portal"
                              checked={docConsent}
                              onChange={(e) => setDocConsent(e.target.checked)}
                              className="shrink-0 accent-accent"
                            />
                            <label htmlFor="consent-checkbox-portal" className="text-[10px] font-mono text-concrete/70 leading-relaxed cursor-pointer">
                              I consent to the Privacy Policy & Terms.
                            </label>
                          </div>
                          <input 
                            type="file" 
                            id="doc-upload-vault" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            disabled={uploadingDoc || !docConsent}
                          />
                          <label 
                            htmlFor="doc-upload-vault" 
                            className={`cursor-pointer flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-charcoal dark:border-concrete px-6 py-3 hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-all duration-300 ${(uploadingDoc || !docConsent) ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <Upload size={14} />
                            {uploadingDoc ? 'Uploading...' : 'Upload New'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {uploadError && <p className="text-red-400 text-xs mb-6 bg-red-400/10 p-4 border-l-2 border-red-400">{uploadError}</p>}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-steel/10 text-[10px] font-mono text-steel uppercase tracking-widest">
                            <th className="pb-4 font-medium">Name</th>
                            <th className="pb-4 font-medium">Type</th>
                            <th className="pb-4 font-medium">Date</th>
                            <th className="pb-4 font-medium">Status</th>
                            <th className="pb-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-steel/5">
                          {documentsLoading ? (
                            [1, 2, 3].map(i => (
                              <tr key={i}><td colSpan={4} className="py-4"><Skeleton className="h-8 w-full" /></td></tr>
                            ))
                          ) : documents.length === 0 ? (
                            <tr><td colSpan={4} className="py-12 text-center text-steel font-light">No documents found.</td></tr>
                          ) : (
                            documents.filter(doc => (
                              (categoryFilter === 'all' || doc.fileType.includes(categoryFilter)) &&
                              doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
                            )).map(doc => (
                              <tr key={doc.id} className="group hover:bg-concrete/30 dark:hover:bg-charcoal/30 transition-colors">
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-steel" />
                                    <span className="text-sm font-light">{doc.fileName}</span>
                                  </div>
                                </td>
                                <td className="py-4 text-[10px] font-mono text-steel uppercase">{doc.fileType.split('/')[1] || 'FILE'}</td>
                                <td className="py-4 text-[10px] font-mono text-steel">{doc.createdAt?.toDate().toLocaleDateString()}</td>
                                <td className="py-4 text-[10px] font-mono uppercase tracking-widest">
                                  {doc.status === 'approved' ? (
                                    <span className="text-green-500 font-bold border border-green-500/30 px-2 py-1 bg-green-500/10 backdrop-blur-sm">Approved</span>
                                  ) : doc.status === 'rejected' ? (
                                    <span className="text-red-500 font-bold border border-red-500/30 px-2 py-1 bg-red-500/10 backdrop-blur-sm">Rejected</span>
                                  ) : (
                                    <span className="text-steel font-bold border border-steel/30 px-2 py-1 bg-steel/10 backdrop-blur-sm">Pending</span>
                                  )}
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-2 items-center">
                                    {(doc.status === 'pending' || !doc.status) && (
                                      <>
                                        <button 
                                          onClick={() => updateDocumentStatus(doc.id, 'approved')}
                                          className="p-1 px-3 text-[10px] font-mono tracking-widest text-green-500 border border-green-500 hover:bg-green-500 hover:text-white transition-colors"
                                          title="Sign Off / Approve"
                                        >
                                          APPROVE
                                        </button>
                                        <button 
                                          onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                                          className="p-1 px-3 text-[10px] font-mono tracking-widest text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                          title="Reject"
                                        >
                                          REJECT
                                        </button>
                                      </>
                                    )}
                                    <button 
                                      onClick={() => handleOpenBlueprint(doc)}
                                      className="p-2 text-steel hover:text-accent transition-colors disabled:opacity-50"
                                      disabled={isResolvingBlueprint}
                                      title="Annotate"
                                    >
                                      {isResolvingBlueprint ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                                    </button>
                                    <button 
                                      onClick={() => handleDownload(doc)}
                                      className="p-2 text-steel hover:text-accent transition-colors"
                                      title="Download"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-4">
                  <div className="bg-charcoal dark:bg-charcoal text-concrete p-8 transition-colors duration-500">
                    <h3 className="font-display text-xl font-light mb-6">Vault Statistics</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-mono text-steel uppercase tracking-widest">Total Storage</span>
                        <span className="text-sm font-light">{(documents.length * 0.4).toFixed(1)} MB / 50 MB</span>
                      </div>
                      <div className="w-full bg-steel/20 h-1">
                        <div className="bg-accent h-full" style={{ width: `${(documents.length * 0.4 / 50) * 100}%` }}></div>
                      </div>
                      <div className="pt-6 border-t border-steel/10 space-y-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-steel">Blueprints</span>
                          <span>{documents.filter(d => d.fileType.includes('pdf')).length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-steel">Images</span>
                          <span>{documents.filter(d => d.fileType.includes('image')).length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-steel">Other</span>
                          <span>{documents.filter(d => !d.fileType.includes('pdf') && !d.fileType.includes('image')).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 transition-colors duration-500">
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="font-display text-4xl font-light tracking-tight flex items-center gap-4">
                      <FileCheck className="text-accent" size={32} strokeWidth={1} />
                      Technical Reports
                    </h2>
                    <p className="text-steel font-mono text-[10px] uppercase tracking-[0.2em]">Professional Documentation</p>
                  </div>

                  {reportsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                    </div>
                  ) : technicalReports.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-steel/20">
                      <FileCheck size={48} className="text-steel/20 mx-auto mb-6" strokeWidth={1} />
                      <p className="text-steel font-light">No technical reports have been published yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {technicalReports.map((report) => (
                        <div 
                          key={report.id}
                          className="group bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-6 hover:border-accent transition-all duration-500 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-3 bg-charcoal/5 dark:bg-concrete/5 group-hover:bg-accent/10 transition-colors">
                                <FileText size={20} className="text-steel group-hover:text-accent" />
                              </div>
                              <span className="text-[10px] font-mono text-steel uppercase tracking-widest">
                                {report.createdAt?.toDate().toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-display text-xl font-light mb-2 group-hover:text-accent transition-colors">{report.title}</h3>
                            <p className="text-[10px] text-steel font-mono uppercase tracking-tighter mb-6">
                              Reference: #{report.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = report.fileUrl;
                              link.download = report.fileName;
                              link.click();
                            }}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest py-3 border-t border-steel/10 group-hover:text-accent transition-colors mt-4"
                          >
                            <Download size={12} />
                            Download Report
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500">
                    <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Outstanding Balance</h3>
                    <p className="font-display text-4xl text-charcoal dark:text-concrete">
                      ${invoices.filter(i => i.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500">
                    <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Total Paid</h3>
                    <p className="font-display text-4xl text-accent">
                      ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500 flex items-center justify-center">
                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-charcoal dark:border-concrete px-8 py-4 hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-all">
                      <Download size={14} />
                      Download Tax Summary
                    </button>
                  </div>
                </div>

                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 transition-colors duration-500">
                  <h2 className="font-display text-2xl font-light tracking-tight mb-8">Invoices & Billing</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-steel/10 text-[10px] font-mono text-steel uppercase tracking-widest">
                          <th className="pb-4 font-medium">Invoice ID</th>
                          <th className="pb-4 font-medium">Description</th>
                          <th className="pb-4 font-medium">Due Date</th>
                          <th className="pb-4 font-medium">Amount</th>
                          <th className="pb-4 font-medium">Status</th>
                          <th className="pb-4 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-steel/5">
                        {invoicesLoading ? (
                          [1, 2].map(i => <tr key={i}><td colSpan={6} className="py-4"><Skeleton className="h-10 w-full" /></td></tr>)
                        ) : invoices.length === 0 ? (
                          <tr><td colSpan={6} className="py-12 text-center text-steel font-light">No invoices found.</td></tr>
                        ) : (
                          invoices.map(invoice => (
                            <tr key={invoice.id} className="group hover:bg-concrete/30 dark:hover:bg-charcoal/30 transition-colors">
                              <td className="py-6 font-mono text-xs text-steel">#{invoice.id.slice(0, 8).toUpperCase()}</td>
                              <td className="py-6">
                                <p className="text-sm font-light">{invoice.description}</p>
                              </td>
                              <td className="py-6 text-xs text-steel">{invoice.dueDate}</td>
                              <td className="py-6 font-display text-lg">${invoice.amount.toLocaleString()}</td>
                              <td className="py-6">
                                <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-none ${
                                  invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="py-6 text-right">
                                {invoice.status === 'unpaid' ? (
                                  <button 
                                    onClick={() => handlePayInvoice(invoice.id)}
                                    disabled={payingInvoice === invoice.id}
                                    className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-accent dark:hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    {payingInvoice === invoice.id ? (
                                      <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Processing...
                                      </>
                                    ) : 'Pay Now'}
                                  </button>
                                ) : (
                                  <div className="flex justify-end items-center gap-4">
                                    {paymentSuccess === invoice.id && (
                                      <motion.span 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[10px] font-bold text-green-500 uppercase tracking-widest"
                                      >
                                        Payment Successful
                                      </motion.span>
                                    )}
                                    <button 
                                      onClick={() => generateInvoicePDF(invoice)}
                                      className="p-2 text-steel hover:text-accent transition-colors"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


          </motion.div>
        </AnimatePresence>

        {/* 3D Model Full Screen Modal */}
        <AnimatePresence>
          {isModelFullScreen && selectedModel && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-charcoal flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-steel/20">
                <h3 className="font-display text-2xl font-light text-concrete">{selectedModel.title}</h3>
                <button 
                  onClick={() => setIsModelFullScreen(false)}
                  className="p-3 border border-concrete text-concrete hover:bg-concrete hover:text-charcoal transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 bg-charcoal">
                <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                  <Stage environment="city" intensity={0.5}>
                    <Gltf src={selectedModel.modelUrl} castShadow receiveShadow />
                  </Stage>
                  <OrbitControls autoRotate autoRotateSpeed={0.5} />
                  <Environment preset="city" />
                </Canvas>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blueprint Annotation Modal */}
        <AnimatePresence>
          {selectedBlueprint && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-concrete dark:bg-charcoal p-8 max-w-5xl w-full shadow-2xl relative transition-colors duration-500"
              >
                <div className="flex justify-between items-center mb-6 border-b border-steel/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-display font-light">Annotate Blueprint</h3>
                    <p className="text-[10px] font-mono text-steel uppercase tracking-widest">{selectedBlueprint.fileName}</p>
                  </div>
                  <button onClick={() => setSelectedBlueprint(null)} className="p-2 text-steel hover:text-accent transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-auto custom-scrollbar">
                  <BlueprintAnnotation 
                    blueprintId={selectedBlueprint.id}
                    imageUrl={selectedBlueprint.fileData}
                    userId={user.uid}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-charcoal/40 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-concrete dark:bg-charcoal p-10 max-w-lg w-full border border-steel/20 shadow-2xl relative transition-colors duration-500"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Edit className="text-accent" size={32} />
                  <div>
                    <h2 className="font-display text-2xl font-light uppercase tracking-tight text-charcoal dark:text-concrete">Client Identity</h2>
                    <p className="font-mono text-[10px] text-steel uppercase tracking-widest">Update your tactical profile and biometric data</p>
                  </div>
                  <button onClick={() => setIsProfileModalOpen(false)} className="ml-auto text-steel hover:text-accent">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="relative w-32 h-32 bg-charcoal/10 dark:bg-concrete/10 rounded-full overflow-hidden border-2 border-accent group shadow-inner">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-steel font-mono text-[10px] uppercase text-center p-4">Identity Not Uploaded</div>
                      )}
                      <label className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer text-white">
                        <Upload size={20} className="mb-1" />
                        <span className="font-mono text-[8px] uppercase tracking-widest font-bold">Update Photo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              alert("Profile picture must be under 5MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const result = ev.target?.result as string;
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                const MAX_HEIGHT = 800;
                                let width = img.width;
                                let height = img.height;

                                if (width > height && width > MAX_WIDTH) {
                                  height *= MAX_WIDTH / width;
                                  width = MAX_WIDTH;
                                } else if (height > MAX_HEIGHT) {
                                  width *= MAX_HEIGHT / height;
                                  height = MAX_HEIGHT;
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);
                                
                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                                setPhotoUrl(compressedBase64);
                              };
                              img.src = result;
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }} 
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-steel mb-3">Official Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <button 
                    onClick={async () => {
                      if (!displayName.trim() || !user) return;
                      try {
                        await updateDoc(doc(db, 'users', user.uid), {
                          officialName: displayName.trim(),
                          photoUrl: photoUrl
                        });
                        setIsProfileModalOpen(false);
                        // Refresh data
                        await fetchUserData(auth.currentUser);
                      } catch (error) {
                        handleFirestoreError(error, OperationType.UPDATE, 'users');
                      }
                    }}
                    className="w-full py-4 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal font-mono text-xs uppercase font-bold tracking-[0.2em] hover:bg-accent hover:text-white transition-all shadow-lg"
                  >
                    Sync Identity Matrix
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
