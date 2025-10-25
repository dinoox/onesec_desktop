import React from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate } from 'react-router'
import { LoginForm } from '@/components/app/login-form.tsx'
import RippleGrid from '@/components/RippleGrid.tsx'
import Aurora from '@/components/Aurora.tsx'

const LoginPage: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  if (isAuthed) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="dark bg-background relative flex min-h-svh w-full items-center justify-center p-6">
      {/* RippleGrid 背景 */}
      {/*<div className="absolute inset-0 w-full h-full">*/}
      {/*  <RippleGrid*/}
      {/*    enableRainbow={false}*/}
      {/*    // gridColor="#5227FF"*/}
      {/*    gridColor="#ffffff"*/}
      {/*    rippleIntensity={0.05}*/}
      {/*    gridSize={10}*/}
      {/*    gridThickness={15}*/}
      {/*    mouseInteraction={true}*/}
      {/*    mouseInteractionRadius={1.2}*/}
      {/*    opacity={1}*/}
      {/*  />*/}
      {/*</div>*/}

      <div className="absolute top-0 left-0 w-full h-full">
        <Aurora
          colorStops={["#7AFE68", "#B09DEF", "#5227FF"]}
          // colorStops={['#ffffff', '#000000']}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* 内容层 */}
      <div className="fixed top-0 left-0 right-0 h-[60px] app-drag-region z-10"></div>
      <div className="relative z-99 flex justify-center">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
