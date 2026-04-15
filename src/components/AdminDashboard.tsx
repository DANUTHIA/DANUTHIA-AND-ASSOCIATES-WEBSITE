import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Check, X, Shield, User, Clock } from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  role: string;
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

  const handleApprove = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'client' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'pending' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'users');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-steel font-mono text-xs uppercase tracking-widest">Loading users...</div>;
  }

  const pendingUsers = users.filter(u => u.role === 'pending');
  const approvedClients = users.filter(u => u.role === 'client');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
          <Clock className="text-accent" size={24} />
          Pending Approvals ({pendingUsers.length})
        </h2>
        {pendingUsers.length === 0 ? (
          <p className="text-steel font-mono text-xs uppercase tracking-widest">No pending users.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map(user => (
              <div key={user.id} className="border border-steel/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal/5 dark:bg-concrete/5">
                <div>
                  <p className="font-bold text-sm">{user.email}</p>
                  <p className="text-[10px] font-mono text-steel uppercase tracking-widest mt-1">ID: {user.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApprove(user.id)}
                    className="p-2 bg-accent text-concrete hover:bg-accent/80 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-concrete transition-colors"
                    title="Delete User"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
          <User className="text-accent" size={24} />
          Approved Clients ({approvedClients.length})
        </h2>
        {approvedClients.length === 0 ? (
          <p className="text-steel font-mono text-xs uppercase tracking-widest">No approved clients.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedClients.map(user => (
              <div key={user.id} className="border border-steel/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm">{user.email}</p>
                  <p className="text-[10px] font-mono text-steel uppercase tracking-widest mt-1">ID: {user.id}</p>
                </div>
                <button 
                  onClick={() => handleRevoke(user.id)}
                  className="px-4 py-2 border border-steel/30 text-steel hover:border-accent hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
          <Shield className="text-accent" size={24} />
          Administrators ({admins.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map(user => (
            <div key={user.id} className="border border-accent/30 p-6 bg-accent/5">
              <p className="font-bold text-sm">{user.email}</p>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest mt-1">Administrator</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
