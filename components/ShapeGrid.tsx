import React, { useRef, useEffect } from 'react';

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface ShapeGridProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
  shape?: 'square' | 'hexagon' | 'circle' | 'triangle';
  hoverTrailAmount?: number;
}

const ShapeGrid: React.FC<ShapeGridProps> = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 50,
  hoverFillColor = '#222',
  shape = 'square',
  hoverTrailAmount = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Foreground (main) grid state
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  // Background depth layer — larger, fainter, drifts slower
  const gridOffsetBg = useRef<GridOffset>({ x: 0, y: 0 });

  const hoveredSquareRef = useRef<GridOffset | null>(null);
  const trailCells = useRef<GridOffset[]>([]);
  const cellOpacities = useRef<Map<string, number>>(new Map());

  // Raw + smoothed pointer position for parallax
  const pointerTarget = useRef<GridOffset>({ x: 0, y: 0 }); // normalized -0.5..0.5
  const parallax = useRef<GridOffset>({ x: 0, y: 0 }); // smoothed pixel offset

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isHex = shape === 'hexagon';
    const isTri = shape === 'triangle';
    const hexHoriz = squareSize * 1.5;
    const hexVert = squareSize * Math.sqrt(3);

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawHex = (cx: number, cy: number, size: number) => {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    };

    const drawCircle = (cx: number, cy: number, size: number) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawTriangle = (cx: number, cy: number, size: number, flip: boolean) => {
      if (!ctx) return;
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + size / 2);
        ctx.lineTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy - size / 2);
      } else {
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
      }
      ctx.closePath();
    };

    // Faint, slow-drifting hexagon layer behind the main grid — adds depth.
    // Purely decorative: no hover glow, no fill, just soft strokes.
    const drawHexDepthLayer = () => {
      if (!ctx || !isHex) return;
      const bgSize = squareSize * 1.9;
      const bgHoriz = bgSize * 1.5;
      const bgVert = bgSize * Math.sqrt(3);

      const colShift = Math.floor(gridOffsetBg.current.x / bgHoriz);
      const offsetX = ((gridOffsetBg.current.x % bgHoriz) + bgHoriz) % bgHoriz;
      const offsetY = ((gridOffsetBg.current.y % bgVert) + bgVert) % bgVert;

      const cols = Math.ceil(canvas.width / bgHoriz) + 3;
      const rows = Math.ceil(canvas.height / bgVert) + 3;

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.translate(parallax.current.x * 0.35, parallax.current.y * 0.35);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * bgHoriz + offsetX;
          const cy = row * bgVert + ((col + colShift) % 2 !== 0 ? bgVert / 2 : 0) + offsetY;
          drawHex(cx, cy, bgSize);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawGrid = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Depth layer goes first, underneath everything
      drawHexDepthLayer();

      ctx.save();
      ctx.translate(parallax.current.x, parallax.current.y);

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX = ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.current.y % hexVert) + hexVert) % hexVert;

        const cols = Math.ceil(canvas.width / hexHoriz) + 3;
        const rows = Math.ceil(canvas.height / hexVert) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * hexHoriz + offsetX;
            const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.shadowColor = hoverFillColor as string;
              ctx.shadowBlur = 16 * alpha;
              drawHex(cx, cy, squareSize);
              ctx.fillStyle = hoverFillColor;
              ctx.fill();
              ctx.restore();
            }

            drawHex(cx, cy, squareSize);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      } else if (isTri) {
        const halfW = squareSize / 2;
        const colShift = Math.floor(gridOffset.current.x / halfW);
        const rowShift = Math.floor(gridOffset.current.y / squareSize);
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const cols = Math.ceil(canvas.width / halfW) + 4;
        const rows = Math.ceil(canvas.height / squareSize) + 4;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * halfW + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.shadowColor = hoverFillColor as string;
              ctx.shadowBlur = 14 * alpha;
              drawTriangle(cx, cy, squareSize, flip);
              ctx.fillStyle = hoverFillColor;
              ctx.fill();
              ctx.restore();
            }

            drawTriangle(cx, cy, squareSize, flip);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else if (shape === 'circle') {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const cols = Math.ceil(canvas.width / squareSize) + 3;
        const rows = Math.ceil(canvas.height / squareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * squareSize + squareSize / 2 + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.shadowColor = hoverFillColor as string;
              ctx.shadowBlur = 14 * alpha;
              drawCircle(cx, cy, squareSize);
              ctx.fillStyle = hoverFillColor;
              ctx.fill();
              ctx.restore();
            }

            drawCircle(cx, cy, squareSize);
            ctx.strokeStyle = borderColor;
            ctx.stroke();
          }
        }
      } else {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const cols = Math.ceil(canvas.width / squareSize) + 3;
        const rows = Math.ceil(canvas.height / squareSize) + 3;

        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const sx = col * squareSize + offsetX;
            const sy = row * squareSize + offsetY;

            const cellKey = `${col},${row}`;
            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.shadowColor = hoverFillColor as string;
              ctx.shadowBlur = 14 * alpha;
              ctx.fillStyle = hoverFillColor;
              ctx.fillRect(sx, sy, squareSize, squareSize);
              ctx.restore();
            }

            ctx.strokeStyle = borderColor;
            ctx.strokeRect(sx, sy, squareSize, squareSize);
          }
        }
      }

      ctx.restore();

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(250, 245, 238, 0)');
      gradient.addColorStop(1, '#faf5ee');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
      // Gentle, unhurried drift — premium rather than busy
      const effectiveSpeed = Math.max(speed, 0.1) * 0.6;
      const wrapX = isHex ? hexHoriz * 2 : squareSize;
      const wrapY = isHex ? hexVert : isTri ? squareSize * 2 : squareSize;

      const applyStep = (offset: React.MutableRefObject<GridOffset>, mult: number) => {
        const s = effectiveSpeed * mult;
        switch (direction) {
          case 'right':
            offset.current.x = (offset.current.x - s + wrapX) % wrapX;
            break;
          case 'left':
            offset.current.x = (offset.current.x + s + wrapX) % wrapX;
            break;
          case 'up':
            offset.current.y = (offset.current.y + s + wrapY) % wrapY;
            break;
          case 'down':
            offset.current.y = (offset.current.y - s + wrapY) % wrapY;
            break;
          case 'diagonal':
            offset.current.x = (offset.current.x - s + wrapX) % wrapX;
            offset.current.y = (offset.current.y - s + wrapY) % wrapY;
            break;
          default:
            break;
        }
      };

      applyStep(gridOffset, 1);
      applyStep(gridOffsetBg, 0.45); // background layer drifts noticeably slower

      // Smoothly ease the parallax offset toward the pointer target
      const maxShift = Math.min(squareSize * 0.5, 26);
      const targetX = pointerTarget.current.x * maxShift;
      const targetY = pointerTarget.current.y * maxShift;
      parallax.current.x += (targetX - parallax.current.x) * 0.06;
      parallax.current.y += (targetY - parallax.current.y) * 0.06;

      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const updateCellOpacities = () => {
      const targets = new Map<string, number>();

      if (hoveredSquareRef.current) {
        const { x: hc, y: hr } = hoveredSquareRef.current;
        targets.set(`${hc},${hr}`, 0.95);

        // Nearby cells brighten slightly too, falling off with distance —
        // gives a soft ambient glow around the cursor instead of one hard cell.
        const ring: { dx: number; dy: number; op: number }[] = [
          { dx: -1, dy: 0, op: 0.4 },
          { dx: 1, dy: 0, op: 0.4 },
          { dx: 0, dy: -1, op: 0.4 },
          { dx: 0, dy: 1, op: 0.4 },
          { dx: -1, dy: -1, op: 0.2 },
          { dx: 1, dy: -1, op: 0.2 },
          { dx: -1, dy: 1, op: 0.2 },
          { dx: 1, dy: 1, op: 0.2 },
          { dx: -2, dy: 0, op: 0.08 },
          { dx: 2, dy: 0, op: 0.08 },
          { dx: 0, dy: -2, op: 0.08 },
          { dx: 0, dy: 2, op: 0.08 },
        ];
        for (const n of ring) {
          const key = `${hc + n.dx},${hr + n.dy}`;
          if (!targets.has(key)) targets.set(key, n.op);
        }
      }

      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = `${t.x},${t.y}`;
          const trailOp = (trailCells.current.length - i) / (trailCells.current.length + 1);
          if (!targets.has(key) || targets.get(key)! < trailOp) {
            targets.set(key, trailOp);
          }
        }
      }

      for (const [key] of targets) {
        if (!cellOpacities.current.has(key)) {
          cellOpacities.current.set(key, 0);
        }
      }

      // Slower easing = softer, more premium fade rather than a snappy blink
      for (const [key, opacity] of cellOpacities.current) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.1;
        if (next < 0.004) {
          cellOpacities.current.delete(key);
        } else {
          cellOpacities.current.set(key, next);
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Normalized pointer position for the whole-grid parallax shift
      pointerTarget.current = {
        x: mouseX / rect.width - 0.5,
        y: mouseY / rect.height - 0.5,
      };

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz);
        const offsetX = ((gridOffset.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.current.y % hexVert) + hexVert) % hexVert;
        const adjustedX = mouseX - offsetX - parallax.current.x;
        const adjustedY = mouseY - offsetY - parallax.current.y;

        const col = Math.round(adjustedX / hexHoriz);
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
        const row = Math.round((adjustedY - rowOffset) / hexVert);

        if (
          !hoveredSquareRef.current ||
          hoveredSquareRef.current.x !== col ||
          hoveredSquareRef.current.y !== row
        ) {
          if (hoveredSquareRef.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquareRef.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquareRef.current = { x: col, y: row };
        }
      } else if (isTri) {
        const halfW = squareSize / 2;
        const offsetX = ((gridOffset.current.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const adjustedX = mouseX - offsetX - parallax.current.x;
        const adjustedY = mouseY - offsetY - parallax.current.y;

        const col = Math.round(adjustedX / halfW);
        const row = Math.floor(adjustedY / squareSize);

        if (
          !hoveredSquareRef.current ||
          hoveredSquareRef.current.x !== col ||
          hoveredSquareRef.current.y !== row
        ) {
          if (hoveredSquareRef.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquareRef.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquareRef.current = { x: col, y: row };
        }
      } else if (shape === 'circle') {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const adjustedX = mouseX - offsetX - parallax.current.x;
        const adjustedY = mouseY - offsetY - parallax.current.y;

        const col = Math.round(adjustedX / squareSize);
        const row = Math.round(adjustedY / squareSize);

        if (
          !hoveredSquareRef.current ||
          hoveredSquareRef.current.x !== col ||
          hoveredSquareRef.current.y !== row
        ) {
          if (hoveredSquareRef.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquareRef.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquareRef.current = { x: col, y: row };
        }
      } else {
        const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;

        const adjustedX = mouseX - offsetX - parallax.current.x;
        const adjustedY = mouseY - offsetY - parallax.current.y;

        const col = Math.floor(adjustedX / squareSize);
        const row = Math.floor(adjustedY / squareSize);

        if (
          !hoveredSquareRef.current ||
          hoveredSquareRef.current.x !== col ||
          hoveredSquareRef.current.y !== row
        ) {
          if (hoveredSquareRef.current && hoverTrailAmount > 0) {
            trailCells.current.unshift({ ...hoveredSquareRef.current });
            if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
          }
          hoveredSquareRef.current = { x: col, y: row };
        }
      }
    };

    const handleMouseLeave = () => {
      if (hoveredSquareRef.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquareRef.current });
        if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
      }
      hoveredSquareRef.current = null;
      pointerTarget.current = { x: 0, y: 0 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, shape, hoverTrailAmount]);

  return <canvas ref={canvasRef} className="w-full h-full border-none block"></canvas>;
};

export default ShapeGrid;