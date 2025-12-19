'use client';

interface WritingPromptProps {
  title: string;
  prompt: string;
  topic?: string;
  taskType?: string;
}

export function WritingPrompt({ title, prompt, topic, taskType = 'Task 2' }: WritingPromptProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          {taskType}
        </span>
        {topic && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded capitalize">
            {topic}
          </span>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>

      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{prompt}</p>
      </div>
    </div>
  );
}
