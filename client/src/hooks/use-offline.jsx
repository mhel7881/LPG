import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
var OfflineContext = createContext(undefined);
export function OfflineProvider(_a) {
    var children = _a.children;
    var _b = useState(navigator.onLine), isOnline = _b[0], setIsOnline = _b[1];
    var _c = useState(false), hasBeenOffline = _c[0], setHasBeenOffline = _c[1];
    var toast = useToast().toast;
    useEffect(function () {
        var handleOnline = function () {
            setIsOnline(true);
            if (hasBeenOffline) {
                toast({
                    title: "Back Online",
                    description: "Your connection has been restored. Syncing data...",
                });
            }
        };
        var handleOffline = function () {
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
        return function () {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [hasBeenOffline, toast]);
    return (<OfflineContext.Provider value={{
            isOnline: isOnline,
            hasBeenOffline: hasBeenOffline,
        }}>
      {children}
    </OfflineContext.Provider>);
}
export function useOffline() {
    var context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error("useOffline must be used within an OfflineProvider");
    }
    return context;
}
