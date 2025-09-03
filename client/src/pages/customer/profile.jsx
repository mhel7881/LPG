var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import Map from "@/components/map";
import { User, MapPin, Plus, Edit, Trash2, Bell, Shield, LogOut, Navigation, Loader2, X } from "lucide-react";
var addressSchema = z.object({
    label: z.string().min(1, "Label is required"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    isDefault: z.boolean().default(false),
});
var profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
});
var passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
export default function CustomerProfile() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var _o = useState(false), isAddingAddress = _o[0], setIsAddingAddress = _o[1];
    var _p = useState(null), editingAddress = _p[0], setEditingAddress = _p[1];
    var _q = useState(false), showLocationCapture = _q[0], setShowLocationCapture = _q[1];
    var _r = useState(null), capturedLocation = _r[0], setCapturedLocation = _r[1];
    var _s = useState(false), isEditingProfile = _s[0], setIsEditingProfile = _s[1];
    var _t = useState(false), isChangingPassword = _t[0], setIsChangingPassword = _t[1];
    var _u = useState(false), enable2FA = _u[0], setEnable2FA = _u[1];
    var _v = useAuth(), user = _v.user, logout = _v.logout;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _w = useGeolocation(), position = _w.position, error = _w.error, loading = _w.loading, getCurrentPosition = _w.getCurrentPosition;
    var _x = useQuery({
        queryKey: ["/api/users/addresses"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users/addresses", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch addresses");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), _y = _x.data, addresses = _y === void 0 ? [] : _y, addressesLoading = _x.isLoading;
    var _z = useQuery({
        queryKey: ["/api/notifications"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/notifications", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch notifications");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data, notifications = _z === void 0 ? [] : _z;
    var addressForm = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: "",
            street: "",
            city: "",
            province: "",
            zipCode: "",
            coordinates: undefined,
            isDefault: false,
        },
    });
    var profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: (user === null || user === void 0 ? void 0 : user.name) || "",
            phone: (user === null || user === void 0 ? void 0 : user.phone) || "",
        },
    });
    var passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });
    // Update form when geolocation is captured
    useEffect(function () {
        if (position && showLocationCapture) {
            setCapturedLocation(position);
            addressForm.setValue("coordinates", {
                lat: position.latitude,
                lng: position.longitude
            });
            setShowLocationCapture(false);
            toast({
                title: "Location Captured",
                description: "Coordinates: ".concat(position.latitude.toFixed(6), ", ").concat(position.longitude.toFixed(6)),
            });
        }
    }, [position, showLocationCapture, addressForm, toast]);
    // Handle geolocation errors
    useEffect(function () {
        if (error) {
            setShowLocationCapture(false);
            var errorMessage = error.message;
            var errorTitle = "Location Error";
            // Provide more helpful error messages
            if (error.code === 1) { // PERMISSION_DENIED
                errorMessage = "Location access was denied. Please allow location access in your browser settings and try again.";
                errorTitle = "Location Access Required";
            }
            else if (error.code === 2) { // POSITION_UNAVAILABLE
                errorMessage = "Location information is unavailable. Please check your GPS settings and try again.";
                errorTitle = "Location Unavailable";
            }
            else if (error.code === 3) { // TIMEOUT
                errorMessage = "Location request timed out. Please try again.";
                errorTitle = "Location Timeout";
            }
            toast({
                title: errorTitle,
                description: errorMessage,
                variant: "destructive",
            });
        }
    }, [error, toast]);
    var createAddressMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users/addresses", {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to create address");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/users/addresses"] });
            setIsAddingAddress(false);
            addressForm.reset();
            toast({
                title: "Address Added",
                description: "Your new address has been saved successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to add address",
                variant: "destructive",
            });
        },
    });
    var updateAddressMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var id = _b.id, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users/addresses/".concat(id), {
                            method: "PUT",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok)
                            throw new Error("Failed to update address");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/users/addresses"] });
            setEditingAddress(null);
            addressForm.reset();
            toast({
                title: "Address Updated",
                description: "Your address has been updated successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update address",
                variant: "destructive",
            });
        },
    });
    var deleteAddressMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users/addresses/".concat(id), {
                            method: "DELETE",
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to delete address");
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/users/addresses"] });
            toast({
                title: "Address Deleted",
                description: "Your address has been removed successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete address",
                variant: "destructive",
            });
        },
    });
    var onAddressSubmit = function (data) {
        if (editingAddress) {
            updateAddressMutation.mutate({ id: editingAddress.id, data: data });
        }
        else {
            createAddressMutation.mutate(data);
        }
    };
    var handleEditAddress = function (address) {
        setEditingAddress(address);
        setIsAddingAddress(true);
        setCapturedLocation(null);
        addressForm.reset({
            label: address.label,
            street: address.street,
            city: address.city,
            province: address.province,
            zipCode: address.zipCode,
            coordinates: address.coordinates,
            isDefault: address.isDefault,
        });
    };
    var handleCancelAddressForm = function () {
        setIsAddingAddress(false);
        setEditingAddress(null);
        setShowLocationCapture(false);
        setCapturedLocation(null);
        addressForm.reset();
    };
    var handleCaptureLocation = function () {
        // Clear any previous captured location
        setCapturedLocation(null);
        setShowLocationCapture(true);
        // Small delay to ensure state is updated before making the request
        setTimeout(function () {
            getCurrentPosition();
        }, 100);
    };
    var handleLocationSelect = function (position) {
        setCapturedLocation(position);
        addressForm.setValue("coordinates", {
            lat: position.latitude,
            lng: position.longitude
        });
        toast({
            title: "Location Selected",
            description: "Coordinates: ".concat(position.latitude.toFixed(6), ", ").concat(position.longitude.toFixed(6)),
        });
    };
    // Profile update mutation
    var updateProfileMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users/me", {
                            method: "PUT",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to update profile");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setIsEditingProfile(false);
            profileForm.reset();
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        },
    });
    var onProfileSubmit = function (data) {
        updateProfileMutation.mutate(data);
    };
    var handleCancelProfileEdit = function () {
        setIsEditingProfile(false);
        profileForm.reset({
            name: (user === null || user === void 0 ? void 0 : user.name) || "",
            phone: (user === null || user === void 0 ? void 0 : user.phone) || "",
        });
    };
    // Password change mutation
    var updatePasswordMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/auth/change-password", {
                            method: "PUT",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                                currentPassword: data.currentPassword,
                                newPassword: data.newPassword,
                            }),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to change password");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            setIsChangingPassword(false);
            passwordForm.reset();
            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to change password",
                variant: "destructive",
            });
        },
    });
    var onPasswordSubmit = function (data) {
        updatePasswordMutation.mutate(data);
    };
    // Update form when user data changes
    useEffect(function () {
        if (user && isEditingProfile) {
            profileForm.reset({
                name: user.name || "",
                phone: user.phone || "",
            });
        }
    }, [user, isEditingProfile, profileForm]);
    return (<div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">
              {user === null || user === void 0 ? void 0 : user.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-user-name">{user === null || user === void 0 ? void 0 : user.name}</h1>
            <p className="text-muted-foreground" data-testid="text-user-email">{user === null || user === void 0 ? void 0 : user.email}</p>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">Addresses</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-4 w-4 mr-2"/>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={(user === null || user === void 0 ? void 0 : user.name) || ""} readOnly data-testid="input-profile-name"/>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={(user === null || user === void 0 ? void 0 : user.email) || ""} readOnly data-testid="input-profile-email"/>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={(user === null || user === void 0 ? void 0 : user.phone) || ""} readOnly data-testid="input-profile-phone"/>
                  </div>
                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Input id="role" value={(user === null || user === void 0 ? void 0 : user.role) || ""} readOnly className="capitalize" data-testid="input-profile-role"/>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={function () { return setIsEditingProfile(true); }} data-testid="button-edit-profile">
                    <Edit className="h-4 w-4 mr-2"/>
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Edit Form */}
            {isEditingProfile && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Full Name</Label>
                          <Input id="edit-name" placeholder="Enter your full name" {...profileForm.register("name")} data-testid="input-edit-profile-name"/>
                          {profileForm.formState.errors.name && (<p className="text-sm text-destructive">
                              {profileForm.formState.errors.name.message}
                            </p>)}
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Phone Number</Label>
                          <Input id="edit-phone" type="tel" placeholder="Enter your phone number" {...profileForm.register("phone")} data-testid="input-edit-profile-phone"/>
                          {profileForm.formState.errors.phone && (<p className="text-sm text-destructive">
                              {profileForm.formState.errors.phone.message}
                            </p>)}
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                          {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelProfileEdit} data-testid="button-cancel-profile-edit">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>)}
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Delivery Addresses</h2>
                <Button onClick={function () { return setIsAddingAddress(true); }} data-testid="button-add-address">
                  <Plus className="h-4 w-4 mr-2"/>
                  Add Address
                </Button>
              </div>

              {/* Add/Edit Address Form */}
              {isAddingAddress && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {editingAddress ? "Edit Address" : "Add New Address"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="label">Address Label</Label>
                            <Input id="label" placeholder="e.g., Home, Work" {...addressForm.register("label")} data-testid="input-address-label"/>
                            {addressForm.formState.errors.label && (<p className="text-sm text-destructive">
                                {addressForm.formState.errors.label.message}
                              </p>)}
                          </div>
                          
                          <div>
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input id="zipCode" placeholder="ZIP Code" {...addressForm.register("zipCode")} data-testid="input-address-zipcode"/>
                            {addressForm.formState.errors.zipCode && (<p className="text-sm text-destructive">
                                {addressForm.formState.errors.zipCode.message}
                              </p>)}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="street">Street Address</Label>
                          <Input id="street" placeholder="Street, Building, Unit" {...addressForm.register("street")} data-testid="input-address-street"/>
                          {addressForm.formState.errors.street && (<p className="text-sm text-destructive">
                              {addressForm.formState.errors.street.message}
                            </p>)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="City" {...addressForm.register("city")} data-testid="input-address-city"/>
                            {addressForm.formState.errors.city && (<p className="text-sm text-destructive">
                                {addressForm.formState.errors.city.message}
                              </p>)}
                          </div>
                          
                          <div>
                            <Label htmlFor="province">Province</Label>
                            <Input id="province" placeholder="Province" {...addressForm.register("province")} data-testid="input-address-province"/>
                            {addressForm.formState.errors.province && (<p className="text-sm text-destructive">
                                {addressForm.formState.errors.province.message}
                              </p>)}
                          </div>
                        </div>

                        {/* Location Capture Section */}
                        <div className="space-y-4">
                          <div className="border-t pt-4">
                            <Label className="text-base font-medium">Location (Optional)</Label>
                            <p className="text-sm text-muted-foreground mb-3">
                              Add GPS coordinates to help with accurate deliveries
                            </p>
                            
                            <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
                              <Button type="button" variant="outline" onClick={handleCaptureLocation} disabled={loading} className="flex-1" data-testid="button-capture-location">
                                {loading ? (<Loader2 className="h-4 w-4 mr-2 animate-spin"/>) : (<Navigation className="h-4 w-4 mr-2"/>)}
                                {loading ? "Getting Location..." : "Use Current Location"}
                              </Button>

                              {capturedLocation && (<div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                                  <strong>Captured:</strong> {capturedLocation.latitude.toFixed(6)}, {capturedLocation.longitude.toFixed(6)}
                                </div>)}
                            </div>

                            {/* Location Permission Help */}
                            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">💡 Location Permission Required</p>
                              <p>If location access is denied, try these steps:</p>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Click "Allow" when your browser asks for location permission</li>
                                <li>Click the lock/info icon in the address bar and allow location</li>
                                <li>Check your browser settings for location permissions</li>
                                <li>Try refreshing the page and clicking the button again</li>
                              </ul>
                              <p className="mt-2 text-xs font-medium">💡 Tip: If you accidentally clicked "Block", refresh the page to try again.</p>
                              <p className="mt-1 text-xs">Alternatively, you can manually enter coordinates below.</p>
                            </div>

                            {/* Manual Coordinate Entry */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Or Enter Coordinates Manually</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="manual-lat" className="text-xs">Latitude</Label>
                                  <Input id="manual-lat" type="number" step="0.000001" placeholder="e.g., 14.5995" value={((_a = addressForm.watch("coordinates")) === null || _a === void 0 ? void 0 : _a.lat) || ""} onChange={function (e) {
                var _a;
                var lat = parseFloat(e.target.value);
                var currentLng = ((_a = addressForm.watch("coordinates")) === null || _a === void 0 ? void 0 : _a.lng) || 0;
                if (!isNaN(lat)) {
                    addressForm.setValue("coordinates", { lat: lat, lng: currentLng });
                }
            }} className="text-sm"/>
                                </div>
                                <div>
                                  <Label htmlFor="manual-lng" className="text-xs">Longitude</Label>
                                  <Input id="manual-lng" type="number" step="0.000001" placeholder="e.g., 120.9842" value={((_b = addressForm.watch("coordinates")) === null || _b === void 0 ? void 0 : _b.lng) || ""} onChange={function (e) {
                var _a;
                var lng = parseFloat(e.target.value);
                var currentLat = ((_a = addressForm.watch("coordinates")) === null || _a === void 0 ? void 0 : _a.lat) || 0;
                if (!isNaN(lng)) {
                    addressForm.setValue("coordinates", { lat: currentLat, lng: lng });
                }
            }} className="text-sm"/>
                                </div>
                              </div>
                              {addressForm.watch("coordinates") && (<p className="text-xs text-green-600">
                                  ✓ Coordinates set: {(_d = (_c = addressForm.watch("coordinates")) === null || _c === void 0 ? void 0 : _c.lat) === null || _d === void 0 ? void 0 : _d.toFixed(6)}, {(_f = (_e = addressForm.watch("coordinates")) === null || _e === void 0 ? void 0 : _e.lng) === null || _f === void 0 ? void 0 : _f.toFixed(6)}
                                </p>)}
                            </div>

                            {/* Map for location selection */}
                            {(capturedLocation || addressForm.watch("coordinates")) && (<div className="mt-4 relative">
                                <div className="relative bg-background border rounded-lg overflow-hidden">
                                  {/* Map Header with Close Button */}
                                  <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-primary"/>
                                      <span className="text-sm font-medium">Selected Location</span>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={function () {
                    setCapturedLocation(null);
                    addressForm.setValue("coordinates", undefined);
                }} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" data-testid="button-close-map">
                                      <X className="h-4 w-4"/>
                                      <span className="sr-only">Close map</span>
                                    </Button>
                                  </div>
                                  
                                  {/* Map Container */}
                                  <div className="relative">
                                    <Map center={capturedLocation || (addressForm.watch("coordinates") ? {
                    latitude: ((_g = addressForm.watch("coordinates")) === null || _g === void 0 ? void 0 : _g.lat) || 0,
                    longitude: ((_h = addressForm.watch("coordinates")) === null || _h === void 0 ? void 0 : _h.lng) || 0
                } : undefined)} markers={[
                    {
                        id: "selected-location",
                        position: capturedLocation || {
                            latitude: ((_j = addressForm.watch("coordinates")) === null || _j === void 0 ? void 0 : _j.lat) || 0,
                            longitude: ((_k = addressForm.watch("coordinates")) === null || _k === void 0 ? void 0 : _k.lng) || 0
                        },
                        title: "Selected Location",
                        type: "customer"
                    }
                ]} onLocationSelect={handleLocationSelect} className="h-48"/>
                                  </div>
                                  
                                  {/* Location Info Footer */}
                                  <div className="p-3 border-t bg-muted/30">
                                    <p className="text-xs text-muted-foreground">
                                      📍 Coordinates: {(capturedLocation || addressForm.watch("coordinates")) ?
                    "".concat(((capturedLocation === null || capturedLocation === void 0 ? void 0 : capturedLocation.latitude) || ((_l = addressForm.watch("coordinates")) === null || _l === void 0 ? void 0 : _l.lat) || 0).toFixed(6), ", ").concat(((capturedLocation === null || capturedLocation === void 0 ? void 0 : capturedLocation.longitude) || ((_m = addressForm.watch("coordinates")) === null || _m === void 0 ? void 0 : _m.lng) || 0).toFixed(6)) :
                    'No location selected'}
                                    </p>
                                  </div>
                                </div>
                              </div>)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="isDefault" checked={addressForm.watch("isDefault")} onCheckedChange={function (checked) { return addressForm.setValue("isDefault", checked); }} data-testid="switch-default-address"/>
                          <Label htmlFor="isDefault">Set as default address</Label>
                        </div>

                        <div className="flex space-x-3">
                          <Button type="submit" disabled={createAddressMutation.isPending || updateAddressMutation.isPending} data-testid="button-save-address">
                            {editingAddress ? "Update Address" : "Add Address"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCancelAddressForm} data-testid="button-cancel-address">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>)}

              {/* Addresses List */}
              <div className="space-y-4">
                {addressesLoading ? (<div className="space-y-4">
                    {Array.from({ length: 2 }).map(function (_, i) { return (<Card key={i}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                            <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                          </div>
                        </CardContent>
                      </Card>); })}
                  </div>) : addresses.length === 0 ? (<Card>
                    <CardContent className="p-8 text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                      <h3 className="font-semibold mb-2">No addresses added</h3>
                      <p className="text-muted-foreground">
                        Add your delivery addresses to make ordering easier.
                      </p>
                    </CardContent>
                  </Card>) : (addresses.map(function (address) { return (<Card key={address.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5"/>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium" data-testid={"text-address-label-".concat(address.id)}>
                                  {address.label}
                                </h3>
                                {address.isDefault && (<span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                    Default
                                  </span>)}
                              </div>
                              <p className="text-muted-foreground text-sm" data-testid={"text-address-details-".concat(address.id)}>
                                {address.street}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {address.city}, {address.province} {address.zipCode}
                              </p>
                              {address.coordinates && (<div className="flex items-center space-x-1 mt-1">
                                  <Navigation className="h-3 w-3 text-green-600"/>
                                  <span className="text-xs text-green-600 font-medium">
                                    GPS Location Available
                                  </span>
                                </div>)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={function () { return handleEditAddress(address); }} data-testid={"button-edit-address-".concat(address.id)}>
                              <Edit className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={function () { return deleteAddressMutation.mutate(address.id); }} className="text-destructive hover:text-destructive" data-testid={"button-delete-address-".concat(address.id)}>
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>); }))}
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-4 w-4 mr-2"/>
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about order status changes
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-order-notifications"/>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive special offers and promotions
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-promo-notifications"/>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Delivery Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about scheduled deliveries
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-delivery-notifications"/>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-4 w-4 mr-2"/>
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Change Password</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Update your password to keep your account secure
                    </p>
                    <Button variant="outline" onClick={function () { return setIsChangingPassword(true); }} data-testid="button-change-password">
                      Change Password
                    </Button>
                  </div>

                  {/* Password Change Form */}
                  {isChangingPassword && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-t pt-4">
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" placeholder="Enter your current password" {...passwordForm.register("currentPassword")} data-testid="input-current-password"/>
                          {passwordForm.formState.errors.currentPassword && (<p className="text-sm text-destructive">
                              {passwordForm.formState.errors.currentPassword.message}
                            </p>)}
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" placeholder="Enter your new password" {...passwordForm.register("newPassword")} data-testid="input-new-password"/>
                          {passwordForm.formState.errors.newPassword && (<p className="text-sm text-destructive">
                              {passwordForm.formState.errors.newPassword.message}
                            </p>)}
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" placeholder="Confirm your new password" {...passwordForm.register("confirmPassword")} data-testid="input-confirm-password"/>
                          {passwordForm.formState.errors.confirmPassword && (<p className="text-sm text-destructive">
                              {passwordForm.formState.errors.confirmPassword.message}
                            </p>)}
                        </div>
                        <div className="flex space-x-3">
                          <Button type="submit" disabled={updatePasswordMutation === null || updatePasswordMutation === void 0 ? void 0 : updatePasswordMutation.isPending} data-testid="button-save-password">
                            {(updatePasswordMutation === null || updatePasswordMutation === void 0 ? void 0 : updatePasswordMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Update Password
                          </Button>
                          <Button type="button" variant="outline" onClick={function () {
                setIsChangingPassword(false);
                passwordForm.reset();
            }} data-testid="button-cancel-password-change">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </motion.div>)}

                  <div className="border-t pt-4">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" disabled data-testid="button-enable-2fa">
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
                    <Button variant="destructive" onClick={logout} data-testid="button-signout">
                      <LogOut className="h-4 w-4 mr-2"/>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}
