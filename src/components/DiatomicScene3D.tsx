"use client";
import { useEffect, useRef, useState } from "react";
import type { Halogen, HalogenRepresentation } from "@/lib/halogens";
import { halogenParticle } from "@/lib/halogens";
type Controls = {
  update: (halogen: Halogen, representation: HalogenRepresentation) => void;
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function DiatomicScene3D({
  halogen,
  representation,
}: {
  halogen: Halogen;
  representation: HalogenRepresentation;
}) {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<Controls | null>(null),
    latest = useRef({ halogen, representation });
  const [ready, setReady] = useState(false),
    [unavailable, setUnavailable] = useState(false),
    [flat, setFlat] = useState(false),
    [exporting, setExporting] = useState(false),
    [error, setError] = useState("");
  const particle = halogenParticle(halogen, representation);
  useEffect(() => {
    latest.current = { halogen, representation };
    controls.current?.update(halogen, representation);
  }, [halogen, representation]);
  useEffect(() => {
    const target = host.current!;
    let disposed = false,
      cleanup = () => {};
    async function init() {
      const T = await import("three");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      const scene = new T.Scene(),
        camera = new T.OrthographicCamera(-3, 3, 2, -2, 0.1, 20),
        group = new T.Group();
      camera.position.set(0, 0, 7);
      camera.lookAt(0, 0, 0);
      scene.add(group, new T.HemisphereLight(0xffffff, 0x8997b7, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 4, 5);
      scene.add(light);
      const sphere = new T.SphereGeometry(0.65, 32, 24),
        bond = new T.CylinderGeometry(0.09, 0.09, 1.6, 20),
        atomMaterial = new T.MeshStandardMaterial({
          color: 0x4655cd,
          roughness: 0.3,
        }),
        bondMaterial = new T.MeshStandardMaterial({
          color: 0x8792a8,
          roughness: 0.5,
        });
      const render = () => {
        if (!disposed) renderer.render(scene, camera);
      };
      const resize = () => {
        const width = target.clientWidth,
          height = target.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        const aspect = width / height;
        camera.left = -2.2 * aspect;
        camera.right = 2.2 * aspect;
        camera.top = 2.2;
        camera.bottom = -2.2;
        camera.updateProjectionMatrix();
        render();
      };
      const turn = (yaw: number, pitch: number) => {
        group.rotation.y += yaw;
        group.rotation.x = Math.max(
          -1.3,
          Math.min(1.3, group.rotation.x + pitch),
        );
        target.dataset.rotation = `${group.rotation.x},${group.rotation.y}`;
        render();
      };
      const update = (
        halogen: Halogen,
        representation: HalogenRepresentation,
      ) => {
        group.clear();
        const p = halogenParticle(halogen, representation);
        group.userData = { halogen, representation, ...p };
        for (let i = 0; i < p.atomCount; i++) {
          const atom = new T.Mesh(sphere, atomMaterial);
          atom.name = `atom-${i}`;
          atom.position.x = p.atomCount === 1 ? 0 : i === 0 ? -0.8 : 0.8;
          group.add(atom);
        }
        if (p.atomCount === 2) {
          const link = new T.Mesh(bond, bondMaterial);
          link.name = "schematic-covalent-bond";
          link.rotation.z = Math.PI / 2;
          group.add(link);
        }
        target.dataset.atoms = String(p.atomCount);
        target.dataset.charge = String(p.charge);
        resize();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(target);
      let pointer: { id: number; x: number; y: number } | undefined;
      const down = (e: PointerEvent) => {
        if (e.button !== 0) return;
        pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
        target.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!pointer || pointer.id !== e.pointerId) return;
        turn((e.clientX - pointer.x) * 0.012, (e.clientY - pointer.y) * 0.012);
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      };
      const up = () => {
        pointer = undefined;
      };
      const lost = (e: Event) => {
        e.preventDefault();
        setReady(false);
        setUnavailable(true);
        cleanup();
      };
      target.addEventListener("pointerdown", down);
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      target.addEventListener("pointercancel", up);
      renderer.domElement.addEventListener("webglcontextlost", lost);
      cleanup = () => {
        controls.current = null;
        observer.disconnect();
        target.removeEventListener("pointerdown", down);
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        target.removeEventListener("pointercancel", up);
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        sphere.dispose();
        bond.dispose();
        atomMaterial.dispose();
        bondMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      controls.current = {
        update,
        turn,
        reset: () => {
          group.rotation.set(0.2, 0.35, 0);
          turn(0, 0);
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          if (disposed) return;
          const result = await new GLTFExporter().parseAsync(group, {
            binary: true,
          });
          if (!(result instanceof ArrayBuffer))
            throw Error("Export did not produce a GLB.");
          const url = URL.createObjectURL(
              new Blob([result], { type: "model/gltf-binary" }),
            ),
            link = document.createElement("a");
          link.href = url;
          link.download = `${latest.current.halogen}-${latest.current.representation}.glb`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      update(latest.current.halogen, latest.current.representation);
      controls.current.reset();
      setReady(true);
    }
    init().catch(() => {
      cleanup();
      if (!disposed) {
        setUnavailable(true);
        setReady(false);
      }
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);
  const fallback = (
    <svg
      viewBox="0 0 320 150"
      role="img"
      aria-label={`${particle.formula}: ${particle.atomCount} atom${particle.atomCount === 1 ? "" : "s"}, charge ${particle.charge}. Schematic, not to scale.`}
    >
      {particle.atomCount === 2 && (
        <line
          x1="110"
          y1="75"
          x2="210"
          y2="75"
          stroke="#8792a8"
          strokeWidth="8"
        />
      )}
      {Array.from({ length: particle.atomCount }, (_, i) => (
        <circle
          key={i}
          cx={particle.atomCount === 1 ? 160 : i === 0 ? 110 : 210}
          cy="75"
          r="35"
          fill="#4655cd"
        />
      ))}
      <text x="160" y="137" textAnchor="middle" fontSize="18">
        {particle.formula}
      </text>
    </svg>
  );
  return (
    <div className="diatomic-asset">
      <div className="atom-view-bar">
        <strong>{particle.formula}: your particle representation</strong>
        {!unavailable && (
          <button className="text-button" onClick={() => setFlat(!flat)}>
            {flat ? "Use 3D asset" : "Use 2D diagram"}
          </button>
        )}
      </div>
      <div
        ref={host}
        className="diatomic-scene"
        role="group"
        aria-label="Rotate particle representation"
        tabIndex={flat || unavailable ? -1 : 0}
        hidden={flat || unavailable || !ready}
        data-ready={ready}
        onKeyDown={(e) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-0.2, 0],
            ArrowRight: [0.2, 0],
            ArrowUp: [0, -0.2],
            ArrowDown: [0, 0.2],
          };
          if (moves[e.key]) {
            e.preventDefault();
            controls.current?.turn(...moves[e.key]);
          }
        }}
      />
      {(flat || unavailable || !ready) && fallback}
      {unavailable && (
        <p className="position-caption">
          3D is unavailable here. The diagram retains your chosen species and
          atom count.
        </p>
      )}
      <p className="position-caption">
        {particle.atomCount} atom{particle.atomCount === 1 ? "" : "s"}; charge{" "}
        {particle.charge === -1 ? "−1" : "0"}. Spheres represent atoms; the
        connector represents a covalent bond. Colours and sizes do not represent
        bulk appearance or measured molecular dimensions.
      </p>
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate particle left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate particle right"
            onClick={() => controls.current?.turn(0.2, 0)}
          >
            ↷
          </button>
          <button
            className="text-button"
            onClick={() => controls.current?.reset()}
          >
            Reset view
          </button>
          <button
            className="text-button"
            disabled={exporting}
            onClick={async () => {
              setError("");
              setExporting(true);
              try {
                await controls.current?.download();
              } catch {
                setError(
                  "The asset could not be exported. Your task is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting
              ? "Preparing asset…"
              : "Download current particle as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
