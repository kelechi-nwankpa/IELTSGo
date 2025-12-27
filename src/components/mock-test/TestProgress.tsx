'use client';

interface Section {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'LISTENING', name: 'Listening', icon: '🎧', color: 'blue' },
  { id: 'READING', name: 'Reading', icon: '📖', color: 'green' },
  { id: 'WRITING', name: 'Writing', icon: '✍️', color: 'purple' },
  { id: 'SPEAKING', name: 'Speaking', icon: '🎤', color: 'amber' },
];

interface TestProgressProps {
  currentSection: string | null;
  completedSections: string[];
  className?: string;
  compact?: boolean;
}

export function TestProgress({
  currentSection,
  completedSections,
  className = '',
  compact = false,
}: TestProgressProps) {
  const getStatus = (sectionId: string): 'completed' | 'current' | 'pending' => {
    if (completedSections.includes(sectionId)) return 'completed';
    if (sectionId === currentSection) return 'current';
    return 'pending';
  };

  const getColorClasses = (status: 'completed' | 'current' | 'pending', color: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-300',
          line: 'bg-green-400',
        };
      case 'current':
        return {
          bg: `bg-${color}-100`,
          text: `text-${color}-700`,
          border: `border-${color}-400 ring-2 ring-${color}-400/30`,
          line: 'bg-slate-200',
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-400',
          border: 'border-slate-200',
          line: 'bg-slate-200',
        };
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {SECTIONS.map((section, index) => {
          const status = getStatus(section.id);
          return (
            <div key={section.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  status === 'completed'
                    ? 'bg-green-500 text-white'
                    : status === 'current'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-600/30'
                      : 'bg-slate-200 text-slate-500'
                }`}
                title={section.name}
              >
                {status === 'completed' ? '✓' : index + 1}
              </div>
              {index < SECTIONS.length - 1 && (
                <div
                  className={`h-0.5 w-4 ${
                    completedSections.includes(section.id) ? 'bg-green-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {SECTIONS.map((section, index) => {
          const status = getStatus(section.id);
          const colors = getColorClasses(status, section.color);

          return (
            <div key={section.id} className="flex flex-1 items-center">
              {/* Section Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl transition-all ${colors.bg} ${colors.border}`}
                >
                  {status === 'completed' ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    section.icon
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                  }`}
                >
                  {section.name}
                </span>
                {status === 'current' && (
                  <span className="mt-0.5 text-xs font-semibold text-blue-600">In Progress</span>
                )}
              </div>

              {/* Connecting Line */}
              {index < SECTIONS.length - 1 && (
                <div className="mx-2 h-0.5 flex-1">
                  <div
                    className={`h-full transition-all ${
                      completedSections.includes(section.id) ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{completedSections.length}</span>
        <span>of</span>
        <span className="font-semibold text-slate-900">{SECTIONS.length}</span>
        <span>sections completed</span>
      </div>
    </div>
  );
}
