
export interface CapsuleFile {
  name: string;
  type: string;
  data: string; // Base64 encoded string
}

export interface Capsule {
  id: string;
  recipientName: string;
  recipientEmail?: string;
  recipientAddress?: string;
  deliveryDate: string; // ISO string
  message: string;
  file?: CapsuleFile;
  coverImageUrl: string;
  isSealed: boolean;
  deliveryMethod: 'digital' | 'physical';
}

export type Plan = 'starter' | 'plus' | 'legacy';