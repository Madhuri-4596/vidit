"use client";

import { useRef, useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

const TRACK_HEIGHT = 60;
const TIMELINE_HEADER_HEIGHT = 40;
const SECONDS_WIDTH = 100; // pixels per second at zoom = 1

export function SimpleTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const {
    tracks,
    addTrack,
    addClip,
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

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = clickX / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
  };

  const handleDrop = (e: React.DragEvent, trackId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    console.log('Drop event triggered on timeline');

    const assetData = e.dataTransfer.getData("asset");
    if (!assetData) {
      console.warn('No asset data in drag event');
      return;
    }

    console.log('Asset data received:', assetData);

    try {
      const asset = JSON.parse(assetData);
      console.log('Parsed asset:', asset);

      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropTime = Math.max(0, dropX / pixelsPerSecond);

      console.log('Drop position:', { dropX, dropTime, pixelsPerSecond });

      // If no track specified or track doesn't exist, create a new track
      let targetTrackId = trackId;
      if (!targetTrackId || !tracks.find((t) => t.id === targetTrackId)) {
        const newTrack = {
          id: crypto.randomUUID(),
          type: asset.type as "video" | "audio" | "text" | "overlay",
          order: tracks.length,
          locked: false,
          visible: true,
          clips: [],
        };
        console.log('Creating new track:', newTrack);
        addTrack(newTrack);
        targetTrackId = newTrack.id;
      }

      // Create clip from asset
      const clipDuration = asset.duration || 5; // Default 5 seconds if no duration
      const clip = {
        id: crypto.randomUUID(),
        trackId: targetTrackId,
        assetId: asset.id,
        startTime: dropTime,
        endTime: dropTime + clipDuration,
        duration: clipDuration,
        trimStart: 0,
        trimEnd: 0,
        asset: asset, // Store asset reference for rendering
      };

      console.log('Creating clip:', clip);
      addClip(targetTrackId, clip);
      console.log('Clip added successfully. Current tracks:', tracks.length + 1);
    } catch (err) {
      console.error('Error in handleDrop:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  // Generate time markers
  const timeMarkers = [];
  const markerInterval = zoom > 2 ? 1 : zoom > 1 ? 2 : zoom > 0.5 ? 5 : 10;
  for (let i = 0; i <= duration; i += markerInterval) {
    timeMarkers.push(i);
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-950 overflow-auto relative"
    >
      {/* Timeline Header */}
      <div
        className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800"
        style={{ height: TIMELINE_HEADER_HEIGHT, width: totalWidth }}
      >
        {/* Time Markers */}
        {timeMarkers.map((time) => (
          <div
            key={time}
            className="absolute flex flex-col items-center"
            style={{ left: time * pixelsPerSecond }}
          >
            <div className="text-xs text-gray-400 px-1">
              {formatDuration(time)}
            </div>
            <div className="w-px h-2 bg-gray-600" />
          </div>
        ))}

        {/* Playhead in Header */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-20"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="w-3 h-3 bg-purple-500 rounded-sm absolute -left-1 top-0" />
        </div>
      </div>

      {/* Tracks Container */}
      <div
        className={`relative transition-all ${
          isDraggingOver ? "bg-purple-900/20 ring-2 ring-purple-500/50" : ""
        }`}
        onClick={handleTimelineClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ width: totalWidth, minHeight: tracks.length > 0 ? "auto" : "200px" }}
      >
        {/* Drop zone hint */}
        {isDraggingOver && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold">
              📍 Drop here to add to timeline
            </div>
          </div>
        )}
        {/* Vertical grid lines */}
        {timeMarkers.map((time) => (
          <div
            key={`grid-${time}`}
            className="absolute top-0 bottom-0 w-px border-l border-dashed border-gray-800"
            style={{ left: time * pixelsPerSecond }}
          />
        ))}

        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-10 pointer-events-none"
          style={{ left: currentTime * pixelsPerSecond }}
        />

        {/* Tracks */}
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
            <p className="text-lg">📹 Drop media here to start editing</p>
            <p className="text-sm text-gray-600">Drag videos, images, or audio from the Media Library</p>
          </div>
        ) : (
          tracks.map((track, trackIndex) => {
            const yPosition = trackIndex * TRACK_HEIGHT;

            return (
              <div
                key={track.id}
                className="relative border-b border-gray-800"
                style={{ height: TRACK_HEIGHT }}
              >
                {/* Track Background */}
                <div
                  className={`absolute inset-0 ${
                    trackIndex % 2 === 0 ? "bg-gray-900" : "bg-gray-950"
                  }`}
                />

                {/* Track Label */}
                <div className="absolute left-2 top-2 text-xs text-gray-400 font-medium z-5">
                  Track {trackIndex + 1} - {track.type}
                </div>

                {/* Track Clips */}
                {track.clips.map((clip) => {
                  const clipX = clip.startTime * pixelsPerSecond;
                  const clipWidth = clip.duration * pixelsPerSecond;
                  const isSelected = clip.id === selectedClipId;

                  return (
                    <div
                      key={clip.id}
                      className={`absolute top-1 rounded cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-white" : ""
                      } ${
                        track.type === "video"
                          ? "bg-blue-600 hover:bg-blue-500"
                          : track.type === "audio"
                          ? "bg-green-600 hover:bg-green-500"
                          : track.type === "text"
                          ? "bg-yellow-600 hover:bg-yellow-500"
                          : "bg-purple-600 hover:bg-purple-500"
                      }`}
                      style={{
                        left: clipX,
                        width: clipWidth,
                        height: TRACK_HEIGHT - 8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                    >
                      <div className="px-2 py-1 text-xs text-white truncate">
                        {(clip as any).asset?.name || `Clip ${clip.id.slice(0, 6)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Time Display */}
      <div className="absolute top-2 right-4 bg-gray-900 px-3 py-1 rounded text-sm font-mono text-white z-20">
        {formatDuration(currentTime)}
      </div>
    </div>
  );
}
