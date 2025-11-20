import React from 'react';

// --- Shared Helpers ---

const ImpossibleLabel: React.FC<{ x: number; xOffset: number; label?: string }> = ({ x, xOffset, label }) => (
  <svg x={`${x}%`} y="50%" style={{ overflow: 'visible' }}>
    <g transform={`translate(${xOffset}, 0)`}>
      <rect 
        x={-9} y={-60} width={18} height={120} rx="4" 
        fill="rgba(24, 24, 27, 0.9)" stroke="#3f3f46" strokeWidth="1"
        className="backdrop-blur-sm"
      />
      <text 
        x="0" y="0" textAnchor="middle" dominantBaseline="central"
        fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace"
        style={{ writingMode: 'vertical-rl', pointerEvents: 'none' }}
        transform="rotate(180)"
      >
        {label || "IMPOSSIBLE REGION"}
      </text>
    </g>
  </svg>
);

// --- Overlay Components ---

interface OverlayProps {
  getPctX: (v: number) => number;
  getPctY: (v: number) => number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const TotalVsMinorityOverlay: React.FC<OverlayProps & { minority?: number }> = ({ getPctX, getPctY, minX, maxX }) => {
  // Line y = x (Total = Minority)
  
  // Determine the valid range for the diagonal within this chart's view
  // The diagonal is valid where X >= minX and X <= maxX
  // Since Total (Y) is usually > Minority (X), the impossibility is Y < X.
  
  // Draw line from minX to maxX (assuming aspect ratio and units align roughly, or just representing the concept)
  // Note: Total and Minority use same units (Count).
  
  const x1 = getPctX(minX) * 100;
  const y1 = (1 - getPctY(minX)) * 100;
  
  const x2 = getPctX(maxX) * 100;
  const y2 = (1 - getPctY(maxX)) * 100;

  // Polygon points for fill (Region Total < Minority -> Below the line)
  const points = `${x1},${y1} ${x2},${y2} ${x2},100 ${x1},100`;

  return (
    <g>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" x="0" y="0" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
           <pattern id="striped-invalid-total" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
             <line x1="0" y1="0" x2="0" y2="8" stroke="#f87171" strokeWidth="2" opacity="0.2" />
           </pattern>
        </defs>
        
        {/* Filled Polygon for Impossible Region (Total < Minority) */}
        <polygon points={points} fill="url(#striped-invalid-total)" />
        
        {/* Dashed Boundary Line (y=x) */}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" vectorEffect="non-scaling-stroke" />
      </svg>

      <text x="95%" y="92%" textAnchor="end" fill="#f87171" fontSize="12" fontFamily="monospace" opacity="1" fontWeight="bold" style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}>
        IMPOSSIBLE REGION
      </text>
    </g>
  );
};

export const FeaturesVsMinorityOverlay: React.FC<OverlayProps & { total: number }> = ({ getPctX, total }) => {
   const pct = getPctX(total);
   if (pct < 0 || pct > 1) return null;
   return (
     <g>
       <line x1={`${pct*100}%`} y1="0" x2={`${pct*100}%`} y2="100%" stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
       <ImpossibleLabel x={pct*100} xOffset={-16} />
     </g>
   );
};

export const FeaturesVsTotalOverlay: React.FC<OverlayProps & { minority: number }> = ({ getPctX, minority }) => {
   const pct = getPctX(minority);
   if (pct < 0 || pct > 1) return null;
   return (
     <g>
       <line x1={`${pct*100}%`} y1="0" x2={`${pct*100}%`} y2="100%" stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
       <ImpossibleLabel x={pct*100} xOffset={16} />
     </g>
   );
};

export const FoldsVsMinorityOverlay: React.FC<OverlayProps> = ({ getPctX, getPctY, minX, maxX, minY, maxY }) => {
  // Boundary: Folds (Y) = Minority (X)
  // Invalid Region: Y > X
  
  // We iterate X to draw the curve y=x.
  // The curve is only visible where Min(Y_axis) <= x <= Max(Y_axis)
  // AND Min(X_axis) <= x <= Max(X_axis)
  
  const startLoop = Math.max(minX, minY);
  const endLoop = Math.min(maxX, maxY);
  
  // If the ranges don't overlap, we might not need to draw, but usually they do in this app.
  
  let pathD = "";
  
  // Sampling resolution
  const step = (endLoop - startLoop) / 50;
  
  if (startLoop < endLoop) {
      for (let v = startLoop; v <= endLoop; v += Math.max(1, step)) {
         const xPct = getPctX(v) * 100;
         const yPct = (1 - getPctY(v)) * 100;
         pathD += `${pathD === "" ? "M" : "L"} ${xPct} ${yPct} `;
      }
      // Ensure we hit the exact end point
      const xEnd = getPctX(endLoop) * 100;
      const yEnd = (1 - getPctY(endLoop)) * 100;
      pathD += `L ${xEnd} ${yEnd} `;
  }

  // Closing the path to fill the Top-Left triangle (where Y is high and X is low)
  // Path currently goes from (startLoop, startLoop) to (endLoop, endLoop) along diagonal.
  // We need to go to Top-Left corner (MinX, MaxY) basically.
  // Top Left in SVG is (0,0) if axes are full range.
  
  // Point 1: End of curve (xEnd, yEnd) -> (on top edge or right edge)
  // Point 2: Top-Left corner of the chart 
  // Point 3: Start of curve
  
  const closurePath = `L 0 0 L ${getPctX(startLoop)*100} ${(1 - getPctY(startLoop))*100} Z`;
  const patternPath = `${pathD} ${closurePath}`;
  
  return (
    <g>
       <svg viewBox="0 0 100 100" preserveAspectRatio="none" x="0" y="0" width="100%" height="100%" style={{ overflow: 'visible' }}>
         <defs>
           <pattern id="striped-invalid-folds" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
             <line x1="0" y1="0" x2="0" y2="8" stroke="#f87171" strokeWidth="2" opacity="0.2" />
           </pattern>
         </defs>
         
         {/* Pattern Fill for Invalid Region */}
         <path d={patternPath} fill="url(#striped-invalid-folds)" />

         {/* The Red Dashed Boundary Line */}
         <path d={pathD} stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" vectorEffect="non-scaling-stroke" />
       </svg>

       {/* Label */}
       <text 
         x="16%" 
         y="27%" 
         textAnchor="middle" 
         fill="#f87171" 
         fontSize="12" 
         fontFamily="monospace" 
         fontWeight="bold" 
         style={{ 
           pointerEvents: 'none', 
           textShadow: '0px 1px 2px rgba(0,0,0,0.8)',
           transformBox: 'view-box',
           transformOrigin: '16% 27%',
           transform: 'rotate(-52deg)'
         }}
       >
         FOLDS &gt; MINORITY COUNT
       </text>

       <text x="95%" y="90%" textAnchor="end" fill="#ffffff" opacity="0.05" fontSize="32" fontWeight="bold" style={{ pointerEvents: 'none' }}>
         Stable Region
       </text>
    </g>
  );
};