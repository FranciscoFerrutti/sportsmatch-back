import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/http.exception';
import UnauthorizedException from '../exceptions/unauthorized.exception';

import { createHmac } from 'node:crypto';

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

const MpWebhookMiddleware = (error: HttpException, request: Request, response: Response, next: NextFunction): void => {
    const headers = request.headers;
    const query = request.query;

    const xSignature = headers['x-signature'];
    const xRequestId = headers['x-request-id'];
    if (typeof xSignature !== 'string' || typeof xRequestId !== 'string') {
      console.warn('missing signature');
      throw new UnauthorizedException('missing signature');
    }

    const signature = parseXSignature(xSignature);
    if (!signature) {
      console.warn('malformed signature');
      throw new UnauthorizedException('malformed signature');
    }

    const dataId = query['data.id'];
    if (typeof dataId !== 'string') {
      console.warn('missing data.id');
      throw new UnauthorizedException('missing data.id');
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${signature.ts};`;
    const digest = createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET!)
      .update(manifest)
      .digest('hex');

    if (digest !== signature.v1) {
      console.warn('invalid signature');
      throw new UnauthorizedException('invalid signature');
    }

    console.log('verified signature');

    next();
};

export default MpWebhookMiddleware;
