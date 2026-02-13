import type { Request } from 'express';

export const getIp = (request: Request): string => {
  const forwarded: string | string[] | undefined =
    request.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }

  return request.ip ?? '';
};

const UAParser = require('ua-parser-js');
export const getDeviceInfo = (request: Request): string => {
  const ua: string = request.get('User-Agent') ?? '';
  const parser: any = new UAParser(ua);
  const result: any = parser.getResult();
  return `${result.browser.name} ${result.browser.version} on ${result.os.name} ${result.os.version}`;
};
