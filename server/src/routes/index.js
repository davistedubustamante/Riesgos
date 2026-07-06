import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as projects from '../controllers/projects.controller.js';
import * as contexts from '../controllers/contexts.controller.js';
import * as risks from '../controllers/risks.controller.js';
import * as sprints from '../controllers/sprints.controller.js';
import * as stakeholders from '../controllers/stakeholders.controller.js';
import * as activities from '../controllers/activities.controller.js';
import * as resources from '../controllers/resources.controller.js';
import * as riskResponses from '../controllers/riskResponses.controller.js';
import * as dashboard from '../controllers/dashboard.controller.js';
import * as heatmap from '../controllers/heatmap.controller.js';
import * as auth from '../controllers/auth.controller.js';
import * as users from '../controllers/users.controller.js';
import * as audit from '../controllers/audit.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const api = Router();

api.get('/health', (_req, res) => res.json({ status: 'ok', app: 'RiskFlow Web API' }));

// ── Auth (público) ────────────────────────────────────────────────
api.post('/auth/register', asyncHandler(auth.register));
api.post('/auth/login',    asyncHandler(auth.login));
api.post('/auth/logout',   asyncHandler(auth.logout));
api.get('/auth/me',        requireAuth, asyncHandler(auth.me));

// ── Users & Audit Management ─────────────────────────────────────
api.get('/audit',             requireAuth, requireRole('audit.read'), asyncHandler(audit.listAuditLogs));
api.get('/users',             requireAuth, requireRole('admin'), asyncHandler(users.listUsers));
api.put('/users/:id/status',  requireAuth, requireRole('admin'), asyncHandler(users.updateUserStatus));
api.put('/users/:id/role',    requireAuth, requireRole('admin'), asyncHandler(users.updateUserRole));

// ── Projects ───────────────────────────────────────────────────────
api.get('/projects',            requireAuth, requireRole('projects.read'),  asyncHandler(projects.listProjects));
api.get('/projects/:id',        requireAuth, requireRole('projects.read'),  asyncHandler(projects.getProject));
api.post('/projects',           requireAuth, requireRole('projects.write'), asyncHandler(projects.createProject));
api.put('/projects/:id',        requireAuth, requireRole('projects.write'), asyncHandler(projects.updateProject));
api.delete('/projects/:id',     requireAuth, requireRole('projects.write'), asyncHandler(projects.deleteProject));

// ── Context (ISO 31000) ────────────────────────────────────────────
api.get('/projects/:projectId/context',  requireAuth, requireRole('contexts.read'),  asyncHandler(contexts.getContext));
api.post('/projects/:projectId/context', requireAuth, requireRole('contexts.write'), asyncHandler(contexts.upsertContext));
api.put('/projects/:projectId/context',  requireAuth, requireRole('contexts.write'), asyncHandler(contexts.upsertContext));

// ── Risks ──────────────────────────────────────────────────────────
api.get('/risks',                  requireAuth, requireRole('risks.read'),  asyncHandler(risks.listRisks));
api.get('/risks/:id',              requireAuth, requireRole('risks.read'),  asyncHandler(risks.getRisk));
api.post('/risks',                 requireAuth, requireRole('risks.write'), asyncHandler(risks.createRisk));
api.put('/risks/:id',              requireAuth, requireRole('risks.write'), asyncHandler(risks.updateRisk));
api.delete('/risks/:id',           requireAuth, requireRole('risks.write'), asyncHandler(risks.deleteRisk));
api.get('/projects/:projectId/risks', requireAuth, requireRole('risks.read'), asyncHandler(risks.listRisks));

// ── Sprints ────────────────────────────────────────────────────────
api.get('/projects/:projectId/sprints', requireAuth, requireRole('sprints.read'),  asyncHandler(sprints.listSprintsByProject));
api.get('/sprints/:id',                 requireAuth, requireRole('sprints.read'),  asyncHandler(sprints.getSprint));
api.post('/projects/:projectId/sprints', requireAuth, requireRole('sprints.write'), asyncHandler(sprints.createSprint));
api.put('/sprints/:id',                 requireAuth, requireRole('sprints.write'), asyncHandler(sprints.updateSprint));
api.delete('/sprints/:id',              requireAuth, requireRole('sprints.write'), asyncHandler(sprints.deleteSprint));

// ── Stakeholders ──────────────────────────────────────────────────
api.get('/stakeholders',                 requireAuth, requireRole('risks.read'),  asyncHandler(stakeholders.listStakeholders));
api.get('/stakeholders/:id',             requireAuth, requireRole('risks.read'),  asyncHandler(stakeholders.getStakeholder));
api.post('/stakeholders',                requireAuth, requireRole('risks.write'), asyncHandler(stakeholders.createStakeholder));
api.patch('/stakeholders/:id',           requireAuth, requireRole('risks.write'), asyncHandler(stakeholders.updateStakeholder));
api.delete('/stakeholders/:id',          requireAuth, requireRole('admin'),        asyncHandler(stakeholders.deleteStakeholder));

// ── Activities ─────────────────────────────────────────────────────
api.get('/activities',                   requireAuth, requireRole('risks.read'),  asyncHandler(activities.listActivities));
api.get('/activities/summary',           requireAuth, requireRole('dashboard.read'), asyncHandler(activities.getActivitiesSummary));
api.get('/activities/:id',              requireAuth, requireRole('risks.read'),  asyncHandler(activities.getActivity));
api.post('/activities',                  requireAuth, requireRole('risks.write'), asyncHandler(activities.createActivity));
api.patch('/activities/:id',            requireAuth, requireRole('risks.write'), asyncHandler(activities.updateActivity));
api.delete('/activities/:id',           requireAuth, requireRole('admin'),        asyncHandler(activities.deleteActivity));

// ── Resources ──────────────────────────────────────────────────────
api.get('/resources',                    requireAuth, requireRole('risks.read'),  asyncHandler(resources.listResources));
api.get('/resources/by-activity',        requireAuth, requireRole('risks.read'),  asyncHandler(resources.getResourceByActivity));
api.get('/resources/:id',              requireAuth, requireRole('risks.read'),  asyncHandler(resources.getResource));
api.post('/resources',                  requireAuth, requireRole('risks.write'), asyncHandler(resources.createResource));
api.delete('/resources/:id',           requireAuth, requireRole('admin'),        asyncHandler(resources.deleteResource));
api.post('/resources/link',             requireAuth, requireRole('risks.write'), asyncHandler(resources.linkResourceToActivity));
api.post('/resources/unlink',           requireAuth, requireRole('risks.write'), asyncHandler(resources.unlinkResourceFromActivity));

// ── Risk Responses ─────────────────────────────────────────────────
api.get('/risk-responses',               requireAuth, requireRole('risks.read'),  asyncHandler(riskResponses.listRiskResponses));
api.get('/risk-responses/:id',           requireAuth, requireRole('risks.read'),  asyncHandler(riskResponses.getRiskResponse));
api.post('/risk-responses',              requireAuth, requireRole('risks.write'), asyncHandler(riskResponses.createRiskResponse));
api.patch('/risk-responses/:id',        requireAuth, requireRole('risks.write'), asyncHandler(riskResponses.updateRiskResponse));
api.delete('/risk-responses/:id',       requireAuth, requireRole('admin'),        asyncHandler(riskResponses.deleteRiskResponse));

// ── Dashboard / Heatmap ────────────────────────────────────────────
api.get('/dashboard/:projectId', requireAuth, requireRole('dashboard.read'), asyncHandler(dashboard.getDashboard));
api.get('/heatmap/:projectId',   requireAuth, requireRole('heatmap.read'),   asyncHandler(heatmap.getHeatmap));

export default api;
