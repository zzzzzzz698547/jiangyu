import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleLeadRequest } from './src/server/leadEmail';

function localLeadApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'local-lead-api',
    configureServer(server) {
      server.middlewares.use('/api/leads', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        await handleLeadRequest(req, res, env, { allowMock: true });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), localLeadApiPlugin(env)],
  };
});
