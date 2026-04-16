'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Sparkles, Torus } from '@react-three/drei';

function OrbitalCore() {
  const groupRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += delta * 0.35;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.35, 0.07);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -state.pointer.x * 0.35, 0.07);
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.6} rotationIntensity={1.3} floatIntensity={1.8}>
        <Sphere args={[1.1, 64, 64]} scale={1.65}>
          <MeshDistortMaterial
            color="#38bdf8"
            distort={0.38}
            speed={1.9}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.65}
          />
        </Sphere>

        <Torus args={[2.55, 0.07, 16, 140]} rotation={[1.1, 0.3, 0.2]}>
          <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.65} />
        </Torus>

        <Torus args={[2.95, 0.05, 16, 160]} rotation={[0.2, 0.8, -0.4]}>
          <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.4} />
        </Torus>

        <Sphere args={[0.34, 32, 32]} position={[2.65, 0.2, 0.4]}>
          <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={1.2} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function ThreeDScene() {
  return (
    <div className="three-stage">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} color="#60a5fa" />
        <pointLight position={[-4, -3, -2]} intensity={1.4} color="#22d3ee" />

        <Sparkles count={120} size={2.2} speed={0.35} color="#67e8f9" opacity={0.55} scale={[8, 6, 8]} />
        <OrbitalCore />
      </Canvas>

      <style jsx>{`
        .three-stage {
          position: absolute;
          inset: 0;
        }
      `}</style>
    </div>
  );
}
