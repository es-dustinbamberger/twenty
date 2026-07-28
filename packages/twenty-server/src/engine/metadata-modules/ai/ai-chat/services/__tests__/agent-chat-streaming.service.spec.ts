import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

describe('AgentChatStreamingService', () => {
  it('carries a queued message agent through promotion and execution', async () => {
    const agentId = 'agent-id';
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        deletedAt: null,
      }),
      findOneOrFail: jest.fn().mockResolvedValue({
        id: 'thread-id',
        conversationSize: 0,
      }),
      update: jest.fn(),
    };
    const fileRepository = {};
    const messageQueueService = {
      add: jest.fn(),
    };
    const agentChatService = {
      getQueuedMessages: jest.fn().mockResolvedValue([
        {
          id: 'message-id',
          agentId,
          parts: [{ type: 'text', textContent: 'queued text' }],
        },
      ]),
      promoteQueuedMessage: jest.fn().mockResolvedValue('turn-id'),
      getMessagesForThread: jest.fn().mockResolvedValue([]),
    };
    const eventPublisherService = {
      publish: jest.fn(),
    };
    const fileUrlService = {};
    const service = new AgentChatStreamingService(
      threadRepository as never,
      fileRepository as never,
      messageQueueService as never,
      agentChatService as never,
      eventPublisherService as never,
      fileUrlService as never,
    );

    await service.flushNextQueuedMessage(
      'thread-id',
      'user-workspace-id',
      'workspace-id',
      true,
    );

    expect(agentChatService.promoteQueuedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId,
      }),
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        agentId,
      }),
    );
  });
});
