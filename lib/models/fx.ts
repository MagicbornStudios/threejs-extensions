import { AssetIdentifier, FxSystemIdentifier } from './identifiers';
import { AttachmentBinding } from './attachments';

export interface FxPassDescriptor {
  readonly id: FxSystemIdentifier;
  readonly label: string;
  readonly enabled: boolean;
  readonly intensity?: number;
  readonly attachments?: readonly AttachmentBinding[];
}

export interface FxSystem {
  readonly systemId: FxSystemIdentifier;
  readonly passes: readonly FxPassDescriptor[];
  readonly requiredAssets?: readonly AssetIdentifier[];
}
