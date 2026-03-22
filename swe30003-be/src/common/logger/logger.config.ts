import { Options } from 'pino-http';

export const pinoConfig: Options = {
  level: 'debug',
  redact: ['req.headers.authorization'],
  customProps: () => ({
    context: 'HTTP',
  }),
  transport: {
    target: 'pino-pretty',
    options: {
      singleLine: true,
      levelFirst: false,
      messageFormat: '[{context}] {msg}',
      ignore: 'pid,hostname,context,responseTime',
      errorLikeObjectKeys: ['err', 'error'],
    },
  },
};
