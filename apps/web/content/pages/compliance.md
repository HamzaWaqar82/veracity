---
title: Compliance and Trust
slug: compliance
order: 8
---

# Compliance and Trust Center

Veracity is designed and built with regulatory compliance as a primary architectural requirement — not an afterthought. This page documents our compliance posture, security architecture, data processing practices, and the regulatory frameworks we adhere to. All claims on this page are current as of the published date and reflect the live product, not a roadmap.

---

## Our Compliance Philosophy

Veracity operates in a regulated space. Employee monitoring is subject to an evolving landscape of data protection laws, AI governance frameworks, and electronic monitoring statutes. Our approach is to build compliance into every feature from the start rather than retrofitting controls after the fact. This means:
- Every data collection decision is auditable against a published retention policy
- Every access to monitoring data is logged in a tamper-evident audit trail
- Every organization gets jurisdiction-appropriate policy templates based on their registered location
- Every product claim is limited to what we can demonstrate, not what we aspire to

---

## Regulatory Frameworks

### General Data Protection Regulation (GDPR)

Veracity provides the following GDPR compliance controls:

**Lawful Basis for Processing.** Veracity supports legitimate interest and consent as lawful bases for processing. Organizations are responsible for selecting and documenting their lawful basis. The jurisdiction-aware notice engine presents the appropriate policy template based on the registered jurisdiction.

**Data Subject Access Requests (DSAR).** Veracity provides an automated DSAR workflow (Article 15 of the GDPR). Employees can request a full export of all personal data Veracity has collected about them, including activity events, screenshots (metadata and signed access URLs), scores, disputes, and Private Time session records. The export is delivered as an encrypted package via secure transfer within 30 days.

**Data Protection Impact Assessment (DPIA).** Veracity provides the documentation and system controls necessary for organizations to complete a DPIA under Article 35 of the GDPR, covering the systematic monitoring of employee behavior.

**Data Retention and Erasure.** Veracity supports configurable data retention periods per data type with automated deletion (Article 17, Right to Erasure). On Enterprise plans, retention periods are configurable per data type. On Starter and Growth plans, standard retention periods apply with a maximum of 12 months for activity data and 90 days for screenshots.

**Data Processing Agreement (DPA).** A standard DPA reflecting the EU Standard Contractual Clauses (2021) is available to all customers. Contact privacy@veracity.dev to request a signed DPA.

**Consent Management.** Veracity provides digital policy acknowledgment workflows. Employees can view the current monitoring policy and acknowledge receipt digitally. The acknowledgment record is stored in the audit trail. Consent can be withdrawn at any time (for processing based on consent), and the system processes withdrawal according to the organization's policy.

### EU Artificial Intelligence Act (AI Act)

Veracity is designed with the EU AI Act requirements in mind:

**No Prohibited AI Practices.** Veracity does not use:
- Emotion recognition in the workplace (prohibited under Article 5)
- Biometric categorization of natural persons
- Social scoring or trustworthiness evaluation
- Predictive policing or individual risk assessment based on profiling

These are architectural constraints, not configuration options — they apply at all tiers and in all jurisdictions.

**Transparent AI Systems.** Veracity's productivity scoring methodology is published and visible to every employee (PA-FR-001). The formula, inputs, and edge cases are documented. The system never claims a single "accuracy percentage" anywhere in the product.

**Human Oversight.** All productivity scores are advisory tools, not automated employment decisions. Screenshot viewing requires explicit manager request with no automated flagging or content analysis. Dispute workflows provide human review with a tracked SLA.

**Documentation.** Veracity provides the technical documentation necessary for organizations to complete their AI Act conformity assessment for high-risk AI systems used for employee evaluation, including system description, training data methodology, accuracy metrics, and human oversight controls.

### US State Electronic Monitoring Laws

Veracity provides compliance controls for US state electronic monitoring statutes:

**Connecticut (CGS § 31-48d).** Veracity's policy acknowledgment workflow supports the Connecticut requirement for prior written notice of electronic monitoring. The jurisdiction-aware notice engine presents the Connecticut-specific policy template when the organization is registered in Connecticut.

**New York (NY Lab. Law § 52-c).** Veracity supports the New York requirement for written notice of electronic monitoring at the time of hire and annually thereafter. The system tracks policy acknowledgment and provides compliance reports showing acknowledgment status per employee.

**Delaware (DE Title 19 § 705).** Veracity supports the Delaware requirement for notice of electronic monitoring policies.

**Colorado (CO Rev. Stat. § 8-2-127).** Veracity supports the Colorado requirement for notice and consent for electronic monitoring.

For all US state jurisdictions, Veracity provides the notice templates, acknowledgment tracking, and audit logging necessary to demonstrate compliance.

---

## Data Collection: What We Collect and What We Do Not

### What Veracity Collects

| Data Type | Description | Plans | Retention (Default) |
|-----------|-------------|-------|---------------------|
| Application usage | Application name, executable path, process ID, active time | All | 12 months |
| Window titles | Active window title text | All | 12 months |
| URL visits | Browser domain (default) or full path (opt-in) | All | 12 months |
| Activity state | ACTIVE, PASSIVE, IDLE, PRIVATE_TIME transitions | All | 12 months |
| Productivity scores | Daily score (0–100 or null), confidence indicator, breakdown | All | 12 months |
| Private Time sessions | Start time, end time, duration, reason | All | 12 months |
| Screenshots | Periodic JPEG captures (compressed, redacted, encrypted) | Growth + Enterprise | 90 days |
| USB events | Device connection/disconnection events (identifiers only) | All | 12 months |
| File events | File creation/rename/deletion (path only, not contents) | All | 12 months |
| Audit log | All access to monitoring data, policy changes, role changes | All | 24 months |
| Dispute records | Dispute submission, resolution, score correction history | All | 24 months |

### What Veracity Explicitly Does Not Collect

- **Keystrokes** — Veracity never logs keystrokes, key counts, or any form of keyboard input content. This is a deliberate architectural constraint at every tier, now and in all future versions.
- **Audio** — No microphone access. Veracity does not record or transmit audio.
- **Video** — No webcam access. Veracity does not record or transmit video. Periodic screenshots are not a video stream.
- **Continuous screen recording** — Periodic screenshots only (Growth and Enterprise), never continuous recording.
- **Network traffic** — Veracity does not inspect, capture, or log network traffic content.
- **Email content** — Veracity does not access, capture, or analyze email content.
- **File contents** — File operation tracking logs paths only, not file contents.
- **Biometric data** — Veracity does not collect fingerprint, facial recognition, or any biometric identifiers.
- **Location data** — Veracity does not collect GPS, IP geolocation, or any physical location data.
- **Social media activity** — Veracity does not access or monitor social media accounts or activity.

---

## Security Architecture

### Encryption Standards

| Layer | Standard | Details |
|-------|----------|---------|
| Data in transit | TLS 1.3 | All API communication, heartbeat data, and web portal traffic |
| Data at rest (database) | AES-256 | All activity events, scores, configuration, and user data |
| Data at rest (screenshots) | SSE-S3 or equivalent AES-256 | Per-file encryption keys stored separately from screenshot data |
| Agent offline cache | AES-256 (SQLCipher) | Device-specific key derived from enrollment token, never transmitted |
| OAuth tokens | AES-256 | Calendar integration tokens encrypted at rest per employee record |

### Key Management

- Database encryption keys are managed through the cloud provider's key management service
- Screenshot encryption keys are generated per file and stored separately from the screenshot data
- Agent cache keys are derived from the device enrollment token and a per-device salt stored in the OS keychain or credential manager
- API keys are hashed before storage using bcrypt
- No encryption keys are hardcoded in the Agent binary or in any repository code

### Access Controls

- **Role-based access control**: employee, manager, admin, and compliance officer roles with distinct permission sets
- **Row-level security (RLS)**: all database queries are scoped to the requesting user's organization and role
- **Session JWTs**: 24-hour session tokens with refresh capability, signed using RS256 or EdDSA
- **Device JWTs**: 90-day device tokens for Agent authentication, refreshed on re-enrollment
- **API key authentication**: bearer tokens for REST API access, generated and revoked from the organization settings page

### Audit Trail

Every access to monitoring data is logged in a tamper-evident audit trail that records:
- Who accessed the data (user ID, role, IP address)
- What data was accessed (data type, scope, record IDs)
- When the access occurred (UTC timestamp)
- Whether the access was successful
- The action taken (view, export, modify, delete)

The audit trail is immutable — no record can be modified or deleted after creation. Audit logs are retained for 24 months minimum.

---

## Data Processing and Retention

### Retention Periods

| Data Type | Default Retention | Enterprise Configurable? |
|-----------|------------------|------------------------|
| Activity events | 12 months | Yes |
| Screenshots (metadata + files) | 90 days | Yes |
| Productivity scores | 12 months | Yes |
| Audit log entries | 24 months | Yes |
| Dispute records | 24 months | Yes |
| DSAR records | 24 months | Yes |
| Private Time sessions | 12 months | Yes |

### Deletion

Automated deletion is enforced at the organization level. Data is permanently deleted at the end of the configured retention period with no grace period. When an organization cancels their subscription, all data is retained for 30 days (grace period for reactivation) and then permanently deleted.

### Data Portability

Employees can export their personal data at any time through the DSAR workflow in the employee dashboard. The export includes all activity events, screenshot metadata (with signed access URLs), scores, disputes, and Private Time session records in machine-readable format.

---

## Responsible Disclosure

Veracity operates a responsible disclosure program for security vulnerabilities. To report a security issue, email security@veracity.dev. We commit to acknowledging receipt within 48 hours and providing an initial assessment within 5 business days.

---

## Compliance Documentation

The following documents are available on request by emailing privacy@veracity.dev:
- Data Processing Agreement (DPA) — EU Standard Contractual Clauses (2021)
- Records of Processing Activities (ROPA)
- Data Protection Impact Assessment (DPIA) framework
- Subprocessor list
- SOC 2 Type II report (when available — currently in audit)

See our [About page](/about) for contact information and our [Features page](/features) for product details.
