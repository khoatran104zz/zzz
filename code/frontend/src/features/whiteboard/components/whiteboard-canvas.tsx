'use client';

import React, { useState, useRef } from 'react';
import type { WhiteboardElementDto, WhiteboardElementType } from '../types';
import { StickyNoteElement } from './sticky-note-element';
import { ShapeElement } from './shape-element';
import { ConnectorLine } from './connector-line';
import { WhiteboardToolbar } from './whiteboard-toolbar';
import { CanvasControls } from './canvas-controls';

interface WhiteboardCanvasProps {
  initialElements: WhiteboardElementDto[];
  onSave: (elements: WhiteboardElementDto[]) => void;
  isSaving?: boolean;
}

export function WhiteboardCanvas({ initialElements, onSave, isSaving }: WhiteboardCanvasProps) {
  const [elements, setElements] = useState<WhiteboardElementDto[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'SELECT' | WhiteboardElementType>('SELECT');
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isPanMode || e.button === 1 || e.shiftKey) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (activeTool !== 'SELECT') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = (e.clientX - rect.left - pan.x) / zoom;
      const clickY = (e.clientY - rect.top - pan.y) / zoom;

      const newElement: WhiteboardElementDto = {
        id: `temp-${Date.now()}`,
        whiteboardId: '',
        type: activeTool,
        x: clickX,
        y: clickY,
        width: activeTool === 'STICKY_NOTE' ? 180 : 140,
        height: activeTool === 'STICKY_NOTE' ? 180 : 100,
        rotation: 0,
        content: '',
        zIndex: elements.length + 1,
      };

      setElements((prev) => [...prev, newElement]);
      setSelectedId(newElement.id);
      setActiveTool('SELECT');
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.2), 3.0));
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setElements((prev) => prev.filter((e) => e.id !== selectedId));
      setSelectedId(null);
    }
  };

  const updateElementContent = (id: string, content: string) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, content } : e)));
  };

  const handleSaveCanvas = () => {
    const sanitized = elements.map((el) => ({
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation || 0,
      content: el.content || '',
      styleJson: el.styleJson || null,
      zIndex: el.zIndex || 1,
    }));
    onSave(sanitized as any);
  };

  return (
    <div className="relative h-[calc(100vh-160px)] w-full overflow-hidden rounded-2xl border border-surface-border bg-surface-alt shadow-xl">
      <WhiteboardToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onDeleteSelected={selectedId ? handleDeleteSelected : undefined}
        onSaveCanvas={handleSaveCanvas}
        isSaving={isSaving}
      />

      <CanvasControls
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.15, 3.0))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
        onResetZoom={() => {
          setZoom(1.0);
          setPan({ x: 0, y: 0 });
        }}
        isPanMode={isPanMode}
        onTogglePanMode={() => setIsPanMode(!isPanMode)}
      />

      <div
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: isPanMode || isDraggingCanvas ? 'grab' : 'crosshair',
          backgroundImage: 'radial-gradient(circle, rgba(var(--color-primary-rgb, 100, 80, 240), 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        className="h-full w-full select-none"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="relative h-full w-full"
        >
          {/* Connector Lines SVG Layer */}
          <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-primary" />
              </marker>
            </defs>
            {elements
              .filter((e) => e.type === 'CONNECTOR')
              .map((el) => (
                <ConnectorLine
                  key={el.id}
                  element={el}
                  allElements={elements}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                />
              ))}
          </svg>

          {/* Spatial Canvas Elements */}
          {elements.map((el) => {
            if (el.type === 'STICKY_NOTE') {
              return (
                <StickyNoteElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChangeContent={(c) => updateElementContent(el.id, c)}
                />
              );
            }
            if (el.type === 'SHAPE_RECT' || el.type === 'SHAPE_CIRCLE') {
              return (
                <ShapeElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChangeContent={(c) => updateElementContent(el.id, c)}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
