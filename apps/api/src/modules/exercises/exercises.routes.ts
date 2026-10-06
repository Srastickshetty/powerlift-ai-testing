import { Router } from 'express';
import { ExerciseService } from './exercises.service';
import { ExerciseQuerySchema, CreateExerciseSchema, UpdateExerciseSchema } from './exercises.schema';
import { requireAuth, requireRole } from '../../middleware/requireAuth';

export const exerciseRouter: Router = Router();

// GET /api/v1/exercises - list & filter exercises
exerciseRouter.get('/', async (req, res, next) => {
  try {
    const query = ExerciseQuerySchema.parse(req.query);
    const exercises = await ExerciseService.listExercises(query);
    res.json({
      success: true,
      count: exercises.length,
      exercises
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/exercises/:id - get single exercise details
exerciseRouter.get('/:id', async (req, res, next) => {
  try {
    const exercise = await ExerciseService.getExercise(req.params.id);
    res.json({
      success: true,
      exercise
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/exercises/:id/substitutes - find appropriate substitutions
exerciseRouter.get('/:id/substitutes', async (req, res, next) => {
  try {
    const substitutes = await ExerciseService.getSubstitutes(req.params.id);
    res.json({
      success: true,
      count: substitutes.length,
      substitutes
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/exercises - Admin create exercise
exerciseRouter.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const input = CreateExerciseSchema.parse(req.body);
    const exercise = await ExerciseService.createExercise(input);
    res.status(201).json({
      success: true,
      exercise
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/exercises/:id - Admin update exercise
exerciseRouter.patch('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const input = UpdateExerciseSchema.parse(req.body);
    const exercise = await ExerciseService.updateExercise(req.params.id as string, input);
    res.json({
      success: true,
      exercise
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/exercises/:id - Admin delete exercise
exerciseRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    await ExerciseService.deleteExercise(req.params.id as string);
    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});
