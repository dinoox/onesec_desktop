import React from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate, useLocation } from 'react-router'

export default function AuthGuardContainer({
  code,
  children,
}: {
  code?: string
  children: React.ReactNode
}) {
  const { pathname } = useLocation()
  const isAuthed = useAuthStore((state) => state.isAuthed)
  if (code) {
    console.log(code)
  }

  console.log('isAuthed: ', isAuthed)

  return isAuthed ? children : <Navigate to="/login" replace state={pathname} />
}
