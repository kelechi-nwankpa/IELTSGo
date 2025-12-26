'use client';

import Image from 'next/image';

interface WritingPromptProps {
  title: string;
  prompt: string;
  topic?: string;
  taskType?: string;
  imageUrl?: string;
  imageDescription?: string;
  letterType?: 'formal' | 'semi-formal' | 'informal';
}

export function WritingPrompt({
  title,
  prompt,
  topic,
  taskType = 'Task 2',
  imageUrl,
  imageDescription,
  letterType,
}: WritingPromptProps) {
  // Determine badge color based on task type
  const getBadgeColor = () => {
    if (taskType.includes('Task 1')) {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  // Get letter type badge color
  const getLetterTypeBadgeColor = () => {
    switch (letterType) {
      case 'formal':
        return 'bg-indigo-100 text-indigo-700';
      case 'semi-formal':
        return 'bg-teal-100 text-teal-700';
      case 'informal':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-1 text-xs font-medium ${getBadgeColor()}`}>
          {taskType}
        </span>
        {topic && (
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 capitalize">
            {topic}
          </span>
        )}
        {letterType && (
          <span className={`rounded px-2 py-1 text-xs font-medium ${getLetterTypeBadgeColor()}`}>
            {letterType} letter
          </span>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>

      {/* Image for Task 1 Academic (charts, graphs, maps, processes) */}
      {imageUrl && (
        <div className="my-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="relative mx-auto aspect-4/3 max-w-150">
            <Image
              src={imageUrl}
              alt={imageDescription || 'Task 1 visual prompt'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
          {imageDescription && (
            <p className="mt-2 text-center text-xs text-gray-500 italic">{imageDescription}</p>
          )}
        </div>
      )}

      <div className="prose prose-sm max-w-none">
        <p className="leading-relaxed whitespace-pre-line text-gray-700">{prompt}</p>
      </div>
    </div>
  );
}
