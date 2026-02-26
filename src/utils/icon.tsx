import ReactDOMServer from 'react-dom/server'
import { icons } from 'lucide-react'
import { createElement } from 'react'

/**
 * Get SVG string from lucide icon name
 * @param iconName - The name of the lucide icon (e.g., 'Sparkles', 'Globe')
 * @param size - Icon size in pixels (default: 24)
 * @param strokeWidth - Stroke width (default: 2)
 * @returns SVG string or null if icon not found
 */
export function getIconSvg(
  iconName: string,
  size: number = 24,
  strokeWidth: number = 2,
): string | null {
  const Icon = icons[iconName as keyof typeof icons]
  if (!Icon) return null

  const svg = ReactDOMServer.renderToStaticMarkup(
    createElement(Icon, { size, strokeWidth }),
  )

  return svg
}
