"use client";
import { useEffect, useRef, useState } from "react";
import { gasChoiceLabels, type GasBoard } from "@/lib/gas-tests-domain";
export function GasScene3D({
  board,
  onUnavailable,
}: {
  board: GasBoard;
  onUnavailable?: (failed: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    pose = useRef({ yaw: 0.28, pitch: 0.12, zoom: 1 }),
    api = useRef<{
      rotate: (amount: number) => void;
      zoom: (factor: number) => void;
      reset: () => void;
      download: () => Promise<void>;
    } | null>(null);
  const [ready, setReady] = useState(""),
    [failed, setFailed] = useState(false),
    [message, setMessage] = useState(""),
    key = JSON.stringify(board);
  useEffect(() => {
    let cancelled = false,
      cleanup = () => {};
    api.current = null;
    async function start() {
      try {
        const T = await import("three"),
          asset = await import("@/lib/gas-tests-asset");
        if (cancelled || !host.current) return;
        const element = host.current,
          renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
        cleanup = () => renderer.dispose();
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0xf4f7fc, 1);
        const snapshot = JSON.parse(key) as GasBoard,
          root = asset.makeGasApparatus(snapshot),
          scene = new T.Scene(),
          camera = new T.PerspectiveCamera(34, 1, 0.002, 3),
          box = new T.Box3().setFromObject(root),
          centre = box.getCenter(new T.Vector3()),
          radius = box.getBoundingSphere(new T.Sphere()).radius;
        scene.add(root, new T.HemisphereLight(0xffffff, 0x66758b, 2.2));
        const light = new T.DirectionalLight(0xffffff, 2.4);
        light.position.set(0.15, 0.25, 0.2);
        scene.add(light);
        element.appendChild(renderer.domElement);
        renderer.domElement.style.touchAction = "none";
        function render() {
          if (cancelled) return;
          const width = element.clientWidth,
            height = element.clientHeight;
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          const vfov = (camera.fov * Math.PI) / 180,
            hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect),
            distance =
              (radius / Math.sin(Math.min(vfov, hfov) / 2)) *
              1.08 *
              pose.current.zoom;
          camera.position.set(
            centre.x +
              Math.sin(pose.current.yaw) *
                Math.cos(pose.current.pitch) *
                distance,
            centre.y + Math.sin(pose.current.pitch) * distance,
            centre.z +
              Math.cos(pose.current.yaw) *
                Math.cos(pose.current.pitch) *
                distance,
          );
          camera.lookAt(centre);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
          element.dataset.yaw = String(pose.current.yaw);
          element.dataset.zoom = String(pose.current.zoom);
        }
        const observer = new ResizeObserver(render);
        observer.observe(element);
        let drag: { x: number; y: number } | null = null;
        const down = (event: PointerEvent) => {
            if (event.button !== 0) return;
            drag = { x: event.clientX, y: event.clientY };
            renderer.domElement.setPointerCapture(event.pointerId);
          },
          move = (event: PointerEvent) => {
            if (!drag) return;
            pose.current.yaw += (event.clientX - drag.x) * 0.012;
            pose.current.pitch = Math.max(
              -0.45,
              Math.min(
                0.6,
                pose.current.pitch + (event.clientY - drag.y) * 0.008,
              ),
            );
            drag = { x: event.clientX, y: event.clientY };
            render();
          },
          up = () => {
            drag = null;
          };
        const lost = (event: Event) => {
          event.preventDefault();
          api.current = null;
          if (!cancelled) {
            setFailed(true);
            onUnavailable?.(true);
          }
          cleanup();
        };
        renderer.domElement.addEventListener("pointerdown", down);
        renderer.domElement.addEventListener("pointermove", move);
        renderer.domElement.addEventListener("pointerup", up);
        renderer.domElement.addEventListener("pointercancel", up);
        renderer.domElement.addEventListener("lostpointercapture", up);
        renderer.domElement.addEventListener("webglcontextlost", lost);
        let cleaned = false;
        cleanup = () => {
          if (cleaned) return;
          cleaned = true;
          observer.disconnect();
          renderer.domElement.removeEventListener("pointerdown", down);
          renderer.domElement.removeEventListener("pointermove", move);
          renderer.domElement.removeEventListener("pointerup", up);
          renderer.domElement.removeEventListener("pointercancel", up);
          renderer.domElement.removeEventListener("lostpointercapture", up);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          renderer.domElement.remove();
          asset.disposeGasApparatus(root);
          renderer.dispose();
        };
        api.current = {
          rotate: (amount) => {
            pose.current.yaw += amount;
            render();
          },
          zoom: (factor) => {
            pose.current.zoom = Math.max(
              0.55,
              Math.min(1.7, pose.current.zoom * factor),
            );
            render();
          },
          reset: () => {
            pose.current = { yaw: 0.28, pitch: 0.12, zoom: 1 };
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
              anchor = document.createElement("a");
            anchor.href = url;
            anchor.download =
              "gas-test-" + snapshot.record + "-current-proposal.glb";
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage(
              "Your current apparatus proposal was downloaded. It contains no simulated result.",
            );
          },
        };
        render();
        setFailed(false);
        onUnavailable?.(false);
        setReady(key);
        setMessage("");
      } catch {
        cleanup();
        api.current = null;
        if (!cancelled) {
          setFailed(true);
          onUnavailable?.(true);
        }
      }
    }
    void start();
    return () => {
      cancelled = true;
      api.current = null;
      cleanup();
    };
  }, [key, onUnavailable]);
  const disabled = failed || ready !== key;
  return (
    <section className="gas-scene">
      <h3>Inspect your apparatus in 3D</h3>
      <div
        ref={host}
        hidden={failed}
        className="gas-canvas"
        role="img"
        tabIndex={0}
        aria-label="Three-dimensional test tube and your selected starting material and contact position. Arrow keys rotate; plus and minus zoom."
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            api.current?.rotate(event.key === "ArrowLeft" ? -0.25 : 0.25);
          } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            api.current?.zoom(0.85);
          } else if (event.key === "-") {
            event.preventDefault();
            api.current?.zoom(1.15);
          }
        }}
      />
      {failed ? (
        <p role="status">
          3D is unavailable. Your choices are retained and the 2D apparatus
          remains usable.
        </p>
      ) : (
        <p>
          Drag, use the arrow keys, or use the controls to inspect the position.
          Turning the view leaves your proposal unchanged.
        </p>
      )}
      <p>
        <strong>Selected material: </strong>
        {gasChoiceLabels[board.material] ?? "not chosen"}.{" "}
        <strong>Selected position: </strong>
        {gasChoiceLabels[board.placement] ?? "not chosen"}.
      </p>
      <div className="gas-model-actions">
        <button
          type="button"
          disabled={disabled}
          onClick={() => api.current?.rotate(-0.25)}
        >
          Rotate left
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => api.current?.rotate(0.25)}
        >
          Rotate right
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => api.current?.zoom(0.85)}
        >
          Zoom in
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => api.current?.zoom(1.15)}
        >
          Zoom out
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => api.current?.reset()}
        >
          Reset view
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            void api.current
              ?.download()
              .catch(() =>
                setMessage(
                  "The download failed. Your retained proposal is unchanged.",
                ),
              )
          }
        >
          Download 3D asset
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      <p className="gas-caption">
        Macro apparatus in metres. The splint state and paper dampness are
        starting choices; no experiment result is invented. Unchosen fields
        remain unknown.
      </p>
    </section>
  );
}
