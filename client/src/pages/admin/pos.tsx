import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";

export default function AdminPOS() {
  const [cart, setCart] = useState<any[]>([]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Manage sales transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Product catalog will be displayed here</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">No items in cart</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₱0.00</span>
                </div>
                <Button className="w-full mt-4" disabled={cart.length === 0}>
                  Complete Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}