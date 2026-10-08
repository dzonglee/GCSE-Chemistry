"use client";
import { useEffect, useRef, useState } from "react";
export function HydroxideOxidation3D() {
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
        { hydroxideOxidationAsset } =
          await import("@/lib/hydroxide-oxidation-asset");
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const target = host.current!;
      target.appendChild(renderer.domElement);
      const root = hydroxideOxidationAsset(),
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
            hydroxideOxidationAsset(),
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
          a.download = "hydroxide-oxidation.glb";
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
    <figure className="reaction-amounts-asset hydroxide-oxidation-asset">
      <figcaption>
        Hydroxide oxidation: conserve atoms and include external charge
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
            aria-label="Compare both hydroxide states"
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
        {focus !== "after" && <strong>Before: four OH− ions; charge −4</strong>}
        {focus !== "before" && (
          <strong>After: O2 + two H2O; chemical charge 0</strong>
        )}
      </div>
      <div
        ref={host}
        className="reaction-amounts-canvas"
        role="group"
        aria-label="Rotate hydroxide oxidation reference"
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
        Reference: <strong>4OH− → O2 + 2H2O + 4e−</strong>. Red spheres are
        oxygen; pale spheres are hydrogen. Both states retain four O and four H
        atoms, with the same eight identities.
      </p>
      <p className="half-external-charge">
        <strong>External charge account:</strong> four electrons leave the
        positive anode into the external circuit. Molecular products have charge
        0; these electrons contribute −4. Products plus external transfer retain
        total charge −4. Electrons are not atomic meshes or dissolved spheres.
      </p>
      <p className="position-caption">
        Selected atomic constituents, not the complete liquid. Background
        solvent, hydration shells, the electrode and power supply are omitted.
        Frames and identity comparison positions are visual guides, not bonds or
        reaction paths. O2 is diatomic; the two water molecules are bent at
        104.5°.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. Text preserves O4H4: four hydroxide ions become one
          O2 and two H2O. Four electrons transfer externally; total charge
          including that transfer stays −4.
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
          This reference compares the atom inventory of the hydroxide half
          equation. It does not establish an elementary reaction mechanism.
          Illustrated sizes and spacings are not measured bond lengths. Download
          retains both complete states, including the state hidden when
          enlarged. Electron transfer is recorded separately in each state’s
          external charge metadata.
        </p>
      </details>
    </figure>
  );
}
