import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as ctrl from '../controllers/riskResponses.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/',         ctrl.listRiskResponses);
router.get('/:id',     ctrl.getRiskResponse);
router.post('/',  requireRole('admin','risk_manager'), ctrl.createRiskResponse);
router.patch('/:id', requireRole('admin','risk_manager'), ctrl.updateRiskResponse);
router.delete('/:id', requireRole('admin'), ctrl.deleteRiskResponse);

export default router;
