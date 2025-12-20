'use client';

interface WritingPromptProps {
  title: string;
  prompt: string;
  topic?: string;
  taskType?: string;
}

export function WritingPrompt({ title, prompt, topic, taskType = 'Task 2' }: WritingPromptProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          {taskType}
        </span>
        {topic && (
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 capitalize">
            {topic}
          </span>
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>

      <div className="prose prose-sm max-w-none">
        <p className="leading-relaxed whitespace-pre-line text-gray-700">{prompt}</p>
      </div>
    </div>
  );
}
