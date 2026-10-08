"use client";
import { useEffect, useRef, useState } from "react";
export function CopperTransfer3D() {
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
        { copperTransferAsset } = await import("@/lib/copper-transfer-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = copperTransferAsset(),
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
              state === "both" ? (i === 0 ? -1.9 : 1.9) : 0;
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
            copperTransferAsset(),
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
          a.download = "copper-electrode-transfer.glb";
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
    <figure className="reaction-amounts-asset copper-transfer-asset">
      <figcaption>
        Copper electrodes: trace the same atomic identities
      </figcaption>
      {ready && !failed && (
        <div className="neutralisation-focus-controls">
          <button
            className="button"
            aria-label="Enlarge before state"
            aria-pressed={focus === "before"}
            onClick={() => controls.current?.focus("before")}
          >
            Before
          </button>
          <button
            className="button"
            aria-label="Enlarge after state"
            aria-pressed={focus === "after"}
            onClick={() => controls.current?.focus("after")}
          >
            After
          </button>
          <button
            className="button"
            aria-label="Compare both copper transfer states"
            aria-pressed={focus === "both"}
            onClick={() => controls.current?.focus("both")}
          >
            Compare
          </button>
        </div>
      )}
      <div
        className={
          focus === "both"
            ? "metal-state-labels"
            : "metal-state-labels neutralisation-single-state"
        }
      >
        {focus !== "after" && <strong>Before: anode 3 Cu; cathode 3 Cu</strong>}
        {focus !== "before" && <strong>After: anode 2 Cu; cathode 4 Cu</strong>}
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate copper transfer reference"
        tabIndex={0}
        data-ready={ready}
        data-focus={focus}
        data-rotation={angle}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            controls.current?.rotate(e.key === "ArrowLeft" ? -0.1 : 0.1);
          }
        }}
      />
      <p>
        Each frame: positive copper anode on the left, solution in the middle,
        negative copper cathode on the right. Cu is copper-coloured, S gold and
        O red. The solution contains one represented Cu2+ ion and one separate
        sulfate ion in both states.
      </p>
      <p>
        Before: three copper constituents in each electrode and one dissolved
        copper ion. After: one original anode copper is now in solution; the
        original dissolved copper is now at the cathode. The intact sulfate
        remains dissolved. All twelve atomic identities and total represented
        charge 0 are retained.
      </p>
      <p className="position-caption">
        Selected constituents, not complete electrode structures or CuSO4
        molecules. Water, hydration shells and the external supply are omitted.
        Positions compare inventories, not literal migration paths. The sulfate
        rotates around its own centre; frames are visual guides, not bonds.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. Text retains Cu7S1O4 in each state: anode 3 → 2
          copper, cathode 3 → 4 copper, solution one copper ion and one intact
          sulfate throughout.
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
                    "The 3D download failed. Both text inventories remain available.",
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
        <summary>About the retained identities</summary>
        <p>
          This reference is the supplied copper-electrode case: it does not show
          an inert anode producing oxygen. Illustrative sizes, spacings and
          sulfate connections are not bond-length or bond-order claims. Download
          always retains both full states, including the omitted-from-view state
          when enlarged. Formal electron accounting is taught separately at
          Higher.
        </p>
      </details>
    </figure>
  );
}
