"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { projectService } from "@/lib/projectService";
import ProjectTitleEditor from "@/components/ProjectTitleEditor";
import { useStyleLearning } from "@/hooks/useStyleLearning";
import { useCollaboration } from "@/hooks/useCollaboration";
import InspirationPanel from "@/components/InspirationPanel";
import CommentsPanel from "@/components/CommentsPanel";
import ShareProjectModal from "@/components/ShareProjectModal";
import { 
  Pencil, Trash2, Undo, Redo, Palette, Move, 
  Download, Save, Share2, Sparkles, MessageSquare 
} from "lucide-react";
import Link from "next/link";

interface DrawingElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'text';
  data: any;
  style: {
    color: string;
    strokeWidth: number;
    fill?: boolean;
  };
}

export default function CanvasPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const canvasId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState<DrawingElement | null>(null);
  const [project, setProject] = useState<any>(null);
  const [showInspiration, setShowInspiration] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hook de aprendizaje de estilo
  const { analyzeProject, analyzing } = useStyleLearning(canvasId);
  
  // Hook de colaboración
  const { comments, addComment } = useCollaboration(canvasId);

  const tools = [
    { id: 'pencil', name: 'Lápiz', icon: <Pencil className="w-4 h-4" />, cursor: 'crosshair' },
    { id: 'eraser', name: 'Borrador', icon: <Trash2 className="w-4 h-4" />, cursor: 'grab' },
    { id: 'rectangle', name: 'Rectángulo', icon: <div className="w-4 h-4">□</div>, cursor: 'crosshair' },
    { id: 'circle', name: 'Círculo', icon: <div className="w-4 h-4">○</div>, cursor: 'crosshair' },
    { id: 'text', name: 'Texto', icon: <span className="text-xs font-bold">T</span>, cursor: 'text' },
    { id: 'move', name: 'Mover', icon: <Move className="w-4 h-4" />, cursor: 'move' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#000080'
  ];

  useEffect(() => {
    if (canvasId) {
      loadCanvas();
      if (session?.user) loadProject();
    }
  }, [session, canvasId]);

  const loadProject = async () => {
    try {
      console.log('Loading project for ID:', canvasId);
      if (!session?.user) return;
      const projects = await projectService.getProjects(session.user.id);
      const currentProject = projects.find(p => p.id === canvasId);
      if (currentProject) {
        setProject(currentProject);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadCanvas = async () => {
    try {
      console.log('Loading canvas for ID:', canvasId);
      if (typeof window !== 'undefined') {
        const canvasData = localStorage.getItem(`canvas-${canvasId}`);
        if (canvasData) {
          setElements(JSON.parse(canvasData));
        }
      }
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  const saveCanvas = async () => {
    try {
      setSaving(true);
      
      // Guardar canvas en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`canvas-${canvasId}`, JSON.stringify(elements));
        console.log('Canvas saved for ID:', canvasId);
      }

      // 🎨 ANÁLISIS AUTOMÁTICO DE ESTILO
      // Analizar y guardar patrones de estilo del proyecto
      if (session?.user?.id && elements.length > 0) {
        console.log('🎨 Analizando estilo del proyecto...');
        await analyzeProject('canvas', {
          elements: elements,
          tags: project?.tags || []
        });
        console.log('✅ Análisis de estilo completado');
      }
    } catch (error) {
      console.error('Error saving canvas:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      setCurrentPath([pos]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      setCurrentPath(prev => [...prev, pos]);

      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentTool === 'eraser' ? strokeWidth * 3 : strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentPath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'path',
        data: [...currentPath, pos],
        style: { color: currentColor, strokeWidth }
      };

      const newElements = [...elements, newElement];
      setElements(newElements);
      
      // Update history
      const newHistory = history.slice(0, historyStep + 1);
      setHistory(newHistory);
      setHistoryStep(newHistory.length);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setElements(history[newStep] || []);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setElements(history[newStep]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryStep(0);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `canvas-${canvasId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <main className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/canvas"
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <Pencil className="w-5 h-5" />
              <span className="text-lg font-semibold">Canvas</span>
            </Link>
            <div>
              {project ? (
                <ProjectTitleEditor 
                  project={project} 
                  onUpdate={(updatedProject) => setProject(updatedProject)}
                />
              ) : (
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Canvas {canvasId}
                </h1>
              )}
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Pizarra creativa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveCanvas}
              disabled={saving || analyzing}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Guardar"
            >
              <Save className="w-4 h-4" />
              {saving || analyzing ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
              title="Compartir para Revisión"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-lg transition relative ${
                showComments
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Comentarios"
            >
              <MessageSquare className="w-4 h-4" />
              {comments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {comments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowInspiration(!showInspiration)}
              className={`p-2 rounded-lg transition ${
                showInspiration
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Panel de Inspiración"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={downloadCanvas}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
              title="Limpiar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-16 sm:w-20 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 p-2 sm:p-4 space-y-2 sm:space-y-4">
          {/* Tools */}
          <div className="space-y-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`w-full p-3 rounded-lg transition ${
                  currentTool === tool.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
                title={tool.name}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 sm:pt-4">
            {/* History */}
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Deshacer"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rehacer"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Color and Stroke Controls */}
          <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-2 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Colors */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <div className="flex gap-1">
                  {colors.slice(0, 6).map(color => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded border-2 transition ${
                        currentColor === color
                          ? 'border-neutral-900 dark:border-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                <label htmlFor="color-picker" className="text-sm text-neutral-600 dark:text-neutral-400">
                  Color:
                </label>
                <input
                  id="color-picker"
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-6 h-6 sm:w-8 sm:h-8 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                  title="Seleccionar color de dibujo"
                />
              </div>
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-2">
                <label htmlFor="stroke-width" className="text-sm text-neutral-600 dark:text-neutral-400">
                  Grosor:
                </label>
                <input
                  id="stroke-width"
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-20 sm:w-24"
                  title="Ajustar grosor del trazo"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 w-6 sm:w-8">
                  {strokeWidth}
                </span>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white dark:bg-neutral-800 m-2 sm:m-4 rounded-lg shadow-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>

        {/* Panel de Comentarios */}
        {showComments && (
          <CommentsPanel
            projectId={canvasId}
            onPinClick={(position) => {
              // Hacer zoom o scroll a la ubicación del pin
              console.log('📍 Ver comentario en:', position);
            }}
          />
        )}

        {/* Panel de Inspiración */}
        {showInspiration && (
          <InspirationPanel
            projectId={canvasId}
            onApplySuggestion={(suggestion) => {
              // Aplicar sugerencia al canvas
              if (suggestion.context_type === 'color_palette') {
                const colors = suggestion.suggestion_data.palette;
                if (colors && colors.length > 0) {
                  setCurrentColor(colors[0]);
                  console.log('🎨 Color aplicado:', colors[0]);
                }
              }
            }}
          />
        )}
      </div>

      {/* Modal de Compartir Proyecto */}
      <ShareProjectModal
        projectId={canvasId}
        projectName={project?.name || `Canvas ${canvasId}`}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </main>
  );
}
