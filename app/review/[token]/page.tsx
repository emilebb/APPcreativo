/**
 * Página de Revisión para Clientes
 * Vista sin login para revisar y comentar diseños
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, MessageSquare, Send, Check, X, AlertCircle } from 'lucide-react';
import collaborationService, { ProjectShare, ProjectComment } from '@/lib/collaborationService';

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [share, setShare] = useState<ProjectShare | null>(null);
  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    loadShareAndProject();
  }, [token]);

  const loadShareAndProject = async () => {
    try {
      setLoading(true);
      
      // Obtener información del share
      const shareData = await collaborationService.getShareByToken(token);
      
      if (!shareData) {
        setError('El enlace de revisión no es válido o ha expirado');
        return;
      }

      setShare(shareData);

      // Cargar datos del proyecto
      const canvasData = localStorage.getItem(`canvas-${shareData.project_id}`);
      if (canvasData) {
        const elements = JSON.parse(canvasData);
        setProject({ elements });
        renderCanvas(elements);
      }

      // Cargar comentarios existentes
      const commentsData = await collaborationService.getComments(shareData.project_id);
      setComments(commentsData);

      // Pre-llenar info del cliente si está disponible
      if (shareData.client_name) setClientName(shareData.client_name);
      if (shareData.client_email) setClientEmail(shareData.client_email);

    } catch (err) {
      console.error('Error loading share:', err);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const renderCanvas = (elements: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderizar elementos
    elements.forEach((element) => {
      if (element.type === 'path' && element.data) {
        ctx.strokeStyle = element.style.color;
        ctx.lineWidth = element.style.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        element.data.forEach((point: { x: number; y: number }, index: number) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!share?.permissions.can_comment) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCommentPosition({ x, y });
    setIsCommenting(true);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !commentPosition || !share) return;

    try {
      const comment = await collaborationService.createComment(
        share.project_id,
        commentText,
        {
          type: 'client',
          name: clientName || 'Cliente',
          email: clientEmail
        },
        commentPosition,
        share.id
      );

      if (comment) {
        setComments(prev => [...prev, comment]);
        setCommentText('');
        setIsCommenting(false);
        setCommentPosition(null);
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Error al enviar comentario');
    }
  };

  const handleApproval = async (status: 'approved' | 'rejected' | 'changes_requested') => {
    if (!share) return;

    try {
      await collaborationService.respondToApproval(
        share.id, // Esto debería ser el approval_id, pero necesitamos crearlo primero
        status,
        status === 'changes_requested' ? 'Necesitamos cambios en el logo' : undefined
      );

      setShowApprovalModal(false);
      if (status === 'approved') {
        alert('¡Gracias por tu aprobación! El diseño ha sido aprobado.');
      }
    } catch (err) {
      console.error('Error submitting approval:', err);
      setError('Error al enviar aprobación');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace no válido</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ir a CreationX
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Revisión de Diseño
            </h1>
            <p className="text-sm text-gray-600">
              {share?.client_name ? `Hola ${share.client_name}` : 'Cliente'} - 
              Proyecto para Revisión
            </p>
          </div>
          <div className="flex items-center gap-3">
            {share?.permissions.can_comment && (
              <button
                onClick={() => setShowApprovalModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Aprobar Diseño
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Diseño para Revisión
                </h2>
                {share?.permissions.can_comment && (
                  <p className="text-sm text-gray-600">
                    Click en cualquier parte del diseño para dejar un comentario
                  </p>
                )}
              </div>
              
              <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className={`w-full ${share?.permissions.can_comment ? 'cursor-crosshair' : 'cursor-default'}`}
                  onClick={handleCanvasClick}
                />
                
                {/* Comment Pins */}
                {comments.map((comment) => (
                  comment.pin_position && (
                    <div
                      key={comment.id}
                      className="absolute w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-600 transition"
                      style={{
                        left: `${(comment.pin_position.x / 800) * 100}%`,
                        top: `${(comment.pin_position.y / 600) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={comment.content}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  )
                ))}

                {/* Current Comment Position */}
                {commentPosition && (
                  <div
                    className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white animate-pulse"
                    style={{
                      left: `${(commentPosition.x / 800) * 100}%`,
                      top: `${(commentPosition.y / 600) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comentarios ({comments.length})
              </h2>
              
              {/* Client Info */}
              {(!clientName || !clientEmail) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    Por favor, identifícate para dejar comentarios:
                  </p>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md mb-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                  />
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg border ${
                      comment.author_type === 'client'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {comment.author_name}
                      </span>
                      {comment.status === 'resolved' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Resuelto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    {comment.pin_position && (
                      <div className="mt-2 text-xs text-gray-500">
                        📍 Ubicación en el diseño
                      </div>
                    )}
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">
                    No hay comentarios aún
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {isCommenting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Dejar Comentario
            </h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Describe tus comentarios o sugerencias..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 resize-none"
              autoFocus
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Comentario
              </button>
              <button
                onClick={() => {
                  setIsCommenting(false);
                  setCommentPosition(null);
                  setCommentText('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Aprobar Diseño
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás satisfecho con el diseño? Puedes aprobarlo o solicitar cambios.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleApproval('approved')}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Aprobar Diseño
              </button>
              <button
                onClick={() => handleApproval('changes_requested')}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Solicitar Cambios
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
