import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType, uploadLargeFile, MAX_FILE_SIZE, CHUNK_SIZE } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, limit, or, and, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { LogOut, Hammer, Eye, Map, MapPin, Layers, Globe, PieChart, ClipboardList, PenTool, Trees, HardHat, FileLineChart, ChevronDown, Building2, MessageSquare, Check, Clock, Send, Upload, Download, Edit, Users, Activity, Target, TrendingUp, X, FileCheck, FileText, Shield, CreditCard, Box, ArrowUp, Wind, RefreshCw, Loader2, ChevronRight } from 'lucide-react';
import Magnetic from '../components/Magnetic';
import FinancialManager from '../components/FinancialManager';

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
  assignedPM?: string;
  assignedStaff?: string[];
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

  // Initializing with zero progress and budget logic for new projects
  const mockPerformanceData = [
    { name: 'Phase 1', progress: 0, budget: 0 },
    { name: 'Phase 2', progress: 0, budget: 0 },
    { name: 'Phase 3', progress: 0, budget: 0 },
    { name: 'Phase 4', progress: 0, budget: 0 },
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
  role,
  projectId,
  selectedStaffMember,
  setSelectedStaffMember,
  teamMessages,
  teamReply,
  setTeamReply,
  sendTeamChat,
  isSendingTeamChat,
  staffFilter,
  setStaffFilter
}: {
  staff: StaffUser[];
  user: User | null;
  role: string;
  projectId: string;
  selectedStaffMember: string;
  setSelectedStaffMember: (val: string) => void;
  teamMessages: InternalMessage[];
  teamReply: string;
  setTeamReply: (val: string) => void;
  sendTeamChat: (e: React.FormEvent) => void;
  isSendingTeamChat: boolean;
  staffFilter: string;
  setStaffFilter: (val: string) => void;
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const filteredStaff = staff.filter(s => 
    s.officialName?.toLowerCase().includes(staffFilter.toLowerCase()) || 
    s.email.toLowerCase().includes(staffFilter.toLowerCase()) ||
    s.role.toLowerCase().includes(staffFilter.toLowerCase()) ||
    s.title?.toLowerCase().includes(staffFilter.toLowerCase())
  );

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teamMessages]);

  return (
    <div className="lg:col-span-3 mt-8 border border-steel/30 dark:border-concrete/20 bg-charcoal/5 dark:bg-charcoal/80 backdrop-blur-sm min-h-[500px] flex flex-col">
      <div className="p-6 border-b border-steel/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-accent" size={20} />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold">
            {role === 'project_manager' ? 'Direct Specialist Intelligence Line' : 'Project Manager Direct Liaison'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="text-accent" size={12} />
          <span className="text-[9px] font-mono text-steel uppercase tracking-widest font-bold">Protocol: Secure Routing</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-[400px]">
        {/* Staff Directory */}
        <div className="w-72 border-r border-steel/10 flex flex-col bg-charcoal/5 dark:bg-charcoal/40">
          <div className="p-4 border-b border-steel/10">
            <h4 className="font-mono text-[9px] uppercase tracking-widest text-steel mb-2 flex items-center gap-2 font-bold">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span> {role === 'project_manager' ? 'Field Specialists' : 'Strategic Management'}
            </h4>
            <input 
              type="text" 
              placeholder={role === 'project_manager' ? "Search Specialists..." : "Search Management..."}
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full bg-transparent border border-steel/10 dark:border-concrete/10 p-2 font-mono text-[8px] uppercase tracking-widest text-charcoal dark:text-concrete outline-none focus:border-accent mt-2"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredStaff.filter(s => s.id !== user?.uid).map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedStaffMember(member.id)}
                className={`w-full text-left p-5 border-b border-steel/5 transition-all hover:bg-concrete/10 flex flex-col gap-1 ${selectedStaffMember === member.id ? 'bg-accent/10 border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-charcoal dark:text-concrete">
                    {member.officialName || member.email.split('@')[0]}
                  </span>
                  <span className="text-[8px] font-mono uppercase text-accent font-bold tracking-tighter">{member.role.replace('_', ' ')}</span>
                </div>
                <span className="font-mono text-[8px] text-steel opacity-60 uppercase tracking-tighter">
                  {member.title || 'Professional Operative'}
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
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                  <span className="font-mono text-[10px] uppercase font-bold text-charcoal dark:text-concrete">
                    Active Channel: {staff.find(s => s.id === selectedStaffMember)?.officialName || 'Project Staff'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={10} className="text-accent" />
                  <span className="text-[8px] font-mono text-steel uppercase font-bold tracking-tighter opacity-60 italic">Intelligence Link Encrypted</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {teamMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                    <MessageSquare size={32} strokeWidth={1} />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-center">Protocol initialized. <br/> Awaiting information exchange.</p>
                  </div>
                ) : (
                  teamMessages.map(msg => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 ${isMine ? 'bg-accent/90 text-white shadow-lg' : 'bg-white dark:bg-charcoal text-charcoal dark:text-concrete border border-steel/10 shadow-md'}`}>
                          <p className="font-mono text-[11px] leading-[1.6]">{msg.text}</p>
                          <div className={`mt-2 font-mono text-[8px] uppercase tracking-tighter opacity-50 flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Syncing...'}</span>
                            {isMine && msg.read && <Check size={8} className="text-accent" />}
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
                    placeholder={role === 'project_manager' ? "Issue directive/brief..." : "Submit client-specific update to PM..."}
                    className="flex-1 bg-white/50 dark:bg-charcoal/50 border border-steel/20 dark:border-concrete/20 px-4 py-3 font-mono text-[11px] text-charcoal dark:text-concrete focus:outline-none focus:border-accent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!teamReply.trim() || isSendingTeamChat}
                    className="bg-accent text-white px-6 py-3 hover:scale-[1.02] active:scale-95 transition-all font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 disabled:opacity-30"
                  >
                    Transmit
                  </button>
                </form>
                {role !== 'project_manager' && (
                  <p className="mt-2 text-[8px] font-mono text-center text-steel opacity-50 uppercase tracking-widest leading-relaxed">
                    Professionals must route all project intelligence through the Project Manager.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-steel opacity-20 p-8 text-center gap-4">
              <Users size={56} strokeWidth={1} />
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] font-bold">Network Integration Required</p>
                <p className="font-mono text-[9px] tracking-widest uppercase">Select a strategic operative from the project registry</p>
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
  isSendingChat,
  clientFilter,
  setClientFilter
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
  clientFilter: string;
  setClientFilter: (val: string) => void;
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const filteredClients = clients.filter(c => 
    c.officialName?.toLowerCase().includes(clientFilter.toLowerCase()) || 
    c.email.toLowerCase().includes(clientFilter.toLowerCase())
  );

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
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-2 font-mono text-[9px] uppercase tracking-widest text-charcoal dark:text-concrete outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredClients.map(client => (
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

// Component for Project Manager to manage project metrics and files
const ProjectManagementCenter = ({ 
  selectedClient, 
  clients,
  onSelectClient
}: { 
  selectedClient: string, 
  clients: ClientUser[],
  onSelectClient?: (val: string) => void
}) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'receipt' | 'invoice' | 'image' | 'report' | null>(null);

  // Form states
  const [daysRemaining, setDaysRemaining] = useState('');
  const [budgetUtilized, setBudgetUtilized] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [costEstimation, setCostEstimation] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [dailySummary, setDailySummary] = useState('');
  const [nextActivity, setNextActivity] = useState('');
  
  // Site Analysis States
  const [topoSurvey, setTopoSurvey] = useState('');
  const [solarExposure, setSolarExposure] = useState('');
  const [windPattern, setWindPattern] = useState('');

  const client = clients.find(c => c.id === selectedClient);

  useEffect(() => {
    if (!selectedClient) return;
    setLoading(true);
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', selectedClient);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProjectData(data);
          setDaysRemaining(data.daysRemaining?.toString() || '');
          setBudgetUtilized(data.budgetUtilized?.toString() || '');
          setTotalBudget(data.totalBudget?.toString() || '');
          setCostEstimation(data.costEstimation || '');
          setCurrentPhase(data.currentPhase || '');
          setDailySummary(data.dailySummary || '');
          setNextActivity(data.nextActivity || '');
          setTopoSurvey(data.siteAnalysis?.topographical || '');
          setSolarExposure(data.siteAnalysis?.solarExposure || '');
          setWindPattern(data.siteAnalysis?.windPattern || '');
        } else {
          setProjectData(null);
          setDaysRemaining('');
          setBudgetUtilized('');
          setTotalBudget('');
          setCostEstimation('');
          setCurrentPhase('');
          setDailySummary('');
          setNextActivity('');
          setTopoSurvey('');
          setSolarExposure('');
          setWindPattern('');
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    };
    fetchProject();
  }, [selectedClient]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'projects', selectedClient);
      await updateDoc(docRef, {
        daysRemaining: parseInt(daysRemaining) || 0,
        budgetUtilized: parseInt(budgetUtilized) || 0,
        totalBudget: parseInt(totalBudget) || 0,
        costEstimation,
        currentPhase,
        dailySummary,
        nextActivity,
        siteAnalysis: {
          topographical: topoSurvey,
          solarExposure: solarExposure,
          windPattern: windPattern
        },
        updatedAt: serverTimestamp()
      }).catch(async (err) => {
        if (err.code === 'not-found') {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(docRef, {
            clientId: selectedClient,
            daysRemaining: parseInt(daysRemaining) || 0,
            budgetUtilized: parseInt(budgetUtilized) || 0,
            totalBudget: parseInt(totalBudget) || 0,
            costEstimation,
            currentPhase,
            dailySummary,
            nextActivity,
            siteAnalysis: {
              topographical: topoSurvey,
              solarExposure: solarExposure,
              windPattern: windPattern
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          throw err;
        }
      });
      alert('Project updated successfully');
    } catch (error) {
      console.error("Error updating project:", error);
      alert('Failed to update project');
    }
    setSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'receipt' | 'invoice' | 'image' | 'report') => {
    const file = e.target.files?.[0];
    if (!file || !selectedClient) return;

    setUploading(type);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        if (type === 'report') {
          await uploadLargeFile('technicalReports', {
            clientId: selectedClient,
            title: file.name.split('.')[0],
            fileName: file.name,
            authorId: auth.currentUser?.uid,
            collectionName: 'technicalReports',
            type: 'report'
          }, base64);
        } else if (type === 'invoice') {
          await uploadLargeFile('invoices', {
            clientId: selectedClient,
            description: `Project Invoice: ${file.name}`,
            amount: 0,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'unpaid',
            fileName: file.name,
            collectionName: 'invoices',
            type: 'invoice'
          }, base64);
        } else {
          await uploadLargeFile('documents', {
            clientId: selectedClient,
            title: file.name,
            fileName: file.name,
            fileType: file.type,
            category: type === 'image' ? 'image' : 'document',
            collectionName: 'documents',
          }, base64);
        }
        
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
        setUploading(null);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    } catch (error) {
      console.error("Upload error:", error);
      alert('Upload failed');
      setUploading(null);
      e.target.value = '';
    }
  };

  if (!selectedClient) {
    return (
      <div className="lg:col-span-3 mt-12 grid grid-cols-1 gap-12 border border-steel/20 p-12 text-center bg-charcoal/5 dark:bg-concrete/5">
        <div className="flex flex-col items-center justify-center py-10">
          <Edit className="text-steel/50 mb-6" size={48} strokeWidth={1} />
          <h3 className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete mb-4">Project Control requires Client Context</h3>
          <p className="font-mono text-xs text-steel uppercase tracking-widest leading-relaxed max-w-md mb-8">
            You must select a specific client project to synchronize updates to their dashboard. Any updates made here will automatically reflect on their portal.
          </p>
          {onSelectClient && (
            <div className="relative w-full max-w-sm mx-auto">
              <select
                value=""
                onChange={(e) => onSelectClient(e.target.value)}
                className="w-full appearance-none bg-concrete dark:bg-charcoal border border-steel/50 text-charcoal dark:text-concrete px-6 py-4 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-accent"
              >
                <option value="" disabled>Select Target Client To Continue</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.officialName || c.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 border border-steel/20 p-8">
      <div className="lg:col-span-12 flex justify-between items-center border-b border-steel/10 pb-6 mb-4">
        <h2 className="font-display text-4xl font-light tracking-tight flex items-center gap-4">
          <Edit className="text-accent" size={32} strokeWidth={1} />
          Project Control Center
        </h2>
        <div className="text-right">
          <p className="text-accent font-mono text-[10px] uppercase tracking-widest font-bold">Client Context</p>
          <p className="font-display text-xl text-charcoal dark:text-concrete italic">{client?.officialName || client?.email}</p>
        </div>
      </div>

      <div className="lg:col-span-7">
        <form onSubmit={handleUpdateProject} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Days Remaining</label>
              <input 
                type="number" 
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-sm outline-none focus:border-accent"
                placeholder="e.g. 45"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Projected Total Budget ($)</label>
              <input 
                type="number" 
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-sm outline-none focus:border-accent"
                placeholder="e.g. 2,500,000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Budget Utilized (%)</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={budgetUtilized}
                onChange={(e) => setBudgetUtilized(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-sm outline-none focus:border-accent"
                placeholder="e.g. 65"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Cost Estimation & Budget Management Overview</label>
            <textarea 
              rows={4}
              value={costEstimation}
              onChange={(e) => setCostEstimation(e.target.value)}
              className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-6 font-mono text-xs leading-relaxed outline-none focus:border-accent resize-none"
              placeholder="Enter detailed cost estimation breakdown, financial adjustments, and management strategies..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Current Project Phase</label>
            <input 
              type="text" 
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value)}
              className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-sm outline-none focus:border-accent"
              placeholder="e.g. Foundation & Substructure"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Expected Next Activity / Milestone</label>
            <input 
              type="text" 
              value={nextActivity}
              onChange={(e) => setNextActivity(e.target.value)}
              className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-sm outline-none focus:border-accent"
              placeholder="e.g. Slab casting scheduled for Tuesday"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Daily Executive Summary</label>
            <textarea 
              rows={6}
              value={dailySummary}
              onChange={(e) => setDailySummary(e.target.value)}
              className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-6 font-mono text-xs leading-relaxed outline-none focus:border-accent resize-none"
              placeholder="Provide a high-level summary of today's progress for the client dashboard..."
            />
          </div>

          <div className="pt-8 border-t border-steel/10 space-y-8">
            <div className="flex items-center gap-3">
              <Map className="text-accent" size={20} />
              <h3 className="font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete font-bold">Site Analysis Data</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold mt-2">Topographical Survey Details</label>
              <textarea 
                rows={3}
                value={topoSurvey}
                onChange={(e) => setTopoSurvey(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-xs outline-none focus:border-accent resize-none"
                placeholder="Enter key topographical findings, elevation changes, soil mechanics notes..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Solar Exposure Report</label>
                <textarea 
                  rows={4}
                  value={solarExposure}
                  onChange={(e) => setSolarExposure(e.target.value)}
                  className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-xs outline-none focus:border-accent resize-none"
                  placeholder="Sun path dynamics, shade analysis, optimal orientation notes..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-steel font-bold">Wind Pattern Data</label>
                <textarea 
                  rows={4}
                  value={windPattern}
                  onChange={(e) => setWindPattern(e.target.value)}
                  className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 p-4 font-mono text-xs outline-none focus:border-accent resize-none"
                  placeholder="Prevailing wind directions, seasonal variations, ventilation strategy..."
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal font-bold uppercase tracking-[0.2em] text-xs hover:bg-accent dark:hover:bg-accent hover:text-white transition-all duration-500 shadow-xl disabled:opacity-50 mt-8"
          >
            {saving ? 'Synchronizing Data...' : 'Broadcast to Dashboard'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-5 space-y-12 bg-charcoal/10 dark:bg-concrete/5 p-8 border-l border-steel/10">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-accent font-bold mb-8">Professional Upload Center</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-steel mb-3 font-bold opacity-60">Technical Reports & Permits</p>
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={(e) => handleFileUpload(e, 'report')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading !== null}
                />
                <div className="border border-dashed border-steel/30 p-8 text-center transition-all group-hover:border-accent group-hover:bg-accent/5">
                  <FileCheck size={24} className="mx-auto mb-3 text-steel group-hover:text-accent" />
                  <p className="text-[10px] font-mono uppercase text-steel">{uploading === 'report' ? 'Publishing...' : 'Upload Technical Report'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={(e) => handleFileUpload(e, 'receipt')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading !== null}
                />
                <div className="border border-steel/20 p-6 transition-all group-hover:border-accent group-hover:bg-accent/5">
                  <CreditCard size={18} className="mx-auto mb-2 text-steel group-hover:text-accent" />
                  <p className="text-[10px] font-mono uppercase text-steel">{uploading === 'receipt' ? '...' : 'Receipt'}</p>
                </div>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  onChange={(e) => handleFileUpload(e, 'invoice')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading !== null}
                />
                <div className="border border-steel/20 p-6 transition-all group-hover:border-accent group-hover:bg-accent/5">
                  <ClipboardList size={18} className="mx-auto mb-2 text-steel group-hover:text-accent" />
                  <p className="text-[10px] font-mono uppercase text-steel">{uploading === 'invoice' ? '...' : 'Invoice'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-steel mb-3 font-bold opacity-60">Visual Progress Records</p>
              <div className="relative group">
                <input 
                  type="file" 
                  multiple
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading !== null}
                />
                <div className="border border-steel/20 p-8 text-center transition-all group-hover:border-accent group-hover:bg-accent/5">
                  <Building2 size={24} className="mx-auto mb-3 text-steel group-hover:text-accent" />
                  <p className="text-[10px] font-mono uppercase text-steel">{uploading === 'image' ? 'Processing...' : 'Upload Site Photos'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-steel/10">
          <p className="text-[8px] font-mono text-steel uppercase leading-relaxed font-bold tracking-widest">
            Note: All technical reports and dashboard updates are visible to the client immediately upon synchronization. Ensure all professional sign-offs are obtained before broadcasting.
          </p>
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
  internalLogs,
  siteParams,
  setSiteParams,
  updateSiteParams,
  isSavingSiteParams
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
  siteParams: any;
  setSiteParams: (val: any) => void;
  updateSiteParams: (params: any) => Promise<void>;
  isSavingSiteParams: boolean;
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
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel font-bold">Project Intelligence Queue (Awaiting Dissemination)</h4>
            <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
              {internalLogs.length} Validated Reports
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

      {/* Technical Parameter Sync (PM Control) */}
      <div className="mt-12 pt-8 border-t border-accent/20">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="text-accent" size={20} />
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-charcoal dark:text-concrete font-bold">Strategic Technical Parameter Sync</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Structural Load Max', key: 'deadLoadMax' },
            { label: 'Water Level Telemetry', key: 'groundWater' },
            { label: 'Soil Integrity Rating', key: 'soilBearing' },
            { label: 'Site Safety Boundary', key: 'siteBoundary' }
          ].map(item => (
            <div key={item.key} className="p-5 border border-steel/10 bg-white/40 dark:bg-charcoal/40">
              <label className="block font-mono text-[8px] text-steel uppercase tracking-widest mb-2">{item.label}</label>
              <input 
                type="text"
                value={siteParams[item.key] || ''}
                onChange={(e) => setSiteParams({ ...siteParams, [item.key]: e.target.value })}
                onBlur={() => updateSiteParams({ [item.key]: siteParams[item.key] })}
                className="w-full bg-transparent border-b border-steel/20 focus:border-accent py-1 font-mono text-[11px] text-charcoal dark:text-concrete outline-none transition-all"
                placeholder="Synchronizing..."
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center bg-accent/5 p-4 border border-accent/10">
           <p className="font-mono text-[9px] text-steel uppercase tracking-widest">Global project parameters are accessible across all role-based modules for total environmental consistency.</p>
           {isSavingSiteParams && <Loader2 size={12} className="text-accent animate-spin" />}
        </div>
      </div>
    </div>
  );
};

const AUTHORIZED_STAFF_ROLES = ['project_manager', 'architect', 'engineer', 'surveyor', 'planner', 'financial_analyst', 'admin'];

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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Site parameters state
  const [siteParams, setSiteParams] = useState<any>({});
  const [isSavingSiteParams, setIsSavingSiteParams] = useState(false);

  // Communications states
  const [internalMessage, setInternalMessage] = useState('');
  const [internalLogs, setInternalLogs] = useState<InternalLog[]>([]);
  const [internalFile, setInternalFile] = useState<{ url: string, name: string } | null>(null);
  
  // PM specific states
  const [pmUpdateMessage, setPmUpdateMessage] = useState('');
  const [pmFile, setPmFile] = useState<{ url: string, name: string } | null>(null);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [staffUser, setStaffUser] = useState<any>(null);
  const [show2FAConfirmation, setShow2FAConfirmation] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEngineerSimulating, setIsEngineerSimulating] = useState(false);
  const [engineerSimResult, setEngineerSimResult] = useState<string | null>(null);
  const [isSurveyorSimulating, setIsSurveyorSimulating] = useState(false);
  const [surveyorSimResult, setSurveyorSimResult] = useState<string | null>(null);
  const [isPlannerSimulating, setIsPlannerSimulating] = useState(false);
  const [plannerSimResult, setPlannerSimResult] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);

  // PM Chat states
  const [selectedChatClient, setSelectedChatClient] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatReply, setChatReply] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [clientFilter, setClientFilter] = useState('');

  // Inter-Professional Chat states
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [selectedStaffMember, setSelectedStaffMember] = useState<string>('');
  const [teamMessages, setTeamMessages] = useState<InternalMessage[]>([]);
  const [teamReply, setTeamReply] = useState('');
  const [isSendingTeamChat, setIsSendingTeamChat] = useState(false);
  const [staffFilter, setStaffFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ text: '', type: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

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
            setProfilePhoto(userData.photoUrl || null);
            
            if (currentUser.email === 'machariag605@gmail.com' || 
                currentUser.email === 'danuthiaandassociates@gmail.com') {
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
    if (!selectedProject || !user) return;
    
    const unsubscribe = onSnapshot(doc(db, 'projects', selectedProject), (docSnap) => {
      if (docSnap.exists()) {
        setSiteParams(docSnap.data().siteParams || {});
      } else {
        setSiteParams({});
      }
    });

    return () => unsubscribe();
  }, [selectedProject, user]);

  useEffect(() => {
    if (!selectedProject || !user || !role || role === 'unauthorized') return;

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
    if (AUTHORIZED_STAFF_ROLES.includes(role || '') && user) {
      // Fetch available clients for the staff to route messages to and work on
      const fetchClients = async () => {
        try {
          const clientQ = (role === 'admin')
            ? query(collection(db, 'users'), where('role', '==', 'client'))
            : query(collection(db, 'users'), and(
                where('role', '==', 'client'), 
                or(where('assignedPM', '==', user.uid), where('assignedStaff', 'array-contains', user.uid))
              ));
            
          const snapshot = await getDocs(clientQ);
          const clientList = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            email: doc.data().email,
            officialName: doc.data().officialName,
            assignedPM: doc.data().assignedPM,
            assignedStaff: doc.data().assignedStaff
          })) as ClientUser[];
          setClients(clientList);
          
          // Pre-select first client if none selected for dashboard context
          if (clientList.length > 0 && !selectedProject) {
            setSelectedProject(clientList[0].id);
            setSelectedChatClient(clientList[0].id);
          }
        } catch (e) {
          console.warn("Could not fetch clients. Using secondary query path.");
          // Fallback if index isn't ready
          const fallbackQ = (role === 'admin') 
            ? query(collection(db, 'users'), where('role', '==', 'client'))
            : query(collection(db, 'users'), where('role', '==', 'client'), where('assignedPM', '==', user.uid));
          const snapshot = await getDocs(fallbackQ);
          const allClients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClientUser[];
          const filtered = (role === 'admin') ? allClients : allClients.filter(c => c.assignedPM === user.uid);
          setClients(filtered);
          if (filtered.length > 0 && !selectedChatClient) setSelectedChatClient(filtered[0].id);
        }
      };
      fetchClients();
    }
  }, [role, user, selectedChatClient]);

  // Fetch all staff for internal chat
  useEffect(() => {
    if (role && role !== 'unauthorized') {
      const fetchStaff = async () => {
        try {
          const staffQ = query(collection(db, 'users'), where('role', 'in', ['project_manager', 'architect', 'engineer', 'surveyor', 'planner', 'financial_analyst', 'admin', 'staff']));
          const snapshot = await getDocs(staffQ);
          const staffList = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as StaffUser[];
          setStaff(staffList);
          
          if (staffList.length > 0 && !selectedStaffMember) {
            // Find a project manager if I'm not one
            if (role !== 'project_manager') {
              // Professionals should see the PM as priority
              const pm = staffList.find(s => s.role === 'project_manager');
              setSelectedStaffMember(pm?.id || staffList[0].id);
            } else {
              // PMs see other staff (architects, etc)
              const firstStaff = staffList.find(s => s.id !== user?.uid);
              setSelectedStaffMember(firstStaff?.id || '');
            }
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
    if (!selectedStaffMember || !user || !selectedProject || !role || role === 'unauthorized') return;

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

      // Handle read status carefully to avoid snapshot loops
      const unreadForMe = conversationMsgs.filter(msg => msg.receiverId === user.uid && !msg.read);
      if (unreadForMe.length > 0) {
        unreadForMe.forEach(msg => {
          updateDoc(doc(db, 'internalMessages', msg.id), { read: true }).catch(() => {});
        });
      }
    });

    return () => unsubscribe();
  }, [selectedStaffMember, user, selectedProject]);

  // Real-time chat subscription
  useEffect(() => {
    if (!selectedChatClient || !user || !role || (role !== 'project_manager' && role !== 'admin')) return;

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
      
      // Mark unread messages directed at staff as read
      const unreadForStaff = msgs.filter(msg => 
        (msg.receiverId === user.uid || msg.receiverId === 'admin') && 
        !msg.read && 
        msg.senderId !== user.uid
      );
      
      if (unreadForStaff.length > 0) {
        unreadForStaff.forEach(msg => {
          updateDoc(doc(db, 'messages', msg.id), { read: true }).catch(() => {});
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });

    return () => unsubscribe();
  }, [selectedChatClient, user, role]);

  useEffect(() => {
    if (!selectedProject) return;
    const q = query(collection(db, 'milestones'), where('clientId', '==', selectedProject));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMilestones(ms);
    }, (error) => {
      console.error("Error fetching milestones:", error);
    });
    return () => unsubscribe();
  }, [selectedProject]);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStaffUser(data);
          
          // Show 2FA confirmation if not yet confirmed and user is approved
          if (data.hasConfirmed2FA === undefined && data.role !== 'unauthorized' && data.role !== 'pending_staff') {
            setShow2FAConfirmation(true);
          }
        }
      });
    }
  }, [user]);

  const confirm2FA = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        hasConfirmed2FA: true
      });
      setStaffUser((prev: any) => ({ ...prev, hasConfirmed2FA: true }));
      setShow2FAConfirmation(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    }
  };

  const updateSiteParams = async (params: any) => {
    if (!selectedProject) return;
    setIsSavingSiteParams(true);
    try {
      await updateDoc(doc(db, 'projects', selectedProject), {
        siteParams: { ...siteParams, ...params },
        updatedAt: serverTimestamp()
      });
      setStatusMessage({ text: "Technical parameters synchronized successfully.", type: 'success' });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, 'projects');
    } finally {
      setIsSavingSiteParams(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'internal' | 'pm') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hard limit of 5MB for selection, but we will compress images to fit Firestore (1MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ text: "File size exceeds 5MB. Please upload a smaller file.", type: 'error' });
      e.target.value = '';
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
                setStatusMessage({ text: "Image is too complex to fit in the database even after compression. Please use a simpler image.", type: 'error' });
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
        // Non-image files (PDFs etc) - strictly capped at 10MB due to Firestore chunking support
        if (f.size > MAX_FILE_SIZE) {
          setStatusMessage({ text: "Documents are currently limited to 10MB per file.", type: 'error' });
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
      e.target.value = '';
    };

    processFile(file);
  };

  const submitInternalLog = async () => {
    if (!internalMessage.trim() || !selectedProject || !user) return;
    setIsSubmitting(true);
    try {
      await uploadLargeFile('internalLogs', {
        projectId: selectedProject,
        staffName: displayName || user.email,
        staffTitle: userTitle || role.replace('_', ' ').toUpperCase(),
        role: role,
        message: internalMessage,
        status: 'pending_review',
        fileName: internalFile?.name || null,
        type: 'log',
        collectionName: 'internalLogs'
      }, internalFile?.url || '');
      
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
      await uploadLargeFile('projectUpdates', {
        clientId: selectedClient,
        title: `Official Update: ${currentProjectName}`,
        description: pmUpdateMessage,
        fileName: pmFile?.name || null,
        status: 'published',
        type: 'update',
        collectionName: 'projectUpdates',
        // In the chunked upload, fileData will be empty, so we just set these flags
        // ClientPortal will need to resolve them
      }, pmFile?.url || '');

      // Mark internal logs as reviewed
      for (const log of internalLogs.filter(l => l.status === 'pending_review')) {
        await updateDoc(doc(db, 'internalLogs', log.id), { status: 'reviewed' });
      }
      setPmUpdateMessage('');
      setPmFile(null);
      setStatusMessage({ text: "Successfully published curated update to Client Portal!", type: 'success' });
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

  if (!AUTHORIZED_STAFF_ROLES.includes(role)) {
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
      case 'architect': return <PenTool className="text-accent mb-4" size={32} />;
      case 'engineer': return <HardHat className="text-accent mb-4" size={32} />;
      case 'surveyor': return <MapPin className="text-accent mb-4" size={32} />;
      case 'planner': return <Layers className="text-accent mb-4" size={32} />;
      case 'financial_analyst': return <PieChart className="text-accent mb-4" size={32} />;
      case 'admin': return <Eye className="text-accent mb-4" size={32} />;
      default: return null;
    }
  };

  const runEngineerSimulation = () => {
    if (!selectedProject) return;
    setIsEngineerSimulating(true);
    setEngineerSimResult(null);
    
    // Check if we have basic params
    const hasParams = siteParams.deadLoadMax || siteParams.liveLoadEst || siteParams.windShear;
    
    setTimeout(() => {
      setIsEngineerSimulating(false);
      if (!hasParams) {
        setEngineerSimResult("Simulation Aborted: Insufficient telemetry. Please define load parameters and site specifics to initialize structural mesh.");
      } else {
        setEngineerSimResult(`Dynamic Analysis Complete for ${currentProjectName}. Parameters Verified: Dead Load @ ${siteParams.deadLoadMax || 'Auto'}, Live Load @ ${siteParams.liveLoadEst || 'Auto'}. Wind Shear Guard: ${siteParams.windShear || 'Nominal'}. MEP integration conflicts identified in Zone B require immediate PM clearance.`);
      }
    }, 2500);
  };

  const runSurveyorSimulation = () => {
    setIsSurveyorSimulating(true);
    setSurveyorSimResult(null);
    setTimeout(() => {
      setIsSurveyorSimulating(false);
      setSurveyorSimResult("Topographical Sync Complete: Vertical datum adjusted to MSL. Site elevations verified within 5mm variance. Spatial data streaming nominal.");
    }, 2000);
  };

  const runPlannerSimulation = () => {
    setIsPlannerSimulating(true);
    setPlannerSimResult(null);
    setTimeout(() => {
      setIsPlannerSimulating(false);
      setPlannerSimResult("Urban Matrix Simulation Complete: Green Space Ratio optimized to 48%. Solar irradiance parameters meet sustainability tier 1 requirements.");
    }, 2000);
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'project_manager': return 'Project Manager Dashboard';
      case 'architect': return 'Architecture Dashboard';
      case 'engineer': return 'Engineering Dashboard';
      case 'surveyor': return 'Surveyor Dashboard';
      case 'planner': return 'Planning Dashboard';
      case 'financial_analyst': return 'Financial Analyst Dashboard';
      case 'admin': return 'Super User Environment';
      default: return 'Staff Dashboard';
    }
  };

  const currentProjectName = selectedProject 
    ? (clients.find(c => c.id === selectedProject)?.officialName || clients.find(c => c.id === selectedProject)?.email || 'Unknown Project')
    : 'System Overview';

  const currentMilestones = milestones.filter(m => m.clientId === selectedProject);
  const activeMilestonesCount = currentMilestones.filter(m => m.status !== 'completed').length;
  const siteLogsCount = internalLogs.filter(l => l.projectId === selectedProject).length;

  const renderDashboardWidgets = () => {
    if (!selectedProject && role !== 'admin') {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center border border-dashed border-steel/20 p-20 bg-charcoal/5 dark:bg-charcoal/40 backdrop-blur-sm">
          <Target className="text-accent mb-8 animate-pulse" size={48} strokeWidth={1} />
          <h2 className="font-display text-4xl font-bold uppercase tracking-tighter text-charcoal dark:text-concrete mb-4">Project Context Required</h2>
          <p className="font-mono text-xs text-steel uppercase tracking-widest mb-10 text-center max-w-md">Please select a strategic project context from the selector in the command header to initialize secure dashboards and tools.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {clients.map(client => (
              <button 
                key={client.id}
                onClick={() => setSelectedProject(client.id)}
                className="p-6 border border-steel/20 hover:border-accent hover:bg-accent/5 transition-all flex flex-col gap-2 group text-left bg-white/40 dark:bg-charcoal/40"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-charcoal dark:text-concrete group-hover:text-accent">
                    {client.officialName || (client.email ? client.email.split('@')[0] : 'Unnamed Client')}
                  </span>
                  <ChevronRight size={14} className="text-steel group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
                <span className="font-mono text-[9px] text-steel uppercase tracking-widest truncate">{client.email}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (role === 'project_manager') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
            <ClipboardList className="text-accent mb-4" size={24} />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Milestone Tracker</h3>
            <p className="font-display text-4xl text-charcoal dark:text-concrete">{activeMilestonesCount}</p>
            <p className="font-mono text-[10px] text-steel mt-4">Active milestones requiring sign-off for <span className="text-accent font-bold">{currentProjectName}</span>.</p>
          </div>
          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
            <HardHat className="text-accent mb-4" size={24} />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Site Operations</h3>
            <p className="font-display text-4xl text-charcoal dark:text-concrete">{siteLogsCount}</p>
            <p className="font-mono text-[10px] text-steel mt-4">Active crews reporting daily logs on site.</p>
          </div>

          <div className="lg:col-span-3">
            {selectedProject ? (
              <div className="p-0 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md">
                <div className="bg-charcoal p-4 text-white font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <FileLineChart size={14} className="text-accent" />
                  Financial Projection & Ledger
                </div>
                <FinancialManager projectId={selectedProject} role={role} />
              </div>
            ) : (
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md text-center">
                 <p className="font-mono text-[10px] text-steel uppercase tracking-widest">Select a context project above to access financial ledgers.</p>
              </div>
            )}
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
            siteParams={siteParams}
            setSiteParams={setSiteParams}
            updateSiteParams={updateSiteParams}
            isSavingSiteParams={isSavingSiteParams}
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
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
          />

          {/* Project Analytics */}
          <ProjectAnalytics logs={internalLogs} />

          {/* Project Management Control Center */}
          <ProjectManagementCenter 
            selectedClient={selectedProject || ''}
            clients={clients}
            onSelectClient={setSelectedProject}
          />

          {/* Internal Team Connectivity */}
          <InternalTeamChat 
            staff={staff}
            user={user}
            role={role}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
          />
        </div>
      );
    }
    
    if (role === 'architect') {
      const bimStatus = siteParams.bimRenderStatus || '0';
      const parsedStatus = parseInt(bimStatus, 10) || 0;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 mb-6 p-10 relative overflow-hidden bg-charcoal dark:bg-charcoal text-concrete border border-steel/20 shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:24px_24px]"></div>
            <h2 className="relative font-display text-3xl mb-3 text-white flex items-center gap-4"><PenTool className="text-accent" /> Architectural Command Nexus</h2>
            <p className="relative font-mono text-[10px] text-steel uppercase tracking-widest bg-accent text-white px-2 py-1 inline-block">CLIENT VISIBILITY RESTRICTED</p>
            <p className="relative font-mono text-xs mt-6 max-w-2xl text-concrete/70 leading-relaxed border-l-2 border-accent pl-4">
              Authorized access only. Submit schematics, structural drafts, and material logs. Synchronize closely with engineering loads and await PM greenlight before client-facing release.
            </p>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-2 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <Layers className="text-accent mb-6" size={28} strokeWidth={1} />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-6">Schematic & CAD Drafting Pipeline</h3>
            <div className="space-y-3">
              <div className="p-8 border border-dashed border-steel/20 text-center">
                <p className="font-mono text-[10px] text-steel uppercase tracking-widest">No CAD files initialized for this project.</p>
              </div>
            </div>
            <label className="mt-8 text-[10px] font-mono bg-accent/10 text-accent uppercase tracking-widest font-bold border border-accent/30 hover:bg-accent hover:text-white px-4 py-2 transition-all cursor-pointer inline-block text-center">
              Initiate New CAD Upload
              <input type="file" className="hidden" accept="image/*,application/pdf,.dwg,.cad" onChange={(e) => handleFileUpload(e, 'internal')} />
            </label>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md shadow-sm flex flex-col justify-between">
            <div>
              <Box className="text-accent mb-6" size={28} strokeWidth={1} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">BIM / 3D Visualization Sync</h3>
              <div className="w-full bg-steel/10 h-1.5 mb-2 overflow-hidden rounded-none">
                <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${parsedStatus}%` }}></div>
              </div>
              <div className="flex justify-between items-center mb-6">
                 <span className="font-mono text-[9px] text-steel uppercase tracking-widest">Render Node Status (%)</span>
                 <input 
                   type="number"
                   min="0"
                   max="100"
                   value={bimStatus}
                   onChange={(e) => setSiteParams({ ...siteParams, bimRenderStatus: e.target.value })}
                   onBlur={() => updateSiteParams({ bimRenderStatus: siteParams.bimRenderStatus })}
                   className="w-16 bg-transparent border-b border-steel/20 focus:border-accent py-1 font-mono text-xs text-accent font-bold text-right outline-none"
                 />
              </div>
            </div>
            <div className="border-t border-steel/10 pt-4">
              <p className="font-mono text-[10px] leading-relaxed text-charcoal dark:text-concrete/80 flex items-start gap-2">
                <span className={`h-2 w-2 mt-1 rounded-full flex-shrink-0 ${parsedStatus > 0 ? 'bg-green-500 animate-pulse' : 'bg-steel/30'}`}></span>
                {parsedStatus > 0 
                  ? "Processing high-fidelity global illumination array on the main atrium view. Awaiting geometry cache lock." 
                  : "Awaiting initial schematic uploads to initialize BIM synchronization pipeline."}
              </p>
            </div>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex-1">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-2 flex items-center gap-3"><Trees size={16} className="text-accent"/> Material Submittals & Finishes Log</h3>
              <p className="font-mono text-[10px] text-steel max-w-lg">Propose material specs, swatches, and fixture catalogues for final client approval via Project Manager routing.</p>
            </div>
            <div className="flex gap-4">
              <label className="w-16 h-16 rounded-md border border-dashed border-steel/50 flex flex-col items-center justify-center text-steel cursor-pointer hover:text-accent hover:border-accent hover:bg-accent/5 transition-all">
                <span className="text-2xl font-light mb-1">+</span>
                <span className="text-[8px] font-mono uppercase tracking-widest">Add Spec</span>
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'internal')} />
              </label>
            </div>
          </div>

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

          <ProjectAnalytics logs={internalLogs} />

          <InternalTeamChat 
            staff={staff}
            user={user}
            role={role}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
          />
        </div>
      );
    }

    if (role === 'engineer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 mb-6 p-10 relative overflow-hidden bg-[#1a1a24] text-concrete border border-red-900 shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(239,68,68,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.15)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
            <h2 className="relative font-display text-3xl mb-3 text-white flex items-center gap-4"><HardHat className="text-red-500" /> Engineering Control Operations</h2>
            <p className="relative font-mono text-[10px] text-red-300 uppercase tracking-widest bg-red-900/50 px-2 py-1 inline-block border border-red-500/30">CLIENT VISIBILITY RESTRICTED</p>
            <p className="relative font-mono text-xs mt-6 max-w-2xl text-concrete/70 leading-relaxed border-l-2 border-red-500 pl-4">
              Structural analysis, load testing, and MEP integration hub. Validate architectural schematics against mechanical realities and enforce code compliance parameters.
            </p>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-1 shadow-sm flex flex-col justify-between">
            <div>
              <Activity className="text-red-500 mb-6" size={28} strokeWidth={1} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Structural Load Models</h3>
              <div className="space-y-5">
                 {[
                   { label: 'Dead Load Max', key: 'deadLoadMax', icon: <Box size={14} /> },
                   { label: 'Live Load Est.', key: 'liveLoadEst', icon: <ArrowUp size={14} /> },
                   { label: 'Wind Shear Index', key: 'windShear', icon: <Wind size={14} /> }
                 ].map(item => (
                   <div key={item.key} className="group">
                     <label className="flex items-center gap-2 font-mono text-[9px] text-steel uppercase tracking-widest mb-1 group-focus-within:text-red-500 transition-colors">
                       {item.icon} {item.label}
                     </label>
                     <input 
                       type="text"
                       value={siteParams[item.key] || ''}
                       onChange={(e) => setSiteParams({ ...siteParams, [item.key]: e.target.value })}
                       onBlur={() => updateSiteParams({ [item.key]: siteParams[item.key] })}
                       className="w-full bg-transparent border-b border-steel/20 focus:border-red-500 py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none transition-all placeholder:text-steel/30"
                       placeholder="Not specified..."
                     />
                   </div>
                 ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-steel/10">
              <button 
                onClick={runEngineerSimulation}
                disabled={isEngineerSimulating}
                className="w-full text-center text-[9px] font-mono text-red-500 uppercase tracking-widest font-bold border border-red-500/30 hover:bg-red-500 hover:text-white py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEngineerSimulating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Calibrating Mesh...
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} /> Run Simulation Matrix
                  </>
                )}
              </button>
            </div>
            {engineerSimResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-red-500/5 border border-red-500/20 text-[10px] font-mono text-red-500 leading-relaxed"
              >
                {engineerSimResult}
              </motion.div>
            )}
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-2 shadow-sm flex flex-col justify-between">
            <div>
              <Shield className="text-red-500 mb-6" size={28} strokeWidth={1} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">MEP Integration & Code Compliance</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: 'Ground Water Level', key: 'groundWater' },
                  { label: 'Soil Bearing Capacity', key: 'soilBearing' },
                  { label: 'Seismic Zone Class', key: 'seismicZone' },
                  { label: 'Site Boundary Offset', key: 'siteBoundary' }
                ].map(item => (
                   <div key={item.key}>
                     <label className="block font-mono text-[9px] text-steel uppercase tracking-widest mb-1">{item.label}</label>
                     <input 
                       type="text"
                       value={siteParams[item.key] || ''}
                       onChange={(e) => setSiteParams({ ...siteParams, [item.key]: e.target.value })}
                       onBlur={() => updateSiteParams({ [item.key]: siteParams[item.key] })}
                       className="w-full bg-transparent border-b border-steel/20 focus:border-red-500 py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none transition-all"
                       placeholder="Pending input"
                     />
                   </div>
                ))}
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-steel/10 text-steel uppercase tracking-widest">
                      <th className="pb-3 text-[9px]">System ID</th>
                      <th className="pb-3 text-[9px]">Discipline</th>
                      <th className="pb-3 text-[9px]">Validation</th>
                      <th className="pb-3 text-[9px] text-right">Clearance</th>
                    </tr>
                  </thead>
                  <tbody className="text-charcoal dark:text-concrete">
                    <tr className="border-b border-steel/5">
                      <td className="py-3 font-bold">MECH-HVAC-01</td>
                      <td className="py-3">Mechanical</td>
                      <td className="py-3">
                        <span className="text-[8px] border border-green-500/30 text-green-500 px-2 py-0.5 uppercase">Accepted</span>
                      </td>
                      <td className="py-3 text-right text-steel">L2 Profile</td>
                    </tr>
                    <tr className="border-b border-steel/5">
                      <td className="py-3 font-bold">ELEC-MAIN-04</td>
                      <td className="py-3">Electrical</td>
                      <td className="py-3">
                        <span className="text-[8px] border border-accent/30 text-accent px-2 py-0.5 uppercase">Pending</span>
                      </td>
                      <td className="py-3 text-right text-steel">H1 Clearance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
               <p className="font-mono text-[8px] text-steel uppercase tracking-widest italic">All technical parameters are synchronized with civil engineering databases.</p>
            </div>
          </div>
          
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

          <ProjectAnalytics logs={internalLogs} />

          <InternalTeamChat 
            staff={staff}
            user={user}
            role={role}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
          />
        </div>
      );
    }
    
    if (role === 'surveyor') {
      const topSync = siteParams.topographicalSync || '0';
      const zoneComp = siteParams.zoningCompliance || '0';
      const droneStatus = siteParams.droneAlphaStatus || 'Inactive';
      const groundStatus = siteParams.groundStationStatus || 'Calibrating';
      const circum = 2 * Math.PI * 28;
      const zoneCompPct = Math.min(100, Math.max(0, parseInt(zoneComp) || 0));

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 mb-6 p-10 relative overflow-hidden bg-[#1A2622] text-[#EAE6D7] border border-steel/20 shadow-2xl">
            <div className="absolute right-0 top-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] w-full h-full"></div>
            <h2 className="relative font-display text-3xl mb-3 text-[#EAE6D7] flex items-center gap-4"><Map className="text-accent" /> Spatial Analysis Nexus</h2>
            <p className="relative font-mono text-[10px] uppercase tracking-widest bg-accent text-white px-2 py-1 inline-block shadow-md">CLIENT VISIBILITY RESTRICTED</p>
            <p className="relative font-mono text-xs mt-6 max-w-2xl text-[#EAE6D7]/70 leading-relaxed">
              Record topographical deviations, log spatial data, and track zoning compliance. All field measurements must be escalated to the Project Manager prior to client issuance.
            </p>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md shadow-sm">
            <Map className="text-accent mb-6" size={28} strokeWidth={1} />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Topographical Sync (ms)</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={topSync}
                onChange={(e) => setSiteParams({ ...siteParams, topographicalSync: e.target.value })}
                onBlur={() => updateSiteParams({ topographicalSync: siteParams.topographicalSync })}
                className="font-display text-4xl text-charcoal dark:text-concrete bg-transparent border-b border-steel/20 focus:border-accent outline-none w-24"
              />
              <span className="text-lg text-steel">ms</span>
            </div>
            <p className="font-mono text-[10px] text-steel mt-4 leading-relaxed">Latency to central GIS repository. Data streaming nominal.</p>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md shadow-sm">
            <Trees className="text-accent mb-6" size={28} strokeWidth={1} />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Municipal Zoning (%)</h3>
            <div className="flex items-center gap-4 mt-6">
              <div className="relative w-16 h-16 rounded-full border-4 border-steel/10 flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-accent">{zoneCompPct}%</span>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="30" cy="30" r="28" fill="none" strokeWidth="4" className="stroke-accent transition-all duration-1000" strokeDasharray={circum} strokeDashoffset={circum - (zoneCompPct / 100) * circum} />
                </svg>
              </div>
              <div className="flex-1">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={zoneComp}
                  onChange={(e) => setSiteParams({ ...siteParams, zoningCompliance: e.target.value })}
                  onBlur={() => updateSiteParams({ zoningCompliance: siteParams.zoningCompliance })}
                  className="w-full bg-transparent border-b border-steel/20 focus:border-accent py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none"
                  placeholder="Compliance %..."
                />
              </div>
            </div>
            <button 
              onClick={runSurveyorSimulation}
              disabled={isSurveyorSimulating}
              className="mt-6 w-full text-center text-[9px] font-mono text-accent uppercase tracking-widest font-bold border border-accent/30 hover:bg-accent hover:text-white py-2 transition-colors disabled:opacity-50"
            >
              {isSurveyorSimulating ? 'Calibrating...' : 'Re-verify Zoning Map'}
            </button>
            {surveyorSimResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-accent/5 border border-accent/20 text-[9px] font-mono text-accent">
                {surveyorSimResult}
              </motion.div>
            )}
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-1 shadow-sm flex flex-col justify-between">
            <div>
              <Activity className="text-accent mb-6" size={28} strokeWidth={1} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Sensor Uplink</h3>
              <div className="space-y-4">
                 <div>
                   <label className="font-mono text-[9px] text-steel uppercase tracking-widest block mb-1">Drone Unit Alpha</label>
                   <input 
                     type="text"
                     value={droneStatus}
                     onChange={(e) => setSiteParams({ ...siteParams, droneAlphaStatus: e.target.value })}
                     onBlur={() => updateSiteParams({ droneAlphaStatus: siteParams.droneAlphaStatus })}
                     className="w-full bg-transparent border-b border-steel/20 focus:border-accent py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none"
                   />
                 </div>
                 <div>
                   <label className="font-mono text-[9px] text-steel uppercase tracking-widest block mb-1">Ground Station C</label>
                   <input 
                     type="text"
                     value={groundStatus}
                     onChange={(e) => setSiteParams({ ...siteParams, groundStationStatus: e.target.value })}
                     onBlur={() => updateSiteParams({ groundStationStatus: siteParams.groundStationStatus })}
                     className="w-full bg-transparent border-b border-steel/20 focus:border-accent py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none"
                   />
                 </div>
              </div>
            </div>
          </div>
          
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
            role={role}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
          />
        </div>
      );
    }

    if (role === 'planner') {
      const greenRatio = siteParams.greenSpaceRatio || '0';
      const solarIrr = siteParams.solarIrradiance || 'None';
      const permTarget = siteParams.permeabilityTarget || 'Pending';

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 mb-6 p-10 relative overflow-hidden bg-gradient-to-br from-green-900/90 to-charcoal text-concrete border border-green-500/20 shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#22c55e_1px,transparent_1px),linear-gradient(-45deg,#22c55e_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            <h2 className="relative font-display text-3xl mb-3 text-white flex items-center gap-4"><Map className="text-green-500" /> Urban Planning Nexus</h2>
            <p className="relative font-mono text-[10px] text-green-300 uppercase tracking-widest bg-green-500/20 px-2 py-1 inline-block border border-green-500/30">CLIENT VISIBILITY RESTRICTED</p>
          </div>

          {/* Master Plan Overlay Module */}
          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-2 shadow-sm flex flex-col justify-between">
            <div>
              <Layers className="text-green-500 mb-6" size={28} strokeWidth={1} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Master Plan Overlay</h3>
              <div className="h-48 w-full bg-steel/5 border border-steel/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-full h-[1px] bg-green-500/20 top-1/2"></div>
                <div className="absolute h-full w-[1px] bg-green-500/20 left-1/2"></div>
                <MapPin className="text-green-500 absolute top-1/4 left-1/3 animate-pulse" size={16} />
                <MapPin className="text-accent absolute bottom-1/3 right-1/4 animate-pulse opacity-50" size={16} />
                <p className="font-mono text-[10px] text-steel uppercase tracking-widest">Awaiting GIS Data Sync</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-steel/10">
              <p className="font-mono text-[9px] text-charcoal dark:text-concrete uppercase tracking-widest leading-relaxed">Zoning constraints locked to municipal API feed.</p>
            </div>
          </div>

          <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-1 shadow-sm flex flex-col justify-between">
            <div>
              <Globe className="text-green-500 mb-6" size={28} strokeWidth={1} />
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Environmental Impact</h3>
              <div className="space-y-4">
                 <div>
                   <label className="font-mono text-[9px] text-steel uppercase tracking-widest block mb-1 flex justify-between">
                     <span>Green Space Ratio (%)</span>
                   </label>
                   <input 
                     type="number"
                     min="0"
                     max="100"
                     value={greenRatio}
                     onChange={(e) => setSiteParams({ ...siteParams, greenSpaceRatio: e.target.value })}
                     onBlur={() => updateSiteParams({ greenSpaceRatio: siteParams.greenSpaceRatio })}
                     className="w-full bg-transparent border-b border-steel/20 focus:border-green-500 py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none text-green-500"
                   />
                 </div>
                 <div>
                   <label className="font-mono text-[9px] text-steel uppercase tracking-widest block mb-1 flex justify-between">
                     <span>Solar Irradiance</span>
                   </label>
                   <input 
                     type="text"
                     value={solarIrr}
                     onChange={(e) => setSiteParams({ ...siteParams, solarIrradiance: e.target.value })}
                     onBlur={() => updateSiteParams({ solarIrradiance: siteParams.solarIrradiance })}
                     className="w-full bg-transparent border-b border-steel/20 focus:border-green-500 py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none"
                   />
                 </div>
                 <div>
                   <label className="font-mono text-[9px] text-steel uppercase tracking-widest block mb-1 flex justify-between">
                     <span>Permeability Target</span>
                   </label>
                   <input 
                     type="text"
                     value={permTarget}
                     onChange={(e) => setSiteParams({ ...siteParams, permeabilityTarget: e.target.value })}
                     onBlur={() => updateSiteParams({ permeabilityTarget: siteParams.permeabilityTarget })}
                     className="w-full bg-transparent border-b border-steel/20 focus:border-green-500 py-1 font-mono text-xs text-charcoal dark:text-concrete outline-none"
                   />
                 </div>
              </div>
            </div>
            <button 
              onClick={runPlannerSimulation}
              disabled={isPlannerSimulating}
              className="mt-6 w-full text-center text-[9px] font-mono text-green-500 uppercase tracking-widest font-bold border border-green-500/30 hover:bg-green-500 hover:text-white py-2 transition-colors disabled:opacity-50"
            >
              {isPlannerSimulating ? 'Simulating...' : 'Run Environmental Analysis'}
            </button>
            {plannerSimResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-green-500/5 border border-green-500/20 text-[9px] font-mono text-green-500">
                {plannerSimResult}
              </motion.div>
            )}
          </div>
          
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

          <ProjectAnalytics logs={internalLogs} />

          <InternalTeamChat 
            staff={staff}
            user={user}
            role={role}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
          />
        </div>
      );
    }

    if (role === 'financial_analyst') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 mb-6 p-10 relative overflow-hidden bg-charcoal text-concrete border border-blue-900 shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
            <h2 className="relative font-display text-3xl mb-3 text-white flex items-center gap-4"><PieChart className="text-blue-500" /> Financial Analysis Nexus</h2>
            <p className="relative font-mono text-[10px] text-blue-300 uppercase tracking-widest bg-blue-900/50 px-2 py-1 inline-block border border-blue-500/30">CLIENT VISIBILITY RESTRICTED</p>
          </div>

          <div className="lg:col-span-3">
            {selectedProject ? (
               <FinancialManager projectId={selectedProject} role={role} />
            ) : (
              <div className="p-8 border border-steel/20 dark:border-concrete/10 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md shadow-sm text-center">
                <p className="font-mono text-[10px] text-steel uppercase tracking-widest">Select a context project above to access financial ledgers.</p>
              </div>
            )}
          </div>
          
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

          <ProjectAnalytics logs={internalLogs} />

          <InternalTeamChat 
            staff={staff}
            user={user}
            role={role}
            projectId={selectedProject}
            selectedStaffMember={selectedStaffMember}
            setSelectedStaffMember={setSelectedStaffMember}
            teamMessages={teamMessages}
            teamReply={teamReply}
            setTeamReply={setTeamReply}
            sendTeamChat={sendTeamChat}
            isSendingTeamChat={isSendingTeamChat}
            staffFilter={staffFilter}
            setStaffFilter={setStaffFilter}
          />
        </div>
      );
    }

    // Admin or fallback
    return (
      <div className="space-y-12">
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
          </div>
        </div>

        {role === 'admin' && (
          <ProjectManagementCenter 
            selectedClient={selectedProject || selectedChatClient}
            clients={clients}
          />
        )}
      </div>
    );
  };

  if (role === 'unauthorized' || role === 'pending_staff') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-concrete dark:bg-charcoal p-6 text-center transition-colors duration-500">
        <div className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 rounded-none border border-concrete/30 flex items-center justify-center bg-charcoal shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-500">
              <Clock size={20} className="text-concrete" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight mb-4 text-concrete">Credentials Pending</h1>
          <p className="text-concrete/70 font-light leading-relaxed mb-8">
            Access to the staff nexus is restricted to verified professionals. Your credentials are currently awaiting administrative validation. Access is granted only once an administrator approves your profile.
          </p>
          <Magnetic className="w-full">
            <button 
              onClick={() => signOut(auth).then(() => navigate('/staff-login'))}
              className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 text-xs"
            >
              <LogOut size={16} />
              Return to Logistics
            </button>
          </Magnetic>
        </div>
      </div>
    );
  }

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
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete">
                    {client.officialName || client.email.split('@')[0]}
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

      {/* Global Status Notification */}
      <AnimatePresence>
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 10 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed bottom-10 right-10 z-[200] p-5 shadow-2xl border-l-4 font-mono text-[10px] uppercase tracking-widest flex items-center gap-4 backdrop-blur-xl ${statusMessage.type === 'error' ? 'bg-red-500/90 text-white border-l-red-900' : 'bg-accent/90 text-white border-l-white'}`}
          >
            {statusMessage.type === 'error' ? <X size={16} /> : <Check size={16} />}
            {statusMessage.text}
            <button onClick={() => setStatusMessage({ text: '', type: null })} className="ml-4 opacity-50 hover:opacity-100">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative w-32 h-32 bg-charcoal/10 dark:bg-concrete/10 rounded-full overflow-hidden border-2 border-accent group shadow-inner">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-steel font-mono text-[10px] uppercase text-center p-4">Identity Not Uploaded</div>
                  )}
                  <label className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer">
                    <Upload size={20} className="text-white mb-2" />
                    <span className="text-white font-mono text-[8px] uppercase tracking-widest font-bold">Upload Matrix</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          setStatusMessage({ text: "Profile picture must be under 5MB.", type: 'error' });
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
                            setProfilePhoto(compressedBase64);
                          };
                          img.src = result;
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }} 
                    />
                  </label>
                </div>
                <p className="font-mono text-[8px] text-steel uppercase tracking-[0.3em] font-bold">Biometric Authentication Node</p>
              </div>

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
                      title: userTitle.trim(),
                      photoUrl: profilePhoto
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

      {/* 2FA Confirmation Modal */}
      {show2FAConfirmation && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-charcoal/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-concrete dark:bg-charcoal max-w-lg w-full p-10 shadow-2xl border border-accent/20 relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Shield size={32} strokeWidth={1.5} />
              </div>
            </div>
            
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete text-center mb-6">
              Security Protocol 02
            </h2>
            
            <div className="space-y-6 mb-10">
              <p className="font-mono text-xs text-charcoal/80 dark:text-concrete/70 leading-relaxed text-center uppercase tracking-widest">
                Our security directive requires all staff members to enable Two-Factor Authentication (2FA) on their identity provider accounts.
              </p>
              
              <div className="p-6 bg-accent/5 border border-accent/10 space-y-4">
                <h3 className="font-mono text-[10px] uppercase font-bold text-accent tracking-widest">Verification Steps:</h3>
                <ul className="space-y-2 font-mono text-[9px] text-steel uppercase tracking-widest leading-loose">
                  <li className="flex items-start gap-3">
                    <span className="text-accent">01.</span> Access your Google Account settings from your primary device.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">02.</span> Navigate to "Security" and ensure "2-Step Verification" is active.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent">03.</span> Confirm the setting below to acknowledge compliance with this security policy.
                  </li>
                </ul>
              </div>
            </div>

            <button 
              onClick={confirm2FA}
              className="w-full py-5 bg-accent text-white font-mono text-xs uppercase font-bold tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-accent/20"
            >
              I have verified 2FA Activation
            </button>
            <p className="mt-6 font-mono text-[8px] text-center text-steel uppercase tracking-widest opacity-50">
              Failure to maintain active 2FA may result in revocation of administrative privileges.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
