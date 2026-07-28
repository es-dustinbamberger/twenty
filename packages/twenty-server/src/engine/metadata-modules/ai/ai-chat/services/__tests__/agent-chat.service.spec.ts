import {
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

describe('AgentChatService', () => {
  const workspaceId = 'workspace-id';
  const threadId = 'thread-id';
  const userWorkspaceId = 'user-workspace-id';
  const agentId = 'agent-id';

  const buildService = () => {
    const threadRepository = {};
    const turnRepository = {
      insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'turn-id' }] }),
      delete: jest.fn(),
    };
    const messageRepository = {
      insert: jest
        .fn()
        .mockResolvedValue({ identifiers: [{ id: 'message-id' }] }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const messagePartRepository = {
      insert: jest.fn(),
    };
    const fileRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    const titleGenerationService = {};
    const workspaceEventBroadcaster = {};

    const service = new AgentChatService(
      threadRepository as never,
      turnRepository as never,
      messageRepository as never,
      messagePartRepository as never,
      fileRepository as never,
      titleGenerationService as never,
      workspaceEventBroadcaster as never,
    );

    jest
      .spyOn(service, 'notifyThreadActivityUpdated')
      .mockResolvedValue(undefined);

    return {
      service,
      turnRepository,
      messageRepository,
    };
  };

  it('stores agent id when queueing a message', async () => {
    const { service, messageRepository } = buildService();

    await service.queueMessage({
      threadId,
      text: 'queued text',
      agentId,
      workspaceId,
      userWorkspaceId,
    });

    expect(messageRepository.insert).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        threadId,
        turnId: null,
        role: AgentMessageRole.USER,
        agentId,
        status: AgentMessageStatus.QUEUED,
      }),
    );
  });

  it('preserves agent id when promoting a queued message', async () => {
    const { service, turnRepository, messageRepository } = buildService();

    await service.promoteQueuedMessage({
      messageId: 'message-id',
      threadId,
      workspaceId,
      agentId,
    });

    expect(turnRepository.insert).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        threadId,
        agentId,
      }),
    );
    expect(messageRepository.update).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        id: 'message-id',
        threadId,
        status: AgentMessageStatus.QUEUED,
      }),
      expect.objectContaining({
        agentId,
        status: AgentMessageStatus.SENT,
        turnId: 'turn-id',
      }),
    );
  });
});
