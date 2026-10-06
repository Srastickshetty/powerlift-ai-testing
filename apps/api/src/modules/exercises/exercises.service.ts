import { ExerciseRepo } from './exercises.repo';
import { ExerciseQuery, CreateExerciseInput, UpdateExerciseInput } from './exercises.schema';

export class ExerciseService {
  static async listExercises(query: ExerciseQuery) {
    return ExerciseRepo.findMany(query);
  }

  static async getExercise(id: string) {
    const exercise = await ExerciseRepo.findById(id);
    if (!exercise) {
      const error: any = new Error('Exercise not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return exercise;
  }

  static async getSubstitutes(id: string) {
    const exercise = await this.getExercise(id);

    // If explicit substitutes exist, fetch them
    if (exercise.substitutes && exercise.substitutes.length > 0) {
      const explicitSubs = await ExerciseRepo.findSubstitutes(exercise.substitutes);
      if (explicitSubs.length > 0) return explicitSubs;
    }

    // Heuristic fallback: same movement pattern & primary muscle
    const candidates = await ExerciseRepo.findMany({
      pattern: exercise.pattern,
      muscle: exercise.primaryMuscles[0],
      limit: 5
    });

    return candidates.filter(c => c.id !== exercise.id);
  }

  static async createExercise(data: CreateExerciseInput) {
    const existing = await ExerciseRepo.findByName(data.name);
    if (existing) {
      const error: any = new Error(`Exercise "${data.name}" already exists`);
      error.status = 409;
      error.code = 'CONFLICT';
      throw error;
    }
    return ExerciseRepo.create(data);
  }

  static async updateExercise(id: string, data: UpdateExerciseInput) {
    await this.getExercise(id);
    return ExerciseRepo.update(id, data);
  }

  static async deleteExercise(id: string) {
    await this.getExercise(id);
    return ExerciseRepo.delete(id);
  }
}
