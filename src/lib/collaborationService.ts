/**
 * SERVICIO DE COLABORACIÓN EN TIEMPO REAL
 * Sistema "One-Click Review" para aprobación de diseños
 */

import { getSupabaseClient } from './supabaseClient';

// =====================================================
// TIPOS DE DATOS
// =====================================================

export interface SharePermissions {
  can_comment: boolean;
  can_suggest_colors: boolean;
  can_edit: boolean;
  can_download: boolean;
}

export interface ProjectShare {
  id: string;
  project_id: string;
  owner_id: string;
  share_token: string;
  permissions: SharePermissions;
  client_name?: string;
  client_email?: string;
  status: 'active' | 'expired' | 'revoked';
  expires_at?: string;
  created_at: string;
  access_count: number;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  share_id?: string;
  author_type: 'owner' | 'client' | 'collaborator';
  author_id?: string;
  author_name: string;
  author_email?: string;
  content: string;
  pin_position?: { x: number; y: number };
  status: 'open' | 'resolved' | 'archived';
  resolved_at?: string;
  parent_comment_id?: string;
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  comment_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface ProjectApproval {
  id: string;
  project_id: string;
  share_id: string;
  approver_name: string;
  approver_email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  feedback?: string;
  changes_requested?: string[];
  requested_at: string;
  responded_at?: string;
}

export interface RealtimeCursor {
  id: string;
  project_id: string;
  user_id?: string;
  user_name: string;
  user_color: string;
  position: { x: number; y: number };
  is_active: boolean;
  last_seen_at: string;
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

export const collaborationService = {
  /**
   * Crear enlace compartido para revisión
   */
  async createShare(
    projectId: string,
    permissions: Partial<SharePermissions> = {},
    clientInfo?: { name?: string; email?: string },
    expiresInDays?: number
  ): Promise<ProjectShare | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const defaultPermissions: SharePermissions = {
        can_comment: true,
        can_suggest_colors: false,
        can_edit: false,
        can_download: false,
        ...permissions
      };

      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Generar token único
      const { data: tokenData } = await supabase.rpc('generate_share_token');
      const shareToken = tokenData || Math.random().toString(36).substring(2, 15);

      const { data, error } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          share_token: shareToken,
          permissions: defaultPermissions,
          client_name: clientInfo?.name,
          client_email: clientInfo?.email,
          expires_at: expiresAt,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating share:', error);
        return null;
      }

      console.log('✅ Share link created:', data.share_token);
      return data;
    } catch (error) {
      console.error('Error in createShare:', error);
      return null;
    }
  },

  /**
   * Obtener información de un share por token
   */
  async getShareByToken(token: string): Promise<ProjectShare | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('project_shares')
      .select('*')
      .eq('share_token', token)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error getting share:', error);
      return null;
    }

    return data;
  },

  /**
   * Revocar un enlace compartido
   */
  async revokeShare(shareId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('project_shares')
      .update({ status: 'revoked' })
      .eq('id', shareId);

    if (error) {
      console.error('Error revoking share:', error);
      return false;
    }

    console.log('✅ Share revoked');
    return true;
  },

  /**
   * Crear comentario con pin
   */
  async createComment(
    projectId: string,
    content: string,
    authorInfo: {
      type: 'owner' | 'client' | 'collaborator';
      name: string;
      email?: string;
      id?: string;
    },
    pinPosition?: { x: number; y: number },
    shareId?: string,
    parentCommentId?: string
  ): Promise<ProjectComment | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          share_id: shareId,
          author_type: authorInfo.type,
          author_id: authorInfo.id,
          author_name: authorInfo.name,
          author_email: authorInfo.email,
          content,
          pin_position: pinPosition,
          parent_comment_id: parentCommentId,
          status: 'open'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        return null;
      }

      console.log('💬 Comment created:', data.id);
      return data;
    } catch (error) {
      console.error('Error in createComment:', error);
      return null;
    }
  },

  /**
   * Obtener comentarios de un proyecto
   */
  async getComments(projectId: string): Promise<ProjectComment[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Resolver comentario
   */
  async resolveComment(commentId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { data, error } = await supabase.rpc('resolve_comment', {
      p_comment_id: commentId
    });

    if (error) {
      console.error('Error resolving comment:', error);
      return false;
    }

    console.log('✅ Comment resolved');
    return data;
  },

  /**
   * Crear tarea desde comentario
   */
  async createTaskFromComment(
    commentId: string,
    assignedTo?: string
  ): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.rpc('create_task_from_comment', {
      p_comment_id: commentId,
      p_assigned_to: assignedTo
    });

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    console.log('✅ Task created from comment');
    return data;
  },

  /**
   * Obtener tareas de un proyecto
   */
  async getTasks(projectId: string): Promise<ProjectTask[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Actualizar estado de tarea
   */
  async updateTaskStatus(
    taskId: string,
    status: 'todo' | 'in_progress' | 'review' | 'done'
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const updates: any = { status };
    if (status === 'done') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return false;
    }

    console.log('✅ Task updated');
    return true;
  },

  /**
   * Crear solicitud de aprobación
   */
  async requestApproval(
    projectId: string,
    shareId: string,
    approverInfo: { name: string; email?: string }
  ): Promise<ProjectApproval | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('project_approvals')
      .insert({
        project_id: projectId,
        share_id: shareId,
        approver_name: approverInfo.name,
        approver_email: approverInfo.email,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error requesting approval:', error);
      return null;
    }

    console.log('✅ Approval requested');
    return data;
  },

  /**
   * Responder a solicitud de aprobación
   */
  async respondToApproval(
    approvalId: string,
    status: 'approved' | 'rejected' | 'changes_requested',
    feedback?: string,
    changesRequested?: string[]
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('project_approvals')
      .update({
        status,
        feedback,
        changes_requested: changesRequested,
        responded_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    if (error) {
      console.error('Error responding to approval:', error);
      return false;
    }

    console.log('✅ Approval response recorded');
    return true;
  },

  /**
   * Actualizar posición del cursor en tiempo real
   */
  async updateCursor(
    projectId: string,
    userName: string,
    position: { x: number; y: number },
    userColor: string,
    userId?: string
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('realtime_cursors')
      .upsert({
        project_id: projectId,
        user_id: userId,
        user_name: userName,
        user_color: userColor,
        position,
        is_active: true,
        last_seen_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating cursor:', error);
      return false;
    }

    return true;
  },

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToProject(
    projectId: string,
    callbacks: {
      onComment?: (comment: ProjectComment) => void;
      onTask?: (task: ProjectTask) => void;
      onCursor?: (cursor: RealtimeCursor) => void;
      onApproval?: (approval: ProjectApproval) => void;
    }
  ) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    // Suscribirse a comentarios
    const commentsChannel = supabase
      .channel(`project-comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_comments',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          callbacks.onComment?.(payload.new as ProjectComment);
        }
      )
      .subscribe();

    // Suscribirse a cursores
    const cursorsChannel = supabase
      .channel(`project-cursors-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'realtime_cursors',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callbacks.onCursor?.(payload.new as RealtimeCursor);
          }
        }
      )
      .subscribe();

    // Retornar función de cleanup
    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(cursorsChannel);
    };
  },

  /**
   * Generar URL de share
   */
  generateShareUrl(shareToken: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://appcreativo.vercel.app';
    return `${baseUrl}/review/${shareToken}`;
  }
};

export default collaborationService;
