import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleLeadRequest } from '../src/server/leadEmail';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleLeadRequest(req, res, process.env, { allowMock: false });
}
