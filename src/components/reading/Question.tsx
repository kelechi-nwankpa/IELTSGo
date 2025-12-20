'use client';

export interface QuestionData {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
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
}: QuestionProps) {
  const handleChange = (newValue: string | string[]) => {
    onChange(question.id, newValue);
  };

  const getResultStyles = () => {
    if (!showResult) return '';
    return isCorrect
      ? 'border-green-300 bg-green-50'
      : 'border-red-300 bg-red-50';
  };

  return (
    <div className={`rounded-lg border p-4 ${showResult ? getResultStyles() : 'border-gray-200 bg-white'}`}>
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
        <div className="mt-3 flex items-center gap-2">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Correct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Incorrect - Answer: {Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer}
            </span>
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
            <span key={i} className="rounded bg-white px-2 py-1 text-sm text-gray-700 border border-gray-200">
              {opt}
            </span>
          ))}
        </div>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 min-w-[100px]">{item}:</span>
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
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${wordCount > maxWords ? 'text-red-500' : 'text-gray-400'}`}>
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
