export type CampaignStep = 'content' | 'settings'

export interface StepConfig {
  key: CampaignStep
  label: string
  number: number
}

export const CAMPAIGN_STEPS: StepConfig[] = [
  { key: 'content', label: '1. Content', number: 1 },
  { key: 'settings', label: '2. Settings', number: 2 },
]

export const CREDIT_COSTS = {
  contentAndHooks: 15,
  stylingPreset: 10,
  imageGeneration: 7,
} as const

export interface LayoutPreset {
  id: string
  name: string
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: 'clean-minimal', name: 'Clean Minimal' },
  { id: 'warm-local', name: 'Warm Local' },
  { id: 'luxury-premium', name: 'Luxury Premium' },
  { id: 'bold-vibrant', name: 'Bold & Vibrant' },
  { id: 'eco-green', name: 'Eco / Green' },
  { id: 'industrial-technical', name: 'Industrial / Technical' },
]

export interface ColorPalette {
  id: string
  name: string
  colors: string[]
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: 'classic-blue', name: 'Classic Blue', colors: ['#2563EB', '#3B82F6', '#1E3A5F', '#334155', '#94A3B8'] },
  { id: 'soft-neutral', name: 'Soft Neutral', colors: ['#1C1917', '#44403C', '#78716C', '#A8A29E', '#F5F5F4'] },
  { id: 'fresh-green', name: 'Fresh Green', colors: ['#16A34A', '#22C55E', '#166534', '#365314', '#BBF7D0'] },
  { id: 'warm-accent', name: 'Warm Accent', colors: ['#EA580C', '#F97316', '#422006', '#F59E0B', '#FEF3C7'] },
  { id: 'high-contrast', name: 'High Contrast', colors: ['#000000', '#2563EB', '#1E40AF', '#64748B', '#E2E8F0'] },
  { id: 'playful', name: 'Playful', colors: ['#3B82F6', '#EC4899', '#EAB308', '#166534', '#FFFFFF'] },
]
