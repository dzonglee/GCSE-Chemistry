"use client";
import { useEffect, useRef, useState } from "react";
import { polymerChain } from "@/lib/polymer-structures";
import { PolymerChainProjection } from "./PolymerChainProjection";
type Controls = {
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function PolymerScene3D({
  units = 3,
  highlight = false,
}: {
  units?: number;
  highlight?: boolean;
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
        cylinder = new T.CylinderGeometry(1, 1, 1, 12),
        carbonMaterial = new T.MeshStandardMaterial({
          color: 0x65718a,
          roughness: 0.4,
        }),
        hydrogenMaterial = new T.MeshStandardMaterial({
          color: 0xe5e9f2,
          roughness: 0.4,
        }),
        selectedMaterial = new T.MeshStandardMaterial({
          color: 0xe9bf4a,
          roughness: 0.35,
        }),
        neighbourMaterial = new T.MeshStandardMaterial({
          color: 0x3548ca,
          roughness: 0.4,
        }),
        linkMaterial = new T.MeshStandardMaterial({
          color: 0x929db3,
          roughness: 0.5,
        }),
        selectedLinkMaterial = new T.MeshStandardMaterial({
          color: 0xbb851c,
          roughness: 0.4,
        });
      const { atoms, bonds, continuation } = polymerChain(units);
      const neighboursOf = (id: number) =>
        bonds
          .filter((b) => b.a === id || b.b === id)
          .map((b) => (b.a === id ? b.b : b.a));
      const selected = atoms[2],
        neighbours = new Set(neighboursOf(selected.id));
      group.name = "polyethene-chain-section";
      group.userData = {
        structure: "polyethene-tetrahedral-zigzag-crop",
        shownRepeatUnits: units,
        carbonCount: units * 2,
        hydrogenCount: units * 4,
        atomCount: atoms.length,
        bondCount: bonds.length,
        selectedCarbon: 2,
        selectedNeighbours: [...neighbours],
        finiteFragment: true,
        notCompleteMolecularFormula: true,
        omittedEndContinuation: true,
        notToScale: true,
      };
      atoms.forEach((atom) => {
        const chosen = atom.id === selected.id,
          neighbor = highlight && neighbours.has(atom.id),
          mesh = new T.Mesh(
            sphere,
            chosen
              ? selectedMaterial
              : neighbor
                ? neighbourMaterial
                : atom.element === "H"
                  ? hydrogenMaterial
                  : carbonMaterial,
          );
        mesh.name = `${atom.element === "C" ? "carbon" : "hydrogen"}-${atom.id}`;
        mesh.userData = {
          element: atom.element,
          associatedCarbon: atom.carbon,
          representedBonds: neighboursOf(atom.id).length,
          fullBonds: atom.element === "C" ? 4 : 1,
          selected: chosen,
        };
        mesh.position.set(...atom.position);
        mesh.scale.setScalar(
          chosen
            ? 0.13
            : neighbor
              ? 0.095
              : atom.element === "H"
                ? 0.055
                : 0.075,
        );
        group.add(mesh);
      });
      bonds.forEach((bond) => {
        const a = new T.Vector3(...atoms[bond.a].position),
          b = new T.Vector3(...atoms[bond.b].position),
          direction = b.clone().sub(a),
          chosen =
            highlight && (bond.a === selected.id || bond.b === selected.id),
          mesh = new T.Mesh(
            cylinder,
            chosen ? selectedLinkMaterial : linkMaterial,
          );
        mesh.name = `covalent-bond-${bond.a}-${bond.b}`;
        mesh.userData = {
          atomA: bond.a,
          atomB: bond.b,
          kind: "intramolecular-single-covalent-bond",
          highlighted: chosen,
        };
        mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
        mesh.scale.set(
          chosen ? 0.025 : 0.015,
          direction.length(),
          chosen ? 0.025 : 0.015,
        );
        mesh.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          direction.normalize(),
        );
        group.add(mesh);
      });
      continuation.forEach((c) => {
        const a = new T.Vector3(...atoms[c.from].position),
          b = new T.Vector3(...c.position),
          d = b.clone().sub(a),
          mesh = new T.Mesh(cylinder, linkMaterial);
        mesh.name = `continuation-${c.from}`;
        mesh.userData = {
          kind: "omitted-chain-continuation",
          atomFrom: c.from,
          notAdditionalAtom: true,
        };
        mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
        mesh.scale.set(0.012, d.length(), 0.012);
        mesh.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          d.normalize(),
        );
        group.add(mesh);
      });
      const maximumCrop = polymerChain(4),
        fitPositions = [
          ...maximumCrop.atoms.map((a) => a.position),
          ...maximumCrop.continuation.map((c) => c.position),
        ];
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
                halfWidth =
                  Math.max(
                    (size.x + 0.3) / 2,
                    ((size.y + 0.3) / 2) * aspect,
                    0.6,
                  ) * 1.2;
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
          camera.left = -2.5 * Math.max(1, w / h);
          camera.right = -camera.left;
          camera.top = 2.5 * Math.max(1, h / w);
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
        cylinder.dispose();
        [
          carbonMaterial,
          hydrogenMaterial,
          selectedMaterial,
          neighbourMaterial,
          linkMaterial,
          selectedLinkMaterial,
        ].forEach((m) => m.dispose());
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
          link.download = "polyethene-section.glb";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      target.dataset.atoms = String(atoms.length);
      target.dataset.bonds = String(bonds.length);
      target.dataset.focus = String(selected.id);
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
  }, [units, highlight]);
  return (
    <div className="polymer-asset">
      <div className="atom-view-bar">
        <strong>Inspect a poly(ethene) section</strong>
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
        aria-label="Rotate polymer chain"
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
        <PolymerChainProjection units={units} highlight={highlight} />
      )}
      {unavailable && (
        <p role="status">
          3D is unavailable. The chain projection, atom counts and prediction
          controls remain available.
        </p>
      )}
      <p className="position-caption">
        {units} shown two-carbon repeat units contribute {units * 2} carbon and{" "}
        {units * 4} hydrogen atoms in part of one poly(ethene) molecule.
        Continuation at both ends is omitted, so these counts are not a complete
        molecular formula. The selected interior carbon has four tetrahedrally
        arranged bonds. Colours highlight neighbours; enlarged spheres and ideal
        bond lengths are schematic. A real chain is much longer and can adopt
        other conformations.
      </p>
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate chain left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate chain right"
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
                  "Asset export failed; your chain prediction is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download chain as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
