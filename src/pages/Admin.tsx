import React, { useEffect, useState } from 'react';
import { auth, db, provider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { LogOut, RefreshCw, CheckCircle, Clock, Phone, Trash2, Mail } from 'lucide-react';

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

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'newsletter'>('bookings');
  
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'booking' | 'newsletter', id: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'bookings') {
        fetchRequests();
      } else {
        fetchSubscribers();
      }
    }
  }, [user, activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'bookingRequests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reqs: BookingRequest[] = [];
      querySnapshot.forEach((doc) => {
        reqs.push({ id: doc.id, ...doc.data() } as BookingRequest);
      });
      setRequests(reqs);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('permission')) {
        setError('You do not have permission to view this dashboard. Access restricted to administrators.');
      } else {
        setError('Failed to load requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const subs: NewsletterSubscriber[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as NewsletterSubscriber);
      });
      setSubscribers(subs);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('permission')) {
        setError('You do not have permission to view this dashboard. Access restricted to administrators.');
      } else {
        setError('Failed to load subscribers.');
      }
    } finally {
      setLoading(false);
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
      console.error(err);
      setError('Failed to update status. You may not have admin permissions.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      if (deleteConfirm.type === 'booking') {
        await deleteDoc(doc(db, 'bookingRequests', deleteConfirm.id));
        setRequests(requests.filter(r => r.id !== deleteConfirm.id));
      } else {
        await deleteDoc(doc(db, 'newsletter', deleteConfirm.id));
        setSubscribers(subscribers.filter(s => s.id !== deleteConfirm.id));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete item. You may not have admin permissions.');
    } finally {
      setDeleteConfirm(null);
    }
  };

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
    <div className="p-8 md:p-16 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-steel font-mono text-sm uppercase tracking-widest">Logged in as {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={activeTab === 'bookings' ? fetchRequests : fetchSubscribers}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal hover:text-bronze transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal hover:text-bronze transition-colors ml-4"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex gap-8 mb-8 border-b border-steel/30">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 font-bold uppercase tracking-widest transition-colors ${activeTab === 'bookings' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Booking Requests
        </button>
        <button 
          onClick={() => setActiveTab('newsletter')}
          className={`pb-4 font-bold uppercase tracking-widest transition-colors ${activeTab === 'newsletter' ? 'text-bronze border-b-2 border-bronze' : 'text-steel hover:text-charcoal'}`}
        >
          Newsletter Subscribers
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-6 rounded-sm mb-8">
          <h3 className="font-bold uppercase tracking-widest mb-2">Access Denied / Error</h3>
          <p>{error}</p>
        </div>
      ) : null}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
          <div className="bg-concrete p-8 max-w-md w-full border border-steel/30 shadow-2xl">
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Confirm Deletion</h3>
            <p className="text-charcoal/80 mb-8">
              Are you sure you want to delete this {deleteConfirm.type === 'booking' ? 'booking request' : 'subscriber'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 border border-steel/30 hover:bg-steel/10 transition-colors font-bold uppercase tracking-widest text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-bold uppercase tracking-widest text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {!error && (
        <div className="bg-white border border-steel/30 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'bookings' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-concrete border-b border-steel/30 text-xs font-mono text-steel uppercase tracking-widest">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Client Name</th>
                    <th className="p-4 font-medium">Project Scale</th>
                    <th className="p-4 font-medium">Preferred Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel/10">
                  {loading && requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-steel">Loading requests...</td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-steel">No booking requests found.</td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-concrete/50 transition-colors">
                        <td className="p-4 text-sm">
                          {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </td>
                        <td className="p-4 font-medium">{req.fullName}</td>
                        <td className="p-4 text-sm capitalize">{req.projectScale}</td>
                        <td className="p-4 text-sm">{req.preferredDate}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                            ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              req.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'}`}
                          >
                            {req.status === 'pending' && <Clock size={12} />}
                            {req.status === 'reviewed' && <CheckCircle size={12} />}
                            {req.status === 'contacted' && <Phone size={12} />}
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end items-center gap-4">
                          <select 
                            value={req.status}
                            onChange={(e) => updateStatus(req.id, e.target.value)}
                            className="text-xs font-bold uppercase tracking-widest bg-transparent border border-steel/30 px-2 py-1 outline-none focus:border-bronze cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="contacted">Contacted</option>
                          </select>
                          <button onClick={() => setDeleteConfirm({ type: 'booking', id: req.id })} className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-concrete border-b border-steel/30 text-xs font-mono text-steel uppercase tracking-widest">
                    <th className="p-4 font-medium">Date Subscribed</th>
                    <th className="p-4 font-medium">Email Address</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel/10">
                  {loading && subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-steel">Loading subscribers...</td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-steel">No subscribers found.</td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-concrete/50 transition-colors">
                        <td className="p-4 text-sm">
                          {sub.createdAt?.toDate ? sub.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </td>
                        <td className="p-4 font-medium flex items-center gap-2">
                          <Mail size={14} className="text-steel" />
                          {sub.email}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => setDeleteConfirm({ type: 'newsletter', id: sub.id })} className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
