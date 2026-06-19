import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Check, Edit2, Shield, UserPlus, Users, Briefcase } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  officialName?: string;
  role: string;
  title?: string;
  assignedPM?: string;
  assignedStaff?: string[];
}

export default function AdminTeamManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as UserData));
      setUsers(allUsers);
      setLoading(false);
    }, error => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, []);

  const pendingStaff = users.filter(u => u.role === 'pending_staff');
  const staff = users.filter(u => ['project_manager', 'architect', 'engineer', 'surveyor', 'planner', 'financial_analyst', 'admin', 'staff'].includes(u.role));
  const clients = users.filter(u => u.role === 'client');

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
  };

  const updateStaffAssignment = async (clientId: string, staffList: string[], pmId?: string) => {
    try {
      const data: any = { assignedStaff: staffList };
      if (pmId !== undefined) {
        data.assignedPM = pmId;
      }
      await updateDoc(doc(db, 'users', clientId), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
  };

  if (loading) {
    return <div className="p-8 text-steel text-xs font-mono">Loading team data...</div>;
  }

  return (
    <div className="bg-white/50 dark:bg-charcoal/50 border border-steel/20 dark:border-concrete/10 p-6 md:p-8 mt-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-accent" size={24} />
        <h3 className="font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete font-bold">Team Management Console</h3>
      </div>

      {pendingStaff.length > 0 && (
        <div className="mb-10">
          <h4 className="font-mono flex items-center gap-2 text-[10px] text-accent uppercase tracking-widest mb-4">
            <UserPlus size={14} /> Pending Approvals ({pendingStaff.length})
          </h4>
          <div className="grid grid-cols-1 divide-y divide-steel/10 dark:divide-concrete/10 border border-steel/10">
            {pendingStaff.map(u => (
              <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-charcoal">
                <div>
                  <p className="font-bold text-xs text-charcoal dark:text-concrete">{u.officialName || u.email}</p>
                  <p className="text-[10px] font-mono text-steel">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-transparent border border-steel/20 focus:border-accent p-2 text-[10px] font-mono text-charcoal dark:text-concrete outline-none"
                    onChange={(e) => {
                      if(e.target.value) {
                         updateRole(u.id, e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Assign Role...</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="architect">Architect</option>
                    <option value="engineer">Engineer</option>
                    <option value="surveyor">Surveyor</option>
                    <option value="planner">Planner</option>
                    <option value="financial_analyst">Financial Analyst</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="font-mono flex items-center gap-2 text-[10px] text-steel uppercase tracking-widest mb-4">
            <Users size={14} /> Active Staff
          </h4>
          <div className="border border-steel/10 bg-charcoal/5 dark:bg-concrete/5 max-h-96 overflow-y-auto custom-scrollbar">
            {staff.map(u => (
               <div key={u.id} className="p-3 border-b border-steel/5 flex justify-between items-center group hover:bg-white dark:hover:bg-charcoal transition-colors">
                 <div>
                    <p className="font-bold text-[11px] text-charcoal dark:text-concrete">{u.officialName || u.email}</p>
                    <p className="text-[9px] font-mono text-steel">{u.email}</p>
                 </div>
                 <select 
                    className="bg-transparent border-none p-1 text-[9px] font-mono text-charcoal dark:text-concrete outline-none uppercase font-bold"
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="project_manager">Project Manager</option>
                    <option value="architect">Architect</option>
                    <option value="engineer">Engineer</option>
                    <option value="surveyor">Surveyor</option>
                    <option value="planner">Planner</option>
                    <option value="financial_analyst">Financial Analyst</option>
                    <option value="admin">Administrator</option>
                    <option value="pending_staff">Revoke & Pending</option>
                  </select>
               </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono flex items-center gap-2 text-[10px] text-steel uppercase tracking-widest mb-4">
            <Briefcase size={14} /> Project Assignments
          </h4>
          <div className="border border-steel/10 bg-charcoal/5 dark:bg-concrete/5 max-h-96 overflow-y-auto custom-scrollbar">
            {clients.map(c => (
               <div key={c.id} className="p-4 border-b border-steel/5">
                 <div className="mb-3">
                    <p className="font-bold text-xs text-charcoal dark:text-concrete">{c.officialName || c.email}</p>
                    <p className="text-[9px] font-mono text-steel">Client Project</p>
                 </div>
                 
                 <div className="space-y-4 font-mono text-[10px]">
                   <div>
                     <label className="text-steel uppercase tracking-widest block mb-1">Lead PM</label>
                     <select 
                       className="w-full bg-transparent border-b border-steel/20 focus:border-accent py-1 text-charcoal dark:text-concrete outline-none"
                       value={c.assignedPM || ''}
                       onChange={e => updateStaffAssignment(c.id, c.assignedStaff || [], e.target.value)}
                     >
                       <option value="">-- No PM Assigned --</option>
                       {staff.filter(s => s.role === 'project_manager' || s.role === 'admin').map(s => (
                         <option key={s.id} value={s.id}>{s.officialName || s.email} ({s.role})</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="text-steel uppercase tracking-widest block mb-1">Assigned Specialists</label>
                     <div className="space-y-1">
                       {staff.map(s => {
                         const isAssigned = c.assignedStaff?.includes(s.id);
                         return (
                           <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="checkbox" 
                               checked={isAssigned || false}
                               onChange={(e) => {
                                 const newStaffList = e.target.checked 
                                   ? [...(c.assignedStaff || []), s.id]
                                   : (c.assignedStaff || []).filter(id => id !== s.id);
                                 updateStaffAssignment(c.id, newStaffList);
                               }}
                               className="accent-accent"
                             />
                             <span className={`text-charcoal dark:text-concrete ${isAssigned ? 'font-bold' : ''}`}>
                               {s.officialName || s.email} <span className="opacity-50">({s.role})</span>
                             </span>
                           </label>
                         )
                       })}
                     </div>
                   </div>
                 </div>
               </div>
            ))}
            {clients.length === 0 && <p className="p-4 text-[10px] font-mono text-steel">No client projects instantiated.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
