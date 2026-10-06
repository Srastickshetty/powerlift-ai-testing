/**
 * apps/api/src/modules/communication/communication.routes.ts
 * Express 5 router for messaging, media, video form check comments, and check-ins.
 */

import { Router } from 'express';
import { CommunicationService } from './communication.service';
import { SendMessageSchema, RequestUploadUrlSchema, RegisterMediaSchema, VideoCommentSchema, SubmitCheckinSchema } from './communication.schema';
import { requireAuth } from '../../middleware/requireAuth';

export const communicationRouter: Router = Router();
export const mediaRouter: Router = Router();
export const checkinRouter: Router = Router();

// ==========================================
// 1. Messaging Threads
// ==========================================
communicationRouter.get('/:threadId/messages', requireAuth, async (req, res, next) => {
  try {
    const threadId = req.params.threadId as string;
    const messages = await CommunicationService.getThreadMessages(threadId, req.ctx!.userId, req.ctx!.role);
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
});

communicationRouter.post('/:threadId/messages', requireAuth, async (req, res, next) => {
  try {
    const threadId = req.params.threadId as string;
    const input = SendMessageSchema.parse(req.body);
    const message = await CommunicationService.sendMessage(threadId, req.ctx!.userId, req.ctx!.role, input);
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. Media & Video Comments
// ==========================================
mediaRouter.post('/upload-url', requireAuth, async (req, res, next) => {
  try {
    const input = RequestUploadUrlSchema.parse(req.body);
    const result = await CommunicationService.generateUploadUrl(req.ctx!.userId, input);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

mediaRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const input = RegisterMediaSchema.parse(req.body);
    const media = await CommunicationService.registerMedia(req.ctx!.userId, input);
    res.status(201).json({ success: true, media });
  } catch (err) {
    next(err);
  }
});

mediaRouter.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const mediaId = req.params.id as string;
    const input = VideoCommentSchema.parse(req.body);
    const comment = await CommunicationService.addVideoComment(req.ctx!.userId, req.ctx!.role, mediaId, input);
    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
});

mediaRouter.get('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const mediaId = req.params.id as string;
    const comments = await CommunicationService.getVideoComments(req.ctx!.userId, req.ctx!.role, mediaId);
    res.json({ success: true, comments });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. Athlete Weekly Check-ins
// ==========================================
checkinRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const input = SubmitCheckinSchema.parse(req.body);
    const checkin = await CommunicationService.submitCheckin(req.ctx!.userId, input);
    res.status(201).json({ success: true, message: 'Check-in submitted successfully.', checkin });
  } catch (err) {
    next(err);
  }
});

checkinRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const checkins = await CommunicationService.getAthleteCheckins(req.ctx!.userId);
    res.json({ success: true, checkins });
  } catch (err) {
    next(err);
  }
});
