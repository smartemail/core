import { Grid } from 'antd'

const { useBreakpoint } = Grid

/**
 * Returns true when viewport is below 768px (md breakpoint).
 * Uses Ant Design's Grid.useBreakpoint() for consistency with the UI library.
 */
export function useIsMobile(): boolean {
  const screens = useBreakpoint()
  // md is true when viewport >= 768px, so !md means mobile
  return !screens.md
}
