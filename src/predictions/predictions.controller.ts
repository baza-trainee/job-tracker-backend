import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { Prediction } from './entities/prediction.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';

@ApiTags('Predictions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new prediction',
    description: 'Creates a new prediction for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Prediction successfully created',
    type: Prediction
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data provided'
  })
  create(@Body() createPredictionDto: CreatePredictionDto, @Request() req) {
    return this.predictionsService.create(createPredictionDto, req.user.id);
  }

  @Get('daily')
  @ApiOperation({
    summary: 'Get daily prediction',
    description: 'Returns the daily prediction for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the daily prediction',
    type: Prediction
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  getDailyPrediction(@Request() req) {
    return this.predictionsService.getDailyPrediction(req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all predictions for the current user',
    description: 'Returns all predictions belonging to the authenticated user, ordered by creation date'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all predictions',
    type: [Prediction]
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  findAll(@Request() req) {
    return this.predictionsService.findAll(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a prediction',
    description: 'Updates a prediction if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Prediction successfully updated',
    type: Prediction
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Prediction ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    return this.predictionsService.update(id, req.user.id, updatePredictionDto);
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed predictions',
    description: 'Seeds the predictions table with predefined data for the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Predictions successfully seeded',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of predictions seeded'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  seed(@Request() req) {
    return this.predictionsService.seed(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a prediction',
    description: 'Deletes a prediction if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prediction successfully deleted'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Prediction not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiParam({
    name: 'id',
    description: 'Prediction ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.predictionsService.remove(id, req.user.id);
  }
}
