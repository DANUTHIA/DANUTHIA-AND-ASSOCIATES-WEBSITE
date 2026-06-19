import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const projects = [
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
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A 15-story commercial flagship designed for tech startups. Features locally sourced terra-cotta louvers for passive cooling and a 5-story internal atrium that functions as a natural thermal chimney.",
    client: "Silicon Savannah Developers",
    area: "35,000 sqm",
    status: "Completed",
    collaborators: "Arup, Buro Happold",
    materials: [
      { name: "Terra-cotta", description: "Locally sourced facade louvers" },
      { name: "Low-E Glass", description: "High-performance glazing" }
    ],
    sustainablePrinciples: ["Passive Cooling Atrium", "Rainwater Harvesting", "Solar Brise-Soleil"],
    siteData: { wind: "SE 15km/h", solar: "High Exposure", rainfall: "1000mm/yr" },
    lifecyclePhase: 4
  },
  { 
    id: "2",
    title: "Karen Luxury Villa", 
    category: "Residential", 
    location: "Karen, Nairobi",
    year: "2023",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "Nestled in the indigenous forest of Karen, this private residence blurs the boundary between interior and exterior. Using a material palette of board-formed concrete and local mvuli wood.",
    client: "Private Client",
    area: "1,200 sqm",
    status: "Completed",
    collaborators: "Studio Studio, L&D Landscapes",
    materials: [
      { name: "Mvuli Wood", description: "Sustainably harvested local timber" },
      { name: "Board-formed Concrete", description: "Textural structural finish" }
    ],
    sustainablePrinciples: ["Biodiversity Integration", "Geothermal Heating", "Recycled Materials"],
    siteData: { wind: "NE 10km/h", solar: "Filtered Canopy", rainfall: "1200mm/yr" },
    lifecyclePhase: 5
  },
  { 
    id: "3",
    title: "Mombasa Terminal", 
    category: "Infrastructure", 
    location: "Mombasa, Kenya",
    year: "2022",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    description: "A major transit hub for the East African coast, utilizing aerodynamic forms to mitigate coastal winds and harvesting sea breezes for natural ventilation in passenger zones.",
    client: "Kenya Ports Authority",
    area: "150,000 sqm",
    status: "In Construction",
    collaborators: "KPA Engineering",
    materials: [
      { name: "Aluminum", description: "Marine-grade corrosion resistant" },
      { name: "Concrete", description: "High-density maritime mix" }
    ],
    sustainablePrinciples: ["Wind Harvesting", "Solar Power Grid", "Desalination Unit"],
    siteData: { wind: "E 25km/h", solar: "Direct Coastal", rainfall: "800mm/yr" },
    lifecyclePhase: 3
  },
  { 
    id: "4",
    title: "Kisumu Cultural Center", 
    category: "Culture", 
    location: "Kisumu, Kenya",
    year: "2024",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop",
    description: "Situated on the shores of Lake Victoria, this center celebrates Luo heritage through responsive geometry and traditional weaving patterns translated into modern masonry.",
    client: "Couny Government of Kisumu",
    area: "8,500 sqm",
    status: "Concept",
    collaborators: "National Museums of Kenya",
    materials: [
      { name: "Adobe Bricks", description: "Compressed stabilized earth" },
      { name: "Papyrus Thatch", description: "Technological layered roofing" }
    ],
    sustainablePrinciples: ["Passive Evaporative Cooling", "Thermal Mass Storage"],
    siteData: { wind: "W 12km/h", solar: "High Humidity", rainfall: "1500mm/yr" },
    lifecyclePhase: 1
  },
  { 
    id: "5",
    title: "Eldoret Medical Plaza", 
    category: "Healthcare", 
    location: "Eldoret, Kenya",
    year: "2023",
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
    description: "A specialized healthcare facility focusing on biophilic design to enhance patient recovery. Gardens are integrated at every ward level to provide psychological relief and natural air purification.",
    client: "MediCross Africa",
    area: "12,000 sqm",
    status: "Completed",
    collaborators: "Ministry of Health",
    materials: [
      { name: "HPL", description: "Anti-bacterial cladding" },
      { name: "Limestone", description: "Natural high-albedo stone" }
    ],
    sustainablePrinciples: ["Biophilic Healing Units", "Daylight Optimization"],
    siteData: { wind: "NW 8km/h", solar: "High Altitude UV", rainfall: "1100mm/yr" },
    lifecyclePhase: 5
  },
  { 
    id: "6",
    title: "Rift Valley Sanctuary", 
    category: "Hospitality", 
    location: "Naivasha, Kenya",
    year: "2021",
    img: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=1600&auto=format&fit=crop",
    description: "A luxury eco-lodge suspended over the Rift Valley escarpment. The structures are designed to be temporary and removable, leaving zero footprint on the fragile volcanic landscape.",
    client: "Wilderness Kenya",
    area: "4,500 sqm",
    status: "Completed",
    collaborators: "Kenya Wildlife Service",
    materials: [
      { name: "Canvas", description: "Ultra-durable weather membranes" },
      { name: "Recycled Steel", description: "Lightweight modular frame" }
    ],
    sustainablePrinciples: ["Zero Footprint Foundations", "Off-grid Energy", "Circular Waste"],
    siteData: { wind: "S 20km/h", solar: "Escarpment Exposure", rainfall: "600mm/yr" },
    lifecyclePhase: 5
  }
];

async function seed() {
  console.log('Seeding ' + projects.length + ' projects...');
  for (const project of projects) {
    try {
      await setDoc(doc(db, 'projects', project.id), project);
      console.log('Added ' + project.title);
    } catch (e) {
      console.error('Error adding ' + project.title, e);
    }
  }
}

seed();
