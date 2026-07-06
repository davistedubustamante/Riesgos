import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as ctrl from '../controllers/stakeholders.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/',              ctrl.listStakeholders);
router.get('/:id',          ctrl.getStakeholder);
router.post('/',  requireRole('admin','risk_manager'), ctrl.createStakeholder);
router.patch('/:id', requireRole('admin','risk_manager'), ctrl.updateStakeholder);
router.delete('/:id', requireRole('admin'), ctrl.deleteStakeholder);

export default router;
