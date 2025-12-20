'use client';

import { useState } from 'react';

export interface QuestionData {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

export interface ExplanationData {
  explanation: string;
  passage_reference: {
    paragraph: number | null;
    key_text: string;
  };
  skill_tested: string;
  common_mistake: string | null;
  tip: string;
  why_incorrect?: string;
}

interface QuestionProps {
  question: QuestionData;
  questionNumber: number;
  value: string | string[];
  onChange: (questionId: string, value: string | string[]) => void;
  disabled?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | string[];
  // For AI explanation feature
  passageId?: string;
  passageTitle?: string;
  passageText?: string;
}

export function Question({
  question,
  questionNumber,
  value,
  onChange,
  disabled = false,
  showResult = false,
  isCorrect,
  correctAnswer,
  passageId,
  passageTitle,
  passageText,
}: QuestionProps) {
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  const handleChange = (newValue: string | string[]) => {
    onChange(question.id, newValue);
  };

  const getResultStyles = () => {
    if (!showResult) return '';
    return isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50';
  };

  const fetchExplanation = async () => {
    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }

    if (!passageId || !passageText) {
      setExplanationError('Missing passage data for explanation');
      return;
    }

    setIsLoadingExplanation(true);
    setExplanationError(null);

    try {
      const response = await fetch('/api/reading/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageId,
          passageTitle: passageTitle || 'Reading Passage',
          passageText,
          questionId: question.id,
          questionType: question.type,
          questionNumber,
          questionText: question.text,
          correctAnswer: Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer,
          studentAnswer: Array.isArray(value) ? value.join(', ') : value,
          wasCorrect: isCorrect,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data = await response.json();
      setExplanation(data);
      setShowExplanation(true);
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : 'Failed to get explanation');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${showResult ? getResultStyles() : 'border-gray-200 bg-white'}`}
    >
      <div className="mb-3 flex items-start gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
          {questionNumber}
        </span>
        <p className="text-gray-800">{question.text}</p>
      </div>

      {question.type === 'multiple_choice' && (
        <MultipleChoiceInput
          options={question.options || []}
          value={value as string}
          onChange={(v) => handleChange(v)}
          disabled={disabled}
          showResult={showResult}
          isCorrect={isCorrect}
          correctAnswer={correctAnswer as string}
        />
      )}

      {question.type === 'true_false_ng' && (
        <TrueFalseInput
          value={value as string}
          onChange={(v) => handleChange(v)}
          disabled={disabled}
          showResult={showResult}
          isCorrect={isCorrect}
          correctAnswer={correctAnswer as string}
        />
      )}

      {question.type === 'matching' && (
        <MatchingInput
          items={question.items || []}
          options={question.options || []}
          value={value as string[]}
          onChange={(v) => handleChange(v)}
          disabled={disabled}
        />
      )}

      {question.type === 'short_answer' && (
        <ShortAnswerInput
          value={value as string}
          onChange={(v) => handleChange(v)}
          maxWords={question.maxWords || 3}
          disabled={disabled}
          showResult={showResult}
          correctAnswer={correctAnswer as string}
        />
      )}

      {showResult && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Correct
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Incorrect - Answer:{' '}
                  {Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer}
                </span>
              )}
            </div>

            {passageId && passageText && (
              <button
                onClick={fetchExplanation}
                disabled={isLoadingExplanation}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
              >
                {isLoadingExplanation ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Explaining...
                  </>
                ) : showExplanation ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Hide Explanation
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Explain
                  </>
                )}
              </button>
            )}
          </div>

          {/* Explanation Error */}
          {explanationError && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {explanationError}
            </div>
          )}

          {/* Explanation Panel */}
          {showExplanation && explanation && (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <div className="space-y-3">
                {/* Main explanation */}
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900">Explanation</h4>
                  <p className="mt-1 text-sm text-indigo-800">{explanation.explanation}</p>
                </div>

                {/* Why incorrect (if applicable) */}
                {explanation.why_incorrect && !isCorrect && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700">
                      Why Your Answer Is Incorrect
                    </h4>
                    <p className="mt-1 text-sm text-red-600">{explanation.why_incorrect}</p>
                  </div>
                )}

                {/* Passage reference */}
                {explanation.passage_reference?.key_text && (
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">Key Text from Passage</h4>
                    <blockquote className="mt-1 border-l-2 border-indigo-300 pl-3 text-sm text-indigo-700 italic">
                      &ldquo;{explanation.passage_reference.key_text}&rdquo;
                      {explanation.passage_reference.paragraph && (
                        <span className="text-indigo-500 not-italic">
                          {' '}
                          (Paragraph {explanation.passage_reference.paragraph})
                        </span>
                      )}
                    </blockquote>
                  </div>
                )}

                {/* Skill tested and tip */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/50 p-2">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase">
                      Skill Tested
                    </h4>
                    <p className="mt-0.5 text-sm text-indigo-800">{explanation.skill_tested}</p>
                  </div>
                  <div className="rounded-lg bg-white/50 p-2">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase">Tip</h4>
                    <p className="mt-0.5 text-sm text-indigo-800">{explanation.tip}</p>
                  </div>
                </div>

                {/* Common mistake */}
                {explanation.common_mistake && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                    <h4 className="text-xs font-semibold text-amber-700 uppercase">
                      Common Mistake
                    </h4>
                    <p className="mt-0.5 text-sm text-amber-800">{explanation.common_mistake}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Multiple Choice Input
function MultipleChoiceInput({
  options,
  value,
  onChange,
  disabled,
  showResult,
  isCorrect,
  correctAnswer,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  showResult: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
}) {
  return (
    <div className="space-y-2 pl-8">
      {options.map((option) => {
        const optionLetter = option.charAt(0);
        const isSelected = value === optionLetter;
        const isCorrectOption = showResult && correctAnswer === optionLetter;
        const isWrongSelection = showResult && isSelected && !isCorrect;

        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50'
            } ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} ${
              isCorrectOption ? 'border-green-400 bg-green-50' : ''
            } ${isWrongSelection ? 'border-red-400 bg-red-50' : ''}`}
          >
            <input
              type="radio"
              name={`mc-${options[0]}`}
              value={optionLetter}
              checked={isSelected}
              onChange={() => onChange(optionLetter)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

// True/False/Not Given Input
function TrueFalseInput({
  value,
  onChange,
  disabled,
  showResult,
  isCorrect,
  correctAnswer,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  showResult: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
}) {
  const options = ['TRUE', 'FALSE', 'NOT GIVEN'];

  return (
    <div className="flex gap-2 pl-8">
      {options.map((option) => {
        const isSelected = value?.toUpperCase() === option;
        const isCorrectOption = showResult && correctAnswer?.toUpperCase() === option;
        const isWrongSelection = showResult && isSelected && !isCorrect;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50'
            } ${isSelected ? 'border-blue-400 bg-blue-100 text-blue-700' : 'border-gray-200 text-gray-700'} ${
              isCorrectOption ? 'border-green-400 bg-green-100 text-green-700' : ''
            } ${isWrongSelection ? 'border-red-400 bg-red-100 text-red-700' : ''}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// Matching Input
function MatchingInput({
  items,
  options,
  value,
  onChange,
  disabled,
}: {
  items: string[];
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}) {
  const handleItemChange = (index: number, selectedOption: string) => {
    const newValue = [...(value || Array(items.length).fill(''))];
    newValue[index] = selectedOption;
    onChange(newValue);
  };

  return (
    <div className="space-y-3 pl-8">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase">Options:</p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <span
              key={i}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
            >
              {opt}
            </span>
          ))}
        </div>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="min-w-[100px] text-sm text-gray-600">{item}:</span>
          <select
            value={value?.[index] || ''}
            onChange={(e) => handleItemChange(index, e.target.value)}
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {options.map((opt, i) => {
              const romanNumeral = opt.split('.')[0];
              return (
                <option key={i} value={romanNumeral}>
                  {opt}
                </option>
              );
            })}
          </select>
        </div>
      ))}
    </div>
  );
}

// Short Answer Input
function ShortAnswerInput({
  value,
  onChange,
  maxWords,
  disabled,
  showResult,
  correctAnswer,
}: {
  value: string;
  onChange: (value: string) => void;
  maxWords: number;
  disabled: boolean;
  showResult: boolean;
  correctAnswer?: string;
}) {
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="pl-8">
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Answer (max ${maxWords} words)`}
          className={`w-full rounded-lg border px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
            disabled ? 'cursor-not-allowed bg-gray-50' : 'bg-white'
          } ${wordCount > maxWords ? 'border-red-300' : 'border-gray-300'}`}
        />
        <span
          className={`absolute top-1/2 right-3 -translate-y-1/2 text-xs ${wordCount > maxWords ? 'text-red-500' : 'text-gray-400'}`}
        >
          {wordCount}/{maxWords}
        </span>
      </div>
      {showResult && correctAnswer && (
        <p className="mt-1 text-sm text-gray-500">
          Accepted answer: <span className="font-medium">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
}
