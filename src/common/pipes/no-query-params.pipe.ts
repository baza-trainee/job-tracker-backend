import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class NoQueryParamsPipe implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.url.includes('?') || request.url.includes('=')) {
      throw new BadRequestException('Query parameters are not allowed. Use path parameter instead');
    }
    return true;
  }
}
