import { Router } from 'express';
import * as commentController from './comment.controller';
import { authenticate } from '../../shared/middlewares/auth';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  taskIdParamSchema,
} from './comment.validation';

const router = Router();
router.use(authenticate);

router.get(
  '/task/:taskId',
  validateRequest(taskIdParamSchema),
  commentController.getCommentsByTask
);
router.post(
  '/task/:taskId',
  validateRequest({ taskIdParamSchema, createCommentSchema }),
  commentController.createComment
);
router.patch(
  '/:id',
  validateRequest({ commentIdParamSchema, updateCommentSchema }),
  commentController.updateComment
);
router.delete('/:id', validateRequest(commentIdParamSchema), commentController.deleteComment);

export default router;
