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

  const coreColor = isLight ? "#4f46e5" : "#6366f1";
  const ring1Color = isLight ? "#7c3aed" : "#a78bfa";
  const ring2Color = isLight ? "#2563eb" : "#60a5fa";
  const ring3Color = isLight ? "#db2777" : "#f472b6";

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={1.2} floatIntensity={2}>
        {/* Core sphere */}
        <Sphere args={[1.2, 64, 64]} scale={1.8}>
          <MeshDistortMaterial
            color={coreColor}
            distort={0.35}
            speed={1.8}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={isLight ? 0.9 : 0.7}
          />
        </Sphere>

        {/* Ring 1 */}
        <Torus args={[2.8, 0.06, 16, 140]} rotation={[1.1, 0.3, 0.2]}>
          <meshStandardMaterial color={ring1Color} emissive={ring1Color} emissiveIntensity={isLight ? 0.8 : 0.6} transparent opacity={0.7} />
        </Torus>

        {/* Ring 2 */}
        <Torus args={[3.2, 0.04, 16, 160]} rotation={[0.2, 0.8, -0.4]}>
          <meshStandardMaterial color={ring2Color} emissive={ring2Color} emissiveIntensity={isLight ? 0.7 : 0.4} transparent opacity={0.5} />
        </Torus>

        {/* Ring 3 */}
        <Torus args={[3.6, 0.03, 16, 180]} rotation={[-0.5, 1.2, 0.6]}>
          <meshStandardMaterial color={ring3Color} emissive={ring3Color} emissiveIntensity={isLight ? 0.6 : 0.3} transparent opacity={0.35} />
        </Torus>

        {/* Orbiting nodes */}
        <Sphere args={[0.25, 32, 32]} position={[2.9, 0.2, 0.4]}>
          <meshStandardMaterial color="#0891b2" emissive="#0891b2" emissiveIntensity={2} />
        </Sphere>

        <Sphere args={[0.15, 32, 32]} position={[-2.4, -0.8, 1.2]}>
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.8} />
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
      {/* Halo for Light Mode */}
      {isLight && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
      )}
      
      <Canvas camera={{ position: [0, 0, 9], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={isLight ? 0.8 : 0.5} />
        <directionalLight position={[4, 5, 3]} intensity={isLight ? 2 : 1.4} color={isLight ? "#ffffff" : "#a78bfa"} />
        <pointLight position={[-4, -3, -2]} intensity={1.2} color="#6366f1" />
        <pointLight position={[3, -2, 4]} intensity={0.6} color="#ec4899" />

        <Sparkles count={isLight ? 250 : 160} size={isLight ? 3 : 2} speed={0.3} color={isLight ? "#6366f1" : "#a78bfa"} opacity={isLight ? 0.6 : 0.45} scale={[10, 8, 10]} />
        <OrbitalCore isLight={isLight} />
      </Canvas>
    </div>
  );
}
