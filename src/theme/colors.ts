export const colors = {
  bg: '#05080F',
  surface: '#0B1220',
  surfaceAlt: '#111A2E',
  border: '#1B2A47',
  text: '#E6F1FF',
  textDim: '#7F93B5',
  accent: '#27D3FF',
  accentSoft: 'rgba(39, 211, 255, 0.15)',
  listening: '#3DFFB0',
  processing: '#FFB547',
  speaking: '#A78BFF',
  danger: '#FF5D6C',
};

export type AssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export const statusColor: Record<AssistantStatus, string> = {
  idle: colors.accent,
  listening: colors.listening,
  processing: colors.processing,
  speaking: colors.speaking,
};
