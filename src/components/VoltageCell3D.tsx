"use client";
import { useEffect, useRef, useState } from "react";
import type { VoltageApparatusState } from "@/lib/voltage-cell-asset";
export function VoltageCell3D({ state }: { state: VoltageApparatusState }) {
  const { metal1, metal2, red, black, electronFrom, electronTo, volts } = state;
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<{
      rotate: (delta: number) => void;
      download: () => Promise<void>;
    } | null>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [error, setError] = useState(""),
    [angle, setAngle] = useState(0);
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    async function init() {
      const T = await import("three"),
        { voltageCellAsset } = await import("@/lib/voltage-cell-asset");
      if (disposed) return;
      setReady(false);
      setFailed(false);
      setAngle(0);
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = voltageCellAsset({
          metal1,
          metal2,
          red,
          black,
          electronFrom,
          electronTo,
          volts,
        }),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
      scene.add(root, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-3, 6, 8);
      scene.add(light);
      camera.position.set(2, 0.9, 8);
      camera.lookAt(0, 0.1, 0);
      const resize = () => {
        if (disposed) return;
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
        const half = Math.max(width, (height * w) / h) * 1.15;
        camera.left = -half;
        camera.right = half;
        camera.top = (half * h) / w;
        camera.bottom = (-half * h) / w;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(target);
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
              await import("three/addons/exporters/GLTFExporter.js"),
            data = await new GLTFExporter().parseAsync(
              voltageCellAsset({
                metal1,
                metal2,
                red,
                black,
                electronFrom,
                electronTo,
                volts,
              }),
              { binary: true },
            );
          if (!(data instanceof ArrayBuffer))
            throw Error("Missing real binary asset.");
          const url = URL.createObjectURL(
              new Blob([data], { type: "model/gltf-binary" }),
            ),
            a = document.createElement("a");
          a.href = url;
          a.download =
            "signed-cell-" + metal1 + "-" + metal2 + "-" + red + "-red.glb";
          a.click();
          URL.revokeObjectURL(url);
        },
      };
      cleanup = () => {
        controls.current = null;
        observer.disconnect();
        root.traverse((n) => {
          if (n instanceof T.Mesh || n instanceof T.Line) {
            n.geometry.dispose();
            const materials = Array.isArray(n.material)
              ? n.material
              : [n.material];
            materials.forEach((m) => m.dispose());
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
      resize();
      setReady(true);
    }
    void init().catch(() => {
      if (!disposed) {
        cleanup();
        setFailed(true);
      }
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [metal1, metal2, red, black, electronFrom, electronTo, volts]);
  return (
    <figure className="energy-cup-asset voltage-cell-asset">
      <figcaption>
        Two separate partly immersed metal plates share the supplied
        electrolyte. The red positive and black COM meter leads are separate
        from the conducting-load circuit.
      </figcaption>
      <div
        ref={host}
        className="energy-cup-canvas"
        role="group"
        aria-label="Rotate signed-cell measurement apparatus"
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
        Physical metal 1: {state.metal1}; metal 2: {state.metal2}. Your red
        lead: {state.red === "unset" ? "not chosen" : state.red}; black COM
        lead: {state.black === "unset" ? "not chosen" : state.black}. Your
        predicted reading: {state.volts} V. Your proposed discharge electron
        direction:{" "}
        {state.electronFrom === "unset" ? "not chosen" : state.electronFrom} →{" "}
        {state.electronTo === "unset" ? "not chosen" : state.electronTo}.
      </p>
      <p className="position-caption">
        The wires preserve your chosen meter connections, including both leads
        on one plate. Swapping leads does not swap the physical metals or the
        separate load. The arrow is your proposed discharge direction, not a
        measured current or particle speed. Geometry is schematic and does not
        calculate the voltage.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The text and main diagram retain your meter
          connections, both electrodes, electrolyte and external wire/load.
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
            onClick={() => controls.current?.rotate(-angle)}
          >
            Reset view
          </button>
          <button
            className="button"
            onClick={() => {
              setError("");
              void controls.current
                ?.download()
                .catch(() =>
                  setError(
                    "The 3D download failed. Your connections and diagram remain available.",
                  ),
                );
            }}
          >
            Download actual 3D apparatus
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
    </figure>
  );
}
