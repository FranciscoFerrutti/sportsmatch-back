import { NextFunction, Request, RequestHandler, Response } from 'express';

import { createHmac } from 'node:crypto';
import { HTTP_STATUS } from '../constants/http.constants';

function parseXSignature(
  xSignature: string,
): { ts: string; v1: string } | null {
  const parts = xSignature.split(',');
  if (parts.length < 2) {
    return null;
  }

  const keyValuePairs = parts
    .map((part) => {
      const keyValue = part.split('=');
      if (keyValue.length !== 2) {
        return null;
      }

      return [keyValue[0].trim(), keyValue[1].trim()];
    })
    .filter((entry) => entry !== null);

  const tsKeyValue = keyValuePairs.find(([key]) => key === 'ts');
  const v1KeyValue = keyValuePairs.find(([key]) => key === 'v1');
  if (!tsKeyValue || !v1KeyValue) {
    return null;
  }

  return { ts: tsKeyValue[1], v1: v1KeyValue[1] };
}

const MpWebhookMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers;
    const query = req.query;

    const xSignature = headers['x-signature'];
    const xRequestId = headers['x-request-id'];
    if (typeof xSignature !== 'string' || typeof xRequestId !== 'string') {
      console.warn('missing signature');
      return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
    }

    const signature = parseXSignature(xSignature);
    if (!signature) {
      console.warn('malformed signature');
      return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
    }

    const dataId = query['data.id'];
    if (typeof dataId !== 'string') {
      console.warn('missing data.id');
      return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${signature.ts};`;
    const digest = createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET!)
      .update(manifest)
      .digest('hex');

    if (digest !== signature.v1) {
      console.warn('invalid signature');
      return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
    }

    console.log('verified signature');

    next();
};

export default MpWebhookMiddleware;
