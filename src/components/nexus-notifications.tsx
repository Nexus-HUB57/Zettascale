"use client";

import { useNexusSocket } from "@/hooks/use-nexus-socket";

/**
 * Global component that initializes the Nexus Socket hook to monitor
 * for background events and trigger toasts/notifications regardless of the current page.
 */
export function NexusNotifications() {
  // We call the hook here to ensure it's active globally
  useNexusSocket();
  
  // This component doesn't need to render anything itself as it uses the toast hook
  return null;
}
