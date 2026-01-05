import { MATERIAL_PRESETS } from '@/models/materialPresets';
import { DEFAULT_POST_PROCESSING } from '@/models/viewerSettings';

describe('viewer presets', () => {
  it('captures the bloom defaults for regression', () => {
    expect(DEFAULT_POST_PROCESSING).toMatchInlineSnapshot(`
      {
        "bloomEnabled": true,
        "bloomIntensity": 0.6,
        "bloomSmoothing": 0.6,
        "bloomThreshold": 0.1,
        "vignetteDarkness": 0.7,
        "vignetteEnabled": true,
        "vignetteOffset": 0.18,
      }
    `);
  });

  it('tracks the rim preset so material updates remain intentional', () => {
    expect(MATERIAL_PRESETS.rim).toMatchInlineSnapshot(`
      {
        "baseColor": "#e0e7ff",
        "id": "rim",
        "label": "Rim Highlight",
        "metalness": 0.45,
        "roughness": 0.15,
        "sheen": 0.6,
        "sheenColor": "#c4d4ff",
      }
    `);
  });
});
