import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Box, Sphere, Edges, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';

const AnimatedWireframe = ({ type, args, position, rotation = [0, 0, 0], color, baseOpacity = 0.15 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  
  useCursor(hovered);

  useFrame((state, delta) => {
    if (meshRef.current && materialRef.current) {
      const targetScale = hovered ? 1.15 : 1.0;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
      
      const targetOpacity = hovered ? Math.min(baseOpacity * 3, 1) : baseOpacity;
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.1);

      if (hovered) {
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.x += delta * 0.2;
      }
    }
  });

  const Component = type === 'box' ? Box : Sphere;

  return (
    <Component 
      ref={meshRef}
      args={args} 
      position={position} 
      rotation={rotation}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <meshBasicMaterial ref={materialRef} color={color} wireframe transparent opacity={baseOpacity} />
    </Component>
  );
};

const FloatingElements = () => {
  const groupRef = useRef<THREE.Group>(null);
  const location = useLocation();
  
  // Target rotation and position for smooth interpolation
  const targetRotationY = useRef(0);
  const targetRotationX = useRef(0);
  const targetPositionY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      
      targetRotationY.current = progress * Math.PI; 
      targetPositionY.current = progress * 2; 
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Mouse parallax effect
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY.current += x * 0.01;
      targetRotationX.current = y * 0.1;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY.current, 0.02);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX.current, 0.02);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPositionY.current, 0.02);
      
      // Continuous floating
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.001;
    }
  });

  // Change configuration based on route
  const isPortfolio = location.pathname.includes('portfolio');
  const isServices = location.pathname.includes('services');

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {/* Abstract Architectural Wireframes */}
      <AnimatedWireframe type="box" args={[2, 4, 2]} position={[-4, isPortfolio ? 1 : -1, -2]} rotation={[0.2, 0.5, 0]} color="#627585" baseOpacity={0.15} />
      <AnimatedWireframe type="box" args={[3, 1, 3]} position={[5, isServices ? 2 : 0, -4]} rotation={[-0.2, -0.5, 0.1]} color="#c88246" baseOpacity={0.15} />
      <AnimatedWireframe type="sphere" args={[1.5, 16, 16]} position={[3, -3, -6]} color="#e4e5e7" baseOpacity={0.1} />
      <AnimatedWireframe type="box" args={[1, 5, 1]} position={[-5, 2, -8]} rotation={[0.1, 0.2, -0.1]} color="#2a2d34" baseOpacity={0.2} />
    </group>
  );
};

export default function Global3DBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-concrete">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ touchAction: 'auto' }}>
        <ambientLight intensity={0.5} />
        <FloatingElements />
      </Canvas>
    </div>
  );
}
