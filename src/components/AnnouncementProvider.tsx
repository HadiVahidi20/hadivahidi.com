"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LiveRegion } from "./LiveRegion";

interface AnnouncementContextValue {
  /**
   * Announce a message to screen readers.
   *
   * @param message    - The text to announce.
   * @param politeness - `"polite"` (default) waits for idle; `"assertive"`
   *                     interrupts the current speech. Use `"assertive"` only
   *                     for urgent alerts.
   */
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const AnnouncementContext = createContext<AnnouncementContextValue>({
  announce: () => {},
});

interface AnnouncementProviderProps {
  children: ReactNode;
}

/**
 * AnnouncementProvider – wraps the application and provides a live region for
 * screen-reader announcements. Pair with the `useAnnounce` hook to trigger
 * messages from anywhere in the tree.
 *
 * Place this once near the root of the document (e.g. in RootLayout).
 *
 * @example
 * // In layout.tsx:
 * <AnnouncementProvider>{children}</AnnouncementProvider>
 *
 * // In any component:
 * const announce = useAnnounce();
 * announce("Form submitted successfully");
 */
export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const [message, setMessage] = useState("");
  const [politeness, setPoliteness] = useState<"polite" | "assertive">(
    "polite",
  );
  // Track a pending rAF so we can cancel it on unmount.
  const rafRef = useRef<number | null>(null);

  const announce = useCallback(
    (msg: string, pol: "polite" | "assertive" = "polite") => {
      // Cancel any queued update from a rapid previous call.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      // Clear first so the live region re-announces even if the message text
      // is identical to the previous announcement.
      setMessage("");
      setPoliteness(pol);
      rafRef.current = requestAnimationFrame(() => {
        setMessage(msg);
        rafRef.current = null;
      });
    },
    [],
  );

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      <LiveRegion message={message} politeness={politeness} />
      {children}
    </AnnouncementContext.Provider>
  );
}

/**
 * useAnnounce – returns the `announce` function from the nearest
 * `AnnouncementProvider`.
 *
 * @example
 * const announce = useAnnounce();
 * announce("3 results found");
 * announce("Error: please fill all required fields", "assertive");
 */
export function useAnnounce() {
  return useContext(AnnouncementContext).announce;
}
