// @ts-nocheck
import { useCoAgent, useCopilotAction } from '@copilotkit/react-core';
import { CombinedTriageView, PatternAlertCard, ApprovalPrompt } from './A2UIComponents';

/**
 * CopilotKitProtocolProof
 *
 * This component is a sponsor-facing proof surface for the APIs called out in
 * the hackathon guidance: useCoAgent, useCopilotAction, and renderAndWait.
 *
 * Anchor's primary demo path remains the validated UIPlan + FastAPI/SSE path
 * because it is deterministic and stage-safe. This file shows the same Anchor
 * card catalog can be driven through CopilotKit actions if the optional
 * provider path is enabled with ?copilot=1.
 */
export default function CopilotKitProtocolProof() {
  useCoAgent({
    name: 'anchor_agent',
    initialState: {
      tom: { score: 97, state: 'green', signals: [] },
      helen: { score: 100, state: 'green', signals: [] },
      sarah: { score: 99, state: 'green', signals: [] },
      combined: false,
    },
  });

  useCopilotAction({
    name: 'show_physical_pattern_alert',
    description: "Render Tom's physical wellbeing alert from agent evidence.",
    parameters: [
      { name: 'props', type: 'object', description: 'PatternAlertCard props' },
    ],
    render: ({ args }) => <PatternAlertCard {...args.props} />,
  });

  useCopilotAction({
    name: 'show_cognitive_contributor_alert',
    description: "Render Helen's multi-observer cognitive drift card.",
    parameters: [
      { name: 'props', type: 'object', description: 'PatternAlertCard props' },
    ],
    render: ({ args }) => <PatternAlertCard {...args.props} />,
  });

  useCopilotAction({
    name: 'show_caregiver_burden_alert',
    description: "Render Sarah's caregiver wellbeing alert from ZBI evidence.",
    parameters: [
      { name: 'props', type: 'object', description: 'PatternAlertCard props' },
    ],
    render: ({ args }) => <PatternAlertCard {...args.props} />,
  });

  useCopilotAction({
    name: 'show_combined_triage_view',
    description: 'Render the combined triage view when all three lenses are active.',
    parameters: [
      { name: 'props', type: 'object', description: 'CombinedTriageView props' },
    ],
    render: ({ args }) => <CombinedTriageView {...args.props} />,
  });

  useCopilotAction({
    name: 'confirm_family_message',
    description: 'Human-in-the-loop approval before a draft message is sent.',
    parameters: [
      { name: 'props', type: 'object', description: 'ApprovalPrompt props' },
    ],
    renderAndWait: ({ args, handler }) => (
      <div>
        <ApprovalPrompt {...args.props} />
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => handler.accept?.()}>
            Looks good
          </button>
          <button type="button" onClick={() => handler.reject?.()}>
            Edit first
          </button>
        </div>
      </div>
    ),
  });

  return null;
}
