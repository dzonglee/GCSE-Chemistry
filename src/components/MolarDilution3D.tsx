"use client";
import { useEffect, useRef, useState } from "react";
export function MolarDilution3D({ dilutes = true }: { dilutes?: boolean }) {
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
        { molarDilutionAsset } = await import("@/lib/molar-dilution-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      const group = molarDilutionAsset(dilutes),
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
          a.download = "molar-salt-dilution.glb";
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
  }, [dilutes]);
  return (
    <figure className="reaction-amounts-asset">
      <figcaption>
        Illustrative dissolved NaCl: four Na⁺ and four Cl⁻ ions on each side.
        {dilutes
          ? " The final solution volume doubles and its solute concentration halves."
          : " No water is added: final solution volume and concentration are unchanged."}{" "}
        These eight ions do not represent one mole. Water is omitted.
      </figcaption>
      <div className="reaction-side-labels">
        <strong>Before: 0.40 mol/dm³</strong>
        <strong>After: {dilutes ? "0.20" : "0.40"} mol/dm³</strong>
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate dissolved ion dilution inventory"
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
          3D is unavailable. Both inventories contain four separate Na⁺ and four
          separate Cl⁻ ions.
          {dilutes
            ? " The solution volume doubles while dissolved NaCl amount is retained, so concentration halves."
            : " No water is added; dissolved amount, volume and concentration are unchanged."}
        </p>
      )}
      <p className="position-caption">
        Blue spheres are Na⁺; gold spheres are Cl⁻. There are no NaCl molecules
        or chemical bonds between these dispersed ions. Cubes show relative
        final solution volume, not laboratory vessels. The same identified ions
        are retained; sphere radii are schematic, not ionic radii or mass.
        Water, hydration and motion are omitted. NaCl solute concentration
        equals each ion concentration in this ideal dilute example; the sum of
        both ion concentrations is twice that value.
      </p>
      {ready && !failed && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate solution left"
            onClick={() => controls.current?.rotate(-0.1)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate solution right"
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
            Download dissolved ion inventory as GLB
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
    </figure>
  );
}
