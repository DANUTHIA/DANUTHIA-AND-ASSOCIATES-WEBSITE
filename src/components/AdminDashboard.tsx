import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Check, X, Shield, User, Clock } from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  role: string;
  officialName?: string;
  assignedPM?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClientUser[];
      setUsers(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleAssignPM = async (userId: string, pmId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { assignedPM: pmId });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'users');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-steel font-mono text-xs uppercase tracking-widest flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      Syncing Intelligence...
    </div>;
  }

  const pendingUsers = users.filter(u => u.role === 'pending' || !u.role);
  const clients = users.filter(u => u.role === 'client');
  const staff = users.filter(u => u.role && ['project_manager', 'architect', 'surveyor', 'planner', 'financial_analyst', 'engineer', 'staff'].includes(u.role));
  const projectManagers = users.filter(u => u.role === 'project_manager');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-16">
      {/* Pending Approvals */}
      <section>
        <div className="flex justify-between items-center mb-8 border-b border-steel/10 pb-4">
          <h2 className="font-display text-4xl font-light tracking-tight flex items-center gap-4">
            <Clock className="text-accent" size={32} strokeWidth={1} />
            Access Approvals
          </h2>
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-4 py-1 font-bold uppercase tracking-widest">
            {pendingUsers.length} Requested
          </span>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="p-12 border border-dashed border-steel/20 text-center">
            <p className="text-steel font-mono text-[10px] uppercase tracking-widest font-bold">No pending intelligence requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {pendingUsers.map(user => (
              <div key={user.id} className="border border-steel/20 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-charcoal/5 dark:bg-concrete/5 transition-all hover:border-accent/40 group">
                <div>
                  <h3 className="font-bold text-sm mb-1">{user.email}</h3>
                  <p className="text-[10px] font-mono text-steel uppercase tracking-widest">{user.officialName || "Awaiting Identification"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleUpdateRole(user.id, 'client')}
                    className="px-4 py-2 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal hover:bg-accent dark:hover:bg-accent hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg"
                  >
                    Client
                  </button>
                  <button 
                    onClick={() => handleUpdateRole(user.id, 'project_manager')}
                    className="px-4 py-2 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    PM
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Role Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Active Clients */}
          <section>
            <h3 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
              <User className="text-accent" size={24} strokeWidth={1.5} />
              Active Project Stakeholders
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-steel/10 text-[10px] font-mono text-steel uppercase tracking-widest font-bold">
                    <th className="pb-4">Email / ID</th>
                    <th className="pb-4">Assigned PM</th>
                    <th className="pb-4 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel/5">
                  {clients.map(user => (
                    <tr key={user.id} className="group hover:bg-concrete/30 dark:hover:bg-charcoal/30">
                      <td className="py-4">
                        <p className="text-xs font-bold">{user.email}</p>
                        <p className="text-[9px] font-mono text-steel uppercase tracking-tighter opacity-70 italic">{user.id}</p>
                      </td>
                      <td className="py-4">
                        <select 
                          className="bg-transparent border border-steel/20 p-2 text-[10px] font-mono uppercase tracking-widest focus:border-accent outline-none w-full"
                          value={user.assignedPM || ''}
                          onChange={(e) => handleAssignPM(user.id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {projectManagers.map(pm => (
                            <option key={pm.id} value={pm.id}>{pm.officialName || pm.email}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 text-right">
                        <select 
                          className="bg-transparent border border-steel/20 p-2 text-[10px] font-mono uppercase tracking-widest focus:border-accent outline-none"
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        >
                          <option value="client">Client</option>
                          <option value="pending">Revoke Access</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="architect">Architect</option>
                          <option value="surveyor">Surveyor</option>
                          <option value="planner">Planner</option>
                          <option value="engineer">Engineer</option>
                          <option value="financial_analyst">Financial Analyst</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          {/* Internal Staff */}
          <section className="bg-charcoal dark:bg-charcoal text-concrete p-8 transition-colors duration-500">
            <h3 className="font-display text-xl font-light mb-6 flex items-center gap-3">
              <Shield className="text-accent" size={20} strokeWidth={1.5} />
              Internal Intelligence Network
            </h3>
            <div className="space-y-6">
              {staff.map(user => (
                <div key={user.id} className="pb-6 border-b border-steel/10 last:border-0">
                  <p className="text-xs font-bold mb-1">{user.email}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold italic">{user.role.replace('_', ' ')}</span>
                    <button 
                      onClick={() => handleUpdateRole(user.id, 'client')}
                      className="text-[9px] text-steel hover:text-accent font-bold uppercase tracking-widest transition-colors underline"
                    >
                      Demote to Client
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
