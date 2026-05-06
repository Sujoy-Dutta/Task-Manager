import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema, createTaskSchema, updateTaskSchema } from '../schemas/task.schema';

const router = Router();

router.use(authMiddleware);

router.get('/',             getTasks);
router.get('/:id',          validate(idParamSchema, 'params'),                              getTask);
router.post('/',            validate(createTaskSchema),                                      createTask);
router.put('/:id',          validate(idParamSchema, 'params'), validate(updateTaskSchema),   updateTask);
router.patch('/:id/toggle', validate(idParamSchema, 'params'),                              toggleTask);
router.delete('/:id',       validate(idParamSchema, 'params'),                              deleteTask);

export default router;
