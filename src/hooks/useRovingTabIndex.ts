"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";

/**
 * useRovingTabIndex – implements the
 * [roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)
 * pattern for composite widgets (toolbars, tab lists, radio groups, etc.).
 *
 * Only the currently active item has `tabIndex={0}`; all others have
 * `tabIndex={-1}`. Arrow keys, Home, and End move focus within the group.
 *
 * @example
 * function TabList({ tabs }: { tabs: string[] }) {
 *   const { registerItem, getTabIndex, handleKeyDown } = useRovingTabIndex<HTMLButtonElement>();
 *   return (
 *     <div role="tablist">
 *       {tabs.map((tab, i) => (
 *         <button
 *           key={tab}
 *           role="tab"
 *           ref={(el) => registerItem(el, i)}
 *           tabIndex={getTabIndex(i)}
 *           onKeyDown={(e) => handleKeyDown(e, i)}
 *         >
 *           {tab}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useRovingTabIndex<T extends HTMLElement>() {
  const itemsRef = useRef<(T | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Call this as a callback ref on each item in the group.
   * e.g. `ref={(el) => registerItem(el, index)}`
   */
  const registerItem = useCallback((element: T | null, index: number) => {
    itemsRef.current[index] = element;
  }, []);

  /**
   * Attach to the `onKeyDown` handler of each item.
   * Pass the item's `index` so the hook knows where focus currently is.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<T>, index: number) => {
      const items = itemsRef.current.filter(Boolean) as T[];
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          nextIndex = (index + 1) % items.length;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          nextIndex = (index - 1 + items.length) % items.length;
          break;
        case "Home":
          event.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      setActiveIndex(nextIndex);
      items[nextIndex]?.focus();
    },
    [],
  );

  /**
   * Returns the correct `tabIndex` for an item based on the currently tracked
   * active index. The item that last received focus keeps `tabIndex={0}` so
   * that Tab returns to it when the user leaves and re-enters the widget.
   */
  const getTabIndex = useCallback(
    (index: number) => (index === activeIndex ? 0 : -1),
    [activeIndex],
  );

  return { registerItem, handleKeyDown, getTabIndex };
}
