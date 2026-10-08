"use client";
import { useEffect, useRef, useState } from "react";
import {
  interiorIon,
  nearestNeighbours,
  sodiumChlorideFragment,
} from "@/lib/ionic-structures";
type Controls = {
  update: (focus: "Na+" | "Cl-", highlight: boolean) => void;
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function LatticeScene3D({
  focus,
  highlight,
}: {
  focus: "Na+" | "Cl-";
  highlight: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<Controls | null>(null),
    latest = useRef({ focus, highlight });
  const [ready, setReady] = useState(false),
    [unavailable, setUnavailable] = useState(false),
    [flat, setFlat] = useState(false),
    [exporting, setExporting] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    latest.current = { focus, highlight };
    controls.current?.update(focus, highlight);
  }, [focus, highlight]);
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
        camera = new T.OrthographicCamera(-3, 3, 3, -3, 0.1, 30),
        group = new T.Group();
      camera.position.set(0, 0, 9);
      camera.lookAt(0, 0, 0);
      scene.add(group, new T.HemisphereLight(0xffffff, 0x8894b7, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 4, 5);
      scene.add(light);
      const sphere = new T.SphereGeometry(1, 24, 18),
        materials = [
          new T.MeshStandardMaterial({ color: 0x3f4fd0, roughness: 0.35 }),
          new T.MeshStandardMaterial({ color: 0x783ac6, roughness: 0.35 }),
          new T.MeshStandardMaterial({ color: 0xe1ad29, roughness: 0.35 }),
          new T.MeshStandardMaterial({ color: 0x11a389, roughness: 0.35 }),
        ];
      const render = () => {
        if (!disposed) renderer.render(scene, camera);
      };
      const resize = () => {
        const width = target.clientWidth,
          height = target.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        const aspect = width / height;
        camera.left = -3 * aspect;
        camera.right = 3 * aspect;
        camera.top = 3;
        camera.bottom = -3;
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
      const update = (focus: "Na+" | "Cl-", highlight: boolean) => {
        group.clear();
        const centre = interiorIon(focus),
          neighbours = nearestNeighbours(centre);
        group.name = "finite-sodium-chloride-lattice-fragment";
        group.userData = {
          formula: "NaCl",
          sodiumIons: 32,
          chlorideIons: 32,
          totalCharge: 0,
          finiteFragment: true,
          selectedIon: centre.id,
          nearestNeighbours: neighbours.map((n) => n.id),
          notToScale: true,
        };
        for (const ion of sodiumChlorideFragment) {
          const selected = ion.id === centre.id,
            near = highlight && neighbours.some((n) => n.id === ion.id);
          const mesh = new T.Mesh(
            sphere,
            materials[selected ? 2 : near ? 3 : ion.charge === 1 ? 0 : 1],
          );
          mesh.name = ion.id;
          mesh.userData = {
            species: ion.species,
            charge: ion.charge,
            selected,
            nearestNeighbour: neighbours.some((n) => n.id === ion.id),
          };
          mesh.position.set(...ion.position);
          mesh.scale.setScalar(ion.charge === 1 ? 0.18 : 0.29);
          group.add(mesh);
        }
        target.dataset.ions = "64";
        target.dataset.charge = "0";
        target.dataset.selected = centre.id;
        target.dataset.neighbours = highlight ? "6" : "hidden";
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
        materials.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
      controls.current = {
        update,
        turn,
        reset: () => {
          group.rotation.set(0.35, 0.65, 0);
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
            throw Error("Missing binary asset.");
          const url = URL.createObjectURL(
              new Blob([result], { type: "model/gltf-binary" }),
            ),
            link = document.createElement("a");
          link.href = url;
          link.download = "sodium-chloride-lattice.glb";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      update(latest.current.focus, latest.current.highlight);
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
  const centre = interiorIon(focus),
    neighbours = nearestNeighbours(centre);
  const projected = sodiumChlorideFragment
    .map((ion) => ({
      ion,
      x: 180 + 39 * ion.position[0] + 18 * ion.position[2],
      y: 150 - 39 * ion.position[1] - 15 * ion.position[2],
    }))
    .sort((a, b) => a.ion.position[2] - b.ion.position[2]);
  return (
    <div className="lattice-asset">
      <div className="atom-view-bar">
        <strong>Solid NaCl: finite 3D fragment</strong>
        {!unavailable && (
          <button className="text-button" onClick={() => setFlat(!flat)}>
            {flat ? "Use 3D asset" : "Use 2D projection"}
          </button>
        )}
      </div>
      <div
        ref={host}
        className="lattice-scene"
        role="group"
        aria-label="Rotate sodium chloride lattice"
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
        <svg
          viewBox="0 0 360 310"
          role="img"
          aria-label="Oblique 2D projection of 64 alternating sodium and chloride ions. Some ions overlap; this view flattens depth."
        >
          {projected.map(({ ion, x, y }) => (
            <circle
              key={ion.id}
              cx={x}
              cy={y}
              r={ion.charge === 1 ? 7 : 11}
              fill={
                ion.id === centre.id
                  ? "#e1ad29"
                  : highlight && neighbours.some((n) => n.id === ion.id)
                    ? "#11a389"
                    : ion.charge === 1
                      ? "#3f4fd0"
                      : "#783ac6"
              }
            />
          ))}
          <text x="180" y="300" textAnchor="middle" fontSize="17">
            2D projection: depth is flattened
          </text>
        </svg>
      )}
      {unavailable && (
        <p role="status">
          3D is unavailable; the projection and text preserve the same ion
          structure.
        </p>
      )}
      <p className="position-caption">
        Blue: Na⁺; purple: Cl⁻. Gold: selected {focus === "Na+" ? "Na⁺" : "Cl⁻"}
        .{highlight && " Green: its six nearest opposite ions."} The 64-ion
        fragment contains 32 of each ion, total charge zero. It is part of a
        repeating giant structure.
      </p>
      {highlight && (
        <p>
          Nearest neighbours lie above, below, left, right, in front and behind
          the selected interior ion. The fragment’s edges omit further ions; a
          real crystal extends beyond them.
        </p>
      )}
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate lattice left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate lattice right"
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
                  "Asset export failed; your learning task is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download lattice as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <details>
        <summary>What does this lattice model leave out?</summary>
        <p>
          Spheres identify ions; colours and sizes are illustrative, not bulk
          colour or measured radii. Gaps help inspection and are not a scale
          model. Attraction acts throughout the lattice, without isolated NaCl
          molecules or covalent sticks. This finite fragment omits the rest of
          the crystal. A 2D projection hides depth and may overlap ions. Six
          nearest neighbours applies to sodium chloride, not every ionic
          compound.
        </p>
      </details>
    </div>
  );
}
