import React from 'react'
import { cn } from '@/lib/utils'

const CurrencyRipple: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative w-[500px] h-[500px] flex items-center justify-center  rounded-3xl overflow-hidden',
        className,
      )}
    >
      {/* 同心旋转矩形层 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-[170px] h-[170px] rounded-[70px] bg-[#FCF7EB] rotate-[500deg]" />
        <div className="absolute w-[140px] h-[140px] rounded-[55px] bg-[#FAF1DD] rotate-[0deg]" />
        <div className="absolute w-[110px] h-[110px] rounded-[40px] bg-[#F4EBCE] rotate-[60deg]" />
        <div className="absolute w-[80px] h-[80px] rounded-[30px] bg-[#F1E6BB] rotate-[30deg]" />
        <div className="absolute w-[50px] h-[50px] rounded-[20px] bg-[#F1DFB3] rotate-[0deg]" />
      </div>

      {/* 美元符号 */}
      <div className="relative z-10 text-[#3d3d3d] text-xl font-semibold">$</div>
    </div>
  )
}

export default CurrencyRipple
