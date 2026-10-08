"use client";
import { useEffect, useRef, useState } from "react";
export function Filtration3D() {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<{
      rotate: (d: number) => void;
      download: () => Promise<void>;
    } | null>(null),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [angle, setAngle] = useState(0),
    [error, setError] = useState("");
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    async function init() {
      const T = await import("three"),
        { filtrationAsset } = await import("@/lib/filtration-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true }),
        root = filtrationAsset(),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-2, 2, 2, -2, 0.1, 100),
        target = host.current!;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      scene.add(root, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 6, 8);
      scene.add(light);
      camera.position.set(0, 1.8, 8);
      camera.lookAt(0, 0.1, 0);
      const resize = () => {
        const w = target.clientWidth,
          h = target.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        root.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        const box = new T.Box3().setFromObject(root);
        let width = 0.1,
          height = 0.1;
        for (const x of [box.min.x, box.max.x])
          for (const y of [box.min.y, box.max.y])
            for (const z of [box.min.z, box.max.z]) {
              const p = new T.Vector3(x, y, z).applyMatrix4(
                camera.matrixWorldInverse,
              );
              width = Math.max(width, Math.abs(p.x));
              height = Math.max(height, Math.abs(p.y));
            }
        const half = Math.max(width, (height * w) / h) * 1.12;
        camera.left = -half;
        camera.right = half;
        camera.top = (half * h) / w;
        camera.bottom = (-half * h) / w;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(target);
      resize();
      let yaw = 0;
      controls.current = {
        rotate: (d) => {
          yaw += d;
          root.rotation.y = yaw;
          setAngle(yaw);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
              await import("three/addons/exporters/GLTFExporter.js"),
            data = await new GLTFExporter().parseAsync(root, { binary: true });
          if (!(data instanceof ArrayBuffer))
            throw Error("Missing binary asset");
          const url = URL.createObjectURL(
              new Blob([data], { type: "model/gltf-binary" }),
            ),
            a = document.createElement("a");
          a.href = url;
          a.download = "salt-filtration.glb";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      cleanup = () => {
        observer.disconnect();
        renderer.dispose();
        target.replaceChildren();
        controls.current = null;
        const gs = new Set<import("three").BufferGeometry>(),
          ms = new Set<import("three").Material>();
        root.traverse((n) => {
          const m = n as import("three").Mesh;
          if (m.geometry) gs.add(m.geometry);
          if (m.material)
            for (const v of Array.isArray(m.material)
              ? m.material
              : [m.material])
              ms.add(v);
        });
        gs.forEach((g) => g.dispose());
        ms.forEach((m) => m.dispose());
      };
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
    <figure className="reaction-amounts-asset filtration-asset">
      <figcaption>
        First filtration: excess CuO stays; salt solution passes
      </figcaption>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate salt filtration apparatus"
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
      <p>
        White cutaway cone: filter paper inside the glass funnel. Its front
        sector is removed only to reveal the residue. Real paper surrounds the
        mixture. Dark region on the paper: excess insoluble CuO residue. Blue
        region in the receiving beaker: copper sulfate solution filtrate. The
        funnel stem leads into the open receiver.
      </p>
      <p className="position-caption">
        This is macroscopic apparatus. Colours and bulk regions are not atoms,
        copper sulfate molecules or a microscopic account of filter pores.
        Dissolved salt passes through with water.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. Text remains: excess CuO is residue; copper sulfate
          solution is filtrate.
        </p>
      )}
      {ready && !failed && (
        <div className="asset-controls">
          <button
            className="button"
            onClick={() => controls.current?.rotate(-0.2)}
          >
            Rotate left
          </button>
          <button
            className="button"
            onClick={() => controls.current?.rotate(0.2)}
          >
            Rotate right
          </button>
          <button
            className="button"
            onClick={() => {
              setError("");
              void controls.current
                ?.download()
                .catch(() =>
                  setError(
                    "The 3D download failed. The labelled text remains available.",
                  ),
                );
            }}
          >
            Download actual 3D asset
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
      <details>
        <summary>About the apparatus</summary>
        <p>
          Illustrative proportions and a paper cutaway, not calibrated
          laboratory dimensions. This depicts the supplied first filtration
          after complete acid consumption, not later recovery of salt crystals.
          The support holds the funnel; the receiver is open. Real practical
          work requires qualified school supervision.
        </p>
      </details>
    </figure>
  );
}
