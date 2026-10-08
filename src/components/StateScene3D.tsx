"use client";
import { useEffect, useRef, useState } from "react";
import {
  stateParticles,
  phaseParticleRadius,
  type ParticlePhase,
} from "@/lib/states-of-matter";
import { StateParticleDiagram } from "./StateParticleDiagram";
type Controls = {
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function StateScene3D({
  phase = "solid",
  frame = 0,
}: {
  phase?: ParticlePhase;
  frame?: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<Controls | null>(null);
  const [ready, setReady] = useState(false),
    [unavailable, setUnavailable] = useState(false),
    [flat, setFlat] = useState(false),
    [exporting, setExporting] = useState(false),
    [error, setError] = useState("");
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
        camera = new T.OrthographicCamera(-3, 3, 2.4, -2.4, 0.1, 20),
        group = new T.Group();
      camera.position.set(0, 0, 7);
      camera.lookAt(0, 0, 0);
      scene.add(group, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 4, 5);
      scene.add(light);
      const sphere = new T.SphereGeometry(1, 20, 14),
        carbonMaterial = new T.MeshStandardMaterial({
          color: 0x65718a,
          roughness: 0.4,
        }),
        selectedMaterial = new T.MeshStandardMaterial({
          color: 0xe9bf4a,
          roughness: 0.35,
        });
      const particles = stateParticles(phase, frame);
      group.name = "state-particle-container";
      group.userData = {
        phase,
        illustrativeFrame: frame,
        particleCount: 24,
        particleRadius: phaseParticleRadius,
        notToScale: true,
        notMeasuredTrajectories: true,
        forcesNotRepresented: true,
      };
      particles.forEach((p) => {
        const mesh = new T.Mesh(
          sphere,
          p.id === 0 ? selectedMaterial : carbonMaterial,
        );
        mesh.name = `particle-${p.id}`;
        mesh.userData = {
          particleId: p.id,
          tracked: p.id === 0,
          radius: p.radius,
          notSolidBall: true,
        };
        mesh.position.set(...p.position);
        mesh.scale.setScalar(p.radius);
        group.add(mesh);
      });
      const boundaryGeometry = new T.EdgesGeometry(
          new T.BoxGeometry(4.4, 4.4, 4.4),
        ),
        boundaryMaterial = new T.LineBasicMaterial({ color: 0xb8c2d5 }),
        boundary = new T.LineSegments(boundaryGeometry, boundaryMaterial);
      boundary.name = "container-boundary";
      boundary.userData = { kind: "container-boundary", notParticle: true };
      group.add(boundary);
      const fitPositions = [-2.2, 2.2].flatMap((x) =>
        [-2.2, 2.2].flatMap((y) =>
          [-2.2, 2.2].map((z) => [x, y, z] as [number, number, number]),
        ),
      );
      const render = () => {
          if (!disposed) {
            const aspect =
              target.clientWidth / Math.max(1, target.clientHeight);
            if (aspect > 0) {
              const bounds = new T.Box3().setFromPoints(
                  fitPositions.map((p) =>
                    new T.Vector3(...p).applyEuler(group.rotation),
                  ),
                ),
                size = bounds.getSize(new T.Vector3()),
                halfWidth = Math.max(size.x / 2, (size.y / 2) * aspect) * 1.15;
              camera.left = -halfWidth;
              camera.right = halfWidth;
              camera.top = halfWidth / aspect;
              camera.bottom = -camera.top;
              camera.updateProjectionMatrix();
            }
            renderer.render(scene, camera);
          }
        },
        resize = () => {
          const w = target.clientWidth,
            h = target.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.left = -4 * Math.max(1, w / h);
          camera.right = -camera.left;
          camera.top = 4 * Math.max(1, h / w);
          camera.bottom = -camera.top;
          camera.updateProjectionMatrix();
          render();
        };
      const turn = (yaw: number, pitch: number) => {
        group.rotation.y += yaw;
        group.rotation.x = Math.max(
          -1.4,
          Math.min(1.4, group.rotation.x + pitch),
        );
        target.dataset.rotation = `${group.rotation.x},${group.rotation.y}`;
        render();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(target);
      let pointer: { id: number; x: number; y: number } | undefined;
      const down = (e: PointerEvent) => {
          if (e.button !== 0) return;
          pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
          target.setPointerCapture(e.pointerId);
        },
        move = (e: PointerEvent) => {
          if (!pointer || pointer.id !== e.pointerId) return;
          turn(
            (e.clientX - pointer.x) * 0.012,
            (e.clientY - pointer.y) * 0.012,
          );
          pointer.x = e.clientX;
          pointer.y = e.clientY;
        },
        up = () => {
          pointer = undefined;
        },
        lost = (e: Event) => {
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
        boundaryGeometry.dispose();
        boundaryMaterial.dispose();
        sphere.dispose();

        [carbonMaterial, selectedMaterial].forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
      controls.current = {
        turn,
        reset: () => {
          group.rotation.set(0.3, 0.3, 0);
          turn(0, 0);
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          if (disposed) return;
          const result = await new GLTFExporter().parseAsync(group, {
            binary: true,
          });
          if (!(result instanceof ArrayBuffer)) throw Error("No binary asset");
          const url = URL.createObjectURL(
              new Blob([result], { type: "model/gltf-binary" }),
            ),
            link = document.createElement("a");
          link.href = url;
          link.download = "state-particles.glb";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      target.dataset.particles = String(particles.length);
      target.dataset.phase = phase;
      target.dataset.frame = String(frame);
      target.dataset.particleRadius = String(phaseParticleRadius);
      controls.current.reset();
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
  }, [phase, frame]);
  return (
    <div className="state-asset">
      <div className="atom-view-bar">
        <strong>Inspect particle arrangement and movement</strong>
        {!unavailable && (
          <button className="text-button" onClick={() => setFlat(!flat)}>
            {flat ? "Use 3D asset" : "Use 2D diagram"}
          </button>
        )}
      </div>
      <div
        ref={host}
        className="lattice-scene"
        role="group"
        aria-label="Rotate state particle model"
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
      {(flat || unavailable || !ready) && (
        <StateParticleDiagram phase={phase} frame={frame} />
      )}
      {unavailable && (
        <p role="status">
          3D is unavailable. The particle diagram, motion frames and prediction
          controls remain available.
        </p>
      )}
      <p className="position-caption">
        24 equal-sized illustrative particles in a container. Gold identifies
        the tracked particle, not another substance. Frames show example
        movement, not measured speed or molecular dynamics. Particle counts and
        radii do not change between states. Particles may represent atoms,
        molecules or ions in different actual materials; solid spheres and
        omitted forces are model limits.
      </p>
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate particle view left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate particle view right"
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
                  "Asset export failed; your particle prediction is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download particles as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
