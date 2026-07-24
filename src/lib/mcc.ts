// Common Merchant Category Codes -> Kova spend categories.
// Reap webhooks include the MCC per transaction (Master Brief 4.3); this is the
// categorization engine referenced there. Falls back to "other" for unmapped codes.
const MCC_TO_CATEGORY: Record<string, string> = {
  "5411": "groceries",
  "5412": "groceries",
  "5541": "fuel",
  "5542": "fuel",
  "5812": "dining",
  "5813": "dining",
  "5814": "dining",
  "4511": "travel",
  "4111": "travel",
  "7011": "travel",
  "4899": "subscriptions",
  "5815": "subscriptions",
  "4900": "utilities",
  "4814": "utilities",
  "8220": "education",
  "8299": "education",
  "5912": "health",
  "5311": "shopping",
  "5691": "shopping",
};

export function mccToCategory(mccCode: string): string {
  return MCC_TO_CATEGORY[mccCode] ?? "other";
}
