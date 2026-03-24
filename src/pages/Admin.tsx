import React, { useEffect, useState } from 'react';
import { auth, db, provider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, addDoc, serverTimestamp, where, onSnapshot } from 'firebase/firestore';
import { LogOut, RefreshCw, CheckCircle, Clock, Phone, Trash2, Mail, Plus, Calendar, Users, FileText, BarChart3, MessageSquare, Send, Upload, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'motion/react';

interface BookingRequest {
  id: string;
  fullName: string;
  projectScale: string;
  preferredDate: string;
  status: string;
  createdAt: any;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: any;
}

interface ClientUser {
  id: string;
  email: string;
}

interface ProjectUpdate {
  id: string;
  clientId: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: any;
}

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

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'newsletter' | 'updates' | 'messages' | 'documents'>('overview');
  
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'booking' | 'newsletter' | 'update' | 'document', id: string } | null>(null);

  // New Update Form State
  const [newUpdate, setNewUpdate] = useState({ clientId: '', title: '', description: '', imageUrl: '' });
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);

  // Messaging State
  const [selectedChatClient, setSelectedChatClient] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Document State
  const [selectedDocClient, setSelectedDocClient] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (selectedChatClient) {
      messages.forEach(msg => {
        if (msg.senderId === selectedChatClient && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true }).catch(console.error);
        }
      });
    }
  }, [messages, selectedChatClient]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedChatClient]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllData();
      
      // Real-time listener for messages
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
      }, (error) => {
        console.error("Error fetching messages:", error);
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchRequests(),
        fetchSubscribers(),
        fetchUpdates(),
        fetchClients(),
        fetchDocuments()
      ]);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('permission')) {
        setError('You do not have permission to view this dashboard. Access restricted to administrators.');
      } else {
        setError('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, 'bookingRequests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reqs: BookingRequest[] = [];
      querySnapshot.forEach((doc) => {
        reqs.push({ id: doc.id, ...doc.data() } as BookingRequest);
      });
      setRequests(reqs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'bookingRequests');
    }
  };

  const fetchSubscribers = async () => {
    try {
      const q = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const subs: NewsletterSubscriber[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as NewsletterSubscriber);
      });
      setSubscribers(subs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'newsletter');
    }
  };

  const fetchUpdates = async () => {
    try {
      const q = query(collection(db, 'projectUpdates'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const upds: ProjectUpdate[] = [];
      querySnapshot.forEach((doc) => {
        upds.push({ id: doc.id, ...doc.data() } as ProjectUpdate);
      });
      setUpdates(upds);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'projectUpdates');
    }
  };

  const fetchClients = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'client'));
      const querySnapshot = await getDocs(q);
      const cls: ClientUser[] = [];
      querySnapshot.forEach((doc) => {
        cls.push({ id: doc.id, email: doc.data().email } as ClientUser);
      });
      setClients(cls);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  };

  const fetchDocuments = async () => {
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs: VaultDocument[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as VaultDocument);
      });
      setDocuments(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRequests([]);
      setSubscribers([]);
      setUpdates([]);
      setClients([]);
      setMessages([]);
      setInitialLoading(true);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookingRequests', id), {
        status: newStatus
      });
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'bookingRequests');
      setError('Failed to update status. You may not have admin permissions.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      if (deleteConfirm.type === 'booking') {
        await deleteDoc(doc(db, 'bookingRequests', deleteConfirm.id));
        setRequests(requests.filter(r => r.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'newsletter') {
        await deleteDoc(doc(db, 'newsletter', deleteConfirm.id));
        setSubscribers(subscribers.filter(s => s.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'update') {
        await deleteDoc(doc(db, 'projectUpdates', deleteConfirm.id));
        setUpdates(updates.filter(u => u.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'document') {
        await deleteDoc(doc(db, 'documents', deleteConfirm.id));
        setDocuments(documents.filter(d => d.id !== deleteConfirm.id));
      }
    } catch (err) {
      const collectionName = deleteConfirm.type === 'booking' ? 'bookingRequests' : 
                             deleteConfirm.type === 'newsletter' ? 'newsletter' : 
                             deleteConfirm.type === 'document' ? 'documents' : 'projectUpdates';
      handleFirestoreError(err, OperationType.DELETE, collectionName);
      setError('Failed to delete item. You may not have admin permissions.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.clientId || !newUpdate.title || !newUpdate.description) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsCreatingUpdate(true);
    setError('');
    try {
      const updateData: any = {
        clientId: newUpdate.clientId,
        title: newUpdate.title,
        description: newUpdate.description,
        createdAt: serverTimestamp()
      };
      if (newUpdate.imageUrl) {
        updateData.imageUrl = newUpdate.imageUrl;
      }
      await addDoc(collection(db, 'projectUpdates'), updateData);
      setNewUpdate({ clientId: '', title: '', description: '', imageUrl: '' });
      await fetchUpdates(); // Refresh the list
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'projectUpdates');
      setError('Failed to create project update. Ensure you have admin permissions and the data is valid.');
    } finally {
      setIsCreatingUpdate(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !user || !selectedChatClient) return;

    setSendingReply(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: selectedChatClient,
        text: adminReply.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      setAdminReply('');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
      setError('Failed to send message.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedDocClient) return;

    if (file.size > 500 * 1024) { // 500KB limit
      setUploadError('File size must be less than 500KB.');
      return;
    }

    setUploadingDoc(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await addDoc(collection(db, 'documents'), {
          clientId: selectedDocClient,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData: base64String,
          uploadedBy: user.uid,
          createdAt: serverTimestamp()
        });
        setUploadingDoc(false);
        fetchDocuments(); // Refresh documents
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived Stats for Charts
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const reviewedCount = requests.filter(r => r.status === 'reviewed').length;
  const contactedCount = requests.filter(r => r.status === 'contacted').length;

  const statusData = [
    { name: 'Pending', value: pendingCount, color: '#eab308' },
    { name: 'Reviewed', value: reviewedCount, color: '#3b82f6' },
    { name: 'Contacted', value: contactedCount, color: '#22c55e' },
  ];

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-12 bg-steel/10 rounded w-full"></div>
      ))}
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bronze border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-8">Admin Portal</h1>
        <p className="text-charcoal/70 mb-8 max-w-md text-center">
          Please sign in with your administrator account to access the dashboard.
        </p>
        <button 
          onClick={handleLogin}
          className="bg-charcoal text-concrete px-8 py-4 font-bold uppercase tracking-widest hover:bg-bronze transition-all duration-300"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-steel font-mono text-xs uppercase tracking-widest">Logged in as {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchAllData}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal hover:text-bronze transition-colors bg-white px-4 py-2 border border-steel/20 rounded shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors bg-white px-4 py-2 border border-red-100 rounded shadow-sm"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 border border-steel/20 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-steel font-mono text-xs uppercase tracking-widest mb-1">Total Bookings</p>
            <h3 className="text-3xl font-bold text-charcoal">{initialLoading ? '-' : requests.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-bronze/10 flex items-center justify-center text-bronze">
            <Calendar size={24} />
          </div>
        </div>
        <div className="bg-white p-6 border border-steel/20 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-steel font-mono text-xs uppercase tracking-widest mb-1">Pending Requests</p>
            <h3 className="text-3xl font-bold text-yellow-600">{initialLoading ? '-' : pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 border border-steel/20 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-steel font-mono text-xs uppercase tracking-widest mb-1">Subscribers</p>
            <h3 className="text-3xl font-bold text-charcoal">{initialLoading ? '-' : subscribers.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 border border-steel/20 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-steel font-mono text-xs uppercase tracking-widest mb-1">Project Updates</p>
            <h3 className="text-3xl font-bold text-charcoal">{initialLoading ? '-' : updates.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-steel/20 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Booking Requests
        </button>
        <button 
          onClick={() => setActiveTab('updates')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'updates' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Project Updates
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'messages' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Messages
          {messages.filter(m => !m.read && m.receiverId === 'admin').length > 0 && (
            <span className="bg-bronze text-white text-[10px] px-2 py-0.5 rounded-full">
              {messages.filter(m => !m.read && m.receiverId === 'admin').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('newsletter')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'newsletter' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Subscribers
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`pb-4 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Documents
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8 shadow-sm">
          <h3 className="font-bold uppercase tracking-widest mb-2 text-sm">Access Denied / Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 max-w-md w-full rounded-2xl shadow-2xl"
          >
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-charcoal">Confirm Deletion</h3>
            <p className="text-charcoal/70 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete this {deleteConfirm.type === 'booking' ? 'booking request' : deleteConfirm.type === 'newsletter' ? 'subscriber' : deleteConfirm.type === 'document' ? 'document' : 'project update'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 border border-steel/30 rounded-lg hover:bg-concrete transition-colors font-bold uppercase tracking-widest text-xs text-charcoal"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold uppercase tracking-widest text-xs shadow-sm shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {!error && (
        <div className="w-full">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart: Booking Statuses */}
              <div className="bg-white border border-steel/20 rounded-xl shadow-sm p-6">
                <h3 className="font-bold uppercase tracking-widest text-sm text-charcoal mb-6 flex items-center gap-2">
                  <BarChart3 size={16} className="text-bronze" />
                  Booking Request Statuses
                </h3>
                {initialLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-bronze border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-steel text-sm">No booking data available.</div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Recent Activity (Updates & Bookings mixed) */}
              <div className="bg-white border border-steel/20 rounded-xl shadow-sm p-6">
                <h3 className="font-bold uppercase tracking-widest text-sm text-charcoal mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-bronze" />
                  Recent Activity
                </h3>
                {initialLoading ? (
                  renderSkeleton()
                ) : (
                  <div className="space-y-4">
                    {/* Just showing the 5 most recent bookings for overview */}
                    {requests.slice(0, 5).map(req => (
                      <div key={req.id} className="flex items-start gap-4 p-3 hover:bg-concrete/50 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-bronze/10 flex items-center justify-center text-bronze shrink-0 mt-0.5">
                          <Calendar size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">New Booking: {req.fullName}</p>
                          <p className="text-xs text-steel mt-1">{req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Just now'} • {req.projectScale}</p>
                        </div>
                      </div>
                    ))}
                    {requests.length === 0 && <p className="text-sm text-steel text-center py-8">No recent activity.</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white border border-steel/20 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-concrete/50 border-b border-steel/20 text-xs font-bold text-steel uppercase tracking-widest">
                      <th className="p-5 font-medium">Date</th>
                      <th className="p-5 font-medium">Client Name</th>
                      <th className="p-5 font-medium">Project Scale</th>
                      <th className="p-5 font-medium">Preferred Date</th>
                      <th className="p-5 font-medium">Status</th>
                      <th className="p-5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel/10">
                    {initialLoading ? (
                      <tr><td colSpan={6}>{renderSkeleton()}</td></tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-steel">
                          <Calendar size={32} className="mx-auto mb-4 opacity-20" />
                          <p>No booking requests found.</p>
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr key={req.id} className="hover:bg-concrete/30 transition-colors group">
                          <td className="p-5 text-sm text-charcoal/80">
                            {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </td>
                          <td className="p-5 font-medium text-charcoal">{req.fullName}</td>
                          <td className="p-5 text-sm capitalize text-charcoal/80">{req.projectScale}</td>
                          <td className="p-5 text-sm text-charcoal/80">{req.preferredDate}</td>
                          <td className="p-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                req.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 
                                'bg-green-100 text-green-700'}`}
                            >
                              {req.status === 'pending' && <Clock size={12} />}
                              {req.status === 'reviewed' && <CheckCircle size={12} />}
                              {req.status === 'contacted' && <Phone size={12} />}
                              {req.status}
                            </span>
                          </td>
                          <td className="p-5 text-right flex justify-end items-center gap-3">
                            <select 
                              value={req.status}
                              onChange={(e) => updateStatus(req.id, e.target.value)}
                              className="text-xs font-bold uppercase tracking-widest bg-concrete border border-steel/20 rounded px-3 py-1.5 outline-none focus:border-bronze focus:ring-1 focus:ring-bronze cursor-pointer text-charcoal transition-all"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="contacted">Contacted</option>
                            </select>
                            <button 
                              onClick={() => setDeleteConfirm({ type: 'booking', id: req.id })} 
                              className="p-1.5 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Project Updates Tab */}
          {activeTab === 'updates' && (
            <div className="space-y-8">
              {/* Create Form */}
              <div className="bg-white border border-steel/20 rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2 text-charcoal">
                  <Plus size={20} className="text-bronze" />
                  Post New Update
                </h2>
                <form onSubmit={handleCreateUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-steel mb-2">Select Client *</label>
                      <select 
                        value={newUpdate.clientId}
                        onChange={e => setNewUpdate({...newUpdate, clientId: e.target.value})}
                        className="w-full bg-concrete border border-steel/20 rounded-lg p-3.5 text-sm focus:outline-none focus:border-bronze focus:ring-1 focus:ring-bronze transition-all"
                        required
                      >
                        <option value="">-- Select a Client --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-steel mb-2">Update Title *</label>
                      <input 
                        type="text"
                        value={newUpdate.title}
                        onChange={e => setNewUpdate({...newUpdate, title: e.target.value})}
                        className="w-full bg-concrete border border-steel/20 rounded-lg p-3.5 text-sm focus:outline-none focus:border-bronze focus:ring-1 focus:ring-bronze transition-all"
                        placeholder="e.g., Foundation Poured"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-steel mb-2">Description *</label>
                    <textarea 
                      value={newUpdate.description}
                      onChange={e => setNewUpdate({...newUpdate, description: e.target.value})}
                      className="w-full bg-concrete border border-steel/20 rounded-lg p-3.5 text-sm focus:outline-none focus:border-bronze focus:ring-1 focus:ring-bronze transition-all min-h-[120px] resize-y"
                      placeholder="Detailed progress report..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-steel mb-2">Image URL (Optional)</label>
                    <input 
                      type="url"
                      value={newUpdate.imageUrl}
                      onChange={e => setNewUpdate({...newUpdate, imageUrl: e.target.value})}
                      className="w-full bg-concrete border border-steel/20 rounded-lg p-3.5 text-sm focus:outline-none focus:border-bronze focus:ring-1 focus:ring-bronze transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isCreatingUpdate}
                    className="bg-charcoal text-concrete px-8 py-3.5 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-bronze transition-colors disabled:opacity-50 shadow-md shadow-charcoal/10"
                  >
                    {isCreatingUpdate ? 'Posting...' : 'Post Update'}
                  </button>
                </form>
              </div>

              {/* Updates List */}
              <div className="bg-white border border-steel/20 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-concrete/50 border-b border-steel/20 text-xs font-bold text-steel uppercase tracking-widest">
                        <th className="p-5 font-medium">Date</th>
                        <th className="p-5 font-medium">Client</th>
                        <th className="p-5 font-medium">Title</th>
                        <th className="p-5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel/10">
                      {initialLoading ? (
                        <tr><td colSpan={4}>{renderSkeleton()}</td></tr>
                      ) : updates.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-steel">
                            <FileText size={32} className="mx-auto mb-4 opacity-20" />
                            <p>No project updates posted yet.</p>
                          </td>
                        </tr>
                      ) : (
                        updates.map((upd) => {
                          const clientEmail = clients.find(c => c.id === upd.clientId)?.email || upd.clientId;
                          return (
                            <tr key={upd.id} className="hover:bg-concrete/30 transition-colors group">
                              <td className="p-5 text-sm text-charcoal/80">
                                {upd.createdAt?.toDate ? upd.createdAt.toDate().toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="p-5 text-sm font-medium text-charcoal">{clientEmail}</td>
                              <td className="p-5 text-sm text-charcoal/80">{upd.title}</td>
                              <td className="p-5 text-right">
                                <button 
                                  onClick={() => setDeleteConfirm({ type: 'update', id: upd.id })} 
                                  className="p-1.5 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Update"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
              {/* Clients List */}
              <div className="bg-white border border-steel/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-steel/20 bg-concrete/50">
                  <h3 className="font-bold uppercase tracking-widest text-sm text-charcoal flex items-center gap-2">
                    <Users size={16} className="text-bronze" />
                    Clients
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {clients.length === 0 ? (
                    <div className="p-8 text-center text-steel text-sm">No clients found.</div>
                  ) : (
                    <div className="divide-y divide-steel/10">
                      {clients.map(client => {
                        const clientMessages = messages.filter(m => m.senderId === client.id || m.receiverId === client.id);
                        const lastMessage = clientMessages.length > 0 ? clientMessages[clientMessages.length - 1] : null;
                        const unreadCount = clientMessages.filter(m => m.senderId === client.id && !m.read).length;
                        
                        return (
                          <button
                            key={client.id}
                            onClick={() => setSelectedChatClient(client.id)}
                            className={`w-full text-left p-4 hover:bg-concrete/50 transition-colors flex flex-col gap-1 ${selectedChatClient === client.id ? 'bg-concrete/80 border-l-4 border-bronze' : 'border-l-4 border-transparent'}`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium text-charcoal text-sm truncate">{client.email}</span>
                              {unreadCount > 0 && (
                                <span className="bg-bronze text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-xs text-steel truncate">
                                {lastMessage.senderId === user?.uid ? 'You: ' : ''}{lastMessage.text}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 bg-white border border-steel/20 rounded-xl shadow-sm flex flex-col">
                {selectedChatClient ? (
                  <>
                    <div className="p-4 border-b border-steel/20 bg-concrete/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bronze/10 flex items-center justify-center text-bronze">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-charcoal">
                          {clients.find(c => c.id === selectedChatClient)?.email}
                        </h3>
                        <p className="text-[10px] text-steel uppercase tracking-widest">Client Chat</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.filter(m => m.senderId === selectedChatClient || m.receiverId === selectedChatClient).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-steel text-sm">
                          No messages yet. Start the conversation.
                        </div>
                      ) : (
                        messages
                          .filter(m => m.senderId === selectedChatClient || m.receiverId === selectedChatClient)
                          .map(msg => {
                            const isMine = msg.senderId === user?.uid;
                            return (
                              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg ${isMine ? 'bg-charcoal text-concrete rounded-br-none' : 'bg-steel/10 text-charcoal rounded-bl-none'}`}>
                                  <p className="text-sm">{msg.text}</p>
                                  <span className="text-[10px] opacity-70 mt-1 block text-right">
                                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-steel/20 bg-concrete/30">
                      <form onSubmit={handleSendReply} className="flex gap-2">
                        <input
                          type="text"
                          value={adminReply}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 bg-white border border-steel/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-bronze focus:ring-1 focus:ring-bronze"
                          disabled={sendingReply}
                        />
                        <button
                          type="submit"
                          disabled={!adminReply.trim() || sendingReply}
                          className="bg-bronze text-white p-2 rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-steel p-8 text-center">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-charcoal mb-1">No Chat Selected</p>
                    <p className="text-sm">Select a client from the list to view and send messages.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="bg-white border border-steel/20 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-concrete/50 border-b border-steel/20 text-xs font-bold text-steel uppercase tracking-widest">
                      <th className="p-5 font-medium">Date Subscribed</th>
                      <th className="p-5 font-medium">Email Address</th>
                      <th className="p-5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel/10">
                    {initialLoading ? (
                      <tr><td colSpan={3}>{renderSkeleton()}</td></tr>
                    ) : subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-steel">
                          <Users size={32} className="mx-auto mb-4 opacity-20" />
                          <p>No subscribers found.</p>
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-concrete/30 transition-colors group">
                          <td className="p-5 text-sm text-charcoal/80">
                            {sub.createdAt?.toDate ? sub.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </td>
                          <td className="p-5 font-medium text-charcoal flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <Mail size={14} />
                            </div>
                            {sub.email}
                          </td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => setDeleteConfirm({ type: 'newsletter', id: sub.id })} 
                              className="p-1.5 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Subscriber"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Client List */}
              <div className="lg:col-span-1 bg-white border border-steel/20 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-steel/20 bg-concrete/50">
                  <h3 className="font-bold uppercase tracking-widest text-sm text-charcoal flex items-center gap-2">
                    <Users size={16} className="text-bronze" />
                    Clients
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {clients.length === 0 ? (
                    <div className="p-8 text-center text-steel">
                      <p className="text-sm">No clients found.</p>
                    </div>
                  ) : (
                    clients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedDocClient(client.id)}
                        className={`w-full text-left p-4 rounded-lg mb-2 transition-colors flex items-center justify-between ${selectedDocClient === client.id ? 'bg-bronze/10 border border-bronze/30' : 'hover:bg-concrete border border-transparent'}`}
                      >
                        <div>
                          <p className="font-medium text-charcoal text-sm truncate">{client.email}</p>
                          <p className="text-xs text-steel font-mono mt-1">ID: {client.id.substring(0, 8)}...</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Document List */}
              <div className="lg:col-span-2 bg-white border border-steel/20 rounded-xl shadow-sm flex flex-col h-[600px]">
                {selectedDocClient ? (
                  <>
                    <div className="p-4 border-b border-steel/20 flex justify-between items-center bg-concrete/50">
                      <div>
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                          <FileText size={18} className="text-bronze" />
                          Client Documents
                        </h3>
                        <p className="text-xs text-steel mt-1">{clients.find(c => c.id === selectedDocClient)?.email}</p>
                      </div>
                      <div>
                        <input 
                          type="file" 
                          id="admin-doc-upload" 
                          className="hidden" 
                          onChange={handleFileUpload}
                          disabled={uploadingDoc}
                        />
                        <label 
                          htmlFor="admin-doc-upload" 
                          className={`cursor-pointer flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-charcoal text-concrete px-4 py-2 rounded shadow-sm hover:bg-bronze transition-colors ${uploadingDoc ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Upload size={14} />
                          {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                        </label>
                      </div>
                    </div>
                    
                    {uploadError && <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">{uploadError}</div>}

                    <div className="flex-1 overflow-y-auto p-6">
                      {documents.filter(d => d.clientId === selectedDocClient).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-steel">
                          <FileText size={48} className="mb-4 opacity-20" />
                          <p className="font-medium text-charcoal mb-1">No Documents</p>
                          <p className="text-sm">Upload documents to share with this client.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {documents.filter(d => d.clientId === selectedDocClient).map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-4 border border-steel/20 rounded-lg hover:border-bronze/30 transition-colors group">
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-10 h-10 rounded bg-concrete flex items-center justify-center text-steel shrink-0">
                                  <FileText size={20} />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="font-medium text-charcoal text-sm truncate" title={doc.fileName}>{doc.fileName}</p>
                                  <p className="text-xs text-steel mt-1">
                                    {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'Just now'} • 
                                    {doc.uploadedBy === user?.uid ? 'Uploaded by you' : 'Uploaded by client'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button 
                                  onClick={() => handleDownload(doc)}
                                  className="p-2 text-steel hover:text-bronze transition-colors"
                                  title="Download"
                                >
                                  <Download size={18} />
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirm({ type: 'document', id: doc.id })}
                                  className="p-2 text-steel hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-steel p-8 text-center">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-charcoal mb-1">No Client Selected</p>
                    <p className="text-sm">Select a client from the list to view and manage their documents.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
