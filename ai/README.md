# AI Prompts

This directory contains all AI system prompts used in IELTSGo.

---

## Directory Structure

```
/ai
├── README.md           # This file
└── /prompts
    ├── writing-eval.md     # Writing Task 1 & 2 evaluation
    ├── speaking-eval.md    # Speaking Parts 1, 2, 3 evaluation
    ├── reading-explain.md  # Reading answer explanations
    ├── listening-explain.md # Listening answer explanations
    └── study-plan.md       # Personalized study plan generation
```

---

## Prompt Design Principles

### 1. Structured Output

All prompts must specify JSON output format. This enables:

- Reliable parsing
- Consistent UI rendering
- Type safety in application code

### 2. Band Descriptor Alignment

Writing and Speaking evaluations must align with official IELTS band descriptors:

- Task Achievement / Response
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy
- (Speaking) Fluency and Coherence, Pronunciation

### 3. Specificity Over Generality

Feedback must reference the user's actual content:

- Quote specific phrases
- Point to specific paragraphs/sentences
- Give concrete examples of improvements

### 4. Honest Uncertainty

Never claim certainty about band scores:

- Use "estimated band," "approximately," "likely range"
- Acknowledge limitations (especially pronunciation)
- Note that actual IELTS scoring may differ

### 5. Actionable Feedback

Every piece of feedback should suggest a concrete action:

- Bad: "Improve your vocabulary"
- Good: "Replace 'good' in paragraph 2 with more precise alternatives like 'beneficial,' 'advantageous,' or 'favorable'"

---

## Prompt Versioning

Each prompt file includes a version number. When modifying prompts:

1. Increment the version number
2. Document the change in the prompt file's changelog
3. Test against reference samples
4. Update any cached responses that depend on the prompt

### Version Format

`MAJOR.MINOR.PATCH`

- MAJOR: Significant output format changes
- MINOR: Logic or criteria changes
- PATCH: Wording improvements, bug fixes

---

## Prompt Loading

Prompts are loaded at application startup:

```typescript
// Pseudocode
const prompts = {
  writingEval: loadPrompt('writing-eval.md'),
  speakingEval: loadPrompt('speaking-eval.md'),
  readingExplain: loadPrompt('reading-explain.md'),
  listeningExplain: loadPrompt('listening-explain.md'),
  studyPlan: loadPrompt('study-plan.md'),
};
```

Runtime variables are injected using template syntax: `{{variable_name}}`

---

## Testing Prompts

Before deploying prompt changes:

1. **Unit tests:** Verify output parses correctly
2. **Reference samples:** Test against known-quality submissions
3. **Band calibration:** Compare AI bands to expert-scored samples
4. **Edge cases:** Empty input, very short, very long, off-topic

### Reference Sample Categories

- Band 5 (borderline)
- Band 6 (competent)
- Band 7 (good)
- Band 8+ (very good/expert)

---

## Model Assignment

| Prompt            | Model         | Rationale                              |
| ----------------- | ------------- | -------------------------------------- |
| writing-eval      | Claude Sonnet | Complex evaluation, needs nuance       |
| speaking-eval     | Claude Sonnet | Complex evaluation, needs nuance       |
| reading-explain   | Claude Haiku  | Simpler task, cost-sensitive           |
| listening-explain | Claude Haiku  | Simpler task, cost-sensitive           |
| study-plan        | Claude Sonnet | Requires reasoning about user progress |

---

## Security Notes

- Never include user PII in prompts beyond what's necessary for evaluation
- Never log full prompt + response in production (token counts only)
- Sanitize user input before injection into prompts
- Validate output structure before trusting

---

## Adding New Prompts

1. Create new `.md` file in `/prompts`
2. Follow existing structure (metadata, system prompt, output schema)
3. Add to this README's directory structure
4. Implement loader in application code
5. Add tests
6. Document model assignment and cost implications
