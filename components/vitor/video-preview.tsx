"use client";

import { useRef, useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store";

export function VideoPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const { currentTime, isPlaying, currentProject, tracks } = useEditorStore();

  const width = currentProject?.width || 1920;
  const height = currentProject?.height || 1080;

  // Helper function to get or create a video element
  const getVideoElement = (clipId: string, videoUrl: string): HTMLVideoElement => {
    let videoElement = videoElementsRef.current.get(clipId);

    if (!videoElement) {
      videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      // Only set crossOrigin for non-blob URLs
      if (!videoUrl.startsWith('blob:')) {
        videoElement.crossOrigin = 'anonymous';
      }
      videoElement.muted = true;
      videoElement.preload = 'auto';

      // Add error handler
      videoElement.addEventListener('error', (e) => {
        console.error('Video element error:', e, 'URL:', videoUrl);
      });

      videoElementsRef.current.set(clipId, videoElement);
    }

    return videoElement;
  };

  // Helper function to get or create an image element
  const getImageElement = (clipId: string, imageUrl: string): HTMLImageElement => {
    let imageElement = imageElementsRef.current.get(clipId);

    if (!imageElement) {
      imageElement = new Image();
      // Only set crossOrigin for non-blob URLs
      if (!imageUrl.startsWith('blob:')) {
        imageElement.crossOrigin = 'anonymous';
      }
      imageElement.src = imageUrl;

      // Add error handler
      imageElement.addEventListener('error', (e) => {
        console.error('Image element error:', e, 'URL:', imageUrl);
      });

      imageElementsRef.current.set(clipId, imageElement);
    }

    return imageElement;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isCancelled = false;

    const render = async () => {
      if (isCancelled) return;

      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Render video clips at current time - process in reverse order so top tracks render last
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (!track.visible || isCancelled) continue;

        for (const clip of track.clips as any[]) {
          if (isCancelled) break;

          if (currentTime >= clip.startTime && currentTime <= clip.endTime) {

            // Calculate the time within the clip
            const clipTime = currentTime - clip.startTime + (clip.trimStart || 0);

            // Calculate transition opacity and transformations
            const clipTransition = (clip as any).transition;
            let transitionAlpha = 1;
            let transitionTransform = { x: 0, y: 0, scale: 1 };

            if (clipTransition) {
              // Fade in
              if (clipTransition.in && clipTransition.in.type && clipTransition.in.type !== "none") {
                const fadeInDuration = clipTransition.in.duration || 0.5;
                if (clipTime < fadeInDuration) {
                  const progress = Math.max(0, Math.min(1, clipTime / fadeInDuration));

                  if (clipTransition.in.type === "fade") {
                    transitionAlpha = progress;
                  } else if (clipTransition.in.type === "slide-left") {
                    transitionTransform.x = (1 - progress) * width;
                  } else if (clipTransition.in.type === "slide-right") {
                    transitionTransform.x = -(1 - progress) * width;
                  } else if (clipTransition.in.type === "slide-up") {
                    transitionTransform.y = (1 - progress) * height;
                  } else if (clipTransition.in.type === "slide-down") {
                    transitionTransform.y = -(1 - progress) * height;
                  } else if (clipTransition.in.type === "zoom") {
                    // Scale from 0.3 to 1.0 instead of 0 to 1
                    transitionTransform.scale = 0.3 + (progress * 0.7);
                    transitionAlpha = progress;
                  }
                }
              }

              // Fade out
              if (clipTransition.out && clipTransition.out.type && clipTransition.out.type !== "none") {
                const effectiveDuration = clip.duration - (clip.trimStart || 0) - (clip.trimEnd || 0);
                const fadeOutDuration = clipTransition.out.duration || 0.5;
                const timeUntilEnd = effectiveDuration - clipTime;

                if (timeUntilEnd < fadeOutDuration && timeUntilEnd > 0) {
                  const progress = Math.max(0, Math.min(1, timeUntilEnd / fadeOutDuration));

                  if (clipTransition.out.type === "fade") {
                    transitionAlpha = Math.min(transitionAlpha, progress);
                  } else if (clipTransition.out.type === "slide-left") {
                    transitionTransform.x = -(1 - progress) * width;
                  } else if (clipTransition.out.type === "slide-right") {
                    transitionTransform.x = (1 - progress) * width;
                  } else if (clipTransition.out.type === "slide-up") {
                    transitionTransform.y = -(1 - progress) * height;
                  } else if (clipTransition.out.type === "slide-down") {
                    transitionTransform.y = (1 - progress) * height;
                  } else if (clipTransition.out.type === "zoom") {
                    // Scale from 1.0 to 0.3 instead of 1 to 0
                    transitionTransform.scale = 0.3 + (progress * 0.7);
                    transitionAlpha = Math.min(transitionAlpha, progress);
                  }
                }
              }
            }

            // Save canvas state
            ctx.save();

            // Apply transition alpha
            ctx.globalAlpha = transitionAlpha;

            // Apply effects if present
            const clipEffects = clip.effects;
            if (clipEffects) {
              // Build CSS filter string
              const filters = [];
              if (clipEffects.blur > 0) filters.push(`blur(${clipEffects.blur}px)`);
              if (clipEffects.brightness !== 100) filters.push(`brightness(${clipEffects.brightness}%)`);
              if (clipEffects.contrast !== 100) filters.push(`contrast(${clipEffects.contrast}%)`);
              if (clipEffects.saturation !== 100) filters.push(`saturate(${clipEffects.saturation}%)`);
              if (clipEffects.sepia > 0) filters.push(`sepia(${clipEffects.sepia}%)`);
              if (clipEffects.grayscale > 0) filters.push(`grayscale(${clipEffects.grayscale}%)`);

              if (filters.length > 0) {
                const filterString = filters.join(' ');
                ctx.filter = filterString;
                console.log(`🎨 Applying filters: ${filterString}`);
              } else {
                ctx.filter = 'none';
              }
            } else {
              ctx.filter = 'none';
            }

            // Try to render actual media if available
            if (clip.asset) {
              // For images, use cached image element
              if (clip.asset.type === "image" && clip.asset.url) {
                const img = getImageElement(clip.id, clip.asset.url);

                // If image is already loaded, draw it
                if (img.complete && img.naturalWidth > 0) {
                  const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
                  const scaledWidth = img.naturalWidth * scale * transitionTransform.scale;
                  const scaledHeight = img.naturalHeight * scale * transitionTransform.scale;
                  const x = (width - scaledWidth) / 2 + transitionTransform.x;
                  const y = (height - scaledHeight) / 2 + transitionTransform.y;

                  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                } else {
                  // Draw placeholder while loading
                  ctx.fillStyle = "#3B82F6";
                  ctx.fillRect(width/2 - 100, height/2 - 30, 200, 60);
                  ctx.fillStyle = "#FFFFFF";
                  ctx.font = "14px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText("Loading image...", width/2, height/2);
                  ctx.textAlign = "left";
                }
              } else if (clip.asset.type === "video" && clip.asset.url) {
                // For videos, use video element
                const videoElement = getVideoElement(clip.id, clip.asset.url);
                console.log(`🎥 Video clip: ${clip.asset.name}, readyState: ${videoElement.readyState}, currentTime: ${videoElement.currentTime.toFixed(2)}, clipTime: ${clipTime.toFixed(2)}`);

                try {
                  // Set video time to the calculated clip time with better precision
                  if (Math.abs(videoElement.currentTime - clipTime) > 0.033) { // ~1 frame at 30fps
                    console.log(`⏩ Seeking video to ${clipTime.toFixed(2)}s`);
                    videoElement.currentTime = clipTime;

                    // Wait for seek to complete
                    await new Promise<void>((resolve) => {
                      const timeout = setTimeout(() => {
                        console.log('⏱️ Seek timeout');
                        resolve();
                      }, 100);
                      const handleSeeked = () => {
                        clearTimeout(timeout);
                        videoElement.removeEventListener('seeked', handleSeeked);
                        console.log('✅ Seek complete');
                        resolve();
                      };
                      videoElement.addEventListener('seeked', handleSeeked);
                    });
                  }

                  if (isCancelled) continue;

                  // Wait for video to be ready
                  if (videoElement.readyState >= 2) {
                    // Calculate aspect ratio fit
                    const scale = Math.min(width / videoElement.videoWidth, height / videoElement.videoHeight);
                    const scaledWidth = videoElement.videoWidth * scale * transitionTransform.scale;
                    const scaledHeight = videoElement.videoHeight * scale * transitionTransform.scale;
                    const x = (width - scaledWidth) / 2 + transitionTransform.x;
                    const y = (height - scaledHeight) / 2 + transitionTransform.y;

                    console.log(`✏️ Drawing video at (${x.toFixed(0)}, ${y.toFixed(0)}), size: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}`);
                    ctx.drawImage(videoElement, x, y, scaledWidth, scaledHeight);
                    console.log('✅ Video drawn');
                  } else {
                    console.warn(`⏳ Video not ready: readyState=${videoElement.readyState}`);
                    // Show loading state
                    ctx.fillStyle = "#3B82F6";
                    const rectWidth = Math.min(300, width - 100);
                    const rectHeight = 80;
                    const rectX = (width - rectWidth) / 2;
                    const rectY = (height - rectHeight) / 2;

                    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = "16px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("Loading video...", width / 2, height / 2);
                    ctx.textAlign = "left";
                  }
                } catch (err) {
                  console.error('❌ Error rendering video:', err);
                }
              } else {
                // Placeholder for audio
                ctx.fillStyle = track.type === "audio" ? "#10B981" : "#F59E0B";
                const rectWidth = Math.min(250, width - 100);
                const rectHeight = 60;
                const rectX = (width - rectWidth) / 2;
                const rectY = (height - rectHeight) / 2;

                ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

                ctx.fillStyle = "#FFFFFF";
                ctx.font = "16px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(clip.asset.name || `${track.type} clip`, width / 2, height / 2);
                ctx.textAlign = "left";
              }
            } else {
              // Fallback placeholder
              ctx.fillStyle = "#6B7280";
              ctx.fillRect(50, 50, 200, 100);
              ctx.fillStyle = "#FFFFFF";
              ctx.font = "16px sans-serif";
              ctx.fillText("No media", 60, 100);
            }

            // Restore canvas state (effects and alpha)
            ctx.restore();
          }
        }
      }
    };

    render().catch(err => console.error('Render error:', err));

    return () => {
      isCancelled = true;
    };
  }, [currentTime, tracks, width, height]);

  // Cleanup video and image elements that are no longer in use
  useEffect(() => {
    const activeVideoClipIds = new Set<string>();
    const activeImageClipIds = new Set<string>();

    tracks.forEach(track => {
      track.clips.forEach((clip: any) => {
        if (clip.asset?.type === 'video') {
          activeVideoClipIds.add(clip.id);
        } else if (clip.asset?.type === 'image') {
          activeImageClipIds.add(clip.id);
        }
      });
    });

    // Remove video elements for clips that no longer exist
    videoElementsRef.current.forEach((videoElement, clipId) => {
      if (!activeVideoClipIds.has(clipId)) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load(); // Release resources
        videoElementsRef.current.delete(clipId);
      }
    });

    // Remove image elements for clips that no longer exist
    imageElementsRef.current.forEach((imageElement, clipId) => {
      if (!activeImageClipIds.has(clipId)) {
        imageElement.src = '';
        imageElementsRef.current.delete(clipId);
      }
    });
  }, [tracks]);

  // Sync video elements play/pause state with timeline
  useEffect(() => {
    videoElementsRef.current.forEach((videoElement) => {
      if (isPlaying) {
        videoElement.play().catch(() => {
          // Ignore play errors (e.g., if video is not ready)
        });
      } else {
        videoElement.pause();
      }
    });
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      videoElementsRef.current.forEach((videoElement) => {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      });
      videoElementsRef.current.clear();

      imageElementsRef.current.forEach((imageElement) => {
        imageElement.src = '';
      });
      imageElementsRef.current.clear();
    };
  }, []);

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
