'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { diagnosticQuestions, type DiagnosticQuestion } from '@/lib/diagnostic-questions';

type Module = 'listening' | 'reading' | 'writing' | 'speaking';

interface Answer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [currentModule, setCurrentModule] = useState<Module>('listening');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<Module, Answer[]>>({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules: Module[] = ['listening', 'reading', 'writing', 'speaking'];
  const currentModuleIndex = modules.indexOf(currentModule);
  const questions = diagnosticQuestions[currentModule];
  const currentQuestion = questions[currentQuestionIndex];

  // Reset timer when question changes
  useEffect(() => {
    setStartTime(Date.now());
    setCurrentAnswer('');
  }, [currentQuestionIndex, currentModule]);

  const handleAnswer = () => {
    if (!currentAnswer.trim()) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      timeSpent,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentModule]: [...prev[currentModule], newAnswer],
    }));

    // Move to next question or module
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      // Move to next module
      setCurrentModule(modules[currentModuleIndex + 1]);
      setCurrentQuestionIndex(0);
    } else {
      // All done - submit
      submitDiagnostic();
    }
  };

  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModule(modules[currentModuleIndex + 1]);
      setCurrentQuestionIndex(0);
    } else {
      submitDiagnostic();
    }
  };

  const submitDiagnostic = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate estimated bands based on answers
      const estimatedBands = calculateBands(answers);

      // Save to database
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          estimatedBands,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save diagnostic results');
      }

      // Redirect to setup with diagnostic data
      router.push(
        `/study-plan/setup?diagnostic=true&l=${estimatedBands.listening}&r=${estimatedBands.reading}&w=${estimatedBands.writing}&s=${estimatedBands.speaking}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const calculateBands = (allAnswers: Record<Module, Answer[]>): Record<Module, number> => {
    const result: Record<Module, number> = {
      listening: 5.5,
      reading: 5.5,
      writing: 5.5,
      speaking: 5.5,
    };

    for (const mod of modules) {
      const moduleAnswers = allAnswers[mod];
      if (moduleAnswers.length === 0) continue;

      let correctCount = 0;
      let totalDifficulty = 0;

      moduleAnswers.forEach((ans) => {
        const question = diagnosticQuestions[mod].find((q) => q.id === ans.questionId);
        if (!question) return;

        totalDifficulty += question.difficulty;

        // Check if answer is correct
        if (question.correctAnswer) {
          const correct = Array.isArray(question.correctAnswer)
            ? question.correctAnswer.some(
                (c) => c.toLowerCase() === String(ans.answer).toLowerCase()
              )
            : String(question.correctAnswer).toLowerCase() === String(ans.answer).toLowerCase();
          if (correct) correctCount++;
        }
      });

      // Calculate band based on accuracy and average difficulty
      const avgDifficulty = totalDifficulty / moduleAnswers.length;
      const accuracy = correctCount / moduleAnswers.length;

      // Simple band estimation
      let estimatedBand = avgDifficulty * accuracy + 4 * (1 - accuracy);
      estimatedBand = Math.round(estimatedBand * 2) / 2; // Round to nearest 0.5
      estimatedBand = Math.max(4, Math.min(9, estimatedBand));

      result[mod] = estimatedBand;
    }

    return result;
  };

  const progress =
    (currentModuleIndex * questions.length + currentQuestionIndex + 1) / (modules.length * 15); // Approximate

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/study-plan/setup"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Setup
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Diagnostic Assessment</h1>
          <p className="mt-1 text-slate-600">
            Answer questions to help us assess your current level
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 capitalize">{currentModule}</span>
            <span className="text-slate-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            {modules.map((mod, idx) => (
              <span
                key={mod}
                className={idx <= currentModuleIndex ? 'font-medium text-blue-600' : ''}
              >
                {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

          <QuestionDisplay
            question={currentQuestion}
            answer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
          />

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={skipQuestion}
              className="text-sm text-slate-500 hover:text-slate-700"
              disabled={loading}
            >
              Skip this question
            </button>
            <button
              onClick={handleAnswer}
              disabled={!currentAnswer.trim() || loading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Next'}
            </button>
          </div>
        </div>

        {/* Quick Exit */}
        <div className="mt-6 text-center">
          <button
            onClick={submitDiagnostic}
            className="text-sm text-slate-500 hover:text-slate-700"
            disabled={loading}
          >
            Skip remaining and submit with current answers
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionDisplay({
  question,
  answer,
  onAnswerChange,
}: {
  question: DiagnosticQuestion;
  answer: string;
  onAnswerChange: (value: string) => void;
}) {
  return (
    <div>
      {/* Passage if present */}
      {question.passage && (
        <div className="mb-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          {question.passage}
        </div>
      )}

      {/* Question */}
      <h3 className="mb-4 text-lg font-medium text-slate-900">{question.question}</h3>

      {/* Answer input based on question type */}
      {question.options ? (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                answer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answer === option}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      ) : question.type.includes('task') ? (
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write your response here..."
          className="h-48 w-full rounded-lg border border-slate-300 p-4 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
      )}

      {/* Time limit indicator */}
      {question.timeLimit && (
        <p className="mt-3 text-sm text-slate-500">
          Suggested time:{' '}
          {question.timeLimit >= 60
            ? `${Math.floor(question.timeLimit / 60)} min`
            : `${question.timeLimit} sec`}
        </p>
      )}
    </div>
  );
}
