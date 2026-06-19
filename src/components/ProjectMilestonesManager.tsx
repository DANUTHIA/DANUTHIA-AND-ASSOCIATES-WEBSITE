import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Check, Edit2, Trash2, Plus, Flag, MoreVertical, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Milestone {
  id: string;
  clientId: string;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  order: number;
  description?: string;
}

export default function ProjectMilestonesManager({ clientId, role }: { clientId: string, role: string | null }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState<'completed' | 'in-progress' | 'pending'>('pending');

  const canEdit = role === 'admin' || role === 'project_manager' || role === 'architect';

  useEffect(() => {
    if (!clientId) {
      setMilestones([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'milestones'), where('clientId', '==', clientId), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Milestone);
      setMilestones(ms);
      setLoading(false);
    }, error => handleFirestoreError(error, OperationType.LIST, 'milestones'));

    return () => unsubscribe();
  }, [clientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      await addDoc(collection(db, 'milestones'), {
        clientId,
        title: newTitle,
        date: newDate,
        status: newStatus,
        order: milestones.length,
        createdAt: serverTimestamp()
      });
      setNewTitle('');
      setNewDate('');
      setNewStatus('pending');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'milestones');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Milestone>) => {
    if (!canEdit) return;
    try {
      await updateDoc(doc(db, 'milestones', id), updates);
      setIsEditing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'milestones');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;
    try {
      await deleteDoc(doc(db, 'milestones', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'milestones');
    }
  };

  return (
    <div className="bg-white/50 dark:bg-charcoal/50 border border-steel/20 dark:border-concrete/10 p-6 md:p-8 mt-8">
      <div className="flex items-center gap-3 mb-8">
        <MapPin className="text-accent" size={24} />
        <h3 className="font-mono text-xs uppercase tracking-widest text-steel font-bold">Roadmap Milestones</h3>
      </div>

      <div className="space-y-4 mb-8">
        {loading ? (
          <p className="text-xs font-mono text-steel">Loading milestones...</p>
        ) : milestones.length === 0 ? (
          <p className="text-xs font-mono text-steel">No milestones defined for this project.</p>
        ) : (
          milestones.map((m, idx) => (
            <div key={m.id} className="group relative flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-charcoal p-4 border border-steel/10 dark:border-concrete/5 transition-colors">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  m.status === 'completed' ? 'border-accent text-accent bg-accent/10' :
                  m.status === 'in-progress' ? 'border-charcoal dark:border-concrete border-dashed animate-pulse text-charcoal dark:text-concrete' :
                  'border-steel/30 text-steel'
                }`}>
                  {m.status === 'completed' ? <Check size={14} strokeWidth={3} /> : <div className="text-[10px] font-bold">{idx + 1}</div>}
                </div>
                
                {isEditing === m.id ? (
                  <div className="flex-1 flex flex-col md:flex-row gap-2 w-full">
                    <input 
                      type="text" 
                      defaultValue={m.title}
                      onBlur={(e) => handleUpdate(m.id, { title: e.target.value })}
                      className="flex-1 bg-transparent border-b border-steel/30 focus:border-accent text-xs font-mono text-charcoal dark:text-concrete outline-none"
                    />
                    <input 
                      type="text" 
                      defaultValue={m.date}
                      placeholder="Date (e.g., Q3 2024)"
                      onBlur={(e) => handleUpdate(m.id, { date: e.target.value })}
                      className="w-32 bg-transparent border-b border-steel/30 focus:border-accent text-xs font-mono text-charcoal dark:text-concrete outline-none"
                    />
                    <select
                      defaultValue={m.status}
                      onChange={(e) => handleUpdate(m.id, { status: e.target.value as any })}
                      className="bg-transparent border-b border-steel/30 focus:border-accent text-xs font-mono text-charcoal dark:text-concrete outline-none appearance-none"
                    >
                      <option value="pending" className="text-charcoal bg-concrete">Pending</option>
                      <option value="in-progress" className="text-charcoal bg-concrete">In Progress</option>
                      <option value="completed" className="text-charcoal bg-concrete">Completed</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex-1">
                    <h4 className="text-xs font-bold font-mono text-charcoal dark:text-concrete uppercase tracking-widest">{m.title}</h4>
                    <p className="text-[10px] font-mono text-steel">{m.date || 'TBD'}</p>
                  </div>
                )}
              </div>

              {canEdit && isEditing !== m.id && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdate(m.id, { status: e.target.value as any })}
                    className="text-[10px] uppercase font-mono bg-charcoal/5 dark:bg-concrete/10 border-none p-1 cursor-pointer outline-none mr-2 text-charcoal dark:text-concrete"
                  >
                     <option value="pending" className="text-charcoal bg-white">Pending</option>
                     <option value="in-progress" className="text-charcoal bg-white">In Progress</option>
                     <option value="completed" className="text-charcoal bg-white">Completed</option>
                  </select>
                  <button onClick={() => setIsEditing(m.id)} className="p-1.5 text-steel hover:text-accent transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-steel hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {canEdit && (
        <form onSubmit={handleAdd} className="bg-charcoal/5 dark:bg-concrete/5 border border-steel/10 p-4 pt-6">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-steel mb-4">Add New Milestone</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              required
              type="text" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Milestone Title"
              className="flex-1 bg-transparent border-b border-steel/20 focus:border-accent p-2 text-xs text-charcoal dark:text-concrete outline-none"
            />
            <input 
              type="text" 
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              placeholder="Target Date/Quarter"
              className="w-full md:w-48 bg-transparent border-b border-steel/20 focus:border-accent p-2 text-xs text-charcoal dark:text-concrete outline-none"
            />
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as any)}
              className="w-full md:w-32 bg-transparent border-b border-steel/20 focus:border-accent p-2 text-xs text-charcoal dark:text-concrete outline-none appearance-none"
            >
              <option value="pending" className="text-charcoal bg-concrete">Pending</option>
              <option value="in-progress" className="text-charcoal bg-concrete">In Progress</option>
              <option value="completed" className="text-charcoal bg-concrete">Completed</option>
            </select>
            <button 
              type="submit"
              className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
