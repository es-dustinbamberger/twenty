import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

describe('AiException', () => {
  it('maps ambiguous role-agent resolution to an explicit user-facing message', () => {
    const error = new AiException(
      'Ambiguous agent role resolution',
      AiExceptionCode.AGENT_ROLE_AMBIGUOUS,
    );

    expect(error.userFriendlyMessage.message).toBe(
      'Ambiguous agent role — multiple agents bound to the same role.',
    );
  });
});
