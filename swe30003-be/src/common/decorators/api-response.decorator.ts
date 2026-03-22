/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseMessage } from './response-message.decorators';

/**
 * This decorator is used to document the Error Response for the API. Each error in the controller should be mapped to this decorator.
 * @param statusCode
 * @param message
 * @param cause
 * @returns
 */
export function ApiErrorResponse(
  statusCode: HttpStatus,
  message?: string,
  cause?: string,
) {
  return applyDecorators(
    ApiResponse({
      status: statusCode,
      description: message,
      schema: {
        default: {
          statusCode,
          message,
          error: cause ?? HttpStatus[statusCode],
        },
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    }),
  );
}

/** This decorator is used to document the response from POST for the API. It also edit the message field in the response object.
 * @param model
 * @param message
 * @returns
//  */

export const ApiPostResponse = <TModel extends Type<any>>(
  model: TModel | TModel[],
  message: string,
) => {
  return applyDecorators(
    ResponseMessage(message),
    ...(Array.isArray(model)
      ? [ApiExtraModels(...model)]
      : [ApiExtraModels(model)]),
    ApiCreatedResponse({
      schema: {
        properties: {
          message: { type: 'string' },
          statusCode: { type: 'number', default: HttpStatus.CREATED },
          data: Array.isArray(model)
            ? {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model[0]),
                },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
};

/** This decorator is used to document the response from PUT for the API. It also edit the message field in the response object.
 * @param model
 * @param message
 * @returns
 * */
export const ApiPutResponse = <TModel extends Type<any>>(
  model: TModel | TModel[],
  message: string,
) => {
  return applyDecorators(
    ResponseMessage(message),
    ...(Array.isArray(model)
      ? [ApiExtraModels(...model)]
      : [ApiExtraModels(model)]),
    ApiOkResponse({
      schema: {
        properties: {
          message: { type: 'string' },
          statusCode: { type: 'number', default: HttpStatus.OK },
          data: Array.isArray(model)
            ? {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model[0]),
                },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
};

/** This decorator is used to document the response from GET for the API. It also edit the message field in the response object.
 * @param model
 * @param message
 * @returns
 * */
export const ApiGetResponse = <TModel extends Type<any>>(
  model: TModel | TModel[],
  message: string,
) => {
  return applyDecorators(
    ResponseMessage(message),
    ...(Array.isArray(model)
      ? [ApiExtraModels(...model)]
      : [ApiExtraModels(model)]),
    ApiOkResponse({
      schema: {
        properties: {
          message: { type: 'string' },
          statusCode: { type: 'number', default: HttpStatus.OK },
          data: Array.isArray(model)
            ? {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model[0]),
                },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
};

/** This decorator is used to document the response from DELETE for the API. It also edit the message field in the response object.
 * @param model
 * @param message
 * @returns
 * */
export const ApiDeleteResponse = <TModel extends Type<any>>(
  model: TModel | TModel[],
  message: string,
) => {
  return applyDecorators(
    ResponseMessage(message),
    ...(Array.isArray(model)
      ? [ApiExtraModels(...model)]
      : [ApiExtraModels(model)]),
    ApiOkResponse({
      schema: {
        properties: {
          message: { type: 'string' },
          statusCode: { type: 'number', default: HttpStatus.OK },
          data: Array.isArray(model)
            ? {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model[0]),
                },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
};
