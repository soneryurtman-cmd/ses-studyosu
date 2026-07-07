declare module "node-edge-tts" {
  export interface EdgeTTSOptions {
    voice?: string;
    lang?: string;
    outputFormat?: string;
    saveSubtitles?: boolean;
    proxy?: string;
    rate?: string;
    pitch?: string;
    volume?: string;
    timeout?: number;
  }

  export class EdgeTTS {
    constructor(options?: EdgeTTSOptions);
    ttsPromise(text: string, filepath: string): Promise<void>;
  }
}

declare module "msedge-tts" {
  export enum OUTPUT_FORMAT {
    AUDIO_24KHZ_48KBITRATE_MONO_MP3 = "audio-24khz-48kbitrate-mono-mp3",
  }
  export class MsEdgeTTS {
    constructor();
    setMetadata(voice: string, format: string): Promise<void>;
    toStream(text: string): { audioStream: AsyncIterable<Uint8Array> };
  }
}
