import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { Prediction } from './entities/prediction.entity';
import { PredictionHistory } from './entities/prediction-history.entity';
import { startOfDay, subDays } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(PredictionHistory)
    private readonly historyRepository: Repository<PredictionHistory>,
  ) { }

  private sanitizePrediction(prediction: Prediction) {
    const { user, updatedAt, ...predictionWithoutUser } = prediction;
    return predictionWithoutUser;
  }

  async create(createPredictionDto: CreatePredictionDto, userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException('Authorization is required');
      }
      const prediction = this.predictionRepository.create({
        ...createPredictionDto,
        user: { id: userId }
      });
      const savedPrediction = await this.predictionRepository.save(prediction);
      const result = await this.predictionRepository.findOne({
        where: { id: savedPrediction.id },
        relations: ['user']
      });
      return this.sanitizePrediction(result);
    } catch (error) {
      throw new BadRequestException('Failed to create prediction');
    }
  }

  async findAll(userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException('Authorization is required');
      }
      const predictions = await this.predictionRepository.find({
        select: {
          id: true,
          textUk: true,
          textEn: true,
          createdAt: true
        },
        order: { createdAt: 'DESC' }
      });
      return predictions;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch predictions');
    }
  }

  async update(id: string, userId: string, updatePredictionDto: UpdatePredictionDto) {
    try {
      if (!userId) {
        throw new BadRequestException('Authorization is required');
      }

      const prediction = await this.predictionRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!prediction) {
        throw new NotFoundException('Prediction not found');
      }
      // Check if the update DTO is empty (no fields provided)
      if (Object.keys(updatePredictionDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      // Check if all provided fields are empty strings
      const hasNonEmptyField = Object.values(updatePredictionDto).some(
        value => value !== undefined && value !== '',
      );

      if (!hasNonEmptyField) {
        throw new BadRequestException('At least one field must have a non-empty value');
      }

      Object.assign(prediction, updatePredictionDto);
      const savedPrediction = await this.predictionRepository.save(prediction);
      const { user, updatedAt, ...predictionWithoutUser } = savedPrediction;
      return predictionWithoutUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update prediction');
    }
  }

  async remove(id: string, userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException('Authorization is required');
      }

      const prediction = await this.predictionRepository.findOne({
        where: { id },
      });

      if (!prediction) {
        throw new NotFoundException('Prediction not found');
      }

      await this.predictionRepository.remove(prediction);
      return { message: 'Prediction successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete prediction');
    }
  }

  async seed(user: User) {
    try {
      const filePath = path.join(process.cwd(), 'src', 'predictions', 'data', 'predictions.json');

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Predictions data file not found');
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      if (!Array.isArray(data.predictions)) {
        throw new BadRequestException('Invalid predictions data format');
      }

      const predictions = data.predictions.map(prediction => ({
        ...prediction,
        user
      }));

      const result = await this.predictionRepository.save(predictions);
      return {
        count: result.length,
        message: 'Predictions successfully seeded'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to seed predictions');
    }
  }

  async getDailyPrediction(userId: string) {
    try {
      const today = startOfDay(new Date());

      // Check if user already has a prediction for today
      const todayPrediction = await this.historyRepository.findOne({
        where: {
          user: { id: userId },
          shownAt: MoreThanOrEqual(today)
        },
        relations: ['prediction']
      });

      if (todayPrediction) {
        return this.sanitizePrediction(todayPrediction.prediction);
      }

      // Get predictions shown in the last 90 days
      const ninetyDaysAgo = subDays(today, 90);
      const recentPredictions = await this.historyRepository.find({
        where: {
          user: { id: userId },
          shownAt: MoreThanOrEqual(ninetyDaysAgo)
        },
        relations: ['prediction']
      });

      const recentPredictionIds = recentPredictions.map(h => h.prediction.id);

      // Get a random prediction that wasn't shown in the last 90 days
      let query = this.predictionRepository.createQueryBuilder('prediction');

      if (recentPredictionIds.length > 0) {
        query = query.where('prediction.id NOT IN (:...recentIds)', { recentIds: recentPredictionIds });
      }

      const availablePredictions = await query.getMany();

      // If all predictions were shown, start over
      if (!availablePredictions.length) {
        const oldestHistory = await this.historyRepository.find({
          where: { user: { id: userId } },
          order: { shownAt: 'ASC' },
          take: 90
        });

        if (oldestHistory.length > 0) {
          await this.historyRepository.remove(oldestHistory);
          return this.getDailyPrediction(userId);
        }
        throw new NotFoundException('No predictions available');
      }

      // Get random prediction from available ones
      const randomIndex = Math.floor(Math.random() * availablePredictions.length);
      const prediction = availablePredictions[randomIndex];

      if (!prediction) {
        throw new NotFoundException('No predictions available');
      }

      // Save to history
      const history = this.historyRepository.create({
        user: { id: userId },
        prediction
      });
      await this.historyRepository.save(history);

      return this.sanitizePrediction(prediction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get daily prediction');
    }
  }
}
