# Roadmap

Development phases for IELTSGo, from MVP to v1.0.

---

## Phase 0: Foundation

**Goal:** Repository setup and core infrastructure.

### Deliverables

- [x] Repository structure
- [x] Documentation (claude.md, architecture, this roadmap)
- [x] AI prompt definitions
- [ ] Development environment setup
- [ ] CI/CD pipeline
- [ ] Database schema and migrations
- [ ] Authentication system
- [ ] Basic API structure

### Definition of Done

- Developer can clone, install, and run locally
- Auth flow works end-to-end
- Database migrations run cleanly

---

## Phase 1: MVP — Writing Module

**Goal:** Core writing evaluation feature, demonstrating AI feedback value.

### Deliverables

- [ ] Task 2 essay submission (Academic)
- [ ] AI evaluation integration
- [ ] Band score display (4 criteria + overall)
- [ ] Feedback display with specific suggestions
- [ ] Basic user dashboard
- [ ] Usage quota system (3 free evaluations)
- [ ] Simple landing page
- [ ] Robust error handling (user-friendly error messages, no raw API errors)

### Scope Limits

- Task 2 only (Task 1 deferred)
- Academic only (General Training deferred)
- Web only (mobile deferred)
- No study plans yet

### Success Criteria

- User can submit essay and receive feedback in <30 seconds
- Feedback references specific parts of user's essay
- Band estimates are defensible against public descriptors
- Free tier limits enforced correctly

---

## Phase 2: Reading & Listening (Auto-Scored)

**Goal:** Complete non-AI practice modules.

### Deliverables

- [ ] Reading module
  - [ ] Passage display with timer
  - [ ] Question types: multiple choice, T/F/NG, matching, fill-in-blank
  - [ ] Auto-scoring via answer key
  - [ ] AI explanation on request
- [ ] Listening module
  - [ ] Audio player with controls
  - [ ] Question display
  - [ ] Auto-scoring
  - [ ] AI explanation on request
- [ ] Content management system (admin)
- [ ] Initial content library (10 reading, 10 listening)

### Scope Limits

- Explanations cached aggressively
- No adaptive difficulty yet

### Success Criteria

- Complete practice session works end-to-end
- Explanations are accurate and helpful
- Explanation cache hit rate >80% after initial period

---

## Phase 3: Speaking Module

**Goal:** Voice-based evaluation feature.

### Deliverables

- [ ] Audio recording interface
- [ ] Speech-to-text integration (Whisper)
- [ ] AI evaluation of transcribed response
- [ ] Speaking metrics (WPM, fillers, repetition)
- [ ] All three speaking parts (Part 1, 2, 3)
- [ ] Audio playback for review

### Technical Challenges

- Audio quality handling
- Transcription accuracy
- Pronunciation assessment limitations

### Scope Limits

- Pronunciation feedback is approximate (stated clearly to user)
- No real-time feedback during recording

### Success Criteria

- Recording works reliably on target browsers
- Transcription accuracy >90% for clear speech
- Feedback comparable to writing module quality

---

## Phase 4: Payment & Premium

**Goal:** Monetization infrastructure.

### Deliverables

- [ ] Stripe integration
- [ ] Subscription plans (monthly, annual)
- [ ] Payment flow
- [ ] Premium feature gating
- [ ] Billing management
- [ ] Usage dashboard for premium users

### Pricing Strategy (Initial)

- Free: 3 writing + 3 speaking evaluations/month, limited content
- Premium: ~$15-20/month, unlimited evaluations\*, full content

\*Subject to fair use (e.g., 50/day cap)

### Success Criteria

- Payment flow completes without errors
- Subscription status correctly gates features
- Billing portal allows plan changes and cancellation

---

## Phase 5: Task 1 & General Training

**Goal:** Complete writing coverage.

### Deliverables

- [ ] Task 1 Academic (charts, graphs, diagrams, maps, processes)
- [ ] Task 1 General Training (letters)
- [ ] Task 2 General Training prompts
- [ ] Updated prompts for each task type
- [ ] Content library expansion

### Success Criteria

- All IELTS writing task types supported
- Prompts calibrated for each task type
- Content library has minimum 20 items per type

---

## Phase 6: Study Plans

**Goal:** Personalized preparation paths.

### Deliverables

- [ ] Diagnostic assessment (band estimation per module)
- [ ] Target band input
- [ ] Test date input
- [ ] AI-generated study plan
- [ ] Daily/weekly task recommendations
- [ ] Progress tracking
- [ ] Plan adaptation based on performance

### Success Criteria

- Plans are specific and actionable
- Recommendations adapt to user progress
- Users report plans are helpful (qualitative feedback)

---

## Phase 7: Mobile Apps

**Goal:** Native mobile experience.

### Deliverables

- [ ] React Native app (iOS + Android)
- [ ] Feature parity with web (core features)
- [ ] Native audio recording
- [ ] Push notifications for study reminders
- [ ] App store submissions

### Scope Limits

- Offline mode deferred to Phase 8

### Success Criteria

- App approved by both app stores
- Core user journeys work natively
- Audio recording quality matches or exceeds web

---

## Phase 8: Polish & Scale

**Goal:** Production hardening and growth features.

### Deliverables

- [ ] Offline mode for practice content
- [ ] Performance optimization
- [ ] Advanced analytics dashboard
- [ ] Referral system
- [ ] Localization (UI in multiple languages)
- [ ] Enhanced accessibility
- [ ] Load testing and scaling

---

## Future Considerations (Post v1)

These are explicitly deferred beyond v1:

- Live tutor marketplace
- Group study features
- Mock test mode (full timed test simulation)
- Writing improvement over time tracking
- Community features
- Enterprise/school licensing
- API for third parties

---

## Release Versioning

| Version | Phase | Description          |
| ------- | ----- | -------------------- |
| 0.1.0   | 0     | Foundation complete  |
| 0.2.0   | 1     | MVP — Writing module |
| 0.3.0   | 2     | Reading & Listening  |
| 0.4.0   | 3     | Speaking module      |
| 0.5.0   | 4     | Payment & Premium    |
| 0.6.0   | 5     | Task 1 & GT          |
| 0.7.0   | 6     | Study Plans          |
| 0.8.0   | 7     | Mobile Apps          |
| 1.0.0   | 8     | Production release   |
