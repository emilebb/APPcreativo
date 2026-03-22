/**
 * Modal para Compartir Proyecto con Cliente
 * Sistema "One-Click Review"
 */

'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Copy, Check, Mail, Calendar, Settings } from 'lucide-react';
import { useCollaboration } from '@/hooks/useCollaboration';
import collaborationService from '@/lib/collaborationService';

interface ShareProjectModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareProjectModal({
  projectId,
  projectName,
  isOpen,
  onClose
}: ShareProjectModalProps) {
  const { createShareLink } = useCollaboration(projectId);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configuración de permisos
  const [permissions, setPermissions] = useState({
    can_comment: true,
    can_suggest_colors: false,
    can_edit: false,
    can_download: false
  });

  // Información del cliente
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(7);

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const share = await createShareLink(
        permissions,
        { name: clientName || undefined, email: clientEmail || undefined },
        expiresInDays
      );

      if (share) {
        const url = collaborationService.generateShareUrl(share.share_token);
        setShareUrl(url);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = () => {
    if (shareUrl && clientEmail) {
      const subject = `Revisión de diseño: ${projectName}`;
      const body = `Hola ${clientName || 'Cliente'},\n\nTe comparto el enlace para revisar el diseño:\n\n${shareUrl}\n\nPuedes dejar comentarios directamente en el diseño.\n\n¡Saludos!`;
      window.location.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Compartir para Revisión
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {projectName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Información del Cliente (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@cliente.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Permisos
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Permitir comentarios
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    El cliente puede dejar comentarios con pins
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.can_comment}
                  onChange={(e) => setPermissions({ ...permissions, can_comment: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Sugerir cambios de color
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    El cliente puede proponer paletas de colores
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.can_suggest_colors}
                  onChange={(e) => setPermissions({ ...permissions, can_suggest_colors: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Descargar diseño
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    El cliente puede descargar el archivo
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.can_download}
                  onChange={(e) => setPermissions({ ...permissions, can_download: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Expiration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiración del Enlace
            </h3>
            <select
              value={expiresInDays || ''}
              onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin expiración</option>
              <option value="1">1 día</option>
              <option value="3">3 días</option>
              <option value="7">7 días</option>
              <option value="14">14 días</option>
              <option value="30">30 días</option>
            </select>
          </div>

          {/* Share URL */}
          {shareUrl && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Enlace Generado
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              {clientEmail && (
                <button
                  onClick={handleSendEmail}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Enviar por Email
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!shareUrl ? (
              <>
                <button
                  onClick={handleCreateShare}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-5 h-5" />
                  {loading ? 'Generando...' : 'Generar Enlace'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareProjectModal;
