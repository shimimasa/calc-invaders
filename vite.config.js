// vite.config.js (ESM)
import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173 },
  // Vitest 用の最小設定（なくても動くが、入れておくと安心）
  test: {
    environment: 'node'
  }
});
