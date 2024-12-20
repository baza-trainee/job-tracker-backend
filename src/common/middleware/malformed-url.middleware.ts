import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MalformedUrlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check if URL contains ? or = but is malformed
    if (req.url.includes('?') || req.url.includes('=')) {
      throw new BadRequestException('Invalid URL format. Use path parameters instead of query parameters');
    }
    next();
  }
}
