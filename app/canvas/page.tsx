"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Pencil, Eraser, Square, Circle, Type, Download, 
  Trash2, Undo, Redo, Palette, Move, 
  MousePointer, Save, Share2, Sparkles, Zap, Trophy 
} from "lucide-react";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import FocusMode from "@/components/FocusMode";
import ProgressDashboard from "@/components/ProgressDashboard";
import { initializeProgress } from "@/lib/progressSystem";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  cursor?: string;
}

interface DrawingElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'text' | 'eraser';
  data: any;
  style: {
    color: string;
    strokeWidth: number;
    fill?: boolean;
  };
}

// Sistema de historial para undo/redo
interface HistoryState {
  elements: DrawingElement[];
  timestamp: number;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [fillEnabled, setFillEnabled] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [userProgress, setUserProgress] = useState(initializeProgress());

  const tools: Tool[] = [
    { id: 'pencil', name: 'Lápiz', icon: <Pencil className="w-4 h-4" />, cursor: 'crosshair' },
    { id: 'eraser', name: 'Borrador', icon: <Eraser className="w-4 h-4" />, cursor: 'grab' },
    { id: 'rectangle', name: 'Rectángulo', icon: <Square className="w-4 h-4" />, cursor: 'crosshair' },
    { id: 'circle', name: 'Círculo', icon: <Circle className="w-4 h-4" />, cursor: 'crosshair' },
    { id: 'text', name: 'Texto', icon: <Type className="w-4 h-4" />, cursor: 'text' },
    { id: 'move', name: 'Mover', icon: <Move className="w-4 h-4" />, cursor: 'move' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    
    // Only add event listeners on client side
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [elements]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z = Deshacer
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z = Rehacer
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S = Guardar
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCanvas();
      }
      // P = Lápiz
      else if (e.key === 'p' || e.key === 'P') {
        setCurrentTool('pencil');
      }
      // E = Borrador
      else if (e.key === 'e' || e.key === 'E') {
        setCurrentTool('eraser');
      }
      // R = Rectángulo
      else if (e.key === 'r' || e.key === 'R') {
        setCurrentTool('rectangle');
      }
      // C = Círculo
      else if (e.key === 'c' || e.key === 'C') {
        setCurrentTool('circle');
      }
      // T = Texto
      else if (e.key === 't' || e.key === 'T') {
        setCurrentTool('text');
      }
      // M = Mover
      else if (e.key === 'm' || e.key === 'M') {
        setCurrentTool('move');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [historyStep, history]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
      ctx.strokeStyle = element.style.color;
      ctx.lineWidth = element.style.strokeWidth;
      ctx.fillStyle = element.style.color;

      switch (element.type) {
        case 'path':
          if (element.data.length > 0) {
            ctx.beginPath();
            ctx.moveTo(element.data[0].x, element.data[0].y);
            element.data.forEach((point: {x: number, y: number}) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (element.data.start && element.data.end) {
            const width = element.data.end.x - element.data.start.x;
            const height = element.data.end.y - element.data.start.y;
            if (element.style.fill) {
              ctx.fillRect(element.data.start.x, element.data.start.y, width, height);
            } else {
              ctx.strokeRect(element.data.start.x, element.data.start.y, width, height);
            }
          }
          break;
        case 'circle':
          if (element.data.center && element.data.radius) {
            ctx.beginPath();
            ctx.arc(element.data.center.x, element.data.center.y, element.data.radius, 0, 2 * Math.PI);
            if (element.style.fill) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
          }
          break;
        case 'text':
          if (element.data.text && element.data.position) {
            const fontSize = element.style.strokeWidth * 6;
            ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
            ctx.fillStyle = element.style.color;
            
            // Dividir texto en líneas si es muy largo
            const maxWidth = 400;
            const words = element.data.text.split(' ');
            const lines: string[] = [];
            let currentLine = '';
            
            words.forEach((word: string) => {
              const testLine = currentLine + (currentLine ? ' ' : '') + word;
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            });
            if (currentLine) lines.push(currentLine);
            
            // Dibujar cada línea
            const lineHeight = fontSize * 1.4;
            lines.forEach((line: string, index: number) => {
              ctx.fillText(line, element.data.position.x, element.data.position.y + (index * lineHeight));
            });
          }
          break;
      }
    });
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
    } else if (currentTool === 'text') {
      const text = prompt('Ingrese el texto:');
      if (text) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'text',
          data: { text, position: pos },
          style: { color: currentColor, strokeWidth }
        };
        addElement(newElement);
      }
      setIsDrawing(false);
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
    } else if (currentTool === 'rectangle' || currentTool === 'circle') {
      // Preview en tiempo real
      redrawCanvas();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([5, 5]); // Línea punteada para preview

      if (currentTool === 'rectangle' && currentPath.length > 0) {
        const width = pos.x - currentPath[0].x;
        const height = pos.y - currentPath[0].y;
        ctx.strokeRect(currentPath[0].x, currentPath[0].y, width, height);
      } else if (currentTool === 'circle' && currentPath.length > 0) {
        const radius = Math.sqrt(Math.pow(pos.x - currentPath[0].x, 2) + Math.pow(pos.y - currentPath[0].y, 2));
        ctx.beginPath();
        ctx.arc(currentPath[0].x, currentPath[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.setLineDash([]); // Resetear línea punteada
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (currentTool === 'pencil' && currentPath.length > 0) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'path',
        data: [...currentPath, pos],
        style: { color: currentColor, strokeWidth }
      };
      addElement(newElement);
    } else if (currentTool === 'eraser' && currentPath.length > 0) {
      // Eliminar elementos que intersectan con el path del borrador
      const eraserPath = [...currentPath, pos];
      const remainingElements = elements.filter(element => {
        // No borrar otros paths de borrador
        if (element.type === 'eraser') return true;
        return !isElementIntersectingPath(element, eraserPath);
      });
      
      if (remainingElements.length !== elements.length) {
        saveToHistory(remainingElements);
      }
    } else if (currentTool === 'rectangle' && currentPath.length > 0) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'rectangle',
        data: { start: currentPath[0], end: pos },
        style: { color: currentColor, strokeWidth, fill: fillEnabled }
      };
      addElement(newElement);
    } else if (currentTool === 'circle' && currentPath.length > 0) {
      const start = currentPath[0];
      const radius = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'circle',
        data: { center: start, radius },
        style: { color: currentColor, strokeWidth, fill: fillEnabled }
      };
      addElement(newElement);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  // Función auxiliar para detectar si un elemento intersecta con el path del borrador
  const isElementIntersectingPath = (element: DrawingElement, eraserPath: {x: number, y: number}[]) => {
    const eraserRadius = strokeWidth * 3;
    
    for (const point of eraserPath) {
      if (element.type === 'path') {
        for (const pathPoint of element.data) {
          const distance = Math.sqrt(Math.pow(point.x - pathPoint.x, 2) + Math.pow(point.y - pathPoint.y, 2));
          if (distance < eraserRadius) return true;
        }
      } else if (element.type === 'rectangle') {
        const { start, end } = element.data;
        if (point.x >= Math.min(start.x, end.x) - eraserRadius &&
            point.x <= Math.max(start.x, end.x) + eraserRadius &&
            point.y >= Math.min(start.y, end.y) - eraserRadius &&
            point.y <= Math.max(start.y, end.y) + eraserRadius) {
          return true;
        }
      } else if (element.type === 'circle') {
        const distance = Math.sqrt(
          Math.pow(point.x - element.data.center.x, 2) + 
          Math.pow(point.y - element.data.center.y, 2)
        );
        if (Math.abs(distance - element.data.radius) < eraserRadius) return true;
      } else if (element.type === 'text') {
        const { position } = element.data;
        const distance = Math.sqrt(Math.pow(point.x - position.x, 2) + Math.pow(point.y - position.y, 2));
        if (distance < eraserRadius + 20) return true;
      }
    }
    
    return false;
  };

  // Guardar estado en historial
  const saveToHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ elements: newElements, timestamp: Date.now() });
    // Limitar historial a 50 estados
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(newElements);
  };

  const addElement = (element: DrawingElement) => {
    const newElements = [...elements, element];
    saveToHistory(newElements);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setElements(history[newStep].elements);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setElements(history[newStep].elements);
    }
  };

  const clearCanvas = () => {
    saveToHistory([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Auto-guardar cada 30 segundos
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (elements.length > 0) {
        saveCanvas(true);
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [elements]);

  // Cargar canvas al montar
  useEffect(() => {
    loadCanvas();
  }, []);

  const saveCanvas = (isAutoSave = false) => {
    if (typeof window !== 'undefined') {
      setSaveStatus('saving');
      const canvasData = {
        elements,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('canvas-drawing', JSON.stringify(canvasData));
      
      setTimeout(() => {
        setSaveStatus('saved');
        if (!isAutoSave) {
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      }, 300);
    }
  };

  const loadCanvas = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('canvas-drawing');
      if (saved) {
        try {
          const canvasData = JSON.parse(saved);
          const loadedElements = canvasData.elements || [];
          setElements(loadedElements);
          // Cargar historial con el estado actual
          setHistory([{ elements: loadedElements, timestamp: Date.now() }]);
          setHistoryStep(0);
        } catch (error) {
          console.error('Error loading canvas:', error);
        }
      }
    }
  };

  // Funciones para el panel de IA
  const handleApplyIdea = (idea: string) => {
    // Generar posición aleatoria para evitar superposición
    const randomX = 50 + Math.random() * 200;
    const randomY = 50 + Math.random() * 200;
    
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'text',
      data: { text: `💡 ${idea}`, position: { x: randomX, y: randomY } },
      style: { color: currentColor, strokeWidth: 2 }
    };
    addElement(newElement);
  };

  const handleApplyPalette = (colors: string[]) => {
    if (colors.length > 0) {
      setCurrentColor(colors[0]);
    }
  };

  const handleImageUpload = (imageData: string, file: File) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxWidth = 400;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      ctx.drawImage(img, 50, 50, width, height);
    };
    img.src = imageData;
  };

  return (
    <main className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* SEO h1 - hidden but accessible */}
      <h1 className="sr-only">Pizarra Libre - Canvas Creativo para Dibujar y Diseñar</h1>
      
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Pizarra Libre
            </h2>
            {saveStatus === 'saving' && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Guardando...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                Guardado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFocusMode(true)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Modo Enfoque"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowProgress(true)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Ver Progreso"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`p-2 rounded-lg transition ${
                showAIPanel
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Asistente IA"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => saveCanvas()}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
              title="Guardar"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={loadCanvas}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
              title="Cargar"
            >
              <Download className="w-4 h-4" />
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
      </header>

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
                aria-label={tool.name}
                style={{ cursor: tool.cursor }}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            {/* History */}
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed mb-2"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              {/* Colors */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <div className="flex gap-1">
                  {colors.slice(0, 6).map(color => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition ${
                        currentColor === color
                          ? 'border-neutral-900 dark:border-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                <label htmlFor="color-picker" className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  Color:
                </label>
                <input
                  id="color-picker"
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-5 h-5 sm:w-6 sm:h-6 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                  title="Seleccionar color de dibujo"
                />
              </div>
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-2">
                <label htmlFor="stroke-width" className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  Grosor:
                </label>
                <input
                  id="stroke-width"
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-16 sm:w-24"
                  title="Ajustar grosor del trazo"
                />
                <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 w-6 sm:w-8">
                  {strokeWidth}
                </span>
              </div>

              {/* Fill Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFillEnabled(!fillEnabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    fillEnabled
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                  title="Alternar relleno para formas"
                >
                  Relleno
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white dark:bg-neutral-800 m-2 sm:m-4 rounded-lg shadow-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ 
                cursor: tools.find(t => t.id === currentTool)?.cursor || 'crosshair',
                touchAction: 'none'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                startDrawing(mouseEvent as any);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                draw(mouseEvent as any);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const mouseEvent = new MouseEvent('mouseup', {
                  clientX: 0,
                  clientY: 0
                });
                stopDrawing(mouseEvent as any);
              }}
            />
          </div>
        </div>

        {/* Panel de Asistente IA */}
        {showAIPanel && (
          <AIAssistantPanel
            projectType="canvas"
            onApplyIdea={handleApplyIdea}
            onApplyPalette={handleApplyPalette}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>

      {/* Modo Enfoque */}
      <FocusMode
        isActive={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        taskName="Crear en Canvas"
        duration={25}
      />

      {/* Dashboard de Progreso */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProgress(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ProgressDashboard
              progress={userProgress}
              onClose={() => setShowProgress(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
