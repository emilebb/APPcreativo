/**
 * Panel de Comentarios con Pins
 * Muestra comentarios de clientes y permite crear tareas
 */

'use client';

import { useState } from 'react';
import { MessageSquare, MapPin, Check, Clock, ArrowRight } from 'lucide-react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { ProjectComment } from '@/lib/collaborationService';

interface CommentsPanelProps {
  projectId: string;
  onPinClick?: (position: { x: number; y: number }) => void;
}

export function CommentsPanel({ projectId, onPinClick }: CommentsPanelProps) {
  const { comments, resolveComment, createTaskFromComment } = useCollaboration(projectId);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  const openComments = comments.filter(c => c.status === 'open');
  const resolvedComments = comments.filter(c => c.status === 'resolved');

  const handleResolve = async (commentId: string) => {
    await resolveComment(commentId);
  };

  const handleCreateTask = async (commentId: string) => {
    await createTaskFromComment(commentId);
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Comentarios
          </h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {openComments.length} abiertos
          </span>
          <span className="text-gray-400 dark:text-gray-500">
            {resolvedComments.length} resueltos
          </span>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Open Comments */}
        {openComments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Pendientes
            </h3>
            {openComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isSelected={selectedComment === comment.id}
                onSelect={() => setSelectedComment(comment.id)}
                onResolve={() => handleResolve(comment.id)}
                onCreateTask={() => handleCreateTask(comment.id)}
                onPinClick={onPinClick}
              />
            ))}
          </div>
        )}

        {/* Resolved Comments */}
        {resolvedComments.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Resueltos
            </h3>
            {resolvedComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isSelected={selectedComment === comment.id}
                onSelect={() => setSelectedComment(comment.id)}
                onPinClick={onPinClick}
                isResolved
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay comentarios aún
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Comparte el proyecto para recibir feedback
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: ProjectComment;
  isSelected: boolean;
  isResolved?: boolean;
  onSelect: () => void;
  onResolve?: () => void;
  onCreateTask?: () => void;
  onPinClick?: (position: { x: number; y: number }) => void;
}

function CommentCard({
  comment,
  isSelected,
  isResolved,
  onSelect,
  onResolve,
  onCreateTask,
  onPinClick
}: CommentCardProps) {
  const authorColor = comment.author_type === 'client' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400';

  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Author */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${comment.author_type === 'client' ? 'bg-purple-500' : 'bg-blue-500'}`} />
          <span className={`text-sm font-medium ${authorColor}`}>
            {comment.author_name}
          </span>
        </div>
        {comment.pin_position && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinClick?.(comment.pin_position!);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Ver ubicación"
          >
            <MapPin className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {comment.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(comment.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>

        {!isResolved && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateTask?.();
              }}
              className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center gap-1"
              title="Crear tarea"
            >
              <Clock className="w-3 h-3" />
              Tarea
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve?.();
              }}
              className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
              title="Marcar como resuelto"
            >
              <Check className="w-3 h-3" />
              Resolver
            </button>
          </div>
        )}

        {isResolved && (
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <Check className="w-3 h-3" />
            Resuelto
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsPanel;
