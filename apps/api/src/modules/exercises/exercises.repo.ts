import { prisma } from '../../lib/prisma';
import { Track } from '@prisma/client';
import { ExerciseQuery, CreateExerciseInput, UpdateExerciseInput } from './exercises.schema';

export class ExerciseRepo {
  static async findMany(query: ExerciseQuery) {
    const { search, track, pattern, muscle, equipment, isCompetitionLift, limit, cursor } = query;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (track) {
      where.trackTags = { has: track as Track };
    }

    if (pattern) {
      where.pattern = { equals: pattern, mode: 'insensitive' };
    }

    if (muscle) {
      where.primaryMuscles = { has: muscle.toLowerCase() };
    }

    if (equipment) {
      where.equipment = { has: equipment.toLowerCase() };
    }

    if (typeof isCompetitionLift === 'boolean') {
      where.isCompetitionLift = isCompetitionLift;
    }

    return prisma.exercise.findMany({
      where,
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ isCompetitionLift: 'desc' }, { name: 'asc' }]
    });
  }

  static async findById(id: string) {
    return prisma.exercise.findUnique({
      where: { id }
    });
  }

  static async findByName(name: string) {
    return prisma.exercise.findUnique({
      where: { name }
    });
  }

  static async findSubstitutes(substituteNames: string[]) {
    if (!substituteNames || substituteNames.length === 0) return [];
    return prisma.exercise.findMany({
      where: {
        name: { in: substituteNames }
      }
    });
  }

  static async create(data: CreateExerciseInput) {
    return prisma.exercise.create({
      data: {
        ...data,
        trackTags: data.trackTags as Track[]
      }
    });
  }

  static async update(id: string, data: UpdateExerciseInput) {
    return prisma.exercise.update({
      where: { id },
      data: {
        ...data,
        ...(data.trackTags ? { trackTags: data.trackTags as Track[] } : {})
      }
    });
  }

  static async delete(id: string) {
    return prisma.exercise.delete({
      where: { id }
    });
  }
}
