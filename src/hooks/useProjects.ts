import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Project } from '../types';

export const FALLBACK_PROJECTS: Project[] = [
  { 
    id: "1",
    title: "Nairobi Tech Hub", 
    category: "Commercial", 
    location: "Nairobi, Kenya",
    year: "2024",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A flagship commercial development featuring passive cooling and sustainable structural systems.",
    client: "Silicon Savannah",
    area: "35,000 sqm",
    status: "Built",
    materials: [{ name: "Glass", description: "Low-E" }],
    sustainablePrinciples: ["Passive Cooling"]
  },
  { 
    id: "2",
    title: "Karen Luxury Villa", 
    category: "Residential", 
    location: "Karen, Nairobi",
    year: "2023",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
    description: "Nestled in the indigenous forest of Karen, this private residence blurs the boundary between interior and exterior.",
    client: "Private Client",
    area: "1,200 sqm",
    status: "Completed",
    materials: [{ name: "Mvuli Wood", description: "Local timber" }],
    sustainablePrinciples: ["Biodiversity Integration"]
  },
  { 
    id: "3",
    title: "Mombasa Terminal", 
    category: "Infrastructure", 
    location: "Mombasa, Kenya",
    year: "2022",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    description: "A major transit hub utilizing sea breezes for natural ventilation in passenger zones.",
    client: "KPA",
    area: "150,000 sqm",
    status: "Ongoing",
    materials: [{ name: "Aluminum", description: "Marine-grade" }],
    sustainablePrinciples: ["Wind Harvesting"]
  },
  { 
    id: "4",
    title: "Kisumu Cultural Center", 
    category: "Culture", 
    location: "Kisumu, Kenya",
    year: "2024",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop",
    description: "A center that celebrates heritage through the translation of traditional weaving into modern masonry.",
    client: "Kisumu County",
    area: "8,500 sqm",
    status: "Concept",
    sustainablePrinciples: ["Thermal Mass"]
  },
  { 
    id: "5",
    title: "Eldoret Medical Plaza", 
    category: "Healthcare", 
    location: "Eldoret, Kenya",
    year: "2023",
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
    description: "Specialized healthcare facility utilizing biophilic design to enhance patient recovery.",
    client: "MediCross",
    area: "12,000 sqm",
    status: "Completed",
    sustainablePrinciples: ["Biophilic Gardens"]
  },
  { 
    id: "6",
    title: "Rift Valley Sanctuary", 
    category: "Hospitality", 
    location: "Naivasha, Kenya",
    year: "2021",
    img: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=1600&auto=format&fit=crop",
    description: "Eco-lodge suspended over the escarpment, designed to be fully removable.",
    client: "Wilderness Kenya",
    area: "4,500 sqm",
    status: "Completed",
    sustainablePrinciples: ["Zero Footprint"]
  }
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Project[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Project);
      });
      // Merge database data with fallback data to ensure a full showcase
      const merged = [...data];
      FALLBACK_PROJECTS.forEach(fp => {
        if (!merged.find(p => p.id === fp.id)) {
          merged.push(fp);
        }
      });
      setProjects(merged.sort((a, b) => parseInt(b.year) - parseInt(a.year)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects", error);
      setProjects(FALLBACK_PROJECTS);
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, []);

  return { projects, loading };
}
