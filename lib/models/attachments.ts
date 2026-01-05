import { AssetIdentifier, AttachmentSlot } from './identifiers';

export interface AttachmentBinding {
  readonly slot: AttachmentSlot;
  readonly asset: AssetIdentifier;
  readonly description?: string;
}
