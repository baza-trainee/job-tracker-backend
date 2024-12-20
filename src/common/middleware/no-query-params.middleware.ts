import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NoQueryParamsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check if there are any query parameters
    if (Object.keys(req.query).length > 0) {
      throw new BadRequestException('Query parameters are not allowed. Use path parameters instead');
    }
    next();
  }
}
