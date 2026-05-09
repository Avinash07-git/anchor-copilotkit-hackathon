// @ts-nocheck
/**
 * CopilotKitProtocolProof — Generative UI layer using the CopilotKit v2 API.
 *
 * Registers every Anchor card as a frontend tool the AI can render inside
 * the CopilotPopup chat. When the anchor_agent backend calls showDriftScore,
 * showPatternAlert, showCombinedTriage, or confirmFamilyMessage, CopilotKit
 * routes to these renderers and the component appears live in the chat.
 *
 * Hooks used (all v2):
 *   useComponent       — Generative UI: AI renders typed React components
 *   useHumanInTheLoop  — HITL approval before dispatching a family message
 *
 * Context injection (v1, still valid in v2):
 *   useCopilotReadable — shares live dashboard state with the AI
 */
import { z } from 'zod';
import { useComponent, useHumanInTheLoop } from '@copilotkit/react-core/v2';
import { useCopilotAdditionalInstructions, useCopilotReadable } from '@copilotkit/react-core';
import { DriftScoreCard, PatternAlertCard, CombinedTriageView } from './A2UIComponents';
import type { UIPlan } from '../types/uiPlan';

// ---------------------------------------------------------------------------
// Zod schemas — match exactly what the backend anchor_agent emits as tool args
// ---------------------------------------------------------------------------

const colorEnum = z.enum(['green', 'yellow', 'amber', 'red']);
const personEnum = z.enum(['tom', 'helen', 'sarah']);
const stateEnum = z.enum(['green', 'yellow', 'amber', 'red']);

const driftScoreSchema = z.object({
  person_id: personEnum,
  display_name: z.string(),
  age: z.number(),
  lens: z.enum(['body', 'mind', 'caregiver']),
  lens_label: z.string(),
  score: z.number(),
  color: colorEnum,
  state: stateEnum,
  trend: z.enum(['up', 'down', 'flat']),
  one_liner: z.string(),
  last_updated: z.string(),
  raw_score_label: z.string(),
  instrument: z.string(),
  active_signals: z.array(z.string()).optional(),
});

const patternAlertSchema = z.object({
  person_id: personEnum,
  pattern_id: z.string(),
  severity_color: colorEnum,
  title: z.string(),
  why_it_matters: z.string(),
  signals: z.array(
    z.object({
      day_label: z.string(),
      text: z.string(),
      extracted_signal: z.string(),
    })
  ),
  suggested_actions: z.array(z.string()),
  disclaimer: z.string(),
  citation: z.string(),
  raw_score_label: z.string(),
  rebuild_reason: z.string(),
  instrument: z.string(),
});

const combinedTriageSchema = z.object({
  title: z.string(),
  rationale: z.string(),
  rows: z.array(
    z.object({
      person_id: personEnum,
      display_name: z.string(),
      lens_label: z.string(),
      color: colorEnum,
      headline: z.string(),
      recommended_first_action: z.string(),
    })
  ),
  disclaimer: z.string(),
});

const familyMessageSchema = z.object({
  draft_preview: z.string().describe('The draft message to review before sending'),
  recipient: z.string().describe('Who this message is going to'),
  approve_label: z.string().optional(),
  decline_label: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  plan: UIPlan | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CopilotKitProtocolProof({ plan }: Props) {
  // Inject AI system instructions (replaces the removed CopilotPopup instructions prop)
  useCopilotAdditionalInstructions(
    {
      instructions: `You are Anchor, a calm AI companion for family caregivers.
The Reynolds family: Tom 68 (heart failure, body lens), Helen 84 (early dementia, mind lens), Sarah 42 (primary caregiver, caregiver lens).

When the user asks about the family or dashboard:
- Call showDriftScore for each relevant person to display their live wellbeing card
- Call showPatternAlert when a threshold has been crossed (check the dashboard state)
- Call showCombinedTriage when all three lenses are active simultaneously
- Call confirmFamilyMessage before sending any family communication

Never make clinical claims. Surface patterns, not diagnoses. Always include citations verbatim.`,
      available: 'enabled',
    },
    []
  );

  // Share the live dashboard state with the AI so it knows what's happening
  useCopilotReadable(
    {
      description:
        'Current Anchor dashboard — live wellbeing state for the Reynolds family (Tom 68 body lens, Helen 84 mind lens, Sarah 42 caregiver lens). Layout and all component data are included.',
      value: plan ?? {},
    },
    [plan]
  );

  // ------------------------------------------------------------------
  // Generative UI: AI renders a live wellbeing score card
  // ------------------------------------------------------------------
  useComponent(
    {
      name: 'showDriftScore',
      description:
        'Display a live wellbeing score card for a Reynolds family member. Call this whenever the user asks about a specific person\'s current score or trend.',
      parameters: driftScoreSchema,
      render: DriftScoreCard,
    },
    []
  );

  // ------------------------------------------------------------------
  // Generative UI: AI renders a peer-reviewed pattern alert
  // ------------------------------------------------------------------
  useComponent(
    {
      name: 'showPatternAlert',
      description:
        'Display a clinical pattern alert with peer-reviewed citation when a wellbeing threshold is crossed. Always include the full citation verbatim.',
      parameters: patternAlertSchema,
      render: PatternAlertCard,
    },
    []
  );

  // ------------------------------------------------------------------
  // Generative UI: AI renders combined triage when all three lenses fire
  // ------------------------------------------------------------------
  useComponent(
    {
      name: 'showCombinedTriage',
      description:
        'Display the combined triage view when all three family members — Tom (body), Helen (mind), and Sarah (caregiver) — have crossed their wellbeing thresholds simultaneously.',
      parameters: combinedTriageSchema,
      render: CombinedTriageView,
    },
    []
  );

  // ------------------------------------------------------------------
  // Human-in-the-loop: caregiver must approve before message is sent
  // ------------------------------------------------------------------
  useHumanInTheLoop(
    {
      name: 'confirmFamilyMessage',
      description:
        "Get caregiver approval before dispatching a draft message to a family member. Always use this tool before sending — never send without explicit caregiver consent.",
      parameters: familyMessageSchema,
      render: ({ args, status, respond }) => (
        <div className="p-4 bg-white rounded-xl border border-anchor-mist-100 space-y-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-anchor-mist-400">
            Draft for {args.recipient ?? 'family'}
          </p>
          <p className="text-sm text-anchor-ink-600 leading-relaxed italic">
            "{args.draft_preview}"
          </p>
          <p className="text-[11px] text-anchor-mist-400">
            Anchor never sends messages without your approval.
          </p>
          {status === 'executing' && respond && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => respond({ decision: 'approve' })}
                className="px-4 py-1.5 bg-anchor-indigo-600 text-white rounded-lg text-[13px] font-semibold hover:bg-anchor-indigo-700 transition-colors"
              >
                {args.approve_label ?? 'Send'}
              </button>
              <button
                type="button"
                onClick={() => respond({ decision: 'decline' })}
                className="px-4 py-1.5 border border-anchor-mist-100 rounded-lg text-[13px] hover:bg-anchor-cream-100 transition-colors"
              >
                {args.decline_label ?? 'Skip for now'}
              </button>
            </div>
          )}
          {status === 'complete' && (
            <p className="text-[12px] text-state-green font-medium">✓ Decision recorded.</p>
          )}
        </div>
      ),
    },
    []
  );

  return null;
}
