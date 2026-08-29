export type CallStatus = "inactive" | "connecting" | "active" | "finished";

export interface AgentMessage {
  role: "interviewer" | "candidate" | "system";
  content: string;
  timestamp: number;
}

export interface SpeechConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}
