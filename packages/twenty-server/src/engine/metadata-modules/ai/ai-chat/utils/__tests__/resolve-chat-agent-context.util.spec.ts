import { Logger } from '@nestjs/common';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { resolveChatAgentContext } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-chat-agent-context.util';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

describe('resolveChatAgentContext', () => {
  const roleId = 'role-id';
  const workspaceModelId = 'workspace-model';

  const agent = {
    id: 'agent-id',
    roleId,
    modelId: 'agent-model',
    prompt: 'agent prompt',
  } as FlatAgentWithRoleId;

  const mockLogger: Logger = {
    debug: () => {},
    log: () => {},
    warn: jest.fn(),
    error: () => {},
  } as unknown as Logger;

  it('uses the only role-bound agent when no explicit agent id is provided', () => {
    expect(
      resolveChatAgentContext({
        agentId: undefined,
        logger: mockLogger,
        roleId,
        roleAgents: [agent],
        explicitAgent: null,
        modelId: undefined,
        workspaceModelId,
        workspaceInstructions: 'workspace instructions',
      }),
    ).toEqual({
      agent,
      resolvedModelId: 'agent-model',
      combinedWorkspaceInstructions: 'agent prompt\n\nworkspace instructions',
    });
  });

  it('falls back to workspace defaults when no role agent is bound', () => {
    expect(
      resolveChatAgentContext({
        agentId: undefined,
        logger: mockLogger,
        roleId,
        roleAgents: [],
        explicitAgent: null,
        modelId: undefined,
        workspaceModelId,
        workspaceInstructions: 'workspace instructions',
      }),
    ).toEqual({
      agent: undefined,
      resolvedModelId: workspaceModelId,
      combinedWorkspaceInstructions: 'workspace instructions',
    });
  });

  it('uses an explicit agent even when role-agent candidates are ambiguous', () => {
    expect(
      resolveChatAgentContext({
        agentId: 'explicit-agent',
        logger: mockLogger,
        roleId,
        roleAgents: [
          agent,
          { ...agent, id: 'other-agent-id', prompt: 'other prompt' },
        ],
        explicitAgent: { ...agent, id: 'explicit-agent' },
        modelId: undefined,
        workspaceModelId,
        workspaceInstructions: 'workspace instructions',
      }),
    ).toEqual({
      agent: {
        id: 'explicit-agent',
        roleId,
        prompt: 'agent prompt',
        modelId: 'agent-model',
      } as FlatAgentWithRoleId,
      resolvedModelId: 'agent-model',
      combinedWorkspaceInstructions: 'agent prompt\n\nworkspace instructions',
    });
  });

  it('rejects ambiguous implicit role-agent candidates', () => {
    let error: unknown;

    try {
      resolveChatAgentContext({
        agentId: undefined,
        logger: mockLogger,
        roleId,
        roleAgents: [
          agent,
          { ...agent, id: 'other-agent-id', prompt: 'other prompt' },
        ],
        explicitAgent: null,
        modelId: undefined,
        workspaceModelId,
        workspaceInstructions: 'workspace instructions',
      });
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(AiException);
    expect((error as AiException).code).toBe(
      AiExceptionCode.AGENT_ROLE_AMBIGUOUS,
    );
  });

  it('lets an explicit model override the agent model', () => {
    expect(
      resolveChatAgentContext({
        agentId: undefined,
        logger: mockLogger,
        roleId,
        roleAgents: [agent],
        explicitAgent: null,
        modelId: 'explicit-model',
        workspaceModelId,
        workspaceInstructions: undefined,
      }).resolvedModelId,
    ).toBe('explicit-model');
  });

  it('rejects an explicit agent assigned to a different role', () => {
    let error: unknown;

    try {
      resolveChatAgentContext({
        agentId: 'other-agent-id',
        logger: mockLogger,
        roleId,
        roleAgents: [],
        explicitAgent: {
          ...agent,
          id: 'other-agent-id',
          roleId: 'other-role',
        },
        modelId: undefined,
        workspaceModelId,
        workspaceInstructions: undefined,
      });
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(AiException);
    expect((error as AiException).code).toBe(AiExceptionCode.AGENT_NOT_FOUND);
  });
});
