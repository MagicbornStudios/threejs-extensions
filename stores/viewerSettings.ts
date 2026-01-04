import { create } from 'zustand';
import { DEFAULT_POST_PROCESSING, type PostProcessingSettings, type ViewerSettings } from '@/models/viewerSettings';

interface ViewerSettingsState extends ViewerSettings {
  readonly setPostProcessing: (settings: Partial<PostProcessingSettings>) => void;
  readonly setPerformanceOverlayEnabled: (enabled: boolean) => void;
}

export const useViewerSettings = create<ViewerSettingsState>((set) => ({
  postProcessing: DEFAULT_POST_PROCESSING,
  performanceOverlayEnabled: false,
  setPostProcessing: (settings) =>
    set((state) => ({
      postProcessing: {
        ...state.postProcessing,
        ...settings,
      },
    })),
  setPerformanceOverlayEnabled: (enabled) => set(() => ({ performanceOverlayEnabled: enabled })),
}));
