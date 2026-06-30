import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface OrbProps {
  isThinking: boolean;
}

export default function Orb({ isThinking }: OrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = isThinking ? 2.5 : 0.4;

    // Légère flottaison et suivi de la souris
    if (groupRef.current) {
      const targetX = (state.pointer.x * state.viewport.width) / 6;
      const targetY = (state.pointer.y * state.viewport.height) / 6;
      
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + Math.sin(time) * 0.2, 0.05);
    }

    // Cœur central (Icosaèdre)
    if (coreRef.current) {
      coreRef.current.rotation.x = time * speed * 0.8;
      coreRef.current.rotation.y = time * speed;
      
      const targetScale = isThinking ? 1.2 + Math.sin(time * 8) * 0.15 : 1;
      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    
    // Anneaux gyroscopiques
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * speed * 0.5;
      ring1Ref.current.rotation.y = time * speed * 0.7;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * speed * 0.6;
      ring2Ref.current.rotation.z = time * speed * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = time * speed * 0.9;
      ring3Ref.current.rotation.z = time * speed * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Noyau central */}
      <Icosahedron ref={coreRef} args={[0.7, 1]}>
        <meshStandardMaterial 
          color={isThinking ? "#60a5fa" : "#1e3a8a"} 
          wireframe={!isThinking}
          emissive={isThinking ? "#2563eb" : "#000000"}
          emissiveIntensity={isThinking ? 1.5 : 0}
          roughness={0.1}
          metalness={0.9}
        />
      </Icosahedron>

      {/* Anneaux extérieurs */}
      <Torus ref={ring1Ref} args={[1.4, 0.015, 16, 100]}>
        <meshStandardMaterial color="#9ca3af" metalness={1} roughness={0.1} />
      </Torus>
      <Torus ref={ring2Ref} args={[1.7, 0.02, 16, 100]}>
        <meshStandardMaterial color="#4b5563" metalness={1} roughness={0.2} />
      </Torus>
      <Torus ref={ring3Ref} args={[2.0, 0.01, 16, 100]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={1} 
          roughness={0.1} 
          emissive={isThinking ? "#3b82f6" : "#1d4ed8"} 
          emissiveIntensity={isThinking ? 1 : 0.3} 
        />
      </Torus>
    </group>
  );
}
