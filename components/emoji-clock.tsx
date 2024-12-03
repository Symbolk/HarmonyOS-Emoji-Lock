'use client'

import { useEffect, useState, useRef } from 'react'
import { Lock } from 'lucide-react'

// Define emoji data with different sizes
const emojis = [
  // 黄色系列 - 开心/积极表情
  { expression: '😊', color: 'bg-yellow-400', size: 80 },
  { expression: '😄', color: 'bg-yellow-400', size: 75 },
  { expression: '😁', color: 'bg-yellow-400', size: 70 },
  { expression: '🥰', color: 'bg-yellow-400', size: 65 },
  { expression: '😋', color: 'bg-yellow-400', size: 60 },
  
  // 橙色系列 - 俏皮/搞怪表情
  { expression: '🤪', color: 'bg-orange-400', size: 75 },
  { expression: '😜', color: 'bg-orange-400', size: 70 },
  { expression: '😝', color: 'bg-orange-400', size: 65 },
  { expression: '🤗', color: 'bg-orange-400', size: 60 },
  
  // 红色系列 - 爱心/害羞表情
  { expression: '😍', color: 'bg-red-400', size: 75 },
  { expression: '🥰', color: 'bg-red-400', size: 70 },
  { expression: '😘', color: 'bg-red-400', size: 65 },
  { expression: '☺️', color: 'bg-red-400', size: 60 },
  
  // 蓝色系列 - 冷静/睡觉表情
  { expression: '😴', color: 'bg-blue-400', size: 75 },
  { expression: '😪', color: 'bg-blue-400', size: 70 },
  { expression: '🥱', color: 'bg-blue-400', size: 65 },
  { expression: '😇', color: 'bg-blue-400', size: 60 },
  
  // 绿色系列 - 自然/放松表情
  { expression: '🌱', color: 'bg-green-400', size: 75 },
  { expression: '🍀', color: 'bg-green-400', size: 70 },
  { expression: '🌿', color: 'bg-green-400', size: 65 },
  { expression: '🌳', color: 'bg-green-400', size: 60 },
  
  // 紫色系列 - 神秘/魔法表情
  { expression: '🔮', color: 'bg-purple-400', size: 75 },
  { expression: '✨', color: 'bg-purple-400', size: 70 },
  { expression: '🌟', color: 'bg-purple-400', size: 65 },
  { expression: '⭐', color: 'bg-purple-400', size: 60 },
  
  // 粉色系列 - 可爱/甜美表情
  { expression: '🎀', color: 'bg-pink-400', size: 75 },
  { expression: '🌸', color: 'bg-pink-400', size: 70 },
  { expression: '🌺', color: 'bg-pink-400', size: 65 },
  { expression: '💝', color: 'bg-pink-400', size: 60 },
  
  // 趣味表情
  { expression: '🦄', color: 'bg-purple-400', size: 80 }, // 独角兽
  { expression: '🌈', color: 'bg-pink-400', size: 75 },   // 彩虹
  { expression: '🍭', color: 'bg-orange-400', size: 70 }, // 棒棒糖
  { expression: '🎨', color: 'bg-blue-400', size: 65 },   // 调色板
  
  // 动物表情
  { expression: '🐱', color: 'bg-yellow-400', size: 75 }, // 猫咪
  { expression: '🐶', color: 'bg-orange-400', size: 70 }, // 狗狗
  { expression: '🐰', color: 'bg-pink-400', size: 65 },   // 兔子
  { expression: '🦊', color: 'bg-red-400', size: 60 },    // 狐狸
]

// 在组件外部添加这两个颜色映射函数
const getGradientColors = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    'bg-yellow-400': '#fbbf24',
    'bg-orange-400': '#fb923c',
    'bg-red-400': '#f87171',
    'bg-blue-400': '#60a5fa',
    'bg-green-400': '#4ade80',
    'bg-purple-400': '#c084fc',
    'bg-pink-400': '#f472b6',
  }
  return colorMap[color] || '#fbbf24'
}

const getDarkerGradientColors = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    'bg-yellow-400': '#f59e0b',
    'bg-orange-400': '#ea580c',
    'bg-red-400': '#ef4444',
    'bg-blue-400': '#3b82f6',
    'bg-green-400': '#22c55e',
    'bg-purple-400': '#a855f7',
    'bg-pink-400': '#ec4899',
  }
  return colorMap[color] || '#f59e0b'
}

interface EmojiPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  targetSize?: number;
  growing?: boolean;
  emojiIndex: number;
  rotation: number;
  angularVel: number;
  rotationDecay: number;
  preferredDirection: number;
  exploding?: boolean;
  explodeProgress?: number;
  particles?: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>;
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
      const selectedEmojis = Array.from({length: 8}, () => ({
        emojiIndex: Math.floor(Math.random() * emojis.length),
        size: 40 + Math.random() * 40
      }))
      
      const initialPositions = selectedEmojis.map(({ emojiIndex, size }) => ({
        x: Math.random() * (containerWidth - size),
        y: Math.random() * (containerHeight / 2),
        vx: 0,
        vy: 0,
        size: size,
        emojiIndex: emojiIndex,
        rotation: Math.random() * 360,
        angularVel: 0,
        rotationDecay: 0.95 + Math.random() * 0.04,
        preferredDirection: Math.random() < 0.5 ? -1 : 1
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
    // 调整基础物理参数
    const friction = 0.985
    const restitution = 0.5
    const rotationFactor = 0.08
    const gravityScale = 0.3
    const massScale = 0.015
    const angularDecay = 0.98

    const animate = () => {
      setPositions(prevPositions => {
        if (!containerRef.current) return prevPositions
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight

        // 处理爆炸动画
        const newPositions = prevPositions.filter(pos => {
          if (pos.exploding) {
            if (pos.explodeProgress! >= 1) {
              return false // 移除完成爆炸的表情
            }
            return true
          }
          return true
        }).map(pos => {
          if (pos.exploding) {
            // 更新爆炸进度
            const newProgress = pos.explodeProgress! + 0.1
            
            // 更新粒子位置
            const newParticles = pos.particles!.map(particle => ({
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vy: particle.vy + 0.5, // 添加重力
              opacity: 1 - newProgress // 逐渐消失
            }))

            return {
              ...pos,
              size: pos.size * (1 - newProgress), // 逐渐缩小
              explodeProgress: newProgress,
              particles: newParticles
            }
          }
          
          // 处理生长动画
          if (pos.growing && pos.targetSize) {
            pos.size = pos.size + (pos.targetSize - pos.size) * 0.1
            if (Math.abs(pos.targetSize - pos.size) < 0.5) {
              pos.size = pos.targetSize
              pos.growing = false
            }
          }

          // 根据大小计算质量因子
          const massFactor = 0.5 + ((pos.size - 40) / 40) * 1.5
          
          // 应用重力时考虑质量
          pos.vx += (gravityX * gravityScale) / massFactor
          pos.vy += (gravityY * gravityScale) / massFactor
          
          pos.x += pos.vx
          pos.y += pos.vy

          // 改进的旋转计算
          const speedFactor = Math.sqrt(pos.vx * pos.vx + pos.vy * pos.vy)
          const targetAngularVel = pos.preferredDirection * speedFactor * rotationFactor
          
          // 角速度向目标值渐变
          pos.angularVel = pos.angularVel * pos.rotationDecay + 
                         (targetAngularVel - pos.angularVel) * (1 - pos.rotationDecay)
          
          // 落地后额外减速旋转
          if (pos.y >= containerHeight - pos.size) {
            pos.angularVel *= angularDecay
          }

          pos.rotation = (pos.rotation + pos.angularVel) % 360

          // 碰撞处理
          if (pos.y > containerHeight - pos.size) {
            pos.y = containerHeight - pos.size
            pos.vy = -pos.vy * restitution
            
            const friction = pos.vx * rotationFactor / massFactor
            pos.angularVel = pos.angularVel * 0.9 + friction * pos.preferredDirection
          }

          if (pos.x < 0) {
            pos.x = 0
            pos.vx = -pos.vx * restitution
            pos.angularVel = Math.abs(pos.angularVel) * pos.preferredDirection
          }
          if (pos.x > containerWidth - pos.size) {
            pos.x = containerWidth - pos.size
            pos.vx = -pos.vx * restitution
            pos.angularVel = Math.abs(pos.angularVel) * pos.preferredDirection
          }

          // 应用摩擦力时考虑质量
          pos.vx *= (friction + (1 - friction) * (1 - 1/massFactor))
          pos.vy *= (friction + (1 - friction) * (1 - 1/massFactor))

          return pos
        })

        // 碰撞检测和处理
        for (let i = 0; i < newPositions.length; i++) {
          for (let j = i + 1; j < newPositions.length; j++) {
            const pos1 = newPositions[i]
            const pos2 = newPositions[j]
            
            const dx = pos2.x - pos1.x
            const dy = pos2.y - pos1.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const minDistance = (pos1.size + pos2.size) / 2
            
            if (distance < minDistance) {
              // 计算两个球的质量因子
              const mass1 = 0.5 + ((pos1.size - 40) / 40) * 1.5
              const mass2 = 0.5 + ((pos2.size - 40) / 40) * 1.5
              
              const angle = Math.atan2(dy, dx)
              const moveX = (Math.cos(angle) * (minDistance - distance)) / 2
              const moveY = (Math.sin(angle) * (minDistance - distance)) / 2

              // 计算相对速度
              const relativeVel = Math.sqrt(
                Math.pow(pos2.vx - pos1.vx, 2) + 
                Math.pow(pos2.vy - pos1.vy, 2)
              )

              // 角速度变化考虑质量
              const angularVelChange = (relativeVel * rotationFactor) / ((mass1 + mass2) / 2)
              newPositions[i].angularVel -= angularVelChange * newPositions[i].preferredDirection
              newPositions[j].angularVel += angularVelChange * newPositions[j].preferredDirection

              // 位置调整
              newPositions[i].x = pos1.x - moveX * (mass2 / (mass1 + mass2))
              newPositions[i].y = pos1.y - moveY * (mass2 / (mass1 + mass2))
              newPositions[j].x = pos2.x + moveX * (mass1 / (mass1 + mass2))
              newPositions[j].y = pos2.y + moveY * (mass1 / (mass1 + mass2))
              
              // 速度调整考虑质量
              const nx = dx / distance
              const ny = dy / distance
              
              const p = 2 * (pos1.vx * nx + pos1.vy * ny - pos2.vx * nx - pos2.vy * ny) 
                        / (mass1 + mass2)
              
              newPositions[i].vx = pos1.vx - p * mass2 * nx * restitution
              newPositions[i].vy = pos1.vy - p * mass2 * ny * restitution
              newPositions[j].vx = pos2.vx + p * mass1 * nx * restitution
              newPositions[j].vy = pos2.vy + p * mass1 * ny * restitution
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
      if (positions.length >= 20) {
        setPositions(prev => {
          // 将第一个表情设置为爆炸状态
          const explodingPositions = [...prev]
          explodingPositions[0] = {
            ...explodingPositions[0],
            exploding: true,
            explodeProgress: 0,
            particles: Array.from({ length: 8 }, () => ({
              x: explodingPositions[0].x + explodingPositions[0].size / 2,
              y: explodingPositions[0].y + explodingPositions[0].size / 2,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              size: explodingPositions[0].size * 0.2,
              opacity: 1
            }))
          }

          // 添加新表情
          const randomIndex = Math.floor(Math.random() * emojis.length)
          const size = 40 + Math.random() * 40
          const maxInitialVelocity = Math.min(6, y / 16)
          
          return [...explodingPositions, {
            x: x - size / 2,
            y: y - size / 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -maxInitialVelocity,
            size: size * 0.2,
            targetSize: size,
            growing: true,
            emojiIndex: randomIndex,
            rotation: Math.random() * 360,
            angularVel: (Math.random() - 0.5) * 8,
            rotationDecay: 0.95 + Math.random() * 0.04,
            preferredDirection: Math.random() < 0.5 ? -1 : 1
          }]
        })
      } else {
        const randomIndex = Math.floor(Math.random() * emojis.length)
        const size = 40 + Math.random() * 40
        
        // 计算安全的初始速度
        const maxInitialVelocity = Math.min(6, y / 16)
        const initialVy = -maxInitialVelocity

        setPositions(prev => [...prev, {
          x: x - size / 2,
          y: y - size / 2,
          vx: (Math.random() - 0.5) * 1.5,
          vy: initialVy,
          size: size * 0.2,
          targetSize: size,
          growing: true,
          emojiIndex: randomIndex,
          rotation: Math.random() * 360,
          angularVel: (Math.random() - 0.5) * 8,
          rotationDecay: 0.95 + Math.random() * 0.04,
          preferredDirection: Math.random() < 0.5 ? -1 : 1
        }])
      }
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
            <div key={index}>
              <div
                className="absolute cursor-pointer group"
                style={{
                  width: `${position.size}px`,
                  height: `${position.size}px`,
                  left: position.x,
                  top: position.y,
                  transform: `rotate(${position.rotation}deg)`,
                  transition: 'transform 0.05s linear',
                  opacity: position.exploding ? 1 - position.explodeProgress! : 1
                }}
                onClick={() => handleEmojiClick(index)}
              >
                <div
                  className={`w-full h-full rounded-full ${emojis[position.emojiIndex].color} flex items-center justify-center overflow-hidden relative group-hover:scale-105`}
                  style={{
                    fontSize: `${position.size * 0.85}px`,
                    background: `radial-gradient(circle at 30% 30%, 
                      ${getGradientColors(emojis[position.emojiIndex].color)}, 
                      ${getDarkerGradientColors(emojis[position.emojiIndex].color)})`,
                    boxShadow: `
                      inset -8px -8px 16px rgba(0, 0, 0, 0.2),
                      inset 8px 8px 16px rgba(255, 255, 255, 0.5),
                      8px 8px 20px rgba(0, 0, 0, 0.15)
                    `,
                  }}
                >
                  {emojis[position.emojiIndex].expression}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: isNightTime(hours) 
                        ? `radial-gradient(circle at ${sunPosition.x}% ${sunPosition.y}%, 
                            rgba(229,231,235,0.4) 0%, 
                            transparent 60%)`
                        : `radial-gradient(circle at ${sunPosition.x}% ${sunPosition.y}%, 
                            rgba(255,255,200,0.4) 0%, 
                            transparent 60%)`,
                      mixBlendMode: 'soft-light',
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: isNightTime(hours)
                        ? `linear-gradient(
                            ${135 + (sunPosition.x / 100) * 90}deg,
                            rgba(255,255,255,0.2) 0%,
                            transparent 50%
                          )`
                        : `linear-gradient(
                            ${135 + (sunPosition.x / 100) * 90}deg,
                            rgba(255,255,255,0.4) 0%,
                            transparent 50%
                          )`,
                      opacity: Math.max(0.3, 1 - getDistance(
                        { x: position.x + position.size/2, y: position.y + position.size/2 },
                        { 
                          x: (sunPosition.x * containerRef.current!.clientWidth / 100) || 0,
                          y: (sunPosition.y * containerRef.current!.clientHeight / 100) || 0
                        }
                      ) / 300),
                      mixBlendMode: 'overlay',
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${
                        100 - sunPosition.x}% ${100 - sunPosition.y}%, 
                        rgba(0,0,0,0.2) 0%,
                        transparent 70%
                      )`,
                      mixBlendMode: 'multiply',
                      filter: 'blur(4px)',
                      opacity: Math.max(0.2, 1 - getDistance(
                        { x: position.x + position.size/2, y: position.y + position.size/2 },
                        { 
                          x: (sunPosition.x * containerRef.current!.clientWidth / 100) || 0,
                          y: (sunPosition.y * containerRef.current!.clientHeight / 100) || 0
                        }
                      ) / 400),
                    }}
                  />
                </div>
              </div>

              {/* 爆炸粒子效果 */}
              {position.exploding && position.particles?.map((particle, i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    left: particle.x,
                    top: particle.y,
                    opacity: particle.opacity,
                    background: getGradientColors(emojis[position.emojiIndex].color),
                    transform: 'translate(-50%, -50%)',
                    transition: 'opacity 0.1s linear'
                  }}
                />
              ))}
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

