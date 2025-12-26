import OpenAI from 'openai';
import { Readable } from 'stream';

// Lazy-load OpenAI client to avoid build-time errors when env var is not set
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

/**
 * Transcribe audio using OpenAI's Whisper API
 * @param audioBlob - Audio blob in webm or mp4 format
 * @returns Transcribed text and audio duration
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  // Convert blob to file-like object for OpenAI
  const buffer = Buffer.from(await audioBlob.arrayBuffer());

  // Create a File object from buffer
  const file = new File([buffer], 'audio.webm', { type: audioBlob.type });

  const response = await getOpenAIClient().audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
    response_format: 'verbose_json',
  });

  return {
    text: response.text,
    duration: response.duration,
  };
}

/**
 * Transcribe audio from a stream
 */
export async function transcribeAudioStream(
  stream: Readable,
  mimeType: string
): Promise<TranscriptionResult> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const blob = new Blob([buffer], { type: mimeType });

  return transcribeAudio(blob);
}
