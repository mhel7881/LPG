import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveToIndexedDB, getFromIndexedDB } from "@/lib/indexeddb";

interface CartItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    weight: string;
    newPrice: string;
    swapPrice: string;
    image?: string;
  };
  quantity: number;
  type: "new" | "swap";
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, type: "new" | "swap", quantity?: number) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  syncWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();

  // Load cart from IndexedDB on mount
  useEffect(() => {
    if (user) {
      loadCartFromIndexedDB();
    }
  }, [user]);

  // Sync with server when online
  useEffect(() => {
    if (user && token && navigator.onLine) {
      syncWithServer();
    }
  }, [user, token]);

  const loadCartFromIndexedDB = async () => {
    if (!user) return;
    
    try {
      const cartData = await getFromIndexedDB("cart", user.id);
      if (cartData) {
        setItems(cartData.items || []);
      }
    } catch (error) {
      console.error("Failed to load cart from IndexedDB:", error);
    }
  };

  const saveCartToIndexedDB = async (cartItems: CartItem[]) => {
    if (!user) return;
    
    try {
      await saveToIndexedDB("cart", user.id, { items: cartItems, updatedAt: new Date() });
    } catch (error) {
      console.error("Failed to save cart to IndexedDB:", error);
    }
  };

  const syncWithServer = async () => {
    if (!user || !token) return;
    
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const serverItems = await response.json();
        setItems(serverItems);
        await saveCartToIndexedDB(serverItems);
      }
    } catch (error) {
      console.error("Failed to sync cart with server:", error);
    }
  };

  const addItem = async (productId: string, type: "new" | "swap", quantity = 1) => {
    if (!user) return;

    setIsLoading(true);
    
    // Create temp item outside try block so it's accessible in catch
    const tempItem: CartItem = {
      id: `temp-${Date.now()}`,
      productId,
      quantity,
      type,
    };
    
    try {
      // Optimistic update
      const newItems = [...items, tempItem];
      setItems(newItems);
      await saveCartToIndexedDB(newItems);

      if (navigator.onLine && token) {
        const response = await apiRequest("POST", "/api/cart", {
          productId,
          quantity,
          type,
        });
        const actualItem = await response.json();
        
        // Replace temp item with actual item
        setItems(prev => prev.map(item => 
          item.id === tempItem.id ? actualItem : item
        ));
      }

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
    } catch (error: any) {
      // Revert optimistic update
      setItems(prev => prev.filter(item => item.id !== tempItem.id));
      
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, quantity: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Optimistic update
      const newItems = items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      setItems(newItems);
      await saveCartToIndexedDB(newItems);

      if (navigator.onLine && token) {
        await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      }
    } catch (error: any) {
      // Revert optimistic update
      await loadCartFromIndexedDB();
      
      toast({
        title: "Error",
        description: error.message || "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Optimistic update
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      await saveCartToIndexedDB(newItems);

      if (navigator.onLine && token) {
        await apiRequest("DELETE", `/api/cart/${id}`, {});
      }

      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error: any) {
      // Revert optimistic update
      await loadCartFromIndexedDB();
      
      toast({
        title: "Error",
        description: error.message || "Failed to remove cart item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      setItems([]);
      await saveCartToIndexedDB([]);

      if (navigator.onLine && token) {
        await apiRequest("DELETE", "/api/cart", {});
      }

      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        isLoading,
        syncWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
