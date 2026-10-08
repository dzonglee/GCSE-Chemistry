"use client";
import { useEffect, useRef, useState } from "react";
import {
  covalentMolecules,
  moleculePositions,
  type CovalentMolecule,
} from "@/lib/covalent";
import { BondModelDiagram } from "./BondModelDiagram";
type Controls = {
  turn: (yaw: number, pitch: number) => void;
  reset: () => void;
  download: () => Promise<void>;
};
export function CovalentScene3D({
  molecule,
  context = "bonding",
}: {
  molecule: CovalentMolecule;
  context?: "bonding" | "formula-count" | "bond-count";
}) {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<Controls | null>(null);
  const [ready, setReady] = useState(false),
    [unavailable, setUnavailable] = useState(false),
    [flat, setFlat] = useState(false),
    [exporting, setExporting] = useState(false),
    [error, setError] = useState("");
  const spec = covalentMolecules[molecule],
    atoms = [spec.centre, ...spec.partners];
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
      const sphere = new T.SphereGeometry(1, 24, 18),
        cylinder = new T.CylinderGeometry(0.045, 0.045, 1, 16),
        colours: Record<string, number> = {
          H: 0xaebbd4,
          C: 0x344055,
          N: 0x3f4fd0,
          O: 0xc95166,
          Cl: 0x783ac6,
        };
      const materials = Object.fromEntries(
          Object.entries(colours).map(([symbol, color]) => [
            symbol,
            new T.MeshStandardMaterial({ color, roughness: 0.35 }),
          ]),
        ),
        linkMaterial = new T.MeshStandardMaterial({
          color: 0x7d879d,
          roughness: 0.5,
        });
      const p = moleculePositions(molecule),
        s = covalentMolecules[molecule],
        aa = [s.centre, ...s.partners];
      group.name = `${molecule}-covalent-molecule`;
      group.userData = {
        formula: molecule,
        context,
        geometry: s.geometry,
        atomCount: aa.length,
        bondOrders: [...s.orders],
        notToScale: true,
      };
      aa.forEach((atom, i) => {
        const mesh = new T.Mesh(sphere, materials[atom.symbol]);
        mesh.name = `atom-${i}-${atom.symbol}`;
        mesh.userData = { element: atom.symbol };
        mesh.position.set(...p[i]);
        mesh.scale.setScalar(
          atom.symbol === "H" ? 0.23 : atom.symbol === "Cl" ? 0.43 : 0.34,
        );
        group.add(mesh);
      });
      s.orders.forEach((order, i) => {
        const start = new T.Vector3(...p[0]),
          end = new T.Vector3(...p[i + 1]),
          direction = end.clone().sub(start).normalize(),
          side = new T.Vector3().crossVectors(
            direction,
            new T.Vector3(0, 1, 0),
          );
        if (side.length() < 0.1)
          side.crossVectors(direction, new T.Vector3(1, 0, 0));
        side.normalize();
        for (let j = 0; j < order; j++) {
          const mesh = new T.Mesh(cylinder, linkMaterial);
          mesh.name = `bond-${i}-pair-${j}`;
          mesh.userData = { bond: i, sharedPair: j, bondOrder: order };
          mesh.position.copy(
            start
              .clone()
              .add(end)
              .multiplyScalar(0.5)
              .add(side.clone().multiplyScalar((j - (order - 1) / 2) * 0.13)),
          );
          mesh.scale.y = start.distanceTo(end);
          mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction);
          group.add(mesh);
        }
      });
      const render = () => {
          if (!disposed) {
            if (
              (context === "formula-count" || context === "bond-count") &&
              target.clientWidth &&
              target.clientHeight
            ) {
              const aspect = target.clientWidth / target.clientHeight,
                bounds = new T.Box3().setFromObject(group),
                size = bounds.getSize(new T.Vector3()),
                centre = bounds.getCenter(new T.Vector3()),
                halfHeight = Math.max(size.y / 2, size.x / (2 * aspect)) * 1.4;
              camera.left = centre.x - halfHeight * aspect;
              camera.right = centre.x + halfHeight * aspect;
              camera.top = centre.y + halfHeight;
              camera.bottom = centre.y - halfHeight;
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
          camera.left = (-2.3 * w) / h;
          camera.right = (2.3 * w) / h;
          camera.top = 2.3;
          camera.bottom = -2.3;
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
        Object.values(materials).forEach((m) => m.dispose());
        linkMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      controls.current = {
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
          if (!(result instanceof ArrayBuffer)) throw Error("No binary asset");
          const url = URL.createObjectURL(
              new Blob([result], { type: "model/gltf-binary" }),
            ),
            link = document.createElement("a");
          link.href = url;
          link.download = `${molecule}-molecule.glb`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      target.dataset.atoms = String(aa.length);
      target.dataset.bondPairs = String(
        s.orders.reduce((sum, n) => sum + n, 0),
      );
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
  }, [molecule, context]);
  return (
    <div className="covalent-asset">
      <div className="atom-view-bar">
        <strong>{molecule}: inspect its molecular representation</strong>
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
        aria-label="Rotate covalent molecule"
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
        <BondModelDiagram molecule={molecule} />
      )}
      {unavailable && (
        <p role="status">
          {context === "bond-count"
            ? "3D is unavailable. The labelled molecular projection, displayed reaction formulae and bond-count controls remain available."
            : context === "formula-count"
              ? "3D is unavailable. The labelled atom projection and formula-count controls remain available."
              : "3D is unavailable. The projected model and electron diagram remain available."}
        </p>
      )}
      {context === "bond-count" ? (
        <p className="position-caption">
          One {molecule} molecule: {spec.orders.length} bond connections with
          orders {spec.orders.join(", ")}. Illustrative {spec.geometry}{" "}
          arrangement. Multiple parallel sticks represent one multiple-bond
          connection; use its matching supplied bond-energy entry once. Apply
          equation coefficients separately. Radii, colours and stick lengths are
          schematic and do not encode bond energies. This view does not show a
          reaction mechanism.
        </p>
      ) : context === "formula-count" ? (
        <p className="position-caption">
          {atoms.length} atoms: {atoms.map((a) => a.symbol).join(", ")}. This
          illustrative {spec.geometry} molecular model shows atom counts. Sphere
          radii and stick lengths are schematic; radii do not encode relative
          atomic mass. Sticks represent covalent bonds.
        </p>
      ) : (
        <>
          {" "}
          <p className="position-caption">
            {atoms.length} atoms: {atoms.map((a) => a.symbol).join(", ")}.
            Shared pairs per bond: {spec.orders.join(", ")}. Illustrative{" "}
            {spec.geometry} arrangement. Shapes, colours, radii and gaps are
            schematic, not measured dimensions or bulk appearance. Sticks
            represent bonds; the electron diagram shows the shared and unshared
            electrons that this asset omits.
          </p>
        </>
      )}
      {ready && !flat && !unavailable && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate molecule left"
            onClick={() => controls.current?.turn(-0.2, 0)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate molecule right"
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
                  "Asset export failed; your electron model is retained.",
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Preparing asset…" : "Download molecule as GLB"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
