# Product Requirements Document (PRD) & Implementation Plan

## 1. Content Management Backend (Firebase)

### Concept
Transition the portfolio from a static, hardcoded JSON array to a dynamic Content Management System (CMS). This enables the creation, updating, and deletion of projects directly from a web-based admin dashboard without editing the source code.

### Product Requirements
- **Database:** Firebase Firestore (NoSQL) to store project metadata (title, client, location, coordinates, technical specs, categories, materials).
- **Storage:** Firebase Storage bucket to host high-resolution project images and thumbnails.
- **Authentication:** Firebase Authentication to secure an `/admin` route. Only authenticated administrators can access the CMS dashboard.
- **Data Fetching:** The main application (Grid, Map, Timeline views) must fetch data from Firestore on mount and hydrate the global state dynamically.

### Detailed Implementation Plan
1. **Infrastructure Setup:** 
   - Call the `set_up_firebase` tool to provision the Firestore database and Authentication seamlessly.
   - Set up Firebase client SDKs (`firebase/app`, `firebase/firestore`, `firebase/storage`, `firebase/auth`) in `src/lib/firebase.ts`.
2. **Data Modeling:** 
   - Create a Firestore schema corresponding to the `Project` interface.
   - Example Fields: `title` (string), `description` (text), `category` (string), `location` (string), `coordinates` (GeoPoint), `year` (number), `materials` (array of strings), `images` (array of URLs).
3. **Admin Dashboard Creation:**
   - Implement an `/admin/login` page utilizing Firebase Auth (Email/Password).
   - Implement an `/admin/dashboard` protected route containing:
     - A data table of existing projects.
     - A "New Project" form with text inputs for metadata and a file dropzone to upload images to Firebase Storage.
4. **State Management Migration:**
   - Remove `mockProjects` from `src/data.ts`.
   - Implement a React Context (`ProjectContext.tsx`) or custom hook (`useProjects.ts`) to fetch data from Firestore (`collection(db, 'projects')`) on app mount.

---

## 2. Advanced Filtering & Tagging System

### Concept
Scale the portfolio's browseability by introducing a multi-faceted search and filter sidebar. This allows users to drill down using complex logical intersections (e.g., Year + Typology + Certification).

### Product Requirements
- **Search Input:** A real-time semantic search bar querying titles and descriptions.
- **Multi-Select Tags:** Checkboxes or selectable pills for intersecting criteria (Typology, Location, Year).
- **Empty States:** A polished UI displaying "No projects found" with a "Clear Filters" action.
- **URL State Management:** Synchronization of active filters with URL query parameters for shareability.

### Detailed Implementation Plan
1. **Component Architecture:**
   - Create `src/components/FilterSidebar.tsx` with collapsible accordion sections for each filter category (Typology, Year, Location).
2. **State Management Redesign:**
   - Refactor the current `filter` state (string) into a complex object in `Portfolio.tsx`:
     ```typescript
     interface FilterState {
       categories: string[];
       years: string[];
       locations: string[];
       searchQuery: string;
     }
     ```
3. **Filtering Algorithm Update:**
   - Update `filteredProjects` logic to ensure a project is included only if it satisfies *all* active arrays (Intersection / Logical AND).
4. **URL Synchronization (react-router-dom):**
   - Implement `useSearchParams` from `react-router-dom` to read initial states from the URL and update the URL whenever the `FilterState` changes.

---

## 3. Interactive Cursor & Micro-Interactions

### Concept
Enhance the premium architectural aesthetic by introducing a custom magnetic cursor that morphs contextually based on hovered elements (e.g., expanding into a "View" text block over images, or a "Map" icon over markers).

### Product Requirements
- **Custom Cursor:** Hide the default OS cursor and replace it with a dynamically animated HTML/SVG element following the mouse coordinates.
- **Contextual Morphing:** The cursor should react differently to links, buttons, project images, and map dragging surfaces.

### Detailed Implementation Plan
1. **Cursor Component (`CustomCursor.tsx`):**
   - Utilize `framer-motion` for smooth, spring-based tracking of mouse position.
   - Attach a `mousemove` event listener to the `window` object to update `x` and `y` state globally.
2. **Hover Context Provider (`CursorContext.tsx`):**
   - Create a React Context mapping strings representing current hover states (e.g., `'default'`, `'project-hover'`, `'dragger'`).
   - Wrap interactive elements (like the Grid images) in `onMouseEnter` and `onMouseLeave` handlers to dispatch the specific cursor state.
3. **CSS Adjustments:**
   - Apply `cursor-none` globally to the `body` or specific application containers, ensuring the default pointer is fully replaced without interfering with actual click events (applying `pointer-events-none` to the custom cursor div).
