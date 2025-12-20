'use client';

import { Question, QuestionData } from './Question';

interface QuestionResult {
  questionId: string;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  isCorrect: boolean;
}

interface QuestionListProps {
  questions: QuestionData[];
  answers: Record<string, string | string[]>;
  onAnswerChange: (questionId: string, value: string | string[]) => void;
  disabled?: boolean;
  results?: QuestionResult[];
  stickyHeader?: boolean;
}

export function QuestionList({
  questions,
  answers,
  onAnswerChange,
  disabled = false,
  results,
  stickyHeader = true,
}: QuestionListProps) {
  const showResults = !!results;

  const getResultForQuestion = (questionId: string) => {
    if (!results) return undefined;
    return results.find((r) => r.questionId === questionId);
  };

  return (
    <div className="space-y-4">
      <div className={stickyHeader ? "sticky top-0 z-10 border-b border-gray-100 bg-white px-1 py-3 lg:top-[57px]" : "border-b border-gray-100 px-1 py-3"}>
        <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
        {!showResults && (
          <p className="text-sm text-gray-500">
            Answer all {questions.length} questions based on the passage.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const result = getResultForQuestion(question.id);
          return (
            <Question
              key={question.id}
              question={question}
              questionNumber={index + 1}
              value={answers[question.id] || (question.type === 'matching' ? [] : '')}
              onChange={onAnswerChange}
              disabled={disabled || showResults}
              showResult={showResults}
              isCorrect={result?.isCorrect}
              correctAnswer={result?.correctAnswer}
            />
          );
        })}
      </div>
    </div>
  );
}
