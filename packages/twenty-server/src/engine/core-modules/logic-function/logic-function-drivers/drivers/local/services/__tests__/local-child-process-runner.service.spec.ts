import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';

describe('LocalChildProcessRunnerService', () => {
  it('delivers a large handler result before the child exits', async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-local-runner-test-'),
    );
    const builtHandlerPath = join(temporaryDirectory, 'handler.mjs');
    const runner = new LocalChildProcessRunnerService();

    try {
      await writeFile(
        builtHandlerPath,
        'export const handler = async () => ({ payload: "x".repeat(2_000_000) });',
      );

      const runnerPath = await runner.writeBootstrapRunner({
        dir: temporaryDirectory,
        builtFileAbsPath: builtHandlerPath,
        handlerName: 'handler',
      });
      const result = await runner.runChildWithEnv({
        runnerPath,
        env: {},
        payload: {},
        timeoutMs: 5_000,
      });

      expect(result.ok).toBe(true);
      expect(
        (result.result as { payload?: string } | undefined)?.payload,
      ).toHaveLength(2_000_000);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
