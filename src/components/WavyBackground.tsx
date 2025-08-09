"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createNoise3D } from 'simplex-noise';
import { styled } from 'styled-components';

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export default function WavyBackground({ children, blur = 8 }: { children?: React.ReactNode; blur?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const noise = createNoise3D();
  let w = 0, h = 0, nt = 0, ctx: CanvasRenderingContext2D | null = null;

  const init = () => {
    const canvas = canvasRef.current!;
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    render();
  };

  // Slightly faster
  const getSpeed = () => 0.0006;

  const colors = ['#0EA5E9', '#38BDF8', '#60A5FA', '#3B82F6', '#1D4ED8'];

  const drawWave = (n: number) => {
    if (!ctx) return;
    nt += getSpeed();
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = 40;
      ctx.strokeStyle = colors[i % colors.length];
      for (let x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.25 * i, nt) * 70;
        ctx.lineTo(x, y + h * 0.5); // center baseline
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let raf = 0;
  const render = () => {
    if (!ctx) return;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    raf = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    const onResize = () => init();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(typeof window !== 'undefined' && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'));
  }, []);

  return (
    <Root>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, ...(isSafari ? { filter: `blur(${blur}px)` } : {}) }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, width: '100%', maxWidth: '100vw', padding: '0 16px' }}>
        {children}
      </div>
    </Root>
  );
}
