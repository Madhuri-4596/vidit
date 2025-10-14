"use client";

import { useEditorStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export function PlaybackControls() {
  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    zoom,
    setZoom,
    currentProject,
  } = useEditorStore();

  const fps = currentProject?.fps || 24;
  const duration = currentProject?.duration || 60;
  const frameTime = 1 / fps;

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToStart = () => {
    setCurrentTime(0);
  };

  const goToEnd = () => {
    setCurrentTime(duration);
  };

  const previousFrame = () => {
    setCurrentTime(Math.max(0, currentTime - frameTime));
  };

  const nextFrame = () => {
    setCurrentTime(Math.min(duration, currentTime + frameTime));
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.5, 10));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.5, 0.1));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gray-900 border-t border-gray-800">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToStart}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Go to start"
        >
          <SkipBack className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={previousFrame}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Previous frame"
        >
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={togglePlayPause}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          onClick={nextFrame}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Next frame"
        >
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>

        <button
          onClick={goToEnd}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Go to end"
        >
          <SkipForward className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-gray-300">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max={duration}
          step={frameTime}
          value={currentTime}
          onChange={handleTimeChange}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-gray-300" />
        </button>

        <span className="text-sm text-gray-400 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* FPS Display */}
      <div className="text-sm text-gray-400">
        {fps} FPS
      </div>
    </div>
  );
}
