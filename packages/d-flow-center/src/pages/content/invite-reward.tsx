import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  useGetTransactions,
  useGetRanking,
  useExchangeMembership,
} from '@/services/queries/points-query'
import { useGetUserInfo } from '@/services/queries/user-query'
import { ArrowUpRight, ArrowDownRight, Gift, Copy } from 'lucide-react'
import { IconAward, IconHistory, IconTrophy, IconShare } from '@tabler/icons-react'
import useAuthStore from '@/store/auth-store'
const ContentPage: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const { isLoading: userLoading } = useGetUserInfo()
  const { data: transactions, isLoading: txLoading } = useGetTransactions(10, 0)
  const { data: ranking, isLoading: rankLoading } = useGetRanking(10, 0)
  const exchangeMutation = useExchangeMembership()

  const handleExchange = async () => {
    await exchangeMutation.mutateAsync('pro')
  }

  const handleCopyShareLink = async () => {
    const shareCode = user?.share_code ?? ''
    const text = `秒言语音输入又快又准。注册即得一个月 pro 会员，立即开启高效输入！邀请链接：https://www.miaoyan.cn/download.html 邀请码：${shareCode}`
    await navigator.clipboard.writeText(text)
    toast.success('已复制分享链接')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* 积分区域 */}
      <div className="space-y-2 border p-4 rounded-xl">
        <div className="flex items-center gap-2 text-[15px] font-medium">
          <Gift className="w-5 h-5 text-ripple-brand-text" />
          <span>我的积分</span>
        </div>
        <div className="flex items-center justify-between rounded-xl py-4">
          {userLoading ? (
            <Skeleton className="h-[36px] w-20 animate-in fade-in duration-300" />
          ) : (
            <span className="text-3xl font-medium animate-in fade-in duration-300">
              {user?.points ?? 0}
            </span>
          )}
          <Button
            size="sm"
            onClick={handleExchange}
            disabled={
              exchangeMutation.isPending || userLoading || !user || user.points < 100
            }
            variant="outline"
          >
            {exchangeMutation.isPending && <Spinner />}
            <IconAward />
            <span>兑换会员</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">100 积分可兑换 1 个月 Pro 会员</p>
      </div>

      {/* 分享邀请 */}
      <div className="space-y-2 border p-4 rounded-xl">
        <div className="flex items-center gap-2 text-[15px] font-medium">
          <IconShare className="w-5 h-5 text-ripple-brand-text" />
          <span>邀请好友</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <div className="space-y-1">
            <p className="text-sm">
              我的邀请码：
              <span className="font-mono font-medium">{user?.share_code ?? '-'}</span>
            </p>
            <p className="text-xs text-muted-foreground">邀请好友注册可获得积分奖励</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleCopyShareLink}>
            <Copy className="w-4 h-4" />
            <span>复制分享链接</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 交易记录 */}
        <div className="space-y-2 border p-4 rounded-xl">
          <div className="flex items-center gap-2 text-[15px] font-medium">
            <IconHistory className="w-5 h-5 text-ripple-brand-text" />
            积分记录
          </div>
          <div className="max-h-[211px] overflow-y-auto">
            {txLoading ? (
              <div className="space-y-2 animate-in fade-in duration-300">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[46px] w-full rounded-xl" />
                ))}
              </div>
            ) : transactions?.transactions.length ? (
              <Table className="animate-in fade-in duration-300">
                <TableBody>
                  {transactions.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="w-8">
                        {tx.points > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-ripple-brand-text" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-ripple-brand-text" />
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="">{tx.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={tx.points > 0 ? 'default' : 'secondary'}>
                          {tx.points > 0 ? '+' : ''}
                          {tx.points}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[100px]">
                <p className="text-sm text-muted-foreground">暂无记录</p>
              </div>
            )}
          </div>
        </div>

        {/* 排行榜 */}
        <div className="space-y-4 border p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-medium">
              <IconTrophy className="w-5 h-5 text-ripple-brand-text" />
              <span>积分排行榜</span>
            </div>
            {ranking?.current_user_rank && (
              <span className="text-xs text-muted-foreground">
                第 {ranking.current_user_rank} 名
              </span>
            )}
          </div>
          <div className="max-h-[211px] overflow-y-auto">
            {rankLoading ? (
              <div className="space-y-2 animate-in fade-in duration-300">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[29px] w-full rounded-xl" />
                ))}
              </div>
            ) : ranking?.ranking.length ? (
              <Table className="animate-in fade-in duration-300">
                <TableBody>
                  {ranking.ranking.map((item) => (
                    <TableRow key={item.rank}>
                      <TableCell className="w-10 pl-0">
                        <span
                          className={` flex items-center justify-center  ${
                            item.rank === 1
                              ? ''
                              : item.rank === 2
                                ? ''
                                : item.rank === 3
                                  ? ''
                                  : ''
                          }`}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell className=" truncate max-w-[100px]">
                        {item.phone}
                      </TableCell>
                      <TableCell className="text-right text-ripple-brand-text">
                        {item.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[100px] animate-in fade-in duration-300">
                <p className="text-sm text-muted-foreground">暂无排行</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentPage
