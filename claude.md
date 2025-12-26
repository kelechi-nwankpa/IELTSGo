# IELTSGo — Project Constitution

This document defines the intent, constraints, and principles for IELTSGo. It is the source of truth for all development decisions and AI interactions.

---

## Vision

IELTSGo is an AI-powered IELTS preparation platform that provides instant, examiner-style feedback on Writing and Speaking tasks, combined with traditional practice for Reading and Listening.

**Core value proposition:** All-in-one IELTS prep with instant, examiner-style AI feedback — accessible, affordable, and aligned with official band descriptors.

---

## Target Users

- IELTS candidates aged 16+
- Both Academic and General Training test takers
- Band targets: 4.5 to 8+
- Self-study learners without access to tutors
- Cost-conscious users in emerging markets

---

## Non-Goals

These are explicitly out of scope:

- **Not a general English learning app.** All features must be IELTS-specific.
- **No claims of official IELTS scoring.** We provide band _estimates_, not certifications.
- **No live tutors at MVP.** Future consideration only.
- **No copyrighted IELTS material.** All practice content must be original or licensed.
- **No Cambridge/British Council affiliation.** Always disclaim this clearly.

---

## Module Intent

### Writing Module (Premium)

- Supports IELTS Task 1 (Academic: charts/graphs, GT: letters) and Task 2 (essays)
- AI evaluates against the four official criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy
- Outputs band estimates per criterion + overall band
- Provides specific, actionable feedback with examples
- Structured JSON output for frontend consumption

### Speaking Module (Premium)

- User records spoken responses to IELTS-style prompts (Parts 1, 2, 3)
- Speech-to-text transcription followed by AI evaluation
- Evaluates: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation (approximate)
- Computes speaking metrics: words per minute, filler word count, repetition ratio
- Structured JSON output

### Reading Module (Free + Premium)

- Auto-scored via answer key matching — no AI scoring
- AI used only for explanation requests (why an answer is correct/incorrect)
- Free tier: limited passages; Premium: full access

### Listening Module (Free + Premium)

- Auto-scored via answer key matching — no AI scoring
- AI used only for explanation requests
- Free tier: limited; Premium: full access

### Study Plan Module (Premium)

- AI generates personalized study plans based on diagnostic results and target band
- Weekly/daily task recommendations
- Adapts based on practice history

---

## AI Philosophy

### Role of AI

AI is a feedback tool, not a tutor replacement. It evaluates, explains, and suggests — it does not teach fundamentals.

### Calibration

All AI outputs must align with public IELTS band descriptors. Feedback must be actionable, not generic.

### Honesty

- Never claim certainty about exact band scores
- Use language like "estimated band," "approximately," "likely in the range of"
- Acknowledge limitations (e.g., pronunciation assessment is approximate)

### Consistency

- Use structured prompts with explicit output schemas
- Version all prompts; changes require review
- Test prompts against reference samples before deployment

---

## Cost Rules

AI usage must be economically sustainable. See `/docs/ai-cost-strategy.md` for details.

**Key principles:**

1. **No AI for objective scoring.** Reading and Listening are scored programmatically.
2. **Tiered access.** Free users get limited AI evaluations; premium gets more.
3. **Cache aggressively.** Explanation requests for the same question should be cached.
4. **Batch where possible.** Combine multiple evaluation requests when latency allows.
5. **Rate limit.** Hard caps per user per day, even for premium.
6. **Model tiering.** Use cheaper models for simple tasks; reserve expensive models for complex evaluation.

---

## Quality Bar

### Code

- TypeScript everywhere (frontend and backend)
- Strict typing; no `any` unless absolutely necessary
- Tests for business logic and AI prompt outputs
- Mobile-first responsive design

### Content

- All practice questions must be original or licensed
- Band score feedback must reference specific text from user's response
- No vague feedback like "improve your vocabulary"

### UX

- Feedback delivered in under 30 seconds
- Clear progress tracking
- Offline mode for reading/listening practice (future)

---

## Claude's Role

When working in this repository, Claude should:

1. **Respect this constitution.** All suggestions must align with stated goals and constraints.
2. **ALWAYS read `/docs/features.md` first.** This is the authoritative feature tracker with all phases (0-9). Before starting any work, read this file to understand what's built, what's in progress, and what's next. Update checkboxes as features are completed.
3. **Refer to `/ai/prompts/`** for current prompt implementations.
4. **Check `/docs/roadmap.md`** before proposing new features.
5. **Enforce cost rules** when designing AI features.
6. **Maintain structured outputs.** All AI responses must be parseable JSON where specified.
7. **Flag scope creep.** If a request contradicts non-goals, say so.
8. **Update `/docs/features.md`** when completing features. Mark items `[x]` when done, `[~]` when in progress.

---

## File Structure Reference

```
/
├── claude.md              # This file — project constitution
├── README.md              # Public-facing overview
├── /docs
│   ├── architecture.md    # System & AI architecture
│   ├── roadmap.md         # MVP → v1 roadmap
│   └── ai-cost-strategy.md
├── /ai
│   ├── README.md          # Prompt management guide
│   └── /prompts           # All AI system prompts
└── /src                   # Application source code
```

---

## Versioning

This document is versioned with the repository. Major changes require explicit review.

**Current version:** 1.0.0
**Last updated:** 2025-01
