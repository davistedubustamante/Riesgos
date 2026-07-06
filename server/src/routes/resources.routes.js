import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as ctrl from '../controllers/resources.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/',                        ctrl.listResources);
router.get('/by-activity',             ctrl.getResourceByActivity);
router.get('/:id',                    ctrl.getResource);
router.post('/',         requireRole('admin','risk_manager'), ctrl.createResource);
router.delete('/:id',    requireRole('admin'), ctrl.deleteResource);
router.post('/link',    requireRole('admin','risk_manager'), ctrl.linkResourceToActivity);
router.post('/unlink',  requireRole('admin','risk_manager'), ctrl.unlinkResourceFromActivity);

export default router;
