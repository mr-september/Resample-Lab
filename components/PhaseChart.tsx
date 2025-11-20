import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DatasetParams, AxisConfig, RGB } from '../types';

// --- Constants ---
const CANVAS_RES_X = 150; 
const CANVAS_RES_Y = 100; 

// --- Scaling Utilities ---

const toLog = (val: number) => Math.log10(Math.max(val, 1));

const getLogTicks = (min: number, max: number) => {
  const ticks = [];
  let power = Math.ceil(toLog(min));
  let val = Math.pow(10, power);
  
  if (val === min) ticks.push(min);

  while (val < max) {
    if (val > min) ticks.push(val);
    power++;
    val = Math.pow(10, power);
  }
  
  if (Math.abs(toLog(max) % 1) < 1e-9) ticks.push(max);
  return ticks;
};

const getLinearTicks = (min: number, max: number) => {
  if (max <= 20) return [2, 5, 10, 15, 20].filter(x => x >= min && x <= max);
  const step = (max - min) / 4;
  return [min, min + step, min + step * 2, min + step * 3, max].map(Math.round);
};

const createScale = (config: AxisConfig) => {
  const { min, max, scale } = config;
  // Explicitly check for 'log'. Defaults to linear if undefined.
  const isLog = scale === 'log';
  
  const logMin = isLog ? toLog(min) : 0;
  const logMax = isLog ? toLog(max) : 0;
  const logRange = logMax - logMin;
  const linearRange = max - min;

  const getPct = (val: number) => {
    if (isLog) return (toLog(val) - logMin) / logRange;
    return (val - min) / linearRange;
  };

  const getValue = (pct: number) => {
    if (isLog) return Math.pow(10, logMin + pct * logRange);
    return min + pct * linearRange;
  };

  const ticks = isLog ? getLogTicks(min, max) : getLinearTicks(min, max);

  return { getPct, getValue, ticks, isLog, min, max };
};

// --- Component ---

interface OverlayRenderProps {
  getPctX: (v: number) => number;
  getPctY: (v: number) => number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface PhaseChartProps {
  xConfig: AxisConfig;
  yConfig: AxisConfig;
  valX: number;
  valY: number;
  onUpdate: (updates: Partial<DatasetParams>) => void;
  getColor: (x: number, y: number) => RGB;
  
  isValid?: (x: number, y: number) => boolean;
  renderOverlay?: (props: OverlayRenderProps) => React.ReactNode;
  height?: number;
  className?: string;
  titleAlignment?: 'left' | 'right';
}

export const PhaseChart: React.FC<PhaseChartProps> = ({ 
  xConfig, yConfig, valX, valY, onUpdate, getColor,
  isValid = (_x, _y) => true, renderOverlay,
  height = 350, className = "", titleAlignment = 'left'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number; y: number; valX: number; valY: number; isValid: boolean;
  } | null>(null);

  const xScale = useMemo(() => createScale(xConfig), [xConfig]);
  const yScale = useMemo(() => createScale(yConfig), [yConfig]);

  // Paint Canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(CANVAS_RES_X, CANVAS_RES_Y);
    const data = imgData.data;

    for (let py = 0; py < CANVAS_RES_Y; py++) {
      const v = 1 - (py / CANVAS_RES_Y); 
      const yVal = yScale.getValue(v);
      
      for (let px = 0; px < CANVAS_RES_X; px++) {
        const u = px / CANVAS_RES_X;
        const xVal = xScale.getValue(u);
        
        const idx = (py * CANVAS_RES_X + px) * 4;

        if (isValid(xVal, yVal)) {
          const { r, g, b } = getColor(xVal, yVal);
          data[idx] = r;     
          data[idx + 1] = g; 
          data[idx + 2] = b; 
          data[idx + 3] = 255; 
        } else {
          // Invalid Zone (Dark Red-Gray)
          data[idx] = 25; data[idx + 1] = 15; data[idx + 2] = 15; data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [xScale, yScale, getColor, isValid]);

  // Interaction Handlers
  const updateFromEvent = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    
    const newValX = Math.round(xScale.getValue(x / rect.width));
    const newValY = Math.round(yScale.getValue(1 - (y / rect.height)));

    onUpdate({ [xConfig.key]: newValX, [yConfig.key]: newValY });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateFromEvent(e);
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const valX = Math.round(xScale.getValue(x / rect.width));
      const valY = Math.round(yScale.getValue(1 - (y / rect.height)));
      setHoverInfo({ x, y, valX, valY, isValid: isValid(valX, valY) });
    }
  };

  const userXPct = xScale.getPct(valX) * 100;
  const userYPct = (1 - yScale.getPct(valY)) * 100;

  return (
    <div 
      className={`relative flex flex-col w-full bg-zinc-900 border border-zinc-800 overflow-hidden select-none shadow-2xl ${className}`}
      style={{ height }}
    >
      {/* Header */}
      <h3 className={`absolute top-3 z-20 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-600 text-[10px] font-bold uppercase tracking-widest text-zinc-100 pointer-events-none backdrop-blur-xl flex gap-1.5 items-center ${titleAlignment === 'right' ? 'right-3' : 'left-3'}`}>
        <span className="drop-shadow-md">{yConfig.label}</span>
        <span className="text-zinc-500 text-[9px]">vs</span>
        <span className="drop-shadow-md">{xConfig.label}</span>
      </h3>

      <div 
        ref={containerRef}
        className={`relative flex-grow w-full h-full touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => { setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
        onPointerLeave={() => setHoverInfo(null)}
      >
        <canvas 
          ref={canvasRef} 
          width={CANVAS_RES_X} 
          height={CANVAS_RES_Y}
          className="w-full h-full absolute top-0 left-0 opacity-60" 
        />
        
        <div className="absolute inset-0 pattern-striped opacity-100 pointer-events-none mix-blend-overlay"></div>

        {/* SVG Info Layer */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
           {/* X-Axis Grid */}
           {xScale.ticks.map(val => {
             const pct = xScale.getPct(val) * 100;
             let textAnchor: "start" | "middle" | "end" = "middle";
             let xPos = `${pct}%`;
             
             // Smart Label Positioning
             if (pct < 5) {
               textAnchor = "start";
               xPos = "4px";
             } else if (pct > 95) {
               textAnchor = "end";
               xPos = "calc(100% - 4px)";
             }

             return (
               <g key={`x-${val}`}>
                 <line x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke="white" strokeOpacity={0.08} strokeWidth={1} />
                 <text x={xPos} y="98%" fill="white" fillOpacity={0.4} fontSize="9" textAnchor={textAnchor} fontFamily="monospace">
                   {val >= 1000 ? val/1000 + 'k' : val}
                 </text>
               </g>
             );
           })}

           {/* Y-Axis Grid */}
           {yScale.ticks.map(val => {
             const pct = (1 - yScale.getPct(val)) * 100;
             let yPos = `${pct - 1}%`;
             
             // Smart Label Positioning
             if (pct < 5) { // Top Edge
               yPos = "10px"; 
             } else if (pct > 95) { // Bottom Edge
               yPos = "calc(100% - 14px)"; // Lift up to avoid overlap with X axis
             }

             return (
               <g key={`y-${val}`}>
                 <line x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="white" strokeOpacity={0.08} strokeWidth={1} />
                 <text x="4" y={yPos} fill="white" fillOpacity={0.4} fontSize="9" textAnchor="start" fontFamily="monospace">
                   {val >= 1000 ? val/1000 + 'k' : val}
                 </text>
               </g>
             );
           })}

           {/* Custom Overlays */}
           {renderOverlay && renderOverlay({ 
              getPctX: xScale.getPct, 
              getPctY: yScale.getPct,
              minX: xScale.min,
              maxX: xScale.max,
              minY: yScale.min,
              maxY: yScale.max
           })}
           
           <rect width="100%" height="100%" fill="none" stroke="white" strokeOpacity={0.2} strokeWidth="4" />

           <g transform={`translate(${userXPct * (containerRef.current?.clientWidth || 100) / 100}, ${userYPct * (containerRef.current?.clientHeight || 100) / 100})`}>
              <circle r="15" fill={isDragging ? "white" : "transparent"} fillOpacity={0.1} className={isDragging ? "animate-ping" : ""} />
              <circle r="6" fill="none" stroke="white" strokeWidth="2" className="shadow-lg drop-shadow-md" />
              <circle r="3" fill="white" />
              <line x1="-10000" y1="0" x2="10000" y2="0" stroke="white" strokeOpacity={0.3} strokeDasharray="3 3" />
              <line x1="0" y1="-10000" x2="0" y2="10000" stroke="white" strokeOpacity={0.3} strokeDasharray="3 3" />
           </g>
        </svg>

        {hoverInfo && !isDragging && (
          <div className="absolute z-30 pointer-events-none" style={{ left: hoverInfo.x + 15, top: hoverInfo.y + 15 }}>
             <div className={`backdrop-blur-md border border-zinc-700 p-2 rounded-lg shadow-2xl text-[10px] font-mono text-zinc-300 whitespace-nowrap ${!hoverInfo.isValid ? "bg-zinc-900/95" : "bg-black/90"}`}>
               {hoverInfo.isValid ? (
                 <>
                   <div>{xConfig.label || xConfig.key}: <span className="text-white">{hoverInfo.valX.toLocaleString()}</span></div>
                   <div>{yConfig.label || yConfig.key}: <span className="text-white">{hoverInfo.valY.toLocaleString()}</span></div>
                 </>
               ) : (
                 <div className="text-red-400 font-bold uppercase">Impossible Region</div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};