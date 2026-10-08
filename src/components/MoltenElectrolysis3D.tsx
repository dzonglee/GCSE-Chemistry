"use client";
import { useEffect, useRef, useState } from "react";
export function MoltenElectrolysis3D() {
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
        { moltenElectrolysisAsset } =
          await import("@/lib/molten-electrolysis-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = moltenElectrolysisAsset(),
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
              state === "both" ? (i === 0 ? -1.7 : 1.7) : 0;
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
            moltenElectrolysisAsset(),
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
          a.download = "molten-electrolysis.glb";
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
    <figure className="reaction-amounts-asset molten-electrolysis-asset">
      <figcaption>
        Molten ZnCl2 reference: same atoms, different charged species
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
            aria-label="Compare both molten electrolysis states"
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
        {focus === "both" ? (
          <>
            <strong>Before: separate ions</strong>
            <strong>After: neutral elements</strong>
          </>
        ) : (
          <strong>
            {focus === "before"
              ? "Before: Zn2+ and two separate Cl−"
              : "After: Zn metal and a Cl2 molecule"}
          </strong>
        )}
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate molten electrolysis reference"
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
        Before: one Zn2+ ion and two separate Cl− ions, total represented charge
        0. After discharge: one neutral zinc constituent in the metal product
        and a neutral Cl2 molecule. All three atomic identities are retained;
        the single Cl–Cl bond is present only after discharge.
      </p>
      <p className="position-caption">
        Zn blue-grey; Cl green. These are representative atomic constituents,
        not a ZnCl2 molecule, complete metal structure or full molten liquid.
        Positions are comparison positions rather than literal migration paths.
        Frames are visual guides, not bonds.
      </p>
      <p>
        The zinc product forms at the negative cathode; chlorine forms at the
        positive anode. The reference does not depict an apparatus or electrical
        circuit. Native movement separately teaches migration direction; this
        view compares starting ions and final elements.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. Text retains Zn1 Cl2 on each side: separate ions
          before, neutral zinc and a Cl2 molecule afterwards.
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
          Illustrative sizes and separations, not physical bond lengths or ionic
          radii. The molten binary example has no water; it does not represent
          aqueous product competition. Download retains both full states even
          when one is enlarged. Charge changes represent discharge, not changes
          to the element’s atomic identity; electron half equations are taught
          separately at Higher.
        </p>
      </details>
    </figure>
  );
}
