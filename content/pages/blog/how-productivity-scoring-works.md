---
title: How FSMS Calculates Your Productivity Score
slug: blog/how-productivity-scoring-works
order: 1
---

# How FSMS Calculates Your Productivity Score

*A complete walkthrough of the scoring methodology — the formula, the inputs, the confidence indicators, and why we publish it all.*

---

Every employee and manager who uses FSMS sees a daily productivity score. It appears on the dashboard as a number between 0 and 100, alongside a breakdown of how time was spent and a confidence indicator. Understanding how this score is calculated — what counts, what does not, and why — is essential for using the data effectively.

This article explains the scoring methodology in detail. The same explanation is available inside the product through the "How is this calculated?" expandable section on the employee dashboard.

---

## What the Score Measures

The FSMS productivity score measures the proportion of active work time that an employee spends in productive applications and activities, adjusted for passive-attention states like meetings and reading.

It is not a measure of:
- Hours worked (idle time is excluded, not penalized)
- Output volume (FSMS does not measure output quality or quantity)
- Performance against peers (benchmarking is a separate feature)
- Effort (Private Time is excluded entirely)

The score is designed to answer one specific question: *Of the time an employee spent at their computer engaged with work-related applications, how much was spent on productive activities versus neutral or unproductive ones?*

---

## The Formula

The score is calculated using Methodology v1.0 with the following formula:

```
productivity_score = round(
  (productive_ms + 0.5 * passive_ms) /
  (productive_ms + neutral_ms + unproductive_ms + 0.5 * passive_ms) * 100
)
```

### The Inputs

| Variable | Definition | Example Sources |
|----------|------------|-----------------|
| `productive_ms` | Time in applications classified as Productive | VS Code, Excel, Jira, Slack (if configured), client-facing tools |
| `neutral_ms` | Time in applications classified as Neutral | Email clients, company intranet, internal documentation |
| `unproductive_ms` | Time in applications classified as Unproductive | Social media, news sites, entertainment, personal shopping |
| `passive_ms` | Time in PASSIVE-ATTENTION state | Meetings (detected via calendar), reading documents, training videos |
| `idle_ms` | Time in IDLE state | Away from keyboard beyond the configurable threshold (default: 180 seconds) |
| `private_ms` | Time in Private Time | Employee-initiated capture pause — excluded from all calculations |

### How the Weights Work

- **Productive time (1.0x)** counts fully in both the numerator and denominator. Every minute of productive activity improves the score.
- **Passive-attention time (0.5x)** counts at half weight in both the numerator and denominator. Meetings and reading are valuable but are weighted less than active, hands-on work.
- **Neutral time** counts in the denominator only. It neither helps nor hurts the score — it reflects necessary but not directly productive activity.
- **Unproductive time** counts in the denominator only. It reduces the score because it increases the denominator without increasing the numerator.
- **Idle time** is excluded from the calculation entirely. Taking breaks is not penalized.
- **Private Time** is excluded entirely. What an employee does during Private Time is not tracked and does not affect the score.

### Worked Example

A day with the following breakdown:
- 4 hours (14,400,000 ms) of productive work
- 2 hours (7,200,000 ms) of neutral activity (email, docs)
- 1 hour (3,600,000 ms) of unproductive activity
- 1 hour (3,600,000 ms) of passive-attention (meetings)
- 2 hours of idle time (lunch, breaks — excluded)
- 0 hours of Private Time

**Step 1 — Calculate active time:**
active_ms = 14,400,000 + 7,200,000 + 3,600,000 + 3,600,000 = 28,800,000 ms (8 hours)

**Step 2 — Apply the formula:**
numerator = 14,400,000 + (0.5 × 3,600,000) = 14,400,000 + 1,800,000 = 16,200,000
denominator = 14,400,000 + 7,200,000 + 3,600,000 + (0.5 × 3,600,000) = 14,400,000 + 7,200,000 + 3,600,000 + 1,800,000 = 27,000,000

score = round((16,200,000 / 27,000,000) × 100) = round(60.0) = **60**

This matches the acceptance criterion specified in the FSMS Software Requirements Specification (PA-FR-001, AC-001-1).

---

## Edge Cases

### Insufficient Data (Score is Null)
If active_time_ms (productive_ms + neutral_ms + unproductive_ms + passive_ms) is zero, the score is null — not zero. This happens when:
- The employee had no tracked activity for the day (vacation, day off, no computer use)
- The employee spent the entire day in Private Time
- The Agent was not running or was quarantined

A null score is displayed as "—" on the dashboard with the confidence indicator "Uncertain — Insufficient Data."

### Only Private Time
If the employee used Private Time for the entire workday, the score is null. Private Time is excluded from all calculations by design.

### Maximum Score Cap
If `productive_ms + 0.5 * passive_ms` exceeds the denominator (this should not happen in normal operation), the score is capped at 100.

### Full-Day Private Time
If an employee spends their entire workday in Private Time, the score is null. No activity data is captured during Private Time, so there is no data to score.

---

## Confidence Indicators

Every daily productivity score carries one of three confidence indicators:

| Indicator | Condition | Meaning |
|-----------|-----------|---------|
| **High Confidence** | Less than 20% uncertain events AND at least 2 hours of active time | The score is based on reliable data with clear classifications |
| **Uncertain — Mixed Context** | 20% or more of active time from uncertain events | A significant portion of activity could not be confidently classified; the score may not reflect actual work patterns |
| **Uncertain — Insufficient Data** | Less than 2 hours of active time | There is not enough tracked activity to produce a reliable score |

Confidence indicators are displayed next to the score with color-coded icons: green for High Confidence, orange for Uncertain — Mixed Context, and gray for Uncertain — Insufficient Data.

---

## When Scores Are Calculated

Scores are calculated:
- **Daily (midnight local time):** The system processes all activity events for the previous day and produces the daily score.
- **On session end:** When an employee ends their work session (shuts down or logs off), a real-time score is calculated for the partial day.
- **On dispute resolution:** If a dispute is upheld and events are recategorized, the score for the affected date range is recalculated (PA-FR-007).

---

## Why We Publish the Methodology

FSMS publishes the full scoring methodology for three reasons:

1. **Trust.** When employees understand exactly how their score is calculated, they can see that the system is fair and transparent. A black-box score breeds suspicion; a published formula invites understanding.
2. **Accuracy.** Published methodology means anyone can verify the calculation. If an employee believes their score is wrong, they can check the inputs and the math, and file a dispute if something is incorrect.
3. **No false precision.** FSMS never claims a single "accuracy percentage" (e.g., "greater than 95% accurate") anywhere in the product. The published methodology is the only accuracy representation. This is a deliberate product requirement that distinguishes FSMS from tools that make unverifiable accuracy claims.

---

## Disputing a Score

If an employee believes their productivity score is inaccurate — because an application was miscategorized, an activity was misclassified, or the calculation was applied incorrectly — they can file a dispute through the FSMS dashboard.

The dispute workflow includes:
1. Submitting the date range and reason for the dispute
2. Identifying the specific events or classifications being contested
3. A 5-business-day SLA for resolution, tracked in-system
4. Automatic escalation to HR if the SLA is breached
5. If upheld: retroactive score recalculation with a visible correction to the historical record

For more details, see our [Features page](/features) and [Pricing page](/pricing).

[Back to blog](/blog) · [View pricing](/pricing) · [Start free trial](/pricing)
