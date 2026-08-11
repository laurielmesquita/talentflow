"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function StaticFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
      <div className="absolute right-[8%] top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-[22%] top-1/3 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
    </div>
  );
}

export default function ThreeOrbBackdrop() {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(detectWebGL);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!webgl || reducedMotion || !mount || mount.clientWidth < 1) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const group = new THREE.Group();
    group.position.x = 1.55;
    scene.add(group);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0x8fa7ff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.14,
        metalness: 0.05,
        transmission: 0.45,
        thickness: 1.2,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
      })
    );
    group.add(orb);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: 0.35,
        roughness: 0.22,
      })
    );
    core.position.set(0.2, -0.12, 0.1);
    group.add(core);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.42, 0.014, 16, 128),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45 })
    );
    ring1.rotation.set(Math.PI / 2.4, 0.3, 0);
    group.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.58, 0.008, 16, 128),
      new THREE.MeshBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.32 })
    );
    ring2.rotation.set(Math.PI / 1.7, -0.4, 0.2);
    group.add(ring2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xbcd6ff, 1.1);
    dirLight.position.set(3, 3, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x22d3ee, 0.7);
    pointLight.position.set(-3, -2, 2);
    scene.add(pointLight);

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y += clock.getDelta() * 0.12;
      group.rotation.x = Math.sin(t * 0.16) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w < 1 || h < 1) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      orb.geometry.dispose();
      (orb.material as THREE.Material).dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      ring1.geometry.dispose();
      (ring1.material as THREE.Material).dispose();
      ring2.geometry.dispose();
      (ring2.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [webgl, reducedMotion]);

  if (!webgl || reducedMotion) return <StaticFallback />;

  return (
    <div ref={mountRef} className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
  );
}
