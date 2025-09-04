import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Minus,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  CreditCard,
  MapPin,
  ArrowLeft,
  CheckSquare,
  Square,
  Loader2
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    weight: string;
    newPrice: string;
    swapPrice: string;
  };
  quantity: number;
  type: "new" | "swap";
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  province: string;
  zipCode: string;
  isDefault: boolean;
}

export default function CustomerCart() {
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

  const { items, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/users/addresses"],
    queryFn: async () => {
      const response = await fetch("/api/users/addresses", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch addresses");
      return response.json();
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Enrich cart items with product data
  const enrichedItems = items.map(item => {
    const product = products.find((p: any) => p.id === item.productId);
    return {
      ...item,
      product,
    };
  });

  // Clean up selected items that no longer exist in cart
  useEffect(() => {
    const currentItemIds = new Set(enrichedItems.map(item => item.id));
    setSelectedItems(prev => {
      const cleanedSet = new Set<string>();
      prev.forEach(itemId => {
        if (currentItemIds.has(itemId)) {
          cleanedSet.add(itemId);
        }
      });
      return cleanedSet;
    });
  }, [enrichedItems]);

  const cartTotal = enrichedItems.reduce((total, item) => {
    if (!item.product) return total;
    const price = item.type === "new" ? parseFloat(item.product.newPrice) : parseFloat(item.product.swapPrice);
    return total + (price * item.quantity);
  }, 0);

  const selectedItemsTotal = enrichedItems
    .filter(item => selectedItems.has(item.id))
    .reduce((total, item) => {
      if (!item.product) return total;
      const price = item.type === "new" ? parseFloat(item.product.newPrice) : parseFloat(item.product.swapPrice);
      return total + (price * item.quantity);
    }, 0);

  const handleSelectItem = (itemId: string) => {
    // Prevent selection changes when item is being processed
    if (processingItems.has(itemId)) {
      return;
    }

    // Ensure we're working with a valid item ID
    const itemExists = enrichedItems.some(item => item.id === itemId);
    if (!itemExists) {
      console.warn(`Attempted to select non-existent item: ${itemId}`);
      return;
    }

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };


  const handleSelectAll = () => {
    // Don't allow select all if any items are being processed
    if (processingItems.size > 0) {
      return;
    }

    if (selectedItems.size === enrichedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(enrichedItems.map(item => item.id)));
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    // Prevent multiple simultaneous operations on the same item
    if (processingItems.has(itemId)) {
      return;
    }

    setProcessingItems(prev => new Set(prev).add(itemId));

    try {
      if (newQuantity <= 0) {
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        await removeItem(itemId);
      } else {
        await updateItem(itemId, newQuantity);
      }
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handlePlaceOrder = async () => {
    const itemsToOrder = enrichedItems.filter(item => selectedItems.has(item.id));

    if (itemsToOrder.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Place orders for selected items one by one
      for (const item of itemsToOrder) {
        if (!item.product) continue;

        const unitPrice = item.type === "new" ? item.product.newPrice : item.product.swapPrice;
        const totalAmount = parseFloat(unitPrice) * item.quantity;

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            productId: item.productId,
            addressId: selectedAddressId,
            quantity: item.quantity,
            type: item.type,
            unitPrice,
            totalAmount: totalAmount.toString(),
            paymentMethod,
            notes: notes || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to place order");
        }
      }

      // Remove ordered items from cart
      for (const item of itemsToOrder) {
        await removeItem(item.id);
      }

      setSelectedItems(new Set());

      toast({
        title: "Order Placed!",
        description: `Your order for ${itemsToOrder.length} item(s) has been placed successfully.`,
      });

      // Redirect to orders page
      window.location.href = "/customer/orders";
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Set default address if available and none selected
  useState(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/customer/products" data-testid="link-back-to-products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground" data-testid="text-cart-item-count">
            {enrichedItems.length} {enrichedItems.length === 1 ? "item" : "items"}
            {selectedItems.size > 0 && (
              <span className="ml-2 text-primary">
                • {selectedItems.size} selected
              </span>
            )}
          </p>
        </div>
      </div>

      {enrichedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some LPG tanks to get started!
            </p>
            <Link href="/customer/products" data-testid="link-browse-products">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cart Items</CardTitle>
                  {enrichedItems.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAll();
                      }}
                      disabled={processingItems.size > 0}
                      className="text-sm"
                    >
                      {selectedItems.size === enrichedItems.length ? (
                        <CheckSquare className="h-4 w-4 mr-2" />
                      ) : (
                        <Square className="h-4 w-4 mr-2" />
                      )}
                      {selectedItems.size === enrichedItems.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrichedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 border rounded-lg transition-opacity cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selectedItems.has(item.id) ? "border-primary bg-primary/5" : ""
                    } ${processingItems.has(item.id) ? "opacity-60" : ""}`}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        handleSelectItem(item.id);
                      }}
                      disabled={processingItems.has(item.id)}
                      className="p-0 h-6 w-6"
                    >
                      {selectedItems.has(item.id) ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium" data-testid={`text-cart-item-name-${item.id}`}>
                          {item.product?.name || "Unknown Product"}
                        </h3>
                        {processingItems.has(item.id) && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.type === "new" ? "New Tank" : "Tank Swap"} • {item.product?.weight}
                      </p>
                      <p className="font-medium text-primary" data-testid={`text-cart-item-price-${item.id}`}>
                        ₱{item.type === "new" ? item.product?.newPrice : item.product?.swapPrice}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateQuantity(item.id, item.quantity - 1);
                        }}
                        disabled={processingItems.has(item.id)}
                        data-testid={`button-decrease-quantity-${item.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateQuantity(item.id, item.quantity + 1);
                        }}
                        disabled={processingItems.has(item.id)}
                        data-testid={`button-increase-quantity-${item.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async (e) => {
                          e.stopPropagation();
                          // Prevent multiple simultaneous operations on the same item
                          if (processingItems.has(item.id)) {
                            return;
                          }

                          setProcessingItems(prev => new Set(prev).add(item.id));

                          try {
                            setSelectedItems(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(item.id);
                              return newSet;
                            });
                            await removeItem(item.id);
                          } finally {
                            setProcessingItems(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(item.id);
                              return newSet;
                            });
                          }
                        }}
                        disabled={processingItems.has(item.id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-item-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearCart();
                        setSelectedItems(new Set());
                      }}
                      data-testid="button-clear-cart"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                    {selectedItems.size > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedItems.size} item(s) selected
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-bold" data-testid="text-cart-total">
                    Total: ₱{cartTotal.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout */}
          <div className="space-y-4">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 ? (
                  <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    <SelectTrigger data-testid="select-delivery-address">
                      <SelectValue placeholder="Select address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((address: Address) => (
                        <SelectItem key={address.id} value={address.id}>
                          <div>
                            <div className="font-medium">{address.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {address.street}, {address.city}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No addresses found</p>
                    <Link href="/customer/profile" data-testid="link-add-address">
                      <Button size="sm">Add Address</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Special instructions (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="input-order-notes"
                />
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Selected Items:</span>
                  <span data-testid="text-selected-count">{selectedItems.size} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">₱{selectedItemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span data-testid="text-delivery-fee">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span data-testid="text-order-total">₱{selectedItemsTotal.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddressId || selectedItems.size === 0}
                  data-testid="button-place-order"
                >
                  {isPlacingOrder ? "Placing Order..." : `Place Order (${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''})`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
