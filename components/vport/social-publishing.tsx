"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
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
  const { currentProject, currentTime, setCurrentTime, setIsPlaying } = useEditorStore();
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

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string>("");

  const handlePublish = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your video");
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    setIsPublishing(true);
    setPublishStatus("🎬 Exporting video...");

    try {
      // Step 1: Export the video
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        alert("Canvas not found. Please make sure your video is loaded.");
        setIsPublishing(false);
        return;
      }

      if (!currentProject) {
        alert("No project loaded. Please add some media to your timeline first.");
        setIsPublishing(false);
        return;
      }

      setPublishStatus("🎥 Recording video...");

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

      // Wait for recording to complete
      await new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };

        mediaRecorder.onerror = (e) => {
          reject(e);
        };

        // Start recording
        mediaRecorder.start();

        // Play through timeline
        const originalTime = currentTime;
        setCurrentTime(0);
        setIsPlaying(true);

        // Stop recording when playback ends
        const duration = currentProject.duration || 60;
        const storeInstance = useEditorStore.getState();
        const checkInterval = setInterval(() => {
          const ct = storeInstance.currentTime;
          const playing = storeInstance.isPlaying;

          if (ct >= duration || !playing) {
            clearInterval(checkInterval);
            mediaRecorder.stop();
            setIsPlaying(false);
            setCurrentTime(originalTime);
          }
        }, 100);

        // Safety timeout (max 5 minutes)
        setTimeout(() => {
          clearInterval(checkInterval);
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 300000);
      }).then((videoBlob) => {
        // Step 2: Download the video
        setPublishStatus("💾 Saving video...");
        const url = URL.createObjectURL(videoBlob);
        const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.webm`;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        setPublishStatus("✅ Video downloaded successfully!");

        // Step 3: Show platform-specific instructions
        setTimeout(() => {
          const platformNames = selectedPlatforms.map(id =>
            PLATFORMS.find(p => p.id === id)?.name
          ).join(", ");

          setPublishStatus(
            `✅ Video saved! Now you can upload it to: ${platformNames}\n\n` +
            `📱 The video has been downloaded to your device as "${filename}"\n` +
            `You can now upload it manually to your selected platforms.`
          );

          // Reset form after 10 seconds
          setTimeout(() => {
            setPublishStatus("");
            setIsPublishing(false);
          }, 10000);
        }, 2000);
      });

    } catch (error) {
      console.error("Publish error:", error);
      setPublishStatus(`❌ Error: ${(error as Error).message}`);
      setIsPublishing(false);
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

      {/* Publishing Status */}
      {publishStatus && (
        <div className={`m-4 p-4 rounded-lg ${
          publishStatus.includes("❌") ? "bg-red-500/20 border border-red-500" :
          publishStatus.includes("✅") ? "bg-green-500/20 border border-green-500" :
          "bg-purple-500/20 border border-purple-500"
        }`}>
          <p className="text-sm text-white whitespace-pre-line">{publishStatus}</p>
        </div>
      )}

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
        <button
          disabled={isPublishing}
          className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Save as Draft
        </button>
        <button
          onClick={handlePublish}
          disabled={selectedPlatforms.length === 0 || isPublishing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Upload className={`w-4 h-4 ${isPublishing ? "animate-bounce" : ""}`} />
          {isPublishing ? "Publishing..." : scheduledDate ? "Schedule" : "Publish Now"}
        </button>
      </div>
    </div>
  );
}
