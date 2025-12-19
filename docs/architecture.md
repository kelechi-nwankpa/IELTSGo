# Architecture

This document describes the system architecture for IELTSGo.

---

## Overview

IELTSGo is a full-stack application with:
- Web frontend (React/Next.js)
- Mobile apps (React Native)
- Backend API (Node.js/Express or Next.js API routes)
- AI integration layer
- PostgreSQL database
- Redis cache
- Object storage for audio/media

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Web (Next.js) │  iOS (RN)       │  Android (RN)               │
└────────┬────────┴────────┬────────┴────────┬────────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Backend                       │
│                     (Next.js API Routes)                         │
├─────────────────────────────────────────────────────────────────┤
│  Auth  │  Users  │  Practice  │  Evaluation  │  Study Plans     │
└────┬───┴────┬────┴─────┬──────┴──────┬───────┴────────┬─────────┘
     │        │          │             │                │
     ▼        ▼          ▼             ▼                ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐
│ Auth    │ │ Postgres│ │ Object   │ │ AI Service  │ │ Redis    │
│ Provider│ │ DB      │ │ Storage  │ │ Layer       │ │ Cache    │
└─────────┘ └─────────┘ └──────────┘ └──────┬──────┘ └──────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        ▼                   ▼                   ▼
                   ┌─────────┐        ┌─────────┐        ┌─────────┐
                   │ Claude  │        │ Whisper │        │ Cache   │
                   │ API     │        │ (STT)   │        │ Layer   │
                   └─────────┘        └─────────┘        └─────────┘
```

---

## Frontend Architecture

### Web (Next.js 14+)
- App Router with Server Components
- Client components for interactive features
- Tailwind CSS for styling
- Responsive design (mobile-first)

### Mobile (React Native)
- Shared business logic with web where possible
- Native audio recording
- Offline-first for practice content

### Key UI Components
- Writing editor with word count and timer
- Audio recorder with waveform visualization
- Reading passage viewer with highlighting
- Progress dashboard with charts

---

## Backend Architecture

### API Design
- RESTful endpoints
- JSON request/response
- JWT authentication
- Rate limiting per user tier

### Core Services

**Auth Service**
- Email/password registration
- Social login (Google, Apple)
- Session management
- Password reset

**User Service**
- Profile management
- Subscription status
- Usage tracking
- Preferences

**Practice Service**
- Content delivery (questions, passages, audio)
- Session management
- Progress tracking
- Answer submission and scoring (non-AI)

**Evaluation Service**
- AI evaluation orchestration
- Quota management
- Result storage
- Feedback formatting

**Study Plan Service**
- Diagnostic assessment
- Plan generation
- Task scheduling
- Adaptation based on progress

---

## AI Architecture

### AI Service Layer
Abstraction layer between application and AI providers.

```
┌─────────────────────────────────────────────┐
│              AI Service Layer               │
├─────────────────────────────────────────────┤
│  - Request validation                       │
│  - Quota checking                           │
│  - Cache lookup                             │
│  - Provider routing                         │
│  - Response parsing                         │
│  - Error handling                           │
│  - Usage logging                            │
└─────────────────────────────────────────────┘
```

### Provider Strategy
- Primary: Claude API (Anthropic)
- Speech-to-text: Whisper API (OpenAI) or local Whisper
- Fallback: OpenAI GPT-4 for evaluation (if Claude unavailable)

### Model Selection by Task

| Task | Model | Rationale |
|------|-------|-----------|
| Writing evaluation | Claude Sonnet | Balance of quality and cost |
| Speaking evaluation | Claude Sonnet | Needs nuanced feedback |
| Reading explanation | Claude Haiku | Simpler task, cost-sensitive |
| Listening explanation | Claude Haiku | Simpler task, cost-sensitive |
| Study plan generation | Claude Sonnet | Requires reasoning |

### Prompt Management
- Prompts stored in `/ai/prompts/` as markdown
- Version controlled
- Loaded at runtime
- A/B testing support (future)

---

## Data Architecture

### PostgreSQL Schema (Core Tables)

```
users
├── id (uuid, pk)
├── email (unique)
├── password_hash
├── name
├── target_band
├── test_date
├── test_type (academic/general)
├── subscription_tier
├── created_at
└── updated_at

practice_sessions
├── id (uuid, pk)
├── user_id (fk)
├── module (writing/speaking/reading/listening)
├── content_id (fk)
├── started_at
├── completed_at
├── score (for reading/listening)
└── submission_data (jsonb)

evaluations
├── id (uuid, pk)
├── user_id (fk)
├── session_id (fk)
├── module (writing/speaking)
├── prompt_version
├── input_text
├── ai_response (jsonb)
├── band_estimate
├── created_at
└── tokens_used

content
├── id (uuid, pk)
├── module
├── type (task1/task2/part1/part2/etc)
├── test_type (academic/general/both)
├── difficulty_band
├── content_data (jsonb)
├── answers (jsonb, for reading/listening)
└── is_premium

usage_quota
├── user_id (fk)
├── period_start
├── writing_evaluations_used
├── speaking_evaluations_used
├── explanations_used
└── updated_at
```

### Redis Cache Strategy

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `explanation:{content_id}:{question_id}` | 7 days | Cache AI explanations |
| `user:{id}:quota` | 1 hour | Quota lookup cache |
| `session:{id}` | 24 hours | Active session data |
| `content:{id}` | 1 day | Content delivery cache |

---

## Security

### Authentication
- JWT tokens with short expiry (15 min)
- Refresh tokens (7 days)
- Secure HTTP-only cookies

### Data Protection
- Passwords hashed with bcrypt
- PII encrypted at rest
- TLS for all connections
- Audio files encrypted in storage

### Rate Limiting
- API: 100 requests/minute per user
- AI evaluation: Per tier limits (see cost strategy)
- Auth endpoints: Stricter limits

---

## Infrastructure (Recommended)

### Hosting
- Vercel for Next.js frontend
- Railway or Render for backend services
- Supabase or Neon for PostgreSQL
- Upstash for Redis
- Cloudflare R2 for object storage

### Scaling Considerations
- Stateless backend for horizontal scaling
- Database connection pooling
- CDN for static content
- Queue for async AI processing (future)

---

## Monitoring

### Application Metrics
- Request latency (p50, p95, p99)
- Error rates by endpoint
- AI evaluation duration
- Cache hit rates

### Business Metrics
- Daily active users
- Evaluations per user
- Conversion rate (free to premium)
- AI cost per user

### Alerting
- Error rate spikes
- AI API failures
- Quota system issues
- Database connection issues

---

## Future Considerations

- WebSocket for real-time features
- Background job queue (Bull/BullMQ)
- Multi-region deployment
- Offline sync for mobile
- CDN for audio content
