"use client";
import { useEffect, useRef, useState } from "react";
import { nanoBlocks, subdivisionData } from "@/lib/nanoparticles";
import { NanoBlockDiagram } from "./NanoBlockDiagram";
type Controls = {
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function NanoScene3D({
  divisions = 1,
  separated = false,
}: {
  divisions?: number;
  separated?: boolean;
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
        camera = new T.OrthographicCamera(-7, 7, 7, -7, 0.1, 60),
        group = new T.Group();
      camera.position.set(0, 0, 25);
      camera.lookAt(0, 0, 0);
      scene.add(group, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 4, 5);
      scene.add(light);
      const sphere = new T.BoxGeometry(1, 1, 1),
        carbonMaterial = new T.MeshStandardMaterial({
          color: 0x65718a,
          roughness: 0.4,
        }),
        selectedMaterial = new T.MeshStandardMaterial({
          color: 0xe9bf4a,
          roughness: 0.35,
        });
      const particles = nanoBlocks(divisions, separated),
        data = subdivisionData(divisions, separated);
      group.name = "nano-cube-subdivision";
      group.userData = {
        divisions,
        separated,
        particleCount: particles.length,
        totalMaterialVolume: data.totalVolume,
        exposedSurfaceArea: data.exposedArea,
        physicalScaleFixed: true,
        blocksAreNotAtoms: true,
        idealCubesNotRealCrystal: true,
      };
      particles.forEach((p) => {
        const mesh = new T.Mesh(sphere, carbonMaterial);
        mesh.name = `material-cube-${p.id}`;
        mesh.userData = {
          pieceId: p.id,
          side: p.side,
          volume: p.side ** 3,
          sixFaceArea: 6 * p.side ** 2,
          notAtom: true,
        };
        mesh.position.set(...p.position);
        mesh.scale.setScalar(p.side);
        group.add(mesh);
      });
      const fitPositions = [-4, 4].flatMap((x) =>
        [-4, 4].flatMap((y) =>
          [-4, 4].map((z) => [x, y, z] as [number, number, number]),
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
          link.download = "nano-subdivision.glb";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      target.dataset.particles = String(particles.length);
      target.dataset.divisions = String(divisions);
      target.dataset.separated = String(separated);
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
  }, [divisions, separated]);
  return (
    <div className="nano-asset">
      <div className="atom-view-bar">
        <strong>Inspect exposed cubic surfaces</strong>
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
        aria-label="Rotate nanoparticle subdivision"
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
        <NanoBlockDiagram divisions={divisions} separated={separated} />
      )}
      {unavailable && (
        <p role="status">
          3D is unavailable. The cube diagram and prediction controls remain
          available.
        </p>
      )}
      <p className="position-caption">
        Ideal cubes are illustrative material chunks, not atoms or the actual
        crystal shape of titanium dioxide. Total material volume and physical
        scale stay fixed. Separation exposes internal faces; gaps contain no
        material. Six faces count even when hidden from this viewpoint.
      </p>
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate cube view left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate cube view right"
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
                  "Asset export failed; your surface-area prediction is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download cubes as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
