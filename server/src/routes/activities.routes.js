import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as ctrl from '../controllers/activities.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/',                  ctrl.listActivities);
router.get('/summary',           ctrl.getActivitiesSummary);
router.get('/:id',              ctrl.getActivity);
router.post('/',   requireRole('admin','risk_manager'), ctrl.createActivity);
router.patch('/:id', requireRole('admin','risk_manager'), ctrl.updateActivity);
router.delete('/:id', requireRole('admin'), ctrl.deleteActivity);

export default router;
