import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, or, updateDoc, doc, getDoc, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, FileText, Calendar, Clock, Download, MessageSquare, 
  Send, Upload, CheckCircle2, Loader2, Circle, Box, CreditCard, 
  Bell, ChevronRight, Check, AlertCircle, X, Maximize2, Shield
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Gltf, Environment } from '@react-three/drei';
import Magnetic from '../components/Magnetic';
import { Skeleton } from '../components/Skeleton';
import OnboardingWizard from '../components/OnboardingWizard';
import BlueprintAnnotation from '../components/BlueprintAnnotation';
import AdminDashboard from '../components/AdminDashboard';

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

export default function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
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
  const [selectedModel, setSelectedModel] = useState<ProjectModel | null>(null);
  const [isModelFullScreen, setIsModelFullScreen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  
  // Testimonial states
  const [testimonial, setTestimonial] = useState({ rating: 5, comment: '', projectType: 'Residential' });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let role = userData.role;
            if (currentUser.email === 'machariag605@gmail.com' || currentUser.email === 'danuthiaandassociates@gmail.com' || currentUser.email === 'urbanplanning2027@gmail.com') {
              role = 'admin';
              if (userData.role !== 'admin') {
                await updateDoc(userDocRef, { role: 'admin' });
              }
            }
            setUser({ ...currentUser, role: role, needsOnboarding: userData.needsOnboarding, officialName: userData.officialName });
            setShowOnboarding(userData.needsOnboarding || !userData.officialName || false);
          } else {
            let role = 'pending';
            if (currentUser.email === 'machariag605@gmail.com' || currentUser.email === 'danuthiaandassociates@gmail.com') {
              role = 'admin';
            }
            setUser({ ...currentUser, role: role });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser({ ...currentUser, role: 'pending' });
        }
        setLoading(false);
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
      
      // Mark unread messages as read
      data.forEach(msg => {
        if (msg.receiverId === user.uid && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true }).catch(console.error);
        }
      });
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

    return () => {
      unsubscribeUpdates();
      unsubscribeMessages();
      unsubscribeDocs();
      unsubscribeMilestones();
      unsubscribeInvoices();
      unsubscribeModels();
      unsubscribeNotifications();
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

    setSendingMessage(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: 'admin', // Generic admin receiver
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 1024 * 1024) { // 1MB limit for Firestore
      setUploadError('File size must be less than 1MB.');
      return;
    }

    setUploadingDoc(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        await addDoc(collection(db, 'documents'), {
          clientId: user.uid,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData: base64String,
          uploadedBy: user.uid,
          createdAt: serverTimestamp()
        });
        
        setUploadingDoc(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file.');
        setUploadingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'documents');
      setUploadError('Failed to upload document.');
      setUploadingDoc(false);
    }
  };

  const handleDownload = (doc: VaultDocument) => {
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName;
    link.click();
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

  if (user?.role === 'pending') {
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
            Your account is currently pending approval. Access to the client portal is restricted to active clients of Danuthia & Associates. We will notify you once your account has been verified.
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
          onComplete={() => setShowOnboarding(false)} 
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
            { id: 'overview', label: 'Overview', icon: Clock },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: '3d-models', label: '3D Models', icon: Box },
            { id: 'vault', label: 'Vault', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'feedback', label: 'Feedback', icon: CheckCircle2 },
            ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${
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
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Project Overview Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500">
                    <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Days Remaining</h3>
                    <p className="font-display text-4xl text-charcoal dark:text-concrete">42</p>
                  </div>
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500">
                    <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Budget Utilized</h3>
                    <div className="w-full bg-steel/20 h-2 mb-2">
                      <div className="bg-accent h-full" style={{ width: '68%' }}></div>
                    </div>
                    <p className="font-display text-xl text-charcoal dark:text-concrete">68%</p>
                  </div>
                  <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-concrete/20 transition-colors duration-500 flex justify-between items-center">
                    <div>
                      <h3 className="text-steel font-mono text-xs uppercase tracking-[0.2em] mb-2">Current Phase</h3>
                      <p className="font-display text-2xl text-charcoal dark:text-concrete">Design Development</p>
                    </div>
                    <a href="https://calendly.com/your-firm/consultation" target="_blank" rel="noopener noreferrer" className="bg-accent text-concrete dark:text-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors">
                      Schedule
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-12">
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
                          <div 
                            key={update.id}
                            className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 hover:border-accent/30 transition-colors duration-500"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete transition-colors duration-500">{update.title}</h3>
                              <span className="text-[10px] font-mono text-steel uppercase tracking-widest border border-steel/20 dark:border-concrete/20 px-3 py-1.5 transition-colors duration-500">
                                {update.createdAt?.toDate().toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-charcoal/70 dark:text-concrete/70 font-light leading-relaxed mb-6 transition-colors duration-500">{update.description}</p>
                            
                            {update.fileUrl && (
                              <div className="mb-6 p-4 bg-charcoal/5 dark:bg-concrete/5 border border-steel/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText size={18} className="text-accent" />
                                  <span className="font-mono text-[10px] uppercase tracking-widest text-charcoal dark:text-concrete">
                                    {update.fileName || 'Attached Document'}
                                  </span>
                                </div>
                                <a 
                                  href={update.fileUrl} 
                                  download={update.fileName || 'document'}
                                  className="flex items-center gap-2 px-4 py-2 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-accent hover:text-white transition-colors"
                                >
                                  <Download size={14} /> Download
                                </a>
                              </div>
                            )}

                            {update.imageUrl && (
                              <div className="mt-6 aspect-[16/9] bg-concrete dark:bg-charcoal relative overflow-hidden transition-colors duration-500">
                                <img 
                                  src={update.imageUrl} 
                                  alt="Project Update" 
                                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="py-12">
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
              </div>
            )}

            {activeTab === '3d-models' && (
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
            )}

            {activeTab === 'vault' && (
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
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => setSelectedBlueprint(doc)}
                                      className="p-2 text-steel hover:text-accent transition-colors"
                                      title="Annotate"
                                    >
                                      <MessageSquare size={16} />
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
            )}

            {activeTab === 'payments' && (
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
                                    <button className="p-2 text-steel hover:text-accent transition-colors">
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

            {activeTab === 'messages' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-8 flex flex-col h-[600px] transition-colors duration-500">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-steel/10">
                    <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-3 text-charcoal dark:text-concrete transition-colors duration-500">
                      <MessageSquare className="text-accent" size={20} strokeWidth={1.5} />
                      Project Manager
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-steel uppercase tracking-widest">Online</span>
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
            )}

            {activeTab === 'admin' && user?.role === 'admin' && (
              <AdminDashboard />
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
      </div>
    </div>
  );
}
