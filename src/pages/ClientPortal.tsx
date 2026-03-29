import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, or, updateDoc, doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogOut, FileText, Calendar, Clock, Download, MessageSquare, Send, Upload } from 'lucide-react';
import Magnetic from '../components/Magnetic';

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
  order: number;
  createdAt: any;
}

export default function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');
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
            setUser({ ...currentUser, role: userData.role });
          } else {
            setUser({ ...currentUser, role: 'pending' });
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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'milestones');
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeMessages();
      unsubscribeDocs();
      unsubscribeMilestones();
    };
  }, [user]);

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
          clientId: user.uid,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileData: base64String,
          uploadedBy: user.uid,
          createdAt: serverTimestamp()
        });
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-concrete dark:bg-charcoal transition-colors duration-500">
        <div className="w-8 h-8 border-2 border-bronze border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role === 'pending') {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-concrete dark:bg-charcoal p-6 text-center transition-colors duration-500">
        <div className="max-w-md w-full bg-charcoal dark:bg-[#111111] text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-full border border-bronze/30 flex items-center justify-center bg-charcoal dark:bg-[#111111] shadow-[0_0_30px_rgba(184,134,11,0.1)] transition-colors duration-500">
              <Clock size={20} className="text-bronze" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight mb-4">Pending Approval</h1>
          <p className="text-steel font-light leading-relaxed mb-8">
            Your account is currently pending approval. Access to the client portal is restricted to active clients of Danuthia & Associates. We will notify you once your account has been verified.
          </p>
          <Magnetic className="w-full">
            <button 
              onClick={handleSignOut}
              className="w-full bg-transparent border border-bronze text-bronze py-4 font-bold uppercase tracking-widest hover:bg-bronze hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 text-xs"
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-steel/20 dark:border-concrete/20 pb-8 transition-colors duration-500">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-light tracking-tight mb-4">
              Client Portal
            </h1>
            <p className="text-steel font-mono text-xs uppercase tracking-[0.2em]">
              Welcome back, {user?.displayName || 'Client'}
            </p>
          </div>
          <Magnetic>
            <button 
              onClick={handleSignOut}
              className="mt-8 md:mt-0 flex items-center gap-2 px-6 py-3 border border-charcoal dark:border-concrete hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-all duration-500 font-bold uppercase tracking-widest text-xs"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </Magnetic>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Updates */}
          <div className="lg:col-span-7 space-y-12">
            <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-4">
              <Clock className="text-bronze" size={20} strokeWidth={1.5} />
              Recent Updates
            </h2>
            
            {updates.length === 0 ? (
              <div className="border border-steel/20 dark:border-concrete/20 p-12 text-center transition-colors duration-500">
                <p className="text-steel font-light">No recent updates for your project.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {updates.map((update) => (
                  <motion.div 
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#111111] border border-steel/20 dark:border-concrete/20 p-8 hover:border-bronze/30 transition-colors duration-500"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete transition-colors duration-500">{update.title}</h3>
                      <span className="text-[10px] font-mono text-steel uppercase tracking-widest border border-steel/20 dark:border-concrete/20 px-3 py-1.5 transition-colors duration-500">
                        {update.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-charcoal/70 dark:text-concrete/70 font-light leading-relaxed mb-6 transition-colors duration-500">{update.description}</p>
                    
                    {update.imageUrl && (
                      <div className="mt-6 aspect-[16/9] bg-concrete dark:bg-charcoal relative overflow-hidden transition-colors duration-500">
                        <img src={update.imageUrl} alt="Project Update" className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Documents, Timeline & Messages */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Timeline */}
            <div className="bg-white dark:bg-[#111111] border border-steel/20 dark:border-concrete/20 p-8 transition-colors duration-500">
              <h2 className="font-display text-xl font-light tracking-tight mb-8 flex items-center gap-3 text-charcoal dark:text-concrete transition-colors duration-500">
                <Calendar className="text-bronze" size={18} strokeWidth={1.5} />
                Project Timeline
              </h2>
              <div className="relative border-l border-steel/20 dark:border-concrete/20 ml-3 space-y-8 transition-colors duration-500">
                {milestones.length === 0 ? (
                  <p className="text-xs text-steel font-mono pl-8">No milestones set yet.</p>
                ) : (
                  milestones.map((milestone) => (
                    <div key={milestone.id} className={`relative pl-8 ${milestone.status === 'upcoming' ? 'opacity-40' : ''}`}>
                      <div className={`absolute w-2 h-2 rounded-full -left-[4.5px] top-1.5 transition-colors duration-500 ${
                        milestone.status === 'completed' ? 'bg-bronze' : 
                        milestone.status === 'in-progress' ? 'bg-charcoal dark:bg-concrete' : 
                        'border border-steel bg-concrete dark:bg-charcoal'
                      }`}></div>
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-1 text-charcoal dark:text-concrete transition-colors duration-500">{milestone.title}</h4>
                      <p className="text-xs text-steel font-mono capitalize">{milestone.status.replace('-', ' ')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Secure Vault */}
            <div className="bg-charcoal dark:bg-[#111111] text-concrete p-8 transition-colors duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-xl font-light tracking-tight flex items-center gap-3">
                  <FileText className="text-bronze" size={18} strokeWidth={1.5} />
                  Secure Vault
                </h2>
                <div>
                  <input 
                    type="file" 
                    id="doc-upload" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={uploadingDoc}
                  />
                  <label 
                    htmlFor="doc-upload" 
                    className={`cursor-pointer flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-steel/30 px-4 py-2 hover:bg-concrete hover:text-charcoal transition-colors duration-300 ${uploadingDoc ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Upload size={14} />
                    {uploadingDoc ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
              </div>
              
              {uploadError && <p className="text-red-400 text-xs mb-4">{uploadError}</p>}

              <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {documents.length === 0 ? (
                  <li className="text-xs font-mono text-steel">No documents uploaded yet.</li>
                ) : (
                  documents.map(doc => (
                    <li key={doc.id} className="flex items-center justify-between group border-b border-steel/20 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <FileText size={16} className="text-steel shrink-0" strokeWidth={1.5} />
                        <span className="text-sm font-light text-concrete/90 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-steel hover:text-bronze transition-colors shrink-0"
                        title="Download"
                      >
                        <Download size={16} strokeWidth={1.5} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Messages Section */}
            <div className="bg-white dark:bg-[#111111] border border-steel/20 dark:border-concrete/20 p-8 flex flex-col h-[500px] transition-colors duration-500">
              <h2 className="font-display text-xl font-light tracking-tight mb-6 flex items-center gap-3 text-charcoal dark:text-concrete transition-colors duration-500">
                <MessageSquare className="text-bronze" size={18} strokeWidth={1.5} />
                Project Manager
              </h2>
              
              <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-steel text-sm font-light text-center">
                    Send a message to your project manager to get started.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 ${isMine ? 'bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal rounded-tl-xl rounded-tr-xl rounded-bl-xl transition-colors duration-500' : 'bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete border border-steel/20 dark:border-concrete/20 rounded-tl-xl rounded-tr-xl rounded-br-xl transition-colors duration-500'}`}>
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
                  className="flex-1 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 px-4 py-3 text-sm font-light focus:outline-none focus:border-bronze dark:focus:border-bronze text-charcoal dark:text-concrete transition-colors duration-500"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-6 py-3 hover:bg-bronze dark:hover:bg-bronze transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
