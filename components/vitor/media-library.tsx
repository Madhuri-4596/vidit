"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { Upload, Video, Music, Image as ImageIcon, Type, Search } from "lucide-react";

export function MediaLibrary() {
  const { assets, addAsset } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "video" | "audio" | "image">("all");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || asset.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // In production, you would upload to S3/R2 here
      const url = URL.createObjectURL(file);

      const type = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : file.type.startsWith("image/")
        ? "image"
        : "video";

      const asset = {
        id: crypto.randomUUID(),
        name: file.name,
        type: type as any,
        url,
        size: file.size,
        thumbnail: type === "image" ? url : undefined,
        duration: undefined, // Would be calculated for video/audio
        metadata: {
          mimeType: file.type,
        },
      };

      addAsset(asset);
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: any) => {
    e.dataTransfer.setData("asset", JSON.stringify(asset));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-3">Media Library</h2>

        {/* Upload Button */}
        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
          <input
            type="file"
            multiple
            accept="video/*,audio/*,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pb-4 border-b border-gray-800">
        {[
          { id: "all", label: "All", icon: null },
          { id: "video", label: "Video", icon: Video },
          { id: "audio", label: "Audio", icon: Music },
          { id: "image", label: "Images", icon: ImageIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Upload className="w-12 h-12 mb-3" />
            <p className="text-sm">No media files yet</p>
            <p className="text-xs mt-1">Upload videos, audio, or images to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                className="bg-gray-800 rounded overflow-hidden cursor-move hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <div className="aspect-video bg-gray-950 flex items-center justify-center">
                  {asset.thumbnail ? (
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-600">
                      {asset.type === "video" && <Video className="w-8 h-8" />}
                      {asset.type === "audio" && <Music className="w-8 h-8" />}
                      {asset.type === "image" && <ImageIcon className="w-8 h-8" />}
                      {asset.type === "text" && <Type className="w-8 h-8" />}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-white truncate">{asset.name}</p>
                  {asset.duration && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {asset.duration.toFixed(1)}s
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
