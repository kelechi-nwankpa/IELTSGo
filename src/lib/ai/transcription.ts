import OpenAI from 'openai';
import { Readable } from 'stream';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const response = await openai.audio.transcriptions.create({
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
