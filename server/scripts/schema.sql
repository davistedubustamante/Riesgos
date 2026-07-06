-- Schema completo de RiskFlow Web (MySQL 8+/MariaDB 10.6+).
-- Idempotente: cada CREATE usa IF NOT EXISTS. Re-ejecutable sin romper nada.
-- Diseñado para gestión de riesgos según ISO 31000 + PMBOK + Scrum + MAGERIT/NIST.

SET NAMES utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- USERS / AUTH
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              VARCHAR(32)  NOT NULL,
  email           VARCHAR(160) NOT NULL,
  name            VARCHAR(160) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('admin', 'risk_manager', 'auditor', 'viewer') NOT NULL DEFAULT 'viewer',
  active          TINYINT(1) NOT NULL DEFAULT 1,
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  id              VARCHAR(64)  NOT NULL,           -- session id (token) = cookie value
  userId          VARCHAR(32)  NOT NULL,
  ip              VARCHAR(45),
  userAgent       VARCHAR(255),
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt       DATETIME NOT NULL,
  revokedAt       DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_sessions_user (userId),
  KEY idx_sessions_expires (expiresAt),
  CONSTRAINT fk_sessions_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- DOMINIO: project / context / sprint / risk
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            VARCHAR(32)  NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  type          VARCHAR(80),
  owner         VARCHAR(120),
  startDate     DATE,
  endDate       DATE,
  objective     TEXT,
  scope         TEXT,
  stakeholders  TEXT,
  technologies  TEXT,
  status        VARCHAR(40) DEFAULT 'Planificación',
  createdBy     VARCHAR(32)  NOT NULL,
  createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_projects_status (status),
  KEY idx_projects_creator (createdBy),
  CONSTRAINT fk_projects_users FOREIGN KEY (createdBy) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contexts (
  id                     VARCHAR(64)  NOT NULL,
  projectId              VARCHAR(32)  NOT NULL,
  internalContext        TEXT,
  externalContext        TEXT,
  criticalObjectives     TEXT,
  riskCriteria           TEXT,
  assets                 TEXT,
  affectedProcesses      TEXT,
  stakeholders           TEXT,
  legalFactors           TEXT,
  technologicalFactors   TEXT,
  organizationalFactors  TEXT,
  createdBy              VARCHAR(32)  NOT NULL,
  createdAt              DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contexts_project (projectId),
  CONSTRAINT fk_contexts_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_contexts_users    FOREIGN KEY (createdBy) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sprints (
  id                  VARCHAR(32)  NOT NULL,
  projectId           VARCHAR(32)  NOT NULL,
  name                VARCHAR(160) NOT NULL,
  goal                TEXT,
  startDate           DATE,
  endDate             DATE,
  planningNotes       TEXT,
  dailyImpediments    TEXT,
  reviewNotes         TEXT,
  retrospectiveNotes  TEXT,
  lessonsLearned      TEXT,
  createdBy           VARCHAR(32)  NOT NULL,
  createdAt           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sprints_project (projectId),
  CONSTRAINT fk_sprints_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_sprints_users    FOREIGN KEY (createdBy) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS risks (
  id                VARCHAR(32)  NOT NULL,
  code              VARCHAR(8)   NOT NULL,
  projectId         VARCHAR(32)  NOT NULL,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  category          VARCHAR(60),
  cause             TEXT,
  consequence       TEXT,
  probability       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  impact            TINYINT UNSIGNED NOT NULL DEFAULT 1,
  level             SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  classification    VARCHAR(20) NOT NULL,
  owner             VARCHAR(120),
  sprintId          VARCHAR(32),
  status            VARCHAR(40) DEFAULT 'Identificado',
  identifiedAt      DATE,
  alertIndicator    TEXT,
  responseStrategy  VARCHAR(40),
  treatmentAction   TEXT,
  reviewDate        DATE,
  evidence          TEXT,
  expectedResult    TEXT,
  observations      TEXT,
  createdBy         VARCHAR(32)  NOT NULL,
  createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_risks_project_code (projectId, code),
  KEY idx_risks_project (projectId),
  KEY idx_risks_sprint (sprintId),
  KEY idx_risks_classification (classification),
  KEY idx_risks_status (status),
  KEY idx_risks_creator (createdBy),
  CONSTRAINT fk_risks_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_risks_sprints FOREIGN KEY (sprintId)  REFERENCES sprints(id) ON DELETE SET NULL,
  CONSTRAINT fk_risks_users    FOREIGN KEY (createdBy) REFERENCES users(id),
  CONSTRAINT chk_risks_p CHECK (probability BETWEEN 1 AND 5),
  CONSTRAINT chk_risks_i CHECK (impact      BETWEEN 1 AND 5),
  CONSTRAINT chk_risks_l CHECK (level BETWEEN 1 AND 25),
  -- Campos adicionales PMBOK 8 / Gestión de Riesgos extendida
  domain_pmbok     VARCHAR(40)   DEFAULT NULL,   -- Dominio PMBOK 8 del riesgo
  process_pmbok    VARCHAR(60)   DEFAULT NULL,   -- Proceso PMBOK 8 del dominio riesgo
  risk_type        ENUM('Amenaza','Oportunidad') DEFAULT 'Amenaza', -- Tipo PMBOK 8
  exposure_soles   DECIMAL(12,2) DEFAULT NULL,   -- Exposición económica en S/.
  response_plan    TEXT          DEFAULT NULL,   -- Plan de respuesta detallado
  response_status  VARCHAR(20)   DEFAULT 'Abierto', -- Estado del plan: Abierto/En proceso/Cerrado
  response_deadline INT          DEFAULT NULL    -- Plazo en días para la respuesta
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- STAKEHOLDERS (Dominio de Desempeño de los Interesados — PMBOK 8)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stakeholders (
  id                VARCHAR(32)  NOT NULL,
  projectId         VARCHAR(32)  NOT NULL,
  code              VARCHAR(8)   NOT NULL,
  name              VARCHAR(160) NOT NULL,
  type              VARCHAR(40)  NOT NULL,  -- Interno, Externo, Cliente, Regulador
  ring              VARCHAR(20)  NOT NULL,  -- Anillo 1 (Inmediato), Anillo 2 (Medio), Anillo 3 (Externo)
  power             TINYINT UNSIGNED DEFAULT 1,  -- Poder (1-5)
  influence         TINYINT UNSIGNED DEFAULT 1,  -- Influencia (1-5)
  interest          TINYINT UNSIGNED DEFAULT 1,  -- Interés (1-5)
  commitment_actual  TINYINT UNSIGNED DEFAULT 1,  -- Compromiso actual (1-5)
  commitment_desired TINYINT UNSIGNED DEFAULT 1,  -- Compromiso deseado (1-5)
  strategy_mendelow VARCHAR(40)  DEFAULT NULL,  -- Gestionar activamente / Mantener informados / Mantener satisfechos / Monitorear
  quadrant_inf_pow VARCHAR(60)   DEFAULT NULL,  -- Cuadrante Influencia × Poder
  action           TEXT         DEFAULT NULL,  -- Acción concreta recomendada
  createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_stakeholders_project_code (projectId, code),
  KEY idx_stakeholders_project (projectId),
  CONSTRAINT fk_stakeholders_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- ACTIVITIES (176 actividades del proyecto Madame Crebe — PMBOK 8)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id                VARCHAR(32)  NOT NULL,
  projectId         VARCHAR(32)  NOT NULL,
  code              VARCHAR(16)  NOT NULL,
  sub_code          VARCHAR(16)  DEFAULT NULL,
  deliverable       VARCHAR(8)   NOT NULL,  -- E1, E2, ..., E7
  month             VARCHAR(12)  NOT NULL,  -- Mes 01, Mes 02, ..., Mes 08
  objective         VARCHAR(40)  DEFAULT NULL,  -- OBJ-1, OBJ-2, OBJ-3, OBJ-4
  name              VARCHAR(255) NOT NULL,
  role_main         VARCHAR(80)  DEFAULT NULL,  -- Rol principal PMBOK 8
  domain_pmbok       VARCHAR(40)  DEFAULT NULL,  -- Dominio PMBOK 8 (Incertidumbre, Ambigüedad, Complejidad, Volatilidad)
  uncertainty_type   VARCHAR(20)  DEFAULT NULL,  -- I (Incertidumbre), A (Ambigüedad), C (Complejidad), V (Volatilidad)
  risk_type         VARCHAR(20)  DEFAULT NULL,  -- Amenaza / Oportunidad
  probability       TINYINT UNSIGNED DEFAULT 3,
  impact            TINYINT UNSIGNED DEFAULT 3,
  level             SMALLINT UNSIGNED DEFAULT 9,
  classification    VARCHAR(20)  DEFAULT 'Medio',  -- Bajo / Medio / Alto / Crítico
  createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_activities_project_code (projectId, code),
  KEY idx_activities_project (projectId),
  KEY idx_activities_deliverable (deliverable),
  KEY idx_activities_month (month),
  KEY idx_activities_classification (classification),
  CONSTRAINT fk_activities_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- RESOURCES (Catálogo unificado: 17 RRHH + 10 Físicos Tec + 8 Mat + 28 Virtuales)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id                VARCHAR(32)  NOT NULL,
  projectId         VARCHAR(32)  NOT NULL,
  code              VARCHAR(10)  NOT NULL,
  category          ENUM('RRHH','FisicoTecnologico','FisicoMaterial','Virtual') NOT NULL,
  name              VARCHAR(160) NOT NULL,
  description       TEXT         DEFAULT NULL,
  createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resources_project_code (projectId, code),
  KEY idx_resources_project (projectId),
  KEY idx_resources_category (category),
  CONSTRAINT fk_resources_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- ACTIVITY_RESOURCES (Relación N:M entre activities y resources)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_resources (
  id              VARCHAR(32)  NOT NULL,
  activityId      VARCHAR(32)  NOT NULL,
  resourceId      VARCHAR(32)  NOT NULL,
  resource_type   ENUM('human','physical_tech','physical_mat','virtual') NOT NULL,
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ar_activity (activityId),
  KEY idx_ar_resource (resourceId),
  CONSTRAINT fk_ar_activities FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_ar_resources  FOREIGN KEY (resourceId)  REFERENCES resources(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- RISK_RESPONSES (Plan de respuesta a riesgos — PMBOK 8 Risk Domain)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_responses (
  id                VARCHAR(32)  NOT NULL,
  riskId            VARCHAR(32)  NOT NULL,
  projectId         VARCHAR(32)  NOT NULL,
  action            TEXT         NOT NULL,  -- Acción de respuesta concreta
  deadline_days     INT          DEFAULT 30,  -- Plazo en días
  status            VARCHAR(20)  DEFAULT 'Abierto',  -- Abierto / En proceso / Cerrado
  createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rr_risk (riskId),
  KEY idx_rr_project (projectId),
  CONSTRAINT fk_rr_risks   FOREIGN KEY (riskId)   REFERENCES risks(id)   ON DELETE CASCADE,
  CONSTRAINT fk_rr_projects FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- AUDITORÍA ligera
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  userId      VARCHAR(32),
  action      VARCHAR(60) NOT NULL,   -- 'login', 'logout', 'create_risk', 'update_risk', ...
  entityType  VARCHAR(40),            -- 'risk', 'project', ...
  entityId    VARCHAR(64),
  meta        JSON,
  ip          VARCHAR(45),
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user (userId),
  KEY idx_audit_action (action),
  KEY idx_audit_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
