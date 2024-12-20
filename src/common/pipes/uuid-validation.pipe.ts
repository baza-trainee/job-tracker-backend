import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
  private uuidPipe = new ParseUUIDPipe({ version: '4' });

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // Use NestJS's built-in UUID validation
      return await this.uuidPipe.transform(value, metadata);
    } catch (error) {
      throw new BadRequestException('Invalid UUID format. Please provide a valid UUID v4.');
    }
  }
}
