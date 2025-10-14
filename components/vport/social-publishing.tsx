"use client";

import { useState } from "react";
import {
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Calendar,
  Upload,
  Check,
} from "lucide-react";

const PLATFORMS = [
  { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-red-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-600" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  { id: "tiktok", name: "TikTok", icon: Twitter, color: "bg-black" },
  { id: "x", name: "X (Twitter)", icon: Twitter, color: "bg-gray-900" },
];

export function SocialPublishing() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    const publishData = {
      platforms: selectedPlatforms,
      title,
      description,
      scheduledFor:
        scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : null,
    };

    try {
      const response = await fetch("/api/vport/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishData),
      });

      const data = await response.json();
      console.log("Published:", data);
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Social Publishing</h2>
        <p className="text-sm text-gray-400 mt-1">
          Publish to multiple platforms at once
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Platforms
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);

              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className={`p-2 rounded ${platform.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white flex-1 text-left">
                    {platform.name}
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-purple-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title..."
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Description / Caption
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a caption or description..."
            rows={4}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Scheduling */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Calendar className="w-4 h-4" />
            Schedule Post (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Auto-Generated Captions */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              Auto-Generate Captions
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Automatically generate platform-specific captions using AI
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-800 flex gap-3">
        <button className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
          Save as Draft
        </button>
        <button
          onClick={handlePublish}
          disabled={selectedPlatforms.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          {scheduledDate ? "Schedule" : "Publish Now"}
        </button>
      </div>
    </div>
  );
}
