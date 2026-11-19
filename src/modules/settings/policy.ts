/**
 * Safety policy (pure). The assistant never opens banking / payment / wallet
 * apps and has no tool that moves money. This is a deny-list for app names and
 * package ids; it is checked before any launch, in addition to the AI prompt.
 */
const BLOCKED: RegExp[] = [
  /bank/i,
  /wallet/i,
  /paypal|payment|gpay|googlepay|google pay|phonepe|paytm|venmo|zelle|cashapp|cash app/i,
  /easypaisa|easy paisa|jazzcash|jazz cash|sadapay|nayapay|upaisa/i,
  /western\s?union|moneygram|binance|coinbase|crypto/i,
  /بینک|بنك|مصرف|والیٹ|محفظة|ایزی پیسہ|جاز کیش/,
];

export function isBlockedTarget(text: string): boolean {
  return BLOCKED.some((re) => re.test(text));
}
