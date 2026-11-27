import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from '../common/ErrorBoundary';

function HeroFallback() {
  return (
    <div className="w-full h-full min-h-[450px] rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-teal-950 p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-2xl border-2 border-teal-500/40">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-3xl teal-gradient-bg flex items-center justify-center mx-auto shadow-glow-teal animate-bounce-subtle">
          <svg className="w-10 h-10 text-white fill-white/20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase tracking-wider">
            Connected Healthcare Ecosystem
          </span>
          <h3 className="text-2xl font-black text-white mt-2">
            One Patient. One Medical Record.
          </h3>
          <p className="text-xs text-navy-200 mt-2 leading-relaxed">
            Interoperable medical records seamlessly synced across City Care Hospital, Sunrise Medical, Global Health, and Metropolitan Medical Institute.
          </p>
        </div>

        {/* 3 Hospital Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-bold">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-teal-200">
            🏥 City Care
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-cyan-200">
            🏥 Sunrise Med
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-teal-200">
            🏥 Global Health
          </div>
        </div>
      </div>
    </div>
  );
}

// Stylized Doctor Avatar
function StylizedDoctor({ position = [0, 0, 0] }) {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.03;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#FBD38D" roughness={0.5} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.82, -0.04]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#2D3748" roughness={0.8} />
      </mesh>
      {/* Doctor Coat (White) */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 0.9, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Scrub Inner V-neck (Teal) */}
      <mesh position={[0, 1.25, 0.22]}>
        <boxGeometry args={[0.16, 0.25, 0.1]} />
        <meshStandardMaterial color="#16A6A1" />
      </mesh>
      {/* Stethoscope */}
      <mesh position={[0, 1.35, 0.24]}>
        <torusGeometry args={[0.14, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#4A5568" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Arms holding digital tablet */}
      <mesh position={[-0.32, 1.1, 0.15]} rotation={[0.4, 0, 0.3]}>
        <capsuleGeometry args={[0.07, 0.45, 8, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.32, 1.1, 0.15]} rotation={[0.4, 0, -0.3]}>
        <capsuleGeometry args={[0.07, 0.45, 8, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Digital Tablet with glowing screen */}
      <mesh position={[0, 0.95, 0.38]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.3, 0.22, 0.02]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      <mesh position={[0, 0.95, 0.395]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[0.26, 0.18]} />
        <meshBasicMaterial color="#38D9D3" />
      </mesh>
      {/* Legs (Navy Slacks) */}
      <mesh position={[-0.14, 0.4, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.75, 16]} />
        <meshStandardMaterial color="#1A365D" />
      </mesh>
      <mesh position={[0.14, 0.4, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.75, 16]} />
        <meshStandardMaterial color="#1A365D" />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.14, 0.04, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.24]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
      <mesh position={[0.14, 0.04, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.24]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
    </group>
  );
}

// Stylized Patient Avatar
function StylizedPatient({ position = [0, 0, 0] }) {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.8 + 1) * 0.025;
    }
  });

  return (
    <group ref={group} position={position} rotation={[0, -0.4, 0]}>
      {/* Head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.21, 32, 32]} />
        <meshStandardMaterial color="#ECC94B" roughness={0.6} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.74, -0.03]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#1A202C" roughness={0.9} />
      </mesh>
      {/* Casual Jacket (Navy/Teal) */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.82, 32]} />
        <meshStandardMaterial color="#2B6CB0" roughness={0.4} />
      </mesh>
      {/* Smartphone in hand */}
      <mesh position={[0.28, 0.95, 0.25]} rotation={[0.2, -0.3, 0]}>
        <boxGeometry args={[0.1, 0.18, 0.015]} />
        <meshStandardMaterial color="#171923" />
      </mesh>
      <mesh position={[0.28, 0.95, 0.26]} rotation={[0.2, -0.3, 0]}>
        <planeGeometry args={[0.08, 0.15]} />
        <meshBasicMaterial color="#65E3DF" />
      </mesh>
      {/* Legs (Pants) */}
      <mesh position={[-0.13, 0.38, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.72, 16]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      <mesh position={[0.13, 0.38, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.72, 16]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      {/* Sneakers */}
      <mesh position={[-0.13, 0.04, 0.04]}>
        <boxGeometry args={[0.11, 0.08, 0.22]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.13, 0.04, 0.04]}>
        <boxGeometry args={[0.11, 0.08, 0.22]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// Glowing Holographic Medical Cross Emblem
function HolographicCross() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[0, 2.5, -0.5]}>
      {/* Vertical bar */}
      <RoundedBox args={[0.25, 0.9, 0.15]} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color="#16A6A1"
          emissive="#16A6A1"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>
      {/* Horizontal bar */}
      <RoundedBox args={[0.9, 0.25, 0.15]} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color="#38D9D3"
          emissive="#38D9D3"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>

      {/* Orbiting data rings */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.85, 0.015, 16, 64]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.05, 0.012, 16, 64]} />
        <meshBasicMaterial color="#16A6A1" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Modern Reception Counter
function ReceptionDesk() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Curved/Sleek Counter Desk */}
      <RoundedBox args={[3.2, 0.95, 0.7]} position={[0, 0.475, 0]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
      </RoundedBox>
      {/* Counter Top Accent Lip */}
      <RoundedBox args={[3.3, 0.06, 0.8]} position={[0, 0.98, 0]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#102A43" roughness={0.1} metalness={0.5} />
      </RoundedBox>
      {/* Front Glowing Cyan LED Strip */}
      <mesh position={[0, 0.1, 0.36]}>
        <boxGeometry args={[3.0, 0.04, 0.02]} />
        <meshBasicMaterial color="#00E5FF" />
      </mesh>
      {/* MediConnect Front Badge */}
      <mesh position={[0, 0.55, 0.36]}>
        <planeGeometry args={[0.9, 0.22]} />
        <meshStandardMaterial color="#16A6A1" emissive="#16A6A1" emissiveIntensity={0.3} />
      </mesh>
      {/* Desktop Terminal */}
      <mesh position={[-0.6, 1.15, 0]}>
        <boxGeometry args={[0.45, 0.3, 0.02]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      <mesh position={[-0.6, 1.15, 0.015]}>
        <planeGeometry args={[0.4, 0.26]} />
        <meshBasicMaterial color="#65E3DF" />
      </mesh>
      <mesh position={[-0.6, 1.02, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
    </group>
  );
}

// Orbiting Data Spheres (Simulating connected medical records)
function OrbitingDataSpheres() {
  const group = useRef();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.4;
    }
  });

  const spheres = [
    { pos: [1.8, 1.6, 0.5], color: '#16A6A1', label: 'EHR' },
    { pos: [-1.9, 1.9, -0.4], color: '#00E5FF', label: 'Labs' },
    { pos: [1.2, 2.8, -1.2], color: '#38B2AC', label: 'Rx' },
    { pos: [-1.1, 2.5, 1.1], color: '#63B3ED', label: 'FHIR' },
  ];

  return (
    <group ref={group}>
      {spheres.map((s, idx) => (
        <group key={idx} position={s.pos}>
          <mesh>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={0.6}
              roughness={0.1}
            />
          </mesh>
          {/* Subtle glow ring */}
          <mesh>
            <ringGeometry args={[0.16, 0.19, 24]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Background Architectural Columns & Glass Wall
function HospitalArchitecture() {
  return (
    <group position={[0, 0, -2.5]}>
      {/* Back Glass Wall */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial
          color="#EDF2F7"
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Structural Columns */}
      <RoundedBox args={[0.4, 5, 0.4]} position={[-3.2, 2.5, 0.2]} radius={0.05}>
        <meshStandardMaterial color="#CBD5E0" roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.4, 5, 0.4]} position={[3.2, 2.5, 0.2]} radius={0.05}>
        <meshStandardMaterial color="#CBD5E0" roughness={0.3} />
      </RoundedBox>

      {/* Modern Floor Grid */}
      <mesh position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#F7FAFC" roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Subtle floor grid line mesh */}
      <gridHelper args={[10, 20, '#CBD5E1', '#E2E8F0']} position={[0, 0.01, 1.5]} />
    </group>
  );
}

// Main Interactive Scene Container with smooth mouse parallax
function SceneContent() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle Apple-style mouse parallax
      const targetX = (state.pointer.x * Math.PI) / 24;
      const targetY = (-state.pointer.y * Math.PI) / 36;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Lighting */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-4, 4, 2]} intensity={0.8} color="#00E5FF" />
      <pointLight position={[3, 3, -1]} intensity={0.6} color="#16A6A1" />

      {/* 3D Hospital Environment */}
      <HospitalArchitecture />
      <ReceptionDesk />
      <HolographicCross />
      <StylizedDoctor position={[-1.2, 0, 0.4]} />
      <StylizedPatient position={[1.3, 0, 0.5]} />
      <OrbitingDataSpheres />
    </group>
  );
}

export default function HeroHospitalCanvas() {
  return (
    <div className="w-full h-[450px] md:h-[550px] lg:h-[600px] relative select-none">
      <ErrorBoundary fallback={<HeroFallback />}>
        <Canvas
          camera={{ position: [0, 1.5, 4.5], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <SceneContent />
        </Canvas>

        {/* Floating status badge over 3D canvas */}
        <div className="absolute bottom-4 right-4 glass-panel px-4 py-2 rounded-full flex items-center space-x-2 text-xs font-semibold text-navy-800 shadow-glass border border-white/60 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span>Interactive 3D Hospital Environment</span>
        </div>
      </ErrorBoundary>
    </div>
  );
}
