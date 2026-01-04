export interface PostProcessingSettings {
  readonly bloomEnabled: boolean;
  readonly bloomIntensity: number;
  readonly bloomThreshold: number;
  readonly bloomSmoothing: number;
  readonly vignetteEnabled: boolean;
  readonly vignetteOffset: number;
  readonly vignetteDarkness: number;
}

export interface ViewerSettings {
  readonly postProcessing: PostProcessingSettings;
  readonly performanceOverlayEnabled: boolean;
}

export const DEFAULT_POST_PROCESSING: PostProcessingSettings = {
  bloomEnabled: true,
  bloomIntensity: 0.6,
  bloomThreshold: 0.1,
  bloomSmoothing: 0.6,
  vignetteEnabled: true,
  vignetteOffset: 0.18,
  vignetteDarkness: 0.7,
};

export const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  postProcessing: DEFAULT_POST_PROCESSING,
  performanceOverlayEnabled: false,
};
