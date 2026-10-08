"use client";
import { useEffect, useRef, useState } from "react";
import type { OrganicFamily } from "../lib/alcohols";
import type { AlcoholBoard } from "../lib/alcohol-board";
export function AlcoholScene3D({
  n,
  family,
  board,
}: {
  n: number;
  family: OrganicFamily;
  board: AlcoholBoard;
}) {
  const currentKey = n + "|" + family + "|" + JSON.stringify(board);
  const host = useRef<HTMLDivElement>(null),
    latest = useRef({ n, family, board }),
    angles = useRef({ x: -0.12, y: 0.35 }),
    pointer = useRef<{ x: number; y: number } | null>(null);
  const functions = useRef<{
    update: (n: number, family: OrganicFamily, board: AlcoholBoard) => void;
    rotate: (x: number, y: number) => void;
    reset: () => void;
    zoom: (factor: number) => void;
    download: () => Promise<void>;
  } | null>(null);
  const [visible, setVisible] = useState(true),
    [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
      "loading",
    ),
    [readyFor, setReadyFor] = useState(""),
    [downloadStatus, setDownloadStatus] = useState("");
  useEffect(() => {
    latest.current = { n, family, board };
    functions.current?.update(n, family, board);
  }, [n, family, board]);
  useEffect(() => {
    if (!visible) return;
    let cancelled = false,
      dispose = () => {};
    void (async () => {
      try {
        const [T, { buildAlcoholAsset }] = await Promise.all([
          import("three"),
          import("../lib/alcohol-asset"),
        ]);
        if (cancelled || !host.current) return;
        const node = host.current,
          renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0xf7f9fd, 1);
        renderer.outputColorSpace = T.SRGBColorSpace;
        node.replaceChildren(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "260px";
        const scene = new T.Scene(),
          camera = new T.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);
        scene.add(new T.HemisphereLight(0xffffff, 0x58677c, 2.3));
        const lamp = new T.DirectionalLight(0xffffff, 2.5);
        lamp.position.set(3, 4, 6);
        scene.add(lamp);
        let asset: ReturnType<typeof buildAlcoholAsset> | null = null,
          zoom = 1;
        function release(group: NonNullable<typeof asset>) {
          const geometries = new Set<import("three").BufferGeometry>(),
            materials = new Set<import("three").Material>();
          group.traverse((o) => {
            if (o instanceof T.Mesh) {
              geometries.add(o.geometry);
              for (const m of Array.isArray(o.material)
                ? o.material
                : [o.material])
                materials.add(m);
            }
          });
          for (const g of geometries) g.dispose();
          for (const m of materials) m.dispose();
        }
        const render = () => renderer.render(scene, camera),
          resize = () => {
            const width = Math.max(1, node.clientWidth),
              height = 260,
              aspect = width / height,
              box = asset ? new T.Box3().setFromObject(asset) : null,
              half =
                Math.max(
                  1.25,
                  box
                    ? Math.max(Math.abs(box.min.y), Math.abs(box.max.y)) + 0.15
                    : 1.25,
                  box
                    ? (Math.max(Math.abs(box.min.x), Math.abs(box.max.x)) +
                        0.15) /
                        aspect
                    : 1.25,
                ) / zoom;
            camera.top = half;
            camera.bottom = -half;
            camera.left = -half * aspect;
            camera.right = half * aspect;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            render();
          };
        const update = (
          count: number,
          kind: OrganicFamily,
          proposal: AlcoholBoard,
        ) => {
          if (asset) {
            scene.remove(asset);
            release(asset);
          }
          asset = buildAlcoholAsset(count, kind, proposal);
          asset.rotation.set(angles.current.x, angles.current.y, 0);
          scene.add(asset);
          resize();
          setDownloadStatus("");
          setReadyFor(count + "|" + kind + "|" + JSON.stringify(proposal));
          setStatus("ready");
        };
        functions.current = {
          update,
          rotate: (dx, dy) => {
            angles.current.y += dx;
            angles.current.x = Math.max(
              -0.8,
              Math.min(0.8, angles.current.x + dy),
            );
            asset?.rotation.set(angles.current.x, angles.current.y, 0);
            resize();
          },
          reset: () => {
            angles.current = { x: -0.12, y: 0.35 };
            zoom = 1;
            asset?.rotation.set(-0.12, 0.35, 0);
            resize();
          },
          zoom: (factor) => {
            zoom = Math.max(0.6, Math.min(2, zoom * factor));
            resize();
          },
          download: async () => {
            try {
              const snapshot = asset;
              if (!snapshot) throw Error("No proposal available");
              const { GLTFExporter } =
                  await import("three/examples/jsm/exporters/GLTFExporter.js"),
                data = await new GLTFExporter().parseAsync(snapshot, {
                  binary: true,
                });
              if (!(data instanceof ArrayBuffer))
                throw Error("Binary export unavailable");
              const url = URL.createObjectURL(
                  new Blob([data], { type: "model/gltf-binary" }),
                ),
                link = document.createElement("a");
              link.href = url;
              link.download = "organic-functional-group-proposal.glb";
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 10000);
              setDownloadStatus("Current 3D construction downloaded.");
            } catch {
              setDownloadStatus(
                "The asset could not be downloaded. The labelled displayed drawing remains usable.",
              );
            }
          },
        };
        const observer = new ResizeObserver(resize);
        observer.observe(node);
        update(latest.current.n, latest.current.family, latest.current.board);
        dispose = () => {
          observer.disconnect();
          functions.current = null;
          if (asset) {
            scene.remove(asset);
            release(asset);
          }
          renderer.dispose();
          renderer.forceContextLoss();
          node.replaceChildren();
        };
      } catch {
        if (!cancelled) {
          functions.current = null;
          host.current?.replaceChildren();
          setStatus("unavailable");
          setReadyFor("");
        }
      }
    })();
    return () => {
      cancelled = true;
      dispose();
    };
  }, [visible]);
  const ready = visible && status === "ready" && readyFor === currentKey;
  return (
    <figure className="alcohol-scene">
      {visible && (
        <div
          ref={host}
          className="alcohol-canvas"
          role="img"
          aria-label="Rotatable C,H,O construction proposal. Arrow keys rotate."
          tabIndex={0}
          data-state={
            status === "unavailable"
              ? "unavailable"
              : ready
                ? "ready"
                : "loading"
          }
          data-construction={currentKey}
          style={status === "unavailable" ? { display: "none" } : undefined}
          onKeyDown={(e) => {
            if (
              ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                e.key,
              )
            ) {
              e.preventDefault();
              functions.current?.rotate(
                e.key === "ArrowLeft"
                  ? -0.15
                  : e.key === "ArrowRight"
                    ? 0.15
                    : 0,
                e.key === "ArrowUp" ? -0.1 : e.key === "ArrowDown" ? 0.1 : 0,
              );
            }
          }}
          onPointerDown={(e) => {
            pointer.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!pointer.current) return;
            functions.current?.rotate(
              (e.clientX - pointer.current.x) * 0.008,
              (e.clientY - pointer.current.y) * 0.006,
            );
            pointer.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => {
            pointer.current = null;
          }}
          onPointerCancel={() => {
            pointer.current = null;
          }}
        />
      )}
      <figcaption>
        Your actual 3D proposal: dark C, pale H, red O and amber excess
        carbon-bound H. Carbon geometry uses idealized tetrahedral or
        carboxyl-planar directions; oxygen is bent. Sizes are schematic. Missing
        or extra atoms and incorrect bond orders remain visible for correction;
        the displayed 2D orientations are conventions.
      </figcaption>
      {status === "unavailable" && (
        <p role="status">
          3D is unavailable. The original formulas, atom inventory and labelled
          comparison controls remain usable.
        </p>
      )}
      <div className="model-controls">
        <button
          type="button"
          disabled={!ready}
          onClick={() => functions.current?.rotate(-0.2, 0)}
        >
          Rotate left
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => functions.current?.rotate(0.2, 0)}
        >
          Rotate right
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => functions.current?.zoom(1.15)}
        >
          Zoom in
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => functions.current?.zoom(1 / 1.15)}
        >
          Zoom out
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => functions.current?.reset()}
        >
          Reset view
        </button>
        <button
          type="button"
          disabled={status === "unavailable"}
          onClick={() => {
            setStatus("loading");
            setVisible(!visible);
          }}
        >
          {visible ? "Hide 3D" : "Show 3D"}
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => void functions.current?.download()}
        >
          Download 3D asset
        </button>
      </div>
      {downloadStatus && <p role="status">{downloadStatus}</p>}
    </figure>
  );
}
