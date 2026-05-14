"use client";

import React, { useState, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Interactive3DBoxProps {
  children: React.ReactNode;
  className?: string;
}

export default function Interactive3DBox({ children, className }: Interactive3DBoxProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20; 
    const rotateY = (centerX - x) / 20;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "perspective-2000 w-full transition-all duration-500 ease-out",
        className
      )}
    >
      <div
        className="relative w-full h-full transition-transform duration-200 ease-out transform-gpu"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Main Box Face */}
        <div 
          className="relative z-10 w-full h-full bg-white border border-border-strong rounded-[40px] shadow-sm overflow-hidden group-hover:shadow-2xl transition-shadow duration-500"
          style={{ transform: "translateZ(0px)" }}
        >
          {/* Glare Effect */}
          <div 
            className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
              opacity: glare.opacity * 0.5
            }}
          />
          {children}
        </div>

        {/* 3D Depth Layers */}
        <div 
          className="absolute inset-0 bg-accent/5 rounded-[40px] -z-10 transition-all duration-500"
          style={{ 
            transform: `translateZ(-20px) scale(${isHovered ? 0.98 : 1})`,
            opacity: isHovered ? 0.6 : 0
          }}
        />
        <div 
          className="absolute inset-0 bg-accent/2 rounded-[40px] -z-20 transition-all duration-700"
          style={{ 
            transform: `translateZ(-40px) scale(${isHovered ? 0.96 : 1})`,
            opacity: isHovered ? 0.4 : 0
          }}
        />
      </div>
    </div>
  );
}
