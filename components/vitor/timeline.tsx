"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Group, Line } from "react-konva";
import { useEditorStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

const TRACK_HEIGHT = 60;
const TIMELINE_HEADER_HEIGHT = 40;
const SECONDS_WIDTH = 100; // pixels per second at zoom = 1

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });

  const {
    tracks,
    currentTime,
    setCurrentTime,
    zoom,
    currentProject,
    selectedClipId,
    setSelectedClipId,
  } = useEditorStore();

  const fps = currentProject?.fps || 24;
  const duration = currentProject?.duration || 60;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const pixelsPerSecond = SECONDS_WIDTH * zoom;
  const totalWidth = Math.max(duration * pixelsPerSecond, dimensions.width);

  const handleTimelineClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const clickX = pointerPosition.x;
    const newTime = clickX / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
  };

  const handleClipClick = (clipId: string, e: any) => {
    e.cancelBubble = true;
    setSelectedClipId(clipId);
  };

  // Generate time markers
  const timeMarkers = [];
  const markerInterval = zoom > 2 ? 1 : zoom > 1 ? 2 : zoom > 0.5 ? 5 : 10;
  for (let i = 0; i <= duration; i += markerInterval) {
    timeMarkers.push(i);
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-950 overflow-auto">
      <Stage width={dimensions.width} height={dimensions.height}>
        {/* Timeline Header */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={totalWidth}
            height={TIMELINE_HEADER_HEIGHT}
            fill="#111827"
          />

          {/* Time Markers */}
          {timeMarkers.map((time) => (
            <Group key={time} x={time * pixelsPerSecond} y={0}>
              <Line
                points={[0, TIMELINE_HEADER_HEIGHT - 10, 0, TIMELINE_HEADER_HEIGHT]}
                stroke="#4B5563"
                strokeWidth={1}
              />
              <Line
                points={[0, TIMELINE_HEADER_HEIGHT, 0, dimensions.height]}
                stroke="#1F2937"
                strokeWidth={1}
                dash={[4, 4]}
              />
            </Group>
          ))}

          {/* Playhead */}
          <Line
            points={[
              currentTime * pixelsPerSecond,
              0,
              currentTime * pixelsPerSecond,
              dimensions.height,
            ]}
            stroke="#8B5CF6"
            strokeWidth={2}
          />
          <Rect
            x={currentTime * pixelsPerSecond - 5}
            y={0}
            width={10}
            height={TIMELINE_HEADER_HEIGHT}
            fill="#8B5CF6"
          />
        </Layer>

        {/* Tracks and Clips */}
        <Layer onClick={handleTimelineClick}>
          {tracks.map((track, trackIndex) => {
            const yPosition = TIMELINE_HEADER_HEIGHT + trackIndex * TRACK_HEIGHT;

            return (
              <Group key={track.id}>
                {/* Track Background */}
                <Rect
                  x={0}
                  y={yPosition}
                  width={totalWidth}
                  height={TRACK_HEIGHT}
                  fill={trackIndex % 2 === 0 ? "#1F2937" : "#111827"}
                  stroke="#374151"
                  strokeWidth={1}
                />

                {/* Track Clips */}
                {track.clips.map((clip) => {
                  const clipX = clip.startTime * pixelsPerSecond;
                  const clipWidth = clip.duration * pixelsPerSecond;
                  const isSelected = clip.id === selectedClipId;

                  return (
                    <Group
                      key={clip.id}
                      onClick={(e) => handleClipClick(clip.id, e)}
                      draggable
                    >
                      <Rect
                        x={clipX}
                        y={yPosition + 5}
                        width={clipWidth}
                        height={TRACK_HEIGHT - 10}
                        fill={
                          track.type === "video"
                            ? "#3B82F6"
                            : track.type === "audio"
                            ? "#10B981"
                            : track.type === "text"
                            ? "#F59E0B"
                            : "#8B5CF6"
                        }
                        cornerRadius={4}
                        stroke={isSelected ? "#FFFFFF" : "transparent"}
                        strokeWidth={isSelected ? 2 : 0}
                        shadowColor="black"
                        shadowBlur={4}
                        shadowOpacity={0.3}
                      />
                    </Group>
                  );
                })}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Time Display */}
      <div className="absolute top-2 right-4 bg-gray-900 px-3 py-1 rounded text-sm font-mono text-white">
        {formatDuration(currentTime)}
      </div>
    </div>
  );
}
