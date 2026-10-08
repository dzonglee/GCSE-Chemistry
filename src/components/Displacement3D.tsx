"use client";
import { useEffect, useRef, useState } from "react";
export function Displacement3D() {
  const host = useRef<HTMLDivElement>(null),
    controls = useRef<{
      rotate: (delta: number) => void;
      focus: (state: "both" | "before" | "after") => void;
      download: () => Promise<void>;
    } | null>(null),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [error, setError] = useState(""),
    [angle, setAngle] = useState(0),
    [focus, setFocus] = useState<"both" | "before" | "after">("both");
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    async function init() {
      const T = await import("three"),
        { displacementAsset } = await import("@/lib/displacement-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = displacementAsset(),
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
        focus: (state) => {
          root.children.forEach((container, i) => {
            container.visible =
              state === "both" || i === (state === "before" ? 0 : 1);
            container.position.x =
              state === "both" ? (i === 0 ? -2.5 : 2.5) : 0;
          });
          setFocus(state);
          resize();
        },
        rotate: (delta) => {
          yaw += delta;
          root.children.forEach((state) => {
            state.children
              .filter((n) => n.userData.rotateAsSubstance)
              .forEach((n) => {
                n.rotation.y = yaw;
              });
          });
          setAngle(yaw);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          const data = await new GLTFExporter().parseAsync(
            displacementAsset(),
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
          a.download = "displacement.glb";
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
      setFocus("both");
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
  }, []);
  return (
    <figure className="reaction-amounts-asset displacement-asset">
      <figcaption>
        Copper–silver displacement: nitrate spectators remain
      </figcaption>
      <p className="position-caption">
        Viewing: {focus === "both" ? "before and after" : focus + " state"}.
      </p>
      <div
        ref={host}
        className="reaction-amounts-canvas displacement-canvas"
        role="group"
        aria-label="Rotate copper silver displacement reference"
        tabIndex={0}
        data-ready={ready}
        data-rotation={angle}
        data-focus={focus}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            controls.current?.rotate(e.key === "ArrowLeft" ? -0.1 : 0.1);
          }
        }}
      />
      <p>
        Before: Cu metal and two Ag⁺ ions. After: Cu²⁺ and two Ag metal
        constituents. Both states retain two NO₃⁻ spectator ions. Copper is
        brown, silver grey-blue, nitrogen blue and oxygen red.
      </p>
      <p className="position-caption">
        11 atomic identities per state: Cu1Ag2N2O6. Full represented charge:
        before +2 −2 =0; after +2 −2 =0. Omitting nitrate terms leaves +2 on
        each net-equation side. Charge changes are shown in this text, not
        inferred from sphere colour or radius.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The text reference retains Cu + 2Ag⁺ → Cu²⁺ + 2Ag
          and two unchanged nitrate spectators, with all 11 atomic identities
          conserved.
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
            aria-pressed={focus === "before"}
            onClick={() => controls.current?.focus("before")}
          >
            Enlarge before state
          </button>
          <button
            className="button"
            aria-pressed={focus === "after"}
            onClick={() => controls.current?.focus("after")}
          >
            Enlarge after state
          </button>
          <button
            className="button"
            aria-pressed={focus === "both"}
            onClick={() => controls.current?.focus("both")}
          >
            Show both states
          </button>
          <button
            className="button"
            onClick={() => {
              setError("");
              void controls.current
                ?.download()
                .catch(() =>
                  setError(
                    "The 3D download failed. The text reference remains available.",
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
        <summary>About this displacement reference</summary>
        <p>
          Each substance rotates about its own centre. Nitrate is shown with
          planar 120° connectivity guides; equal rods do not specify localised
          single or double bonds. Remaining solvent, hydration and metal
          lattices are omitted. This is representative atom correspondence, not
          a motion mechanism, macroscopic wire or measured bond-length model.
          Electron bookkeeping is separate from the represented atoms.
        </p>
      </details>
    </figure>
  );
}
