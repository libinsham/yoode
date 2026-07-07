"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type Viewer3DHandle = {
  applyDesign: (dataUrl: string) => void;
};

// Mesh names inside the t-shirt GLB that should receive the custom texture
const BODY_MESHES = ["Body_Front_Node_4", "Body_Back_Node_5", "Object_10", "Object_11", "Object_12", "Object_14", "Object_15", "Object_16"];
const SLEEVE_MESHES = ["Sleeves_Node_6", "Sleeves_Node_7", "Object_18", "Object_20"];
const RIBBING_MESHES = ["Cloth_1", "Ribbing_Node_2", "Ribbing_Node_3", "Object_6", "Object_8"];

// Default fabric color mapped onto a canvas and used as the body texture
function makeFabricTexture(hexColor: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 1024;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 1024, 1024);
  // subtle woven noise
  for (let i = 0; i < 10000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.018})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 1);
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.012})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1, 2);
  }
  return c;
}

const ProductViewer3D = forwardRef<Viewer3DHandle, {
  shape: "mug" | "bottle" | "tshirt";
  color: string;
}>(function ProductViewer3D({ shape, color }, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    group?: THREE.Group;
    bodyMeshes: THREE.Mesh[];
    sleeveMeshes: THREE.Mesh[];
    ribbingMeshes: THREE.Mesh[];
    bodyTex?: THREE.CanvasTexture;
    raf?: number;
    rotY: number;
  }>({ bodyMeshes: [], sleeveMeshes: [], ribbingMeshes: [], rotY: 0.3 });

  // Expose applyDesign so customizer can bake 2D canvas → 3D texture
  useImperativeHandle(ref, () => ({
    applyDesign(dataUrl: string) {
      const s = stateRef.current;
      const img = new Image();
      img.onload = () => {
        const fabricCanvas = makeFabricTexture(color);
        const ctx = fabricCanvas.getContext("2d")!;

        // Draw the design (logo + text) onto the front chest area
        // UV centre of chest is roughly (0.25–0.75 u, 0.35–0.75 v) on front
        const maxSize = 400;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        const cx = (1024 - dw) / 2;
        const cy = 260;
        ctx.drawImage(img, cx, cy, dw, dh);

        if (s.bodyTex) {
          s.bodyTex.image = fabricCanvas;
          s.bodyTex.needsUpdate = true;
        } else {
          const tex = new THREE.CanvasTexture(fabricCanvas);
          tex.flipY = false;
          s.bodyTex = tex;
        }
        // Apply to whichever meshes already exist. If the GLB hasn't
        // finished loading yet, bodyMeshes/sleeveMeshes will be empty here —
        // the GLTFLoader onLoad callback checks s.bodyTex and picks up the
        // texture once the meshes are created, so no design is lost.
        s.bodyMeshes.forEach(m => {
          const mat = new THREE.MeshStandardMaterial({ map: s.bodyTex, roughness: 0.85, metalness: 0 });
          m.material = mat;
        });
        s.sleeveMeshes.forEach(m => {
          const mat = new THREE.MeshStandardMaterial({ map: s.bodyTex, roughness: 0.85, metalness: 0 });
          m.material = mat;
        });
      };
      img.src = dataUrl;
    },
  }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;
    const s = stateRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ede8);

    // Ground fog for depth
    scene.fog = new THREE.Fog(0xf0ede8, 12, 30);

    // Camera
    const camera = new THREE.PerspectiveCamera(28, W / H, 0.01, 100);
    camera.position.set(0, 0.5, shape === "tshirt" ? 4.5 : 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // Lighting (studio 3-point like Sketchfab)
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff5e0, 1.6);
    key.position.set(3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0003;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd0e8ff, 0.6);
    fill.position.set(-5, 2, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(0, 8, -6);
    scene.add(rim);

    // Subtle ground plane to catch shadow
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.6;
    ground.receiveShadow = true;
    scene.add(ground);

    const group = new THREE.Group();
    scene.add(group);

    s.renderer = renderer;
    s.scene = scene;
    s.camera = camera;
    s.group = group;
    s.bodyMeshes = [];
    s.sleeveMeshes = [];
    s.ribbingMeshes = [];

    if (shape === "tshirt") {
      const loader = new GLTFLoader();
      loader.load(
        "/models/tshirt.glb",
        (gltf) => {
          const model = gltf.scene;

          // Auto-scale and centre the model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const centre = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 3.0 / maxDim;
          model.scale.setScalar(scaleFactor);
          model.position.sub(centre.multiplyScalar(scaleFactor));
          model.position.y += 0.1;

          // Enable shadows and categorise meshes
          model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.castShadow = true;
            child.receiveShadow = true;

            const name = child.name;

            if (BODY_MESHES.includes(name)) {
              s.bodyMeshes.push(child);
              child.material = s.bodyTex
                ? new THREE.MeshStandardMaterial({ map: s.bodyTex, roughness: 0.85, metalness: 0 })
                : new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
            } else if (SLEEVE_MESHES.includes(name)) {
              s.sleeveMeshes.push(child);
              child.material = s.bodyTex
                ? new THREE.MeshStandardMaterial({ map: s.bodyTex, roughness: 0.85, metalness: 0 })
                : new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
            } else if (RIBBING_MESHES.includes(name)) {
              s.ribbingMeshes.push(child);
              // Ribbing slightly darker
              const c = new THREE.Color(color);
              c.multiplyScalar(0.82);
              child.material = new THREE.MeshStandardMaterial({
                color: c, roughness: 0.9, metalness: 0,
              });
            } else {
              // catch-all: tint everything else the same color
              child.material = new THREE.MeshStandardMaterial({
                color, roughness: 0.85, metalness: 0,
              });
            }
          });

          group.add(model);
        },
        (xhr) => console.log(`Loading: ${Math.round(xhr.loaded / xhr.total * 100)}%`),
        (err) => console.error("GLB load error:", err)
      );
    } else if (shape === "bottle") {
      const pts = [
        new THREE.Vector2(0.56, -1.65), new THREE.Vector2(0.62, -0.9),
        new THREE.Vector2(0.62, 0.85), new THREE.Vector2(0.48, 1.15),
        new THREE.Vector2(0.33, 1.35), new THREE.Vector2(0.33, 1.72),
      ];
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.55 });
      const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 56), mat);
      body.castShadow = true;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.33, 0.33, 0.14, 32),
        new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.3, metalness: 0.8 })
      );
      cap.position.y = 1.79;
      group.add(body); group.add(cap);
    } else {
      // Mug
      const pts = [
        new THREE.Vector2(0.68, -1.15), new THREE.Vector2(0.96, -1.15),
        new THREE.Vector2(1.0, 0.95), new THREE.Vector2(0.68, 1.15),
      ];
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0 });
      const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat);
      body.castShadow = true;
      const base = new THREE.Mesh(new THREE.CircleGeometry(0.68, 48), mat);
      base.rotation.x = -Math.PI / 2; base.position.y = -1.15;
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.095, 14, 32, Math.PI * 1.48), mat
      );
      handle.position.set(1.08, 0, 0); handle.rotation.z = -Math.PI / 5;
      group.add(body); group.add(base); group.add(handle);
    }

    // Drag to rotate
    let drag = false, lastX = 0;
    const onDown = (e: PointerEvent) => { drag = true; lastX = e.clientX; };
    const onUp = () => { drag = false; };
    const onMove = (e: PointerEvent) => {
      if (drag) { s.rotY += (e.clientX - lastX) * 0.01; lastX = e.clientX; }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);

    // Animate
    function animate() {
      if (!drag) s.rotY += 0.003;
      group.rotation.y = s.rotY;
      renderer.render(scene, camera);
      s.raf = requestAnimationFrame(animate);
    }
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(s.raf!);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [shape]);

  // Live color update on all mesh groups
  useEffect(() => {
    const s = stateRef.current;
    if (s.bodyTex) return; // design already applied, don't override
    s.bodyMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set(color));
    s.sleeveMeshes.forEach(m => (m.material as THREE.MeshStandardMaterial).color.set(color));
    s.ribbingMeshes.forEach(m => {
      const c = new THREE.Color(color);
      c.multiplyScalar(0.82);
      (m.material as THREE.MeshStandardMaterial).color.set(c);
    });
  }, [color]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />
      <div style={{
        position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,.45)", color: "#fff", fontSize: 11, fontWeight: 600,
        padding: "4px 12px", borderRadius: 999, pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        🖱️ Drag to rotate
      </div>
    </div>
  );
});

export default ProductViewer3D;
