import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Upload,
  X,
  Image as ImageIcon,
  Trash2
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  weight: z.string().min(1, "Weight is required"),
  newPrice: z.string().min(1, "New price is required"),
  swapPrice: z.string().min(1, "Swap price is required"),
  stock: z.number().min(0, "Stock must be 0 or greater"),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

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

export default function AdminInventory() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      weight: "",
      newPrice: "",
      swapPrice: "",
      stock: 0,
      isActive: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddingProduct(false);
      productForm.reset();
      toast({
        title: "Product Added",
        description: "New product has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      setIsAddingProduct(false);
      productForm.reset();
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
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

  const onProductSubmit = async (data: ProductFormData) => {
    setIsUploading(true);
    try {
      let imageUrl = editingProduct?.image || null;

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImageToSupabase(selectedImage);
      }

      const productData = {
        ...data,
        image: imageUrl,
      };

      if (editingProduct) {
        updateProductMutation.mutate({ id: editingProduct.id, data: productData });
      } else {
        createProductMutation.mutate(productData);
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(true);
    setSelectedImage(null);
    setImagePreview(product.image || null);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      weight: product.weight,
      newPrice: product.newPrice,
      swapPrice: product.swapPrice,
      stock: product.stock,
      isActive: product.isActive,
    });
  };

  const handleCancelForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
    productForm.reset();
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Get auth headers but exclude Content-Type for FormData
    const authHeaders = getAuthHeaders();
    const { "Content-Type": _, ...headersWithoutContentType } = authHeaders as any;

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const data = await response.json();
    console.log('Upload successful, image URL:', data.imageUrl);
    return data.imageUrl;
  };

  const totalValue = products.reduce((total: number, product: Product) => {
    return total + (parseFloat(product.newPrice) * product.stock);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground" data-testid="text-inventory-summary">
            {products.length} products • ₱{totalValue.toLocaleString()} total value
          </p>
        </div>
        <Button onClick={() => setIsAddingProduct(true)} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
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

      {/* Product Form Dialog */}
      <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...productForm.register("name")}
                data-testid="input-product-name"
              />
              {productForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {productForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Textarea
                id="description"
                placeholder="Product description (optional)"
                {...productForm.register("description")}
                data-testid="input-product-description"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Product Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Create fallback for preview
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.preview-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'preview-placeholder w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg border flex items-center justify-center';
                          placeholder.innerHTML = `
                            <div class="text-center">
                              <svg class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-sm text-gray-500">Preview unavailable</p>
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
                        const placeholder = parent?.querySelector('.preview-placeholder');
                        if (placeholder) {
                          placeholder.remove();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload product image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                placeholder="e.g., 11kg"
                {...productForm.register("weight")}
                data-testid="input-product-weight"
              />
              {productForm.formState.errors.weight && (
                <p className="text-sm text-destructive">
                  {productForm.formState.errors.weight.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPrice">New Price (₱)</Label>
                <Input
                  id="newPrice"
                  type="number"
                  step="0.01"
                  {...productForm.register("newPrice")}
                  data-testid="input-product-new-price"
                />
                {productForm.formState.errors.newPrice && (
                  <p className="text-sm text-destructive">
                    {productForm.formState.errors.newPrice.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="swapPrice">Swap Price (₱)</Label>
                <Input
                  id="swapPrice"
                  type="number"
                  step="0.01"
                  {...productForm.register("swapPrice")}
                  data-testid="input-product-swap-price"
                />
                {productForm.formState.errors.swapPrice && (
                  <p className="text-sm text-destructive">
                    {productForm.formState.errors.swapPrice.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...productForm.register("stock", { valueAsNumber: true })}
                data-testid="input-product-stock"
              />
              {productForm.formState.errors.stock && (
                <p className="text-sm text-destructive">
                  {productForm.formState.errors.stock.message}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploading}
                data-testid="button-save-product"
              >
                {isUploading && <Upload className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading
                  ? "Uploading..."
                  : editingProduct
                    ? "Update Product"
                    : "Add Product"
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelForm}
                disabled={isUploading}
                data-testid="button-cancel-product"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Grid */}
      {isLoading ? (
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
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by adding your first product"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddingProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
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
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">
                          ₱{(parseFloat(product.newPrice) * product.stock).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleEditProduct(product)}
                        data-testid={`button-edit-product-${product.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteProduct(product)}
                        disabled={deleteProductMutation.isPending}
                        data-testid={`button-delete-product-${product.id}`}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        data-testid={`button-product-analytics-${product.id}`}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
