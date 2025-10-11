import React from 'react'
import useStatusStore from '@/store/status-store'
import useAuthStore from '@/store/auth-store'
import { IconBell } from "@tabler/icons-react"
import { LucideLogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {useLogoutQuery} from "@/services/queries/auth-query.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

const AuthOverlay: React.FC = () => {
  const authTokenInvalid = useStatusStore((state) => state.authTokenInvalid)
  const isAuthed = useAuthStore((state) => state.isAuthed)
  const mutation = useLogoutQuery()

  async function logout() {
    await mutation.mutateAsync()
  }

  if (!authTokenInvalid || !isAuthed) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
    >
      <Empty className="border border-dashed w-1/2 h-1/2 flex-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconBell />
          </EmptyMedia>
          <EmptyTitle>鉴权失败</EmptyTitle>
          <EmptyDescription>
            用户凭证鉴权失败，请重新登陆以授权秒言
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
          >
            {mutation.isPending ? <Spinner /> : <LucideLogOut />}
            登出
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export default AuthOverlay

