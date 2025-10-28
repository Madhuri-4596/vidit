"use client";

import { useEditorStore } from "@/lib/store";
import { Scissors, Trash2, Copy, Sparkles } from "lucide-react";
import { useState } from "react";

export function ClipProperties() {
  const { selectedClipId, tracks, updateClip, removeClip, addClip, setSelectedClipId } = useEditorStore();
  const [showEffects, setShowEffects] = useState(false);
  const [showTransitions, setShowTransitions] = useState(false);
  const [showEffectSegments, setShowEffectSegments] = useState(false);
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null);

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

  // Initialize effect segments if not present
  const effectSegments = (selectedClip as any).effectSegments || [];

  // Current simple effects (for backward compatibility)
  const effects = selectedClip.effects || {
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    grayscale: 0,
  };

  // Initialize transitions if not present
  const transition = (selectedClip as any).transition || {
    in: { type: "none", duration: 0.5 },
    out: { type: "none", duration: 0.5 },
  };

  const handleTrimStartChange = (value: number) => {
    const newTrimStart = Math.max(0, Math.min(value, selectedClip.duration - 0.1));
    updateClip(selectedClip.id, { trimStart: newTrimStart });
  };

  const handleTrimEndChange = (value: number) => {
    const newTrimEnd = Math.max(0, Math.min(value, selectedClip.duration - 0.1));
    updateClip(selectedClip.id, { trimEnd: newTrimEnd });
  };

  const handleEffectChange = (effectName: string, value: number) => {
    const newEffects = { ...effects, [effectName]: value };
    updateClip(selectedClip.id, { effects: newEffects });
  };

  const resetEffects = () => {
    updateClip(selectedClip.id, {
      effects: {
        blur: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        sepia: 0,
        grayscale: 0,
      },
    });
  };

  const handleTransitionChange = (direction: "in" | "out", type: string) => {
    const newTransition = {
      ...transition,
      [direction]: { ...transition[direction], type },
    };
    updateClip(selectedClip.id, { transition: newTransition } as any);
  };

  const handleTransitionDurationChange = (direction: "in" | "out", duration: number) => {
    const newTransition = {
      ...transition,
      [direction]: { ...transition[direction], duration },
    };
    updateClip(selectedClip.id, { transition: newTransition } as any);
  };

  const addEffectSegment = () => {
    const newSegment = {
      id: crypto.randomUUID(),
      startTime: 0,
      endTime: selectedClip.duration || 5,
      effects: {
        blur: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        sepia: 0,
        grayscale: 0,
      },
    };
    const newSegments = [...effectSegments, newSegment];
    updateClip(selectedClip.id, { effectSegments: newSegments } as any);
    setEditingSegmentIndex(newSegments.length - 1);
  };

  const updateEffectSegment = (index: number, updates: any) => {
    const newSegments = [...effectSegments];
    newSegments[index] = { ...newSegments[index], ...updates };
    updateClip(selectedClip.id, { effectSegments: newSegments } as any);
  };

  const deleteEffectSegment = (index: number) => {
    const newSegments = effectSegments.filter((_: any, i: number) => i !== index);
    updateClip(selectedClip.id, { effectSegments: newSegments } as any);
    if (editingSegmentIndex === index) {
      setEditingSegmentIndex(null);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedClip.asset?.name || 'this clip'}"?`)) {
      removeClip(selectedClip.id);
    }
  };

  const handleDuplicate = () => {
    // Create a duplicate of the selected clip
    const duplicateClip = {
      ...selectedClip,
      id: crypto.randomUUID(),
      startTime: selectedClip.endTime, // Place right after original
      endTime: selectedClip.endTime + selectedClip.duration,
    };
    addClip(selectedTrack.id, duplicateClip);
    setSelectedClipId(duplicateClip.id);
  };

  const handleSplit = () => {
    const { currentTime } = useEditorStore.getState();

    // Check if playhead is within the selected clip
    if (currentTime <= selectedClip.startTime || currentTime >= selectedClip.endTime) {
      alert("Move the playhead inside the clip to split it!");
      return;
    }

    // Calculate split point relative to clip start
    const splitPoint = currentTime - selectedClip.startTime;

    // Create first half clip
    const firstClip = {
      ...selectedClip,
      id: crypto.randomUUID(),
      endTime: currentTime,
      duration: splitPoint,
      trimEnd: selectedClip.trimEnd + (selectedClip.duration - splitPoint),
    };

    // Create second half clip
    const secondClip = {
      ...selectedClip,
      id: crypto.randomUUID(),
      startTime: currentTime,
      trimStart: selectedClip.trimStart + splitPoint,
    };

    // Remove original and add split clips
    removeClip(selectedClip.id);
    addClip(selectedTrack.id, firstClip);
    addClip(selectedTrack.id, secondClip);

    // Select the first clip
    setSelectedClipId(firstClip.id);
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

      {/* Visual Effects */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => setShowEffects(!showEffects)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Visual Effects</span>
          </div>
          <span className="text-xs">{showEffects ? "▼" : "▶"}</span>
        </button>

        {showEffects && (
          <div className="space-y-3 p-3 bg-gray-800/50 rounded">
            {/* Blur */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Blur: {effects.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={effects.blur}
                onChange={(e) => handleEffectChange("blur", parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Brightness */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Brightness: {effects.brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={effects.brightness}
                onChange={(e) => handleEffectChange("brightness", parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Contrast: {effects.contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={effects.contrast}
                onChange={(e) => handleEffectChange("contrast", parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Saturation */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Saturation: {effects.saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={effects.saturation}
                onChange={(e) => handleEffectChange("saturation", parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Sepia */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Sepia: {effects.sepia}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={effects.sepia}
                onChange={(e) => handleEffectChange("sepia", parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Grayscale */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Grayscale: {effects.grayscale}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={effects.grayscale}
                onChange={(e) => handleEffectChange("grayscale", parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetEffects}
              className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Reset All Effects
            </button>
          </div>
        )}
      </div>

      {/* Effect Timeline (Time-based effects) */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => setShowEffectSegments(!showEffectSegments)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Effect Timeline</span>
          </div>
          <span className="text-xs">{showEffectSegments ? "▼" : "▶"}</span>
        </button>

        {showEffectSegments && (
          <div className="space-y-2 p-3 bg-gray-800/50 rounded">
            <p className="text-xs text-gray-400 mb-2">
              Apply different effects at different times
            </p>

            {/* Add Segment Button */}
            <button
              onClick={addEffectSegment}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              + Add Effect Segment
            </button>

            {/* List of segments */}
            {effectSegments.map((segment: any, index: number) => (
              <div key={segment.id} className="bg-gray-900 p-3 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-400">
                    Segment {index + 1}
                  </span>
                  <button
                    onClick={() => deleteEffectSegment(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Start (s)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedClip.duration}
                      step="0.1"
                      value={segment.startTime}
                      onChange={(e) =>
                        updateEffectSegment(index, {
                          startTime: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 bg-gray-800 text-white text-xs rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      End (s)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedClip.duration}
                      step="0.1"
                      value={segment.endTime}
                      onChange={(e) =>
                        updateEffectSegment(index, {
                          endTime: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 bg-gray-800 text-white text-xs rounded"
                    />
                  </div>
                </div>

                {/* Effects for this segment */}
                <button
                  onClick={() =>
                    setEditingSegmentIndex(
                      editingSegmentIndex === index ? null : index
                    )
                  }
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  {editingSegmentIndex === index ? "Hide" : "Edit"} Effects
                </button>

                {editingSegmentIndex === index && (
                  <div className="space-y-2 pt-2 border-t border-gray-700">
                    {/* Blur */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Blur: {segment.effects.blur}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={segment.effects.blur}
                        onChange={(e) =>
                          updateEffectSegment(index, {
                            effects: {
                              ...segment.effects,
                              blur: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* Brightness */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Brightness: {segment.effects.brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={segment.effects.brightness}
                        onChange={(e) =>
                          updateEffectSegment(index, {
                            effects: {
                              ...segment.effects,
                              brightness: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* Contrast */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Contrast: {segment.effects.contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={segment.effects.contrast}
                        onChange={(e) =>
                          updateEffectSegment(index, {
                            effects: {
                              ...segment.effects,
                              contrast: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Saturation: {segment.effects.saturation}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={segment.effects.saturation}
                        onChange={(e) =>
                          updateEffectSegment(index, {
                            effects: {
                              ...segment.effects,
                              saturation: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* Grayscale */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Grayscale: {segment.effects.grayscale}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={segment.effects.grayscale}
                        onChange={(e) =>
                          updateEffectSegment(index, {
                            effects: {
                              ...segment.effects,
                              grayscale: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transitions */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => setShowTransitions(!showTransitions)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Transitions</span>
          </div>
          <span className="text-xs">{showTransitions ? "▼" : "▶"}</span>
        </button>

        {showTransitions && (
          <div className="space-y-3 p-3 bg-gray-800/50 rounded">
            {/* Fade In */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">Fade In</label>
              <select
                value={transition.in.type}
                onChange={(e) => handleTransitionChange("in", e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded mb-2"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="zoom">Zoom</option>
              </select>
              {transition.in.type !== "none" && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Duration: {transition.in.duration.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={transition.in.duration}
                    onChange={(e) => handleTransitionDurationChange("in", parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              )}
            </div>

            {/* Fade Out */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">Fade Out</label>
              <select
                value={transition.out.type}
                onChange={(e) => handleTransitionChange("out", e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded mb-2"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="zoom">Zoom</option>
              </select>
              {transition.out.type !== "none" && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Duration: {transition.out.duration.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={transition.out.duration}
                    onChange={(e) => handleTransitionDurationChange("out", parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
          onClick={handleDuplicate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate Clip
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
