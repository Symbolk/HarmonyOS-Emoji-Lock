'use client'

import { useState } from 'react'

interface FoldablePhoneFrameProps {
  children: React.ReactNode
  onTimeChange: (hours: number, minutes: number) => void
}

export function FoldablePhoneFrame({ children, onTimeChange }: FoldablePhoneFrameProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [currentHours, setCurrentHours] = useState(new Date().getHours())
  const [currentMinutes, setCurrentMinutes] = useState(new Date().getMinutes())

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    const angle = Math.atan2(mouseY, mouseX)

    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle

    const totalMinutes = Math.floor((normalizedAngle / (2 * Math.PI)) * 24 * 60)
    const hours = Math.floor(totalMinutes / 60) % 24
    const minutes = totalMinutes % 60

    setCurrentHours(hours)
    setCurrentMinutes(minutes)
    onTimeChange(hours, minutes)
  }

  const handleReset = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    setCurrentHours(hours)
    setCurrentMinutes(minutes)
    onTimeChange(hours, minutes)
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="phone-frame">
        <div className="screen">
          {children}
        </div>
      </div>
      <div 
        className="analog-clock"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div 
          className="hand hour-hand" 
          style={{
            transform: `rotate(${currentHours * 15 + currentMinutes * 0.25}deg)`
          }}
        />
        <div 
          className="hand minute-hand" 
          style={{
            transform: `rotate(${currentMinutes * 6}deg)`
          }}
        />
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="hour-mark"
            style={{
              position: 'absolute',
              width: '2px',
              height: '10px',
              background: '#000',
              left: '50%',
              top: '5px',
              transformOrigin: '50% 45px',
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </div>
      <button className="reset-button" onClick={handleReset}>
        Reset
      </button>
      <style jsx>{`
        .phone-frame {
          width: min(720px, 90vw);
          height: min(810px, 90vh); /* 保持 16:18 比例但不超过视口高度的 90% */
          background: #000;
          border-radius: 40px;
          position: relative;
          overflow: hidden;
          padding: 8px;
          perspective: 1000px;
        }
        .screen {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 32px;
          overflow: hidden;
          transform-style: preserve-3d;
        }
        .analog-clock {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid #000;
          cursor: move;
        }
        .hand {
          position: absolute;
          left: 50%;
          bottom: 50%;
          transform-origin: bottom center;
          background: #000;
        }
        .hour-hand {
          width: 4px;
          height: 30px;
          margin-left: -2px;
        }
        .minute-hand {
          width: 2px;
          height: 40px;
          margin-left: -1px;
        }
        .reset-button {
          position: absolute;
          right: 20px;
          bottom: 20px;
          padding: 8px 16px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

