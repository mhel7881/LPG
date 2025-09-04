import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  CreditCard,
  Calculator,
  Receipt,
  User,
  DollarSign,
  Scan
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  weight: string;
  newPrice: string;
  swapPrice: string;
  stock: number;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  type: "new" | "swap";
  subtotal: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function AdminPOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "gcash">("cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Fetch customers for lookup
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/users?role=customer", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  // Process sale mutation
  const processSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch("/api/pos/sale", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(saleData),
      });
      if (!response.ok) throw new Error("Failed to process sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      clearCart();
      toast({
        title: "Sale Processed",
        description: "Transaction completed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process sale",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product, type: "new" | "swap") => {
    const price = type === "new" ? parseFloat(product.newPrice) : parseFloat(product.swapPrice);
    const existingItem = cart.find(item => 
      item.productId === product.id && item.type === type
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available.`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.productId === product.id && item.type === type
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity: 1,
        type,
        subtotal: price,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, type: "new" | "swap", newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, type);
      return;
    }

    const product = products.find((p: Product) => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available.`,
        variant: "destructive",
      });
      return;
    }

    const price = type === "new" ? parseFloat(product.newPrice) : parseFloat(product.swapPrice);
    
    setCart(cart.map(item =>
      item.productId === productId && item.type === type
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * price }
        : item
    ));
  };

  const removeFromCart = (productId: string, type: "new" | "swap") => {
    setCart(cart.filter(item => 
      !(item.productId === productId && item.type === type)
    ));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setAmountPaid("");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - total);
  };

  const canProcessSale = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;
    return cart.length > 0 && (paymentMethod !== "cash" || paid >= total);
  };

  const handleProcessSale = async () => {
    if (!canProcessSale()) return;

    setIsProcessingPayment(true);
    
    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          type: item.type,
          price: item.subtotal / item.quantity,
        })),
        totalAmount: calculateTotal(),
        paymentMethod,
        amountPaid: paymentMethod === "cash" ? parseFloat(amountPaid) : calculateTotal(),
        change: paymentMethod === "cash" ? calculateChange() : 0,
      };

      await processSaleMutation.mutateAsync(saleData);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Process in-store sales and manage inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded mb-3"></div>
                      <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map((product: Product) => (
                    <Card key={product.id} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{product.weight}</p>
                          </div>
                          <Badge variant={product.stock > 5 ? "default" : "destructive"}>
                            {product.stock} in stock
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>New Tank:</span>
                            <span className="font-medium">₱{product.newPrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Tank Swap:</span>
                            <span className="font-medium">₱{product.swapPrice}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => addToCart(product, "new")}
                            disabled={product.stock === 0}
                            data-testid={`button-add-new-${product.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            New
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => addToCart(product, "swap")}
                            disabled={product.stock === 0}
                            data-testid={`button-add-swap-${product.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Swap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({cart.length})
                </div>
                <span className="text-lg font-bold" data-testid="text-cart-total">
                  ₱{calculateTotal().toFixed(2)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Cart is empty</p>
                  <p className="text-sm text-muted-foreground">Add products to start a sale</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div key={`${item.productId}-${item.type}`} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" data-testid={`text-cart-item-${index}`}>
                          {item.product.name} ({item.type === "new" ? "New" : "Swap"})
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          ₱{(item.subtotal / item.quantity).toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.type, item.quantity - 1)}
                          data-testid={`button-decrease-${index}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm" data-testid={`text-quantity-${index}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.type, item.quantity + 1)}
                          data-testid={`button-increase-${index}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-sm" data-testid={`text-subtotal-${index}`}>
                          ₱{item.subtotal.toFixed(2)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId, item.type)}
                          data-testid={`button-remove-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium" data-testid="text-selected-customer">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="button-select-customer">
                      <User className="h-4 w-4 mr-2" />
                      Select Customer (Optional)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {customers.map((customer: Customer) => (
                        <div
                          key={customer.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsCustomerDialogOpen(false);
                          }}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "cash" && (
                <div>
                  <Label htmlFor="amount-paid">Amount Paid</Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    data-testid="input-amount-paid"
                  />
                  {amountPaid && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Change: ₱{calculateChange().toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold" data-testid="text-final-total">
                    ₱{calculateTotal().toFixed(2)}
                  </span>
                </div>
                
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canProcessSale() || isProcessingPayment}
                  onClick={handleProcessSale}
                  data-testid="button-process-sale"
                >
                  {isProcessingPayment ? (
                    "Processing..."
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Process Sale
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}