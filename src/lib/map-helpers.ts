/**
 * Stretch each map tile by 1px so neighbouring tiles overlap. Hides the thin
 * white seams some browsers show between tiles when the page is zoomed (e.g. 80%).
 */
export function overlapTile(tileSize: number) {
  return (e: { tile: HTMLElement }) => {
    e.tile.style.width = `${tileSize + 1}px`;
    e.tile.style.height = `${tileSize + 1}px`;
  };
}

/** White market-stall tent icon (Lucide "tent") for market pins on the map. */
export const MARKET_PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/></svg>';
