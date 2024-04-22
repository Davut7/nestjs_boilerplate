import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpExceptionResponse } from './httpExceptionResponse.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP-exception');

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: HttpStatus;
    let errorMessage: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorMessage =
        `${exception.message}. ` + JSON.stringify(errorResponse, null, 2);
    } else {
      errorMessage =
        exception instanceof Error
          ? exception.message
          : 'Internal server error';
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const errorResponse = this.getErrorResponse(
      status,
      exception.message,
      request,
    );
    this.getErrorLog(errorResponse, request);

    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
  ): CustomHttpExceptionResponse => ({
    statusCode: status,
    message: `${errorMessage} ${status === 404 ? `(маршрут не найден)` : ''}`,
    path: request.url,
    method: request.method,
    timeStamp: new Date(),
  });

  private getErrorLog = (
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
  ) => {
    const { statusCode, message } = errorResponse;
    const { method, originalUrl, hostname } = request;

    let host;
    if (request.headers['x-real-ip'] === hostname) {
      host = 'localhost';
    } else {
      host = request.headers['x-real-ip'] || '';
    }
    this.logger.error(message, [
      host,
      originalUrl,
      statusCode,
      method,
      JSON.stringify(request.user ?? 'Not signed in', null, 2),
    ]);
  };
}
