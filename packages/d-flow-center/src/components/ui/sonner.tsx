import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          // '--success-bg': 'var(--ripple-green-brand)',
          // '--success-text': '#000',
          // '--success-border': '#10b981',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
