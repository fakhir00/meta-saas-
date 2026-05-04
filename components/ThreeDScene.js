'use client';

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Sparkles, Torus } from '@react-three/drei';

function OrbitalCore({ isLight }) {
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.3, 0.06);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -state.pointer.x * 0.3, 0.06);
  });

  // Solid, high-contrast colors for Light Mode
  const coreColor = isLight ? "#312e81" : "#6366f1"; // Deep Navy Indigo
  const ring1Color = isLight ? "#4c1d95" : "#a78bfa"; // Deep Purple
  const ring2Color = isLight ? "#1e3a8a" : "#60a5fa"; // Deep Blue
  const ring3Color = isLight ? "#831843" : "#f472b6"; // Deep Rose

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={1.2} floatIntensity={2}>
        {/* Core sphere - Solid in light mode */}
        <Sphere args={[1.2, 64, 64]} scale={1.8}>
          <MeshDistortMaterial
            color={coreColor}
            distort={0.35}
            speed={1.8}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={isLight ? 0.9 : 0.7}
            opacity={isLight ? 1 : 0.9}
            transparent={!isLight}
          />
        </Sphere>

        {/* Ring 1 - Much thicker for visibility */}
        <Torus args={[2.8, 0.15, 32, 140]} rotation={[1.1, 0.3, 0.2]}>
          <meshStandardMaterial color={ring1Color} emissive={ring1Color} emissiveIntensity={isLight ? 2 : 0.6} opacity={isLight ? 0.9 : 0.7} transparent />
        </Torus>

        {/* Ring 2 */}
        <Torus args={[3.2, 0.12, 32, 160]} rotation={[0.2, 0.8, -0.4]}>
          <meshStandardMaterial color={ring2Color} emissive={ring2Color} emissiveIntensity={isLight ? 1.5 : 0.4} opacity={isLight ? 0.8 : 0.5} transparent />
        </Torus>

        {/* Ring 3 */}
        <Torus args={[3.6, 0.1, 32, 180]} rotation={[-0.5, 1.2, 0.6]}>
          <meshStandardMaterial color={ring3Color} emissive={ring3Color} emissiveIntensity={isLight ? 1.2 : 0.3} opacity={isLight ? 0.7 : 0.35} transparent />
        </Torus>

        {/* Orbiting nodes - Larger and brighter */}
        <Sphere args={[0.35, 32, 32]} position={[2.9, 0.2, 0.4]}>
          <meshStandardMaterial color="#0891b2" emissive="#0891b2" emissiveIntensity={isLight ? 4 : 2} />
        </Sphere>

        <Sphere args={[0.25, 32, 32]} position={[-2.4, -0.8, 1.2]}>
          <meshStandardMaterial color="#6d28d9" emissive="#6d28d9" emissiveIntensity={isLight ? 4 : 1.8} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function ThreeDScene() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsLight(document.documentElement.classList.contains('light-mode'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    setIsLight(document.documentElement.classList.contains('light-mode'));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* VIBRANT Halo for Light Mode (Replacing the grey look) */}
      {isLight && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(167,139,250,0.1) 40%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.8
        }} />
      )}
      
      <Canvas camera={{ position: [0, 0, 9], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={isLight ? 1.5 : 0.5} />
        <pointLight position={[10, 10, 10]} intensity={isLight ? 2.5 : 1} />
        <directionalLight position={[4, 5, 3]} intensity={isLight ? 3 : 1.4} color={isLight ? "#ffffff" : "#a78bfa"} />
        <pointLight position={[-4, -3, -2]} intensity={isLight ? 2.5 : 1.2} color="#6366f1" />
        <pointLight position={[3, -2, 4]} intensity={isLight ? 2 : 0.6} color="#ec4899" />

        <Sparkles count={isLight ? 350 : 160} size={isLight ? 5 : 2} speed={0.4} color={isLight ? "#4338ca" : "#a78bfa"} opacity={isLight ? 1 : 0.45} scale={[12, 10, 12]} />
        <OrbitalCore isLight={isLight} />
      </Canvas>
    </div>
  );
}
