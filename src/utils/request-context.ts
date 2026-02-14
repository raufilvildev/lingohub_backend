import type { Request } from 'express';
const UAParser = require('ua-parser-js');

export const getDeviceInfo = (request: Request): string => {
  const ua: string = request.get('User-Agent') ?? '';
  const parser: any = new UAParser(ua);
  const result: any = parser.getResult();
  return `${result.browser.name} ${result.browser.version} on ${result.os.name} ${result.os.version}`;
};
