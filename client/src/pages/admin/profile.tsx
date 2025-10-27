import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Bell,
  Shield,
  LogOut,
  Loader2,
  Eye,
  EyeOff,
  Truck,
  Star
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const deliveryDriverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "License number is required"),
  vehicleType: z.enum(["motorcycle", "van", "truck"], {
    required_error: "Vehicle type is required",
  }),
  plateNumber: z.string().min(1, "Plate number is required"),
  rating: z.number().min(1).max(5).optional(),
  isActive: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type DeliveryDriverFormData = z.infer<typeof deliveryDriverSchema>;

export default function AdminProfile() {
  const [location] = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse query parameters to determine active tab
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const activeTab = urlParams.get('tab') || 'profile';

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  const { data: deliveryDrivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["/api/admin/delivery-drivers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/delivery-drivers", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch delivery drivers");
      return response.json();
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive",
      });
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const driverForm = useForm<DeliveryDriverFormData>({
    resolver: zodResolver(deliveryDriverSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      vehicleType: "motorcycle",
      plateNumber: "",
      rating: 4.8,
      isActive: true,
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditingProfile(false);
      profileForm.reset();
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    profileForm.reset({
      name: user?.name || "",
      phone: user?.phone || "",
    });
  };

  // Password change mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!response.ok) throw new Error("Failed to change password");
      return response.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      passwordForm.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  // Delivery Driver mutations
  const createDriverMutation = useMutation({
    mutationFn: async (data: DeliveryDriverFormData) => {
      const response = await fetch("/api/admin/delivery-drivers", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create delivery driver");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-drivers"] });
      setIsAddingDriver(false);
      driverForm.reset();
      toast({
        title: "Driver Added",
        description: "The delivery driver has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add delivery driver",
        variant: "destructive",
      });
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryDriverFormData> }) => {
      const response = await fetch(`/api/admin/delivery-drivers/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update delivery driver");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-drivers"] });
      setEditingDriver(null);
      driverForm.reset();
      toast({
        title: "Driver Updated",
        description: "The delivery driver has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update delivery driver",
        variant: "destructive",
      });
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/delivery-drivers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete delivery driver");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/delivery-drivers"] });
      toast({
        title: "Driver Deleted",
        description: "The delivery driver has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete delivery driver",
        variant: "destructive",
      });
    },
  });

  const onDriverSubmit = (data: DeliveryDriverFormData) => {
    if (editingDriver) {
      updateDriverMutation.mutate({ id: editingDriver.id, data });
    } else {
      createDriverMutation.mutate(data);
    }
  };

  const handleEditDriver = (driver: any) => {
    setEditingDriver(driver);
    setIsAddingDriver(true);
    driverForm.reset({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || "",
      licenseNumber: driver.licenseNumber,
      vehicleType: driver.vehicleType,
      plateNumber: driver.plateNumber,
      rating: driver.rating || 4.8,
      isActive: driver.isActive,
    });
  };

  const handleCancelDriverForm = () => {
    setIsAddingDriver(false);
    setEditingDriver(null);
    driverForm.reset({
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      vehicleType: "motorcycle",
      plateNumber: "",
      rating: 4.8,
      isActive: true,
    });
  };

  // Update form when user data changes
  useEffect(() => {
    if (user && isEditingProfile) {
      profileForm.reset({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user, isEditingProfile, profileForm]);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">
              {user?.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-name">{user?.name}</h1>
            <p className="text-muted-foreground" data-testid="text-admin-email">{user?.email}</p>
            <p className="text-sm text-primary font-medium">Administrator</p>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue={activeTab} className="space-y-6">
          <TabsList className="flex w-full h-auto p-1 overflow-x-auto">
            <TabsTrigger value="profile" data-testid="tab-admin-profile" className="text-xs sm:text-sm whitespace-nowrap">Profile</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-admin-notifications" className="text-xs sm:text-sm whitespace-nowrap">Notifications</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-admin-security" className="text-xs sm:text-sm whitespace-nowrap">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditingProfile ? undefined : user?.name || ""}
                      {...(isEditingProfile ? profileForm.register("name") : { readOnly: true })}
                      data-testid="input-admin-profile-name"
                    />
                    {isEditingProfile && profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ""} readOnly data-testid="input-admin-profile-email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={isEditingProfile ? undefined : user?.phone || ""}
                      {...(isEditingProfile ? profileForm.register("phone") : { readOnly: true })}
                      data-testid="input-admin-profile-phone"
                    />
                    {isEditingProfile && profileForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Input id="role" value={user?.role || ""} readOnly className="capitalize" data-testid="input-admin-profile-role" />
                  </div>
                </div>
                <div className="pt-4">
                  {isEditingProfile ? (
                    <div className="flex space-x-3">
                      <Button
                        onClick={profileForm.handleSubmit(onProfileSubmit)}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-admin-profile-inline"
                      >
                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelProfileEdit}
                        data-testid="button-cancel-admin-profile-inline"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      data-testid="button-edit-admin-profile"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Drivers Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Delivery Drivers Management
                  </div>
                  <Button
                    onClick={() => setIsAddingDriver(true)}
                    data-testid="button-add-driver"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Driver
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add/Edit Driver Form */}
                {isAddingDriver && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {editingDriver ? "Edit Delivery Driver" : "Add New Delivery Driver"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={driverForm.handleSubmit(onDriverSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="driver-name">Full Name</Label>
                              <Input
                                id="driver-name"
                                placeholder="Enter driver's full name"
                                {...driverForm.register("name")}
                                data-testid="input-driver-name"
                              />
                              {driverForm.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.name.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="driver-phone">Phone Number</Label>
                              <Input
                                id="driver-phone"
                                type="tel"
                                placeholder="Enter phone number"
                                {...driverForm.register("phone")}
                                data-testid="input-driver-phone"
                              />
                              {driverForm.formState.errors.phone && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.phone.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="driver-email">Email (Optional)</Label>
                              <Input
                                id="driver-email"
                                type="email"
                                placeholder="Enter email address"
                                {...driverForm.register("email")}
                                data-testid="input-driver-email"
                              />
                              {driverForm.formState.errors.email && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.email.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="driver-license">License Number</Label>
                              <Input
                                id="driver-license"
                                placeholder="Enter license number"
                                {...driverForm.register("licenseNumber")}
                                data-testid="input-driver-license"
                              />
                              {driverForm.formState.errors.licenseNumber && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.licenseNumber.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="vehicle-type">Vehicle Type</Label>
                              <Select
                                value={driverForm.watch("vehicleType")}
                                onValueChange={(value) => driverForm.setValue("vehicleType", value as "motorcycle" | "van" | "truck")}
                              >
                                <SelectTrigger data-testid="select-vehicle-type">
                                  <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                  <SelectItem value="van">Van</SelectItem>
                                  <SelectItem value="truck">Truck</SelectItem>
                                </SelectContent>
                              </Select>
                              {driverForm.formState.errors.vehicleType && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.vehicleType.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="plate-number">Plate Number</Label>
                              <Input
                                id="plate-number"
                                placeholder="Enter plate number"
                                {...driverForm.register("plateNumber")}
                                data-testid="input-plate-number"
                              />
                              {driverForm.formState.errors.plateNumber && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.plateNumber.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="rating">Rating</Label>
                              <Input
                                id="rating"
                                type="number"
                                step="0.1"
                                min="1"
                                max="5"
                                placeholder="4.8"
                                {...driverForm.register("rating", { valueAsNumber: true })}
                                data-testid="input-driver-rating"
                              />
                              {driverForm.formState.errors.rating && (
                                <p className="text-sm text-destructive">
                                  {driverForm.formState.errors.rating.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="driver-active"
                              checked={driverForm.watch("isActive")}
                              onCheckedChange={(checked) => driverForm.setValue("isActive", checked)}
                              data-testid="switch-driver-active"
                            />
                            <Label htmlFor="driver-active">Driver is active</Label>
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              type="submit"
                              disabled={createDriverMutation.isPending || updateDriverMutation.isPending}
                              data-testid="button-save-driver"
                            >
                              {editingDriver ? "Update Driver" : "Add Driver"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelDriverForm}
                              data-testid="button-cancel-driver"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Drivers List */}
                <div className="space-y-4">
                  {driversLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                              <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : deliveryDrivers.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No delivery drivers</h3>
                        <p className="text-muted-foreground">
                          Add delivery drivers to manage your delivery team.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    deliveryDrivers.map((driver: any) => (
                      <Card key={driver.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium" data-testid={`text-driver-name-${driver.id}`}>
                                    {driver.name}
                                  </h3>
                                  {!driver.isActive && (
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-sm" data-testid={`text-driver-phone-${driver.id}`}>
                                  {driver.phone}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-muted-foreground">{driver.rating || 4.8}</span>
                                  <span className="text-sm text-muted-foreground">•</span>
                                  <span className="text-sm text-muted-foreground">License: {driver.licenseNumber}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Vehicle:</span>
                                    <p className="font-medium capitalize">{driver.vehicleType}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Plate:</span>
                                    <p className="font-medium">{driver.plateNumber}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditDriver(driver)}
                                data-testid={`button-edit-driver-${driver.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDriverMutation.mutate(driver.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-driver-${driver.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Edit Form - Now removed as editing is inline */}
          </TabsContent>


          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No notifications</h3>
                      <p className="text-muted-foreground">
                        You don't have any notifications at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-3 p-4 border rounded-lg ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  disabled={deleteNotificationMutation.isPending}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about system issues and updates
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-system-notifications" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new orders
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-order-notifications" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inventory Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerted when inventory is low
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-inventory-notifications" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Change Password</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Update your password to keep your account secure
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsChangingPassword(true)}
                      data-testid="button-change-admin-password"
                    >
                      Change Password
                    </Button>
                  </div>

                  {/* Password Change Form */}
                  {isChangingPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t pt-4"
                    >
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter your current password"
                              className="pr-12"
                              {...passwordForm.register("currentPassword")}
                              data-testid="input-admin-current-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              data-testid="button-toggle-current-password"
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="text-sm text-destructive">
                              {passwordForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter your new password"
                              className="pr-12"
                              {...passwordForm.register("newPassword")}
                              data-testid="input-admin-new-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              data-testid="button-toggle-new-password"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                          {passwordForm.formState.errors.newPassword && (
                            <p className="text-sm text-destructive">
                              {passwordForm.formState.errors.newPassword.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your new password"
                              className="pr-12"
                              {...passwordForm.register("confirmPassword")}
                              data-testid="input-admin-confirm-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              data-testid="button-toggle-confirm-password"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                              {passwordForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            type="submit"
                            disabled={updatePasswordMutation?.isPending}
                            data-testid="button-save-admin-password"
                          >
                            {updatePasswordMutation?.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsChangingPassword(false);
                              passwordForm.reset();
                            }}
                            data-testid="button-cancel-admin-password-change"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <div className="border-t pt-4">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" disabled data-testid="button-enable-admin-2fa">
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-destructive">Sign Out</Label>
                      <p className="text-sm text-muted-foreground">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={logout}
                      data-testid="button-admin-signout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}