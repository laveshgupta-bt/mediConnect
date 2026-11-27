import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from '../common/ErrorBoundary';

function WalkthroughFallback({ progress = 0 }) {
  const currentStep = Math.min(4, Math.max(1, Math.floor(progress * 4) + 1));
  const departments = [
    { id: 1, name: 'Cardiology Center', hosp: 'City Care Hospital', color: 'border-red-400 bg-red-50 text-red-800' },
    { id: 2, name: 'Orthopedics & Sports', hosp: 'Sunrise Medical Centre', color: 'border-blue-400 bg-blue-50 text-blue-800' },
    { id: 3, name: 'Pulmonology & Respiratory', hosp: 'Global Health Hospital', color: 'border-teal-400 bg-teal-50 text-teal-800' },
    { id: 4, name: 'Unified Hospital Record Hub', hosp: 'MediConnect Network', color: 'border-cyan-400 bg-cyan-50 text-cyan-800' }
  ];

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 flex flex-col items-center justify-center p-8 text-white text-center relative overflow-hidden">
      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>Patient Journey Simulator Active</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-black text-white">
          Navigating Cross-Hospital Departments
        </h3>

        <div className="grid grid-cols-2 gap-3 text-left">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                dept.id === currentStep ? `${dept.color} shadow-lg scale-105` : 'border-white/10 bg-white/5 text-navy-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">{dept.hosp}</div>
              <div className="text-sm font-black mt-0.5">{dept.name}</div>
              <div className="text-[10px] mt-2 font-mono font-semibold">
                {dept.id === currentStep ? '● Active Patient Encounter' : 'Synced Encounter'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stylized Walking Patient Character with animated limbs
function WalkingCharacter({ progress = 0 }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  // Progress spans 0 to 1 -> Corresponds to z from 4 to -28
  const currentZ = 4 - progress * 32;

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth lerp to current scroll target
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, currentZ, 0.1);
      
      // Calculate speed for limb swing
      const speed = Math.abs(currentZ - groupRef.current.position.z);
      const walkCycle = state.clock.elapsedTime * 6 + progress * 20;

      // Limb swing
      const swingAngle = Math.sin(walkCycle) * 0.45;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = swingAngle;
        rightLegRef.current.rotation.x = -swingAngle;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -swingAngle * 0.8;
        rightArmRef.current.rotation.x = swingAngle * 0.8;
      }

      // Subtle vertical bounce
      groupRef.current.position.y = -0.5 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 4]}>
      {/* Head */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#ECC94B" roughness={0.5} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.76, -0.02]}>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      {/* Torso / Modern Jacket */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.75, 16]} />
        <meshStandardMaterial color="#2B6CB0" roughness={0.4} />
      </mesh>
      {/* Health Card / Digital Badge in hand */}
      <mesh position={[0.28, 0.9, 0.18]}>
        <boxGeometry args={[0.08, 0.14, 0.01]} />
        <meshBasicMaterial color="#16A6A1" />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.3, 1.3, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
          <meshStandardMaterial color="#2B6CB0" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.3, 1.3, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
          <meshStandardMaterial color="#2B6CB0" />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.7, 16]} />
          <meshStandardMaterial color="#4A5568" />
        </mesh>
        <mesh position={[0, -0.72, 0.04]}>
          <boxGeometry args={[0.1, 0.08, 0.2]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.7, 16]} />
          <meshStandardMaterial color="#4A5568" />
        </mesh>
        <mesh position={[0, -0.72, 0.04]}>
          <boxGeometry args={[0.1, 0.08, 0.2]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Glowing Personal Health Data Aura beneath feet */}
      <mesh position={[0, -0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.6, 32]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Department Gateway & Architecture along Corridor
function CorridorWing({ position = [0, 0, 0], name, hospital, color, side = 'left', active = false }) {
  const isLeft = side === 'left';
  const xOffset = isLeft ? -2.6 : 2.6;
  const signRot = isLeft ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group position={position}>
      {/* Corridor Wall Opening */}
      <RoundedBox args={[0.2, 3.2, 2.2]} position={[xOffset, 1.1, 0]} radius={0.04}>
        <meshStandardMaterial color="#CBD5E0" roughness={0.3} />
      </RoundedBox>

      {/* Gateway Light Arc */}
      <mesh position={[xOffset, 2.6, 0]}>
        <boxGeometry args={[0.25, 0.08, 2.0]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Department Illuminated Sign */}
      <group position={[isLeft ? -2.3 : 2.3, 2.2, 0]} rotation={[0, signRot, 0]}>
        <RoundedBox args={[1.6, 0.45, 0.06]} radius={0.03}>
          <meshStandardMaterial color="#102A43" roughness={0.2} />
        </RoundedBox>
        {/* Glow accent */}
        <mesh position={[0, -0.2, 0.035]}>
          <boxGeometry args={[1.5, 0.03, 0.01]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>

      {/* Department Interior Glimpse / Medical Equipment */}
      <group position={[isLeft ? -3.8 : 3.8, 0, 0]}>
        {/* Equipment console */}
        <RoundedBox args={[0.8, 1.2, 0.6]} position={[0, 0.6, 0]} radius={0.05}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </RoundedBox>
        {/* Glowing Screen */}
        <mesh position={[0, 1.0, isLeft ? 0.31 : -0.31]}>
          <planeGeometry args={[0.6, 0.35]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {/* Holographic emitter */}
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Floor Department Guide Light Stripe */}
      <mesh position={[isLeft ? -1.8 : 1.8, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.12]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Complete Hospital Corridor Environment with ceiling lights and floor tiles
function HospitalCorridor() {
  const corridorLength = 40;

  // Ceiling lights array
  const lightPositions = useMemo(() => {
    const list = [];
    for (let z = 6; z >= -34; z -= 4) {
      list.push([0, 2.9, z]);
    }
    return list;
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.5, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.5, corridorLength]} />
        <meshStandardMaterial color="#F7FAFC" roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Floor central medical path guide */}
      <mesh position={[0, -0.495, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, corridorLength]} />
        <meshBasicMaterial color="#16A6A1" transparent opacity={0.4} />
      </mesh>

      {/* Left Corridor Wall */}
      <mesh position={[-2.75, 1.2, -14]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength, 3.5]} />
        <meshStandardMaterial color="#EDF2F7" roughness={0.3} />
      </mesh>

      {/* Right Corridor Wall */}
      <mesh position={[2.75, 1.2, -14]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength, 3.5]} />
        <meshStandardMaterial color="#EDF2F7" roughness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 2.95, -14]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, corridorLength]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      {/* Recessed Ceiling LED Light Panels */}
      {lightPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh>
            <boxGeometry args={[1.4, 0.05, 0.8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <pointLight intensity={0.4} distance={6} color="#FFFFFF" />
        </group>
      ))}

      {/* Department Wings along journey */}
      {/* 1. Cardiology Wing - City Care Hospital */}
      <CorridorWing
        position={[0, 0, 1]}
        name="Cardiology Wing"
        hospital="City Care Hospital"
        color="#E53E3E"
        side="left"
      />

      {/* 2. Radiology & Orthopedics - Sunrise Medical Centre */}
      <CorridorWing
        position={[0, 0, -6]}
        name="Radiology & Diagnostics"
        hospital="Sunrise Medical Centre"
        color="#3182CE"
        side="right"
      />

      {/* 3. Pulmonology - Global Health Hospital */}
      <CorridorWing
        position={[0, 0, -13]}
        name="Pulmonology Center"
        hospital="Global Health Hospital"
        color="#38B2AC"
        side="left"
      />

      {/* 4. MediConnect Interoperability Core Hub */}
      <CorridorWing
        position={[0, 0, -20]}
        name="Central Interop Gateway"
        hospital="MediConnect Core"
        color="#16A6A1"
        side="right"
      />

      {/* 5. Emergency & Acute Care - Metropolitan Medical Institute */}
      <CorridorWing
        position={[0, 0, -27]}
        name="Emergency & Acute Care"
        hospital="Metropolitan Medical"
        color="#DD6B20"
        side="left"
      />
    </group>
  );
}

// Camera Rig that smoothly dollies down the corridor with the character
function CameraRig({ progress = 0 }) {
  const targetCamZ = 6.5 - progress * 32;

  useFrame((state) => {
    // Follow character along Z with smooth dampening
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.2, 0.05);

    // Subtle side-sway to view the departments as character passes them
    const swayX = Math.sin(progress * Math.PI * 4) * 0.35;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, swayX, 0.05);

    // Look slightly ahead of character
    const lookAtZ = state.camera.position.z - 4;
    state.camera.lookAt(0, 0.8, lookAtZ);
  });

  return null;
}

export default function HospitalWalkthroughScene({ progress = 0 }) {
  return (
    <div className="w-full h-full relative select-none">
      <ErrorBoundary fallback={<WalkthroughFallback progress={progress} />}>
        <Canvas
          camera={{ position: [0, 1.2, 6.5], fov: 50, near: 0.1, far: 60 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[0, 5, 0]} intensity={0.8} />

          <CameraRig progress={progress} />
          <HospitalCorridor />
          <WalkingCharacter progress={progress} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
