"use client";

import { useRef, useEffect } from "react";
import { useEditorStore } from "@/lib/store";

export function VideoPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTime, isPlaying, currentProject, tracks } = useEditorStore();

  const width = currentProject?.width || 1920;
  const height = currentProject?.height || 1080;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Render video clips at current time
    tracks.forEach((track) => {
      if (!track.visible) return;

      track.clips.forEach((clip) => {
        if (currentTime >= clip.startTime && currentTime <= clip.endTime) {
          // Calculate the time within the clip
          const clipTime = currentTime - clip.startTime + clip.trimStart;

          // Here you would render the actual video frame
          // For now, we'll just draw a placeholder
          ctx.fillStyle = track.type === "video" ? "#3B82F6" : "#10B981";
          ctx.fillRect(50, 50, 200, 100);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "16px sans-serif";
          ctx.fillText(`${track.type} - ${clip.id.slice(0, 8)}`, 60, 100);
        }
      });
    });
  }, [currentTime, tracks, width, height]);

  // Handle playback
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentAnimationTime: number) => {
      const deltaTime = (currentAnimationTime - lastTime) / 1000;
      lastTime = currentAnimationTime;

      useEditorStore.getState().setCurrentTime(currentTime + deltaTime);

      if (currentTime >= (currentProject?.duration || 60)) {
        useEditorStore.getState().setIsPlaying(false);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentTime, currentProject?.duration]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="relative" style={{ aspectRatio: `${width}/${height}` }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full max-h-full"
          style={{ imageRendering: "crisp-edges" }}
        />

        {/* Overlay for captions, effects, etc. */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Captions and overlays would be rendered here */}
        </div>
      </div>
    </div>
  );
}
