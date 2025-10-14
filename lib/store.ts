import { create } from "zustand";

export interface Track {
  id: string;
  type: "video" | "audio" | "text" | "overlay";
  order: number;
  locked: boolean;
  visible: boolean;
  clips: Clip[];
}

export interface Clip {
  id: string;
  trackId: string;
  assetId?: string;
  startTime: number;
  endTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
  };
  effects?: any[];
}

export interface Asset {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "text";
  url: string;
  thumbnail?: string;
  duration?: number;
  size?: number;
  metadata?: any;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
}

interface EditorState {
  // Project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Timeline
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;

  // Clips
  selectedClipId: string | null;
  setSelectedClipId: (clipId: string | null) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;

  // Playback
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;

  // Assets
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Project
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  // Timeline
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  removeTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
    })),
  updateTrack: (trackId, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
    })),

  // Clips
  selectedClipId: null,
  setSelectedClipId: (clipId) => set({ selectedClipId: clipId }),
  addClip: (trackId, clip) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
      ),
    })),
  removeClip: (clipId) =>
    set((state) => ({
      tracks: state.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== clipId),
      })),
    })),
  updateClip: (clipId, updates) =>
    set((state) => ({
      tracks: state.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      })),
    })),

  // Playback
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),

  // Assets
  assets: [],
  setAssets: (assets) => set({ assets }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (assetId) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== assetId),
    })),
}));

interface ChatState {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  addMessage: (message: { role: "user" | "assistant"; content: string }) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
