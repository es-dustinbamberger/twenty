import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

describe('AgentChatResolver', () => {
  const workspace = {
    id: 'workspace-id',
    smartModel: 'workspace-model',
  } as WorkspaceEntity;
  const userWorkspaceId = 'user-workspace-id';
  const roleId = 'role-id';
  const quillAgent = {
    id: 'quill-agent-id',
    roleId,
    modelId: 'agent-model',
    prompt: 'quill prompt',
  } as FlatAgentWithRoleId;

  const buildResolver = ({
    roleAgents = [quillAgent],
    activeStreamId = null,
  }: {
    roleAgents?: FlatAgentWithRoleId[];
    activeStreamId?: string | null;
  } = {}) => {
    const agentChatService = {
      queueMessage: jest.fn().mockResolvedValue({ id: 'queued-message-id' }),
    };
    const agentChatStreamingService = {
      streamAgentChat: jest.fn().mockResolvedValue({
        messageId: 'message-id',
        streamId: 'stream-id',
      }),
    };
    const eventPublisherService = {
      publish: jest.fn(),
    };
    const systemPromptBuilderService = {};
    const billingUsageService = {
      hasAvailableCreditsOrThrow: jest.fn(),
    };
    const aiModelRegistryService = {
      getAvailableModels: jest.fn().mockReturnValue([{}]),
      validateModelAvailability: jest.fn(),
    };
    const redisClientService = {};
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        activeStreamId,
        deletedAt: null,
      }),
    };
    const agentActorContextService = {
      buildUserAndAgentActorContext: jest.fn().mockResolvedValue({ roleId }),
    };
    const agentService = {
      findManyAgents: jest.fn().mockResolvedValue(roleAgents),
      findOneAgentById: jest.fn(),
    };

    const ResolverWithDispatchDependencies = AgentChatResolver as unknown as {
      new (...dependencies: unknown[]): AgentChatResolver;
    };
    const resolver = new ResolverWithDispatchDependencies(
      agentChatService,
      agentChatStreamingService,
      eventPublisherService,
      systemPromptBuilderService,
      billingUsageService,
      aiModelRegistryService,
      redisClientService,
      threadRepository,
      agentActorContextService,
      agentService,
    );

    return {
      agentChatService,
      agentChatStreamingService,
      aiModelRegistryService,
      resolver,
    };
  };

  const sendMessage = (resolver: AgentChatResolver) =>
    resolver.sendChatMessage(
      'thread-id',
      'hello',
      'message-id',
      null,
      undefined,
      undefined,
      null,
      userWorkspaceId,
      workspace,
    );

  it('streams with the only agent bound to the current user role', async () => {
    const { agentChatStreamingService, aiModelRegistryService, resolver } =
      buildResolver();

    await sendMessage(resolver);

    expect(
      aiModelRegistryService.validateModelAvailability,
    ).toHaveBeenCalledWith(quillAgent.modelId, workspace);
    expect(agentChatStreamingService.streamAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: quillAgent.id,
        modelId: quillAgent.modelId,
      }),
    );
  });

  it('persists the implicit role agent when a message is queued', async () => {
    const { agentChatService, resolver } = buildResolver({
      activeStreamId: 'active-stream-id',
    });

    await sendMessage(resolver);

    expect(agentChatService.queueMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: quillAgent.id,
      }),
    );
  });

  it('keeps workspace model fallback when the role has no agent', async () => {
    const { agentChatStreamingService, aiModelRegistryService, resolver } =
      buildResolver({ roleAgents: [] });

    await sendMessage(resolver);

    expect(
      aiModelRegistryService.validateModelAvailability,
    ).toHaveBeenCalledWith(workspace.smartModel, workspace);
    expect(agentChatStreamingService.streamAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: undefined,
        modelId: workspace.smartModel,
      }),
    );
  });

  it('rejects ambiguous role-agent bindings', async () => {
    const { resolver } = buildResolver({
      roleAgents: [quillAgent, { ...quillAgent, id: 'second-agent-id' }],
    });

    let error: unknown;

    try {
      await sendMessage(resolver);
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(AiException);
    expect((error as AiException).code).toBe(
      AiExceptionCode.AGENT_ROLE_AMBIGUOUS,
    );
  });
});
