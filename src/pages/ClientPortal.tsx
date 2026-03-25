import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, or, updateDoc, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogOut, FileText, Calendar, Clock, Download, MessageSquare, Send, Upload } from 'lucide-react';

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

export default function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

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

    return () => {
      unsubscribeUpdates();
      unsubscribeMessages();
      unsubscribeDocs();
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
      <div className="min-h-screen flex items-center justify-center bg-concrete">
        <div className="w-8 h-8 border-2 border-bronze border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-concrete text-charcoal py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-steel/20 pb-8">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-light tracking-tight mb-4">
              Client Portal
            </h1>
            <p className="text-steel font-mono text-xs uppercase tracking-[0.2em]">
              Welcome back, {user?.displayName || 'Client'}
            </p>
          </div>
          <button 
            onClick={handleSignOut}
            className="mt-8 md:mt-0 flex items-center gap-2 px-6 py-3 border border-charcoal hover:bg-charcoal hover:text-concrete transition-all duration-500 font-bold uppercase tracking-widest text-xs"
          >
            <LogOut size={14} />
            Sign Out
          </button>
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
              <div className="border border-steel/20 p-12 text-center">
                <p className="text-steel font-light">No recent updates for your project.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {updates.map((update) => (
                  <motion.div 
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-steel/20 p-8 hover:border-bronze/30 transition-colors duration-500"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-display text-2xl font-light">{update.title}</h3>
                      <span className="text-[10px] font-mono text-steel uppercase tracking-widest border border-steel/20 px-3 py-1.5">
                        {update.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-charcoal/70 font-light leading-relaxed mb-6">{update.description}</p>
                    
                    {update.imageUrl && (
                      <div className="mt-6 aspect-[16/9] bg-concrete relative overflow-hidden">
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
            <div className="bg-white border border-steel/20 p-8">
              <h2 className="font-display text-xl font-light tracking-tight mb-8 flex items-center gap-3">
                <Calendar className="text-bronze" size={18} strokeWidth={1.5} />
                Project Timeline
              </h2>
              <div className="relative border-l border-steel/20 ml-3 space-y-8">
                <div className="relative pl-8">
                  <div className="absolute w-2 h-2 bg-bronze rounded-full -left-[4.5px] top-1.5"></div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Phase 1: Design</h4>
                  <p className="text-xs text-steel font-mono">Completed</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute w-2 h-2 bg-charcoal rounded-full -left-[4.5px] top-1.5"></div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Phase 2: Approvals</h4>
                  <p className="text-xs text-steel font-mono">In Progress</p>
                </div>
                <div className="relative pl-8 opacity-40">
                  <div className="absolute w-2 h-2 border border-steel bg-concrete rounded-full -left-[4.5px] top-1.5"></div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Phase 3: Construction</h4>
                  <p className="text-xs text-steel font-mono">Upcoming</p>
                </div>
              </div>
            </div>

            {/* Secure Vault */}
            <div className="bg-charcoal text-concrete p-8">
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
            <div className="bg-white border border-steel/20 p-8 flex flex-col h-[500px]">
              <h2 className="font-display text-xl font-light tracking-tight mb-6 flex items-center gap-3">
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
                        <div className={`max-w-[85%] p-4 ${isMine ? 'bg-charcoal text-concrete rounded-tl-xl rounded-tr-xl rounded-bl-xl' : 'bg-concrete text-charcoal border border-steel/20 rounded-tl-xl rounded-tr-xl rounded-br-xl'}`}>
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
                  className="flex-1 bg-concrete border border-steel/20 px-4 py-3 text-sm font-light focus:outline-none focus:border-bronze transition-colors"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-charcoal text-concrete px-6 py-3 hover:bg-bronze transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
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
