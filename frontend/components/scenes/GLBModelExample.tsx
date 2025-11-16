// 📦 GLB 模型使用示例
// 将下载的 GLB 文件放到 frontend/public/assets/models/ 文件夹

import { useGLTF } from '@react-three/drei'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ===== 树木模型 =====
export function Tree3D({ position }: { position: [number, number, number] }) {
  // 加载 GLB 模型
  const { scene } = useGLTF('/assets/models/environment/tree.glb')

  return (
    <primitive
      object={scene.clone()}
      position={position}
      scale={[1.5, 1.5, 1.5]}  // 调整大小
      castShadow
      receiveShadow
    />
  )
}

// ===== 石头模型 =====
export function Rock3D({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/models/environment/rock.glb')

  return (
    <primitive
      object={scene.clone()}
      position={position}
      scale={0.8}
      castShadow
    />
  )
}

// ===== 花朵模型 =====
export function Flower3D({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/models/environment/flower.glb')
  const groupRef = useRef<THREE.Group>(null)

  // 添加轻微摇摆动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive
        object={scene.clone()}
        scale={0.5}
      />
    </group>
  )
}

// ===== 玩家角色模型 =====
export function Player3D({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/models/characters/player.glb')
  const groupRef = useRef<THREE.Group>(null)

  // 添加呼吸动画
  useFrame((state) => {
    if (groupRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      groupRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive
        object={scene.clone()}
        scale={1}
        castShadow
      />
    </group>
  )
}

// ===== 建筑物模型 =====
export function Building3D({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/models/environment/building.glb')

  return (
    <primitive
      object={scene.clone()}
      position={position}
      scale={2}
      castShadow
      receiveShadow
    />
  )
}

// ===== 动物/生物模型 =====
export function Creature3D({
  position,
  modelPath
}: {
  position: [number, number, number]
  modelPath: string
}) {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef<THREE.Group>(null)

  // 浮动动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
      groupRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive
        object={scene.clone()}
        scale={1}
        castShadow
      />
    </group>
  )
}

// ===== 预加载所有模型 =====
// 在组件外调用，提前加载模型
export function preloadModels() {
  useGLTF.preload('/assets/models/environment/tree.glb')
  useGLTF.preload('/assets/models/environment/rock.glb')
  useGLTF.preload('/assets/models/environment/flower.glb')
  useGLTF.preload('/assets/models/characters/player.glb')
  useGLTF.preload('/assets/models/environment/building.glb')
}

// ===== 使用示例 =====
/*
import { Tree3D, Rock3D, Player3D } from './GLBModelExample'

function MyScene() {
  return (
    <>
      <Tree3D position={[0, 0, 0]} />
      <Rock3D position={[5, 0, 5]} />
      <Player3D position={[0, 0, 0]} />
    </>
  )
}
*/

// ===== 批量渲染示例 =====
export function Forest({ count = 10 }: { count?: number }) {
  const positions: [number, number, number][] = []

  for (let i = 0; i < count; i++) {
    positions.push([
      (Math.random() - 0.5) * 40,
      0,
      (Math.random() - 0.5) * 40
    ])
  }

  return (
    <>
      {positions.map((pos, i) => (
        <Tree3D key={i} position={pos} />
      ))}
    </>
  )
}

// ===== 带旋转的模型 =====
export function RotatingModel({
  modelPath,
  position
}: {
  modelPath: string
  position: [number, number, number]
}) {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene.clone()} scale={1} />
    </group>
  )
}

// ===== 可点击的模型 =====
export function ClickableModel({
  modelPath,
  position,
  onClick
}: {
  modelPath: string
  position: [number, number, number]
  onClick: () => void
}) {
  const { scene } = useGLTF(modelPath)
  const [hovered, setHovered] = useState(false)

  return (
    <primitive
      object={scene.clone()}
      position={position}
      scale={hovered ? 1.1 : 1}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{ cursor: hovered ? 'pointer' : 'auto' }}
    />
  )
}
