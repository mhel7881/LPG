import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Calendar, 
  Package, 
  MapPin,
  Edit,
  Trash2,
  Clock,
  RefreshCw
} from "lucide-react";

interface DeliverySchedule {
  id: string;
  productId: string;
  addressId: string;
  name: string;
  quantity: number;
  type: "new" | "swap";
  frequency: "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  nextDelivery: string;
  isActive: boolean;
  product?: {
    id: string;
    name: string;
    weight: string;
    newPrice: string;
    swapPrice: string;
  };
  address?: {
    id: string;
    street: string;
    city: string;
    province: string;
  };
}

interface Product {
  id: string;
  name: string;
  weight: string;
  newPrice: string;
  swapPrice: string;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  province: string;
}

export default function CustomerSchedules() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DeliverySchedule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    productId: "",
    addressId: "",
    quantity: 1,
    type: "new" as "new" | "swap",
    frequency: "weekly" as "weekly" | "biweekly" | "monthly",
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
  });

  // Fetch delivery schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["/api/schedules"],
    queryFn: async () => {
      const response = await fetch("/api/schedules", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch schedules");
      return response.json();
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Fetch addresses
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

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const nextDelivery = calculateNextDelivery(
        scheduleData.frequency,
        scheduleData.dayOfWeek,
        scheduleData.dayOfMonth
      );

      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...scheduleData,
          nextDelivery,
        }),
      });
      if (!response.ok) throw new Error("Failed to create schedule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Schedule Created",
        description: "Your delivery schedule has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update schedule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setEditingSchedule(null);
      toast({
        title: "Schedule Updated",
        description: "Your delivery schedule has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete schedule");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule Deleted",
        description: "Your delivery schedule has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete schedule",
        variant: "destructive",
      });
    },
  });

  const calculateNextDelivery = (
    frequency: "weekly" | "biweekly" | "monthly",
    dayOfWeek?: number,
    dayOfMonth?: number
  ): string => {
    const now = new Date();
    let nextDelivery = new Date();

    if (frequency === "monthly" && dayOfMonth) {
      nextDelivery.setDate(dayOfMonth);
      if (nextDelivery <= now) {
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
      }
    } else if ((frequency === "weekly" || frequency === "biweekly") && dayOfWeek !== undefined) {
      const days = (dayOfWeek - now.getDay() + 7) % 7;
      nextDelivery.setDate(now.getDate() + days);
      if (nextDelivery <= now) {
        nextDelivery.setDate(nextDelivery.getDate() + (frequency === "weekly" ? 7 : 14));
      }
    }

    return nextDelivery.toISOString();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      productId: "",
      addressId: "",
      quantity: 1,
      type: "new",
      frequency: "weekly",
      dayOfWeek: 1,
      dayOfMonth: 1,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.productId || !formData.addressId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingSchedule) {
      updateScheduleMutation.mutate({
        id: editingSchedule.id,
        data: formData,
      });
    } else {
      createScheduleMutation.mutate(formData);
    }
  };

  const handleEdit = (schedule: DeliverySchedule) => {
    setFormData({
      name: schedule.name,
      productId: schedule.productId || "",
      addressId: schedule.addressId || "",
      quantity: schedule.quantity,
      type: schedule.type,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek || 1,
      dayOfMonth: schedule.dayOfMonth || 1,
    });
    setEditingSchedule(schedule);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this delivery schedule?")) {
      deleteScheduleMutation.mutate(id);
    }
  };

  const getFrequencyText = (schedule: DeliverySchedule) => {
    if (schedule.frequency === "monthly") {
      return `Monthly on the ${schedule.dayOfMonth}${getOrdinalSuffix(schedule.dayOfMonth!)}`;
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const frequency = schedule.frequency === "weekly" ? "Weekly" : "Bi-weekly";
      return `${frequency} on ${days[schedule.dayOfWeek!]}`;
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const toggleScheduleStatus = (id: string, isActive: boolean) => {
    updateScheduleMutation.mutate({
      id,
      data: { isActive: !isActive },
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Schedules</h1>
          <p className="text-muted-foreground">Manage your recurring LPG deliveries</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setEditingSchedule(null);
            }} data-testid="button-create-schedule">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Edit Schedule" : "Create Delivery Schedule"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Home Delivery"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-schedule-name"
                />
              </div>

              <div>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger data-testid="select-product">
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
              </div>

              <div>
                <Select
                  value={formData.addressId}
                  onValueChange={(value) => setFormData({ ...formData, addressId: value })}
                >
                  <SelectTrigger data-testid="select-address">
                    <SelectValue placeholder="Select an address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((address: Address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.label} - {address.street}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    data-testid="input-quantity"
                  />
                </div>
                <div>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "new" | "swap") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger data-testid="select-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Tank</SelectItem>
                      <SelectItem value="swap">Tank Swap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: "weekly" | "biweekly" | "monthly") =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.frequency === "monthly" ? (
                <div>
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                    data-testid="input-day-of-month"
                  />
                </div>
              ) : (
                <div>
                  <Select
                    value={formData.dayOfWeek.toString()}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
                  >
                    <SelectTrigger data-testid="select-day-of-week">
                      <SelectValue placeholder="Select day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
                  data-testid="button-save-schedule"
                >
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Delivery Schedules</h3>
            <p className="text-muted-foreground mb-4">
              Set up recurring deliveries to never run out of LPG again.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule: DeliverySchedule) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg" data-testid={`text-schedule-name-${schedule.id}`}>
                          {schedule.name}
                        </h3>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {schedule.product?.name} - {schedule.quantity}x ({schedule.type})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {schedule.address?.street}, {schedule.address?.city}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          <span>{getFrequencyText(schedule)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Next: {new Date(schedule.nextDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleScheduleStatus(schedule.id, schedule.isActive)}
                        data-testid={`button-toggle-schedule-${schedule.id}`}
                      >
                        {schedule.isActive ? "⏸️" : "▶️"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(schedule)}
                        data-testid={`button-edit-schedule-${schedule.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(schedule.id)}
                        data-testid={`button-delete-schedule-${schedule.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}