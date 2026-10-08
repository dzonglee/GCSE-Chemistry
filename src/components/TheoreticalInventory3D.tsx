"use client";
import { useEffect, useRef, useState } from "react";
export function TheoreticalInventory3D() {
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
        { theoreticalAmmoniaAsset } =
          await import("@/lib/theoretical-inventory-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      const group = theoreticalAmmoniaAsset(),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-12, 12, 8, -8, 0.1, 100);
      scene.add(group, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 6, 8);
      scene.add(light);
      camera.position.set(0, 18, 40);
      camera.lookAt(0, 0, 0);
      const box = new T.Box3().setFromObject(group),
        size = box.getSize(new T.Vector3()),
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
          const aspect = w / h,
            halfWidth = Math.max(size.x * 0.6, size.y * 0.6 * aspect);
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
          group.rotation.y = yaw;
          setAngle(yaw);
          render();
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
          a.download = "theoretical-ammonia-inventory.glb";
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
  }, []);
  return (
    <figure className="reaction-amounts-asset">
      <figcaption>
        Illustrative inventory: 1 N₂ and 4 H₂ before; 2 NH₃ and 1 unused H₂
        after ideal complete conversion of nitrogen. Each group is one molecule,
        not one mole.
      </figcaption>
      <div className="reaction-side-labels">
        <strong>Starting inventory</strong>
        <strong>Ideal final inventory</strong>
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate theoretical ammonia inventory"
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
          3D is unavailable. The inventory is 1 N₂ + 4 H₂ before and 2 NH₃ + 1
          unused H₂ after: 2 N atoms and 8 H atoms on each side.
        </p>
      )}
      <p className="position-caption">
        Nitrogen has a triple bond; hydrogen a single bond. Ammonia is
        pyramidal. Two N atoms and eight H atoms occur on each side. Gold frames
        mark intact unused hydrogen; they are not chemical bonds. Shapes and
        distances are schematic; sphere size does not represent mass. Separate
        before/after groups show composition, not atom trajectories, a reaction
        mechanism or complete real Haber-process conversion.
      </p>
      {ready && !failed && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate reaction left"
            onClick={() => controls.current?.rotate(-0.1)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate reaction right"
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
            Download theoretical inventory as GLB
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
    </figure>
  );
}
