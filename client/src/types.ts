export type Category =
  | "food"
  | "fashion"
  | "electronics"
  | "beauty"
  | "entertainment"
  | "travel"
  | "other";

export type CodeType = "barcode" | "qr";

export type ExpiryStatus = "valid" | "soon" | "expired";

export interface Coupon {
  id: string;
  title: string;
  store: string | null;
  category: Category;
  value: string | null;
  expiry: string | null;
  code: string | null;
  codeType: CodeType | null;
  notes: string | null;
  imagePath: string | null;
  imageIsPdfSourced: boolean;
  thumbnailPath: string | null;
  redeemed: boolean;
  redeemedAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: ExpiryStatus;
}

export interface ExtractedFields {
  title: string;
  store: string | null;
  category: Category;
  value: string | null;
  expiry: string | null;
  code: string | null;
  codeType: CodeType | null;
  notes: string | null;
}

export interface CouponInput {
  title: string;
  store?: string | null;
  category: Category;
  value?: string | null;
  expiry?: string | null;
  code?: string | null;
  codeType?: CodeType | null;
  notes?: string | null;
  imagePath?: string | null;
  imageIsPdfSourced?: boolean;
  thumbnailPath?: string | null;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "מזון",
  fashion: "אופנה",
  electronics: "אלקטרוניקה",
  beauty: "טיפוח ויופי",
  entertainment: "בילויים ופנאי",
  travel: "טיולים",
  other: "אחר",
};

export const STATUS_LABELS: Record<ExpiryStatus, string> = {
  valid: "בתוקף",
  soon: "נגמר בקרוב",
  expired: "פג תוקף",
};
