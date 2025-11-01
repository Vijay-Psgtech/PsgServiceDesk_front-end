import React, { useRef, useEffect } from "react";

export function CanvasRevealEffect({
  animationSpeed = 5,
  colors = [[239, 68, 68], [220, 38, 38]], // red gradient
  opacities = [0.2, 0.4, 0.6, 1],
  dotSize = 2,
  containerClassName = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      frame += 0.02 * animationSpeed;

      for (let i = 0; i < 100; i++) {
        const [r, g, b] = colors[i % colors.length];
        const opacity =
          opacities[Math.floor(Math.random() * opacities.length)];
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        const x = Math.sin(i + frame) * width * 0.4 + width / 2;
        const y = Math.cos(i + frame) * height * 0.4 + height / 2;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    render();

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [animationSpeed, colors, opacities, dotSize]);

  return (
    <div className={`absolute inset-0 ${containerClassName}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
