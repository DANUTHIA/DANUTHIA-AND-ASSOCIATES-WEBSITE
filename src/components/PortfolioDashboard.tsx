import React, { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Trash2, Edit, Plus, X, Upload, Check, Loader2 } from 'lucide-react';
import { Project } from '../types';

interface PortfolioDashboardProps {
  projects: Project[];
  refresh: () => void;
}

export default function PortfolioDashboard({ projects, refresh }: PortfolioDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    category: 'Commercial',
    location: '',
    year: new Date().getFullYear().toString(),
    img: '',
    description: '',
    client: '',
    area: '',
    status: 'In Progress',
    lifecyclePhase: 1
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData(project);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      refresh();
    } catch (e) {
      console.error(e);
      alert('Error deleting project');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    let uploadedRef = null;
    try {
      // If there's an existing image that was uploaded (not a URL), we could delete it here
      // but let's focus on the new upload first
      const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      uploadedRef = snapshot.ref;
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, img: downloadURL }));
    } catch (error) {
      console.error("Upload error:", error);
      if (uploadedRef) {
        await deleteObject(uploadedRef).catch(console.error);
      }
      alert("Failed to upload image to storage.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedProject) {
        await updateDoc(doc(db, 'projects', selectedProject.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setSelectedProject(null);
      refresh();
    } catch (e) {
      console.error(e);
      alert('Error saving project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">Portfolio Management</h2>
        <button 
          onClick={() => { setIsEditing(true); setSelectedProject(null); setFormData({ category: 'Commercial', status: 'In Progress', year: '2024', lifecyclePhase: 1 }); }}
          className="bg-accent text-concrete px-6 py-2 flex items-center gap-2 font-bold uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-charcoal/50 p-8 border border-steel/20 dark:border-concrete/20 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-bold uppercase text-charcoal dark:text-concrete">
              {selectedProject ? 'Edit Project' : 'New Project'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-steel hover:text-charcoal dark:hover:text-concrete">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Title</label>
              <input 
                required
                className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Client</label>
              <input 
                required
                className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete" 
                value={formData.client} 
                onChange={e => setFormData({...formData, client: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Category</label>
              <select 
                className="w-full bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Mixed Use">Mixed Use</option>
                <option value="Institutional">Institutional</option>
                <option value="Urban Design">Urban Design</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Year</label>
              <input 
                required
                className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete" 
                value={formData.year} 
                onChange={e => setFormData({...formData, year: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Location</label>
              <input 
                required
                className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete" 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Main Image</label>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <input 
                    className="flex-1 bg-transparent border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete" 
                    value={formData.img} 
                    onChange={e => setFormData({...formData, img: e.target.value})} 
                    placeholder="URL or Upload -->"
                  />
                  <div className="relative">
                    <input 
                      type="file"
                      id="project-image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <label 
                      htmlFor="project-image-upload"
                      className={`h-full px-4 border border-steel/20 flex items-center justify-center cursor-pointer hover:bg-accent hover:text-white transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    </label>
                  </div>
                </div>
                {formData.img && (
                  <div className="w-full h-32 bg-charcoal/10 border border-steel/20 relative overflow-hidden">
                    <img 
                      src={formData.img} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-steel">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-transparent border border-steel/20 dark:border-concrete/20 p-3 text-sm focus:border-accent outline-none text-charcoal dark:text-concrete resize-none" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div className="flex justify-end gap-4">
            <button 
              disabled={loading}
              type="submit" 
              className="bg-accent text-concrete px-12 py-3 font-bold uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white dark:bg-charcoal/50 border border-steel/20 dark:border-concrete/20 overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img src={project.img} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => handleEdit(project)} className="bg-concrete p-2 rounded-full text-charcoal hover:bg-accent hover:text-white transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="bg-concrete p-2 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent mb-1">{project.category}</p>
                <h4 className="font-display font-bold text-charcoal dark:text-concrete uppercase truncate">{project.title}</h4>
                <p className="text-[10px] text-steel mt-1 uppercase tracking-widest">{project.location} • {project.year}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
