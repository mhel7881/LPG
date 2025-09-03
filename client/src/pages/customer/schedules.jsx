var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Package, MapPin, Edit, Trash2, Clock, RefreshCw } from "lucide-react";
export default function CustomerSchedules() {
    var _this = this;
    var _a = useState(false), isCreateDialogOpen = _a[0], setIsCreateDialogOpen = _a[1];
    var _b = useState(null), editingSchedule = _b[0], setEditingSchedule = _b[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    // Form state
    var _c = useState({
        name: "",
        productId: "",
        addressId: "",
        quantity: 1,
        type: "new",
        frequency: "weekly",
        dayOfWeek: 1, // Monday
        dayOfMonth: 1,
    }), formData = _c[0], setFormData = _c[1];
    // Fetch delivery schedules
    var _d = useQuery({
        queryKey: ["/api/schedules"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/schedules", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch schedules");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), _e = _d.data, schedules = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    // Fetch products
    var _f = useQuery({
        queryKey: ["/api/products"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/products")];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch products");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data, products = _f === void 0 ? [] : _f;
    // Fetch addresses
    var _g = useQuery({
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
    }).data, addresses = _g === void 0 ? [] : _g;
    // Create schedule mutation
    var createScheduleMutation = useMutation({
        mutationFn: function (scheduleData) { return __awaiter(_this, void 0, void 0, function () {
            var nextDelivery, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextDelivery = calculateNextDelivery(scheduleData.frequency, scheduleData.dayOfWeek, scheduleData.dayOfMonth);
                        return [4 /*yield*/, fetch("/api/schedules", {
                                method: "POST",
                                headers: getAuthHeaders(),
                                body: JSON.stringify(__assign(__assign({}, scheduleData), { nextDelivery: nextDelivery })),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to create schedule");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
            setIsCreateDialogOpen(false);
            resetForm();
            toast({
                title: "Schedule Created",
                description: "Your delivery schedule has been created successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create schedule",
                variant: "destructive",
            });
        },
    });
    // Update schedule mutation
    var updateScheduleMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var id = _b.id, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch("/api/schedules/".concat(id), {
                            method: "PUT",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(data),
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok)
                            throw new Error("Failed to update schedule");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
            setEditingSchedule(null);
            toast({
                title: "Schedule Updated",
                description: "Your delivery schedule has been updated successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update schedule",
                variant: "destructive",
            });
        },
    });
    // Delete schedule mutation
    var deleteScheduleMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/schedules/".concat(id), {
                            method: "DELETE",
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to delete schedule");
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
            toast({
                title: "Schedule Deleted",
                description: "Your delivery schedule has been deleted.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete schedule",
                variant: "destructive",
            });
        },
    });
    var calculateNextDelivery = function (frequency, dayOfWeek, dayOfMonth) {
        var now = new Date();
        var nextDelivery = new Date();
        if (frequency === "monthly" && dayOfMonth) {
            nextDelivery.setDate(dayOfMonth);
            if (nextDelivery <= now) {
                nextDelivery.setMonth(nextDelivery.getMonth() + 1);
            }
        }
        else if ((frequency === "weekly" || frequency === "biweekly") && dayOfWeek !== undefined) {
            var days = (dayOfWeek - now.getDay() + 7) % 7;
            nextDelivery.setDate(now.getDate() + days);
            if (nextDelivery <= now) {
                nextDelivery.setDate(nextDelivery.getDate() + (frequency === "weekly" ? 7 : 14));
            }
        }
        return nextDelivery.toISOString();
    };
    var resetForm = function () {
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
    var handleSubmit = function () {
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
        }
        else {
            createScheduleMutation.mutate(formData);
        }
    };
    var handleEdit = function (schedule) {
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
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this delivery schedule?")) {
            deleteScheduleMutation.mutate(id);
        }
    };
    var getFrequencyText = function (schedule) {
        if (schedule.frequency === "monthly") {
            return "Monthly on the ".concat(schedule.dayOfMonth).concat(getOrdinalSuffix(schedule.dayOfMonth));
        }
        else {
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var frequency = schedule.frequency === "weekly" ? "Weekly" : "Bi-weekly";
            return "".concat(frequency, " on ").concat(days[schedule.dayOfWeek]);
        }
    };
    var getOrdinalSuffix = function (num) {
        var j = num % 10;
        var k = num % 100;
        if (j === 1 && k !== 11)
            return "st";
        if (j === 2 && k !== 12)
            return "nd";
        if (j === 3 && k !== 13)
            return "rd";
        return "th";
    };
    var toggleScheduleStatus = function (id, isActive) {
        updateScheduleMutation.mutate({
            id: id,
            data: { isActive: !isActive },
        });
    };
    return (<div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Schedules</h1>
          <p className="text-muted-foreground">Manage your recurring LPG deliveries</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={function () {
            resetForm();
            setEditingSchedule(null);
        }} data-testid="button-create-schedule">
              <Plus className="h-4 w-4 mr-2"/>
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
                <Input id="name" placeholder="e.g., Weekly Home Delivery" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} data-testid="input-schedule-name"/>
              </div>

              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={formData.productId} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { productId: value })); }}>
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Select a product"/>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(function (product) { return (<SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.weight}
                      </SelectItem>); })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Select value={formData.addressId} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { addressId: value })); }}>
                  <SelectTrigger data-testid="select-address">
                    <SelectValue placeholder="Select an address"/>
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map(function (address) { return (<SelectItem key={address.id} value={address.id}>
                        {address.label} - {address.street}
                      </SelectItem>); })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { quantity: parseInt(e.target.value) })); }} data-testid="input-quantity"/>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { type: value })); }}>
                    <SelectTrigger data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Tank</SelectItem>
                      <SelectItem value="swap">Tank Swap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={function (value) {
            return setFormData(__assign(__assign({}, formData), { frequency: value }));
        }}>
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.frequency === "monthly" ? (<div>
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input id="dayOfMonth" type="number" min="1" max="31" value={formData.dayOfMonth} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { dayOfMonth: parseInt(e.target.value) })); }} data-testid="input-day-of-month"/>
                </div>) : (<div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select value={formData.dayOfWeek.toString()} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { dayOfWeek: parseInt(value) })); }}>
                    <SelectTrigger data-testid="select-day-of-week">
                      <SelectValue />
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
                </div>)}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={function () { return setIsCreateDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending} data-testid="button-save-schedule">
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      {isLoading ? (<div className="space-y-4">
          {[1, 2, 3].map(function (i) { return (<Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>); })}
        </div>) : schedules.length === 0 ? (<Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">No Delivery Schedules</h3>
            <p className="text-muted-foreground mb-4">
              Set up recurring deliveries to never run out of LPG again.
            </p>
            <Button onClick={function () { return setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2"/>
              Create Your First Schedule
            </Button>
          </CardContent>
        </Card>) : (<div className="space-y-4">
          {schedules.map(function (schedule) {
                var _a, _b, _c;
                return (<motion.div key={schedule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg" data-testid={"text-schedule-name-".concat(schedule.id)}>
                          {schedule.name}
                        </h3>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground"/>
                          <span>
                            {(_a = schedule.product) === null || _a === void 0 ? void 0 : _a.name} - {schedule.quantity}x ({schedule.type})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground"/>
                          <span>
                            {(_b = schedule.address) === null || _b === void 0 ? void 0 : _b.street}, {(_c = schedule.address) === null || _c === void 0 ? void 0 : _c.city}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground"/>
                          <span>{getFrequencyText(schedule)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground"/>
                          <span>
                            Next: {new Date(schedule.nextDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={function () { return toggleScheduleStatus(schedule.id, schedule.isActive); }} data-testid={"button-toggle-schedule-".concat(schedule.id)}>
                        {schedule.isActive ? "⏸️" : "▶️"}
                      </Button>
                      <Button variant="outline" size="icon" onClick={function () { return handleEdit(schedule); }} data-testid={"button-edit-schedule-".concat(schedule.id)}>
                        <Edit className="h-4 w-4"/>
                      </Button>
                      <Button variant="outline" size="icon" onClick={function () { return handleDelete(schedule.id); }} data-testid={"button-delete-schedule-".concat(schedule.id)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>);
            })}
        </div>)}
    </div>);
}
