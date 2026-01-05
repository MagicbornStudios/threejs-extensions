import { AssetIdentifier, MaterialIdentifier, MaterialProfile } from './identifiers';
import { AttachmentBinding } from './attachments';

export interface MaterialVariant {
  readonly id: MaterialIdentifier;
  readonly label: string;
  readonly profile: MaterialProfile;
  readonly previewAsset?: AssetIdentifier;
  readonly attachments?: readonly AttachmentBinding[];
}
