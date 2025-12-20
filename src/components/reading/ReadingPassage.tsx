'use client';

interface ReadingPassageProps {
  title: string;
  passage: string;
}

export function ReadingPassage({ title, passage }: ReadingPassageProps) {
  // Split passage into paragraphs
  const paragraphs = passage.split('\n\n').filter((p) => p.trim());

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="sticky top-0 border-b border-gray-100 bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-4">
        <div className="prose prose-gray max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
