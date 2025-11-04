import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  ShoppingCart,
  Info
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  weight: string;
  newPrice: string;
  swapPrice: string;
  stock: number;
  image?: string;
  isActive: boolean;
}

export default function CustomerProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const { addItem, isLoading: cartLoading } = useCart();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const filteredProducts = products
    .filter((product: Product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.swapPrice) - parseFloat(b.swapPrice);
        case "price-high":
          return parseFloat(b.swapPrice) - parseFloat(a.swapPrice);
        case "weight":
          return parseFloat(a.weight) - parseFloat(b.weight);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = async (productId: string, type: "new" | "swap") => {
    try {
      await addItem(productId, type, 1);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", class: "bg-red-100 text-red-800" };
    if (stock <= 5) return { label: "Low Stock", class: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", class: "bg-green-100 text-green-800" };
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">LPG Products</h1>
          <p className="text-muted-foreground">Choose from our premium LPG tanks</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-products"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-sort-products">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full h-48 bg-muted animate-pulse"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show fallback image
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.fallback-image')) {
                            const fallback = document.createElement('img');
                            fallback.src = '/solane-tank.png';
                            fallback.alt = product.name;
                            fallback.className = 'fallback-image w-full h-full object-contain p-4';
                            parent.appendChild(fallback);
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'block';
                          // Remove any fallback image
                          const parent = target.parentElement;
                          const fallback = parent?.querySelector('.fallback-image');
                          if (fallback) {
                            fallback.remove();
                          }
                        }}
                      />
                    ) : (
                      <img
                        src="/solane-tank.png"
                        alt={product.name}
                        className="w-full h-full object-contain p-4"
                      />
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Product Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <Badge className={stockStatus.class} data-testid={`badge-stock-status-${product.id}`}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                    
                    {/* Product Description */}
                    <p className="text-muted-foreground text-sm mb-3" data-testid={`text-product-description-${product.id}`}>
                      {product.description}
                    </p>
                    
                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">New:</span>
                          <span className="font-semibold text-foreground" data-testid={`text-new-price-${product.id}`}>
                            ₱{product.newPrice}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Swap:</span>
                          <span className="font-semibold text-primary" data-testid={`text-swap-price-${product.id}`}>
                            ₱{product.swapPrice}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Weight</div>
                        <div className="font-medium text-foreground" data-testid={`text-product-weight-${product.id}`}>
                          {product.weight}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleAddToCart(product.id, "new")}
                          disabled={product.stock === 0 || cartLoading}
                          data-testid={`button-add-new-${product.id}`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add New (₱{product.newPrice})
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          data-testid={`button-product-info-${product.id}`}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleAddToCart(product.id, "swap")}
                        disabled={product.stock === 0 || cartLoading}
                        data-testid={`button-add-swap-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add Swap (₱{product.swapPrice})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No products are currently available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
