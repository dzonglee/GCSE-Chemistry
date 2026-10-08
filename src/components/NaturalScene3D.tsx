"use client";
import { useEffect, useRef, useState } from "react";
import type { NaturalBoard } from "../lib/natural";
export function NaturalScene3D({ board }: { board: NaturalBoard }) {
  const host = useRef<HTMLDivElement>(null),
    api = useRef<{
      rotate: (n: number) => void;
      zoom: (n: number) => void;
      reset: () => void;
      download: () => Promise<void>;
    } | null>(null),
    [ready, setReady] = useState(""),
    [failed, setFailed] = useState(false),
    [message, setMessage] = useState("");
  const key = JSON.stringify(board);
  useEffect(() => {
    let cancelled = false,
      clean = () => {};
    api.current = null;
    async function init() {
      try {
        const T = await import("three"),
          { naturalDNAAsset, disposeNaturalAsset } =
            await import("../lib/natural-asset");
        if (cancelled || !host.current) return;
        const el = host.current,
          renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(36, 1, 0.1, 100),
          root = naturalDNAAsset(JSON.parse(key) as NaturalBoard);
        const box = new T.Box3().setFromObject(root),
          center = box.getCenter(new T.Vector3());
        root.position.sub(center);
        const radius = box.getBoundingSphere(new T.Sphere()).radius;
        let zoom = 1;
        camera.position.set(0, 0, 10);
        scene.add(root, new T.HemisphereLight(0xffffff, 0x52607c, 2));
        const light = new T.DirectionalLight(0xffffff, 2);
        light.position.set(4, 5, 6);
        scene.add(light);
        el.appendChild(renderer.domElement);
        function render() {
          if (cancelled) return;
          const w = el.clientWidth,
            h = el.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          const vfov = (camera.fov * Math.PI) / 180,
            hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
          camera.position.z =
            (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.08 * zoom;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        }
        const observer = new ResizeObserver(render);
        observer.observe(el);
        let drag: number | null = null;
        const down = (e: PointerEvent) => {
            drag = e.clientX;
            renderer.domElement.setPointerCapture(e.pointerId);
          },
          move = (e: PointerEvent) => {
            if (drag === null) return;
            root.rotation.y += (e.clientX - drag) * 0.015;
            drag = e.clientX;
            render();
          },
          up = () => {
            drag = null;
          };
        renderer.domElement.addEventListener("pointerdown", down);
        renderer.domElement.addEventListener("pointermove", move);
        renderer.domElement.addEventListener("pointerup", up);
        renderer.domElement.addEventListener("pointercancel", up);
        api.current = {
          rotate: (n) => {
            root.rotation.y += n;
            render();
          },
          zoom: (n) => {
            zoom = Math.max(0.8, Math.min(1.5, zoom * n));
            render();
          },
          reset: () => {
            root.rotation.set(0, 0, 0);
            zoom = 1;
            render();
          },
          download: async () => {
            const { GLTFExporter } =
              await import("three/addons/exporters/GLTFExporter.js");
            if (cancelled) return;
            const result = await new GLTFExporter().parseAsync(root, {
              binary: true,
            });
            if (cancelled || !(result instanceof ArrayBuffer)) return;
            const url = URL.createObjectURL(
                new Blob([result], { type: "model/gltf-binary" }),
              ),
              a = document.createElement("a");
            a.href = url;
            a.download = "natural-polymers-DNA-proposal.glb";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage(
              "Your current nucleotide-level construction downloaded.",
            );
          },
        };
        render();
        setReady(key);
        clean = () => {
          observer.disconnect();
          renderer.domElement.removeEventListener("pointerdown", down);
          renderer.domElement.removeEventListener("pointermove", move);
          renderer.domElement.removeEventListener("pointerup", up);
          renderer.domElement.removeEventListener("pointercancel", up);
          renderer.domElement.remove();
          disposeNaturalAsset(root);
          renderer.dispose();
        };
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void init();
    return () => {
      cancelled = true;
      api.current = null;
      clean();
    };
  }, [key]);
  const disabled = failed || ready !== key;
  return (
    <section className="natural-scene">
      <div
        ref={host}
        className="natural-canvas"
        role="img"
        aria-label="Three-dimensional nucleotide-level DNA proposal. Each bead with its base is one nucleotide, not one atom."
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            api.current?.rotate(e.key === "ArrowLeft" ? -0.3 : 0.3);
          }
        }}
      />
      <p>
        Unit-level schematic: each backbone bead with its base represents one
        nucleotide, not an atom. Grey marks an unspecified base label, not an
        extra nucleotide type. The thin cross-strand marks represent paired-base
        associations, not the covalent links along a polymer strand.
      </p>
      {failed && (
        <p role="status">
          3D is unavailable. The labelled two-dimensional diagram and all
          scientific controls still work.
        </p>
      )}
      <div className="natural-buttons">
        <button disabled={disabled} onClick={() => api.current?.rotate(-0.3)}>
          Rotate left
        </button>
        <button disabled={disabled} onClick={() => api.current?.rotate(0.3)}>
          Rotate right
        </button>
        <button disabled={disabled} onClick={() => api.current?.zoom(0.9)}>
          Zoom in
        </button>
        <button disabled={disabled} onClick={() => api.current?.zoom(1.1)}>
          Zoom out
        </button>
        <button disabled={disabled} onClick={() => api.current?.reset()}>
          Reset view
        </button>
        <button
          disabled={disabled}
          onClick={() => void api.current?.download()}
        >
          Download 3D asset
        </button>
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
