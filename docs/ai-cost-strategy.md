# AI Cost Strategy

This document defines how IELTSGo manages AI costs while maintaining quality.

---

## Cost Principles

1. **AI is expensive.** Every API call has a direct cost. Treat tokens like money.
2. **Not everything needs AI.** Use deterministic scoring where possible.
3. **Cache everything cacheable.** Identical inputs should not trigger new API calls.
4. **Tier access.** Free users subsidized by premium; enforce limits strictly.
5. **Right-size models.** Use the cheapest model that achieves acceptable quality.

---

## Target: 60-80% Cost Reduction

Compared to naive "call AI for everything" approach.

### Cost Reduction Levers

| Lever                               | Estimated Savings | Implementation                                |
| ----------------------------------- | ----------------- | --------------------------------------------- |
| No AI for reading/listening scoring | 30-40%            | Deterministic answer matching                 |
| Explanation caching                 | 15-20%            | Redis cache with 7-day TTL                    |
| Model tiering                       | 10-15%            | Haiku for explanations, Sonnet for evaluation |
| Request batching                    | 5-10%             | Combine multiple evaluations where possible   |
| Quota enforcement                   | Variable          | Hard caps prevent runaway costs               |

---

## AI Usage by Feature

### Writing Evaluation

- **AI Required:** Yes
- **Model:** Claude Sonnet
- **Estimated tokens per call:** 2,000-4,000 (input + output)
- **Caching:** Not cacheable (unique user content)
- **Optimization:** Prompt efficiency, structured output

### Speaking Evaluation

- **AI Required:** Yes (two stages)
- **Stage 1:** Whisper STT (~$0.006/minute of audio)
- **Stage 2:** Claude Sonnet for evaluation
- **Estimated tokens per call:** 1,500-3,000
- **Caching:** Not cacheable
- **Optimization:** Prompt efficiency, structured output

### Reading Explanation

- **AI Required:** Only for explanations
- **Model:** Claude Haiku
- **Estimated tokens per call:** 500-1,000
- **Caching:** Highly cacheable (same question = same explanation)
- **Cache key:** `explanation:reading:{content_id}:{question_id}`

### Listening Explanation

- **AI Required:** Only for explanations
- **Model:** Claude Haiku
- **Estimated tokens per call:** 500-1,000
- **Caching:** Highly cacheable
- **Cache key:** `explanation:listening:{content_id}:{question_id}`

### Study Plan Generation

- **AI Required:** Yes
- **Model:** Claude Sonnet
- **Estimated tokens per call:** 1,500-2,500
- **Caching:** Partially cacheable (cache plan templates, personalize at edges)
- **Frequency:** Once per diagnostic, updated on significant progress

---

## Quota System

### Free Tier Limits (Monthly)

- Writing evaluations: 3
- Speaking evaluations: 3
- Explanations: 20
- Study plan: 1 (basic)

### Premium Tier Limits (Monthly)

- Writing evaluations: 100 (soft cap, alert at 80)
- Speaking evaluations: 100 (soft cap, alert at 80)
- Explanations: Unlimited (but rate-limited)
- Study plan: Unlimited regeneration

### Daily Caps (All Tiers)

Even premium users have daily caps to prevent abuse:

- Writing: 20/day
- Speaking: 20/day
- Explanations: 100/day

### Enforcement

```
On evaluation request:
1. Check daily cap → 429 if exceeded
2. Check monthly quota → 402 Payment Required if exceeded (free) or warning (premium)
3. Process request
4. Increment counters (atomic)
5. Log usage for billing/analytics
```

---

## Caching Strategy

### Explanation Cache

Explanations for reading/listening questions are deterministic — the same question always gets the same explanation.

```
Cache lookup flow:
1. Generate cache key: explanation:{module}:{content_id}:{question_id}
2. Check Redis
3. If hit → return cached response (no AI call)
4. If miss → call AI, cache response, return

Cache invalidation:
- TTL: 7 days
- Manual invalidation on prompt version change
- No user-specific data in cached explanations
```

**Expected cache hit rate:** 80%+ after initial population

### Response Caching (Future)

For identical writing submissions (e.g., sample essays for testing):

- Hash the input text
- Check cache before AI call
- Useful for demo/testing, minimal production impact

---

## Model Selection

### Decision Matrix

| Task              | Quality Need | Latency Need | Model Choice |
| ----------------- | ------------ | ------------ | ------------ |
| Writing eval      | High         | Medium       | Sonnet       |
| Speaking eval     | High         | Medium       | Sonnet       |
| Reading explain   | Medium       | Low          | Haiku        |
| Listening explain | Medium       | Low          | Haiku        |
| Study plan        | High         | Low          | Sonnet       |

### Cost Comparison (Approximate, per 1K tokens)

| Model         | Input    | Output   |
| ------------- | -------- | -------- |
| Claude Haiku  | $0.00025 | $0.00125 |
| Claude Sonnet | $0.003   | $0.015   |
| Claude Opus   | $0.015   | $0.075   |

**Strategy:** Never use Opus in production. Haiku for simple tasks, Sonnet for evaluation.

---

## Request Batching

### When Applicable

- Bulk explanation pre-generation for new content
- Multiple questions from same session (batch explanation request)

### Implementation

```
Batch explanation request:
- User requests explanations for questions 1, 3, 5
- Single AI call with all three questions
- Parse response, cache individually
- Return all explanations
```

### Latency Trade-off

Batching increases latency for first item but reduces total cost. Use for:

- Background jobs (pre-warming cache)
- End-of-session review (show all explanations)

Do not batch real-time evaluation requests.

---

## Cost Monitoring

### Metrics to Track

- Total AI spend (daily, weekly, monthly)
- Cost per evaluation by type
- Cost per user (free vs premium)
- Cache hit rate
- Token efficiency (output tokens / input tokens)

### Alerts

- Daily spend > 120% of expected
- Cache hit rate < 70%
- Average tokens per request > 150% of baseline
- Any Opus usage (should be zero)

### Dashboards

- Real-time spend tracker
- Cost breakdown by feature
- User-level cost analysis (for abuse detection)

---

## Cost Projections

### Per-User Monthly Cost (Estimated)

**Free User (using full quota):**

- 3 writing evals × $0.10 = $0.30
- 3 speaking evals × $0.12 = $0.36
- 20 explanations × $0.01 × 20% (cache miss) = $0.04
- **Total: ~$0.70/month**

**Active Premium User:**

- 30 writing evals × $0.10 = $3.00
- 20 speaking evals × $0.12 = $2.40
- 50 explanations × $0.01 × 20% = $0.10
- **Total: ~$5.50/month**

**Target margin:** Premium revenue ($15-20) should cover AI costs ($5-6) with healthy margin.

---

## Optimization Roadmap

### Phase 1 (MVP)

- Basic quota system
- No caching yet
- Manual cost monitoring

### Phase 2

- Explanation caching
- Automated cost alerts
- Usage dashboard

### Phase 3

- Request batching for explanations
- Prompt optimization (reduce token count)
- A/B test Haiku vs Sonnet for edge cases

### Phase 4

- Predictive quota management
- Dynamic model selection based on complexity
- Cost-per-user profiling

---

## Emergency Cost Controls

If costs spike unexpectedly:

1. **Immediate:** Reduce daily caps by 50%
2. **Short-term:** Disable explanation requests for free tier
3. **Medium-term:** Investigate cause, patch if abuse
4. **Last resort:** Temporarily disable AI features, show cached/static content

These controls should be toggleable via environment variables without deployment.
