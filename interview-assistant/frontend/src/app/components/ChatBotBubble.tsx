'use client'

import { useEffect, useState } from 'react'

export default function ChatBotBubble({ message, delay = 0 }: { message: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Reset state when message changes
    setDisplayedText('')
    setIsVisible(false)
    
    let timeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout
    
    timeoutId = setTimeout(() => {
      setIsVisible(true)
      let index = 0
      intervalId = setInterval(() => {
        if (index < message.length) {
          setDisplayedText((prev) => prev + message[index])
          index++
        } else {
          clearInterval(intervalId)
        }
      }, 20)
    }, delay)
    
    return () => {
      clearTimeout(timeoutId)
      if (intervalId) {
        clearInterval(intervalId)
      }
      setDisplayedText('')
      setIsVisible(false)
    }
  }, [message, delay])

  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-3 rounded-xl shadow-lg text-sm sm:text-base w-fit max-w-md">
      {displayedText}
    </div>
  )
}
