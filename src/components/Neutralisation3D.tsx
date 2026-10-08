"use client";
import { useEffect, useRef, useState } from "react";
export function Neutralisation3D() {
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
        { neutralisationAsset } = await import("@/lib/neutralisation-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = neutralisationAsset(),
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
              .forEach((substance) => {
                substance.rotation.y = yaw;
              });
          });
          setAngle(yaw);
          resize();
        },
        download: async () => {
          const { GLTFExporter } =
            await import("three/addons/exporters/GLTFExporter.js");
          const data = await new GLTFExporter().parseAsync(
            neutralisationAsset(),
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
          a.download = "hydrated-neutralisation.glb";
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
    <figure className="reaction-amounts-asset neutralisation-asset">
      <figcaption>Hydrated reference: H3O+ + OH− → 2H2O</figcaption>
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
            aria-label="Compare both neutralisation states"
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
            <strong>Before</strong>
            <strong>After</strong>
          </>
        ) : (
          <strong>
            {focus === "before"
              ? "Before: hydrated proton and hydroxide"
              : "After: water and unchanged spectators"}
          </strong>
        )}
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate neutralisation states"
        tabIndex={0}
        data-focus={focus}
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
        Before: one hydrated proton H3O+, one OH− ion, one Na+ ion and one Cl−
        ion. After: two bent water molecules and the same separate Na+ and Cl−
        ions. One hydrogen transfers between the oxygen-containing species; all
        eight atomic constituents are retained.
      </p>
      <p className="position-caption">
        O red; H pale blue; Na purple; Cl green. Ion positions above the
        molecules are comparison positions, not sedimentation or layers in a
        solution. Frames are visual guides, not chemical bonds.
      </p>
      <p>
        The required GCSE shorthand is H+ + OH− → H2O. The 3D reference includes
        one water molecule carrying the aqueous proton as H3O+, so its equation
        produces two water molecules. It does not change the required GCSE
        equation.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The text retains both inventories: Na1 Cl1 O2 H4.
          Hydrated proton and hydroxide form water; sodium and chloride remain
          spectator ions.
        </p>
      )}
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
          This static representative hydrated transfer is not a kinetic
          mechanism or a complete solvent model. Remaining water and hydration
          shells are omitted. Hydronium is represented as trigonal pyramidal;
          water has a bent 104.5° geometry. Distances are schematic, not a
          molecular-size measurement. The Before and After controls enlarge a
          single state; Compare restores both. The download always includes both
          complete reference states. Each species rotates about its own centre
          to keep the comparison separate. Sodium and chloride remain aqueous
          ions, without a Na–Cl molecular bond. Both represented states have
          total charge zero; complete solutions can be electrically neutral
          while their pH is acidic or alkaline. The reference reaction is
          separate from the workbench’s chosen quantity record.
        </p>
      </details>
    </figure>
  );
}
