import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OfflineContextType {
  isOnline: boolean;
  hasBeenOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasBeenOffline) {
        toast({
          title: "Back Online",
          description: "Your connection has been restored. Syncing data...",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
      toast({
        title: "You're Offline",
        description: "You can still browse and add items to cart. Changes will sync when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasBeenOffline, toast]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        hasBeenOffline,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
