"use client";
import { useEffect, useRef, useState } from "react";
import type { DryGasRecord } from "@/lib/gas-inventory-asset";
import { gasRecords, methaneDryGas } from "@/lib/gas-volumes";
export function GasInventory3D({
  record = "initial",
}: {
  record?: DryGasRecord;
}) {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<{
      rotate: (v: number) => void;
      download: () => Promise<void>;
    } | null>(null),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [error, setError] = useState(""),
    [angle, setAngle] = useState(0);
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    const target = host.current!;

    async function init() {
      const T = await import("three"),
        { dryGasInventoryAsset } = await import("@/lib/gas-inventory-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      const group = dryGasInventoryAsset(record),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-12, 12, 8, -8, 0.1, 100);
      scene.add(group, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 6, 8);
      scene.add(light);
      camera.position.set(0, 18, 40);
      camera.lookAt(0, 0, 0);
      const box = new T.Box3().setFromObject(group),
        centre = box.getCenter(new T.Vector3());
      group.position.sub(centre);
      const render = () => {
          if (!disposed) renderer.render(scene, camera);
        },
        resize = () => {
          const w = target.clientWidth,
            h = target.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          const aspect = w / h;
          group.updateMatrixWorld(true);
          camera.updateMatrixWorld(true);
          const bounds = new T.Box3().setFromObject(group);
          let viewWidth = 0.1,
            viewHeight = 0.1;
          for (const x of [bounds.min.x, bounds.max.x])
            for (const y of [bounds.min.y, bounds.max.y])
              for (const z of [bounds.min.z, bounds.max.z]) {
                const point = new T.Vector3(x, y, z).applyMatrix4(
                  camera.matrixWorldInverse,
                );
                viewWidth = Math.max(viewWidth, Math.abs(point.x));
                viewHeight = Math.max(viewHeight, Math.abs(point.y));
              }
          const halfWidth = Math.max(viewWidth, viewHeight * aspect) * 1.15;
          camera.left = -halfWidth;
          camera.right = halfWidth;
          camera.top = halfWidth / aspect;
          camera.bottom = -halfWidth / aspect;
          camera.updateProjectionMatrix();
          render();
        };
      const observer = new ResizeObserver(resize);
      observer.observe(target);
      resize();
      let yaw = 0;
      controls.current = {
        rotate: (delta) => {
          yaw += delta;
          for (const solution of group.children) solution.rotation.y = yaw;
          setAngle(yaw);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          const data = await new GLTFExporter().parseAsync(group, {
            binary: true,
          });
          if (!(data instanceof ArrayBuffer))
            throw Error("Missing binary asset");
          const url = URL.createObjectURL(
              new Blob([data], { type: "model/gltf-binary" }),
            ),
            a = document.createElement("a");
          a.href = url;
          a.download = "methane-dry-gas-inventory.glb";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      cleanup = () => {
        observer.disconnect();
        group.traverse((child) => {
          const mesh = child as import("three").Mesh;
          mesh.geometry?.dispose();
          if (mesh.material)
            for (const mat of Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material])
              mat.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
        controls.current = null;
      };
      if (disposed) {
        cleanup();
        return;
      }
      setAngle(0);
      setFailed(false);
      setReady(true);
    }
    void init().catch(() => {
      if (!disposed) {
        setFailed(true);
        cleanup();
      }
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [record]);
  const quantities = gasRecords.remaining[record],
    inventory = methaneDryGas(quantities.methane, quantities.oxygen);
  return (
    <figure className="reaction-amounts-asset">
      <figcaption>
        Illustrative complete reaction and collection: starting gas{" "}
        {inventory.initialGas} cm³; final dry gas {inventory.totalDryGas} cm³,
        with all water collected as liquid. Gas cubes use a common relative
        volume scale at matching RTP. Molecules show amount ratios, not one
        molecule per 10 cm³ or one mole.
      </figcaption>
      <div className="reaction-side-labels">
        <strong>Starting gases</strong>
        <strong>Final dry gases + collected water</strong>
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate dry gas inventory"
        tabIndex={0}
        data-ready={ready}
        data-rotation={angle}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            controls.current?.rotate(e.key === "ArrowLeft" ? -0.1 : 0.1);
          }
        }}
      />
      {failed && (
        <p role="status">
          3D is unavailable. Initial gas {inventory.initialGas} cm³; final CO₂{" "}
          {inventory.carbonDioxide} cm³, unused CH₄ {inventory.methaneLeft} cm³
          and unused O₂ {inventory.oxygenLeft} cm³. Dry total{" "}
          {inventory.totalDryGas} cm³. Collected liquid water retains the other
          atoms but is excluded from gas volume.
        </p>
      )}
      <p className="position-caption">
        Carbon is grey, oxygen red and hydrogen pale. CH₄ is tetrahedral, CO₂
        linear and H₂O bent. The separate lower tray contains liquid-water
        molecules, retained in total atom/mass accounting. Its dimensions do not
        give liquid-water volume or density. Only the gas cubes share a
        quantitative volume scale. Molecular bonds stay intact during physical
        collection; no lines between water molecules depict new chemical bonds.
        Spheres and bond lengths are schematic; the separate inventories are not
        atom trajectories or a reaction mechanism.
      </p>
      {ready && !failed && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate gas inventory left"
            onClick={() => controls.current?.rotate(-0.1)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate gas inventory right"
            onClick={() => controls.current?.rotate(0.1)}
          >
            ↷
          </button>
          <button
            className="button"
            onClick={() =>
              void controls.current
                ?.download()
                .catch(() =>
                  setError(
                    "Asset export failed; your predictions are retained.",
                  ),
                )
            }
          >
            Download dry gas inventory as GLB
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
    </figure>
  );
}
