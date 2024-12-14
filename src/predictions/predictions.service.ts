import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { Prediction } from './entities/prediction.entity';
import { PredictionHistory } from './entities/prediction-history.entity';
import { startOfDay, subDays } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(PredictionHistory)
    private readonly historyRepository: Repository<PredictionHistory>,
  ) {}

  async create(createPredictionDto: CreatePredictionDto, userId: string): Promise<Prediction> {
    try {
      const prediction = this.predictionRepository.create({
        ...createPredictionDto,
        user: { id: userId }
      });
      const result = await this.predictionRepository.save(prediction);
      return this.predictionRepository.findOne({ 
        where: { id: result.id },
        relations: ['user']
      });
    } catch (error) {
      throw new BadRequestException('Failed to create prediction: ' + error.message);
    }
  }

  async findAll(userId: string): Promise<Prediction[]> {
    try {
      return this.predictionRepository.find({
        where: { user: { id: userId } },
        select: {
          id: true,
          textUk: true,
          textEn: true,
          createdAt: true,
          updatedAt: true
        },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch predictions: ' + error.message);
    }
  }

  async findOne(id: string, userId: string): Promise<Prediction> {
    try {
      const prediction = await this.predictionRepository.findOne({
        where: { id, user: { id: userId } },
        select: {
          id: true,
          textUk: true,
          textEn: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!prediction) {
        throw new NotFoundException(`Prediction with ID ${id} not found or doesn't belong to the user`);
      }

      return prediction;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch prediction: ' + error.message);
    }
  }

  async update(id: string, updatePredictionDto: UpdatePredictionDto, userId: string): Promise<Prediction> {
    try {
      const prediction = await this.findOne(id, userId);
      const updated = await this.predictionRepository.save({
        ...prediction,
        ...updatePredictionDto,
        user: { id: userId }
      });
      return this.predictionRepository.findOne({ 
        where: { id: updated.id },
        relations: ['user']
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update prediction: ' + error.message);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const prediction = await this.findOne(id, userId);
      await this.predictionRepository.remove(prediction);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete prediction: ' + error.message);
    }
  }

  async seed(userId: string): Promise<{ count: number }> {
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
        user: { id: userId }
      }));

      const result = await this.predictionRepository.save(predictions);
      return { count: result.length };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to seed predictions: ' + error.message);
    }
  }

  async getDailyPrediction(userId: string): Promise<Prediction> {
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
        return todayPrediction.prediction;
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
        prediction: prediction
      });
      await this.historyRepository.save(history);

      return prediction;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to get daily prediction: ' + error.message);
    }
  }
}
