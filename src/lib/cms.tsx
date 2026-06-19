import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface CMSResource {
  id: string; // Document ID (usually same as key)
  key: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'link' | 'number';
  value: string;
  group: string;
  updatedAt?: any;
  updatedBy?: string;
}

export const DEFAULT_RESOURCES: Omit<CMSResource, 'id'>[] = [
  {
    key: 'hero_video',
    name: 'Hero Video MP4 URL',
    type: 'link',
    value: '/videos/hero.mp4',
    group: 'Homepage'
  },
  {
    key: 'hero_poster',
    name: 'Hero Poster Image URL',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
    group: 'Homepage'
  },
  {
    key: 'hero_title',
    name: 'Hero Big Title',
    type: 'text',
    value: 'Danuthia Associates Construction LLc',
    group: 'Homepage'
  },
  {
    key: 'hero_subtitle',
    name: 'Hero Subtitle text',
    type: 'text',
    value: 'Agile, data-driven planning and architectural precision for the next generation of sustainable development.',
    group: 'Homepage'
  },
  {
    key: 'team_title',
    name: 'Team Section Title',
    type: 'text',
    value: 'Our Team',
    group: 'Homepage'
  },
  {
    key: 'team_desc',
    name: 'Team Section Description',
    type: 'text',
    value: 'Our team of architects, urban planners, and spatial analysts share a common vision: to design spaces that elevate the human experience. With diverse backgrounds and a unified purpose, we bring technical rigor and creative intuition to every project.',
    group: 'Homepage'
  },
  {
    key: 'team_image',
    name: 'Team Main Image',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
    group: 'Homepage'
  },
  {
    key: 'leadership_member_1_name',
    name: 'Leader 1 Name',
    type: 'text',
    value: 'Joseph Macharia',
    group: 'Homepage'
  },
  {
    key: 'leadership_member_1_role',
    name: 'Leader 1 Role',
    type: 'text',
    value: 'Principal Architect & CEO',
    group: 'Homepage'
  },
  {
    key: 'leadership_member_1_image',
    name: 'Leader 1 Image',
    type: 'image',
    value: '/joseph-macharia.png',
    group: 'Homepage'
  },
  {
    key: 'leadership_member_2_name',
    name: 'Leader 2 Name',
    type: 'text',
    value: 'Elena Rostova',
    group: 'Homepage'
  },
  {
    key: 'leadership_member_2_role',
    name: 'Leader 2 Role',
    type: 'text',
    value: 'Head of Urban Planning',
    group: 'Homepage'
  },
  {
    key: 'about_hero_video',
    name: 'About Hero Video MP4 URL',
    type: 'link',
    value: '/videos/about.mp4',
    group: 'About Section'
  },
  {
    key: 'about_hero_poster',
    name: 'About Hero Poster URL',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop',
    group: 'About Section'
  },
  {
    key: 'about_philosophy_text',
    name: 'Philosophy Core Text',
    type: 'text',
    value: 'We approach every project with a deep understanding of local context, environmental sustainability, and human-centric design. Our data-driven methodology ensures that our master plans and architectural designs are not just visually striking, but highly functional and resilient.',
    group: 'About Section'
  },
  {
    key: 'process_before_image',
    name: 'Before Slider Image',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1600&auto=format&fit=crop',
    group: 'Homepage'
  },
  {
    key: 'process_after_image',
    name: 'After Slider Image',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1600&auto=format&fit=crop',
    group: 'Homepage'
  },
  {
    key: 'story_1_title',
    name: 'Story 1 Title',
    type: 'text',
    value: "Designing for Resilience in Nairobi's Tech Sector",
    group: 'Portfolio'
  },
  {
    key: 'story_1_desc',
    name: 'Story 1 Description',
    type: 'text',
    value: "How the Nairobi Tech Hub is setting a new standard for sustainable commercial architecture in East Africa.",
    group: 'Portfolio'
  },
  {
    key: 'story_1_image',
    name: 'Story 1 Image URL',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
    group: 'Portfolio'
  },
  {
    key: 'story_2_title',
    name: 'Story 2 Title',
    type: 'text',
    value: "The Future of Transit: Mombasa's Wave Terminals",
    group: 'Portfolio'
  },
  {
    key: 'story_2_desc',
    name: 'Story 2 Description',
    type: 'text',
    value: "Exploring the intersection of aerodynamic engineering and tropical urbanism in our latest infrastructure project.",
    group: 'Portfolio'
  },
  {
    key: 'story_2_image',
    name: 'Story 2 Image URL',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    group: 'Portfolio'
  },
  {
    key: 'review_platform_name',
    name: 'Review Platform Name',
    type: 'text',
    value: 'Google',
    group: 'Homepage'
  },
  {
    key: 'review_platform_link',
    name: 'Review Platform URL',
    type: 'link',
    value: 'https://g.page/r/your-google-link/review',
    group: 'Homepage'
  },
  {
    key: 'review_overall_rating',
    name: 'Overall Rating Display',
    type: 'number',
    value: '4.9',
    group: 'Homepage'
  },
  {
    key: 'review_total_count',
    name: 'Total Reviews Count',
    type: 'number',
    value: '142',
    group: 'Homepage'
  },
  {
    key: 'about_hero_title',
    name: 'About Hero Title',
    type: 'text',
    value: 'Rooted in context.\nDesigning for tomorrow.',
    group: 'About Section'
  },
  {
    key: 'about_hero_subtitle',
    name: 'About Hero Subtitle',
    type: 'text',
    value: 'Danuthia Associates Construction LLc is a premier architectural and urban planning firm based in Nairobi, Kenya. We believe in designing spaces that respect the past while building for the future.',
    group: 'About Section'
  },
  {
    key: 'about_image_break',
    name: 'About Large Break Image',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1600&auto=format&fit=crop',
    group: 'About Section'
  },
  {
    key: 'about_philosophy_title',
    name: 'Philosophy Title',
    type: 'text',
    value: 'Our Philosophy',
    group: 'About Section'
  },
  {
    key: 'about_founder_name',
    name: 'Founder Name',
    type: 'text',
    value: 'Joseph Macharia',
    group: 'About Section'
  },
  {
    key: 'about_founder_role',
    name: 'Founder Role',
    type: 'text',
    value: 'Founder & Principal Architect',
    group: 'About Section'
  },
  {
    key: 'about_founder_image',
    name: 'Founder Image',
    type: 'image',
    value: '/joseph-macharia.png',
    group: 'About Section'
  },
  {
    key: 'home_quote_text',
    name: 'Home Quote Statement',
    type: 'text',
    value: 'First life, then spaces, then buildings – the other way around never works.',
    group: 'Homepage'
  },
  {
    key: 'home_quote_author',
    name: 'Home Quote Author',
    type: 'text',
    value: 'Jan Gehl',
    group: 'Homepage'
  },
  {
    key: 'home_quote_role',
    name: 'Home Quote Role',
    type: 'text',
    value: 'Urban Designer',
    group: 'Homepage'
  },
  {
    key: 'home_contact_title',
    name: 'Contact Section Title',
    type: 'text',
    value: 'Partner With Us',
    group: 'Homepage'
  },
  {
    key: 'home_contact_address',
    name: 'Contact Address',
    type: 'text',
    value: 'Nairobi, Kenya',
    group: 'Homepage'
  },
  {
    key: 'service_hero_title',
    name: 'Service Page Hero Title',
    type: 'text',
    value: 'Our Expertise',
    group: 'Service Page'
  },
  {
    key: 'service_img_1',
    name: 'Architecture Service Image',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
    group: 'Service Page'
  },
  {
    key: 'service_img_2',
    name: 'Planning Service Image',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1600&auto=format&fit=crop',
    group: 'Service Page'
  },
  {
    key: 'portfolio_title',
    name: 'Portfolio Header Title',
    type: 'text',
    value: 'Selected Works',
    group: 'Portfolio'
  },
  {
    key: 'portfolio_subtitle',
    name: 'Portfolio Header Subtitle',
    type: 'text',
    value: 'A curated selection of our most impactful architectural and urban planning projects.',
    group: 'Portfolio'
  },
  {
    key: 'firm_overview_desc',
    name: 'Firm Overview - Description',
    type: 'text',
    value: 'DANUTHIA & CO Architecture is a premier architectural design and project management firm dedicated to transforming visionary concepts into tangible, structurally sound realities.',
    group: 'About Section'
  },
  {
    key: 'service_desc_architectural',
    name: 'Service - Architecture Planning',
    type: 'text',
    value: 'Creating innovative and functional designs tailored to client needs, ranging from residential to commercial master planning.',
    group: 'Service Page'
  },
  {
    key: 'service_desc_pm',
    name: 'Service - Project Management',
    type: 'text',
    value: 'Overseeing project execution to ensure timelines, budgets, and quality standards are strictly met.',
    group: 'Service Page'
  },
  {
    key: 'portal_guidelines_intro',
    name: 'Portal - Guidelines Intro',
    type: 'text',
    value: 'The DANUTHIA & CO Client Portal is the central hub for all project interactions. Here is how clients can maximize its use.',
    group: 'Logbook'
  },
  {
    key: 'portal_guidelines_security',
    name: 'Portal - Security Policy',
    type: 'text',
    value: 'Data access is strictly compartmentalized. We utilize an encrypted document vault to protect all uploads.',
    group: 'Logbook'
  },
  {
    key: 'sustainability_title',
    name: 'Sustainability Section Title',
    type: 'text',
    value: 'Building for the Future',
    group: 'Sustainability'
  },
  {
    key: 'sustainability_desc',
    name: 'Sustainability Description',
    type: 'text',
    value: 'We incorporate sustainable practices into every design, focusing on energy efficiency, green materials, and ecological harmony.',
    group: 'Sustainability'
  },
  {
    key: 'consultation_title',
    name: 'Consultation Form Title',
    type: 'text',
    value: 'Ready to build with us?',
    group: 'Consultation Form'
  },
  {
    key: 'consultation_desc',
    name: 'Consultation Form Desc',
    type: 'text',
    value: 'Fill out the form below to schedule an initial consultation with our architecture and design team.',
    group: 'Consultation Form'
  },
  {
    key: 'global_contact_email',
    name: 'Global Contact Email',
    type: 'text',
    value: 'hello@danuthiaco.com',
    group: 'Global'
  },
  {
    key: 'global_contact_phone',
    name: 'Global Contact Phone',
    type: 'text',
    value: '+254 700 000 000',
    group: 'Global'
  }
];

interface CMSContextProps {
  resources: Record<string, string>;
  allResources: CMSResource[];
  loading: boolean;
  setResources: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateResource: (
    key: string,
    value: string,
    userEmail: string,
    customMeta?: { name: string; type: 'image' | 'video' | 'text' | 'link' | 'number'; group: string }
  ) => Promise<void>;
  resetToDefaults: (userEmail: string) => Promise<void>;
}

const CMSContext = createContext<CMSContextProps | undefined>(undefined);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [allResources, setAllResources] = useState<CMSResource[]>([]);
  const [resources, setResources] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'siteResources');
    
    // Realtime subscription
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items: CMSResource[] = [];
      const map: Record<string, string> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          key: data.key,
          name: data.name,
          type: data.type,
          value: data.value,
          group: data.group,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy
        });
        map[data.key] = data.value;
      });

      // Inject hardcoded fallbacks for any missing items so UI never breaks
      DEFAULT_RESOURCES.forEach((def) => {
        if (map[def.key] === undefined) {
          map[def.key] = def.value;
        }
      });

      setAllResources(items);
      setResources(map);
      setLoading(false);
    }, (error) => {
      console.error("Error reading siteResources:", error);
      // Fail gracefully: load default local maps so user keeps viewing site
      const map: Record<string, string> = {};
      DEFAULT_RESOURCES.forEach(def => {
        map[def.key] = def.value;
      });
      setResources(map);
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'siteResources');
    });

    return () => unsubscribe();
  }, []);

  const updateResource = async (
    key: string,
    value: string,
    userEmail: string,
    customMeta?: { name: string; type: 'image' | 'video' | 'text' | 'link' | 'number'; group: string }
  ) => {
    // Optimistic UI Update
    const name = customMeta?.name || allResources.find(r => r.key === key)?.name || (DEFAULT_RESOURCES.find(r => r.key === key)?.name || key);
    const type = customMeta?.type || allResources.find(r => r.key === key)?.type || (DEFAULT_RESOURCES.find(r => r.key === key)?.type || 'text');
    const group = customMeta?.group || allResources.find(r => r.key === key)?.group || (DEFAULT_RESOURCES.find(r => r.key === key)?.group || 'Global');

    setResources(prev => ({ ...prev, [key]: value }));
    setAllResources(prev => {
      const exists = prev.find(r => r.key === key);
      if (exists) {
        return prev.map(r => r.key === key ? { ...r, value, updatedBy: userEmail, updatedAt: new Date() } : r);
      }
      return [...prev, { id: key, key, name, type, value, group, updatedBy: userEmail, updatedAt: new Date() }];
    });

    try {
      const docRef = doc(db, 'siteResources', key);
      await setDoc(docRef, {
        key,
        name,
        type,
        value,
        group,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail
      });
    } catch (err) {
      console.error(`Failed to update CMS resource: ${key}`, err);
      handleFirestoreError(err, OperationType.UPDATE, `siteResources/${key}`);
    }
  };

  const resetToDefaults = async (userEmail: string) => {
    try {
      for (const def of DEFAULT_RESOURCES) {
        const docRef = doc(db, 'siteResources', def.key);
        await setDoc(docRef, {
          ...def,
          updatedAt: serverTimestamp(),
          updatedBy: userEmail
        });
      }
    } catch (err) {
      console.error("Failed to reset defaults:", err);
      handleFirestoreError(err, OperationType.WRITE, 'siteResources');
    }
  };

  return (
    <CMSContext.Provider value={{ resources, allResources, loading, setResources, updateResource, resetToDefaults }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
