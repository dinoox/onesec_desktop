import { OctagonAlert, CheckIcon, ShieldXIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckIcon size={20} />,
        error: <ShieldXIcon size={20} />,
        warning: <OctagonAlert size={20} />,
      }}
      toastOptions={{
        classNames: {
          // icon: 'mb-[0.5px]',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--background)',
          '--success-text': 'var(--ripple-brand-text)',
          '--success-border': 'var(--border)',
          '--warning-bg': 'var(--background)',
          '--warning-text': 'var(--ripple-brand-text)',
          '--warning-border': 'var(--border)',
          '--error-bg': 'var(--background)',
          '--error-text': 'var(--ripple-error-text)',
          '--error-border': 'var(--border)',
          '--toast-icon-margin-start': '0px',
          '--toast-icon-margin-end': '6px',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
