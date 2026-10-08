"use client";
import { useEffect, useRef, useState } from "react";
import type { SetupSource } from "@/lib/chromatography-cases";
import type { ChromaBoard } from "@/lib/chromatography-domain";
import { chromatographyApparatusState } from "@/lib/chromatography-asset";
export function ChromaScene3D({
  source,
  board,
  onUnavailable,
}: {
  source: SetupSource;
  board: ChromaBoard;
  onUnavailable?: (failed: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    pose = useRef({ yaw: 0.22, pitch: 0.1, zoom: 1 }),
    api = useRef<{
      rotate: (n: number) => void;
      zoom: (n: number) => void;
      reset: () => void;
      download: () => Promise<void>;
    } | null>(null);
  const [ready, setReady] = useState(""),
    [failed, setFailed] = useState(false),
    [message, setMessage] = useState(""),
    key = JSON.stringify({ source, board });
  useEffect(() => {
    let cancelled = false,
      clean = () => {};
    api.current = null;
    async function init() {
      try {
        const T = await import("three"),
          { buildChromatographyApparatus, disposeChromatographyApparatus } =
            await import("@/lib/chromatography-asset");
        if (cancelled || !host.current) return;
        const el = host.current,
          renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0xf5f0e8, 1);
        const snapshot = JSON.parse(key) as {
            source: SetupSource;
            board: ChromaBoard;
          },
          root = buildChromatographyApparatus(snapshot.source, snapshot.board),
          scene = new T.Scene(),
          camera = new T.PerspectiveCamera(34, 1, 0.002, 3),
          box = new T.Box3().setFromObject(root),
          center = box.getCenter(new T.Vector3()),
          radius = box.getBoundingSphere(new T.Sphere()).radius;
        scene.add(root, new T.HemisphereLight(0xffffff, 0x66758b, 2.2));
        const light = new T.DirectionalLight(0xffffff, 2.4);
        light.position.set(0.15, 0.25, 0.2);
        scene.add(light);
        const fill = new T.DirectionalLight(0xffe7c3, 1.1);
        fill.position.set(-0.2, 0.1, -0.1);
        scene.add(fill);
        el.appendChild(renderer.domElement);
        renderer.domElement.style.touchAction = "none";
        function render() {
          if (cancelled) return;
          const w = el.clientWidth,
            h = el.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          const vfov = (camera.fov * Math.PI) / 180,
            hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect),
            distance =
              (radius / Math.sin(Math.min(vfov, hfov) / 2)) *
              1.08 *
              pose.current.zoom;
          camera.position.set(
            center.x +
              Math.sin(pose.current.yaw) *
                Math.cos(pose.current.pitch) *
                distance,
            center.y + Math.sin(pose.current.pitch) * distance,
            center.z +
              Math.cos(pose.current.yaw) *
                Math.cos(pose.current.pitch) *
                distance,
          );
          camera.lookAt(center);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
          el.dataset.yaw = String(pose.current.yaw);
          el.dataset.zoom = String(pose.current.zoom);
        }
        const observer = new ResizeObserver(render);
        observer.observe(el);
        let drag: { x: number; y: number } | null = null;
        const down = (e: PointerEvent) => {
            if (e.button !== 0) return;
            drag = { x: e.clientX, y: e.clientY };
            renderer.domElement.setPointerCapture(e.pointerId);
          },
          move = (e: PointerEvent) => {
            if (!drag) return;
            pose.current.yaw += (e.clientX - drag.x) * 0.012;
            pose.current.pitch = Math.max(
              -0.45,
              Math.min(0.6, pose.current.pitch + (e.clientY - drag.y) * 0.008),
            );
            drag = { x: e.clientX, y: e.clientY };
            render();
          },
          up = () => {
            drag = null;
          };
        renderer.domElement.addEventListener("pointerdown", down);
        renderer.domElement.addEventListener("pointermove", move);
        renderer.domElement.addEventListener("pointerup", up);
        renderer.domElement.addEventListener("pointercancel", up);
        renderer.domElement.addEventListener("lostpointercapture", up);
        let cleaned = false;
        clean = () => {
          if (cleaned) return;
          cleaned = true;
          observer.disconnect();
          renderer.domElement.removeEventListener("pointerdown", down);
          renderer.domElement.removeEventListener("pointermove", move);
          renderer.domElement.removeEventListener("pointerup", up);
          renderer.domElement.removeEventListener("pointercancel", up);
          renderer.domElement.removeEventListener("lostpointercapture", up);
          renderer.domElement.remove();
          disposeChromatographyApparatus(root);
          renderer.dispose();
        };
        api.current = {
          rotate: (n) => {
            pose.current.yaw += n;
            render();
          },
          zoom: (n) => {
            pose.current.zoom = Math.max(
              0.55,
              Math.min(1.7, pose.current.zoom * n),
            );
            render();
          },
          reset: () => {
            pose.current = { yaw: 0.22, pitch: 0.1, zoom: 1 };
            render();
          },
          download: async () => {
            const { GLTFExporter } =
              await import("three/addons/exporters/GLTFExporter.js");
            if (cancelled) return;
            const binary = await new GLTFExporter().parseAsync(root, {
              binary: true,
            });
            if (cancelled || !(binary instanceof ArrayBuffer)) return;
            const url = URL.createObjectURL(
                new Blob([binary], { type: "model/gltf-binary" }),
              ),
              a = document.createElement("a");
            a.href = url;
            a.download =
              "chromatography-" + snapshot.source.id + "-current-apparatus.glb";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage(
              "The current apparatus and your retained proposal were downloaded.",
            );
          },
        };
        render();
        setFailed(false);
        onUnavailable?.(false);
        setReady(key);
        setMessage("");
      } catch {
        clean();
        api.current = null;
        if (!cancelled) {
          setFailed(true);
          onUnavailable?.(true);
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
      api.current = null;
      clean();
    };
  }, [key, onUnavailable]);
  const state = chromatographyApparatusState(source, board),
    disabled = failed || ready !== key;
  return (
    <section className="chroma-scene">
      <h4>Inspect the actual apparatus in 3D</h4>
      <div
        ref={host}
        hidden={failed}
        className="chroma-canvas"
        role="img"
        tabIndex={0}
        aria-label="Three-dimensional beaker with supported paper, fixed sample origin and retained solvent proposal. Left and right arrows rotate; plus and minus zoom."
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            api.current?.rotate(e.key === "ArrowLeft" ? -0.25 : 0.25);
          } else if (e.key === "+" || e.key === "=") {
            e.preventDefault();
            api.current?.zoom(0.85);
          } else if (e.key === "-") {
            e.preventDefault();
            api.current?.zoom(1.15);
          }
        }}
      />
      {failed ? (
        <p role="status">
          3D is unavailable. The original data, proposal fields and calibrated
          2D apparatus remain usable below.
        </p>
      ) : (
        <p>
          Drag to turn the beaker; use the buttons or keyboard to inspect sample
          contact. The paper and origin stay fixed.{" "}
          {state.level === source.suppliedLevel
            ? "Your purple proposal coincides with the original reservoir boundary."
            : "Blue outlines show the original reservoir boundary; purple shows your proposed level."}{" "}
          These colours label the views—water is colourless.
        </p>
      )}
      <div className="chroma-scene-ledger">
        <p>
          <strong>Your solvent proposal:</strong>{" "}
          {state.level === null
            ? board.solventLevel
              ? `unfinished or nonnumeric “${board.solventLevel}”`
              : "not chosen"
            : `${state.level} mm above the base`}
          .
        </p>
        <p>
          <strong>Your line-material proposal:</strong>{" "}
          {state.lineMaterial ?? "not chosen"}.
        </p>
      </div>
      {state.level !== null && !state.drawable && (
        <p className="chroma-off-scale">
          Your level is outside this beaker’s displayed 0–{state.beakerHeight}{" "}
          mm range. Its exact raw entry is retained. No replacement liquid level
          is drawn.
        </p>
      )}
      <div className="chroma-model-actions">
        <button disabled={disabled} onClick={() => api.current?.rotate(-0.25)}>
          Rotate left
        </button>
        <button disabled={disabled} onClick={() => api.current?.rotate(0.25)}>
          Rotate right
        </button>
        <button disabled={disabled} onClick={() => api.current?.zoom(0.85)}>
          Zoom in
        </button>
        <button disabled={disabled} onClick={() => api.current?.zoom(1.15)}>
          Zoom out
        </button>
        <button disabled={disabled} onClick={() => api.current?.reset()}>
          Reset view
        </button>
        <button
          disabled={disabled}
          onClick={() =>
            void api.current
              ?.download()
              .catch(() =>
                setMessage(
                  "The asset could not be downloaded. Your proposal remains saved.",
                ),
              )
          }
        >
          Download 3D asset
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      <p>
        Macro apparatus with source heights preserved. The enlarged sample mark
        locates the supplied origin; its size does not represent ink volume.
        Compare the liquid with the marked origin height. This view does not
        generate measured Rf values. Unchosen proposal fields remain unknown.
      </p>
    </section>
  );
}
