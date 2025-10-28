"use client";

import { useState, useEffect } from "react";
import { VaiaChat } from "@/components/vaia/chat";
import { PlaybackControls } from "@/components/vitor/playback-controls";
import { VideoPreview } from "@/components/vitor/video-preview";
import { MediaLibrary } from "@/components/vitor/media-library";
import { SocialPublishing } from "@/components/vport/social-publishing";
import { TimelineWrapper } from "@/components/vitor/timeline-wrapper";
import { ClipProperties } from "@/components/vitor/clip-properties";
import { useEditorStore } from "@/lib/store";
import {
  Sparkles,
  Video,
  Upload,
  Settings,
  Palette,
  Type,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function EditorPage() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftPanel, setLeftPanel] = useState<"media" | "effects" | "vaia">("media");
  const [rightPanel, setRightPanel] = useState<"vaia" | "publish">("vaia");
  const [showDebug, setShowDebug] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const { currentProject, setCurrentProject, tracks, assets } = useEditorStore();

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Listen for track/clip changes
  useEffect(() => {
    if (tracks.length > 0) {
      const totalClips = tracks.reduce((sum, track) => sum + track.clips.length, 0);
      console.log(`📊 Tracks: ${tracks.length}, Total Clips: ${totalClips}`);
    }
  }, [tracks]);

  // Initialize default project if none exists
  useEffect(() => {
    if (!currentProject) {
      setCurrentProject({
        id: crypto.randomUUID(),
        name: "Untitled Project",
        duration: 60,
        fps: 30,
        width: 1920,
        height: 1080,
      });
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce">
          {toast}
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-800 border border-purple-500 rounded-lg p-4 shadow-xl max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-purple-400">Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Hide
            </button>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Assets:</span>
              <span className="text-white font-semibold">{assets.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tracks:</span>
              <span className="text-white font-semibold">{tracks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Clips:</span>
              <span className="text-white font-semibold">
                {tracks.reduce((sum, track) => sum + track.clips.length, 0)}
              </span>
            </div>
            {tracks.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-purple-300 font-semibold mb-1">Tracks:</p>
                {tracks.map((track, i) => (
                  <div key={track.id} className="text-gray-300">
                    {i + 1}. {track.type} ({track.clips.length} clips)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!showDebug && (
        <button
          onClick={() => setShowDebug(true)}
          className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs"
        >
          Show Debug
        </button>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            VIDIT
          </h1>
          <span className="text-sm text-gray-400">{currentProject?.name || "Untitled Project"}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Project saved! (Feature coming soon)")}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            Save
          </button>
          <button
            onClick={async () => {
              if (confirm("Export your video? This will play through your timeline and record it to a video file.")) {
                try {
                  // Get the canvas element from video preview
                  const canvas = document.querySelector('canvas');
                  if (!canvas) {
                    alert("Canvas not found!");
                    return;
                  }

                  // Create media stream from canvas
                  const stream = canvas.captureStream(30); // 30 fps
                  const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 5000000, // 5 Mbps
                  });

                  const chunks: Blob[] = [];
                  mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                      chunks.push(e.data);
                    }
                  };

                  mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${currentProject?.name || 'video'}-${Date.now()}.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("✅ Video exported successfully!");
                  };

                  // Start recording
                  mediaRecorder.start();
                  showToast("🎬 Recording started...");

                  // Play through timeline
                  const originalTime = useEditorStore.getState().currentTime;
                  useEditorStore.getState().setCurrentTime(0);
                  useEditorStore.getState().setIsPlaying(true);

                  // Stop recording when playback ends
                  const duration = currentProject?.duration || 60;
                  const checkInterval = setInterval(() => {
                    const currentTime = useEditorStore.getState().currentTime;
                    if (currentTime >= duration || !useEditorStore.getState().isPlaying) {
                      clearInterval(checkInterval);
                      mediaRecorder.stop();
                      useEditorStore.getState().setIsPlaying(false);
                      useEditorStore.getState().setCurrentTime(originalTime);
                    }
                  }, 100);
                } catch (err) {
                  console.error("Export error:", err);
                  alert("Export failed: " + (err as Error).message);
                }
              }
            }}
            className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            Export
          </button>
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          className={`${
            leftPanelOpen ? "w-80" : "w-12"
          } border-r border-gray-800 transition-all duration-300 flex flex-col`}
        >
          {leftPanelOpen ? (
            <>
              {/* Left Panel Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { id: "media", label: "Media", icon: Video },
                  { id: "effects", label: "Effects", icon: Wand2 },
                  { id: "vaia", label: "Vaia", icon: Sparkles },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setLeftPanel(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                      leftPanel === tab.id
                        ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400"
                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Left Panel Content */}
              <div className="flex-1 overflow-hidden">
                {leftPanel === "media" && <MediaLibrary />}
                {leftPanel === "effects" && (
                  <div className="flex flex-col h-full">
                    <ClipProperties />
                  </div>
                )}
                {leftPanel === "vaia" && <VaiaChat />}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 gap-4">
              <button
                onClick={() => {
                  setLeftPanel("media");
                  setLeftPanelOpen(true);
                }}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Media"
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setLeftPanel("effects");
                  setLeftPanelOpen(true);
                }}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Effects"
              >
                <Wand2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setLeftPanel("vaia");
                  setLeftPanelOpen(true);
                }}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Vaia"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="p-2 border-t border-gray-800 hover:bg-gray-800 transition-colors"
          >
            {leftPanelOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Center Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Preview */}
          <div className="flex-1 overflow-hidden">
            <VideoPreview />
          </div>

          {/* Playback Controls */}
          <PlaybackControls />

          {/* Timeline */}
          <div className="h-80 border-t border-gray-800">
            <TimelineWrapper />
          </div>
        </div>

        {/* Right Panel */}
        <div
          className={`${
            rightPanelOpen ? "w-96" : "w-12"
          } border-l border-gray-800 transition-all duration-300 flex flex-col`}
        >
          {rightPanelOpen ? (
            <>
              {/* Right Panel Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { id: "vaia", label: "Vaia", icon: Sparkles },
                  { id: "publish", label: "Publish", icon: Upload },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRightPanel(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                      rightPanel === tab.id
                        ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400"
                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Panel Content */}
              <div className="flex-1 overflow-hidden">
                {rightPanel === "vaia" && <VaiaChat />}
                {rightPanel === "publish" && <SocialPublishing />}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 gap-4">
              <button
                onClick={() => {
                  setRightPanel("vaia");
                  setRightPanelOpen(true);
                }}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Vaia"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setRightPanel("publish");
                  setRightPanelOpen(true);
                }}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
                title="Publish"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-2 border-t border-gray-800 hover:bg-gray-800 transition-colors"
          >
            {rightPanelOpen ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
