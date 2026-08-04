export type CollectRow = { type: string; description: string; plans: string; retention: string };

export const collectRows: CollectRow[] = [
  { type: "Application usage", description: "Application name, executable path, process ID, active time", plans: "All", retention: "12 months" },
  { type: "Window titles", description: "Active window title text", plans: "All", retention: "12 months" },
  { type: "URL visits", description: "Browser domain (default) or full path (opt-in)", plans: "All", retention: "12 months" },
  { type: "Activity state", description: "ACTIVE, PASSIVE, IDLE, PRIVATE_TIME transitions", plans: "All", retention: "12 months" },
  { type: "Productivity scores", description: "Daily score (0–100 or null), confidence indicator, breakdown", plans: "All", retention: "12 months" },
  { type: "Private Time sessions", description: "Start time, end time, duration, reason", plans: "All", retention: "12 months" },
  { type: "Screenshots", description: "Periodic JPEG captures (compressed, redacted, encrypted)", plans: "Growth + Enterprise", retention: "90 days" },
  { type: "USB events", description: "Device connection/disconnection events (identifiers only)", plans: "All", retention: "12 months" },
  { type: "File events", description: "File creation/rename/deletion (path only, not contents)", plans: "All", retention: "12 months" },
  { type: "Audit log", description: "All access to monitoring data, policy changes, role changes", plans: "All", retention: "24 months" },
  { type: "Dispute records", description: "Dispute submission, resolution, score correction history", plans: "All", retention: "24 months" },
];

export type NeverRow = { name: string; description: string };

export const neverRows: NeverRow[] = [
  { name: "Keystrokes", description: "Never logs keystrokes, key counts, or any keyboard input content" },
  { name: "Audio", description: "No microphone access — no audio recorded or transmitted" },
  { name: "Video", description: "No webcam access — no video recorded or transmitted" },
  { name: "Continuous screen recording", description: "Periodic screenshots only, never continuous recording" },
  { name: "Network traffic", description: "Does not inspect, capture, or log network traffic content" },
  { name: "Email content", description: "Does not access, capture, or analyze email content" },
  { name: "File contents", description: "File operation tracking logs paths only, not contents" },
  { name: "Biometric data", description: "No fingerprint, facial recognition, or biometric identifiers" },
  { name: "Location data", description: "No GPS, IP geolocation, or physical location data" },
  { name: "Social media activity", description: "Does not access or monitor social media accounts or activity" },
];

export type Framework = { name: string; region: string; points: string[] };

export const frameworks: Framework[] = [
  {
    name: "GDPR",
    region: "European Union",
    points: [
      "Lawful basis for processing: legitimate interest and consent, documented by the organization",
      "Automated DSAR workflow (Article 15) with encrypted export delivered within 30 days",
      "DPIA documentation and system controls for systematic monitoring (Article 35)",
      "Configurable retention with automated deletion (Article 17, Right to Erasure)",
      "Standard DPA reflecting the EU Standard Contractual Clauses (2021)",
      "Digital policy acknowledgment with consent withdrawal processed per policy",
    ],
  },
  {
    name: "EU AI Act",
    region: "European Union",
    points: [
      "No prohibited practices: no emotion recognition (Article 5), biometric categorization, social scoring, or profiling-based risk assessment",
      "Productivity scoring methodology published and visible to every employee",
      "No single accuracy-percentage claim anywhere in the product",
      "Scores are advisory; screenshot viewing requires explicit manager request",
      "Documentation for AI Act conformity assessment of high-risk employee-evaluation systems",
    ],
  },
  {
    name: "Connecticut",
    region: "US State",
    points: [
      "CGS § 31-48d — policy acknowledgment workflow supports prior written notice of electronic monitoring",
      "Jurisdiction-aware notice engine presents the Connecticut-specific template",
    ],
  },
  {
    name: "New York",
    region: "US State",
    points: [
      "NY Lab. Law § 52-c — written notice at time of hire and annually thereafter",
      "Acknowledgment tracking and compliance reports per employee",
    ],
  },
  {
    name: "Delaware",
    region: "US State",
    points: [
      "DE Title 19 § 705 — notice of electronic monitoring policies",
    ],
  },
  {
    name: "Colorado",
    region: "US State",
    points: [
      "CO Rev. Stat. § 8-2-127 — notice and consent for electronic monitoring",
    ],
  },
];

export type EncRow = { layer: string; standard: string; details: string };

export const encRows: EncRow[] = [
  { layer: "Data in transit", standard: "TLS 1.3", details: "All API communication, heartbeat data, and web portal traffic" },
  { layer: "Data at rest (database)", standard: "AES-256", details: "All activity events, scores, configuration, and user data" },
  { layer: "Data at rest (screenshots)", standard: "SSE-S3 or equivalent AES-256", details: "Per-file encryption keys stored separately from screenshot data" },
  { layer: "Agent offline cache", standard: "AES-256 (SQLCipher)", details: "Device-specific key derived from enrollment token, never transmitted" },
  { layer: "OAuth tokens", standard: "AES-256", details: "Calendar integration tokens encrypted at rest per employee record" },
];

export const keyMgmt: string[] = [
  "Database encryption keys managed through the cloud provider's key management service",
  "Screenshot encryption keys generated per file, stored separately from the screenshot data",
  "Agent cache keys derived from the device enrollment token and a per-device salt in the OS keychain or credential manager",
  "API keys hashed before storage using bcrypt",
  "No encryption keys hardcoded in the Agent binary or in any repository code",
];

export const accessControls: string[] = [
  "Role-based access control: employee, manager, admin, and compliance officer roles",
  "Row-level security (RLS) scoping every database query to the requesting user's organization and role",
  "Session JWTs: 24-hour tokens with refresh, signed using RS256 or EdDSA",
  "Device JWTs: 90-day tokens for Agent authentication, refreshed on re-enrollment",
  "API key authentication via bearer tokens, generated and revoked from the organization settings page",
];

export type RetRow = { type: string; retention: string; configurable: boolean };

export const retRows: RetRow[] = [
  { type: "Activity events", retention: "12 months", configurable: true },
  { type: "Screenshots (metadata + files)", retention: "90 days", configurable: true },
  { type: "Productivity scores", retention: "12 months", configurable: true },
  { type: "Audit log entries", retention: "24 months", configurable: true },
  { type: "Dispute records", retention: "24 months", configurable: true },
  { type: "DSAR records", retention: "24 months", configurable: true },
  { type: "Private Time sessions", retention: "12 months", configurable: true },
];

export const deletion: string[] = [
  "Automated deletion is enforced at the organization level with no grace period",
  "On cancellation, all data is retained for 30 days (grace period for reactivation) and then permanently deleted",
];

export const portability: string[] = [
  "Employees can export personal data at any time through the DSAR workflow in the employee dashboard",
  "Exports include activity events, screenshot metadata (with signed access URLs), scores, disputes, and Private Time session records in machine-readable format",
];

export const disclosureDocs: string[] = [
  "Data Processing Agreement (DPA) — EU Standard Contractual Clauses (2021)",
  "Records of Processing Activities (ROPA)",
  "Data Protection Impact Assessment (DPIA) framework",
  "Subprocessor list",
  "SOC 2 Type II report (when available — currently in audit)",
];
