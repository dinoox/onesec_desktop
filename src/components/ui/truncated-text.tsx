import React, { useState } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip'

interface TruncatedTextProps {
  text: string
  className?: string
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({ text, className = '' }) => {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const element = textRef.current
    if (element) {
      setIsOverflowing(element.scrollWidth > element.clientWidth)
    }
  }, [text])

  if (isOverflowing) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={textRef} className={`block truncate ${className}`}>
            {text}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <span ref={textRef} className={`block truncate ${className}`}>
      {text}
    </span>
  )
}
