# Eight Winds — Design Document

**A contemplative tracker for the aṭṭha lokadhammā**
Version 0.2 · Draft · July 2026 · **Web-first PWA**

---

## 1. Overview

### 1.1 Concept

Eight Winds is a progressive web app that helps practitioners notice and work with the **eight worldly winds** (aṭṭha lokadhammā) — the four pairs of worldly conditions that the Buddha said ceaselessly blow through every life:

| Wind | Pali | Its Opposite | Pali |
|------|------|--------------|------|
| Gain | lābha | Loss | alābha |
| Status / Fame | yasa | Disgrace / Obscurity | ayasa |
| Praise | pasaṃsā | Blame | nindā |
| Pleasure | sukha | Pain | dukkha |

Unlike a conventional mood tracker, the unit of observation is not "how do I feel" but **"which wind is blowing, and how am I meeting it?"** The app reframes emotional life through the lens of the Lokavipatti Sutta (AN 8.6): the winds are inevitable; what distinguishes the practitioner is whether the mind is *swept up* by them or *knows them as they arise, as inconstant, stressful, subject to change*.

### 1.2 Core Insight

Most mood trackers implicitly treat pleasant states as "good data" and unpleasant states as "bad data" to be minimized. Eight Winds inverts this: **the metric that matters is equanimity (upekkhā), not valence.** A day full of blame met with balance is a better practice day than a day full of praise that inflated the ego. The design must reinforce this at every level — no red/green coloring of loss vs. gain, no streaks for "feeling good."

### 1.3 Why Web-First

The delivery choice is itself an expression of the app's values:

- **Dāna, genuinely.** A free static site with no server, no account, and no purchase is a cleaner act of generosity (dāna pāramī) than any App Store pricing model. There is nothing to sell because nothing is collected.
- **Right livelihood by construction.** No hosting costs beyond GitHub Pages means no pressure to monetize attention. The app cannot become an engagement machine because there is no business reason for it to.
- **Non-attachment to platform.** Open web standards; works on iPhone, Android, and desktop; no App Store gatekeeper, no $99/yr fee, no review queue.
- **Impermanence, handled honestly.** Browser storage is genuinely fragile (see §5.3). Rather than hide this, the app treats backup/export as a first-class practice — the user owns and tends their own record.

### 1.4 Non-Goals

- Not a meditation timer (Insight Timer et al. own this space)
- Not a clinical mental-health tool; no diagnostic language, no PHQ-9-style scoring
- Not a social app — no sharing, no leaderboards (a leaderboard for equanimity would be self-refuting)
- Not a dharma library, though brief sutta references appear contextually

---

## 2. Target User

Practicing Buddhists (or dharma-curious meditators) who:

- Already have some sitting practice and want to extend mindfulness into daily life (satipaṭṭhāna off the cushion)
- Are familiar with, or open to, Pali terminology
- Want a reflective tool, not a gamified habit app

Primary persona: a lay practitioner who notices, e.g., a surge of ego after praise at work, and wants a lightweight way to log it, tag it, and later see the pattern.

---

## 3. Core Features

### 3.1 Wind Logging (the primary loop)

A log entry captures three things, in under 15 seconds:

1. **Which wind?** — One tap on a compass-rose UI showing the eight winds as eight directions. The four pairs sit opposite each other (gain opposite loss, etc.), visually reinforcing that each wind implies its counterpart.
2. **Intensity** — How strongly is it blowing? A 1–5 gust scale (breeze → gale).
3. **Response quality** — The key field. How did the mind meet it?
   - **Swept away** — fully caught: elation, craving, aversion, rumination
   - **Caught, then noticed** — reactivity arose, mindfulness arrived late
   - **Noticed as it arose** — the wind was seen as wind
   - **Equanimous** — known, felt fully, not grasped

Optional fields: a one-line note, and a tag for the domain (work, family, practice, body, online).

### 3.2 The Weather Report (dashboard)

The home screen shows a "weather" metaphor for the recent period:

- **Wind rose chart** — which winds have blown most in the last 7/30/90 days
- **Equanimity trend** — response-quality over time, framed gently ("mindfulness is arriving earlier" rather than a score going "up")
- **Pair balance** — a subtle visualization showing that gain and loss, praise and blame, tend to arrive in roughly equal measure over long horizons. This is the app's quiet dharma teaching: the pairs are inseparable.

### 3.3 Reflection Prompts

- **Evening review** (optional Web Push notification for installed PWA, or simply a habit anchored to an existing routine): "Which winds blew today?" — a batch-logging mode for people who don't log in the moment
- **Pattern insights**, surfaced sparingly and phrased as questions, never diagnoses: *"Blame entries cluster on weekdays and are usually 'caught, then noticed.' What does the moment before the catch feel like?"*
- **Contextual sutta snippets** — after logging, occasionally show one or two lines (AN 8.6, Dhp 81: "As a solid rock is unshaken by the wind…"). Rotated, brief, skippable.

### 3.4 Backup as Practice

Export/import is not a settings-page afterthought; it is a visible, encouraged ritual:

- **One-tap JSON export** (also CSV) from the dashboard
- Gentle periodic reminder (~monthly, in-app only): "It's been a while since you saved your record"
- Import merges by timestamp, so restoring on a new device or browser is painless
- The framing in-app: browser storage is impermanent, like everything else; tending your own backup is right effort, not a chore the app failed to automate

---

## 4. Design Language

### 4.1 Visual

- Palette: ink, paper, muted earth tones. No red/green valence coding — **all eight winds get equally weighted, neutral colors** (perhaps eight desaturated hues of a single wheel)
- Typography: quiet, generous whitespace; the app should feel like a zendo, not a casino
- The compass rose is the identity mark: eight-pointed, hand-drawn quality
- Mobile-first layout (the phone in the pocket is where winds are noticed), but fully usable on desktop

### 4.2 Tone

- Second person, gentle, non-judgmental. Never "You failed to stay equanimous"; instead "The wind was strong today"
- Pali terms shown with English, with a setting to prefer Pali-primary display
- No streaks, no badges, no confetti. The only "achievement" is the practitioner's own noticing

### 4.3 Ethical Design Commitments

These follow from sīla applied to software — right livelihood, right speech, non-harming:

- **No engagement optimization.** The app never manufactures reasons to open it
- **Local-only data.** The record of a person's inner weather is intimate; it never leaves the device. There is no server to send it to
- **No analytics, no trackers, no cookies.** GitHub Pages serves static files; that is the entire backend
- **Honest emptiness.** If there's nothing to show, show nothing — no filler insights

---

## 5. Technical Architecture

### 5.1 Stack

- **Static site on GitHub Pages** — no server, no build-time secrets, deploy via GitHub Actions on push
- **Framework**: Svelte (or Preact) + Vite — small bundle, fast load; or vanilla TS if bundle-size asceticism appeals. Target < 100 KB gzipped total
- **PWA**: web app manifest + service worker (Workbox or hand-rolled) for full offline operation and Add-to-Home-Screen install
- **Storage**: **IndexedDB** (via the `idb` wrapper) — not localStorage — for structured entries, larger quota, and async access
- **Charts**: lightweight SVG rendered directly (a wind rose is simple geometry; no charting library needed)
- **Notifications**: Web Push via service worker, available on iOS 16.4+ *only when installed to home screen*; treated as progressive enhancement, never required

### 5.2 Data Model (sketch)

```ts
interface WindEntry {
  id: string;            // ULID — sortable, collision-free for merge-on-import
  timestamp: number;     // epoch ms
  wind: Wind;            // 8-value union, paired
  intensity: 1 | 2 | 3 | 4 | 5;
  response: 'sweptAway' | 'caughtLate' | 'noticedArising' | 'equanimous';
  note?: string;
  domain?: 'work' | 'family' | 'practice' | 'body' | 'online' | 'other';
}

const OPPOSITES: Record<Wind, Wind> = {
  gain: 'loss', fame: 'disrepute', praise: 'blame', pleasure: 'pain', /* + inverses */
};
```

Deliberately small. Resist schema creep; every added field is added logging friction.

### 5.3 Storage Durability (the critical constraint)

iOS Safari's Intelligent Tracking Prevention **evicts all script-writable storage (IndexedDB included) for sites not visited in 7 days** — unless the PWA is installed to the home screen, which exempts it. Design responses, in order:

1. **Onboarding strongly encourages Add to Home Screen** on iOS, with a one-screen illustrated guide (Share → Add to Home Screen). Framed honestly: "Installing protects your record and adds an app icon"
2. Call `navigator.storage.persist()` where supported (helps on Android/desktop; no-op on iOS but harmless)
3. **§3.4 backup-as-practice** is the true safety net — the user's exported JSON is the canonical record; the browser is just a cache with a nice UI
4. Show last-backup date unobtrusively on the dashboard

### 5.4 Privacy Posture

- No account, no email, no sign-up, no server. The app works fully anonymously by construction, not by policy
- All computation (trends, insights) happens client-side
- Export: JSON/CSV owned by the user — their data, their record
- The privacy page is one sentence long, and true: "Your entries never leave your device."

---

## 6. Screens (v1.0)

1. **Compass** (home) — the eight-wind rose; tap to log
2. **Log flow** — intensity → response → optional note (3 taps minimum path)
3. **Weather** — dashboard: wind rose chart, equanimity trend, pair balance, last-backup date
4. **Journal** — chronological entry list, searchable, filterable by wind/domain
5. **Reflect** — evening review flow + surfaced pattern questions
6. **Settings** — Pali display preference, notification setup (installed PWA only), export/import, install guide, about (with sutta sources)

---

## 7. Distribution & Sustainability

- **Free, forever, as dāna.** Static hosting on GitHub Pages costs nothing; there is no monetization and no plan for any
- **Open source** (MIT or similar) — the code itself is offered; forks welcome. This also makes the privacy claims verifiable rather than merely asserted
- Optional "about" link to the repo and to the source suttas on SuttaCentral / dhammatalks.org
- If it ever grows a community, contributions flow through GitHub issues/PRs, not a roadmap driven by revenue

---

## 8. Risks & Open Questions

- **Storage eviction** (§5.3) is the top technical risk; mitigation is install-prompt + backup-as-practice. Accept that some casual users will lose data; the app should degrade gracefully and never pretend durability it doesn't have
- **Logging fatigue**: even 15 seconds is friction. Mitigation: evening batch review as first-class flow, home-screen icon straight to the compass
- **No widget/watch**: native-only affordances are given up. Revisit native wrapper (Capacitor) only if real usage demonstrates the need — not before (aparigraha applies to feature scope too)
- **Sectarian framing**: the eight winds are pan-Buddhist, but terminology and sutta citations lean Theravāda. A Pali/Sanskrit/English display setting broadens reach (aṣṭa lokadharmāḥ for Mahāyāna practitioners)
- **The measurement paradox**: does quantifying equanimity undermine it? The response-quality field is self-report and inherently fuzzy — trends are *mirrors for reflection*, never scores to optimize. Onboarding line: "This app measures nothing. It only helps you look."
- **Naming**: "Eight Winds" is clean; check domain availability for a custom-domain option (`eightwinds.app`?), though `username.github.io/eight-winds` is fine for v1

---

## 9. Milestones

| Phase | Scope | Target |
|-------|-------|--------|
| M0 | Data model, IndexedDB layer, compass UI, log flow | 2 wks |
| M1 | Weather dashboard, journal, export/import | +2 wks |
| M2 | PWA install (manifest, service worker, offline), evening review | +1.5 wks |
| M3 | Polish, install-guide onboarding, beta with sangha testers | +1.5 wks |
| v1.0 | Public on GitHub Pages | ~7 wks total |
| v1.1 | Web Push evening reminder (installed PWA), Pali/Sanskrit toggle | post-launch |
| Later | Native wrapper only if genuinely warranted | — |

---

## Appendix: Source Text

> "Gain and loss, status and disgrace, censure and praise, pleasure and pain: these conditions among human beings are inconstant, impermanent, subject to change. Knowing this, the wise person, mindful, ponders these changing conditions. Desirable things don't charm the mind, undesirable ones bring no resistance."
> — AN 8.6, Lokavipatti Sutta (Thanissaro Bhikkhu, trans., abridged)
