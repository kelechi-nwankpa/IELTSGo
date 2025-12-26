'use client';

import { useState } from 'react';

interface TranscriptionEditorProps {
  transcription: string;
  onSave: (editedTranscription: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TranscriptionEditor({
  transcription,
  onSave,
  onCancel,
  isSubmitting = false,
}: TranscriptionEditorProps) {
  const [editedText, setEditedText] = useState(transcription);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    setHasChanges(e.target.value !== transcription);
  };

  const handleSave = () => {
    if (hasChanges && editedText.trim().length > 0) {
      onSave(editedText);
    }
  };

  const handleReset = () => {
    setEditedText(transcription);
    setHasChanges(false);
  };

  const wordCount = editedText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Edit Transcription</h3>
          <p className="text-sm text-gray-500">
            Correct any transcription errors before re-evaluating
          </p>
        </div>
        <span className="text-sm text-gray-500">{wordCount} words</span>
      </div>

      <textarea
        value={editedText}
        onChange={handleChange}
        className="mb-4 min-h-[200px] w-full rounded-lg border border-gray-300 p-4 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder="Your transcription..."
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges || isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || editedText.trim().length === 0 || isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Re-evaluating...' : 'Save & Re-evaluate'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <p className="mt-3 text-sm text-amber-600">
          You have unsaved changes. Click &quot;Save & Re-evaluate&quot; to get updated feedback.
        </p>
      )}
    </div>
  );
}
