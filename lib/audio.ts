import { wait } from "@/lib/utils";

const MOCK_AUDIO_DURATION_MS = 2800;

const voiceStates = new Set<symbol>();

export async function playAudioFromText(text: string) {
  const voiceId = Symbol("mock-voice");
  voiceStates.add(voiceId);

  try {
    // Placeholder for ElevenLabs Text-to-Speech integration.
    // In production, you would call the ElevenLabs API here, stream audio,
    // and play it through the Web Audio API.
    await wait(MOCK_AUDIO_DURATION_MS);
  } finally {
    voiceStates.delete(voiceId);
  }
}

export function isAudioPlaying() {
  return voiceStates.size > 0;
}

