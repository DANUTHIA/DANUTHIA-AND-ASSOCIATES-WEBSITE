import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group } from 'react-konva';
import useImage from 'use-image';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Annotation } from '../types';
import { Trash2, Plus, X } from 'lucide-react';

interface BlueprintAnnotationProps {
  blueprintId: string;
  imageUrl: string;
  userId: string;
  initialVersion?: number;
}

export default function BlueprintAnnotation({ blueprintId, imageUrl, userId, initialVersion = 1 }: BlueprintAnnotationProps) {
  const [image] = useImage(imageUrl);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [currentVersion, setCurrentVersion] = useState(initialVersion);
  const [availableVersions, setAvailableVersions] = useState<number[]>([1]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Maintain aspect ratio if image is loaded, otherwise use 4:3
        const aspectRatio = image ? image.height / image.width : 0.75;
        setDimensions({
          width: width,
          height: width * aspectRatio
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [image]);

  useEffect(() => {
    const q = query(
      collection(db, 'annotations'), 
      where('blueprintId', '==', blueprintId),
      where('version', '==', currentVersion)
    );
    return onSnapshot(q, (snapshot) => {
      setAnnotations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Annotation)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'annotations');
    });
  }, [blueprintId, currentVersion]);

  // Fetch all versions available for this blueprint
  useEffect(() => {
    const q = query(collection(db, 'annotations'), where('blueprintId', '==', blueprintId));
    return onSnapshot(q, (snapshot) => {
      const versions = new Set<number>([1]);
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.version) versions.add(data.version);
      });
      setAvailableVersions(Array.from(versions).sort((a, b) => b - a));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'annotations');
    });
  }, [blueprintId]);

  const handleStageClick = (e: any) => {
    // If clicking on an existing annotation, don't create a new one
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    setNewAnnotation({ x: pos.x, y: pos.y, comment: '', version: currentVersion });
  };

  const saveAnnotation = async (comment: string) => {
    if (newAnnotation && comment.trim()) {
      await addDoc(collection(db, 'annotations'), {
        blueprintId,
        authorId: userId,
        x: newAnnotation.x,
        y: newAnnotation.y,
        comment: comment.trim(),
        version: currentVersion,
        createdAt: serverTimestamp()
      });
      setNewAnnotation(null);
    }
  };

  const deleteAnnotation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'annotations', id));
    } catch (error) {
      console.error("Failed to delete annotation", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="font-mono text-[10px] uppercase tracking-widest text-steel">Version</label>
          <select 
            value={currentVersion} 
            onChange={(e) => setCurrentVersion(Number(e.target.value))}
            className="bg-concrete dark:bg-charcoal border border-steel/20 px-3 py-1 text-xs font-mono focus:outline-none focus:border-accent"
          >
            {availableVersions.map(v => (
              <option key={v} value={v}>V{v}.0</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => {
            const nextVer = Math.max(...availableVersions) + 1;
            setCurrentVersion(nextVer);
            setAvailableVersions(prev => [...prev, nextVer].sort((a, b) => b - a));
          }}
          className="text-[10px] font-mono uppercase tracking-widest text-accent hover:text-charcoal flex items-center gap-2"
        >
          <Plus size={12} />
          New Version
        </button>
      </div>

      <div ref={containerRef} className="border border-steel/20 bg-charcoal/5 relative overflow-hidden">
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          onClick={handleStageClick}
          className="cursor-crosshair"
        >
          <Layer>
            {image && (
              <KonvaImage 
                image={image} 
                width={dimensions.width} 
                height={dimensions.height} 
              />
            )}
            {annotations.map(ann => (
              <Group key={ann.id}>
                <Circle 
                  x={ann.x} 
                  y={ann.y} 
                  radius={8} 
                  fill="#B8860B" 
                  stroke="white" 
                  strokeWidth={2}
                  shadowBlur={5}
                />
                <Group x={ann.x + 12} y={ann.y - 12}>
                  <Text 
                    text={ann.comment} 
                    fontSize={12} 
                    fill="white"
                    padding={8}
                  />
                </Group>
              </Group>
            ))}
            {newAnnotation && (
              <Circle 
                x={newAnnotation.x} 
                y={newAnnotation.y} 
                radius={8} 
                fill="#3b82f6" 
                stroke="white" 
                strokeWidth={2}
                opacity={0.8}
              />
            )}
          </Layer>
        </Stage>
        
        {!newAnnotation && (
          <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-md px-4 py-2 border border-steel/20 text-[10px] font-mono text-concrete uppercase tracking-widest flex items-center gap-2">
            <Plus size={12} />
            Click anywhere to add a note
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newAnnotation && (
          <div className="p-6 bg-accent/10 border border-accent/30 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-accent">New Annotation</h4>
              <button onClick={() => setNewAnnotation(null)} className="text-accent hover:text-charcoal"><X size={14} /></button>
            </div>
            <textarea 
              placeholder="Describe the issue or request..." 
              className="w-full bg-concrete dark:bg-charcoal border border-accent/20 p-4 text-sm font-light focus:outline-none focus:border-accent min-h-[100px]"
              value={newAnnotation.comment}
              onChange={(e) => setNewAnnotation({...newAnnotation, comment: e.target.value})}
            />
            <button 
              onClick={() => saveAnnotation(newAnnotation.comment || '')} 
              disabled={!newAnnotation.comment?.trim()}
              className="w-full bg-accent text-concrete dark:text-charcoal py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              Save Annotation
            </button>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-steel">Existing Notes</h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {annotations.length === 0 ? (
              <p className="text-xs text-steel font-mono uppercase">No annotations yet.</p>
            ) : (
              annotations.map(ann => (
                <div key={ann.id} className="p-4 bg-concrete dark:bg-charcoal border border-steel/10 flex justify-between items-start group">
                  <div>
                    <p className="text-sm font-light leading-relaxed">{ann.comment}</p>
                    <span className="text-[8px] text-steel/50 mt-2 block uppercase tracking-tighter">
                      {ann.createdAt?.toDate().toLocaleString()}
                    </span>
                  </div>
                  {ann.authorId === userId && (
                    <button 
                      onClick={() => deleteAnnotation(ann.id)}
                      className="text-steel hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
