import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Eraser, Pencil, Sparkles, ImagePlus, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

export const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [mode, setMode] = useState<'draw' | 'move'>('draw');
  const [color, setColor] = useState('#00d4ff');
  const [lineWidth, setLineWidth] = useState(3);
  const [aiBoxes, setAIBoxes] = useState<AIBox[]>([]);
  const [draggedBox, setDraggedBox] = useState<string | null>(null);
  const [resizingBox, setResizingBox] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 16, y: 16 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [toolbarDragStart, setToolbarDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  const colors = ['#00d4ff', '#ffffff', '#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#ffa500'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    if (mode === 'move') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left - offset.x) / scale;
    const y = (touch.clientY - rect.top - offset.y) / scale;

    if (mode === 'move') {
      setIsPanning(true);
      setPanStart({ x: touch.clientX, y: touch.clientY });
      return;
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    if (isPanning && mode === 'move') {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#000000' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 2 && lastTouchDistance !== null) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const delta = distance - lastTouchDistance;
      const newScale = Math.max(0.5, Math.min(3, scale + delta * 0.01));
      setScale(newScale);
      setLastTouchDistance(distance);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left - offset.x) / scale;
    const y = (touch.clientY - rect.top - offset.y) / scale;

    if (isPanning && mode === 'move') {
      const dx = touch.clientX - panStart.x;
      const dy = touch.clientY - panStart.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setPanStart({ x: touch.clientX, y: touch.clientY });
      return;
    }

    if (!isDrawing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#000000' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsPanning(false);
    setLastTouchDistance(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const analyzeWithAI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAnalyzing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');

      const { data, error } = await supabase.functions.invoke('analyze-whiteboard', {
        body: { image: dataUrl }
      });

      if (error) throw error;

      const newBox: AIBox = {
        id: Math.random().toString(36),
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        content: data.analysis || 'Keine Analyse verfügbar'
      };

      setAIBoxes(prev => [...prev, newBox]);
      toast.success('KI-Analyse abgeschlossen');
    } catch (error) {
      console.error('Fehler bei KI-Analyse:', error);
      toast.error('Fehler bei der Analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const improveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAnalyzing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: 'Mache aus dieser Skizze eine detaillierte, realistische Version. Behalte das Hauptmotiv bei aber verbessere die Details, Proportionen und mache es fotorealistisch.',
          image: dataUrl 
        }
      });

      if (error) throw error;

      if (data.image) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        };
        img.src = data.image;
        toast.success('Zeichnung verbessert');
      }
    } catch (error) {
      console.error('Fehler beim Verbessern:', error);
      toast.error('Fehler beim Verbessern');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBoxMouseDown = (boxId: string, e: React.MouseEvent, type: 'move' | 'resize') => {
    e.stopPropagation();
    if (type === 'move') {
      setDraggedBox(boxId);
    } else {
      setResizingBox(boxId);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingToolbar) {
      const dx = e.clientX - toolbarDragStart.x;
      const dy = e.clientY - toolbarDragStart.y;
      setToolbarPos({ x: toolbarPos.x + dx, y: toolbarPos.y + dy });
      setToolbarDragStart({ x: e.clientX, y: e.clientY });
    } else if (draggedBox) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setAIBoxes(prev => prev.map(box => 
        box.id === draggedBox 
          ? { ...box, x: box.x + dx, y: box.y + dy }
          : box
      ));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (resizingBox) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setAIBoxes(prev => prev.map(box => 
        box.id === resizingBox 
          ? { ...box, width: Math.max(200, box.width + dx), height: Math.max(150, box.height + dy) }
          : box
      ));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (isDraggingToolbar) {
      const dx = touch.clientX - toolbarDragStart.x;
      const dy = touch.clientY - toolbarDragStart.y;
      setToolbarPos({ x: toolbarPos.x + dx, y: toolbarPos.y + dy });
      setToolbarDragStart({ x: touch.clientX, y: touch.clientY });
    } else if (draggedBox) {
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;

      setAIBoxes(prev => prev.map(box => 
        box.id === draggedBox 
          ? { ...box, x: box.x + dx, y: box.y + dy }
          : box
      ));
      setDragStart({ x: touch.clientX, y: touch.clientY });
    } else if (resizingBox) {
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;

      setAIBoxes(prev => prev.map(box => 
        box.id === resizingBox 
          ? { ...box, width: Math.max(200, box.width + dx), height: Math.max(150, box.height + dy) }
          : box
      ));
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggedBox(null);
    setResizingBox(null);
    setIsDraggingToolbar(false);
  };

  const handleTouchEnd = () => {
    setDraggedBox(null);
    setResizingBox(null);
    setIsDraggingToolbar(false);
  };

  const deleteBox = (boxId: string) => {
    setAIBoxes(prev => prev.filter(box => box.id !== boxId));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const handleResetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toolbar */}
      <Card 
        className="absolute z-10 p-3 bg-background/95 backdrop-blur space-y-3 cursor-move select-none touch-none"
        style={{ left: toolbarPos.x, top: toolbarPos.y }}
        onMouseDown={(e) => {
          setIsDraggingToolbar(true);
          setToolbarDragStart({ x: e.clientX, y: e.clientY });
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          setIsDraggingToolbar(true);
          setToolbarDragStart({ x: touch.clientX, y: touch.clientY });
        }}
      >
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Modus</div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={mode === 'draw' ? 'default' : 'outline'}
              onClick={() => setMode('draw')}
              title="Zeichnen"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={mode === 'move' ? 'default' : 'outline'}
              onClick={() => setMode('move')}
              title="Bewegen"
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {mode === 'draw' && (
          <>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={tool === 'pen' ? 'default' : 'outline'}
                onClick={() => setTool('pen')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={tool === 'eraser' ? 'default' : 'outline'}
                onClick={() => setTool('eraser')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Farbe</div>
              <div className="flex gap-1 flex-wrap max-w-[120px]">
                {colors.map(c => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded border-2 ${color === c ? 'border-primary' : 'border-border'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Größe</div>
              <Slider
                value={[lineWidth]}
                onValueChange={([v]) => setLineWidth(v)}
                min={1}
                max={20}
                step={1}
                className="w-24"
              />
            </div>
          </>
        )}

        {mode === 'move' && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Zoom</div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleZoomOut}
                title="Rauszoomen"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleZoomIn}
                title="Reinzoomen"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetView}
              className="w-full"
            >
              Zurücksetzen
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              {Math.round(scale * 100)}%
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeWithAI}
            disabled={isAnalyzing}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analysieren
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={improveDrawing}
            disabled={isAnalyzing}
            className="w-full"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Verbessern
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={clearCanvas}
            className="w-full"
          >
            Löschen
          </Button>
        </div>
      </Card>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{
          cursor: mode === 'move' ? 'grab' : 'crosshair',
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
          transformOrigin: 'top left'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawingTouch}
        onTouchMove={drawTouch}
        onTouchEnd={stopDrawing}
      />

      {/* AI Response Boxes */}
      {aiBoxes.map(box => (
        <div
          key={box.id}
          className="absolute bg-background/95 backdrop-blur border-2 border-primary rounded-lg shadow-lg overflow-hidden"
          style={{
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
          }}
        >
          {/* Drag handle */}
          <div
            className="bg-primary/20 p-2 cursor-move flex justify-between items-center"
            onMouseDown={(e) => handleBoxMouseDown(box.id, e, 'move')}
          >
            <span className="text-xs font-medium">KI Antwort</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => deleteBox(box.id)}
            >
              <Eraser className="h-3 w-3" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3 h-[calc(100%-40px)] overflow-y-auto text-sm">
            {box.content}
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-primary/50"
            onMouseDown={(e) => handleBoxMouseDown(box.id, e, 'resize')}
          />
        </div>
      ))}
    </div>
  );
};
