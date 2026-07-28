import { type Logger } from '@nestjs/common';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

type ResolveChatAgentContextOptions = {
  agentId?: string;
  logger: Logger;
  roleId: string;
  roleAgents: FlatAgentWithRoleId[];
  explicitAgent: FlatAgentWithRoleId | null;
  modelId?: string;
  workspaceModelId: string;
  workspaceInstructions?: string | null;
};

const resolveImplicitRoleAgent = (
  roleAgents: FlatAgentWithRoleId[],
  roleId: string,
  logger: Logger,
): FlatAgentWithRoleId | undefined => {
  if (roleAgents.length === 0) {
    return undefined;
  }

  if (roleAgents.length === 1) {
    return roleAgents[0];
  }

  logger.warn(
    'Ambiguous agent role resolution — multiple agents bound to same role',
    {
      roleId,
      roleAgentIds: roleAgents.map((roleAgent) => roleAgent.id).join(','),
    },
  );

  throw new AiException(
    'Ambiguous agent role resolution — multiple agents bound to same role',
    AiExceptionCode.AGENT_ROLE_AMBIGUOUS,
  );
};

export const resolveChatAgentContext = ({
  agentId,
  logger,
  roleId,
  roleAgents,
  explicitAgent,
  modelId,
  workspaceModelId,
  workspaceInstructions,
}: ResolveChatAgentContextOptions) => {
  const agent = agentId
    ? explicitAgent
    : resolveImplicitRoleAgent(roleAgents, roleId, logger);

  if (agentId && agent?.roleId !== roleId) {
    throw new AiException(
      'Agent is not available for the current role',
      AiExceptionCode.AGENT_NOT_FOUND,
    );
  }

  const combinedWorkspaceInstructions =
    [agent?.prompt || undefined, workspaceInstructions]
      .filter((value): value is string => Boolean(value))
      .join('\n\n') || undefined;

  return {
    agent,
    resolvedModelId: modelId ?? agent?.modelId ?? workspaceModelId,
    combinedWorkspaceInstructions,
  };
};
