import React, { useEffect, useState } from "react";
import {
  auth,
  db,
  storage,
  provider,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  where,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  LogOut,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  Check,
  Clock,
  Phone,
  Trash2,
  Mail,
  Plus,
  Calendar,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  Send,
  Upload,
  Download,
  Edit,
  PieChart as PieChartIcon,
  FileText as FileTextIcon,
  TrendingUp,
  MapPin,
  Shield,
  Sparkles,
  Smartphone,
  Laptop,
  X,
  Info,
  Layers,
  Eye,
  Undo,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { motion } from "motion/react";
import Magnetic from "../components/Magnetic";

import AdminPortfolio from "../components/PortfolioDashboard";

import { useCMS, DEFAULT_RESOURCES } from "../lib/cms";
import { Testimonial, Invoice } from "../types";

interface BookingRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  projectType: string;
  preferredDate: string;
  description: string;
  status: string;
  createdAt: any;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: any;
}

interface AppUser {
  id: string;
  email: string;
  role: string;
  officialName?: string;
  title?: string;
  assignedPM?: string;
  assignedStaff?: string[];
  hasConfirmed2FA?: boolean;
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

interface Milestone {
  id: string;
  clientId: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  order: number;
  createdAt: any;
}

const ADMIN_EMAILS = [
  "machariag605@gmail.com",
  "danuthiaandassociates@gmail.com"
];

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "portfolio"
    | "leads"
    | "newsletter"
    | "updates"
    | "messages"
    | "documents"
    | "users"
    | "milestones"
    | "analytics"
    | "testimonials"
    | "staff"
    | "security"
    | "cms"
  >(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("tab") as any) || "overview";
  });

  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const clients = React.useMemo(
    () => users.filter((u) => u.role === "client"),
    [users],
  );
  const projectManagers = React.useMemo(
    () => users.filter((u) => u.role === "project_manager"),
    [users],
  );
  const allStaff = React.useMemo(
    () =>
      users.filter((u) =>
        ["project_manager", "architect", "surveyor"].includes(u.role),
      ),
    [users],
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // CMS Content Management State
  const { allResources, updateResource, resetToDefaults } = useCMS();
  const [cmsGroupFilter, setCmsGroupFilter] = useState("All");
  const [cmsEditValues, setCmsEditValues] = useState<Record<string, string>>({});
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [cmsSearchText, setCmsSearchText] = useState("");
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // Listen for iframe clicks
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CMS_EDIT_CLICK') {
        const key = e.data.key;
        
        // Change group filter if necessary
        const resourceItem = allResources?.find((r: any) => r.key === key) || DEFAULT_RESOURCES.find((r: any) => r.key === key);
        if (resourceItem && resourceItem.group) {
          setCmsGroupFilter(resourceItem.group);
        }

        // Scroll to the item and focus it
        setTimeout(() => {
          const el = document.getElementById(`cms-input-${key}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a brief highlight
            const oldBg = el.style.backgroundColor;
            el.style.backgroundColor = 'rgba(142, 144, 137, 0.2)'; // accent overlay
            el.style.transition = 'background-color 1.5s ease-out';
            
            // Focus if it's text
            const input = el.querySelector('textarea') || el.querySelector('input[type="text"]');
            if (input) {
              (input as HTMLElement).focus();
            }

            setTimeout(() => {
              el.style.backgroundColor = oldBg;
            }, 1500);
          }
        }, 300);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [allResources]);

  // CMS Advanced Custom Creation & Simulator States
  const [customKey, setCustomKey] = useState("");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<'image' | 'video' | 'text' | 'link' | 'number'>("text");
  const [customGroup, setCustomGroup] = useState("Hero Section");
  const [customValue, setCustomValue] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<string>("/");
  const [activeSimulatorTheme, setActiveSimulatorTheme] = useState<"desktop" | "mobile">("desktop");
  const [newCustomError, setNewCustomError] = useState("");
  const [newCustomSuccess, setNewCustomSuccess] = useState("");

  useEffect(() => {
    if (allResources && allResources.length > 0) {
      const values: Record<string, string> = {};
      allResources.forEach(res => {
        values[res.key] = res.value;
      });
      setCmsEditValues(prev => {
        const next = { ...values };
        // Don't overwrite active unsaved changes user is currently typing
        Object.keys(prev).forEach(key => {
          if (prev[key] !== undefined && prev[key] !== values[key]) {
            // Keep unsaved modifications
            next[key] = prev[key];
          }
        });
        return next;
      });
    }
  }, [allResources]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "booking" | "newsletter" | "update" | "document" | "milestone" | "admin";
    id: string;
  } | null>(null);

  // New Update Form State
  const [newUpdate, setNewUpdate] = useState({
    clientId: "",
    title: "",
    description: "",
    imageUrl: "",
  });
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  const [uploadingUpdateImage, setUploadingUpdateImage] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);

  // New Milestone Form State
  const [newMilestone, setNewMilestone] = useState<{
    clientId: string;
    title: string;
    status: "completed" | "in-progress" | "upcoming";
    order: number;
  }>({ clientId: "", title: "", status: "upcoming", order: 1 });
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null,
  );

  // Messaging State
  const [selectedChatClient, setSelectedChatClient] = useState<string | null>(
    null,
  );
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Document State
  const [selectedDocClient, setSelectedDocClient] = useState<string>("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (selectedChatClient && messages.length > 0) {
      const unreadFromClient = messages.filter(
        (msg) => msg.senderId === selectedChatClient && !msg.read,
      );

      if (unreadFromClient.length > 0) {
        unreadFromClient.forEach((msg) => {
          updateDoc(doc(db, "messages", msg.id), { read: true }).catch(
            console.error,
          );
        });
      }
    }
  }, [selectedChatClient]); // Only run when active chat changes to avoid loop with 'messages' dependency

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        fetchAllData();

        // Real-time listener for messages
        const q = query(
          collection(db, "messages"),
          orderBy("createdAt", "asc"),
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
              msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(msgs);
          },
          (error) => {
            console.error("Error fetching messages:", error);
          },
        );

        return () => unsubscribe();
      } else {
        // If not in the hardcoded list, check the DB
        getDoc(doc(db, "users", user.uid))
          .then((userDoc) => {
            if (userDoc.exists() && userDoc.data().role === "admin") {
              fetchAllData();
              const q = query(
                collection(db, "messages"),
                orderBy("createdAt", "asc"),
              );
              const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                  const msgs: Message[] = [];
                  snapshot.forEach((docSnap) => {
                    msgs.push({ id: docSnap.id, ...docSnap.data() } as Message);
                  });
                  setMessages(msgs);
                },
                (error) => {
                  console.error("Error fetching messages:", error);
                },
              );
              // Note: unsubscribe doesn't easily return here, but it's okay for an admin component to persist the listener
            } else {
              setError(
                "You do not have permission to view this dashboard. Access restricted to administrators.",
              );
              setLoading(false);
              setInitialLoading(false);
            }
          })
          .catch((e) => {
            console.error(e);
            setError("Failed to check user role.");
            setLoading(false);
            setInitialLoading(false);
          });
      }
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Starting fetchAllData");
      const results = await Promise.allSettled([
        fetchRequests(),
        fetchSubscribers(),
        fetchUpdates(),
        fetchUsers(),
        fetchDocuments(),
        fetchMilestones(),
        fetchInvoices(),
        fetchTestimonials(),
        fetchAdmins(),
        fetchProjects(),
      ]);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Fetch ${index} failed:`, result.reason);
        }
      });

      if (results.some((r) => r.status === "rejected")) {
        throw new Error("Some data fetches failed");
      }
    } catch (err: any) {
      console.error("fetchAllData failed:", err);
      if (err.message?.includes("permission")) {
        setError(
          "You do not have permission to view this dashboard. Access restricted to administrators.",
        );
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, "projects"), orderBy("year", "desc"));
      const querySnapshot = await getDocs(q);
      const projs: any[] = [];
      querySnapshot.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "projects");
    }
  };

  const fetchMilestones = async () => {
    try {
      const q = query(collection(db, "milestones"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const mstones: Milestone[] = [];
      querySnapshot.forEach((doc) => {
        mstones.push({ id: doc.id, ...doc.data() } as Milestone);
      });
      setMilestones(mstones);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "milestones");
    }
  };

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "leads"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const reqs: BookingRequest[] = [];
      querySnapshot.forEach((doc) => {
        reqs.push({ id: doc.id, ...doc.data() } as BookingRequest);
      });
      setRequests(reqs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "leads");
    }
  };

  const fetchSubscribers = async () => {
    try {
      const q = query(
        collection(db, "newsletter"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const subs: NewsletterSubscriber[] = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() } as NewsletterSubscriber);
      });
      setSubscribers(subs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "newsletter");
    }
  };

  const fetchUpdates = async () => {
    try {
      const q = query(
        collection(db, "projectUpdates"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const upds: ProjectUpdate[] = [];
      querySnapshot.forEach((doc) => {
        upds.push({ id: doc.id, ...doc.data() } as ProjectUpdate);
      });
      setUpdates(upds);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "projectUpdates");
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const usrs: AppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usrs.push({
          id: doc.id,
          email: data.email,
          role: data.role,
          officialName: data.officialName,
          title: data.title,
          assignedPM: data.assignedPM,
          assignedStaff: data.assignedStaff,
          hasConfirmed2FA: data.hasConfirmed2FA,
        } as AppUser);
      });
      setUsers(usrs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "users");
    }
  };

  const fetchAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "admins"));
      const adms: { id: string; email: string }[] = [];
      querySnapshot.forEach((doc) => {
        adms.push({ id: doc.id, email: doc.data().email });
      });
      setAdmins(adms);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "admins");
    }
  };

  const addAdmin = async (userId: string, email: string) => {
    setLoading(true);
    try {
      await setDoc(doc(db, "admins", userId), { 
        email, 
        createdAt: serverTimestamp() 
      });
      setAdmins(prev => [...prev, { id: userId, email }]);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, "admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const q = query(
        collection(db, "documents"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const docs: VaultDocument[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as VaultDocument);
      });
      setDocuments(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "documents");
    }
  };

  const fetchInvoices = async () => {
    try {
      const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const invs: any[] = [];
      querySnapshot.forEach((doc) => {
        invs.push({ id: doc.id, ...doc.data() });
      });
      setInvoices(invs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "invoices");
    }
  };

  const fetchTestimonials = async () => {
    try {
      const q = query(
        collection(db, "testimonials"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const tests: any[] = [];
      querySnapshot.forEach((doc) => {
        tests.push({ id: doc.id, ...doc.data() });
      });
      setTestimonials(tests);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "testimonials");
    }
  };

  const updateTestimonialStatus = async (id: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, "testimonials", id), { approved });
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, approved } : t)),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "testimonials");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        (err instanceof Error && (err.message.includes("popup-closed-by-user") || err.message.includes("cancelled-popup-request")))
      ) {
        console.log("Authentication popup was closed by the user.");
      } else {
        console.error("Login failed", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRequests([]);
      setSubscribers([]);
      setUpdates([]);
      setUsers([]);
      setMessages([]);
      setInitialLoading(true);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "leads", id), {
        status: newStatus,
      });
      setRequests(
        requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "leads");
      setError("Failed to update status. You may not have admin permissions.");
    }
  };

  const updateUserRole = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", id), {
        role: newRole,
      });
      setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
      setError(
        "Failed to update user role. You may not have admin permissions.",
      );
    }
  };

  const assignManagerToClient = async (clientId: string, pmId: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", clientId), {
        assignedPM: pmId || null,
      });
      setUsers(
        users.map((u) =>
          u.id === clientId ? { ...u, assignedPM: pmId || undefined } : u,
        ),
      );

      // Also update the project document if it exists to link PM for dashboard access
      const projectRef = doc(db, "projects", clientId);
      await updateDoc(projectRef, {
        pmId: pmId || null,
      }).catch(() => {
        /* Project might not exist yet, ignore */
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffAssignment = async (
    clientId: string,
    staffId: string,
    currentStaff: string[] = [],
  ) => {
    try {
      const isAssigned = currentStaff.includes(staffId);
      const newStaffList = isAssigned
        ? currentStaff.filter((id) => id !== staffId)
        : [...currentStaff, staffId];

      await updateDoc(doc(db, "users", clientId), {
        assignedStaff: newStaffList,
      });

      setUsers(
        users.map((u) =>
          u.id === clientId ? { ...u, assignedStaff: newStaffList } : u,
        ),
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === "booking") {
        await deleteDoc(doc(db, "leads", deleteConfirm.id));
        setRequests(requests.filter((r) => r.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === "newsletter") {
        await deleteDoc(doc(db, "newsletter", deleteConfirm.id));
        setSubscribers(subscribers.filter((s) => s.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === "update") {
        await deleteDoc(doc(db, "projectUpdates", deleteConfirm.id));
        setUpdates(updates.filter((u) => u.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === "document") {
        await deleteDoc(doc(db, "documents", deleteConfirm.id));
        setDocuments(documents.filter((d) => d.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === "milestone") {
        await deleteDoc(doc(db, "milestones", deleteConfirm.id));
        setMilestones(milestones.filter((m) => m.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === "admin") {
        await deleteDoc(doc(db, "admins", deleteConfirm.id));
        setAdmins(admins.filter((a) => a.id !== deleteConfirm.id));
      }
    } catch (err) {
      const collectionName =
        deleteConfirm.type === "booking" ? "leads"
          : deleteConfirm.type === "newsletter" ? "newsletter"
          : deleteConfirm.type === "document" ? "documents"
          : deleteConfirm.type === "milestone" ? "milestones"
          : deleteConfirm.type === "admin" ? "admins"
          : "projectUpdates";
      handleFirestoreError(err, OperationType.DELETE, collectionName);
      setError("Failed to delete item. You may not have admin permissions.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.clientId || !newUpdate.title || !newUpdate.description) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsCreatingUpdate(true);
    setError("");
    try {
      const updateData: any = {
        clientId: newUpdate.clientId,
        title: newUpdate.title,
        description: newUpdate.description,
      };
      if (newUpdate.imageUrl) {
        updateData.imageUrl = newUpdate.imageUrl;
      }

      if (editingUpdateId) {
        await updateDoc(doc(db, "projectUpdates", editingUpdateId), updateData);
      } else {
        updateData.createdAt = serverTimestamp();
        await addDoc(collection(db, "projectUpdates"), updateData);

        // Send reminder email to client
        const client = users.find((u) => u.id === newUpdate.clientId);
        if (client && client.email) {
          try {
            await fetch("/api/send-reminder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: client.email,
                name: client.email.split("@")[0], // Fallback name
                projectTitle: newUpdate.title,
              }),
            });
          } catch (err) {
            console.error("Failed to send reminder email", err);
          }
        }
      }

      setNewUpdate({ clientId: "", title: "", description: "", imageUrl: "" });
      setEditingUpdateId(null);
      await fetchUpdates(); // Refresh the list
    } catch (err: any) {
      handleFirestoreError(
        err,
        editingUpdateId ? OperationType.UPDATE : OperationType.CREATE,
        "projectUpdates",
      );
      setError(
        `Failed to ${editingUpdateId ? "update" : "create"} project update. Ensure you have admin permissions and the data is valid.`,
      );
    } finally {
      setIsCreatingUpdate(false);
    }
  };

  const handleUpdateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingUpdateImage(true);
    let uploadedRef = null;
    try {
      const storageRef = ref(storage, `updates/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      uploadedRef = snapshot.ref;
      const downloadURL = await getDownloadURL(snapshot.ref);
      setNewUpdate(prev => ({ ...prev, imageUrl: downloadURL }));
    } catch (err) {
      console.error(err);
      if (uploadedRef) {
        await deleteObject(uploadedRef).catch(console.error);
      }
      setError("Failed to upload update image.");
    } finally {
      setUploadingUpdateImage(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !user || !selectedChatClient) return;

    setSendingReply(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: selectedChatClient,
        text: adminReply.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });
      setAdminReply("");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, "messages");
      setError("Failed to send message.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedDocClient) return;

    setUploadingDoc(true);
    setUploadError("");

    let uploadedRef = null;
    try {
      const storageRef = ref(storage, `vault/${selectedDocClient}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      uploadedRef = snapshot.ref;
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "documents"), {
        clientId: selectedDocClient,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileData: downloadURL,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setUploadingDoc(false);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      if (uploadedRef) {
        await deleteObject(uploadedRef).catch(console.error);
      }
      handleFirestoreError(error, OperationType.CREATE, "documents");
      setUploadError("Failed to upload document to storage.");
      setUploadingDoc(false);
    }
  };

  const handleDownload = (doc: VaultDocument) => {
    const link = document.createElement("a");
    link.href = doc.fileData;
    link.download = doc.fileName;
    link.click();
  };

  // Derived Stats for Charts
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const reviewedCount = requests.filter((r) => r.status === "reviewed").length;
  const contactedCount = requests.filter(
    (r) => r.status === "contacted",
  ).length;

  const statusData = [
    { name: "Pending", value: pendingCount, color: "#eab308" },
    { name: "Reviewed", value: reviewedCount, color: "#3b82f6" },
    { name: "Contacted", value: contactedCount, color: "#22c55e" },
  ];

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-steel/10 rounded w-full"></div>
      ))}
    </div>
  );

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-8">
          Admin Portal
        </h1>
        <p className="text-charcoal/70 mb-8 max-w-md text-center">
          Please sign in with your administrator account to access the
          dashboard.
        </p>
        <Magnetic>
          <button
            onClick={handleLogin}
            className="bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal px-8 py-4 font-bold uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-all duration-300"
          >
            Sign in with Google
          </button>
        </Magnetic>
      </div>
    );
  }

  const isHeadAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  if (!isHeadAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-4 text-red-600">
          Access Denied
        </h1>
        <p className="text-charcoal/70 mb-8 max-w-md text-center">
          Your account ({user.email}) does not have administrative privileges.
          Only authorized head emails can access this interface.
        </p>
        <Magnetic>
          <button
            onClick={handleLogout}
            className="bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal px-8 py-4 font-bold uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-all duration-300"
          >
            Sign Out
          </button>
        </Magnetic>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-2">
            Admin Dashboard
          </h1>
          <p className="text-steel font-mono text-xs uppercase tracking-widest">
            Logged in as {user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Magnetic>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal dark:text-concrete hover:text-accent dark:hover:text-accent transition-colors bg-concrete dark:bg-charcoal px-4 py-2 border border-steel/20 dark:border-steel/40 rounded shadow-sm"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Data
            </button>
          </Magnetic>
          <Magnetic>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors bg-concrete dark:bg-charcoal px-4 py-2 border border-red-100 dark:border-red-900/30 rounded shadow-sm"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </Magnetic>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-steel/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 dark:bg-accent/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <p className="text-steel dark:text-steel/80 font-mono text-[10px] uppercase tracking-[0.2em] mb-3">
              Total Bookings
            </p>
            <h3 className="font-display text-5xl font-light text-charcoal dark:text-concrete">
              {initialLoading ? "-" : requests.length}
            </h3>
          </div>
          <div className="mt-6 flex justify-end">
            <Calendar size={20} className="text-accent/50" strokeWidth={1} />
          </div>
        </div>
        <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-steel/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 dark:bg-accent/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <p className="text-steel dark:text-steel/80 font-mono text-[10px] uppercase tracking-[0.2em] mb-3">
              Pending Requests
            </p>
            <h3 className="font-display text-5xl font-light text-accent">
              {initialLoading ? "-" : pendingCount}
            </h3>
          </div>
          <div className="mt-6 flex justify-end">
            <Clock size={20} className="text-accent/50" strokeWidth={1} />
          </div>
        </div>
        <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-steel/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 dark:bg-accent/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <p className="text-steel dark:text-steel/80 font-mono text-[10px] uppercase tracking-[0.2em] mb-3">
              Subscribers
            </p>
            <h3 className="font-display text-5xl font-light text-charcoal dark:text-concrete">
              {initialLoading ? "-" : subscribers.length}
            </h3>
          </div>
          <div className="mt-6 flex justify-end">
            <Users size={20} className="text-accent/50" strokeWidth={1} />
          </div>
        </div>
        <div className="bg-concrete dark:bg-charcoal p-8 border border-steel/20 dark:border-steel/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 dark:bg-accent/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <p className="text-steel dark:text-steel/80 font-mono text-[10px] uppercase tracking-[0.2em] mb-3">
              Project Updates
            </p>
            <h3 className="font-display text-5xl font-light text-charcoal dark:text-concrete">
              {initialLoading ? "-" : updates.length}
            </h3>
          </div>
          <div className="mt-6 flex justify-end">
            <FileText size={20} className="text-accent/50" strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-12 border-b border-steel/20 dark:border-steel/40 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "overview" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "portfolio" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Portfolio Management
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "analytics" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Business Intelligence
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "leads" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Leads CRM
        </button>
        <button
          onClick={() => setActiveTab("updates")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "updates" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Timelines & Updates
        </button>
        <button
          onClick={() => setActiveTab("milestones")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "milestones" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Task Database
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "messages" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Meetings Database
          {messages.filter((m) => !m.read && m.receiverId === "admin").length >
            0 && (
            <span className="bg-accent text-concrete text-[8px] px-1.5 py-0.5 rounded-full">
              {
                messages.filter((m) => !m.read && m.receiverId === "admin")
                  .length
              }
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "newsletter" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "users" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "documents" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Resources & Assets
        </button>
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "testimonials" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Testimonials
        </button>
        <button
          onClick={() => setActiveTab("cms")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "cms" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Content Management (CMS)
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeTab === "security" ? "text-charcoal dark:text-concrete border-b border-charcoal dark:border-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
        >
          Security
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8 shadow-sm">
          <h3 className="font-bold uppercase tracking-widest mb-2 text-sm">
            Access Denied / Error
          </h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-concrete dark:bg-charcoal p-8 max-w-md w-full rounded-2xl shadow-2xl border border-steel/20 dark:border-steel/40"
          >
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-charcoal dark:text-concrete">
              Confirm Deletion
            </h3>
            <p className="text-charcoal/70 dark:text-concrete/70 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete this{" "}
              {deleteConfirm.type === "booking"
                ? "booking request"
                : deleteConfirm.type === "newsletter"
                  ? "subscriber"
                  : deleteConfirm.type === "document"
                    ? "document"
                    : "project update"}
              ? This action cannot be undone.
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
                className="px-5 py-2.5 bg-red-600 text-concrete rounded-lg hover:bg-red-700 transition-colors font-bold uppercase tracking-widest text-xs shadow-sm shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {!error && (
        <div className="w-full">
          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <AdminPortfolio projects={projects} refresh={fetchProjects} />
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart: Booking Statuses */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                  <BarChart3
                    size={20}
                    className="text-accent"
                    strokeWidth={1.5}
                  />
                  Booking Statuses
                </h3>
                {initialLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-steel text-sm font-light">
                    No booking data available.
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#8C8C8C",
                            fontFamily: "JetBrains Mono",
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#8C8C8C",
                            fontFamily: "JetBrains Mono",
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#F5F5F0" }}
                          contentStyle={{
                            borderRadius: "0",
                            border: "1px solid rgba(140, 140, 140, 0.2)",
                            boxShadow: "none",
                            fontFamily: "Montserrat",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 0, 0, 0]}>
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
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                  <Clock size={20} className="text-accent" strokeWidth={1.5} />
                  Recent Activity
                </h3>
                {initialLoading ? (
                  renderSkeleton()
                ) : (
                  <div className="space-y-6">
                    {/* Just showing the 5 most recent bookings for overview */}
                    {requests.slice(0, 5).map((req) => (
                      <div
                        key={req.id}
                        className="flex items-start gap-4 pb-6 border-b border-steel/10 last:border-0 last:pb-0"
                      >
                        <div className="w-8 h-8 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-1">
                          <Calendar size={14} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal dark:text-concrete">
                            New Booking: {req.fullName}
                          </p>
                          <p className="text-[10px] font-mono text-steel dark:text-steel/80 mt-2 uppercase tracking-widest">
                            {req.createdAt?.toDate
                              ? req.createdAt.toDate().toLocaleDateString()
                              : "Just now"}{" "}
                            • {req.projectType?.replace("-", " ")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {requests.length === 0 && (
                      <p className="text-sm font-light text-steel text-center py-8">
                        No recent activity.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Conversion Rate Chart */}
                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                  <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                    <BarChart3
                      size={20}
                      className="text-accent"
                      strokeWidth={1.5}
                    />
                    Booking Conversion
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Total Requests", value: requests.length },
                          { name: "Contacted", value: contactedCount },
                          {
                            name: "Converted (Clients)",
                            value: clients.length,
                          },
                        ]}
                      >
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#8C8C8C",
                            fontFamily: "JetBrains Mono",
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#8C8C8C",
                            fontFamily: "JetBrains Mono",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "0",
                            border: "1px solid rgba(140, 140, 140, 0.2)",
                            fontFamily: "Montserrat",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="value" fill="#B08D57" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Project Type Popularity */}
                <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                  <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                    <PieChartIcon
                      size={20}
                      className="text-accent"
                      strokeWidth={1.5}
                    />
                    Project Type Popularity
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "New Build",
                              value: requests.filter(
                                (r) => r.projectType === "new-build",
                              ).length,
                            },
                            {
                              name: "Renovation",
                              value: requests.filter(
                                (r) => r.projectType === "renovation",
                              ).length,
                            },
                            {
                              name: "Interior",
                              value: requests.filter(
                                (r) => r.projectType === "interior-design",
                              ).length,
                            },
                            {
                              name: "Master Plan",
                              value: requests.filter(
                                (r) => r.projectType === "master-planning",
                              ).length,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#B08D57"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          <Cell fill="#B08D57" />
                          <Cell fill="#2C2C2C" />
                          <Cell fill="#8C8C8C" />
                          <Cell fill="#E4E4E4" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Revenue Analytics */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                  <FileText
                    size={20}
                    className="text-accent"
                    strokeWidth={1.5}
                  />
                  Revenue & Billing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="p-6 border border-steel/10">
                    <p className="text-[10px] font-mono uppercase text-steel mb-2">
                      Total Invoiced
                    </p>
                    <p className="text-3xl font-display font-light">
                      $
                      {invoices
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="p-6 border border-steel/10">
                    <p className="text-[10px] font-mono uppercase text-steel mb-2">
                      Total Collected
                    </p>
                    <p className="text-3xl font-display font-light text-accent">
                      $
                      {invoices
                        .filter((i) => i.status === "paid")
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="p-6 border border-steel/10">
                    <p className="text-[10px] font-mono uppercase text-steel mb-2">
                      Outstanding
                    </p>
                    <p className="text-3xl font-display font-light text-red-500">
                      $
                      {invoices
                        .filter((i) => i.status === "unpaid")
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Newsletter Growth Trends */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                  <TrendingUp
                    size={20}
                    className="text-accent"
                    strokeWidth={1.5}
                  />
                  Newsletter Growth Trends
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Object.entries(
                        subscribers.reduce((acc: any, sub) => {
                          const date = sub.createdAt?.toDate
                            ? sub.createdAt
                                .toDate()
                                .toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "2-digit",
                                })
                            : "Unknown";
                          acc[date] = (acc[date] || 0) + 1;
                          return acc;
                        }, {}),
                      )
                        .map(([name, value]) => ({ name, value }))
                        .reverse()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#8C8C8C20"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#8C8C8C",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#8C8C8C",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "0",
                          border: "1px solid rgba(140, 140, 140, 0.2)",
                          fontFamily: "Montserrat",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#B08D57"
                        strokeWidth={2}
                        dot={{ fill: "#B08D57", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === "testimonials" && (
            <div className="space-y-8">
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <h2 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-accent"
                    strokeWidth={1.5}
                  />
                  Manage Testimonials
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-concrete/50 dark:bg-steel/10 border-b border-steel/20 dark:border-steel/40 text-[10px] font-mono text-steel dark:text-steel/80 uppercase tracking-[0.2em]">
                        <th className="p-6 font-normal">Client</th>
                        <th className="p-6 font-normal">Project Type</th>
                        <th className="p-6 font-normal">Rating</th>
                        <th className="p-6 font-normal">Comment</th>
                        <th className="p-6 font-normal">Status</th>
                        <th className="p-6 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel/10">
                      {testimonials.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-12 text-center text-steel font-light"
                          >
                            No testimonials found.
                          </td>
                        </tr>
                      ) : (
                        testimonials.map((test) => (
                          <tr
                            key={test.id}
                            className="group hover:bg-concrete/30 dark:hover:bg-steel/5 transition-colors"
                          >
                            <td className="p-6">
                              <p className="text-sm font-medium text-charcoal dark:text-concrete">
                                {test.clientName}
                              </p>
                              <p className="text-[10px] font-mono text-steel mt-1">
                                {test.createdAt?.toDate().toLocaleDateString()}
                              </p>
                            </td>
                            <td className="p-6">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-steel">
                                {test.projectType}
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={
                                      i < test.rating
                                        ? "text-accent"
                                        : "text-steel/20"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-6 max-w-xs">
                              <p className="text-xs text-steel line-clamp-2">
                                {test.comment}
                              </p>
                            </td>
                            <td className="p-6">
                              <span
                                className={`text-[8px] font-mono uppercase tracking-widest px-2 py-1 border ${test.approved ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                              >
                                {test.approved ? "Approved" : "Pending"}
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <button
                                onClick={() =>
                                  updateTestimonialStatus(
                                    test.id,
                                    !test.approved,
                                  )
                                }
                                className={`text-[10px] font-mono uppercase tracking-widest px-4 py-2 border transition-all ${test.approved ? "border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-concrete" : "border-green-600 text-green-600 hover:bg-green-600 hover:text-concrete"}`}
                              >
                                {test.approved ? "Unapprove" : "Approve"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Leads CRM Tab */}
          {activeTab === "leads" && (
            <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-concrete/50 dark:bg-steel/10 border-b border-steel/20 dark:border-steel/40 text-[10px] font-mono text-steel dark:text-steel/80 uppercase tracking-[0.2em]">
                      <th className="p-6 font-normal">Date</th>
                      <th className="p-6 font-normal">Client Info</th>
                      <th className="p-6 font-normal">Project Details</th>
                      <th className="p-6 font-normal">Status</th>
                      <th className="p-6 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel/10">
                    {initialLoading ? (
                      <tr>
                        <td colSpan={5}>{renderSkeleton()}</td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-16 text-center text-steel font-light"
                        >
                          <Calendar
                            size={32}
                            className="mx-auto mb-4 opacity-20"
                            strokeWidth={1}
                          />
                          <p>No booking requests found.</p>
                        </td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr
                          key={req.id}
                          className="hover:bg-concrete/30 dark:hover:bg-steel/10 transition-colors group"
                        >
                          <td className="p-6 text-xs font-mono text-charcoal/80 dark:text-concrete/80">
                            {req.createdAt?.toDate
                              ? req.createdAt.toDate().toLocaleDateString()
                              : "Just now"}
                          </td>
                          <td className="p-6">
                            <div className="font-medium text-charcoal dark:text-concrete text-sm mb-1">
                              {req.fullName}
                            </div>
                            <div className="text-xs text-steel font-light flex items-center gap-2">
                              <Mail size={12} /> {req.email}
                            </div>
                            <div className="text-xs text-steel font-light flex items-center gap-2 mt-1">
                              <Phone size={12} /> {req.phone}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="text-sm capitalize text-charcoal dark:text-concrete font-medium mb-1">
                              {req.projectType?.replace("-", " ")}
                            </div>
                            <div className="text-xs text-steel font-light mb-1 flex items-center gap-2">
                              <MapPin size={12} /> {req.location}
                            </div>
                            <div className="text-xs text-steel font-light mb-1 flex items-center gap-2">
                              <Calendar size={12} /> {req.preferredDate}
                            </div>
                            <div
                              className="text-[10px] text-steel font-light mt-2 max-w-xs truncate"
                              title={req.description}
                            >
                              {req.description}
                            </div>
                          </td>
                          <td className="p-6">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-mono uppercase tracking-widest border
                              ${
                                req.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50"
                                  : req.status === "reviewed"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50"
                                    : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50"
                              }`}
                            >
                              {req.status === "pending" && <Clock size={10} />}
                              {req.status === "reviewed" && (
                                <CheckCircle size={10} />
                              )}
                              {req.status === "contacted" && (
                                <Phone size={10} />
                              )}
                              {req.status}
                            </span>
                          </td>
                          <td className="p-6 text-right flex justify-end items-center gap-4">
                            <select
                              value={req.status}
                              onChange={(e) =>
                                updateStatus(req.id, e.target.value)
                              }
                              className="text-[10px] font-mono uppercase tracking-widest bg-transparent border border-steel/20 dark:border-steel/40 px-3 py-1.5 outline-none focus:border-accent dark:focus:border-accent cursor-pointer text-charcoal dark:text-concrete transition-all"
                            >
                              <option
                                value="pending"
                                className="dark:bg-charcoal"
                              >
                                Pending
                              </option>
                              <option
                                value="reviewed"
                                className="dark:bg-charcoal"
                              >
                                Reviewed
                              </option>
                              <option
                                value="contacted"
                                className="dark:bg-charcoal"
                              >
                                Contacted
                              </option>
                            </select>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "booking",
                                  id: req.id,
                                })
                              }
                              className="p-2 text-steel hover:text-red-600 dark:hover:text-red-500 transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
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
          {activeTab === "updates" && (
            <div className="space-y-12">
              {/* Create/Edit Form */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-3 text-charcoal dark:text-concrete">
                    {editingUpdateId ? (
                      <Edit
                        size={20}
                        className="text-accent"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Plus
                        size={20}
                        className="text-accent"
                        strokeWidth={1.5}
                      />
                    )}
                    {editingUpdateId
                      ? "Edit Project Update"
                      : "Post New Update"}
                  </h2>
                  {editingUpdateId && (
                    <button
                      onClick={() => {
                        setEditingUpdateId(null);
                        setNewUpdate({
                          clientId: "",
                          title: "",
                          description: "",
                          imageUrl: "",
                        });
                      }}
                      className="text-xs font-mono uppercase tracking-widest text-steel hover:text-charcoal dark:hover:text-concrete transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <form onSubmit={handleCreateUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                        Select Client *
                      </label>
                      <select
                        value={newUpdate.clientId}
                        onChange={(e) =>
                          setNewUpdate({
                            ...newUpdate,
                            clientId: e.target.value,
                          })
                        }
                        className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete"
                        required
                      >
                        <option value="" className="dark:bg-charcoal">
                          -- Select a Client --
                        </option>
                        {clients.map((c) => (
                          <option
                            key={c.id}
                            value={c.id}
                            className="dark:bg-charcoal"
                          >
                            {c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                        Update Title *
                      </label>
                      <input
                        type="text"
                        value={newUpdate.title}
                        onChange={(e) =>
                          setNewUpdate({ ...newUpdate, title: e.target.value })
                        }
                        className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete placeholder:text-steel/50 dark:placeholder:text-steel/40"
                        placeholder="e.g., Foundation Poured"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                      Description *
                    </label>
                    <textarea
                      value={newUpdate.description}
                      onChange={(e) =>
                        setNewUpdate({
                          ...newUpdate,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light min-h-[120px] resize-y text-charcoal dark:text-concrete placeholder:text-steel/50 dark:placeholder:text-steel/40"
                      placeholder="Detailed progress report..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                      Image (Optional)
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="url"
                        value={newUpdate.imageUrl}
                        onChange={(e) =>
                          setNewUpdate({ ...newUpdate, imageUrl: e.target.value })
                        }
                        className="flex-1 bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete placeholder:text-steel/50 dark:placeholder:text-steel/40"
                        placeholder="Image URL or upload -->"
                      />
                      <div className="relative">
                        <input 
                          type="file"
                          id="update-image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleUpdateImageUpload}
                        />
                        <label 
                          htmlFor="update-image-upload"
                          className={`h-full px-6 flex items-center justify-center border-b border-steel/30 dark:border-steel/60 cursor-pointer hover:text-accent transition-colors ${uploadingUpdateImage ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {uploadingUpdateImage ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isCreatingUpdate}
                    className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-colors disabled:opacity-50"
                  >
                    {isCreatingUpdate
                      ? editingUpdateId
                        ? "Updating..."
                        : "Posting..."
                      : editingUpdateId
                        ? "Update Project"
                        : "Post Update"}
                  </button>
                </form>
              </div>

              {/* Updates List */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-concrete/50 dark:bg-steel/10 border-b border-steel/20 dark:border-steel/40 text-[10px] font-mono text-steel dark:text-steel/80 uppercase tracking-[0.2em]">
                        <th className="p-6 font-normal">Date</th>
                        <th className="p-6 font-normal">Client</th>
                        <th className="p-6 font-normal">Title</th>
                        <th className="p-6 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel/10">
                      {initialLoading ? (
                        <tr>
                          <td colSpan={4}>{renderSkeleton()}</td>
                        </tr>
                      ) : updates.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-16 text-center text-steel font-light"
                          >
                            <FileText
                              size={32}
                              className="mx-auto mb-4 opacity-20"
                              strokeWidth={1}
                            />
                            <p>No project updates posted yet.</p>
                          </td>
                        </tr>
                      ) : (
                        updates.map((upd) => {
                          const clientEmail =
                            clients.find((c) => c.id === upd.clientId)?.email ||
                            upd.clientId;
                          return (
                            <tr
                              key={upd.id}
                              className="hover:bg-concrete/30 dark:hover:bg-steel/10 transition-colors group"
                            >
                              <td className="p-6 text-xs font-mono text-charcoal/80 dark:text-concrete/80">
                                {upd.createdAt?.toDate
                                  ? upd.createdAt.toDate().toLocaleDateString()
                                  : "Just now"}
                              </td>
                              <td className="p-6 font-medium text-charcoal dark:text-concrete text-sm">
                                {clientEmail}
                              </td>
                              <td className="p-6 text-sm text-charcoal/80 dark:text-concrete/80 font-light">
                                {upd.title}
                              </td>
                              <td className="p-6 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingUpdateId(upd.id);
                                    setNewUpdate({
                                      clientId: upd.clientId,
                                      title: upd.title,
                                      description: upd.description,
                                      imageUrl: upd.imageUrl || "",
                                    });
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="p-2 text-steel hover:text-accent transition-colors inline-block"
                                  title="Edit Update"
                                >
                                  <Edit size={16} strokeWidth={1.5} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: "update",
                                      id: upd.id,
                                    })
                                  }
                                  className="p-2 text-steel hover:text-red-600 dark:hover:text-red-500 transition-colors inline-block"
                                  title="Delete Update"
                                >
                                  <Trash2 size={16} strokeWidth={1.5} />
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

          {/* Milestones Tab */}
          {activeTab === "milestones" && (
            <div className="space-y-8">
              {/* Create/Edit Milestone Form */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-display text-2xl font-light tracking-tight flex items-center gap-3 text-charcoal dark:text-concrete">
                    {editingMilestoneId ? (
                      <Edit
                        className="text-accent"
                        size={24}
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Calendar
                        className="text-accent"
                        size={24}
                        strokeWidth={1.5}
                      />
                    )}
                    {editingMilestoneId
                      ? "Edit Project Milestone"
                      : "Add Project Milestone"}
                  </h2>
                  {editingMilestoneId && (
                    <button
                      onClick={() => {
                        setEditingMilestoneId(null);
                        setNewMilestone({
                          clientId: "",
                          title: "",
                          status: "upcoming",
                          order: milestones.length + 1,
                        });
                      }}
                      className="text-xs font-mono uppercase tracking-widest text-steel hover:text-charcoal dark:hover:text-concrete transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newMilestone.clientId || !newMilestone.title) return;
                    setIsCreatingMilestone(true);
                    try {
                      if (editingMilestoneId) {
                        await updateDoc(
                          doc(db, "milestones", editingMilestoneId),
                          {
                            ...newMilestone,
                          },
                        );
                      } else {
                        await addDoc(collection(db, "milestones"), {
                          ...newMilestone,
                          createdAt: serverTimestamp(),
                        });
                      }
                      setNewMilestone({
                        clientId: "",
                        title: "",
                        status: "upcoming",
                        order: milestones.length + 1,
                      });
                      setEditingMilestoneId(null);
                      fetchMilestones();
                    } catch (error) {
                      handleFirestoreError(
                        error,
                        editingMilestoneId
                          ? OperationType.UPDATE
                          : OperationType.CREATE,
                        "milestones",
                      );
                    } finally {
                      setIsCreatingMilestone(false);
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                        Select Client *
                      </label>
                      <select
                        value={newMilestone.clientId}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            clientId: e.target.value,
                          })
                        }
                        className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete"
                        required
                      >
                        <option value="" className="dark:bg-charcoal">
                          -- Select a Client --
                        </option>
                        {clients.map((c) => (
                          <option
                            key={c.id}
                            value={c.id}
                            className="dark:bg-charcoal"
                          >
                            {c.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                        Milestone Title *
                      </label>
                      <input
                        type="text"
                        value={newMilestone.title}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete placeholder:text-steel/50 dark:placeholder:text-steel/40"
                        placeholder="e.g., Phase 1: Design"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                        Status *
                      </label>
                      <select
                        value={newMilestone.status}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            status: e.target.value as any,
                          })
                        }
                        className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete"
                        required
                      >
                        <option value="upcoming" className="dark:bg-charcoal">
                          Upcoming
                        </option>
                        <option
                          value="in-progress"
                          className="dark:bg-charcoal"
                        >
                          In Progress
                        </option>
                        <option value="completed" className="dark:bg-charcoal">
                          Completed
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">
                        Order (Number) *
                      </label>
                      <input
                        type="number"
                        value={newMilestone.order}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-transparent border-b border-steel/30 dark:border-steel/60 py-3 text-sm focus:outline-none focus:border-accent dark:focus:border-accent transition-colors font-light text-charcoal dark:text-concrete placeholder:text-steel/50 dark:placeholder:text-steel/40"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isCreatingMilestone}
                    className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-colors disabled:opacity-50"
                  >
                    {isCreatingMilestone
                      ? editingMilestoneId
                        ? "Updating..."
                        : "Adding..."
                      : editingMilestoneId
                        ? "Update Milestone"
                        : "Add Milestone"}
                  </button>
                </form>
              </div>

              {/* Milestones List */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-concrete/50 dark:bg-steel/10 border-b border-steel/20 dark:border-steel/40 text-[10px] font-mono text-steel dark:text-steel/80 uppercase tracking-[0.2em]">
                        <th className="p-6 font-normal">Order</th>
                        <th className="p-6 font-normal">Client</th>
                        <th className="p-6 font-normal">Title</th>
                        <th className="p-6 font-normal">Status</th>
                        <th className="p-6 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel/10">
                      {initialLoading ? (
                        <tr>
                          <td colSpan={5}>{renderSkeleton()}</td>
                        </tr>
                      ) : milestones.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-16 text-center text-steel font-light"
                          >
                            <Calendar
                              size={32}
                              className="mx-auto mb-4 opacity-20"
                              strokeWidth={1}
                            />
                            <p>No project milestones set yet.</p>
                          </td>
                        </tr>
                      ) : (
                        milestones.map((mstone) => {
                          const clientEmail =
                            clients.find((c) => c.id === mstone.clientId)
                              ?.email || mstone.clientId;
                          return (
                            <tr
                              key={mstone.id}
                              className="hover:bg-concrete/30 dark:hover:bg-steel/10 transition-colors group"
                            >
                              <td className="p-6 text-xs font-mono text-charcoal/80 dark:text-concrete/80">
                                {mstone.order}
                              </td>
                              <td className="p-6 font-medium text-charcoal dark:text-concrete text-sm">
                                {clientEmail}
                              </td>
                              <td className="p-6 text-sm text-charcoal/80 dark:text-concrete/80 font-light">
                                {mstone.title}
                              </td>
                              <td className="p-6 text-xs font-mono text-charcoal/80 dark:text-concrete/80 capitalize">
                                {mstone.status.replace("-", " ")}
                              </td>
                              <td className="p-6 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingMilestoneId(mstone.id);
                                    setNewMilestone({
                                      clientId: mstone.clientId,
                                      title: mstone.title,
                                      status: mstone.status,
                                      order: mstone.order,
                                    });
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="p-2 text-steel hover:text-accent transition-colors inline-block"
                                  title="Edit Milestone"
                                >
                                  <Edit size={16} strokeWidth={1.5} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: "milestone",
                                      id: mstone.id,
                                    })
                                  }
                                  className="p-2 text-steel hover:text-red-600 dark:hover:text-red-500 transition-colors inline-block"
                                  title="Delete Milestone"
                                >
                                  <Trash2 size={16} strokeWidth={1.5} />
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
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
              {/* Clients List */}
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-steel/20 dark:border-steel/40 bg-concrete/50 dark:bg-steel/10">
                  <h3 className="font-display text-xl font-light text-charcoal dark:text-concrete flex items-center gap-3">
                    <Users
                      size={18}
                      className="text-accent"
                      strokeWidth={1.5}
                    />
                    Clients
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {clients.length === 0 ? (
                    <div className="p-8 text-center text-steel font-light text-sm">
                      No clients found.
                    </div>
                  ) : (
                    <div className="divide-y divide-steel/10">
                      {clients.map((client) => {
                        const clientMessages = messages.filter(
                          (m) =>
                            m.senderId === client.id ||
                            m.receiverId === client.id,
                        );
                        const lastMessage =
                          clientMessages.length > 0
                            ? clientMessages[clientMessages.length - 1]
                            : null;
                        const unreadCount = clientMessages.filter(
                          (m) => m.senderId === client.id && !m.read,
                        ).length;

                        return (
                          <button
                            key={client.id}
                            onClick={() => setSelectedChatClient(client.id)}
                            className={`w-full text-left p-6 hover:bg-concrete/50 dark:hover:bg-steel/10 transition-colors flex flex-col gap-2 ${selectedChatClient === client.id ? "bg-accent/5 dark:bg-accent/10 border-l-2 border-accent" : "border-l-2 border-transparent"}`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium text-charcoal dark:text-concrete text-sm truncate pr-4">
                                {client.officialName || client.email}
                              </span>
                              {unreadCount > 0 && (
                                <span className="bg-accent text-concrete text-[10px] px-2 py-0.5 rounded-full shrink-0">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-xs text-steel dark:text-steel/80 truncate font-light">
                                {lastMessage.senderId === user?.uid
                                  ? "You: "
                                  : ""}
                                {lastMessage.text}
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
              <div className="lg:col-span-2 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 flex flex-col">
                {selectedChatClient ? (
                  <>
                    <div className="p-6 border-b border-steel/20 dark:border-steel/40 bg-concrete/50 dark:bg-steel/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <MessageSquare size={18} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-light text-charcoal dark:text-concrete">
                          {
                            clients.find((c) => c.id === selectedChatClient)
                              ?.officialName || clients.find((c) => c.id === selectedChatClient)?.email
                          }
                        </h3>
                        <p className="text-[10px] font-mono text-steel dark:text-steel/80 uppercase tracking-[0.2em] mt-1">
                          Client Chat
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                      {messages.filter(
                        (m) =>
                          m.senderId === selectedChatClient ||
                          m.receiverId === selectedChatClient,
                      ).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-steel text-sm font-light">
                          No messages yet. Start the conversation.
                        </div>
                      ) : (
                        messages
                          .filter(
                            (m) =>
                              m.senderId === selectedChatClient ||
                              m.receiverId === selectedChatClient,
                          )
                          .map((msg) => {
                            const isMine = msg.senderId === user?.uid;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] p-4 ${isMine ? "bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal rounded-tl-xl rounded-tr-xl rounded-bl-xl" : "bg-concrete dark:bg-steel/10 text-charcoal dark:text-concrete border border-steel/20 dark:border-steel/40 rounded-tl-xl rounded-tr-xl rounded-br-xl"}`}
                                >
                                  <p className="text-sm font-light leading-relaxed">
                                    {msg.text}
                                  </p>
                                  <span className="text-[10px] font-mono opacity-50 mt-2 block text-right uppercase tracking-widest">
                                    {msg.createdAt?.toDate
                                      ? msg.createdAt
                                          .toDate()
                                          .toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                      : "Sending..."}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-6 border-t border-steel/20 dark:border-steel/40 bg-concrete/30 dark:bg-steel/10">
                      <form onSubmit={handleSendReply} className="flex gap-4">
                        <input
                          type="text"
                          value={adminReply}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 px-4 py-3 text-sm font-light focus:outline-none focus:border-accent dark:focus:border-accent text-charcoal dark:text-concrete transition-colors"
                          disabled={sendingReply}
                        />
                        <button
                          type="submit"
                          disabled={!adminReply.trim() || sendingReply}
                          className="bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-6 py-3 hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
                        >
                          <Send size={16} strokeWidth={1.5} />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-steel p-8 text-center">
                    <MessageSquare
                      size={48}
                      className="mb-6 opacity-20"
                      strokeWidth={1}
                    />
                    <p className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-2">
                      No Chat Selected
                    </p>
                    <p className="text-sm font-light">
                      Select a client from the list to view and send messages.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === "newsletter" && (
            <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-concrete/50 dark:bg-steel/10 border-b border-steel/20 dark:border-steel/40 text-[10px] font-mono text-steel dark:text-steel/80 uppercase tracking-[0.2em]">
                      <th className="p-6 font-normal">Date Subscribed</th>
                      <th className="p-6 font-normal">Email Address</th>
                      <th className="p-6 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel/10">
                    {initialLoading ? (
                      <tr>
                        <td colSpan={3}>{renderSkeleton()}</td>
                      </tr>
                    ) : subscribers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-16 text-center text-steel font-light"
                        >
                          <Users
                            size={32}
                            className="mx-auto mb-4 opacity-20"
                            strokeWidth={1}
                          />
                          <p>No subscribers found.</p>
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr
                          key={sub.id}
                          className="hover:bg-concrete/30 dark:hover:bg-steel/10 transition-colors group"
                        >
                          <td className="p-6 text-xs font-mono text-charcoal/80 dark:text-concrete/80">
                            {sub.createdAt?.toDate
                              ? sub.createdAt.toDate().toLocaleDateString()
                              : "Just now"}
                          </td>
                          <td className="p-6 font-medium text-charcoal dark:text-concrete flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                              <Mail size={14} strokeWidth={1.5} />
                            </div>
                            {sub.email}
                          </td>
                          <td className="p-6 text-right">
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "newsletter",
                                  id: sub.id,
                                })
                              }
                              className="p-2 text-steel hover:text-red-600 dark:hover:text-red-500 transition-colors inline-block"
                              title="Delete Subscriber"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
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
          {activeTab === "documents" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Client List */}
              <div className="lg:col-span-1 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden flex flex-col h-[600px]">
                <div className="p-6 border-b border-steel/20 dark:border-steel/40 bg-concrete/50 dark:bg-steel/10">
                  <h3 className="font-display text-xl font-light text-charcoal dark:text-concrete flex items-center gap-3">
                    <Users
                      size={18}
                      className="text-accent"
                      strokeWidth={1.5}
                    />
                    Clients
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {clients.length === 0 ? (
                    <div className="p-8 text-center text-steel font-light text-sm">
                      <p>No clients found.</p>
                    </div>
                  ) : (
                    clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedDocClient(client.id)}
                        className={`w-full text-left p-4 mb-2 transition-colors flex items-center justify-between ${selectedDocClient === client.id ? "bg-accent/5 dark:bg-accent/10 border border-accent/30" : "hover:bg-concrete/50 dark:hover:bg-steel/10 border border-transparent"}`}
                      >
                        <div>
                          <p className="font-medium text-charcoal dark:text-concrete text-sm truncate">
                            {client.officialName || client.email}
                          </p>
                          <p className="text-[10px] text-steel font-mono mt-1 uppercase tracking-widest">
                            ID: {client.id.substring(0, 8)}... | {client.email}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Document List */}
              <div className="lg:col-span-2 bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 flex flex-col h-[600px]">
                {selectedDocClient ? (
                  <>
                    <div className="p-6 border-b border-steel/20 dark:border-steel/40 flex justify-between items-center bg-concrete/50 dark:bg-steel/10">
                      <div>
                        <h3 className="font-display text-xl font-light text-charcoal dark:text-concrete flex items-center gap-3">
                          <FileText
                            size={18}
                            className="text-accent"
                            strokeWidth={1.5}
                          />
                          Client Documents
                        </h3>
                        <p className="text-[10px] text-steel mt-2 font-mono uppercase tracking-widest">
                          {
                            clients.find((c) => c.id === selectedDocClient)
                              ?.officialName || clients.find((c) => c.id === selectedDocClient)?.email
                          }
                        </p>
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
                          className={`cursor-pointer flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-6 py-3 hover:bg-accent dark:hover:bg-accent hover:text-concrete dark:hover:text-charcoal transition-colors ${uploadingDoc ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          <Upload size={14} strokeWidth={1.5} />
                          {uploadingDoc ? "Uploading..." : "Upload Document"}
                        </label>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-4 bg-red-50 text-red-600 text-xs font-mono uppercase tracking-widest border-b border-red-100">
                        {uploadError}
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      {documents.filter((d) => d.clientId === selectedDocClient)
                        .length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-steel">
                          <FileText
                            size={48}
                            className="mb-6 opacity-20"
                            strokeWidth={1}
                          />
                          <p className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-2">
                            No Documents
                          </p>
                          <p className="text-sm font-light">
                            Upload documents to share with this client.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {documents
                            .filter((d) => d.clientId === selectedDocClient)
                            .map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-6 border border-steel/20 dark:border-steel/40 hover:border-accent/30 dark:hover:border-accent/50 transition-colors group bg-concrete dark:bg-charcoal"
                              >
                                <div className="flex items-center gap-6 overflow-hidden">
                                  <div className="w-12 h-12 bg-concrete/50 dark:bg-steel/10 flex items-center justify-center text-steel shrink-0">
                                    <FileText size={24} strokeWidth={1} />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p
                                      className="font-medium text-charcoal dark:text-concrete text-sm truncate"
                                      title={doc.fileName}
                                    >
                                      {doc.fileName}
                                    </p>
                                    <p className="text-[10px] font-mono text-steel mt-2 uppercase tracking-widest">
                                      {doc.createdAt?.toDate
                                        ? doc.createdAt
                                            .toDate()
                                            .toLocaleDateString()
                                        : "Just now"}{" "}
                                      •
                                      {doc.uploadedBy === user?.uid
                                        ? " Uploaded by you"
                                        : " Uploaded by client"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-2 text-steel hover:text-accent transition-colors"
                                    title="Download"
                                  >
                                    <Download size={18} strokeWidth={1.5} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: "document",
                                        id: doc.id,
                                      })
                                    }
                                    className="p-2 text-steel hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} strokeWidth={1.5} />
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
                    <FileText
                      size={48}
                      className="mb-6 opacity-20"
                      strokeWidth={1}
                    />
                    <p className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-2">
                      No Client Selected
                    </p>
                    <p className="text-sm font-light">
                      Select a client from the list to view and manage their
                      documents.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 overflow-hidden">
              <div className="p-8 border-b border-steel/20 dark:border-steel/40 flex justify-between items-center bg-concrete/50 dark:bg-steel/10">
                <h3 className="font-display text-2xl font-light text-charcoal dark:text-concrete flex items-center gap-3">
                  <Users size={24} className="text-accent" strokeWidth={1.5} />
                  User Management
                </h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-concrete/30 dark:bg-steel/10 border-b border-steel/20 dark:border-steel/40">
                      <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-steel font-medium">
                        Identity & Portfolio
                      </th>
                      <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-steel font-medium">
                        Designation & Role
                      </th>
                      <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-steel font-medium text-right">
                        Access Controls
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-8 text-center text-steel font-light text-sm"
                        >
                          No users found in database.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-steel/10 dark:border-steel/20 hover:bg-concrete/20 dark:hover:bg-steel/10 transition-colors"
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                                {u.officialName
                                  ? u.officialName.charAt(0).toUpperCase()
                                  : u.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-charcoal dark:text-concrete text-sm flex items-center gap-2">
                                  {u.officialName || "Identity Not Established"}
                                  {u.officialName ? (
                                    <CheckCircle2 size={12} className="text-green-500" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Incomplete Profile" />
                                  )}
                                </p>
                                <p className="text-[10px] text-steel font-mono uppercase tracking-widest">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <p className="text-xs text-charcoal/80 dark:text-concrete/80 font-light mb-2">
                              {u.title || "Role details pending"}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest ${
                                u.role === "admin"
                                  ? "bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal"
                                  : u.role.includes("staff") ||
                                      [
                                        "project_manager",
                                        "architect",
                                        "surveyor",
                                      ].includes(u.role)
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : u.role === "client"
                                      ? "bg-accent/10 text-accent border border-accent/20"
                                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}
                            >
                              {u.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex flex-col items-end gap-4">
                              <div className="flex items-center gap-4">
                                {u.role === "client" && (
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono text-steel uppercase tracking-widest">
                                        Lead PM:
                                      </span>
                                      <select
                                        value={u.assignedPM || ""}
                                        onChange={(e) =>
                                          assignManagerToClient(
                                            u.id,
                                            e.target.value,
                                          )
                                        }
                                        className="bg-transparent border border-steel/20 dark:border-steel/40 text-charcoal dark:text-concrete text-[10px] font-mono uppercase tracking-widest rounded px-3 py-2 focus:outline-none focus:border-accent dark:focus:border-accent transition-colors"
                                      >
                                        <option
                                          value=""
                                          className="bg-concrete dark:bg-charcoal"
                                        >
                                          Unassigned
                                        </option>
                                        {projectManagers.map((pm) => (
                                          <option
                                            key={pm.id}
                                            value={pm.id}
                                            className="bg-concrete dark:bg-charcoal"
                                          >
                                            {pm.officialName ||
                                              pm.email.split("@")[0]}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="flex flex-wrap justify-end gap-1 mt-1 max-w-[200px]">
                                      <p className="text-[8px] font-mono text-steel uppercase tracking-widest w-full text-right mb-1">
                                        Additional Staff:
                                      </p>
                                      {allStaff.map((staff) => (
                                        <button
                                          key={staff.id}
                                          onClick={() =>
                                            toggleStaffAssignment(
                                              u.id,
                                              staff.id,
                                              u.assignedStaff || [],
                                            )
                                          }
                                          className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-all ${
                                            (u.assignedStaff || []).includes(
                                              staff.id,
                                            )
                                              ? "bg-accent text-white border border-accent"
                                              : "bg-transparent border border-steel/20 text-steel hover:border-accent"
                                          }`}
                                          title={
                                            staff.officialName || staff.email
                                          }
                                        >
                                          {staff.role.charAt(0).toUpperCase()}:{" "}
                                          {staff.officialName?.split(" ")[0] ||
                                            staff.email
                                              .split("@")[0]
                                              .substring(0, 5)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {(u.role === 'pending' || u.role === 'pending_staff') && (
                                  <button
                                    onClick={() => updateUserRole(u.id, u.role === 'pending' ? 'client' : 'architect')}
                                    className="bg-accent text-white px-3 py-2 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest hover:bg-accent/80 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2"
                                  >
                                    <Check size={12} /> Approve Access
                                  </button>
                                )}
                                <select
                                  value={u.role}
                                  onChange={(e) =>
                                    updateUserRole(u.id, e.target.value)
                                  }
                                  className="bg-transparent border border-steel/20 dark:border-steel/40 text-charcoal dark:text-concrete text-[10px] font-mono uppercase tracking-widest rounded px-3 py-2 focus:outline-none focus:border-accent dark:focus:border-accent transition-colors"
                                  disabled={u.id === user?.uid}
                                >
                                  <option
                                    value="pending"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Pending Client
                                  </option>
                                  <option
                                    value="pending_staff"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Pending Staff
                                  </option>
                                  <option
                                    value="client"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Active Client
                                  </option>
                                  <option
                                    value="project_manager"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Project Manager
                                  </option>
                                  <option
                                    value="architect"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Architect
                                  </option>
                                  <option
                                    value="engineer"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Engineer
                                  </option>
                                  <option
                                    value="surveyor"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Surveyor
                                  </option>
                                  <option
                                    value="planner"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Planner
                                  </option>
                                  <option
                                    value="financial_analyst"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    Financial Analyst
                                  </option>
                                  <option
                                    value="admin"
                                    className="bg-concrete dark:bg-charcoal"
                                  >
                                    System Admin
                                  </option>
                                </select>
                              </div>
                              <p className="text-[9px] text-steel/60 font-mono tracking-tighter">
                                UID: {u.id.substring(0, 12)}...
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="bg-concrete dark:bg-charcoal border border-steel/20 dark:border-steel/40 p-8">
                <h2 className="font-display text-2xl font-light text-charcoal dark:text-concrete mb-8 flex items-center gap-3">
                  <Shield size={20} className="text-accent" strokeWidth={1.5} />
                  System Administrative Nexus
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-steel mb-6">Platform Administrators</h3>
                    <div className="space-y-4">
                      {admins.map((adm) => (
                        <div key={adm.id} className="flex items-center justify-between p-4 bg-charcoal/5 dark:bg-concrete/5 border border-steel/10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent">
                              <Shield size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-charcoal dark:text-concrete">{adm.email}</p>
                              <p className="text-[10px] font-mono text-steel uppercase tracking-widest">{adm.id}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setDeleteConfirm({ type: "admin", id: adm.id })}
                            className="p-2 text-steel hover:text-red-600 transition-colors"
                            title="Remove Admin Privileges"
                            disabled={adm.email === "machariag605@gmail.com"}
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-steel/10">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-4">Elevate Professional to Admin</h4>
                      <select 
                        className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/30 p-4 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                        onChange={(e) => {
                          const u = users.find(u => u.id === e.target.value);
                          if (u) addAdmin(u.id, u.email);
                        }}
                        value=""
                      >
                        <option value="" disabled>Select User to Elevate</option>
                        {users.filter(u => !admins.find(a => a.id === u.id)).map(u => (
                          <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-steel mb-6">Security Compliance Audit</h3>
                    <div className="space-y-6">
                      <div className="p-6 bg-accent/5 border border-accent/20">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent mt-1">
                            <Shield size={18} strokeWidth={1.5} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-charcoal dark:text-concrete mb-1">Administrative Role Migration</h4>
                            <p className="text-[11px] text-charcoal/70 dark:text-concrete/70 leading-relaxed">
                              Hardcoded access lists have been successfully migrated to the 'admins' collection. The system now utilizes document exists() checks for role verification.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-charcoal/5 dark:bg-concrete/5 border border-steel/10">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-steel mb-4">2FA Staff Verification Status</h4>
                        <div className="space-y-3">
                          {users.filter(u => u.role !== 'client' && u.role !== 'pending' && u.role !== 'unauthorized').map(u => (
                            <div key={u.id} className="flex items-center justify-between py-2 border-b border-steel/5 last:border-0">
                              <span className="text-[11px] text-charcoal dark:text-concrete">{u.email}</span>
                              <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded ${u.hasConfirmed2FA ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                {u.hasConfirmed2FA ? '2FA Confirmed' : 'Verification Needed'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cms" && (
            <div className="space-y-8 animate-fadeIn">
              {/* CMS Metric Highlighters */}
              {(() => {
                const draftCount = (allResources && allResources.length > 0 ? allResources : DEFAULT_RESOURCES.map(r => ({ ...r, id: r.key }))).filter(
                  res => (cmsEditValues[res.key] !== undefined && cmsEditValues[res.key] !== res.value)
                ).length;

                const listToRender = (allResources && allResources.length > 0 ? allResources : DEFAULT_RESOURCES.map(r => ({ ...r, id: r.key })));
                const textCount = listToRender.filter(r => r.type === "text").length;
                const mediaCount = listToRender.filter(r => r.type === "image" || r.type === "video").length;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border border-steel/20 dark:border-steel/40 bg-white dark:bg-[#0a0a0c] p-6 flex flex-col justify-between rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-steel font-semibold border-b border-steel/10 pb-2">Total Variables</span>
                      <div className="flex items-baseline gap-2 mt-6">
                        <span className="text-5xl font-sans font-bold tracking-tight text-charcoal dark:text-concrete">
                          {listToRender.length}
                        </span>
                        <span className="text-xs text-steel font-mono uppercase tracking-widest">layers</span>
                      </div>
                    </div>

                    <div className="border border-steel/20 dark:border-steel/40 bg-white dark:bg-[#0a0a0c] p-6 flex flex-col justify-between rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-steel font-semibold border-b border-steel/10 pb-2">Unpublished Amends</span>
                      <div className="flex items-baseline gap-2 mt-6">
                        <span className={`text-5xl font-sans font-bold tracking-tight ${draftCount > 0 ? "text-amber-500" : "text-steel"}`}>
                          {draftCount}
                        </span>
                        <span className="text-xs text-steel font-mono uppercase tracking-widest">drafts</span>
                      </div>
                    </div>

                    <div className="border border-steel/20 dark:border-steel/40 bg-white dark:bg-[#0a0a0c] p-6 flex flex-col justify-between rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-steel font-semibold border-b border-steel/10 pb-2">Text Blocks</span>
                      <div className="flex items-baseline gap-2 mt-6">
                        <span className="text-5xl font-sans font-bold tracking-tight text-charcoal dark:text-concrete">
                          {textCount}
                        </span>
                        <span className="text-xs text-steel font-mono uppercase tracking-widest">slots</span>
                      </div>
                    </div>

                    <div className="border border-steel/20 dark:border-steel/40 bg-white dark:bg-[#0a0a0c] p-6 flex flex-col justify-between rounded-sm shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-steel font-semibold border-b border-steel/10 pb-2">Rich Media</span>
                      <div className="flex items-baseline gap-2 mt-6">
                        <span className="text-5xl font-sans font-bold tracking-tight text-charcoal dark:text-concrete">
                          {mediaCount}
                        </span>
                        <span className="text-xs text-steel font-mono uppercase tracking-widest">assets</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-white dark:bg-[#0a0a0c] border border-steel/20 dark:border-steel/40 p-4 md:p-8 shadow-sm">
                <div className="flex flex-col xl:flex-row gap-8 items-start relative">
                  <div className="w-full xl:w-1/2 flex flex-col space-y-8">
                    {/* Header Action Row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-steel/10">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="font-mono text-[9px] uppercase tracking-widest bg-charcoal text-white dark:bg-white dark:text-charcoal px-2 py-0.5 rounded-sm">Content Editor</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-charcoal dark:text-concrete flex items-center gap-3">
                      Global Content Management
                    </h2>
                    <p className="text-sm text-steel mt-2 font-sans leading-relaxed">
                      Intuitive wireframe control interface to seamlessly inject and sync real-time visual assets, firm information, service descriptions, and portal guidelines.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowCustomForm(!showCustomForm);
                        setNewCustomSuccess("");
                        setNewCustomError("");
                      }}
                      className="px-4 py-2 bg-charcoal/5 dark:bg-concrete/5 text-charcoal dark:text-concrete font-mono text-[10px] uppercase tracking-widest hover:bg-steel/10 transition-colors flex items-center gap-2 rounded-sm border border-steel/10"
                    >
                      {showCustomForm ? "Hide Details" : "+ Custom Key"}
                    </button>

                    {confirmReset ? (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-1 rounded-sm">
                        <span className="text-[9px] font-mono text-red-600 dark:text-red-400 uppercase tracking-widest animate-pulse px-2">Confirm reset?</span>
                        <button
                          onClick={async () => {
                            setLoading(true);
                            try {
                              await resetToDefaults(user?.email || "admin@danuthia.com");
                              setConfirmReset(false);
                              setCmsEditValues({});
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white font-mono text-[9px] uppercase tracking-widest rounded-sm hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="px-3 py-1 bg-white/50 dark:bg-charcoal/50 text-charcoal dark:text-concrete font-mono text-[9px] uppercase tracking-widest rounded-sm hover:bg-steel/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReset(true)}
                        className="px-4 py-2 border border-steel/20 text-steel font-mono text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/30 transition-all rounded-sm flex items-center gap-2"
                      >
                        <RotateCcw size={12} /> Defaults
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Field Variable Creator Form Panel */}
                {showCustomForm && (
                  <div className="mb-8 border border-accent/20 bg-accent/5 p-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-accent/10">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-accent animate-spin" style={{ animationDuration: '4s' }} />
                        <h3 className="font-mono text-[11px] uppercase tracking-widest text-accent font-bold">Dynamic Schema Key Registration</h3>
                      </div>
                      <button onClick={() => setShowCustomForm(false)} className="text-steel hover:text-charcoal dark:hover:text-concrete">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-steel mb-1">Resource Key Name (Unique/Lowercase)</label>
                        <input
                          type="text"
                          placeholder="e.g. project_banner_notice"
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="w-full bg-concrete dark:bg-charcoal border border-steel/30 p-2.5 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-steel mb-1">Friendly Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Pop-up Notice Title"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full bg-concrete dark:bg-charcoal border border-steel/30 p-2.5 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-steel mb-1">Data Layer Type</label>
                        <select
                          value={customType}
                          onChange={(e: any) => setCustomType(e.target.value)}
                          className="w-full bg-concrete dark:bg-charcoal border border-steel/30 p-2.5 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                        >
                          <option value="text">text (strings/paragraphs)</option>
                          <option value="image">image (unsplash/base64 graphics)</option>
                          <option value="video">video (mpeg/webm stream loops)</option>
                          <option value="link">link (URLs/navigation anchors)</option>
                          <option value="number">number (structural stats/integers)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-steel mb-1">Visual Group Classifier</label>
                        <select
                          value={customGroup}
                          onChange={(e) => setCustomGroup(e.target.value)}
                          className="w-full bg-concrete dark:bg-charcoal border border-steel/30 p-2.5 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                        >
                          <option value="Homepage">Homepage</option>
                          <option value="Service Page">Service Page</option>
                          <option value="Portfolio">Portfolio</option>
                          <option value="Consultation Form">Consultation Form</option>
                          <option value="Sustainability">Sustainability</option>
                          <option value="About Section">About Section</option>
                          <option value="Logbook">Logbook</option>
                          <option value="Global">Global Elements</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-steel mb-1">Payload Value / Initial Content</label>
                      <textarea
                        rows={2}
                        placeholder="Type initial layout string, image URL, or click preset shelf below..."
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        className="w-full bg-concrete dark:bg-charcoal border border-steel/30 p-2.5 font-sans text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-steel">
                        {newCustomError && <span className="text-red-500 font-bold">Error: {newCustomError}</span>}
                        {newCustomSuccess && <span className="text-green-600 font-bold animate-pulse">✓ {newCustomSuccess}</span>}
                      </div>
                      <button
                        onClick={async () => {
                          setNewCustomError("");
                          setNewCustomSuccess("");
                          if (!customKey || !customName || !customValue) {
                            setNewCustomError("All fields are mandatory to register a custom resource schema.");
                            return;
                          }
                          const listToRender = (allResources && allResources.length > 0 ? allResources : DEFAULT_RESOURCES.map(r => ({ ...r, id: r.key })));
                          if (listToRender.some(res => res.key === customKey)) {
                            setNewCustomError(`A content key named '${customKey}' already exists in Firestore schemas.`);
                            return;
                          }

                          setLoading(true);
                          try {
                            await updateResource(customKey, customValue, user?.email || "admin@danuthia.com", {
                              name: customName,
                              type: customType,
                              group: customGroup
                            });
                            setNewCustomSuccess(`Registered successfully! Variable key '${customKey}' is now operational.`);
                            setCustomKey("");
                            setCustomName("");
                            setCustomValue("");
                            setTimeout(() => {
                              setShowCustomForm(false);
                            }, 3000);
                          } catch (err) {
                            setNewCustomError("Firestore rules rejected creation. Check permissions.");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="px-5 py-2.5 bg-accent text-concrete font-mono text-[10px] uppercase tracking-widest hover:bg-accent/90"
                      >
                        Publish Key to Schemas
                      </button>
                    </div>
                  </div>
                )}

                {/* Filters and Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
                  <div className="flex gap-2 p-1 bg-charcoal/5 dark:bg-concrete/5 border border-steel/10 overflow-x-auto custom-scrollbar">
                    {["All", "Homepage", "Service Page", "Portfolio", "Consultation Form", "Sustainability", "About Section", "Logbook", "Global"].map((grp) => (
                      <button
                        key={grp}
                        onClick={() => setCmsGroupFilter(grp)}
                        className={`px-4 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors ${cmsGroupFilter === grp ? "bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 md:max-w-md">
                    <input
                      type="text"
                      placeholder="Search active Content keys & labels..."
                      value={cmsSearchText}
                      onChange={(e) => setCmsSearchText(e.target.value)}
                      className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/30 p-3 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* CMS List */}
                <div className="space-y-6">
                  {(() => {
                    const listToRender = (allResources && allResources.length > 0 ? allResources : DEFAULT_RESOURCES.map(r => ({ ...r, id: r.key }))).filter(res => {
                      const matchesGroup = cmsGroupFilter === "All" || res.group === cmsGroupFilter;
                      const matchesSearch = res.name.toLowerCase().includes(cmsSearchText.toLowerCase()) || res.key.toLowerCase().includes(cmsSearchText.toLowerCase());
                      return matchesGroup && matchesSearch;
                    });

                    if (listToRender.length === 0) {
                      return (
                        <div className="py-12 text-center border border-dashed border-steel/20">
                          <p className="font-mono text-xs text-steel uppercase tracking-widest">No managed resources match the query.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-6">
                        {listToRender.map((res) => {
                          const currentVal = cmsEditValues[res.key] ?? res.value;
                          const isEdited = currentVal !== res.value;
                          const status = saveStatus[res.key] || "idle";

                          const onPublish = async (valToSave: string) => {
                            setSaveStatus(prev => ({ ...prev, [res.key]: "saving" }));
                            try {
                              await updateResource(res.key, valToSave, user?.email || "admin@danuthia.com");
                              setSaveStatus(prev => ({ ...prev, [res.key]: "saved" }));
                              setTimeout(() => {
                                setSaveStatus(prev => ({ ...prev, [res.key]: "idle" }));
                              }, 2000);
                            } catch (err) {
                              console.error(err);
                              setSaveStatus(prev => ({ ...prev, [res.key]: "error" }));
                            }
                          };

                          return (
                            <div 
                              key={res.key} 
                              id={`cms-input-${res.key}`}
                              className={`group relative overflow-hidden transition-all duration-300 border-l-[3px] border hover:shadow-lg ${isEdited ? "border-accent bg-accent/5 border-l-accent" : "border-steel/20 dark:border-steel/40 bg-white dark:bg-[#0f0f11] border-l-transparent hover:border-l-accent"}`}
                            >
                              <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8 items-start justify-between">
                                <div className="flex-1 space-y-5 w-full">
                                  <div className="flex items-center justify-between border-b border-steel/10 pb-3">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] uppercase tracking-widest bg-charcoal/5 dark:bg-concrete/5 text-steel px-2 py-0.5 rounded-sm">
                                          {res.group}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-steel/30"></div>
                                        <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${res.type === 'image' || res.type === 'video' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                          {res.type}
                                        </span>
                                        {isEdited && (
                                          <>
                                            <div className="w-1 h-1 rounded-full bg-steel/30"></div>
                                            <span className="font-mono text-[9px] uppercase tracking-widest bg-amber-500/20 text-amber-600 dark:text-amber-500 px-2 py-0.5 flex items-center gap-1.5 animate-pulse font-semibold">
                                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Unsaved Draft
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 mt-2">
                                        <h4 className="font-sans text-base font-semibold text-charcoal dark:text-concrete">
                                          {res.name}
                                        </h4>
                                        <span className="font-mono text-[10px] text-steel/60">
                                          {res.key}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="hidden xl:flex items-center gap-2">
                                      {isEdited && (
                                        <button
                                          onClick={() => setCmsEditValues(prev => ({ ...prev, [res.key]: res.value }))}
                                          className="p-1.5 text-steel hover:text-red-500 transition-colors"
                                          title="Discard Changes"
                                        >
                                          <Undo size={14} />
                                        </button>
                                      )}
                                      <button
                                          onClick={() => onPublish(currentVal)}
                                          disabled={status === "saving" || currentVal === res.value}
                                          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${status === "saved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : status === "saving" ? "bg-amber-500/10 text-amber-600" : currentVal === res.value ? "bg-charcoal/5 dark:bg-concrete/5 text-steel opacity-50 cursor-not-allowed" : "bg-charcoal text-white hover:bg-black dark:bg-white dark:text-charcoal shadow-md"}`}
                                        >
                                          {status === "saved" ? <><Check size={14}/> Published</> : status === "saving" ? "Saving..." : currentVal === res.value ? "Up to date" : "Publish Changes"}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {(res.type === "text" || res.type === "number") ? (
                                      <div className="relative group/input">
                                        <textarea
                                          rows={res.type === 'text' && res.value.length > 100 ? 4 : 1}
                                          value={currentVal}
                                          onChange={(e) => {
                                            setCmsEditValues(prev => ({ ...prev, [res.key]: e.target.value }));
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                          }}
                                          onFocus={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                          }}
                                          className={`w-full bg-charcoal/5 dark:bg-concrete/5 border-none p-4 rounded-sm font-sans ${res.type === 'text' && res.value.length > 50 ? 'text-sm' : 'text-lg font-medium'} text-charcoal dark:text-concrete outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white dark:focus:bg-charcoal transition-all resize-none overflow-hidden block custom-scrollbar`}
                                        />
                                        <div className="absolute top-2 right-2 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none">
                                          <Edit size={12} className="text-steel/50" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={currentVal}
                                            onChange={(e) => setCmsEditValues(prev => ({ ...prev, [res.key]: e.target.value }))}
                                            placeholder="https://"
                                            className="w-full bg-charcoal/5 dark:bg-concrete/5 border-none p-3 rounded-sm font-mono text-xs text-charcoal dark:text-concrete outline-none focus:ring-1 focus:ring-accent/50 focus:bg-white dark:focus:bg-charcoal transition-all"
                                          />
                                        </div>
                                      </div>
                                    )}

                                  {(res.type === "image" || res.type === "video") && (
                                    <div 
                                      className="border border-dashed border-steel/30 hover:border-accent/50 p-4 transition-colors flex items-center justify-between cursor-pointer group"
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={async (e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) {
                                          setUploadingKeys(prev => ({ ...prev, [res.key]: true }));
                                          setError("");
                                          try {
                                            const storageRef = ref(storage, `cms/${res.key}_${Date.now()}_${file.name}`);
                                            const snapshot = await uploadBytes(storageRef, file);
                                            const downloadURL = await getDownloadURL(snapshot.ref);
                                            
                                            await updateResource(res.key, downloadURL, user?.email || "admin@danuthia.com");
                                            setCmsEditValues(prev => ({ ...prev, [res.key]: downloadURL }));
                                          } catch (err) {
                                            console.error(err);
                                            setError("Failed to upload asset to Firebase Storage. Please check permissions and bucket configuration.");
                                          } finally {
                                            setUploadingKeys(prev => ({ ...prev, [res.key]: false }));
                                          }
                                        }
                                      }}
                                    >
                                      <input
                                        type="file"
                                        id={`file-${res.key}`}
                                        className="hidden"
                                        accept={res.type === "image" ? "image/*" : "video/*"}
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setUploadingKeys(prev => ({ ...prev, [res.key]: true }));
                                            setError("");
                                            let uploadedRef = null;
                                            try {
                                              const storageRef = ref(storage, `cms/${res.key}_${Date.now()}_${file.name}`);
                                              const snapshot = await uploadBytes(storageRef, file);
                                              uploadedRef = snapshot.ref;
                                              const downloadURL = await getDownloadURL(snapshot.ref);
                                              
                                              await updateResource(res.key, downloadURL, user?.email || "admin@danuthia.com");
                                              setCmsEditValues(prev => ({ ...prev, [res.key]: downloadURL }));
                                            } catch (err) {
                                              console.error(err);
                                              if (uploadedRef) {
                                                await deleteObject(uploadedRef).catch(console.error);
                                              }
                                              setError("Failed to upload asset to Firebase Storage. Please check permissions and bucket configuration.");
                                            } finally {
                                              setUploadingKeys(prev => ({ ...prev, [res.key]: false }));
                                            }
                                          }
                                        }}
                                      />
                                      <label htmlFor={`file-${res.key}`} className="flex items-center gap-3 w-full cursor-pointer">
                                        <Upload size={14} className="text-steel group-hover:text-accent transition-colors" />
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-steel group-hover:text-charcoal dark:group-hover:text-concrete">
                                          {uploadingKeys[res.key] ? "Processing Upload..." : "Drop file or Click to upload dynamic asset"}
                                        </span>
                                      </label>
                                    </div>
                                  )}
                                </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-steel/10 justify-between">
                                    <div className="flex flex-wrap items-center gap-4">
                                      <div className="flex items-center gap-1.5 px-3 py-1 bg-charcoal/5 dark:bg-concrete/5 rounded-sm">
                                        <Clock size={10} className="text-steel" />
                                        <span className="text-[9px] font-mono text-steel uppercase tracking-widest">
                                          Update: {res.updatedBy || "System Default"}
                                        </span>
                                      </div>

                                      {isEdited && (
                                        <div className="flex items-center gap-1 px-3 py-1 bg-accent/10 rounded-sm">
                                          <Info size={10} className="text-accent" />
                                          <span className="text-[9px] font-mono text-accent">
                                            {currentVal.length - res.value.length >= 0 ? `+${currentVal.length - res.value.length}` : `${currentVal.length - res.value.length}`} chars
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Mobile Publish Actions */}
                                    <div className="flex xl:hidden items-center gap-2">
                                      {isEdited && (
                                        <button
                                          onClick={() => setCmsEditValues(prev => ({ ...prev, [res.key]: res.value }))}
                                          className="p-1.5 text-steel hover:text-red-500 transition-colors"
                                          title="Discard Changes"
                                        >
                                          <Undo size={14} />
                                        </button>
                                      )}
                                      <button
                                          onClick={() => onPublish(currentVal)}
                                          disabled={status === "saving" || currentVal === res.value}
                                          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${status === "saved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : status === "saving" ? "bg-amber-500/10 text-amber-600" : currentVal === res.value ? "bg-charcoal/5 dark:bg-concrete/5 text-steel opacity-50 cursor-not-allowed" : "bg-charcoal text-white hover:bg-black dark:bg-white dark:text-charcoal shadow-md"}`}
                                        >
                                          {status === "saved" ? <><Check size={14}/> Published</> : status === "saving" ? "Saving..." : currentVal === res.value ? "Up to date" : "Publish"}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Preview Asset Area (Only for visual items) */}
                                {(res.type === "image" || res.type === "video") ? (
                                  <div className="w-full xl:w-64 h-36 border border-steel/10 bg-charcoal/5 dark:bg-concrete/5 flex items-center justify-center flex-shrink-0 relative group">
                                    {res.type === "image" && currentVal ? (
                                      <img
                                        src={currentVal}
                                        alt="CMS Preview"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : res.type === "video" && currentVal ? (
                                      <video
                                        src={currentVal}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="p-4 text-center">
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-steel block">
                                          Missing Visual Asset
                                        </span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none mix-blend-overlay"></div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="hidden xl:block w-full xl:w-1/2 sticky top-8 h-[calc(100vh-64px)] space-y-8 pl-8 border-l border-steel/10">
{/* Draggable Live Viewport Simulator - Real-time visual bindings */}
                <div className="mb-8 border border-steel/20 bg-charcoal/5 dark:bg-concrete/5 p-6 rounded" id="live-wireframe">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-display text-lg font-light text-charcoal dark:text-concrete flex items-center gap-2">
                        <Eye size={16} className="text-accent" />
                        Dynamic Live Viewport Sandbox
                      </h3>
                      <p className="text-[10px] text-steel font-mono uppercase tracking-wider mt-0.5">
                        Test draft layouts, interactive elements and typographic weight before publishing to database.
                      </p>
                    </div>

                    {/* Simulator Controls */}
                    <div className="flex items-center gap-4">
                      {/* Section Tabs */}
                      <div className="flex gap-1 bg-charcoal/10 dark:bg-concrete/10 p-1 border border-steel/15">
                        {[
                          { id: "/", label: "Homepage" },
                          { id: "/about", label: "About Page" },
                          { id: "/services", label: "Services" },
                          { id: "/portfolio", label: "Portfolio" }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSimulatorTab(tab.id)}
                            className={`px-3 py-1 font-mono text-[8px] uppercase tracking-widest transition-colors ${activeSimulatorTab === tab.id ? "bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Device Toggles */}
                      <div className="flex border border-steel/25">
                        <button
                          onClick={() => setActiveSimulatorTheme("desktop")}
                          className={`p-1.5 ${activeSimulatorTheme === "desktop" ? "bg-accent text-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
                          title="Desktop View"
                        >
                          <Laptop size={14} />
                        </button>
                        <button
                          onClick={() => setActiveSimulatorTheme("mobile")}
                          className={`p-1.5 ${activeSimulatorTheme === "mobile" ? "bg-accent text-concrete" : "text-steel hover:text-charcoal dark:hover:text-concrete"}`}
                          title="Mobile View"
                        >
                          <Smartphone size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Simulator Screen Rendering */}
                  <div className="flex justify-center bg-charcoal dark:bg-black/40 border border-steel/30 p-4 md:p-8 rounded relative overflow-hidden h-[600px] items-center">
                    <div 
                      className={`relative bg-charcoal shadow-2xl overflow-hidden transition-all duration-500 border border-steel/40 ${activeSimulatorTheme === "desktop" ? "w-full max-w-5xl h-[540px]" : "w-[375px] h-[540px]"}`}
                    >
                       <iframe 
                         src={activeSimulatorTab} 
                         className="w-full h-full border-none bg-concrete dark:bg-charcoal"
                         title="CMS Interactive Simulator"
                       />
                       
                       {/* Overlay indicator */}
                       <div className="absolute bottom-4 right-4 pointer-events-none">
                         <div className="bg-charcoal px-3 py-1.5 border border-steel/40 text-concrete font-mono text-[7px] uppercase tracking-widest rounded shadow-xl flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Live Preview Engine
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Stock Architectural Visuals presets library shelf */}
                <div className="mb-8 border border-steel/20 p-6 bg-charcoal/5 dark:bg-concrete/5 rounded">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-steel/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-accent animate-pulse" />
                        <h3 className="font-display text-base font-light text-charcoal dark:text-concrete">
                          Premium Material & Architectural Asset Shelf
                        </h3>
                      </div>
                      <p className="text-[10px] text-steel font-mono uppercase tracking-wider mt-0.5">
                        Import professional high-resolution drone photography, master drafts, and concrete textures dynamically.
                      </p>
                    </div>

                    {/* Presets target picker */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-steel font-semibold">Load to slot:</span>
                      <select
                        id="presetTargetSlotSelect"
                        className="bg-concrete dark:bg-charcoal border border-steel/20 p-1.5 font-mono text-[10px] text-charcoal dark:text-concrete outline-none focus:border-accent"
                      >
                        <option value="hero_poster">Hero Background Image</option>
                        <option value="process_before_image">Slider (Before Image)</option>
                        <option value="process_after_image">Slider (After Image)</option>
                        <option value="story_1_image">Story 1 Grid Image</option>
                        <option value="story_2_image">Story 2 Grid Image</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {[
                      { name: "Modern Raw Timber", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop" },
                      { name: "Luxury Cantilever", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop" },
                      { name: "CAD Sketch Drawing", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop" },
                      { name: "Raw Concrete Slab", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop" },
                      { name: "Nairobi Skyline Dusk", url: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=1600&auto=format&fit=crop" },
                      { name: "Lush Roof Garden", url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop" },
                      { name: "Solar Skylight Atrium", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop" },
                      { name: "Structural Shading Panel", url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1600&auto=format&fit=crop" }
                    ].map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const selectElem = document.getElementById("presetTargetSlotSelect") as HTMLSelectElement;
                          if (selectElem) {
                            const targetKey = selectElem.value;
                            setCmsEditValues(prev => ({ ...prev, [targetKey]: img.url }));
                            setNewCustomSuccess(`Updated draft for ${targetKey}. Remember to Publish Update below.`);
                            setTimeout(() => setNewCustomSuccess(""), 5000);
                          }
                        }}
                        className="group relative h-16 w-full overflow-hidden border border-steel/20 hover:border-accent transition-all bg-charcoal flex flex-col justify-end"
                        title="Click to apply this visual to selected CMS slot"
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="font-mono text-[8px] bg-accent text-concrete px-1 py-0.5 uppercase tracking-wider font-bold">Inject Slot</span>
                        </div>
                        <div className="p-1 z-10 w-full bg-black/60 truncate relative">
                          <p className="font-mono text-[6px] text-white tracking-widest uppercase truncate">{img.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</div>
);
}
