"use client";

import { useEditorStore } from "@/lib/store";
import { Scissors, Trash2, Copy } from "lucide-react";

export function ClipProperties() {
  const { selectedClipId, tracks, updateClip, removeClip } = useEditorStore();

  // Find the selected clip
  let selectedClip: any = null;
  let selectedTrack: any = null;

  for (const track of tracks) {
    const clip = track.clips.find((c: any) => c.id === selectedClipId);
    if (clip) {
      selectedClip = clip;
      selectedTrack = track;
      break;
    }
  }

  if (!selectedClip) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">Select a clip on the timeline to edit it</p>
      </div>
    );
  }

  const handleTrimStartChange = (value: number) => {
    const newTrimStart = Math.max(0, Math.min(value, selectedClip.duration - 0.1));
    updateClip(selectedClip.id, { trimStart: newTrimStart });
  };

  const handleTrimEndChange = (value: number) => {
    const newTrimEnd = Math.max(0, Math.min(value, selectedClip.duration - 0.1));
    updateClip(selectedClip.id, { trimEnd: newTrimEnd });
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedClip.asset?.name || 'this clip'}"?`)) {
      removeClip(selectedClip.id);
    }
  };

  const handleSplit = () => {
    // TODO: Implement split functionality
    alert("Split functionality coming soon!");
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Clip Properties</h3>
        <p className="text-xs text-gray-400 mb-3">
          {selectedClip.asset?.name || "Unnamed clip"}
        </p>
      </div>

      {/* Trim Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Trim Start: {selectedClip.trimStart?.toFixed(2) || 0}s
          </label>
          <input
            type="range"
            min="0"
            max={selectedClip.duration || 5}
            step="0.1"
            value={selectedClip.trimStart || 0}
            onChange={(e) => handleTrimStartChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Trim End: {selectedClip.trimEnd?.toFixed(2) || 0}s
          </label>
          <input
            type="range"
            min="0"
            max={selectedClip.duration || 5}
            step="0.1"
            value={selectedClip.trimEnd || 0}
            onChange={(e) => handleTrimEndChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        <div className="text-xs text-gray-500">
          Effective Duration: {((selectedClip.duration || 5) - (selectedClip.trimStart || 0) - (selectedClip.trimEnd || 0)).toFixed(2)}s
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <button
          onClick={handleSplit}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          <Scissors className="w-4 h-4" />
          Split Clip
        </button>

        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Clip
        </button>
      </div>
    </div>
  );
}
