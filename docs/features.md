# IELTS Prep Platform — Feature Tracker

This file is the authoritative checklist for all product features.
Claude and developers must use this file to track build progress and avoid scope gaps.

**Last updated:** 2025-12-26
**Current phase:** 5 (Task 1 & General Training) - Complete

Legend:

- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Deferred / Post-MVP

---

## Phase 0: Foundation

### Product Definition

- [ ] Final app name
- [ ] Target user personas defined
- [ ] IELTS Academic + General scope confirmed
- [ ] MVP vs Post-MVP features frozen
- [ ] Monetization strategy locked
- [ ] `claude.md` committed and finalised

### Infrastructure

- [x] Next.js 14+ project initialized (App Router, TypeScript)
- [x] Tailwind CSS configured
- [x] ESLint + Prettier setup
- [x] Git repository initialized with .gitignore

### Database

- [x] PostgreSQL database provisioned
- [x] Prisma ORM installed and configured
- [x] Core schema defined (users, content, sessions, evaluations, quota)
- [x] Initial migrations created and applied

### Authentication

- [x] Auth provider integrated (NextAuth/Clerk/etc.)
- [x] Email/password registration
- [ ] Email verification flow
- [ ] Password reset flow
- [x] Social login (Google)
- [x] JWT session management
- [x] Protected route middleware
- [ ] Account deletion (GDPR)

### API Structure

- [x] API route structure established
- [x] Error handling middleware
- [ ] Request validation (Zod)
- [ ] Rate limiting setup
- [x] API response formatting

### DevOps

- [ ] CI pipeline (GitHub Actions)
- [ ] Linting/type-check in CI
- [ ] Test runner configured
- [ ] Environment variable management
- [ ] Development environment documentation
- [ ] Secrets management
- [ ] Logging strategy
- [ ] Error handling conventions

---

## Phase 1: MVP — Writing Module

### Content

- [x] Task 2 essay prompts (minimum 10)
- [x] Prompt display UI

### Submission

- [x] Essay text editor component
- [x] Word count display
- [x] Timer component (optional use)
- [x] Essay submission API endpoint
- [x] Input validation (min/max words)

### AI Evaluation

- [x] AI service layer created
- [x] Claude API integration
- [x] Writing evaluation prompt integrated
- [x] Structured JSON response parsing
- [x] Error handling for AI failures
- [x] Evaluation storage in database

### Feedback Display

- [x] Band score display (4 criteria + overall)
- [x] Criterion breakdown UI
- [x] Specific feedback with essay references
- [x] Improvement suggestions display
- [x] Evaluation history view
- [ ] Error highlighting
- [ ] Band 8/9 model answers
- [x] Rewrite & resubmit
- [ ] Historical comparison

### Quota System

- [x] Free tier: 3 evaluations/month
- [x] Quota tracking in database
- [x] Quota check before evaluation
- [x] Quota display in UI
- [ ] Quota reset logic (monthly)
- [ ] Admin overrides

### User Dashboard

- [x] Basic dashboard layout
- [x] Recent evaluations list
- [x] Quota usage display
- [x] Quick start writing button

### Landing Page

- [x] Hero section with value prop
- [x] Feature highlights
- [ ] Pricing preview
- [x] CTA to sign up
- [x] Sample feedback demo

---

## Phase 2: Reading & Listening

### Reading Module

- [x] Passage display component
- [x] Timer component
- [x] Question type: Multiple choice
- [x] Question type: True/False/Not Given
- [x] Question type: Matching headings
- [x] Question type: Fill-in-the-blank
- [x] Answer submission
- [x] Auto-scoring via answer key
- [x] Score display
- [x] AI explanation on request
- [x] Explanation caching
- [x] Review incorrect answers

### Listening Module

- [x] Audio player component
- [x] Playback controls (play, pause, seek)
- [x] Volume control
- [x] Question display synced with audio
- [x] Answer submission
- [x] Auto-scoring
- [x] Score display
- [x] AI explanation on request
- [x] Explanation caching
- [x] Transcript reveal
- [x] Accent variation (metadata)

### Content Management

- [x] Admin content upload interface
- [x] Reading passage management
- [x] Listening audio management
- [x] Answer key management
- [x] Content tagging (difficulty, type)

### Content Library

- [x] 10 reading passages (initial)
- [x] 10 listening exercises (initial)
- [x] Mix of difficulty levels

---

## Phase 3: Speaking Module

### Recording

- [x] Audio recording interface
- [x] Browser microphone access
- [x] Recording timer
- [x] Waveform visualization
- [x] Recording playback
- [x] Recording retry option

### Speech-to-Text

- [x] Whisper API integration
- [x] Audio upload handling
- [x] Transcription processing
- [x] Transcription display
- [x] Transcription editing (optional)

### AI Evaluation

- [x] Speaking evaluation prompt integrated
- [x] Fluency & Coherence scoring
- [x] Lexical Resource scoring
- [x] Grammar scoring
- [x] Pronunciation feedback (approximate)
- [x] Band estimate
- [x] Strengths & weaknesses summary
- [x] Practice advice

### Speaking Metrics & Insights

- [x] Words per minute
- [x] Filler word detection
- [x] Repeated word detection
- [x] Pause inference
- [x] Sentence variety scoring
- [x] Trend tracking

### Speaking Parts

- [x] Part 1: Introduction questions
- [x] Part 2: Cue card with prep time
- [x] Part 3: Discussion questions
- [x] Content library for each part

### Feedback Display

- [x] Band score display
- [x] Criterion breakdown
- [x] Transcript with annotations
- [x] Metrics visualization
- [x] Improvement suggestions

---

## Phase 4: Payment & Premium

### Stripe Integration

- [x] Stripe account connected
- [x] Product/price configuration
- [x] Checkout session creation
- [x] Webhook handling
- [x] Payment success/failure handling

### Subscription Plans

- [x] Free tier defined
- [x] Monthly premium plan
- [x] Annual premium plan (discounted)
- [x] Plan comparison UI
- [x] Grace periods

### Billing Management

- [x] Customer portal integration
- [x] Plan upgrade flow
- [x] Plan downgrade flow
- [x] Cancellation flow
- [x] Cancel / resume subscription
- [x] Invoice history

### Feature Gating

- [x] Premium content locked for free users
- [x] Evaluation limits enforced by tier
- [x] Upgrade prompts at limit
- [x] Subscription status in user context

---

## Phase 5: Task 1 & General Training

### Task 1 Academic

- [x] Chart/graph description prompts (10 line graphs, 8 bar charts)
- [x] Process diagram prompts (4 process diagrams)
- [x] Map prompts (3 maps)
- [x] Multiple data set prompts (5 pie charts, 4 tables, 2 mixed)
- [x] Task 1 Academic evaluation prompt
- [x] Minimum 20 Task 1 Academic items (36 total)
- [x] Visual prompt handling (36 SVG images for all chart types)

### Task 1 General Training

- [x] Formal letter prompts (11 prompts)
- [x] Semi-formal letter prompts (11 prompts)
- [x] Informal letter prompts (10 prompts)
- [x] Task 1 GT evaluation prompt
- [x] Minimum 20 Task 1 GT items (32 total)

### Task 2 General Training

- [x] GT-specific essay prompts (34 prompts)
- [x] Prompt calibration for GT
- [x] Minimum 20 Task 2 GT items (34 total)

### UI Updates

- [x] Task type selector (Task 1 vs Task 2)
- [x] Test type selector (Academic vs GT)
- [x] Appropriate prompt display per type
- [x] Back to Dashboard navigation on Writing page
- [x] Back to Dashboard navigation on Speaking page

### Completed Tasks

- [x] All 36 SVG images created for Task 1 Academic visuals
- [x] Database seeded with all new prompts (102 total new prompts)
- [x] Dashboard updated to show Task 1 writing history

---

## Phase 6: Study Plans & Progress

### Progress Tracking

- [ ] Skill-level breakdown
- [ ] Band score trends
- [ ] Weak-area identification
- [ ] Attempt history
- [ ] Completion metrics

### Diagnostic Assessment

- [ ] Initial diagnostic test design
- [ ] Band estimation per module
- [ ] Diagnostic results storage
- [ ] Results visualization

### Plan Configuration

- [ ] Target band input
- [ ] Test date input
- [ ] Available study time input
- [ ] Weak area identification

### AI Plan Generation

- [ ] Study plan prompt integrated
- [ ] Personalized plan generation
- [ ] Plan storage in database
- [ ] Plan display UI

### Task Management

- [ ] Daily task recommendations
- [ ] Weekly goals view
- [ ] Task completion tracking
- [ ] Progress visualization
- [ ] Skill prioritisation
- [ ] Adaptive difficulty

### Adaptation

- [ ] Performance tracking over time
- [ ] Plan adjustment based on progress
- [ ] Re-assessment prompts
- [ ] Focus area recommendations

---

## Phase 7: Test Simulation

### Full Mock Tests

- [ ] Full test mode
- [ ] Timed sections
- [ ] Section transitions
- [ ] Final band estimate
- [ ] Performance summary

### Exam Readiness Tools

- [ ] Exam day checklist
- [ ] Time management tips
- [ ] Common mistakes warnings
- [ ] Final revision mode

---

## Phase 8: Mobile Apps

### React Native Setup

- [ ] RN project initialized
- [ ] Navigation structure
- [ ] Shared components
- [ ] API client integration
- [ ] Authentication flow

### Core Features

- [ ] Writing submission (mobile)
- [ ] Reading practice (mobile)
- [ ] Listening practice (mobile)
- [ ] Speaking recording (native)
- [ ] Dashboard (mobile)

### Native Features

- [ ] Push notifications
- [ ] Study reminders
- [ ] Native audio recording
- [ ] Native audio playback

### App Store

- [ ] iOS app submission
- [ ] Android app submission
- [ ] App store assets
- [ ] Privacy policy compliance

---

## Phase 9: Polish & Scale

### Offline Mode

- [ ] Content pre-download
- [ ] Offline practice (reading/listening)
- [ ] Sync on reconnection

### Performance & Security

- [ ] Core Web Vitals optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Caching strategy
- [ ] Load testing completed
- [ ] Rate limiting
- [ ] Abuse prevention
- [ ] Data encryption checks
- [ ] Secure media storage

### Analytics & Monitoring

- [ ] User behavior tracking
- [ ] Conversion funnel analysis
- [ ] AI cost per user tracking
- [ ] Performance monitoring
- [ ] Analytics dashboards
- [ ] Error tracking
- [ ] User feedback collection
- [ ] Iteration loop

### Onboarding & Retention

- [ ] First-time user flow
- [ ] Guided first task
- [ ] Streaks / achievements
- [ ] Notifications / reminders
- [ ] Email nudges

### Growth

- [ ] Referral system
- [ ] Social sharing
- [ ] Testimonials/reviews

### Accessibility & i18n

- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader support
- [ ] UI localization (Spanish, Chinese, etc.)

### Scale

- [ ] Horizontal scaling configured
- [ ] Database optimization
- [ ] CDN for global delivery

---

## Summary

| Phase     | Name                   | Features | Completed | Progress |
| --------- | ---------------------- | -------- | --------- | -------- |
| 0         | Foundation             | 30       | 16        | 53%      |
| 1         | MVP — Writing          | 35       | 27        | 77%      |
| 2         | Reading & Listening    | 27       | 27        | 100%     |
| 3         | Speaking               | 30       | 30        | 100%     |
| 4         | Payment & Premium      | 18       | 18        | 100%     |
| 5         | Task 1 & GT            | 21       | 21        | 100%     |
| 6         | Study Plans & Progress | 24       | 0         | 0%       |
| 7         | Test Simulation        | 9        | 0         | 0%       |
| 8         | Mobile Apps            | 17       | 0         | 0%       |
| 9         | Polish & Scale         | 27       | 0         | 0%       |
| **Total** |                        | **238**  | **139**   | **58%**  |

---

## Notes

- Features marked [!] are explicitly deferred
- Any new feature must be added here before implementation
- Claude must reference this file when planning work
- Feature counts are approximate and may change as development progresses
- Use `[x]` to mark completed features, `[~]` for in-progress
