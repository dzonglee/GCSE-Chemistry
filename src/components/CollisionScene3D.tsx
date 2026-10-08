"use client";
import { useEffect, useRef, useState } from "react";
import type { CollisionAssetState } from "../lib/collision-asset";
export function CollisionScene3D({ state }: { state: CollisionAssetState }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<{
    turn: (delta: number) => void;
    reset: () => void;
    download: () => Promise<void>;
  } | null>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [error, setError] = useState(""),
    [flat, setFlat] = useState(false);
  const signature = JSON.stringify(state);
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    async function init() {
      const T = await import("three");
      const { collisionAsset } = await import("../lib/collision-asset");
      if (disposed) return;
      setReady(false);
      setFailed(false);
      const target = host.current!;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      target.appendChild(renderer.domElement);
      const root = collisionAsset(JSON.parse(signature)),
        scene = new T.Scene(),
        camera = new T.OrthographicCamera(-4, 4, 4, -4, 0.1, 100);
      scene.add(root, new T.HemisphereLight(0xffffff, 0x8794b0, 2));
      const light = new T.DirectionalLight(0xffffff, 3);
      light.position.set(-4, 6, 8);
      scene.add(light);
      camera.position.set(5, 3, 9);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);
      let yaw = 0;
      const render = () => {
        if (disposed) return;
        const w = target.clientWidth,
          h = target.clientHeight;
        if (!w || !h) return;
        // CSS size must stay in layout pixels even when the drawing buffer uses high-DPI pixels.
        renderer.setSize(w, h);
        root.updateMatrixWorld(true);
        // Keep the view scale fixed across each model's states: compression must not enlarge particle glyphs.
        const gas = JSON.parse(signature).kind === "gas";
        const box = new T.Box3(
          gas ? new T.Vector3(-3, -1, -1) : new T.Vector3(-3.1, -3.1, -3.1),
          gas ? new T.Vector3(3, 1, 1) : new T.Vector3(3.1, 3.1, 3.1),
        ).applyMatrix4(root.matrixWorld);
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
        const half = Math.max(width, (height * w) / h) * 1.18;
        camera.left = -half;
        camera.right = half;
        camera.top = (half * h) / w;
        camera.bottom = -camera.top;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const turn = (delta: number) => {
        yaw += delta;
        root.rotation.y = yaw;
        target.dataset.rotation = String(yaw);
        render();
      };
      const reset = () => {
        yaw = 0;
        root.rotation.set(0, 0, 0);
        target.dataset.rotation = "0";
        render();
      };
      const observer = new ResizeObserver(render);
      observer.observe(target);
      let pointer: { id: number; x: number } | undefined;
      const down = (e: PointerEvent) => {
        if (e.button !== 0) return;
        pointer = { id: e.pointerId, x: e.clientX };
        target.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!pointer || pointer.id !== e.pointerId) return;
        turn((e.clientX - pointer.x) * 0.012);
        pointer.x = e.clientX;
      };
      const up = () => {
        pointer = undefined;
      };
      target.addEventListener("pointerdown", down);
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      target.addEventListener("pointercancel", up);
      controls.current = {
        turn,
        reset,
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          const data = await new GLTFExporter().parseAsync(
            collisionAsset(JSON.parse(signature)),
            { binary: true },
          );
          if (!(data instanceof ArrayBuffer))
            throw Error("Missing binary 3D asset.");
          const url = URL.createObjectURL(
            new Blob([data], { type: "model/gltf-binary" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = `collision-${JSON.parse(signature).kind}.glb`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
      render();
      setReady(true);
      cleanup = () => {
        observer.disconnect();
        target.removeEventListener("pointerdown", down);
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        target.removeEventListener("pointercancel", up);
        root.traverse((object) => {
          if (object instanceof T.Mesh || object instanceof T.LineSegments) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.forEach((m) => m.dispose());
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
        controls.current = null;
      };
    }
    init().catch(() => {
      if (!disposed) {
        setFailed(true);
        setReady(false);
      }
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [signature]);
  const isGas = state.kind === "gas";
  return (
    <section
      aria-label={
        isGas ? "Schematic reacting gas in 3D" : "Accessible solid faces in 3D"
      }
    >
      <div
        ref={host}
        tabIndex={flat ? -1 : 0}
        role="img"
        aria-label={
          isGas
            ? "Stationary blue reacting and grey inert particles in the occupied volume. Arrow keys rotate."
            : "Yellow accessible faces and grey internal touching faces. Arrow keys rotate."
        }
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            controls.current?.turn(e.key === "ArrowLeft" ? -0.2 : 0.2);
          }
        }}
        style={{
          height: flat ? 0 : 300,
          overflow: "hidden",
          touchAction: "pan-y",
          visibility: flat ? "hidden" : "visible",
        }}
      />
      <p>
        {isGas
          ? "Stationary schematic: particle size is fixed. This shows number per occupied volume, not measured motion or collision rate."
          : "Ideal macroscopic cubes, not atoms. Yellow faces contact the other reactant; touching internal faces are inaccessible. Separated pieces are assumed fully wetted."}
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The count, volume and accessible-face description
          remain usable.
        </p>
      )}
      <div className="model-controls">
        <button
          type="button"
          disabled={!ready}
          onClick={() => controls.current?.turn(-0.2)}
        >
          Rotate left
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => controls.current?.turn(0.2)}
        >
          Rotate right
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => controls.current?.reset()}
        >
          Reset view
        </button>
        <button type="button" onClick={() => setFlat(!flat)}>
          {flat ? "Show 3D" : "Hide 3D"}
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            setError("");
            controls.current
              ?.download()
              .catch(() =>
                setError(
                  "The 3D download failed; your learning state is retained.",
                ),
              );
          }}
        >
          Download 3D asset
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
