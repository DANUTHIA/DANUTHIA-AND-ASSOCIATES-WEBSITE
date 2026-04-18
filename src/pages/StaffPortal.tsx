import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, limit, or, and } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { LogOut, Hammer, Eye, Map, ClipboardList, PenTool, Trees, HardHat, FileLineChart, ChevronDown, Building2, MessageSquare, Check, Send, Upload, Download, Edit, Users, Activity, Target, TrendingUp } from 'lucide-react';
import Magnetic from '../components/Magnetic';

// Mock projects for the staff selection feature
const MOCK_PROJECTS = [
  { id: 'proj-1', name: 'Nairobi Tech Hub', status: 'In Progress' },
  { id: 'proj-2', name: 'Mombasa Transit Center', status: 'Planning Phase' },
  { id: 'proj-3', name: 'Karen Eco-Villa', status: 'Nearing Completion' },
  { id: 'proj-4', name: 'Westlands Commercial Tower', status: 'Pre-Construction' }
];

interface StaffUser {
  id: string;
  email: string;
  officialName?: string;
  role: string;
  title?: string;
}

interface InternalMessage {
  id: string;
  senderId: string;
  receiverId: string;
  projectId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

interface InternalLog {
  id: string;
  projectId: string;
  staffName: string;
  staffTitle?: string;
  role: string;
  message: string;
  status: 'pending_review' | 'reviewed';
  createdAt: any;
  fileUrl?: string;
  fileName?: string;
}

interface ClientUser {
  id: string;
  email: string;
  officialName?: string;
}

// Component for high-level data charting and project analytics
const ProjectAnalytics = ({ logs }: { logs: InternalLog[] }) => {
  // Aggregate logs per day for a simple activity chart
  const activityData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const date = log.createdAt?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).slice(-7);
  }, [logs]);

  const mockPerformanceData = [
    { name: 'Phase 1', progress: 100, budget: 95 },
    { name: 'Phase 2', progress: 85, budget: 80 },
    { name: 'Phase 3', progress: 40, budget: 60 },
    { name: 'Phase 4', progress: 10, budget: 20 },
  ];

  return (
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-accent" size={20} />
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold">Internal Collaboration Velocity</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData.length > 0 ? activityData : [{date: 'No Data', count: 0}]}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8860B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#B8860B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888822" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #B8860B', fontSize: '10px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#B8860B' }}
              />
              <Area type="monotone" dataKey="count" stroke="#B8860B" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="font-mono text-[9px] text-steel uppercase mt-4 text-center tracking-widest">Team Engagement Index (Last 7 Days)</p>
      </div>

      <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-accent" size={20} />
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold">Project Resource Efficiency</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888822" />
              <XAxis dataKey="name" axisLine={false} tick={{fill: '#888', fontSize: 10, fontFamily: 'monospace'}} />
              <YAxis axisLine={false} tick={{fill: '#888', fontSize: 10, fontFamily: 'monospace'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #B8860B', fontSize: '10px', fontFamily: 'monospace' }}
              />
              <Bar dataKey="progress" fill="#B8860B" radius={[2, 2, 0, 0]} />
              <Bar dataKey="budget" fill="#5A5A40" radius={[2, 2, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="font-mono text-[9px] text-steel uppercase mt-4 text-center tracking-widest">Progress vs Budget Allocation Ratio</p>
      </div>
    </div>
  );
};

// Component for Inter-Professional internal collaboration chat
const InternalTeamChat = ({
  staff,
  user,
  projectId,
  selectedStaffMember,
  setSelectedStaffMember,
  teamMessages,
  teamReply,
  setTeamReply,
  sendTeamChat,
  isSendingTeamChat
}: {
  staff: StaffUser[];
  user: User | null;
  projectId: string;
  selectedStaffMember: string;
  setSelectedStaffMember: (val: string) => void;
  teamMessages: InternalMessage[];
  teamReply: string;
  setTeamReply: (val: string) => void;
  sendTeamChat: (e: React.FormEvent) => void;
  isSendingTeamChat: boolean;
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teamMessages]);

  return (
    <div className="lg:col-span-3 mt-8 border border-steel/30 dark:border-concrete/20 bg-charcoal/5 dark:bg-charcoal/80 backdrop-blur-sm min-h-[500px] flex flex-col">
      <div className="p-6 border-b border-steel/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-accent" size={20} />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold">
            Inter-Professional Collab Relay
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="text-green-500" size={12} />
          <span className="text-[9px] font-mono text-steel uppercase tracking-widest font-bold">Node Sync Alpha</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-[400px]">
        {/* Staff Directory */}
        <div className="w-72 border-r border-steel/10 flex flex-col bg-charcoal/5 dark:bg-charcoal/40">
          <div className="p-4 border-b border-steel/10">
            <h4 className="font-mono text-[9px] uppercase tracking-widest text-steel mb-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-accent rounded-full"></span> Available Operatives
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {staff.filter(s => s.id !== user?.uid).map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedStaffMember(member.id)}
                className={`w-full text-left p-5 border-b border-steel/5 transition-all hover:bg-concrete/10 flex flex-col gap-1 ${selectedStaffMember === member.id ? 'bg-accent/10 border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-charcoal dark:text-concrete">
                    {member.officialName || member.email.split('@')[0]}
                  </span>
                  <span className="text-[8px] font-mono uppercase text-accent/80 font-bold">{member.role.replace('_', ' ')}</span>
                </div>
                <span className="font-mono text-[8px] text-steel opacity-60 uppercase tracking-tighter">
                  {member.title || 'Technical Specialist'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messaging Pane */}
        <div className="flex-1 flex flex-col bg-white/10 dark:bg-charcoal/20">
          {selectedStaffMember ? (
            <>
              <div className="p-4 border-b border-steel/5 flex items-center justify-between bg-concrete/10 dark:bg-charcoal/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-mono text-[10px] uppercase font-bold text-accent">
                    Channel: {staff.find(s => s.id === selectedStaffMember)?.officialName || 'Operative'}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-steel uppercase">End-to-End Staff Encryption</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {teamMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                    <Send size={32} strokeWidth={1} className="-rotate-12" />
                    <p className="font-mono text-[10px] uppercase tracking-widest">Open professional node</p>
                  </div>
                ) : (
                  teamMessages.map(msg => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 ${isMine ? 'bg-accent/90 text-white' : 'bg-charcoal/90 dark:bg-concrete/90 text-concrete dark:text-charcoal border border-steel/10 shadow-lg'}`}>
                          <p className="font-mono text-[11px] leading-[1.6]">{msg.text}</p>
                          <div className={`mt-2 font-mono text-[8px] uppercase tracking-tighter opacity-50 flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Syncing...'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-steel/10 bg-white/20 dark:bg-charcoal/40">
                <form onSubmit={sendTeamChat} className="flex gap-2">
                  <input
                    type="text"
                    value={teamReply}
                    onChange={(e) => setTeamReply(e.target.value)}
                    placeholder="Exchange technical info..."
                    className="flex-1 bg-white/50 dark:bg-charcoal/50 border border-steel/20 dark:border-concrete/20 px-4 py-3 font-mono text-[11px] text-charcoal dark:text-concrete focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={!teamReply.trim() || isSendingTeamChat}
                    className="bg-accent text-white px-6 py-3 hover:opacity-90 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 disabled:opacity-30"
                  >
                    Transmit
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-steel opacity-20 p-8 text-center gap-4">
              <Users size={56} strokeWidth={1} />
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] font-bold">Network Idle</p>
                <p className="font-mono text-[9px] tracking-widest uppercase">Select a staff member from the regional registry to sync</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for Technical Staff to submit logs
const InternalLogSubmitter = ({ 
  internalMessage, 
  setInternalMessage, 
  internalFile, 
  setInternalFile, 
  handleFileUpload, 
  submitInternalLog, 
  isSubmitting, 
  internalLogs 
}: {
  internalMessage: string;
  setInternalMessage: (val: string) => void;
  internalFile: any;
  setInternalFile: (val: any) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'internal' | 'pm') => void;
  submitInternalLog: () => void;
  isSubmitting: boolean;
  internalLogs: InternalLog[];
}) => (
  <div className="mt-8 p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-3">
    <div className="flex items-center gap-3 mb-4">
      <MessageSquare className="text-accent" size={20} />
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold">Submit Internal Technical Log</h3>
    </div>
    <p className="font-mono text-[10px] text-steel mb-6 leading-relaxed max-w-3xl">
      Direct client communication is restricted for technical staff to ensure unified project messaging. Submit your progress logs, daily findings, or technical blocks here. The Project Manager will review, translate technical details, and publish an official update to the client.
    </p>
    <textarea
      value={internalMessage}
      onChange={(e) => setInternalMessage(e.target.value)}
      placeholder="E.g., Finished reviewing structural loads for Phase 1. Draft attached. Awaiting PM sign off..."
      className="w-full bg-transparent border border-steel/30 dark:border-concrete/20 p-4 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent dark:focus:border-accent transition-colors min-h-[100px] mb-4 custom-scrollbar"
    ></textarea>

    <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center gap-2 px-4 py-2 border border-steel/30 dark:border-concrete/20 bg-charcoal/5 dark:bg-concrete/5 cursor-pointer hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-all font-mono text-[10px] uppercase tracking-widest font-bold">
        <Upload size={14} />
        {internalFile ? internalFile.name : 'Attach Image/Doc (Up to 5MB)'}
        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'internal')} />
      </label>
      {internalFile && (
        <button onClick={() => setInternalFile(null)} className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:underline">Remove</button>
      )}
    </div>

    <button 
      onClick={submitInternalLog}
      disabled={isSubmitting || !internalMessage.trim()}
      className="px-6 py-3 bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-accent hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      <Send size={14} /> Submit to Project Manager
    </button>

    {internalLogs.length > 0 && (
      <div className="mt-8 pt-8 border-t border-steel/10 dark:border-concrete/10">
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold mb-4">Recent Internal Submissions</h4>
        <div className="space-y-4 max-h-48 overflow-y-auto custom-scrollbar pr-4">
          {internalLogs.map(log => (
            <div key={log.id} className="p-4 border border-steel/10 bg-charcoal/5 dark:bg-concrete/5">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-charcoal dark:text-concrete">
                  {log.staffName} <span className="opacity-40">|</span> <span className="text-accent">{log.staffTitle}</span>
                </span>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${log.status === 'reviewed' ? 'text-green-500' : 'text-accent'}`}>{log.status.replace('_', ' ')}</span>
              </div>
              <p className="font-mono text-[10px] text-charcoal/80 dark:text-concrete/80 whitespace-pre-wrap mb-3">{log.message}</p>
              {log.fileUrl && (
                <div className="mt-2 border border-steel/10 p-2 bg-charcoal/5 dark:bg-concrete/5 rounded flex items-center justify-between">
                  <span className="font-mono text-[9px] text-steel truncate max-w-[150px]">{log.fileName || 'Attached File'}</span>
                  <a href={log.fileUrl} download={log.fileName} className="text-[9px] font-mono text-accent uppercase font-bold hover:underline flex items-center gap-1">
                    <Download size={10} /> View/Download
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Component for Project Manager for direct chat with clients
const PMChatSystem = ({ 
  clients, 
  user,
  selectedChatClient,
  setSelectedChatClient,
  chatMessages,
  chatReply,
  setChatReply,
  sendChat,
  isSendingChat
}: {
  clients: ClientUser[];
  user: User | null;
  selectedChatClient: string;
  setSelectedChatClient: (val: string) => void;
  chatMessages: Message[];
  chatReply: string;
  setChatReply: (val: string) => void;
  sendChat: (e: React.FormEvent) => void;
  isSendingChat: boolean;
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  return (
    <div className="lg:col-span-3 mt-8 border border-steel/20 dark:border-concrete/10 bg-white/30 dark:bg-charcoal/30 backdrop-blur-sm shadow-xl min-h-[500px] flex flex-col">
      <div className="p-6 border-b border-steel/10 bg-concrete/50 dark:bg-charcoal/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-accent" size={24} />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold italic">
            Direct Client Intelligence Channel
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-mono text-steel uppercase tracking-widest font-bold">Secure Path Active</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-[450px]">
        {/* Clients List Sidebar */}
        <div className="w-1/3 border-r border-steel/10 flex flex-col bg-charcoal/5 dark:bg-charcoal/40">
          <div className="p-4 border-b border-steel/10">
            <input 
              type="text" 
              placeholder="Filter Project Database..." 
              className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-2 font-mono text-[9px] uppercase tracking-widest text-charcoal dark:text-concrete outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedChatClient(client.id)}
                className={`w-full text-left p-5 border-b border-steel/5 transition-all hover:bg-accent/5 flex flex-col gap-1 ${selectedChatClient === client.id ? 'bg-accent/10 border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}`}
              >
                <span className="font-mono text-[10px] font-bold text-charcoal dark:text-concrete truncate">
                  {client.officialName || 'Project ' + client.id.slice(0, 4).toUpperCase()}
                </span>
                <span className="font-mono text-[9px] text-steel truncate opacity-60">
                  {client.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col relative bg-concrete/30 dark:bg-charcoal/20">
          {selectedChatClient ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-steel opacity-30 gap-4">
                    <MessageSquare size={40} strokeWidth={1} />
                    <p className="font-mono text-[10px] uppercase tracking-widest">Awaiting Communication Sync</p>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 ${isMine ? 'bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal' : 'bg-white/80 dark:bg-charcoal/80 border border-steel/10 text-charcoal dark:text-concrete shadow-sm'}`}>
                          <p className="font-mono text-[11px] leading-relaxed select-text">{msg.text}</p>
                          <div className={`mt-2 font-mono text-[8px] uppercase tracking-tighter opacity-50 flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Syncing...'}</span>
                            {isMine && <Check size={8} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-steel/10 bg-white/50 dark:bg-charcoal/50">
                <form onSubmit={sendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    placeholder="Brief client on progress..."
                    className="flex-1 bg-white/80 dark:bg-charcoal/80 border border-steel/20 dark:border-concrete/20 px-4 py-3 font-mono text-[11px] text-charcoal dark:text-concrete focus:outline-none focus:border-accent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatReply.trim() || isSendingChat}
                    className="bg-accent text-white px-5 py-3 hover:opacity-90 transition-all font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 disabled:opacity-30"
                  >
                    <Send size={14} /> Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-steel opacity-20 p-8 text-center gap-6">
              <Eye size={64} strokeWidth={1} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] mb-2 font-bold">Encrypted Comms Inactive</p>
                <p className="font-mono text-[9px] tracking-widest max-w-[200px] mx-auto uppercase">Select a project stakeholder to initiate direct intelligence exchange</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for Project Manager to publish client updates
const PMUpdateSubmitter = ({
  selectedClient,
  setSelectedClient,
  pmUpdateMessage,
  setPmUpdateMessage,
  pmFile,
  setPmFile,
  handleFileUpload,
  publishClientUpdate,
  isSubmitting,
  clients,
  internalLogs
}: {
  selectedClient: string;
  setSelectedClient: (val: string) => void;
  pmUpdateMessage: string;
  setPmUpdateMessage: (val: string | ((prev: string) => string)) => void;
  pmFile: any;
  setPmFile: (val: any) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: 'internal' | 'pm') => void;
  publishClientUpdate: () => void;
  isSubmitting: boolean;
  clients: ClientUser[];
  internalLogs: InternalLog[];
}) => {
  const copyToDraft = (log: InternalLog) => {
    const author = log.staffTitle ? `${log.staffName} (${log.staffTitle})` : `${log.staffName} (${log.role.toUpperCase()})`;
    const header = `[REPORT: ${author}]\n`;
    setPmUpdateMessage(prev => prev + (prev ? '\n\n' : '') + header + log.message);
  };

  return (
    <div className="p-8 border border-accent/20 bg-accent/5 backdrop-blur-md lg:col-span-3 mt-4">
      <div className="flex items-center gap-3 mb-6">
        <Eye className="text-accent" size={24} />
        <h3 className="font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete font-bold">Client Communication Gatekeeper</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Internal Logs Feed */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold">Pending Internal Logs from Staff</h4>
            <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
              {internalLogs.length} Active Reports
            </span>
          </div>
          
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
            {internalLogs.length === 0 ? (
              <div className="p-8 border border-dashed border-steel/20 rounded text-center">
                <p className="text-xs font-mono text-steel">No pending logs for this project.</p>
              </div>
            ) : (
              internalLogs.map(log => (
                <div key={log.id} className={`group relative p-5 border transition-all duration-300 ${log.status === 'reviewed' ? 'border-green-500/30 bg-green-500/5' : 'border-steel/10 bg-white/50 dark:bg-charcoal/80 hover:border-accent/40 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'reviewed' ? 'bg-green-500' : 'bg-accent animate-pulse'}`}></div>
                      <span className="font-mono text-[10px] font-bold text-charcoal dark:text-concrete tracking-tight">
                        {log.staffName} <span className="text-accent opacity-60 ml-1">/</span> <span className="opacity-60">{log.staffTitle || log.role.slice(0, 3).toUpperCase()}</span>
                      </span>
                    </div>
                    {log.status === 'reviewed' ? (
                      <span className="text-[9px] text-green-500 uppercase tracking-widest font-bold">Reviewed</span>
                    ) : (
                      <button 
                        onClick={() => copyToDraft(log)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-accent border border-accent/30 px-2 py-1 hover:bg-accent hover:text-white uppercase tracking-tighter"
                      >
                        Push to Draft
                      </button>
                    )}
                  </div>
                  
                  <div className="pl-3 border-l-[1px] border-accent/20">
                    <p className="font-mono text-[11px] text-charcoal/80 dark:text-concrete/80 leading-relaxed mb-4 italic truncate-multi-3">
                      "{log.message}"
                    </p>
                  </div>

                  {log.fileUrl && (
                    <div className="mt-3 p-3 bg-charcoal/5 dark:bg-concrete/5 border border-steel/10 flex items-center justify-between group/file">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Upload size={12} className="text-steel" />
                        <span className="font-mono text-[9px] text-steel truncate max-w-[150px]">{log.fileName}</span>
                      </div>
                      <a href={log.fileUrl} download={log.fileName} className="text-[9px] font-mono text-accent uppercase font-bold hover:underline whitespace-nowrap">Open Asset</a>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-steel/10 flex justify-between items-center text-[9px] text-steel/60 font-mono">
                  <span>ID: {log.id.slice(0, 8).toUpperCase()}</span>
                  <span>{log.createdAt instanceof Date ? log.createdAt.toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Publisher Tool */}
        <div className="lg:border-l lg:border-steel/20 lg:pl-8 flex flex-col">
          <div className="mb-6">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold mb-2">Publish Official Timeline Update</h4>
            <p className="font-mono text-[10px] text-steel/70 leading-relaxed">
              Synthesize the technical data above into a professional, cohesive update for the client. This will be visible on their project dashboard immediately.
            </p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-steel mb-2 ml-1">Target Client Profile</label>
              <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-white/40 dark:bg-charcoal/40 border border-steel/30 dark:border-concrete/20 p-4 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent dark:focus:border-accent transition-all hover:bg-white/60 dark:hover:bg-charcoal/60"
              >
                <option value="" disabled className="bg-concrete dark:bg-charcoal text-steel">Assign to Client Database Record...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-concrete dark:bg-charcoal">
                    {c.officialName ? `${c.officialName} (${c.email})` : c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-steel mb-2 ml-1">Draft Curated Content</label>
              <textarea
                value={pmUpdateMessage}
                onChange={(e) => setPmUpdateMessage(e.target.value)}
                placeholder="Structure your official update here. Tip: Use 'Push to Draft' on staff logs to start your report..."
                className="w-full bg-white/40 dark:bg-charcoal/40 border border-steel/30 dark:border-concrete/20 p-5 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent dark:focus:border-accent min-h-[220px] custom-scrollbar leading-loose"
              ></textarea>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex-grow flex items-center justify-center gap-3 px-4 py-4 border border-accent/20 bg-accent/5 cursor-pointer hover:bg-accent/10 transition-all font-mono text-[10px] uppercase tracking-widest font-bold text-accent">
                <Upload size={16} />
                {pmFile ? pmFile.name : 'Attach Client-Facing Schematic (Max 5MB)'}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'pm')} />
              </label>
              {pmFile && (
                <button onClick={() => setPmFile(null)} className="h-[52px] px-6 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-mono uppercase tracking-widest font-bold">
                  Clear
                </button>
              )}
            </div>
            
            <button 
              onClick={publishClientUpdate}
              disabled={isSubmitting || !pmUpdateMessage.trim() || !selectedClient}
              className="w-full py-5 bg-accent text-white font-mono text-[10px] uppercase font-bold tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-30 disabled:shadow-none flex justify-center items-center gap-3"
            >
              <Check size={18} /> Sync with Client Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StaffPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [userTitle, setUserTitle] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Project selection state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Communications states
  const [internalMessage, setInternalMessage] = useState('');
  const [internalLogs, setInternalLogs] = useState<InternalLog[]>([]);
  const [internalFile, setInternalFile] = useState<{ url: string, name: string } | null>(null);
  
  // PM specific states
  const [pmUpdateMessage, setPmUpdateMessage] = useState('');
  const [pmFile, setPmFile] = useState<{ url: string, name: string } | null>(null);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PM Chat states
  const [selectedChatClient, setSelectedChatClient] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatReply, setChatReply] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Inter-Professional Chat states
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [selectedStaffMember, setSelectedStaffMember] = useState<string>('');
  const [teamMessages, setTeamMessages] = useState<InternalMessage[]>([]);
  const [teamReply, setTeamReply] = useState('');
  const [isSendingTeamChat, setIsSendingTeamChat] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let userRole = userData.role;
            setDisplayName(userData.officialName || '');
            setUserTitle(userData.title || '');
            
            if (currentUser.email === 'machariag605@gmail.com' || currentUser.email === 'danuthiaandassociates@gmail.com' || currentUser.email === 'urbanplanning2027@gmail.com') {
              userRole = 'admin';
            }
            setRole(userRole);
            
            // Auto open profile if missing details
            if (!userData.officialName || !userData.title) {
              setIsProfileModalOpen(true);
            }
          } else {
            setRole('unauthorized');
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          setRole('unauthorized');
        }
      } else {
        setUser(null);
        setRole(null);
        navigate('/staff-login');
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!selectedProject || !role || !user) return;

    // Listen to internal logs for the selected project
    // Authorized staff can see all logs for the current project for team coordination
    const q = query(
      collection(db, 'internalLogs'),
      where('projectId', '==', selectedProject),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InternalLog[];
      setInternalLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'internalLogs');
    });

    return () => unsubscribe();
  }, [selectedProject, role, user]);

  useEffect(() => {
    if (role === 'project_manager' || role === 'admin') {
      // Fetch available clients for the PM to route messages to
      const fetchClients = async () => {
        try {
          const clientQ = query(collection(db, 'users'), where('role', '==', 'client'));
          const snapshot = await getDocs(clientQ);
          const clientList = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            email: doc.data().email,
            officialName: doc.data().officialName
          })) as ClientUser[];
          setClients(clientList);
          
          // Pre-select first client if none selected for chat
          if (clientList.length > 0 && !selectedChatClient) {
            setSelectedChatClient(clientList[0].id);
          }
        } catch (e) {
          console.warn("Could not fetch clients.");
        }
      };
      fetchClients();
    }
  }, [role, selectedChatClient]);

  // Fetch all staff for internal chat
  useEffect(() => {
    if (role && role !== 'unauthorized') {
      const fetchStaff = async () => {
        try {
          const staffQ = query(collection(db, 'users'), where('role', 'in', ['project_manager', 'architect', 'surveyor', 'admin']));
          const snapshot = await getDocs(staffQ);
          const staffList = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as StaffUser[];
          setStaff(staffList);
          
          if (staffList.length > 0 && !selectedStaffMember) {
            // Find a project manager if I'm not one, or just the first available
            const pm = staffList.find(s => s.role === 'project_manager' && s.id !== user?.uid);
            setSelectedStaffMember(pm?.id || staffList.find(s => s.id !== user?.uid)?.id || '');
          }
        } catch (e) {
          console.warn("Could not fetch staff registry.");
        }
      };
      fetchStaff();
    }
  }, [role, user, selectedStaffMember]);

  // Internal Team Chat Subscription
  useEffect(() => {
    if (!selectedStaffMember || !user || !selectedProject) return;

    const q = query(
      collection(db, 'internalMessages'),
      and(
        where('projectId', '==', selectedProject),
        or(
          where('senderId', '==', user.uid),
          where('receiverId', '==', user.uid)
        )
      ),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as InternalMessage[];
        
      // Filter for current conversation
      const conversationMsgs = msgs.filter(m => 
        (m.senderId === user.uid && m.receiverId === selectedStaffMember) ||
        (m.senderId === selectedStaffMember && m.receiverId === user.uid)
      );

      setTeamMessages(conversationMsgs);

      // Handle read status
      conversationMsgs.forEach(msg => {
        if (msg.receiverId === user.uid && !msg.read) {
          updateDoc(doc(db, 'internalMessages', msg.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [selectedStaffMember, user, selectedProject]);

  // Real-time chat subscription
  useEffect(() => {
    if (!selectedChatClient || !user || (role !== 'project_manager' && role !== 'admin')) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      or(
        where('senderId', '==', selectedChatClient),
        where('receiverId', '==', selectedChatClient)
      ),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setChatMessages(msgs);
      
      // Mark unread messages as read
      msgs.forEach(msg => {
        if (msg.receiverId === user.uid && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true }).catch(console.error);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });

    return () => unsubscribe();
  }, [selectedChatClient, user, role]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'internal' | 'pm') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hard limit of 5MB for selection, but we will compress images to fit Firestore (1MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB. Please upload a smaller file.");
      return;
    }

    const processFile = async (f: File) => {
      // If it's an image, try to compress it to fit under 1MB Firestore limit
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Max dimensions for technical docs
            const MAX_WIDTH = 2000;
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Start with 0.7 quality to stay under 1MB easily
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Base64 size check
            const stringSize = base64.length;
            if (stringSize > 1000000) {
              // Re-compress if still too large
              const smallBase64 = canvas.toDataURL('image/jpeg', 0.4);
              if (smallBase64.length > 1000000) {
                alert("Image is too complex to fit in the database even after compression. Please use a simpler image.");
                return;
              }
              if (target === 'internal') setInternalFile({ url: smallBase64, name: f.name });
              else setPmFile({ url: smallBase64, name: f.name });
            } else {
              if (target === 'internal') setInternalFile({ url: base64, name: f.name });
              else setPmFile({ url: base64, name: f.name });
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(f);
      } else {
        // Non-image files (PDFs etc) - strictly capped at 800KB due to Firestore 1MB document limit
        if (f.size > 800 * 1024) {
          alert("Documents (PDF/Docs) are currently limited to 800KB to fit database constraints. Please optimize your file.");
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (target === 'internal') {
            setInternalFile({ url: base64, name: f.name });
          } else {
            setPmFile({ url: base64, name: f.name });
          }
        };
        reader.readAsDataURL(f);
      }
    };

    processFile(file);
  };

  const submitInternalLog = async () => {
    if (!internalMessage.trim() || !selectedProject || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'internalLogs'), {
        projectId: selectedProject,
        staffName: displayName || user.email,
        staffTitle: userTitle || role.replace('_', ' ').toUpperCase(),
        role: role,
        message: internalMessage,
        status: 'pending_review',
        createdAt: serverTimestamp(),
        fileUrl: internalFile?.url || null,
        fileName: internalFile?.name || null
      });
      setInternalMessage('');
      setInternalFile(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'internalLogs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishClientUpdate = async () => {
    if (!pmUpdateMessage.trim() || !selectedClient || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'projectUpdates'), {
        clientId: selectedClient,
        title: `Official Update: ${currentProjectName}`,
        description: pmUpdateMessage,
        imageUrl: pmFile?.url || null, // Reusing imageUrl for compatibility or adding fileUrl
        fileUrl: pmFile?.url || null,
        fileName: pmFile?.name || null,
        status: 'published',
        createdAt: serverTimestamp()
      });
      // Mark internal logs as reviewed
      for (const log of internalLogs.filter(l => l.status === 'pending_review')) {
        await updateDoc(doc(db, 'internalLogs', log.id), { status: 'reviewed' });
      }
      setPmUpdateMessage('');
      setPmFile(null);
      alert("Successfully published curated update to Client Portal!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projectUpdates');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReply.trim() || !selectedChatClient || !user) return;
    
    setIsSendingChat(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: selectedChatClient,
        text: chatReply.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      setChatReply('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setIsSendingChat(false);
    }
  };

  const sendTeamChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamReply.trim() || !selectedStaffMember || !user || !selectedProject) return;
    
    setIsSendingTeamChat(true);
    try {
      await addDoc(collection(db, 'internalMessages'), {
        senderId: user.uid,
        receiverId: selectedStaffMember,
        projectId: selectedProject,
        text: teamReply.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      setTeamReply('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'internalMessages');
    } finally {
      setIsSendingTeamChat(false);
    }
  };

  if (!isAuthReady || !role) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const authorizedRoles = ['project_manager', 'architect', 'surveyor', 'admin'];
  if (!authorizedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8 bg-concrete dark:bg-charcoal transition-colors duration-500">
        <div className="max-w-md w-full text-center">
          <h2 className="font-display text-3xl font-bold uppercase mb-4 text-charcoal dark:text-concrete">Pending Approval</h2>
          <p className="font-mono text-xs text-steel uppercase tracking-widest mb-8 leading-relaxed">
            Your staff account is currently pending review. Please wait for the Head Administrator to approve your access and assign your role.
          </p>
          <Magnetic>
            <button 
              onClick={() => signOut(auth).then(() => navigate('/staff-login'))}
              className="px-6 py-3 border border-charcoal/20 dark:border-concrete/20 text-xs font-mono uppercase tracking-widest hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-colors duration-300"
            >
              Sign Out
            </button>
          </Magnetic>
        </div>
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (role) {
      case 'project_manager': return <ClipboardList className="text-accent mb-4" size={32} />;
      case 'architect': return <Hammer className="text-accent mb-4" size={32} />;
      case 'surveyor': return <Map className="text-accent mb-4" size={32} />;
      case 'admin': return <Eye className="text-accent mb-4" size={32} />;
      default: return null;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'project_manager': return 'Project Manager Dashboard';
      case 'architect': return 'Architecture & Engineering Dashboard';
      case 'surveyor': return 'Surveyor & Planning Dashboard';
      case 'admin': return 'Super User Environment';
      default: return 'Staff Dashboard';
    }
  };

  const currentProjectName = selectedProject 
    ? MOCK_PROJECTS.find(p => p.id === selectedProject)?.name 
    : 'System Overview';

  const renderDashboardWidgets = () => {
    if (!selectedProject) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-steel/30 dark:border-steel/20 bg-white/10 dark:bg-charcoal/10 backdrop-blur-sm">
          <Building2 size={48} className="text-steel/50 mb-6" strokeWidth={1} />
          <h3 className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete mb-4">No Project Selected</h3>
          <p className="font-mono text-xs text-steel uppercase tracking-widest leading-relaxed max-w-md">
            Please select an active project from the dropdown menu above to access your role-specific dashboard context and data.
          </p>
        </div>
      );
    }

    if (role === 'project_manager') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
            <ClipboardList className="text-accent mb-4" size={24} />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Milestone Tracker</h3>
            <p className="font-display text-4xl text-charcoal dark:text-concrete">12</p>
            <p className="font-mono text-[10px] text-steel mt-4">Active milestones requiring sign-off for <span className="text-accent font-bold">{currentProjectName}</span>.</p>
          </div>
          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
            <HardHat className="text-accent mb-4" size={24} />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Site Operations</h3>
            <p className="font-display text-4xl text-charcoal dark:text-concrete">3</p>
            <p className="font-mono text-[10px] text-steel mt-4">Active crews reporting daily logs on site.</p>
          </div>
          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
            <FileLineChart className="text-accent mb-4" size={24} />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Budget Health</h3>
            <div className="w-full bg-steel/20 h-1 mt-4">
              <div className="bg-accent h-full shadow-[0_0_10px_rgba(184,134,11,0.5)]" style={{ width: '85%' }}></div>
            </div>
            <p className="font-mono text-[10px] text-steel mt-4">85% under budget for this current phase.</p>
          </div>

          {/* PM Review & Publish Widget */}
          <PMUpdateSubmitter 
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            pmUpdateMessage={pmUpdateMessage}
            setPmUpdateMessage={setPmUpdateMessage}
            pmFile={pmFile}
            setPmFile={setPmFile}
            handleFileUpload={handleFileUpload}
            publishClientUpdate={publishClientUpdate}
            isSubmitting={isSubmitting}
            clients={clients}
            internalLogs={internalLogs}
          />

          {/* PM Chat System */}
          <PMChatSystem 
            clients={clients}
            user={user}
            selectedChatClient={selectedChatClient}
            setSelectedChatClient={setSelectedChatClient}
            chatMessages={chatMessages}
            chatReply={chatReply}
            setChatReply={setChatReply}
            sendChat={sendChat}
            isSendingChat={isSendingChat}
          />

          {/* Project Analytics */}
          <ProjectAnalytics logs={internalLogs} />

          {/* Internal Team Connectivity */}
          <InternalTeamChat 
            staff={staff}
            user={user}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
          />
        </div>
      );
    }
    
    if (role === 'architect' || role === 'surveyor') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {role === 'architect' ? (
            <>
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-2">
                <PenTool className="text-accent mb-4" size={24} />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Drafts for {currentProjectName}</h3>
                <ul className="space-y-4 mt-6">
                  <li className="flex justify-between items-center text-sm font-light border-b border-steel/10 pb-2">
                    <span>{currentProjectName.split(' ')[0]}_Structural_v3.dwg</span>
                    <span className="text-accent text-[10px] uppercase tracking-widest font-mono">Pending Review</span>
                  </li>
                  <li className="flex justify-between items-center text-sm font-light border-b border-steel/10 pb-2">
                    <span>{currentProjectName.split(' ')[0]}_Landscape.pdf</span>
                    <span className="text-accent text-[10px] uppercase tracking-widest font-mono">Changes Req</span>
                  </li>
                </ul>
              </div>
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
                <Hammer className="text-accent mb-4" size={24} />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Material Submittals</h3>
                <p className="font-display text-4xl text-charcoal dark:text-concrete">8</p>
                <p className="font-mono text-[10px] text-steel mt-4">Samples pending engineering approval for this site.</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
                <Map className="text-accent mb-4" size={24} />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Site Topography</h3>
                <p className="font-display text-4xl text-charcoal dark:text-concrete">1</p>
                <p className="font-mono text-[10px] text-steel mt-4">Master survey available for <span className="text-accent font-bold">{currentProjectName}</span>.</p>
              </div>
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
                <Trees className="text-accent mb-4" size={24} />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Land Zoning Approvals</h3>
                <p className="font-display text-4xl text-charcoal dark:text-concrete">2</p>
                <p className="font-mono text-[10px] text-steel mt-4">Awaiting municipal feedback for this plot.</p>
              </div>
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
                <div className="w-full h-32 bg-steel/10 flex items-center justify-center mb-6 border border-steel/20">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel/80 flex flex-col items-center gap-2">
                    <Trees size={16} />GIS Map Context: {currentProjectName}
                  </span>
                </div>
                <button className="w-full py-3 bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                  Open GIS Toolkit
                </button>
              </div>
            </>
          )}
          
          <InternalLogSubmitter 
            internalMessage={internalMessage}
            setInternalMessage={setInternalMessage}
            internalFile={internalFile}
            setInternalFile={setInternalFile}
            handleFileUpload={handleFileUpload}
            submitInternalLog={submitInternalLog}
            isSubmitting={isSubmitting}
            internalLogs={internalLogs}
          />

          {/* Data Charting */}
          <ProjectAnalytics logs={internalLogs} />

          {/* Internal Team Connectivity */}
          <InternalTeamChat 
            staff={staff}
            user={user}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
          />
        </div>
      );
    }

    // Admin or fallback
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">System Alerts</h3>
          <p className="font-display text-4xl text-accent">0</p>
          <p className="font-mono text-[10px] text-steel mt-4">No critical system events for <span className="text-accent font-bold">{currentProjectName}</span>.</p>
        </div>
        <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-2">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Global Network Status</h3>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="font-mono text-xs text-charcoal dark:text-concrete uppercase tracking-widest">Core Secured. All permissions strict.</p>
          </div>
          <button onClick={() => navigate('/admin')} className="mt-8 px-6 py-3 border border-charcoal/20 dark:border-concrete/20 text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-colors">
            Jump to Master Admin
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-concrete dark:bg-charcoal transition-colors duration-500 pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-steel/20 dark:border-concrete/10 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {getRoleIcon()}
            </div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">
              {getRoleTitle()}
            </h1>
            <p className="font-mono text-xs text-steel uppercase tracking-widest mt-2">
              Logged in as {user?.email}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto">
            {/* Context Project Selector */}
            <div className="relative w-full sm:w-64">
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full appearance-none bg-transparent border border-steel/30 dark:border-steel/50 text-charcoal dark:text-concrete px-4 py-3 pr-10 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-accent dark:focus:border-accent transition-colors"
              >
                <option value="" disabled className="bg-concrete dark:bg-charcoal">Select Context Project</option>
                {MOCK_PROJECTS.map((project) => (
                  <option key={project.id} value={project.id} className="bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete">
                    {project.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-steel">
                <ChevronDown size={16} />
              </div>
            </div>

            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel hover:text-accent transition-colors bg-charcoal/5 dark:bg-concrete/5 px-4 py-3 border border-steel/20 shadow-sm whitespace-nowrap"
            >
              <Edit size={14} /> Profile Settings
            </button>

            <Magnetic>
              <button 
                onClick={() => signOut(auth).then(() => navigate('/staff-login'))}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors bg-charcoal/5 dark:bg-concrete/5 px-4 py-3 border border-red-500/20 shadow-sm whitespace-nowrap"
              >
                <LogOut size={14} />
                Secure Sign Out
              </button>
            </Magnetic>
          </div>
        </div>

        {selectedProject && (
          <div className="mb-8 p-4 bg-accent/5 border left-l-4 border border-l-4 border-l-accent border-r-steel/10 border-y-steel/10 dark:border-r-concrete/10 dark:border-y-concrete/10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Live Context: <span className="font-bold text-accent">{currentProjectName}</span>
            </h2>
            <p className="font-mono text-[10px] text-steel uppercase tracking-widest mt-2 ml-4">
              Status: {MOCK_PROJECTS.find(p => p.id === selectedProject)?.status}
            </p>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={selectedProject} // Re-animate when project changes
        >
          {renderDashboardWidgets()}
        </motion.div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-charcoal/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-concrete dark:bg-charcoal p-10 max-w-lg w-full border border-steel/20 shadow-2xl relative"
          >
            <div className="flex items-center gap-4 mb-8">
              <Building2 className="text-accent" size={32} />
              <div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">Professional Identity</h2>
                <p className="font-mono text-[10px] text-steel uppercase tracking-widest">Required for attribution across all project portals</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-steel mb-3">Official Full Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Ar. David Macharia"
                  className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/30 p-4 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-steel mb-3">Professional Title / Designation</label>
                <input 
                  type="text" 
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  placeholder="e.g., Senior Urban Planner"
                  className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/30 p-4 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                />
                <p className="font-mono text-[9px] text-steel/60 mt-2 uppercase tracking-tighter italic">This title will be visible to clients on all official project updates.</p>
              </div>

              <button 
                onClick={async () => {
                  if (!displayName.trim() || !userTitle.trim() || !user) return;
                  try {
                    await updateDoc(doc(db, 'users', user.uid), {
                      officialName: displayName.trim(),
                      title: userTitle.trim()
                    });
                    setIsProfileModalOpen(false);
                    // Update state to trigger re-renders of logs
                    window.location.reload(); 
                  } catch (e) {
                    console.error("Failed to update profile", e);
                  }
                }}
                disabled={!displayName.trim() || !userTitle.trim()}
                className="w-full py-5 bg-accent text-white font-mono text-[10px] uppercase font-bold tracking-widest hover:opacity-90 transition-all disabled:opacity-30 flex justify-center items-center gap-2"
              >
                <Check size={16} /> Save Professional Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
