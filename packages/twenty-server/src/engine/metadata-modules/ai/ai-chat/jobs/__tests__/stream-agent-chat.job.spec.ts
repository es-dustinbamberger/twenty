import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { StreamAgentChatJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';

jest.mock(
  'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service',
  () => ({ ChatExecutionService: class ChatExecutionService {} }),
);

describe('StreamAgentChatJob', () => {
  it('persists the resolved agent on the assistant message', async () => {
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        deletedAt: null,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const agentChatService = {
      addMessage: jest.fn().mockResolvedValue({ id: 'assistant-message-id' }),
      notifyThreadUsageUpdated: jest.fn().mockResolvedValue(undefined),
    };
    const job = new StreamAgentChatJob(
      threadRepository as never,
      {} as never,
      agentChatService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await (
      job as unknown as {
        handleStreamFinish: (options: Record<string, unknown>) => Promise<void>;
      }
    ).handleStreamFinish({
      responseMessage: {
        role: AgentMessageRole.ASSISTANT,
        parts: [{ type: 'text', text: 'I am Quill.' }],
      },
      isAborted: false,
      streamError: undefined,
      outOfCredits: false,
      threadId: 'thread-id',
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      agentId: 'quill-agent-id',
      streamUsage: {
        inputTokens: 1,
        outputTokens: 1,
        inputCredits: 1,
        outputCredits: 1,
        cacheReadTokens: 0,
      },
      lastStepConversationSize: 1,
      totalCacheCreationTokens: 0,
      modelConfig: { contextWindowTokens: 1000 },
      userMessagePromise: Promise.resolve({ turnId: 'turn-id' }),
    });

    expect(agentChatService.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: 'quill-agent-id',
        threadId: 'thread-id',
        turnId: 'turn-id',
      }),
    );
  });
});
