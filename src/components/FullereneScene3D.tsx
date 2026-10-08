"use client";
import { useEffect, useRef, useState } from "react";
import {
  fullereneAtoms,
  fullereneBonds,
  fullereneFocusRings,
  fullereneNeighbours,
} from "@/lib/fullerenes";
import { FullereneProjection } from "./FullereneProjection";
type Controls = {
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function FullereneScene3D({
  ring = 0,
  payload = false,
  highlight = false,
}: {
  ring?: number;
  payload?: boolean;
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
      const payloadMaterial = new T.MeshStandardMaterial({
        color: 0x7444b6,
        roughness: 0.4,
      });
      const selectedRing = fullereneFocusRings[ring] ?? fullereneFocusRings[0],
        selected = fullereneAtoms[selectedRing[0]],
        neighbours = new Set(selectedRing.filter((id) => id !== selected.id));
      group.name = "C60-closed-covalent-cage";
      group.userData = {
        structure: "C60-truncated-icosahedron",
        molecularFormula: "C60",
        closedCage: true,
        selectedRing: [...selectedRing],
        ringSize: selectedRing.length,
        atomCount: fullereneAtoms.length,
        bondCount: fullereneBonds.length,
        selectedCarbon: selected.id,
        selectedNeighbours: fullereneNeighbours(selected.id).map((a) => a.id),
        discreteMolecule: true,
        notToScale: true,
      };
      fullereneAtoms.forEach((atom) => {
        const chosen = highlight && atom.id === selected.id,
          neighbor = highlight && neighbours.has(atom.id),
          mesh = new T.Mesh(
            sphere,
            chosen
              ? selectedMaterial
              : neighbor
                ? neighbourMaterial
                : carbonMaterial,
          );
        mesh.name = `carbon-${atom.id}`;
        mesh.userData = {
          element: "C",
          from: atom.from,
          to: atom.to,
          representedBonds: fullereneNeighbours(atom.id).length,
          bulkBonds: 3,
          selected: chosen,
        };
        mesh.position.set(...atom.position);
        mesh.scale.setScalar(chosen ? 0.12 : neighbor ? 0.095 : 0.055);
        group.add(mesh);
      });
      fullereneBonds.forEach((bond) => {
        const a = new T.Vector3(...fullereneAtoms[bond.a].position),
          b = new T.Vector3(...fullereneAtoms[bond.b].position),
          direction = b.clone().sub(a),
          chosen =
            highlight &&
            selectedRing.includes(bond.a) &&
            selectedRing.includes(bond.b),
          mesh = new T.Mesh(
            cylinder,
            chosen ? selectedLinkMaterial : linkMaterial,
          );
        mesh.name = `covalent-bond-${bond.a}-${bond.b}`;
        mesh.userData = {
          carbonA: bond.a,
          carbonB: bond.b,
          kind: "covalent-cage-link",
          highlighted: chosen,
        };
        mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
        mesh.scale.set(
          chosen ? 0.045 : 0.018,
          direction.length(),
          chosen ? 0.045 : 0.018,
        );
        mesh.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          direction.normalize(),
        );
        group.add(mesh);
      });
      if (payload) {
        const marker = new T.Mesh(sphere, payloadMaterial);
        marker.name = "conceptual-payload";
        marker.userData = {
          conceptual: true,
          notActualDrug: true,
          notToScale: true,
        };
        marker.scale.setScalar(0.28);
        group.add(marker);
      }
      const render = () => {
          if (!disposed) renderer.render(scene, camera);
        },
        resize = () => {
          const w = target.clientWidth,
            h = target.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.left = -2.2 * Math.max(1, w / h);
          camera.right = -camera.left;
          camera.top = 2.2 * Math.max(1, h / w);
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
          selectedMaterial,
          neighbourMaterial,
          linkMaterial,
          selectedLinkMaterial,
          payloadMaterial,
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
          link.download = "C60-fullerene.glb";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      target.dataset.atoms = String(fullereneAtoms.length);
      target.dataset.bonds = String(fullereneBonds.length);
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
  }, [ring, highlight, payload]);
  return (
    <div className="fullerene-asset">
      <div className="atom-view-bar">
        <strong>Inspect the closed C₆₀ cage</strong>
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
        aria-label="Rotate fullerene cage"
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
        <FullereneProjection
          ring={ring}
          payload={payload}
          highlight={highlight}
        />
      )}
      {unavailable && (
        <p role="status">
          3D is unavailable. The cage projection, ring selection and prediction
          controls remain available.
        </p>
      )}
      <p className="position-caption">
        One complete C₆₀ molecule: sixty carbon atoms in a closed hollow cage.
        Selected rings share atoms and bonds within the same molecule; a ring is
        not a separate molecule. Strong covalent links form the cage. Ideal
        positions and equal drawn links are schematic, not measured bond
        lengths/orders. Colour identifies the selected ring.
        {payload &&
          " The central marker is a conceptual payload, not a carbon atom, actual drug, fit measurement or safety test."}
      </p>
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate network left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate network right"
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
                  "Asset export failed; your cage prediction is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download network as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
