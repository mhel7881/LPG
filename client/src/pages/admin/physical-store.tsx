import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  ShoppingCart,
  RefreshCw
} from "lucide-react";

const physicalSaleSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["new", "swap"], {
    required_error: "Sale type is required",
  }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

type PhysicalSaleFormData = z.infer<typeof physicalSaleSchema>;

interface Product {
  id: string;
  name: string;
  description?: string;
  weight: string;
  newPrice: string;
  swapPrice: string;
  stock: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PhysicalSale {
  id: string;
  productId: string;
  product: Product;
  type: "new" | "swap";
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminPhysicalStore() {
  const [isRecordingSale, setIsRecordingSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products for inventory display
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Fetch recent physical sales
  const { data: physicalSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["/api/physical-sales"],
    queryFn: async () => {
      const response = await fetch("/api/physical-sales", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch physical sales");
      return response.json();
    },
  });

  const physicalSaleForm = useForm<PhysicalSaleFormData>({
    resolver: zodResolver(physicalSaleSchema),
    defaultValues: {
      productId: "",
      type: "new",
      quantity: 1,
      customerName: "",
      customerPhone: "",
      notes: "",
    },
  });

  const createPhysicalSaleMutation = useMutation({
    mutationFn: async (data: PhysicalSaleFormData) => {
      const response = await fetch("/api/physical-sales", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to record physical sale");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/physical-sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsRecordingSale(false);
      physicalSaleForm.reset();
      toast({
        title: "Sale Recorded",
        description: "Physical store sale has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record sale",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter((product: Product) => product.stock <= 5);
  const outOfStockProducts = products.filter((product: Product) => product.stock === 0);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return {
      label: "Out of Stock",
      class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      priority: "critical"
    };
    if (stock <= 5) return {
      label: "Low Stock",
      class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      priority: "warning"
    };
    return {
      label: "In Stock",
      class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      priority: "normal"
    };
  };

  const onPhysicalSaleSubmit = (data: PhysicalSaleFormData) => {
    createPhysicalSaleMutation.mutate(data);
  };

  const handleRecordSale = (product: Product, type: "new" | "swap") => {
    physicalSaleForm.reset({
      productId: product.id,
      type,
      quantity: 1,
      customerName: "",
      customerPhone: "",
      notes: "",
    });
    setIsRecordingSale(true);
  };

  const totalTodaySales = physicalSales
    .filter((sale: PhysicalSale) => {
      const today = new Date().toDateString();
      return new Date(sale.createdAt).toDateString() === today;
    })
    .reduce((total: number, sale: PhysicalSale) => total + parseFloat(sale.totalAmount), 0);

  const todaySalesCount = physicalSales.filter((sale: PhysicalSale) => {
    const today = new Date().toDateString();
    return new Date(sale.createdAt).toDateString() === today;
  }).length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Physical Store
          </h1>
          <p className="text-muted-foreground">
            Record in-person sales and manage physical store inventory
          </p>
        </div>
        <Dialog open={isRecordingSale} onOpenChange={setIsRecordingSale}>
          <DialogTrigger asChild>
            <Button data-testid="button-record-sale">
              <Plus className="h-4 w-4 mr-2" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Physical Sale</DialogTitle>
            </DialogHeader>

            <form onSubmit={physicalSaleForm.handleSubmit(onPhysicalSaleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="productId">Product</Label>
                <Select
                  value={physicalSaleForm.watch("productId")}
                  onValueChange={(value) => physicalSaleForm.setValue("productId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: Product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.weight}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {physicalSaleForm.formState.errors.productId && (
                  <p className="text-sm text-destructive">
                    {physicalSaleForm.formState.errors.productId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Sale Type</Label>
                <Select
                  value={physicalSaleForm.watch("type")}
                  onValueChange={(value: "new" | "swap") => physicalSaleForm.setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Purchase</SelectItem>
                    <SelectItem value="swap">Swap</SelectItem>
                  </SelectContent>
                </Select>
                {physicalSaleForm.formState.errors.type && (
                  <p className="text-sm text-destructive">
                    {physicalSaleForm.formState.errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  {...physicalSaleForm.register("quantity", { valueAsNumber: true })}
                  data-testid="input-sale-quantity"
                />
                {physicalSaleForm.formState.errors.quantity && (
                  <p className="text-sm text-destructive">
                    {physicalSaleForm.formState.errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  {...physicalSaleForm.register("customerName")}
                  data-testid="input-customer-name"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                <Input
                  id="customerPhone"
                  {...physicalSaleForm.register("customerPhone")}
                  data-testid="input-customer-phone"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  {...physicalSaleForm.register("notes")}
                  data-testid="input-sale-notes"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={createPhysicalSaleMutation.isPending}
                  data-testid="button-submit-sale"
                >
                  {createPhysicalSaleMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Record Sale
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRecordingSale(false)}
                  disabled={createPhysicalSaleMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Today's Sales</p>
                <p className="text-2xl font-bold">₱{totalTodaySales.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Transactions Today</p>
                <p className="text-2xl font-bold">{todaySalesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg. Transaction</p>
                <p className="text-2xl font-bold">
                  ₱{todaySalesCount > 0 ? (totalTodaySales / todaySalesCount).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-2">
          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-medium text-red-800 dark:text-red-400">
                    {outOfStockProducts.length} product{outOfStockProducts.length > 1 ? 's' : ''} out of stock
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockProducts.length > outOfStockProducts.length && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="font-medium text-yellow-800 dark:text-yellow-400">
                    {lowStockProducts.length - outOfStockProducts.length} product{lowStockProducts.length - outOfStockProducts.length > 1 ? 's' : ''} low on stock
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              {searchTerm ? "No matching products" : "No products found"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Add products to inventory first"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredProducts.map((product: Product, index: number) => {
            const stockStatus = getStockStatus(product.stock);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    {/* Product Image */}
                    {product.image && (
                      <div className="mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Create fallback placeholder
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.image-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'image-placeholder w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center';
                              placeholder.innerHTML = `
                                <div class="text-center">
                                  <svg class="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p class="text-xs text-gray-500">Image unavailable</p>
                                </div>
                              `;
                              parent.appendChild(placeholder);
                            }
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                            // Remove any existing placeholder
                            const parent = target.parentElement;
                            const placeholder = parent?.querySelector('.image-placeholder');
                            if (placeholder) {
                              placeholder.remove();
                            }
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <Badge className={stockStatus.class} data-testid={`badge-stock-status-${product.id}`}>
                        {stockStatus.label}
                      </Badge>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-product-description-${product.id}`}>
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium" data-testid={`text-product-weight-${product.id}`}>
                          {product.weight}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">New Price:</span>
                        <span className="font-medium" data-testid={`text-product-new-price-${product.id}`}>
                          ₱{product.newPrice}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Swap Price:</span>
                        <span className="font-medium text-primary" data-testid={`text-product-swap-price-${product.id}`}>
                          ₱{product.swapPrice}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={`font-medium ${product.stock === 0 ? 'text-destructive' : product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`} data-testid={`text-product-stock-${product.id}`}>
                          {product.stock} units
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleRecordSale(product, "new")}
                        disabled={product.stock === 0}
                        data-testid={`button-record-new-sale-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        New
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => handleRecordSale(product, "swap")}
                        disabled={product.stock === 0}
                        data-testid={`button-record-swap-sale-${product.id}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Swap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Physical Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : physicalSales.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No physical sales recorded yet</p>
          ) : (
            <div className="space-y-3">
              {physicalSales.slice(0, 10).map((sale: PhysicalSale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{sale.product.name}</p>
                      <Badge variant={sale.type === "new" ? "default" : "secondary"}>
                        {sale.type === "new" ? "New" : "Swap"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sale.quantity} × ₱{sale.unitPrice} = ₱{sale.totalAmount}
                    </p>
                    {sale.customerName && (
                      <p className="text-xs text-muted-foreground">
                        Customer: {sale.customerName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱{sale.totalAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}