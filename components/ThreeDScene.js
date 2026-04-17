'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Sparkles, Torus } from '@react-three/drei';

function OrbitalCore() {
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.3, 0.06);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -state.pointer.x * 0.3, 0.06);
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={1.2} floatIntensity={2}>
        {/* Core sphere */}
        <Sphere args={[1.2, 64, 64]} scale={1.8}>
          <MeshDistortMaterial
            color="#6366f1"
            distort={0.35}
            speed={1.8}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.7}
          />
        </Sphere>

        {/* Ring 1 */}
        <Torus args={[2.8, 0.06, 16, 140]} rotation={[1.1, 0.3, 0.2]}>
          <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.6} transparent opacity={0.7} />
        </Torus>

        {/* Ring 2 */}
        <Torus args={[3.2, 0.04, 16, 160]} rotation={[0.2, 0.8, -0.4]}>
          <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.4} transparent opacity={0.5} />
        </Torus>

        {/* Ring 3 */}
        <Torus args={[3.6, 0.03, 16, 180]} rotation={[-0.5, 1.2, 0.6]}>
          <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={0.3} transparent opacity={0.35} />
        </Torus>

        {/* Orbiting node */}
        <Sphere args={[0.25, 32, 32]} position={[2.9, 0.2, 0.4]}>
          <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={1.5} />
        </Sphere>

        {/* Secondary node */}
        <Sphere args={[0.15, 32, 32]} position={[-2.4, -0.8, 1.2]}>
          <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={1.2} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function ThreeDScene() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas camera={{ position: [0, 0, 9], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 5, 3]} intensity={1.4} color="#a78bfa" />
        <pointLight position={[-4, -3, -2]} intensity={1.2} color="#6366f1" />
        <pointLight position={[3, -2, 4]} intensity={0.6} color="#ec4899" />

        <Sparkles count={160} size={2} speed={0.3} color="#a78bfa" opacity={0.45} scale={[10, 8, 10]} />
        <Sparkles count={60} size={1.5} speed={0.2} color="#f472b6" opacity={0.3} scale={[8, 6, 8]} />
        <OrbitalCore />
      </Canvas>
    </div>
  );
}
