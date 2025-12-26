'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioRecorderProps {
  maxDuration?: number; // in seconds
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export function AudioRecorder({
  maxDuration = 120,
  onRecordingComplete,
  disabled = false,
}: AudioRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(50).fill(0));
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  // Custom player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Setup audio context for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState('stopped');
      };

      mediaRecorder.start(100); // Collect data every 100ms
      isRecordingRef.current = true;
      setRecordingState('recording');
      setElapsedTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);

      // Start visualization
      visualize();
    } catch (err) {
      setPermissionGranted(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please enable microphone permission.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError(`Error accessing microphone: ${err.message}`);
        }
      }
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // Use ref instead of state to avoid stale closure
      if (!isRecordingRef.current || !analyserRef.current) return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Sample the frequency data into 50 bars
      const barCount = 50;
      const samplesPerBar = Math.floor(bufferLength / barCount);
      const newLevels: number[] = [];

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < samplesPerBar; j++) {
          sum += dataArray[i * samplesPerBar + j];
        }
        const avg = sum / samplesPerBar;
        newLevels.push(avg / 255); // Normalize to 0-1
      }

      setAudioLevels(newLevels);
    };

    draw();
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      // Save the duration before stopping
      setRecordedDuration(elapsedTime);
      isRecordingRef.current = false;
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setAudioLevels(new Array(50).fill(0));
    }
  }, [recordingState, elapsedTime]);

  // Auto-stop at max duration
  useEffect(() => {
    if (elapsedTime >= maxDuration && recordingState === 'recording') {
      stopRecording();
    }
  }, [elapsedTime, maxDuration, recordingState, stopRecording]);

  const resetRecording = () => {
    if (playbackRef.current) {
      playbackRef.current.pause();
      playbackRef.current.currentTime = 0;
    }
    isRecordingRef.current = false;
    cleanup();
    setRecordingState('idle');
    setElapsedTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioLevels(new Array(50).fill(0));
    setRecordedDuration(0);
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const submitRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const togglePlayback = () => {
    if (!playbackRef.current) return;

    if (isPlaying) {
      playbackRef.current.pause();
      setIsPlaying(false);
    } else {
      playbackRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playbackRef.current) return;
    const newTime = parseFloat(e.target.value);
    playbackRef.current.currentTime = newTime;
    setPlaybackTime(newTime);
  };

  // Update playback time as audio plays
  useEffect(() => {
    const audio = playbackRef.current;
    if (!audio) return;

    const updateTime = () => {
      setPlaybackTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Permission check on mount
  useEffect(() => {
    let mounted = true;

    const doCheck = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        if (mounted) {
          setPermissionGranted(true);
        }
      } catch {
        if (mounted) {
          setPermissionGranted(false);
        }
      }
    };

    doCheck();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              recordingState === 'recording'
                ? 'bg-red-100'
                : recordingState === 'stopped'
                  ? 'bg-green-100'
                  : 'bg-indigo-100'
            }`}
          >
            {recordingState === 'recording' ? (
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            ) : (
              <svg
                className={`h-5 w-5 ${
                  recordingState === 'stopped' ? 'text-green-600' : 'text-indigo-600'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {recordingState === 'idle' && 'Ready to Record'}
              {recordingState === 'recording' && 'Recording...'}
              {recordingState === 'stopped' && 'Recording Complete'}
            </h3>
            <p className="text-sm text-gray-500">
              {recordingState === 'idle' && `Maximum ${formatTime(maxDuration)}`}
              {recordingState === 'recording' && 'Speak clearly into your microphone'}
              {recordingState === 'stopped' && 'Review your recording below'}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`rounded-lg px-4 py-2 font-mono text-lg font-semibold ${
            recordingState === 'recording'
              ? elapsedTime >= maxDuration - 30
                ? 'bg-red-100 text-red-700'
                : 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {formatTime(elapsedTime)} / {formatTime(maxDuration)}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Waveform visualization */}
      <div className="mb-6 flex h-24 items-center justify-center gap-0.5 rounded-lg bg-gray-50 px-4">
        {audioLevels.map((level, index) => (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-75 ${
              recordingState === 'recording' ? 'bg-red-400' : 'bg-gray-300'
            }`}
            style={{
              height: `${Math.max(8, level * 80)}%`,
            }}
          />
        ))}
      </div>

      {/* Custom Audio Player (when stopped) */}
      {recordingState === 'stopped' && audioUrl && (
        <div className="mb-6">
          {/* Hidden audio element */}
          <audio ref={playbackRef} src={audioUrl} preload="auto" />

          {/* Custom player UI */}
          <div className="flex items-center gap-4 rounded-lg bg-gray-100 p-4">
            {/* Play/Pause button */}
            <button
              onClick={togglePlayback}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500"
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time display */}
            <span className="min-w-[45px] font-mono text-sm text-gray-600">
              {formatTime(Math.floor(playbackTime))}
            </span>

            {/* Progress bar */}
            <div className="relative flex-1">
              <input
                type="range"
                min="0"
                max={recordedDuration || 1}
                step="0.1"
                value={playbackTime}
                onChange={handleSeek}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-300 accent-indigo-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600"
              />
            </div>

            {/* Duration display */}
            <span className="min-w-[45px] font-mono text-sm text-gray-600">
              {formatTime(recordedDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {recordingState === 'idle' && (
          <button
            onClick={startRecording}
            disabled={disabled || permissionGranted === false}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </svg>
            Start Recording
          </button>
        )}

        {recordingState === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop Recording
          </button>
        )}

        {recordingState === 'stopped' && (
          <>
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Record Again
            </button>
            <button
              onClick={submitRecording}
              disabled={disabled}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Submit Recording
            </button>
          </>
        )}
      </div>

      {/* Permission reminder */}
      {permissionGranted === false && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-800">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Microphone access required</p>
              <p className="mt-1 text-sm">
                Please allow microphone access in your browser settings to record your speaking
                response.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
