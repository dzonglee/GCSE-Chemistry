"use client";
import { useEffect, useRef, useState } from "react";
export function PhProbe3D({ reading }: { reading: number }) {
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
        { phProbeAsset } = await import("@/lib/ph-probe-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = phProbeAsset(reading),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-3, 3, 2, -2, 0.1, 100);
      scene.add(root, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 6, 8);
      scene.add(light);
      camera.position.set(3, 2.3, 8);
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
        const bounds = new T.Box3();
        root.children
          .filter((n) => n.visible)
          .forEach((n) => bounds.union(new T.Box3().setFromObject(n)));
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
          root.rotation.y = yaw;
          setAngle(yaw);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          const data = await new GLTFExporter().parseAsync(
            phProbeAsset(reading),
            {
              binary: true,
            },
          );
          if (!(data instanceof ArrayBuffer))
            throw Error("Missing binary asset");
          const url = URL.createObjectURL(
              new Blob([data], { type: "model/gltf-binary" }),
            ),
            a = document.createElement("a");
          a.href = url;
          a.download = "ph-probe-" + reading.toFixed(1) + ".glb";
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
  }, [reading]);
  return (
    <figure className="reaction-amounts-asset ph-probe-asset">
      <figcaption>
        Actual apparatus reference: supplied probe reading pH{" "}
        {reading.toFixed(1)}
      </figcaption>
      <div
        ref={host}
        className="reaction-amounts-canvas ph-probe-canvas"
        role="group"
        aria-label="Rotate pH probe reference"
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
        The sensing tip is immersed in the clear sample. The meter’s actual
        seven-segment display shows the supplied {reading.toFixed(1)} reading at
        25 °C. No indicator has been added: a probe alone does not colour the
        liquid.
      </p>
      <p className="position-caption">
        Macroscopic apparatus, not atoms or ions. This display is provided data,
        not pH calculated from geometry or a real measurement by this app. The
        translucent surface represents a colourless solution. Illustrative
        dimensions; internal sensor chemistry and calibration apparatus are
        omitted.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The supplied calibrated probe reading remains pH{" "}
          {reading.toFixed(1)} at 25 °C; the tip is immersed in a colourless
          solution.
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
                    "The 3D download failed. The supplied text reading remains available.",
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
        <summary>About this apparatus</summary>
        <p>
          Numerical resolution does not guarantee accuracy; reference checks are
          stated in the supplied task. Indicator colours are interpreted
          separately using a chart. Download retains the selected reading as
          actual display geometry and metadata, with clear liquid and an
          immersed tip.
        </p>
      </details>
    </figure>
  );
}
