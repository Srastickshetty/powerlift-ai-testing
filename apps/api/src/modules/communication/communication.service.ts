/**
 * apps/api/src/modules/communication/communication.service.ts
 * Messaging, media storage, timestamped video comments, and weekly check-in processing.
 * Strictly adheres to small files rule (<400 lines).
 */

import { prisma } from '../../lib/prisma';
import { SendMessageInput, RequestUploadUrlInput, RegisterMediaInput, VideoCommentInput, SubmitCheckinInput } from './communication.schema';
import { AlertScannerService } from '../coaching/alertScanner.service';
import { logger } from '../../lib/logger';

export class CommunicationService {
  /**
   * Verifies that the user has authorization for the given thread.
   * Threads are linked to a coach-athlete pair.
   */
  static async verifyThreadAccess(threadId: string, userId: string, role: string) {
    if (role === 'admin') return true;

    // Thread ID format: thread_<coachId>_<athleteId> or custom UUID
    if (threadId.startsWith('thread_')) {
      const parts = threadId.split('_');
      const coachId = parts[1];
      const athleteId = parts[2];

      if (userId !== coachId && userId !== athleteId) {
        const err: any = new Error('Access denied: You are not a participant in this conversation thread.');
        err.status = 403;
        throw err;
      }

      // Check active coaching relationship
      const link = await prisma.coachAthlete.findFirst({
        where: { coachId, athleteId, status: 'ACTIVE' }
      });

      if (!link) {
        const err: any = new Error('Messaging requires an active coaching relationship.');
        err.status = 403;
        throw err;
      }
      return true;
    }

    return true;
  }

  /**
   * Fetches messages for a thread and marks unread messages as read.
   */
  static async getThreadMessages(threadId: string, userId: string, role: string) {
    await this.verifyThreadAccess(threadId, userId, role);

    const messages = await prisma.message.findMany({
      where: { threadId },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages from other user as read
    await prisma.message.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        readAt: null
      },
      data: { readAt: new Date() }
    });

    return messages;
  }

  /**
   * Sends a message in a thread.
   */
  static async sendMessage(threadId: string, senderId: string, role: string, input: SendMessageInput) {
    await this.verifyThreadAccess(threadId, senderId, role);

    const message = await prisma.message.create({
      data: {
        threadId,
        senderId,
        body: input.body,
        mediaId: input.mediaId
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    logger.info({ threadId, senderId, messageId: message.id }, 'Message sent in thread');

    return message;
  }

  /**
   * Generates a signed or mock storage upload URL with size limits.
   */
  static async generateUploadUrl(ownerId: string, input: RequestUploadUrlInput) {
    const ext = input.fileName.split('.').pop() || 'mp4';
    const storageKey = `media/${ownerId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadUrl = `/api/v1/media/mock-upload/${encodeURIComponent(storageKey)}`;

    return {
      storageKey,
      uploadUrl,
      maxSizeBytes: input.sizeBytes,
      contentType: input.contentType,
      expiresInSeconds: 3600
    };
  }

  /**
   * Registers uploaded media in the database.
   */
  static async registerMedia(ownerId: string, input: RegisterMediaInput) {
    return prisma.media.create({
      data: {
        ownerId,
        kind: input.kind as any,
        storageKey: input.storageKey,
        visibility: input.visibility as any
      }
    });
  }

  /**
   * Adds a timestamped video annotation comment (e.g. form check at 1.4s).
   */
  static async addVideoComment(authorId: string, authorRole: string, mediaId: string, input: VideoCommentInput) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      const err: any = new Error('Media not found.');
      err.status = 404;
      throw err;
    }

    // Must be owner or active coach of owner
    if (authorRole !== 'admin' && media.ownerId !== authorId) {
      const link = await prisma.coachAthlete.findFirst({
        where: { coachId: authorId, athleteId: media.ownerId, status: 'ACTIVE' }
      });
      if (!link) {
        const err: any = new Error('Access denied to comment on this media item.');
        err.status = 403;
        throw err;
      }
    }

    return prisma.videoComment.create({
      data: {
        mediaId,
        authorId,
        tMs: input.tMs,
        body: input.body
      }
    });
  }

  /**
   * Retrieves timestamped comments for a media asset.
   */
  static async getVideoComments(userId: string, userRole: string, mediaId: string) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      const err: any = new Error('Media not found.');
      err.status = 404;
      throw err;
    }

    if (userRole !== 'admin' && media.ownerId !== userId) {
      const link = await prisma.coachAthlete.findFirst({
        where: { coachId: userId, athleteId: media.ownerId, status: 'ACTIVE' }
      });
      if (!link) {
        const err: any = new Error('Access denied.');
        err.status = 403;
        throw err;
      }
    }

    return prisma.videoComment.findMany({
      where: { mediaId },
      orderBy: { tMs: 'asc' }
    });
  }

  /**
   * Athlete submits a weekly check-in.
   */
  static async submitCheckin(athleteId: string, input: SubmitCheckinInput) {
    const weekStart = input.weekStart ? new Date(input.weekStart) : new Date();

    const checkin = await prisma.checkin.create({
      data: {
        athleteId,
        weekStart,
        data: input.data as any,
        photos: input.photos,
        status: 'pending'
      }
    });

    // Run alert scanner to update traffic lights & coach alert feed
    await AlertScannerService.scanAthlete(athleteId);

    return checkin;
  }

  /**
   * Fetches check-in history for an athlete.
   */
  static async getAthleteCheckins(athleteId: string) {
    return prisma.checkin.findMany({
      where: { athleteId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
