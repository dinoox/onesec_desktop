'use client'

import React from 'react'

interface LogoIconProps {
  size?: number
}

const LogoIcon: React.FC<LogoIconProps> = ({ size = 60 }) => {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* 中心绿点 */}
      <div className="absolute z-[2] w-[12px] h-[12px] rounded-full bg-[#2EDDA8] border border-black/10" />

      {/* 外圈灰环 */}
      <div className="absolute z-[1] w-[30px] h-[30px] rounded-full border-2 border-[#ccc]" />
    </div>
  )
}

export default LogoIcon
