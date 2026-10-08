"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type * as Three from "three";
import { atomCounts } from "@/lib/science";

type Counts = {
  protons: number;
  neutrons: number;
  electrons: number;
  shellCounts?: readonly number[];
};
type SceneControls = {
  update: (counts: Counts) => void;
  turn: (yaw: number, pitch: number) => void;
  focus: (nucleus: boolean) => void;
  reset: () => void;
  download: () => Promise<void>;
};

export function AtomScene3D({
  protons,
  neutrons,
  electrons,
  shellCounts,
  fallback,
}: Counts & { fallback: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<SceneControls | null>(null);
  const latest = useRef({ protons, neutrons, electrons, shellCounts });
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [flat, setFlat] = useState(false);
  const [focused, setFocused] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const description = useId();

  useEffect(() => {
    latest.current = { protons, neutrons, electrons, shellCounts };
    controls.current?.update(latest.current);
  }, [protons, neutrons, electrons, shellCounts]);

  useEffect(() => {
    const target = host.current!;
    let disposed = false;
    let cleanup = () => {};
    async function init() {
      const T = await import("three");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      // Cap high-density mobile rendering; redraw only after an interaction.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-3, 3, 2.4, -2.4, 0.1, 30);
      camera.position.set(0, 0, 8);
      camera.lookAt(0, 0, 0);
      scene.add(new T.HemisphereLight(0xffffff, 0x8b99b4, 2));
      const key = new T.DirectionalLight(0xfff5e0, 3.2);
      key.position.set(-3, 5, 6);
      scene.add(key);
      const fill = new T.DirectionalLight(0xc9d9ff, 1.4);
      fill.position.set(4, -2, 1);
      scene.add(fill);
      const atom = new T.Group();
      atom.name = "SchematicAtom_NotToScale";
      scene.add(atom);
      const sphere = new T.SphereGeometry(1, 28, 20);
      const protonMaterial = new T.MeshStandardMaterial({
        color: 0x3f4fd0,
        roughness: 0.28,
        metalness: 0.12,
      });
      const neutronMaterial = new T.MeshStandardMaterial({
        color: 0xe6ac36,
        roughness: 0.3,
        metalness: 0.12,
      });
      const electronMaterial = new T.MeshStandardMaterial({
        color: 0x7546ca,
        roughness: 0.25,
        metalness: 0.15,
      });
      const shellMaterial = new T.MeshBasicMaterial({
        color: 0x7692ce,
        transparent: true,
        opacity: 0.025,
        depthWrite: false,
        side: T.DoubleSide,
      });
      const ringMaterial = new T.LineBasicMaterial({
        color: 0xaabbd7,
        transparent: true,
        opacity: 0.72,
      });
      const generatedGeometry: Three.BufferGeometry[] = [];
      let yaw = 0.4,
        pitch = 0.18,
        nucleusFocus = false,
        sceneHalfHeight = 2.65;
      const applyFocus = () => {
        for (const child of atom.children)
          if (child.name.startsWith("Shell_")) child.visible = !nucleusFocus;
      };
      const render = () => {
        if (!disposed) renderer.render(scene, camera);
      };
      const resize = () => {
        const width = target.clientWidth,
          height = target.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height);
        const halfHeight = sceneHalfHeight;
        const halfWidth = (halfHeight * width) / height;
        camera.left = -halfWidth;
        camera.right = halfWidth;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
        camera.zoom = nucleusFocus ? 3.2 : 1;
        camera.updateProjectionMatrix();
        render();
      };
      const turn = (horizontal: number, vertical: number) => {
        yaw += horizontal;
        pitch = Math.max(-1.35, Math.min(1.35, pitch + vertical));
        atom.rotation.set(pitch, yaw, 0);
        target.dataset.rotation = `${yaw.toFixed(3)},${pitch.toFixed(3)}`;
        render();
      };
      // Compact lattice positions form a magnified cluster, not a nuclear-physics model.
      const sites: Three.Vector3[] = [];
      for (let x = -3; x <= 3; x++)
        for (let y = -3; y <= 3; y++)
          for (let z = -3; z <= 3; z++)
            if ((x + y + z) % 2 === 0)
              sites.push(new T.Vector3(x * 0.225, y * 0.225, z * 0.225));
      sites.sort(
        (a, b) =>
          a.lengthSq() - b.lengthSq() || a.y - b.y || a.x - b.x || a.z - b.z,
      );
      const addParticle = (
        kind: "proton" | "neutron" | "electron",
        index: number,
        position: Three.Vector3,
        parent: Three.Group,
      ) => {
        const material =
          kind === "proton"
            ? protonMaterial
            : kind === "neutron"
              ? neutronMaterial
              : electronMaterial;
        const mesh = new T.Mesh(sphere, material);
        mesh.name = `${kind}_${index + 1}`;
        mesh.position.copy(position);
        mesh.scale.setScalar(kind === "electron" ? 0.105 : 0.163);
        parent.add(mesh);
      };
      const update = (counts: Counts) => {
        atom.clear();
        for (const geometry of generatedGeometry) geometry.dispose();
        generatedGeometry.length = 0;
        const nucleus = new T.Group();
        nucleus.name = "Nucleus_Magnified";
        atom.add(nucleus);
        // Interleave the two particle types so the cluster does not suggest layered nuclei.
        let p = 0,
          n = 0;
        for (let i = 0; i < counts.protons + counts.neutrons; i++) {
          if (p < counts.protons && (i % 2 === 0 || n >= counts.neutrons))
            addParticle("proton", p++, sites[i], nucleus);
          else addParticle("neutron", n++, sites[i], nucleus);
        }
        const shellCounts =
          counts.shellCounts ??
          atomCounts(counts.protons, counts.neutrons, counts.electrons).shells;
        sceneHalfHeight = shellCounts.length >= 4 ? 3.05 : 2.65;
        // Empty atom-build states still show a boundary, without inventing an electron.
        for (let shell = 0; shell < Math.max(1, shellCounts.length); shell++) {
          const radius = 1.3 + shell * 0.45;
          const boundary = new T.Mesh(sphere, shellMaterial);
          boundary.scale.setScalar(radius);
          boundary.name = `Shell_${shell + 1}_Boundary_NotAnOrbit`;
          atom.add(boundary);
          for (let plane = 0; plane < 2; plane++) {
            const points = Array.from({ length: 97 }, (_, i) => {
              const angle = (i * 2 * Math.PI) / 96;
              return plane === 0
                ? new T.Vector3(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0,
                  )
                : new T.Vector3(
                    radius * Math.cos(angle),
                    0,
                    radius * Math.sin(angle),
                  );
            });
            const geometry = new T.BufferGeometry().setFromPoints(points);
            generatedGeometry.push(geometry);
            const ring = new T.Line(geometry, ringMaterial);
            ring.name = `Shell_${shell + 1}_Guide_${plane + 1}`;
            atom.add(ring);
          }
          const shellElectrons = new T.Group();
          shellElectrons.name = `Shell_${shell + 1}_Electrons`;
          atom.add(shellElectrons);
          const count = shellCounts[shell] ?? 0;
          for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI) / count + shell * 0.42;
            const latitude = count <= 2 ? 0 : i % 2 === 0 ? 0.25 : -0.25;
            addParticle(
              "electron",
              i,
              new T.Vector3(
                radius * Math.cos(latitude) * Math.cos(angle),
                radius * Math.sin(latitude),
                radius * Math.cos(latitude) * Math.sin(angle),
              ),
              shellElectrons,
            );
          }
        }
        atom.userData = {
          ...counts,
          note: "Teaching schematic: magnified nucleus; shell boundaries are not electron paths; not to scale.",
        };
        target.dataset.particles = `${p},${n},${shellCounts.reduce((a, b) => a + b, 0)}`;
        target.dataset.shells = shellCounts.join(",");
        applyFocus();
        turn(0, 0);
        resize();
      };
      const lost = (event: Event) => {
        event.preventDefault();
        setReady(false);
        setUnavailable(true);
        cleanup();
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      const observer = new ResizeObserver(resize);
      observer.observe(target);
      let pointer: { id: number; x: number; y: number } | undefined;
      const down = (event: PointerEvent) => {
        if (event.button !== 0) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        target.setPointerCapture(event.pointerId);
      };
      const move = (event: PointerEvent) => {
        if (!pointer || pointer.id !== event.pointerId) return;
        turn(
          (event.clientX - pointer.x) * 0.012,
          (event.clientY - pointer.y) * 0.012,
        );
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      };
      const up = () => {
        pointer = undefined;
      };
      target.addEventListener("pointerdown", down);
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      target.addEventListener("pointercancel", up);
      cleanup = () => {
        controls.current = null;
        observer.disconnect();
        target.removeEventListener("pointerdown", down);
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        target.removeEventListener("pointercancel", up);
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        for (const geometry of generatedGeometry) geometry.dispose();
        sphere.dispose();
        protonMaterial.dispose();
        neutronMaterial.dispose();
        electronMaterial.dispose();
        shellMaterial.dispose();
        ringMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      controls.current = {
        update,
        turn,
        focus: (nucleus) => {
          nucleusFocus = nucleus;
          applyFocus();
          resize();
        },
        reset: () => {
          yaw = 0.4;
          pitch = 0.18;
          nucleusFocus = false;
          applyFocus();
          turn(0, 0);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          if (disposed) return;
          const snapshot = atom.clone(true);
          snapshot.rotation.set(0, 0, 0);
          snapshot.traverse((object) => {
            object.visible = true;
          });
          const asset = await new GLTFExporter().parseAsync(snapshot, {
            binary: true,
            trs: true,
          });
          if (disposed || !(asset instanceof ArrayBuffer)) return;
          const url = URL.createObjectURL(
            new Blob([asset], { type: "model/gltf-binary" }),
          );
          const link = document.createElement("a");
          const counts = snapshot.userData as Counts;
          link.href = url;
          link.download = `atom-${counts.protons}p-${counts.neutrons}n-${counts.electrons}e.glb`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      update(latest.current);
      resize();
      setReady(true);
    }
    init().catch(() => {
      cleanup();
      if (!disposed) {
        setReady(false);
        setUnavailable(true);
      }
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="atom-scene" data-ready={ready}>
      <div className="atom-scene-heading">
        <strong>
          {flat || unavailable ? "2D diagram" : "Interactive 3D atom"}
        </strong>
        {!unavailable && (
          <button
            className="text-button"
            onClick={() => {
              setFlat(!flat);
              // ResizeObserver resizes the renderer when its host is shown again.
            }}
          >
            {flat ? "Show 3D" : "Use 2D diagram"}
          </button>
        )}
      </div>
      <div
        ref={host}
        className="atom-scene-canvas"
        hidden={flat || unavailable}
        tabIndex={ready && !flat && !unavailable ? 0 : -1}
        role="group"
        aria-label="Rotate the 3D atom"
        aria-describedby={description}
        onKeyDown={(event) => {
          const steps: Record<string, [number, number]> = {
            ArrowLeft: [-0.22, 0],
            ArrowRight: [0.22, 0],
            ArrowUp: [0, -0.18],
            ArrowDown: [0, 0.18],
          };
          if (steps[event.key]) {
            event.preventDefault();
            controls.current?.turn(...steps[event.key]);
          } else if (event.key === "Home") {
            event.preventDefault();
            controls.current?.reset();
            setFocused(false);
          }
        }}
      />
      {(flat || unavailable || !ready) && (
        <div className="atom-scene-fallback">{fallback}</div>
      )}
      <p id={description} className="atom-scene-description">
        {protons} blue protons · {neutrons} gold neutrons · {electrons} purple
        electrons.
        {focused &&
          !flat &&
          !unavailable &&
          " Nucleus view: electrons and shell boundaries are hidden."}
        {ready &&
          !flat &&
          !unavailable &&
          " Drag or use the arrow keys to rotate."}
      </p>
      {ready && !flat && !unavailable && (
        <div className="atom-view-controls" aria-label="3D view controls">
          <button
            className="button"
            aria-label="Rotate atom left"
            onClick={() => controls.current?.turn(-0.35, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate atom right"
            onClick={() => controls.current?.turn(0.35, 0)}
          >
            ↷
          </button>
          <button
            className="button"
            aria-label="Focus on nucleus"
            aria-pressed={focused}
            onClick={() => {
              controls.current?.focus(!focused);
              setFocused(!focused);
            }}
          >
            {focused ? "Show whole atom" : "Focus on nucleus"}
          </button>
          <button
            className="text-button"
            onClick={() => {
              controls.current?.reset();
              setFocused(false);
            }}
          >
            Reset view
          </button>
        </div>
      )}
      <p className="atom-scene-caption">
        Nucleus magnified · shell boundaries are not electron paths · not to
        scale
      </p>
      {unavailable && (
        <p className="atom-scene-description">
          3D is unavailable in this browser. The diagram and particle controls
          still work.
        </p>
      )}
      {ready && !unavailable && (
        <details className="atom-asset-download">
          <summary>Use this 3D asset</summary>
          <button
            className="text-button"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              setExportError("");
              try {
                await controls.current?.download();
              } catch {
                setExportError(
                  "The asset could not be exported. You can continue using the model.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download 3D model (.glb)"}
          </button>
          {exportError && <p role="status">{exportError}</p>}
        </details>
      )}
    </div>
  );
}
