"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Pencil, Eraser, Square, Circle, Type, Download, 
  Trash2, Undo, Redo, Palette, Move, 
  MousePointer, Save, Share2 
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  cursor?: string;
}

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

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyStep, setHistoryStep] = useState(0);

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
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [elements]);

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
            ctx.font = `${element.style.strokeWidth * 8}px Arial`;
            ctx.fillText(element.data.text, element.data.position.x, element.data.position.y);
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
    } else if (currentTool === 'rectangle') {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'rectangle',
        data: { start: currentPath[0] || pos, end: pos },
        style: { color: currentColor, strokeWidth, fill: false }
      };
      addElement(newElement);
    } else if (currentTool === 'circle') {
      const start = currentPath[0] || pos;
      const radius = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'circle',
        data: { center: start, radius },
        style: { color: currentColor, strokeWidth, fill: false }
      };
      addElement(newElement);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const addElement = (element: DrawingElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    
    // Update history
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1] || []);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(history[historyStep + 1]);
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
    link.download = 'canvas-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const saveCanvas = () => {
    const canvasData = {
      elements,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('canvas-drawing', JSON.stringify(canvasData));
    alert('Canvas guardado exitosamente');
  };

  const loadCanvas = () => {
    const saved = localStorage.getItem('canvas-drawing');
    if (saved) {
      const canvasData = JSON.parse(saved);
      setElements(canvasData.elements);
      setHistory([canvasData.elements]);
      setHistoryStep(0);
    }
  };

  return (
    <main className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Pizarra Libre
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={saveCanvas}
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-20 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
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
          <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center gap-6">
              {/* Colors */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <div className="flex gap-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`w-6 h-6 rounded border-2 transition ${
                        currentColor === color
                          ? 'border-neutral-900 dark:border-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-6 h-6 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Grosor:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 w-8">
                  {strokeWidth}
                </span>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white dark:bg-neutral-800 m-4 rounded-lg shadow-lg overflow-hidden">
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
      </div>
    </main>
  );
}
