'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface CharacterPreviewProps {
    characterId: number;
    isSelected: boolean;
}

export function CharacterPreview({ characterId, isSelected }: CharacterPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const mountedRef = useRef(true);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        mixer?: THREE.AnimationMixer;
        model?: THREE.Group;
        animationId?: number;
    } | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        mountedRef.current = true;
        console.log(`🎮 Loading character ${characterId}...`);

        // Setup scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2a2a3e);

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        camera.position.set(0, 80, 180);
        camera.lookAt(0, 70, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(200, 200);
        renderer.shadowMap.enabled = true;

        // Append renderer to container
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(100, 200, 100);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0x6699ff, 0.5);
        backLight.position.set(-100, 100, -100);
        scene.add(backLight);

        sceneRef.current = { scene, camera, renderer };

        // Load character
        const loader = new FBXLoader();
        const basePath = `/character${characterId}`;
        const idleFile = characterId <= 4 ? 'Idle.fbx' : 'idling.fbx';
        const walkingFile = characterId <= 4 ? 'Walking.fbx' : 'walking.fbx';

        console.log(`📦 Loading idle model: ${basePath}/${idleFile}`);

        // Load idle model first
        loader.load(
            `${basePath}/${idleFile}`,
            (idleFbx) => {
                console.log(`✅ Idle model loaded for character ${characterId}`);

                // Center the model
                const box = new THREE.Box3().setFromObject(idleFbx);
                const center = box.getCenter(new THREE.Vector3());
                idleFbx.position.x = -center.x;
                idleFbx.position.y = -box.min.y; // Place on ground
                idleFbx.position.z = -center.z;

                idleFbx.scale.setScalar(1);

                // Load texture
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    `${basePath}/shaded.png`,
                    (texture) => {
                        console.log(`🎨 Texture loaded for character ${characterId}`);
                        // Check if component is still mounted
                        if (!mountedRef.current || !sceneRef.current) {
                            console.log(`⚠️ Component unmounted, skipping texture for character ${characterId}`);
                            return;
                        }

                        idleFbx.traverse((child) => {
                            if ((child as THREE.Mesh).isMesh) {
                                const mesh = child as THREE.Mesh;
                                mesh.material = new THREE.MeshStandardMaterial({
                                    map: texture,
                                    roughness: 0.7,
                                    metalness: 0.1,
                                });
                                mesh.castShadow = true;
                                mesh.receiveShadow = true;
                            }
                        });
                        setLoading(false);
                    },
                    undefined,
                    (err) => {
                        console.error(`❌ Error loading texture for character ${characterId}:`, err);
                        setLoading(false);
                    }
                );

                // Check if component is still mounted
                if (!mountedRef.current || !sceneRef.current) {
                    console.log(`⚠️ Component unmounted, skipping model add for character ${characterId}`);
                    return;
                }

                scene.add(idleFbx);
                sceneRef.current.model = idleFbx;

                // Load walking animation
                console.log(`🚶 Loading walking animation: ${basePath}/${walkingFile}`);
                loader.load(
                    `${basePath}/${walkingFile}`,
                    (walkingFbx) => {
                        console.log(`✅ Walking animation loaded for character ${characterId}`);
                        // Check if component is still mounted
                        if (!mountedRef.current || !sceneRef.current) {
                            console.log(`⚠️ Component unmounted, skipping animation for character ${characterId}`);
                            return;
                        }

                        if (walkingFbx.animations && walkingFbx.animations.length > 0) {
                            const mixer = new THREE.AnimationMixer(idleFbx);
                            const action = mixer.clipAction(walkingFbx.animations[0]);
                            action.play();
                            sceneRef.current.mixer = mixer;
                            console.log(`▶️ Animation playing for character ${characterId}`);
                        }
                    },
                    undefined,
                    (err) => {
                        console.error(`❌ Error loading walking animation for character ${characterId}:`, err);
                    }
                );
            },
            (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`⏳ Loading character ${characterId}: ${percent.toFixed(0)}%`);
            },
            (err) => {
                console.error(`❌ Error loading idle model for character ${characterId}:`, err);
                setError(true);
                setLoading(false);
            }
        );

        // Store initial position
        let initialPosition = new THREE.Vector3();
        let modelCentered = false;

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
            // Check if component is still mounted
            if (!mountedRef.current || !sceneRef.current) {
                return; // Stop animation if component unmounted
            }

            const animationId = requestAnimationFrame(animate);
            sceneRef.current.animationId = animationId;

            const delta = clock.getDelta();
            if (sceneRef.current.mixer) {
                sceneRef.current.mixer.update(delta);
            }

            if (sceneRef.current.model) {
                // Save initial position after first frame
                if (!modelCentered) {
                    initialPosition.copy(sceneRef.current.model.position);
                    modelCentered = true;
                }

                // Keep character in place (walking animation won't move it)
                sceneRef.current.model.position.x = initialPosition.x;
                sceneRef.current.model.position.z = initialPosition.z;
                // Allow Y movement for natural walking bounce

                // Rotate model slowly
                sceneRef.current.model.rotation.y += 0.01;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            console.log(`🧹 Cleaning up character ${characterId}...`);

            mountedRef.current = false;

            if (sceneRef.current?.animationId) {
                cancelAnimationFrame(sceneRef.current.animationId);
            }

            if (sceneRef.current?.mixer) {
                sceneRef.current.mixer.stopAllAction();
            }

            // Dispose of geometries and materials
            scene.traverse((object) => {
                if ((object as THREE.Mesh).isMesh) {
                    const mesh = object as THREE.Mesh;
                    mesh.geometry?.dispose();
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(material => material.dispose());
                    } else {
                        mesh.material?.dispose();
                    }
                }
            });

            renderer.dispose();
            scene.clear();

            // Remove canvas element safely
            try {
                if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
            } catch (e) {
                // Canvas already removed, ignore
            }

            sceneRef.current = null;
        };
    }, [characterId]);

    // Update border glow when selected
    useEffect(() => {
        if (containerRef.current) {
            const canvas = containerRef.current.querySelector('canvas');
            if (canvas) {
                canvas.style.border = isSelected ? '4px solid #fbbf24' : '4px solid rgba(255,255,255,0.2)';
                canvas.style.borderRadius = '12px';
                canvas.style.boxShadow = isSelected ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none';
                canvas.style.transition = 'all 0.3s ease';
            }
        }
    }, [isSelected]);

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center relative"
            style={{ width: '200px', height: '200px' }}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 rounded-xl">
                    <div className="text-white text-sm">Loading Character {characterId}...</div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-xl">
                    <div className="text-white text-sm">Failed to load</div>
                </div>
            )}
        </div>
    );
}
