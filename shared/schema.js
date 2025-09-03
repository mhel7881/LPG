var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { sql } from "drizzle-orm";
import { pgTable, text, integer, decimal, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export var users = pgTable("users", {
    id: uuid("id").primaryKey().default(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").notNull().default("customer"), // "customer" | "admin"
    name: text("name").notNull(),
    phone: text("phone"),
    avatar: text("avatar"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    emailVerificationToken: text("email_verification_token"),
    emailVerificationExpires: timestamp("email_verification_expires"),
    createdAt: timestamp("created_at").default(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
    updatedAt: timestamp("updated_at").default(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var addresses = pgTable("addresses", {
    id: uuid("id").primaryKey().default(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: uuid("user_id").references(function () { return users.id; }).notNull(),
    label: text("label").notNull(), // "Home", "Work", etc.
    street: text("street").notNull(),
    city: text("city").notNull(),
    province: text("province").notNull(),
    zipCode: text("zip_code").notNull(),
    coordinates: jsonb("coordinates"), // { lat: number, lng: number }
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").default(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var deliverySchedules = pgTable("delivery_schedules", {
    id: uuid("id").primaryKey().default(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: uuid("user_id").references(function () { return users.id; }).notNull(),
    productId: uuid("product_id").references(function () { return products.id; }).notNull(),
    addressId: uuid("address_id").references(function () { return addresses.id; }).notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    type: text("type").notNull(), // "new" | "swap"
    frequency: text("frequency").notNull(), // "weekly" | "biweekly" | "monthly"
    dayOfWeek: integer("day_of_week"), // 0-6 for weekly/biweekly (0=Sunday)
    dayOfMonth: integer("day_of_month"), // 1-31 for monthly
    nextDelivery: timestamp("next_delivery").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
    updatedAt: timestamp("updated_at").default(sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var products = pgTable("products", {
    id: uuid("id").primaryKey().default(sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    name: text("name").notNull(),
    description: text("description"),
    weight: text("weight").notNull(), // "7kg", "11kg", "22kg"
    newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
    swapPrice: decimal("swap_price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").default(0).notNull(),
    image: text("image"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").default(sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
    updatedAt: timestamp("updated_at").default(sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var orders = pgTable("orders", {
    id: uuid("id").primaryKey().default(sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    orderNumber: text("order_number").notNull().unique(),
    customerId: uuid("customer_id").references(function () { return users.id; }).notNull(),
    productId: uuid("product_id").references(function () { return products.id; }).notNull(),
    addressId: uuid("address_id").references(function () { return addresses.id; }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    type: text("type").notNull(), // "new" | "swap"
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: text("status").default("pending").notNull(), // "pending" | "processing" | "out_for_delivery" | "delivered" | "cancelled"
    paymentMethod: text("payment_method").notNull(), // "cod" | "gcash"
    paymentStatus: text("payment_status").default("pending").notNull(), // "pending" | "paid" | "failed"
    notes: text("notes"),
    scheduledDate: timestamp("scheduled_date"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").default(sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
    updatedAt: timestamp("updated_at").default(sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var cartItems = pgTable("cart_items", {
    id: uuid("id").primaryKey().default(sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: uuid("user_id").references(function () { return users.id; }).notNull(),
    productId: uuid("product_id").references(function () { return products.id; }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    type: text("type").notNull(), // "new" | "swap"
    createdAt: timestamp("created_at").default(sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var chatMessages = pgTable("chat_messages", {
    id: uuid("id").primaryKey().default(sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    senderId: uuid("sender_id").references(function () { return users.id; }).notNull(),
    receiverId: uuid("receiver_id").references(function () { return users.id; }),
    orderId: uuid("order_id").references(function () { return orders.id; }),
    message: text("message").notNull(),
    type: text("type").default("text").notNull(), // "text" | "image" | "system"
    isRead: boolean("is_read").default(false),
    isEdited: boolean("is_edited").default(false),
    isDeleted: boolean("is_deleted").default(false),
    editedAt: timestamp("edited_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").default(sql(templateObject_18 || (templateObject_18 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
export var notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().default(sql(templateObject_19 || (templateObject_19 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: uuid("user_id").references(function () { return users.id; }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull(), // "order_update" | "promo" | "reminder" | "system"
    data: jsonb("data"), // Additional data like order_id, etc.
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").default(sql(templateObject_20 || (templateObject_20 = __makeTemplateObject(["now()"], ["now()"])))).notNull(),
});
// Insert schemas
export var insertUserSchema = createInsertSchema(users).omit({
    id: true,
    emailVerified: true,
    emailVerificationToken: true,
    emailVerificationExpires: true,
    createdAt: true,
    updatedAt: true,
});
export var insertAddressSchema = createInsertSchema(addresses).omit({
    id: true,
    createdAt: true,
});
export var insertProductSchema = createInsertSchema(products).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertOrderSchema = createInsertSchema(orders).omit({
    id: true,
    orderNumber: true,
    createdAt: true,
    updatedAt: true,
});
export var insertCartItemSchema = createInsertSchema(cartItems).omit({
    id: true,
    createdAt: true,
});
export var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
    id: true,
    createdAt: true,
});
export var insertNotificationSchema = createInsertSchema(notifications).omit({
    id: true,
    createdAt: true,
});
export var insertDeliveryScheduleSchema = createInsertSchema(deliverySchedules).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Login schema
export var loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20;
