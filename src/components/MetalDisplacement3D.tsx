"use client";
import { useEffect, useRef, useState } from "react";
export function MetalDisplacement3D({
  added,
  dissolved,
}: {
  added: "Zn" | "Mg" | "Fe" | "Cu";
  dissolved: "Zn" | "Mg" | "Fe" | "Cu";
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
        { metalDisplacementAsset } =
          await import("@/lib/metal-displacement-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = metalDisplacementAsset(added, dissolved),
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
          a.download = "metal-displacement-before-after.glb";
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
  }, [added, dissolved]);
  const reacts =
    ["Mg", "Zn", "Fe", "Cu"].indexOf(added) <
    ["Mg", "Zn", "Fe", "Cu"].indexOf(dissolved);
  return (
    <figure className="reaction-amounts-asset metal-displacement-asset">
      <figcaption>One displacement event, before and after</figcaption>
      <div className="metal-state-labels">
        <strong>Before</strong>
        <strong>After</strong>
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate displacement states"
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
        Before: solid {added}; aqueous {dissolved}²⁺ and SO₄²⁻. After:{" "}
        {reacts
          ? `solid ${dissolved}; aqueous ${added}²⁺ and unchanged SO₄²⁻`
          : "the same metals and ions; no displacement"}
        .
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The before/after descriptions retain the complete
          represented composition.
        </p>
      )}
      <p className="position-caption">
        Element colours:{" "}
        {Array.from(new Set([added, dissolved]))
          .map(
            (symbol) =>
              `${symbol} ${symbol === "Cu" ? "copper" : symbol === "Fe" ? "dark grey" : "blue-grey"}`,
          )
          .join("; ")}
        ; S gold; O red. Solid metal sits on a surface; the aqueous cation is
        above it.
      </p>
      <p className="position-caption">
        The same seven constituent atoms appear in both states. Aqueous metal
        ions and sulfate are separate ions, not salt molecules. Colours follow
        element identity.
      </p>
      {ready && !failed && (
        <div className="bench-actions">
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
            onClick={() =>
              void controls.current
                ?.download()
                .catch(() =>
                  setError("The asset could not be downloaded. Try again."),
                )
            }
          >
            Download 3D asset
          </button>
        </div>
      )}
      {error && <p role="status">{error}</p>}
      <details>
        <summary>About this 3D view</summary>
        <p>
          A representative surface atom and dissolved cation exchange roles only
          when the added metal is more reactive. Sulfate stays intact and the
          represented total charge remains zero. The tray represents a surface
          crop, not additional atoms. Water, hydration and the full metal
          lattice are omitted. Four equal sulfate connections show tetrahedral
          geometry, not Lewis bond orders.
        </p>
      </details>
    </figure>
  );
}
