-- =====================================================
-- SISTEMA DE COLABORACIÓN Y MODO CLIENTE
-- "One-Click Review" para aprobación de diseños
-- =====================================================

-- =====================================================
-- 1. TABLA: project_shares
-- Enlaces compartidos para revisión de clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token único para el enlace compartido
  share_token TEXT NOT NULL UNIQUE,
  
  -- Configuración de permisos
  permissions JSONB NOT NULL DEFAULT '{
    "can_comment": true,
    "can_suggest_colors": false,
    "can_edit": false,
    "can_download": false
  }'::jsonb,
  
  -- Información del cliente (opcional)
  client_name TEXT,
  client_email TEXT,
  
  -- Estado del share
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked'
  expires_at TIMESTAMPTZ,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'revoked'))
);

-- Índices
CREATE INDEX idx_project_shares_token ON project_shares(share_token);
CREATE INDEX idx_project_shares_project ON project_shares(project_id);
CREATE INDEX idx_project_shares_owner ON project_shares(owner_id);
CREATE INDEX idx_project_shares_status ON project_shares(status);

-- =====================================================
-- 2. TABLA: project_comments
-- Comentarios con pins en ubicaciones específicas
-- =====================================================
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_id UUID REFERENCES project_shares(id) ON DELETE CASCADE,
  
  -- Autor del comentario
  author_type TEXT NOT NULL, -- 'owner', 'client', 'collaborator'
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL, -- Nombre del cliente si no está autenticado
  author_email TEXT,
  
  -- Contenido del comentario
  content TEXT NOT NULL,
  
  -- Ubicación del pin en el canvas
  pin_position JSONB, -- { "x": 150, "y": 200 }
  
  -- Estado del comentario
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'resolved', 'archived'
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Thread de respuestas
  parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_author_type CHECK (author_type IN ('owner', 'client', 'collaborator')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'resolved', 'archived'))
);

-- Índices
CREATE INDEX idx_project_comments_project ON project_comments(project_id);
CREATE INDEX idx_project_comments_share ON project_comments(share_id);
CREATE INDEX idx_project_comments_status ON project_comments(status);
CREATE INDEX idx_project_comments_parent ON project_comments(parent_comment_id);
CREATE INDEX idx_project_comments_created ON project_comments(created_at DESC);

-- =====================================================
-- 3. TABLA: project_tasks
-- Tareas generadas desde comentarios
-- =====================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES project_comments(id) ON DELETE SET NULL,
  
  -- Asignación
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contenido de la tarea
  title TEXT NOT NULL,
  description TEXT,
  
  -- Prioridad y estado
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  
  -- Fechas
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'review', 'done'))
);

-- Índices
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_priority ON project_tasks(priority);

-- =====================================================
-- 4. TABLA: project_approvals
-- Sistema de aprobaciones finales
-- =====================================================
CREATE TABLE IF NOT EXISTS project_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_id UUID NOT NULL REFERENCES project_shares(id) ON DELETE CASCADE,
  
  -- Aprobador
  approver_name TEXT NOT NULL,
  approver_email TEXT,
  
  -- Estado de aprobación
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'changes_requested'
  
  -- Feedback
  feedback TEXT,
  changes_requested TEXT[],
  
  -- Fechas
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  CONSTRAINT valid_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested'))
);

-- Índices
CREATE INDEX idx_project_approvals_project ON project_approvals(project_id);
CREATE INDEX idx_project_approvals_share ON project_approvals(share_id);
CREATE INDEX idx_project_approvals_status ON project_approvals(status);

-- =====================================================
-- 5. TABLA: realtime_cursors
-- Cursores en tiempo real para colaboración
-- =====================================================
CREATE TABLE IF NOT EXISTS realtime_cursors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Usuario
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL, -- Color del cursor
  
  -- Posición del cursor
  position JSONB NOT NULL, -- { "x": 100, "y": 200 }
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_realtime_cursors_project ON realtime_cursors(project_id);
CREATE INDEX idx_realtime_cursors_user ON realtime_cursors(user_id);
CREATE INDEX idx_realtime_cursors_active ON realtime_cursors(is_active);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- project_shares
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their project shares"
  ON project_shares FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view active shares with valid token"
  ON project_shares FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

-- project_comments
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view all comments"
  ON project_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_comments.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone with share link can view comments"
  ON project_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.id = project_comments.share_id
      AND project_shares.status = 'active'
    )
  );

CREATE POLICY "Anyone with share link can insert comments"
  ON project_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.id = share_id
      AND project_shares.status = 'active'
      AND (project_shares.permissions->>'can_comment')::boolean = true
    )
  );

CREATE POLICY "Comment authors can update their comments"
  ON project_comments FOR UPDATE
  USING (author_id = auth.uid() OR author_email = current_setting('request.jwt.claims', true)::json->>'email');

-- project_tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can manage tasks"
  ON project_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Assigned users can view their tasks"
  ON project_tasks FOR SELECT
  USING (assigned_to = auth.uid());

-- project_approvals
ALTER TABLE project_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view approvals"
  ON project_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_approvals.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone with share link can create approvals"
  ON project_approvals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.id = share_id
      AND project_shares.status = 'active'
    )
  );

-- realtime_cursors
ALTER TABLE realtime_cursors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cursors"
  ON realtime_cursors FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view cursors in shared projects"
  ON realtime_cursors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.project_id = realtime_cursors.project_id
      AND project_shares.status = 'active'
    )
  );

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Generar token único para share
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Limpiar cursores inactivos (más de 5 minutos sin actividad)
CREATE OR REPLACE FUNCTION cleanup_inactive_cursors()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM realtime_cursors
  WHERE last_seen_at < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear tarea desde comentario
CREATE OR REPLACE FUNCTION create_task_from_comment(
  p_comment_id UUID,
  p_assigned_to UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_comment RECORD;
  v_task_id UUID;
BEGIN
  -- Obtener información del comentario
  SELECT * INTO v_comment
  FROM project_comments
  WHERE id = p_comment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comment not found';
  END IF;
  
  -- Crear tarea
  INSERT INTO project_tasks (
    project_id,
    comment_id,
    assigned_to,
    created_by,
    title,
    description,
    priority,
    status
  ) VALUES (
    v_comment.project_id,
    p_comment_id,
    p_assigned_to,
    auth.uid(),
    'Comentario de cliente: ' || LEFT(v_comment.content, 50),
    v_comment.content,
    'medium',
    'todo'
  )
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Marcar comentario como resuelto
CREATE OR REPLACE FUNCTION resolve_comment(p_comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE project_comments
  SET 
    status = 'resolved',
    resolved_at = NOW(),
    resolved_by = auth.uid()
  WHERE id = p_comment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Actualizar access_count cuando se accede a un share
CREATE OR REPLACE FUNCTION update_share_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = NOW();
  NEW.access_count = OLD.access_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_share_access
  BEFORE UPDATE ON project_shares
  FOR EACH ROW
  WHEN (NEW.last_accessed_at IS DISTINCT FROM OLD.last_accessed_at)
  EXECUTE FUNCTION update_share_access();

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE project_shares IS 'Enlaces compartidos para revisión de clientes sin necesidad de login';
COMMENT ON TABLE project_comments IS 'Comentarios con pins en ubicaciones específicas del canvas';
COMMENT ON TABLE project_tasks IS 'Tareas generadas desde comentarios de clientes';
COMMENT ON TABLE project_approvals IS 'Sistema de aprobaciones finales de proyectos';
COMMENT ON TABLE realtime_cursors IS 'Cursores en tiempo real para colaboración sincronizada';

COMMENT ON COLUMN project_shares.share_token IS 'Token único para acceder al proyecto sin login';
COMMENT ON COLUMN project_shares.permissions IS 'Permisos configurables: comentar, sugerir colores, editar, descargar';
COMMENT ON COLUMN project_comments.pin_position IS 'Coordenadas X,Y del pin en el canvas';
COMMENT ON COLUMN project_comments.author_type IS 'Tipo de autor: owner (creativo), client (cliente), collaborator (colaborador)';
