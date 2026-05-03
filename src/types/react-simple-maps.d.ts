declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, CSSProperties } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    width?: number
    height?: number
    style?: CSSProperties
    className?: string
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    center?: [number, number]
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: Geography[] }) => ReactNode
  }

  interface Geography {
    rsmKey: string
    id: string | number
    properties: Record<string, unknown>
  }

  interface GeographyProps {
    geography: Geography
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
    onClick?: (event: React.MouseEvent) => void
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
    className?: string
    tabIndex?: number
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
}
