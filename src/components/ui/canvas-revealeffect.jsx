"use client";
import React, { useEffect, useRef } from "react";

/**
 * CanvasRevealEffect
 * A reusable canvas background effect component.
 *
 * Props:
 *  - containerClassName: className for the container div
 *  - colors: array of colors for dots or lines (optional)
 *  - opacities: array of opacities for dots (optional)
 *  - dotSize: size of each dot (optional)
 */
export const CanvasRevealEffect = ({
  containerClassName = "",
  colors = ["#60a5fa", "#f472b6", "#22c55e"],
  opacities = [0.3, 0.5, 0.7],
  dotSize = 3,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // Example: render some simple dots
    const dots = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: opacities[Math.floor(Math.random() * opacities.length)],
      size: dotSize,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `${dot.color}${Math.floor(dot.opacity * 255).toString(16)}`;
        ctx.fill();
        dot.x += dot.dx;
        dot.y += dot.dy;

        // Wrap around
        if (dot.x < 0) dot.x = width;
        if (dot.x > width) dot.x = 0;
        if (dot.y < 0) dot.y = height;
        if (dot.y > height) dot.y = 0;
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  
    return () => cancelAnimationFrame(animationFrameId);
  }, [colors, opacities, dotSize]);

  return <canvas ref={canvasRef} className={containerClassName}></canvas>;
};
