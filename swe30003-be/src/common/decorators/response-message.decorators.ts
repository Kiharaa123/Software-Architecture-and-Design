import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_METADATA = 'responseMessage';

/**
 * Change the response message
 * @param message
 * @returns
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_METADATA, message);
