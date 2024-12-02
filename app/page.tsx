'use client'

import { useState } from 'react'
import EmojiClock from '../components/emoji-clock'
import { FoldablePhoneFrame } from '../components/FoldablePhoneFrame'

export default function Page() {
  const [hours, setHours] = useState(new Date().getHours())
  const [minutes, setMinutes] = useState(new Date().getMinutes())

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHours(newHours)
    setMinutes(newMinutes)
  }

  return (
    <FoldablePhoneFrame onTimeChange={handleTimeChange}>
      <EmojiClock hours={hours} minutes={minutes} />
    </FoldablePhoneFrame>
  )
} 