"use client";

import { useState } from "react";
import { VaiaChat } from "@/components/vaia/chat";
import { PlaybackControls } from "@/components/vitor/playback-controls";
import { VideoPreview } from "@/components/vitor/video-preview";
import { MediaLibrary } from "@/components/vitor/media-library";
import { SocialPublishing } from "@/components/vport/social-publishing";
import { TimelineWrapper } from "@/components/vitor/timeline-wrapper";
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

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            VIDIT
          </h1>
          <span className="text-sm text-gray-400">Untitled Project</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors">
            Save
          </button>
          <button className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded transition-colors">
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
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-3">Effects & Filters</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["Blur", "Brightness", "Contrast", "Saturation", "Sepia", "Grayscale"].map(
                        (effect) => (
                          <button
                            key={effect}
                            className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                          >
                            {effect}
                          </button>
                        )
                      )}
                    </div>
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
