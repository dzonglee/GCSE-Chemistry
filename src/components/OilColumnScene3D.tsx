"use client";
import { useEffect, useRef, useState } from "react";
import { oilTraces } from "../lib/crude-oil";
import { traceDisplay } from "../lib/oil-column-asset";
export function OilColumnScene3D({
  record,
  step,
}: {
  record: string;
  step: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    functions = useRef<{
      rotate: (a: number, b: number) => void;
      reset: () => void;
      download: () => Promise<void>;
    } | null>(null),
    angles = useRef({ y: 0.3, x: -0.08 });
  const [visible, setVisible] = useState(true),
    [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
      "loading",
    ),
    [downloadStatus, setDownloadStatus] = useState(""),
    [readyFor, setReadyFor] = useState("");
  useEffect(() => {
    if (!visible) return;
    let cancelled = false,
      dispose = () => {};
    (async () => {
      try {
        const [T, { buildOilColumn }] = await Promise.all([
          import("three"),
          import("../lib/oil-column-asset"),
        ]);
        if (cancelled || !host.current) return;
        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0xf7f9fd, 1);
        renderer.outputColorSpace = T.SRGBColorSpace;
        const node = host.current;
        node.replaceChildren(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "260px";
        const scene = new T.Scene(),
          asset = buildOilColumn({ kind: "trace", record, step }),
          camera = new T.OrthographicCamera(-2.6, 2.6, 2.6, -2.6, 0.1, 100);
        camera.position.set(0, 0, 9);
        camera.lookAt(0, 0, 0);
        asset.rotation.set(angles.current.x, angles.current.y, 0);
        scene.add(asset);
        scene.add(new T.HemisphereLight(0xffffff, 0x55637a, 2));
        const key = new T.DirectionalLight(0xffffff, 2);
        key.position.set(3, 4, 6);
        scene.add(key);
        const render = () => renderer.render(scene, camera),
          resize = () => {
            const width = Math.max(1, node.clientWidth),
              height = 260,
              aspect = width / height;
            camera.left = -2.6 * aspect;
            camera.right = 2.6 * aspect;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            render();
          };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(node);
        functions.current = {
          rotate: (a, b) => {
            angles.current.y += a;
            angles.current.x = Math.max(
              -0.22,
              Math.min(0.22, angles.current.x + b),
            );
            asset.rotation.set(angles.current.x, angles.current.y, 0);
            render();
          },
          reset: () => {
            angles.current = { y: 0.3, x: -0.08 };
            asset.rotation.set(-0.08, 0.3, 0);
            render();
          },
          download: async () => {
            try {
              const { GLTFExporter } =
                await import("three/examples/jsm/exporters/GLTFExporter.js");
              const exported = await new GLTFExporter().parseAsync(asset, {
                binary: true,
              });
              if (!(exported instanceof ArrayBuffer))
                throw Error("Binary export unavailable");
              const url = URL.createObjectURL(
                  new Blob([exported], { type: "model/gltf-binary" }),
                ),
                link = document.createElement("a");
              link.href = url;
              link.download = "fractionating-column.glb";
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 10000);
              setDownloadStatus("3D column asset downloaded.");
            } catch {
              setDownloadStatus(
                "The asset could not be downloaded. The labelled 2D model remains usable.",
              );
            }
          },
        };
        dispose = () => {
          observer.disconnect();
          functions.current = null;
          scene.traverse((o) => {
            if (o instanceof T.Mesh) {
              o.geometry.dispose();
              for (const material of Array.isArray(o.material)
                ? o.material
                : [o.material])
                material.dispose();
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
        if (cancelled) {
          dispose();
          return;
        }
        setReadyFor(record + "/" + step);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          functions.current = null;
          setStatus("unavailable");
        }
      }
    })();
    return () => {
      cancelled = true;
      dispose();
    };
  }, [record, step, visible]);
  const currentStatus =
    status === "ready" && readyFor !== record + "/" + step ? "loading" : status;
  const dragging = useRef<{ x: number; y: number } | null>(null),
    r = oilTraces[record],
    display = traceDisplay(record, step);
  return (
    <figure className="oil-scene">
      {visible && (
        <div
          ref={host}
          className="oil-canvas"
          role="img"
          aria-label={`Rotatable cutaway column for ${r.formula}. ${display.station}. Tracer is a marker, not an atom.`}
          tabIndex={0}
          data-state={currentStatus}
          data-record={record}
          data-step={step}
          style={{ display: status === "unavailable" ? "none" : undefined }}
          onKeyDown={(e) => {
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
              ].includes(e.key)
            ) {
              e.preventDefault();
              if (e.key === "Home") functions.current?.reset();
              else
                functions.current?.rotate(
                  e.key === "ArrowLeft"
                    ? -0.15
                    : e.key === "ArrowRight"
                      ? 0.15
                      : 0,
                  e.key === "ArrowUp"
                    ? -0.05
                    : e.key === "ArrowDown"
                      ? 0.05
                      : 0,
                );
            }
          }}
          onPointerDown={(e) => {
            dragging.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            functions.current?.rotate(
              (e.clientX - dragging.current.x) * 0.008,
              (e.clientY - dragging.current.y) * 0.004,
            );
            dragging.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => (dragging.current = null)}
          onPointerCancel={() => (dragging.current = null)}
        />
      )}
      <figcaption>
        Real 3D cutaway, schematic and not to scale. The coloured tracer marks
        the supplied component; it is not an atom or molecular-size diagram.
        Original tray temperatures and numerical reasoning remain in the
        labelled 2D model.
      </figcaption>
      {status === "unavailable" && (
        <p role="status">
          3D is unavailable. The original temperatures, 2D trace and prediction
          controls remain usable.
        </p>
      )}
      <div className="model-controls">
        <button
          type="button"
          disabled={currentStatus !== "ready" || !visible}
          onClick={() => functions.current?.rotate(-0.2, 0)}
        >
          Rotate left
        </button>
        <button
          type="button"
          disabled={currentStatus !== "ready" || !visible}
          onClick={() => functions.current?.rotate(0.2, 0)}
        >
          Rotate right
        </button>
        <button
          type="button"
          disabled={currentStatus !== "ready" || !visible}
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
          disabled={currentStatus !== "ready" || !visible}
          onClick={() => void functions.current?.download()}
        >
          Download 3D asset
        </button>
      </div>
      {downloadStatus && <p role="status">{downloadStatus}</p>}
    </figure>
  );
}
