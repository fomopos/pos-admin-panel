import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  defaultSizes?: [number, number]; // Percentages for each panel
  minSizes?: [number, number]; // Minimum percentages
  direction?: 'horizontal' | 'vertical';
  isFullScreen?: boolean;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  children,
  className = '',
  defaultSizes = [50, 50],
  minSizes = [20, 20],
  direction = 'vertical',
  isFullScreen = false
}) => {
  const [sizes, setSizes] = useState(defaultSizes);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startSizesRef = useRef(defaultSizes);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === 'vertical' ? e.clientY : e.clientX;
    startSizesRef.current = [...sizes];
    
    document.body.style.cursor = direction === 'vertical' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sizes, direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerSize = direction === 'vertical' ? rect.height : rect.width;
    const currentPos = direction === 'vertical' ? e.clientY : e.clientX;
    const delta = currentPos - startPosRef.current;
    const deltaPercent = (delta / containerSize) * 100;

    const newFirstSize = Math.max(
      minSizes[0],
      Math.min(100 - minSizes[1], startSizesRef.current[0] + deltaPercent)
    );
    const newSecondSize = 100 - newFirstSize;

    setSizes([newFirstSize, newSecondSize]);
  }, [isDragging, direction, minSizes]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isVertical = direction === 'vertical';
  const resizerClasses = `
    group cursor-${isVertical ? 'row' : 'col'}-resize 
    ${isVertical ? 'h-1 w-full' : 'w-1 h-full'} 
    bg-gray-200 hover:bg-blue-400 active:bg-blue-500 
    transition-colors duration-150 ease-in-out
    relative flex items-center justify-center
    ${isDragging ? 'bg-blue-500' : ''}
  `;

  const resizerHandleClasses = `
    ${isVertical ? 'w-8 h-0.5' : 'h-8 w-0.5'} 
    bg-gray-400 group-hover:bg-white group-active:bg-white 
    rounded-full transition-colors duration-150 ease-in-out
    ${isDragging ? 'bg-white' : ''}
  `;

  return (
    <div 
      ref={containerRef}
      className={`flex ${isVertical ? 'flex-col' : 'flex-row'} ${isFullScreen ? 'h-full' : ''} ${className}`}
    >
      {/* First Panel */}
      <div 
        className={`${isVertical ? 'w-full' : 'h-full'} overflow-hidden`}
        style={{
          [isVertical ? 'height' : 'width']: `${sizes[0]}%`
        }}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div 
        className={resizerClasses}
        onMouseDown={handleMouseDown}
        style={{ 
          zIndex: 10,
          touchAction: 'none' 
        }}
      >
        <div className={resizerHandleClasses} />
        
        {/* Tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
          Drag to resize
        </div>
      </div>

      {/* Second Panel */}
      <div 
        className={`${isVertical ? 'w-full' : 'h-full'} overflow-hidden`}
        style={{
          [isVertical ? 'height' : 'width']: `${sizes[1]}%`
        }}
      >
        {children[1]}
      </div>
    </div>
  );
};

export default ResizablePanels;
