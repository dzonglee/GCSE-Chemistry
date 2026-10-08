"use client";
import { useEffect, useRef, useState } from "react";
export function TitrationBurette3D({
  initial,
  final,
}: {
  initial: number;
  final: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<{
      rotate: (delta: number) => void;
      download: () => Promise<void>;
    } | null>(null),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [error, setError] = useState(""),
    [angle, setAngle] = useState(0);
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    async function init() {
      const T = await import("three"),
        { titrationBuretteAsset } =
          await import("@/lib/titration-burette-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = titrationBuretteAsset(initial, final),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-3, 3, 2, -2, 0.1, 100);
      scene.add(root, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 6, 8);
      scene.add(light);
      camera.position.set(0, 0, 8);
      camera.lookAt(0, 0, 0);
      const render = () => {
        if (!disposed) renderer.render(scene, camera);
      };
      const resize = () => {
        const w = target.clientWidth,
          h = target.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        root.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        const bounds = new T.Box3().setFromObject(root);
        let width = 0.1,
          height = 0.1;
        for (const x of [bounds.min.x, bounds.max.x])
          for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) {
              const p = new T.Vector3(x, y, z).applyMatrix4(
                camera.matrixWorldInverse,
              );
              width = Math.max(width, Math.abs(p.x));
              height = Math.max(height, Math.abs(p.y));
            }
        const half = Math.max(width, (height * w) / h) * 1.2;
        camera.left = -half;
        camera.right = half;
        camera.top = (half * h) / w;
        camera.bottom = (-half * h) / w;
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
          root.children.forEach((state) => {
            state.rotation.y = yaw;
          });
          setAngle(yaw);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          const data = await new GLTFExporter().parseAsync(root, {
            binary: true,
          });
          if (!(data instanceof ArrayBuffer))
            throw Error("Missing binary asset");
          const url = URL.createObjectURL(
              new Blob([data], { type: "model/gltf-binary" }),
            ),
            a = document.createElement("a");
          a.href = url;
          a.download = "titration-burette-before-after.glb";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      cleanup = () => {
        observer.disconnect();
        renderer.dispose();
        target.replaceChildren();
        controls.current = null;
        const geometries = new Set<import("three").BufferGeometry>(),
          materials = new Set<import("three").Material>();
        root.traverse((n) => {
          const mesh = n as import("three").Mesh;
          if (mesh.geometry) geometries.add(mesh.geometry);
          if (mesh.material)
            for (const material of Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material])
              materials.add(material);
        });
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
      };
      setAngle(0);
      setFailed(false);
      setError("");
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
  }, [initial, final]);
  return (
    <figure className="reaction-amounts-asset titration-burette-asset">
      <figcaption>
        One burette, two states. Left: before, {initial.toFixed(2)} cm³. Right:
        after, {final.toFixed(2)} cm³. The scale runs from 0 at the top to 50
        cm³ at the bottom.
      </figcaption>
      <div className="burette-display">
        <div
          ref={host}
          className="reaction-amounts-canvas"
          role="group"
          aria-label="Rotate both burette states"
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
        <div className="burette-reference" aria-hidden="true">
          <span>0 cm³</span>
          <span>25 cm³</span>
          <span>50 cm³</span>
        </div>
      </div>
      {failed && (
        <p role="status">
          3D is unavailable. Use the supplied readings: initial{" "}
          {initial.toFixed(2)} cm³, final {final.toFixed(2)} cm³. Delivery is
          final minus initial. Burette readings increase downwards; a final
          reading alone is not a titre.
        </p>
      )}
      <p className="position-caption">
        Read the lower centre of the meniscus. Ticks are 1 cm³ apart, with
        longer marks every 5 cm³. Use the supplied readings for precise
        calculations.
      </p>
      <details>
        <summary>About this 3D view</summary>
        <p>
          The same calibrated section appears in both states. The schematic
          illustrates delivery, rather than the precision of an exam reading
          scale. Blue makes the bulk solution visible; it is not molecular
          particles or an indicator colour. Tip and tap sizes are schematic and
          excluded from the calibrated scale.
        </p>
      </details>
      {ready && !failed && (
        <div className="bench-actions">
          <button
            className="button"
            aria-label="Rotate burette left"
            onClick={() => controls.current?.rotate(-0.1)}
          >
            ↶
          </button>
          <button
            className="button"
            aria-label="Rotate burette right"
            onClick={() => controls.current?.rotate(0.1)}
          >
            ↷
          </button>
          <button
            className="button"
            onClick={() => {
              setError("");
              void controls.current
                ?.download()
                .catch(() =>
                  setError(
                    "The download could not be prepared. Try again; the text remains available.",
                  ),
                );
            }}
          >
            Download burette states as GLB
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
    </figure>
  );
}
