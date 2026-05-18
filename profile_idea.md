# Profile Page Concepts by Role

The Profile page (`/profile`) should serve as the central hub for a user's identity and history on SurveyHub. Like the homepage, it should adapt its content and theme based on the user's role.

---

## 🎨 Layout Architecture (Shared)

All profiles follow the **"Refined Data Studio"** layout:

- **Hero Header:** A full-width `coverPhoto` with a centered or bottom-left overlapped `avatar`.
- **Identity Block:** Name, Role Badge, Location, and Bio.
- **Tabbed Navigation:** `Overview`, `Activity`, `Settings` (and role-specific tabs like `Gallery` or `Moderation`).

---

## 🟢 Regular User — "The Contributor"

Focuses on their journey as a participant and their influence on the platform.

| Section | Content |
|---|---|
| **Impact Dashboard** | 3 Stat Cards: "Surveys Completed", "Questions Answered", "Insights Influenced" (JetBrains Mono). |
| **Topic Cloud** | Visual chips of their `preferences` (e.g., #Technology, #Health, #Finance) — shows what they care about. |
| **Recent Participation** | A list of the last 5 surveys they voted in, with "View Results" links if the survey is expired. |
| **Reward Progress** | **"Your influence is growing! 🚀"** — A teaser message explaining that exclusive appreciation rewards and badges are currently being forged for top contributors. |
| **Personal Settings** | Quick toggles for notifications (Deadline alerts, reply notifications) and category preferences. |

---

## 🔵 Surveyor — "The Insight Architect"

This is their professional "Storefront." It must build immediate authority.

| Section | Content |
|---|---|
| **Professional KPI Row** | High-level Authority Stats: Total Responses Collected, Avg. Survey Rating, Insight Blogs Published. |
| **Public Gallery** | A grid of their most popular `published` surveys. Allows others to see their work quality. |
| **Insight Feed** | Teasers for their AI-generated Blog posts. Shows they are a thought leader. |
| **Surveyor Bio & Links** | Enhanced `bio` + `socialLinks` (LinkedIn/Website). A dedicated space for surveyors to establish their professional brand. |

---

## 🔴 Admin — "The Guardian"

Focuses on platform integrity and their role in the ecosystem.

| Section | Content |
|---|---|
| **The Guardian Badge** | A prominent, specialized badge showing their role and total "Helpful Actions" taken. |
| **Community Impact** | High-level summary of their contribution to platform safety and integrity. |

---
