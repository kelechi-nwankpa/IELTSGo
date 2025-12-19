# IELTS Prep Platform — Feature Tracker

This file is the authoritative checklist for all product features.
Claude and developers must use this file to track build progress and avoid scope gaps.

**Last updated:** 2025-01-19
**Current phase:** 0 (Foundation)

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
- [ ] Next.js 14+ project initialized (App Router, TypeScript)
- [ ] Tailwind CSS configured
- [ ] ESLint + Prettier setup
- [ ] Git repository initialized with .gitignore

### Database
- [ ] PostgreSQL database provisioned
- [ ] Prisma ORM installed and configured
- [ ] Core schema defined (users, content, sessions, evaluations, quota)
- [ ] Initial migrations created and applied

### Authentication
- [ ] Auth provider integrated (NextAuth/Clerk/etc.)
- [ ] Email/password registration
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Social login (Google)
- [ ] JWT session management
- [ ] Protected route middleware
- [ ] Account deletion (GDPR)

### API Structure
- [ ] API route structure established
- [ ] Error handling middleware
- [ ] Request validation (Zod)
- [ ] Rate limiting setup
- [ ] API response formatting

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
- [ ] Task 2 essay prompts (minimum 10)
- [ ] Prompt display UI

### Submission
- [ ] Essay text editor component
- [ ] Word count display
- [ ] Timer component (optional use)
- [ ] Essay submission API endpoint
- [ ] Input validation (min/max words)

### AI Evaluation
- [ ] AI service layer created
- [ ] Claude API integration
- [ ] Writing evaluation prompt integrated
- [ ] Structured JSON response parsing
- [ ] Error handling for AI failures
- [ ] Evaluation storage in database

### Feedback Display
- [ ] Band score display (4 criteria + overall)
- [ ] Criterion breakdown UI
- [ ] Specific feedback with essay references
- [ ] Improvement suggestions display
- [ ] Evaluation history view
- [ ] Error highlighting
- [ ] Band 8/9 model answers
- [ ] Rewrite & resubmit
- [ ] Historical comparison

### Quota System
- [ ] Free tier: 3 evaluations/month
- [ ] Quota tracking in database
- [ ] Quota check before evaluation
- [ ] Quota display in UI
- [ ] Quota reset logic (monthly)
- [ ] Admin overrides

### User Dashboard
- [ ] Basic dashboard layout
- [ ] Recent evaluations list
- [ ] Quota usage display
- [ ] Quick start writing button

### Landing Page
- [ ] Hero section with value prop
- [ ] Feature highlights
- [ ] Pricing preview
- [ ] CTA to sign up
- [ ] Sample feedback demo

---

## Phase 2: Reading & Listening

### Reading Module
- [ ] Passage display component
- [ ] Timer component
- [ ] Question type: Multiple choice
- [ ] Question type: True/False/Not Given
- [ ] Question type: Matching headings
- [ ] Question type: Fill-in-the-blank
- [ ] Answer submission
- [ ] Auto-scoring via answer key
- [ ] Score display
- [ ] AI explanation on request
- [ ] Explanation caching
- [ ] Review incorrect answers

### Listening Module
- [ ] Audio player component
- [ ] Playback controls (play, pause, seek)
- [ ] Volume control
- [ ] Question display synced with audio
- [ ] Answer submission
- [ ] Auto-scoring
- [ ] Score display
- [ ] AI explanation on request
- [ ] Explanation caching
- [ ] Transcript reveal
- [ ] Accent variation

### Content Management
- [ ] Admin content upload interface
- [ ] Reading passage management
- [ ] Listening audio management
- [ ] Answer key management
- [ ] Content tagging (difficulty, type)

### Content Library
- [ ] 10 reading passages (initial)
- [ ] 10 listening exercises (initial)
- [ ] Mix of difficulty levels

---

## Phase 3: Speaking Module

### Recording
- [ ] Audio recording interface
- [ ] Browser microphone access
- [ ] Recording timer
- [ ] Waveform visualization
- [ ] Recording playback
- [ ] Recording retry option

### Speech-to-Text
- [ ] Whisper API integration
- [ ] Audio upload handling
- [ ] Transcription processing
- [ ] Transcription display
- [ ] Transcription editing (optional)

### AI Evaluation
- [ ] Speaking evaluation prompt integrated
- [ ] Fluency & Coherence scoring
- [ ] Lexical Resource scoring
- [ ] Grammar scoring
- [ ] Pronunciation feedback (approximate)
- [ ] Band estimate
- [ ] Strengths & weaknesses summary
- [ ] Practice advice

### Speaking Metrics & Insights
- [ ] Words per minute
- [ ] Filler word detection
- [ ] Repeated word detection
- [ ] Pause inference
- [ ] Sentence variety scoring
- [ ] Trend tracking

### Speaking Parts
- [ ] Part 1: Introduction questions
- [ ] Part 2: Cue card with prep time
- [ ] Part 3: Discussion questions
- [ ] Content library for each part

### Feedback Display
- [ ] Band score display
- [ ] Criterion breakdown
- [ ] Transcript with annotations
- [ ] Metrics visualization
- [ ] Improvement suggestions

---

## Phase 4: Payment & Premium

### Stripe Integration
- [ ] Stripe account connected
- [ ] Product/price configuration
- [ ] Checkout session creation
- [ ] Webhook handling
- [ ] Payment success/failure handling

### Subscription Plans
- [ ] Free tier defined
- [ ] Monthly premium plan
- [ ] Annual premium plan (discounted)
- [ ] Plan comparison UI
- [ ] Grace periods

### Billing Management
- [ ] Customer portal integration
- [ ] Plan upgrade flow
- [ ] Plan downgrade flow
- [ ] Cancellation flow
- [ ] Cancel / resume subscription
- [ ] Invoice history

### Feature Gating
- [ ] Premium content locked for free users
- [ ] Evaluation limits enforced by tier
- [ ] Upgrade prompts at limit
- [ ] Subscription status in user context

---

## Phase 5: Task 1 & General Training

### Task 1 Academic
- [ ] Chart/graph description prompts
- [ ] Process diagram prompts
- [ ] Map prompts
- [ ] Multiple data set prompts
- [ ] Task 1 Academic evaluation prompt
- [ ] Minimum 20 Task 1 Academic items
- [ ] Visual prompt handling (graphs)

### Task 1 General Training
- [ ] Formal letter prompts
- [ ] Semi-formal letter prompts
- [ ] Informal letter prompts
- [ ] Task 1 GT evaluation prompt
- [ ] Minimum 20 Task 1 GT items

### Task 2 General Training
- [ ] GT-specific essay prompts
- [ ] Prompt calibration for GT
- [ ] Minimum 20 Task 2 GT items

### UI Updates
- [ ] Task type selector (Task 1 vs Task 2)
- [ ] Test type selector (Academic vs GT)
- [ ] Appropriate prompt display per type

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

| Phase | Name | Features | Completed | Progress |
|-------|------|----------|-----------|----------|
| 0 | Foundation | 30 | 0 | 0% |
| 1 | MVP — Writing | 35 | 0 | 0% |
| 2 | Reading & Listening | 27 | 0 | 0% |
| 3 | Speaking | 30 | 0 | 0% |
| 4 | Payment & Premium | 18 | 0 | 0% |
| 5 | Task 1 & GT | 18 | 0 | 0% |
| 6 | Study Plans & Progress | 24 | 0 | 0% |
| 7 | Test Simulation | 9 | 0 | 0% |
| 8 | Mobile Apps | 17 | 0 | 0% |
| 9 | Polish & Scale | 27 | 0 | 0% |
| **Total** | | **235** | **0** | **0%** |

---

## Notes

- Features marked [!] are explicitly deferred
- Any new feature must be added here before implementation
- Claude must reference this file when planning work
- Feature counts are approximate and may change as development progresses
- Use `[x]` to mark completed features, `[~]` for in-progress
