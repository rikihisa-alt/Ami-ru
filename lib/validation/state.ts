import { z } from 'zod'

// State validation schema
export const stateSchema = z.object({
  // 機嫌関連
  mood: z.number().min(1).max(5).optional(),
  moodReasonTags: z.array(z.string()).optional(),
  note: z.string().optional(),

  // 会話関連
  talkState: z.enum(['ok', 'later', 'no']).optional(),
  talkDepth: z.enum(['light', 'normal', 'deep']).optional(),
  talkStyle: z.enum(['casual', 'serious', 'gentle']).optional(),

  // 距離感・関係性
  distance: z.enum(['close', 'normal', 'need_space']).optional(),
  conflictTolerance: z.enum(['high', 'medium', 'low']).optional(),

  // 生活状況
  lifeStatus: z.enum(['home', 'work', 'out', 'sleeping']).optional(),
  quietMode: z.boolean().optional(),
  soloUntil: z.string().optional(), // ISO8601 datetime string
  freeTime: z.enum(['none', 'little', 'some', 'plenty']).optional(),
  lifeTempo: z.enum(['slow', 'normal', 'fast']).optional(),
  lifeNoise: z.string().optional(),
})

export type StateData = z.infer<typeof stateSchema>
