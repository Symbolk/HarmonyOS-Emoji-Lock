'use client'

import { useEffect, useState, useRef } from 'react'
import { Lock } from 'lucide-react'

// Define emoji data with different sizes
const emojis = [
  { expression: '😊', color: 'bg-yellow-400', size: 80 },
  { expression: '😘', color: 'bg-yellow-400', size: 70 },
  { expression: '😥', color: 'bg-yellow-400', size: 75 },
  { expression: '😯', color: 'bg-orange-400', size: 65 },
  { expression: '🤔', color: 'bg-yellow-400', size: 60 },
  { expression: '😴', color: 'bg-orange-400', size: 55 },
  { expression: '😳', color: 'bg-yellow-400', size: 50 },
  { expression: '🥺', color: 'bg-orange-400', size: 45 },
  { expression: '😅', color: 'bg-yellow-400', size: 40 },
  { expression: '😂', color: 'bg-orange-400', size: 60 },
]

interface EmojiPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  targetSize?: number;
  growing?: boolean;
  emojiIndex: number;
}

interface Cloud {
  size: number;
  speed: number;
  initialSize: number;
  initialHeight: number;
}

interface EmojiClockProps {
  hours: number
  minutes: number
}

export default function EmojiClock({ hours, minutes }: EmojiClockProps) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [positions, setPositions] = useState<EmojiPosition[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const [gravityX, setGravityX] = useState(0)
  const [gravityY, setGravityY] = useState(0.5)
  const deviceSupportsMotion = useRef(false)
  const [sunPosition, setSunPosition] = useState({
    x: 0,
    y: 0,
    color: '#FFE87C',
    opacity: 1,
    glowColor: 'rgba(255,220,100,',
    skyGradient: 'from-blue-300 to-blue-100',
    cloudColor: 'white',
    cloudOpacity: 0.8,
    skyColors: ['#87CEEB', '#87CEEB', '#87CEEB']
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cloudPositions, setCloudPositions] = useState<number[]>([])
  const [cloudSizes, setCloudSizes] = useState<number[]>([])
  const [cloudHeights, setCloudHeights] = useState<number[]>([])
  const [clouds, setClouds] = useState([
    { size: 80, speed: 0.01, initialSize: 80, initialHeight: 15 },
    { size: 65, speed: 0.008, initialSize: 65, initialHeight: 18 },
    { size: 90, speed: 0.005, initialSize: 90, initialHeight: 12 },
    { size: 70, speed: 0.012, initialSize: 70, initialHeight: 20 },
    { size: 85, speed: 0.015, initialSize: 85, initialHeight: 16 },
  ])
  const [isTimeAdjusting, setIsTimeAdjusting] = useState(false)
  const timeAdjustingRef = useRef<NodeJS.Timeout>()
  const lastTimeRef = useRef({ hours: hours, minutes: minutes })
  const [timeDirection, setTimeDirection] = useState<'forward' | 'backward'>('forward')

  useEffect(() => {
    const now = new Date()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]
    setDate(`${month}月${day}日 星期${weekday}`)
  }, [])

  useEffect(() => {
    setTime(`${hours.toString().padStart(2, '0')}\n${minutes.toString().padStart(2, '0')}`)
  }, [hours, minutes])

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight
      const initialPositions = emojis.map((emoji, index) => ({
        x: Math.random() * (containerWidth - emoji.size),
        y: Math.random() * (containerHeight / 2),
        vx: 0,
        vy: 0,
        size: emoji.size,
        emojiIndex: index
      }))
      setPositions(initialPositions)
    }
  }, [])

  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.accelerationIncludingGravity) {
        deviceSupportsMotion.current = true
        setGravityX(event.accelerationIncludingGravity.x! * 0.1)
        setGravityY(event.accelerationIncludingGravity.y! * 0.1)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      
      switch (event.code) {
        case 'ArrowLeft':
          setGravityX(-2)
          break
        case 'ArrowRight':
          setGravityX(2)
          break
        case 'ArrowUp':
          setGravityY(-2)
          break
        case 'ArrowDown':
          setGravityY(2)
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
          setGravityX(0)
          break
        case 'ArrowUp':
        case 'ArrowDown':
          setGravityY(0.5)
          break
      }
    }

    setGravityX(0)
    setGravityY(0.5)

    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', handleDeviceMotion)
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion)
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
      }
    }
  }, [])

  useEffect(() => {
    const friction = 0.99
    const restitution = 0.3

    const checkCollision = (pos1: EmojiPosition, pos2: EmojiPosition) => {
      const dx = pos2.x - pos1.x
      const dy = pos2.y - pos1.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = (pos1.size + pos2.size) / 2
      
      if (distance < minDistance) {
        const angle = Math.atan2(dy, dx)
        const targetX = pos1.x + Math.cos(angle) * minDistance
        const targetY = pos1.y + Math.sin(angle) * minDistance
        
        return {
          x1: pos1.x,
          y1: pos1.y,
          x2: targetX,
          y2: targetY,
          overlap: minDistance - distance
        }
      }
      return null
    }

    const animate = () => {
      setPositions(prevPositions => {
        if (!containerRef.current) return prevPositions
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight

        const newPositions = prevPositions.map(pos => {
          let { x, y, vx, vy, size, targetSize, growing, emojiIndex } = pos

          if (growing && size < targetSize!) {
            size = size + (targetSize! - size) * 0.1
            if (Math.abs(targetSize! - size) < 0.5) {
              size = targetSize!
              growing = false
            }
          }

          vx += gravityX
          vy += gravityY
          
          x += vx
          y += vy

          if (y > containerHeight - size) {
            y = containerHeight - size
            vy = -vy * restitution
          }

          if (x < 0) {
            x = 0
            vx = -vx * restitution
          }
          if (x > containerWidth - size) {
            x = containerWidth - size
            vx = -vx * restitution
          }

          vx *= friction
          vy *= friction

          return { x, y, vx, vy, size, targetSize, growing, emojiIndex }
        })

        for (let i = 0; i < newPositions.length; i++) {
          for (let j = i + 1; j < newPositions.length; j++) {
            const collision = checkCollision(newPositions[i], newPositions[j])
            
            if (collision) {
              const pos1 = newPositions[i]
              const pos2 = newPositions[j]
              
              const dx = pos2.x - pos1.x
              const dy = pos2.y - pos1.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const nx = dx / distance
              const ny = dy / distance
              
              const overlap = (pos1.size + pos2.size) / 2 - distance
              const separationX = nx * overlap / 2
              const separationY = ny * overlap / 2
              
              newPositions[i] = {
                ...pos1,
                x: pos1.x - separationX,
                y: pos1.y - separationY,
                vx: pos1.vx - nx * restitution,
                vy: pos1.vy - ny * restitution
              }
              
              newPositions[j] = {
                ...pos2,
                x: pos2.x + separationX,
                y: pos2.y + separationY,
                vx: pos2.vx + nx * restitution,
                vy: pos2.vy + ny * restitution
              }
            }
          }
        }

        return newPositions
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gravityX, gravityY])

  const handleEmojiClick = (index: number) => {
    setPositions(prevPositions => {
      const newPositions = [...prevPositions]
      newPositions[index] = {
        ...newPositions[index],
        vy: -15
      }
      return newPositions
    })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  useEffect(() => {
    const updateSunPosition = () => {
      const timeProgress = (hours * 60 + minutes) / (24 * 60)
      const x = 100 - (Math.sin(timeProgress * Math.PI * 2) * 40 + 50)
      const baseHeight = Math.sin(timeProgress * Math.PI)
      const y = baseHeight * 50 + 10

      let sunColor = '#FFE87C'
      let sunOpacity = 1
      let glowColor = 'rgba(255,220,100,'
      let skyGradient = 'from-blue-300 to-blue-100'
      let cloudColor = 'white'
      let cloudOpacity = 0.8
      let skyColors = ['#87CEEB', '#87CEEB', '#87CEEB']

      if (hours < 6 || hours >= 19) { // 夜晚
        sunColor = '#FF6B6B'
        sunOpacity = 0.6
        glowColor = 'rgba(255,107,107,'
        skyColors = ['#1a365d', '#2d3748', '#1a365d']
        cloudColor = '#4a5568'
        cloudOpacity = 0.6
        skyGradient = 'from-indigo-900 via-blue-900 to-indigo-900'
      } else if (hours < 8) { // 日出
        sunColor = '#FFA07A'
        glowColor = 'rgba(255,160,122,'
        skyColors = ['#FF7F50', '#87CEEB', '#87CEEB']
        cloudColor = '#fcd34d'
        skyGradient = 'from-orange-300 via-blue-200 to-blue-300'
      } else if (hours >= 17) { // 日落
        if (hours >= 18) { // 深度昏
          sunColor = '#FF7F50'
          glowColor = 'rgba(255,127,80,'
          skyColors = ['#FF6B6B', '#FFA07A', '#87CEEB']
          cloudColor = '#f87171'
          skyGradient = 'from-orange-500 via-pink-300 to-blue-400'
        } else { // 傍晚（参考图片的火烧云效果）
          sunColor = '#FFB6C1'
          glowColor = 'rgba(255,182,193,'
          skyColors = ['#FF8C00', '#FF69B4', '#87CEEB']
          cloudColor = '#FFA07A'
          skyGradient = 'from-orange-400 via-pink-200 to-blue-300'
        }
      }

      setSunPosition({ 
        x, 
        y, 
        color: sunColor, 
        opacity: sunOpacity, 
        glowColor,
        skyGradient,
        cloudColor,
        cloudOpacity,
        skyColors
      })
    }

    updateSunPosition()
  }, [hours, minutes])

  useEffect(() => {
    setCloudPositions(clouds.map(() => Math.random() * 100))
    setCloudHeights(clouds.map(cloud => cloud.initialHeight))
    setCloudSizes(clouds.map(cloud => cloud.initialSize))
  }, [])

  useEffect(() => {
    let animationId: number
    
    const animate = () => {
      setCloudPositions(prevPositions => {
        if (prevPositions.length < 5) {
          const newPositions = [...prevPositions]
          const neededClouds = 5 - prevPositions.length
          for (let i = 0; i < neededClouds; i++) {
            newPositions.push(timeDirection === 'forward' ? 120 : -20)
          }
          return newPositions
        }

        return prevPositions.map((pos, index) => {
          const cloud = clouds[index]
          if (!cloud) return pos

          const speedMultiplier = isTimeAdjusting ? 10 : 1
          const speed = timeDirection === 'forward' ? -cloud.speed : cloud.speed
          const newPos = pos + speed * speedMultiplier

          if (timeDirection === 'forward') {
            if (newPos < -20) {
              return 120 + Math.random() * 40
            }
          } else {
            if (newPos > 120) {
              return -20 - Math.random() * 40
            }
          }

          return newPos
        })
      })

      setCloudSizes(prevSizes => {
        if (prevSizes.length < clouds.length) {
          const newSizes = [...prevSizes]
          const neededClouds = clouds.length - prevSizes.length
          for (let i = 0; i < neededClouds; i++) {
            const size = 40 + Math.random() * 60
            newSizes.push(size)
          }
          return newSizes
        }
        return prevSizes
      })

      setCloudHeights(prevHeights => {
        if (prevHeights.length < clouds.length) {
          const newHeights = [...prevHeights]
          const neededClouds = clouds.length - prevHeights.length
          for (let i = 0; i < neededClouds; i++) {
            newHeights.push(10 + Math.random() * 20)
          }
          return newHeights
        }
        return prevHeights
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [clouds, isTimeAdjusting, timeDirection])

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const x = event.clientX - containerRect.left
    const y = event.clientY - containerRect.top
    const relativeX = (x / containerRect.width) * 100
    const relativeY = (y / containerRect.height) * 100

    const isClickingEmoji = (event.target as Element).closest('.group') !== null

    const isInEmojiContainer = (event.target as Element).closest('.container-area') !== null

    if (isInEmojiContainer && !isClickingEmoji) {
      const randomIndex = Math.floor(Math.random() * emojis.length)
      const randomEmoji = emojis[randomIndex]
      const size = randomEmoji.size * 0.2

      setPositions(prev => [...prev, {
        x: x - size / 2,
        y: y - size / 2,
        vx: 0,
        vy: 0,
        size: size,
        targetSize: randomEmoji.size,
        growing: true,
        emojiIndex: randomIndex,
      }])
    } else if (!isInEmojiContainer) {
      const newCloud = generateRandomCloud()
      
      setClouds(prev => [...prev, newCloud])
      setCloudPositions(prev => [...prev, relativeX])
      setCloudSizes(prev => [...prev, newCloud.size])
      setCloudHeights(prev => [...prev, relativeY])
      
      setTimeout(() => {
        setCloudSizes(prev => {
          const newSizes = [...prev]
          newSizes[newSizes.length - 1] = newCloud.initialSize
          return newSizes
        })
      }, 50)
    }
  }

  useEffect(() => {
    const currentTotalMinutes = hours * 60 + minutes
    const lastTotalMinutes = lastTimeRef.current.hours * 60 + lastTimeRef.current.minutes
    
    if (currentTotalMinutes !== lastTotalMinutes) {
      const diff = (currentTotalMinutes - lastTotalMinutes + 24 * 60) % (24 * 60)
      setTimeDirection(diff <= 12 * 60 ? 'forward' : 'backward')
    }
    
    lastTimeRef.current = { hours, minutes }
    
    setIsTimeAdjusting(true)
    
    if (timeAdjustingRef.current) {
      clearTimeout(timeAdjustingRef.current)
    }
    
    timeAdjustingRef.current = setTimeout(() => {
      setIsTimeAdjusting(false)
    }, 1000)

    return () => {
      if (timeAdjustingRef.current) {
        clearTimeout(timeAdjustingRef.current)
      }
    }
  }, [hours, minutes])

  // 在 EmojiClock 组件中添加一个函数来判断是否是夜间
  const isNightTime = (hours: number) => {
    return hours < 6 || hours >= 19
  }

  return (
    <div 
      className="h-full relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${sunPosition.skyColors[0]} 0%, ${sunPosition.skyColors[1]} 50%, ${sunPosition.skyColors[2]} 100%)`,
        padding: '2rem',
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute z-10"
        style={{
          left: `${sunPosition.x}%`,
          top: `${sunPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="relative"
          style={{
            width: '160px',
            height: '160px',
          }}
        >
          {isNightTime(hours) ? (
            // 月亮
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                opacity: 0.9,
                boxShadow: `
                  0 0 80px 40px rgba(229,231,235,0.3),
                  0 0 120px 80px rgba(229,231,235,0.2)
                `,
                filter: 'blur(2px)',
              }}
            >
              {/* 月亮表面的陨石坑效果 */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '30px',
                  height: '30px',
                  left: '30%',
                  top: '20%',
                  background: 'rgba(209,213,219,0.8)',
                  filter: 'blur(4px)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '20px',
                  height: '20px',
                  right: '25%',
                  top: '40%',
                  background: 'rgba(209,213,219,0.6)',
                  filter: 'blur(3px)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '25px',
                  height: '25px',
                  left: '45%',
                  bottom: '30%',
                  background: 'rgba(209,213,219,0.7)',
                  filter: 'blur(3px)',
                }}
              />
            </div>
          ) : (
            // 太阳
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: sunPosition.color,
                opacity: sunPosition.opacity,
                boxShadow: `
                  0 0 80px 40px ${sunPosition.glowColor}0.4),
                  0 0 120px 80px ${sunPosition.glowColor}0.2)
                `,
                filter: 'blur(2px)',
              }}
            />
          )}
        </div>
      </div>

      <div className="absolute inset-0 z-10">
        {clouds.map((cloud, index) => (
          <div
            key={index}
            className="absolute pointer-events-none select-none"
            style={{
              left: `${cloudPositions[index]}%`,
              top: `${cloudHeights[index]}%`,
              fontSize: `${cloudSizes[index]}px`,
              color: sunPosition.cloudColor,
              opacity: sunPosition.cloudOpacity,
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))',
              transform: 'scale(1, 0.9)',
              transition: 'font-size 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            ☁️
          </div>
        ))}
      </div>

      <div className="flex flex-col h-full relative z-20">
        <div className="text-center mt-24">
          <pre 
            className={`text-9xl font-bold whitespace-pre-line leading-none mb-4 transition-all duration-500 ${
              isNightTime(hours) 
                ? 'text-gray-100/70 [text-shadow:0_0_15px_rgba(255,255,255,0.5),0_0_30px_rgba(255,255,255,0.3)]' 
                : 'text-gray-600/40'
            }`}
          >
            {time}
          </pre>
          <p 
            className={`text-2xl transition-all duration-500 ${
              isNightTime(hours)
                ? 'text-gray-200/80 [text-shadow:0_0_10px_rgba(255,255,255,0.4)]'
                : 'text-gray-600/40'
            }`}
          >
            {date}
          </p>
        </div>
        
        <div 
          ref={containerRef} 
          className="mt-auto relative h-2/5 container-area"
          onClick={handleContainerClick}
        >
          {positions.map((position, index) => (
            <div
              key={index}
              className="absolute cursor-pointer group"
              style={{
                width: `${position.size}px`,
                height: `${position.size}px`,
                left: position.x,
                top: position.y,
                transition: 'transform 0.2s ease-out',
              }}
              onClick={() => handleEmojiClick(index)}
            >
              <div
                className={`w-full h-full rounded-full ${emojis[position.emojiIndex].color} flex items-center justify-center overflow-hidden relative group-hover:scale-105`}
                style={{
                  fontSize: `${position.size * 0.6}px`,
                  background: `radial-gradient(circle at 30% 30%, 
                    ${emojis[position.emojiIndex].color === 'bg-yellow-400' ? '#fbbf24' : '#fb923c'}, 
                    ${emojis[position.emojiIndex].color === 'bg-yellow-400' ? '#f59e0b' : '#ea580c'})`,
                  boxShadow: `
                    inset -8px -8px 16px rgba(0, 0, 0, 0.2),
                    inset 8px 8px 16px rgba(255, 255, 255, 0.5),
                    8px 8px 20px rgba(0, 0, 0, 0.15),
                    0 0 30px ${sunPosition.glowColor}${
                      Math.max(0.1, 1 - getDistance(
                        { x: position.x + position.size/2, y: position.y + position.size/2 }, 
                        { x: (sunPosition.x * containerRef.current!.clientWidth / 100) || 0, 
                          y: (sunPosition.y * containerRef.current!.clientHeight / 100) || 0 }
                      ) / 300)
                    })
                  `,
                  transition: 'all 0.3s ease-out',
                }}
              >
                {emojis[position.emojiIndex].expression}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `
                      radial-gradient(
                        circle at ${mousePosition.x}% ${mousePosition.y}%, 
                        rgba(255,255,255,0.5) 0%, 
                        transparent 70%
                      ),
                      radial-gradient(
                        circle at ${sunPosition.x}% ${sunPosition.y}%, 
                        ${sunPosition.glowColor}0.5) 0%, 
                        transparent 70%
                      )
                    `,
                    pointerEvents: 'none',
                    mixBlendMode: 'soft-light',
                    opacity: 0.8,
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(
                        circle at ${mousePosition.x}% ${mousePosition.y}%, 
                        rgba(0,0,0,0.2) 0%,
                        transparent 50%
                      )
                    `,
                    transform: 'scale(1.1)',
                    transition: 'opacity 0.2s ease-out',
                    mixBlendMode: 'multiply',
                    filter: 'blur(4px)',
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(
                        circle at ${mousePosition.x}% ${mousePosition.y}%, 
                        rgba(255,255,255,0.4) 0%,
                        transparent 60%
                      )
                    `,
                    transform: 'scale(0.9)',
                    transition: 'opacity 0.2s ease-out',
                    mixBlendMode: 'screen',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-8 right-8">
        <Lock className="w-8 h-8 text-gray-600/60" />
      </div>
    </div>
  )
}

function getDistance(point1: { x: number, y: number }, point2: { x: number, y: number }) {
  const dx = point1.x - point2.x
  const dy = point1.y - point2.y
  return Math.sqrt(dx * dx + dy * dy)
}

const generateRandomCloud = () => {
  const size = 40 + Math.random() * 60
  return {
    size: size * 0.2,
    speed: 0.005 + Math.random() * 0.015,
    initialSize: size,
    initialHeight: 10 + Math.random() * 20,
    growing: true
  }
}

