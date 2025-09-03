import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  name: text("name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  label: text("label").notNull(), // "Home", "Work", etc.
  street: text("street").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  zipCode: text("zip_code").notNull(),
  coordinates: jsonb("coordinates"), // { lat: number, lng: number }
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const deliverySchedules = pgTable("delivery_schedules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  addressId: uuid("address_id").references(() => addresses.id).notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  type: text("type").notNull(), // "new" | "swap"
  frequency: text("frequency").notNull(), // "weekly" | "biweekly" | "monthly"
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly/biweekly (0=Sunday)
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  nextDelivery: timestamp("next_delivery").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  weight: text("weight").notNull(), // "7kg", "11kg", "22kg"
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  swapPrice: decimal("swap_price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerId: uuid("customer_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  addressId: uuid("address_id").references(() => addresses.id).notNull(),
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
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  type: text("type").notNull(), // "new" | "swap"
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  receiverId: uuid("receiver_id").references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  message: text("message").notNull(),
  type: text("type").default("text").notNull(), // "text" | "image" | "system"
  isRead: boolean("is_read").default(false),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "order_update" | "promo" | "reminder" | "system"
  data: jsonb("data"), // Additional data like order_id, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertDeliveryScheduleSchema = createInsertSchema(deliverySchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type DeliverySchedule = typeof deliverySchedules.$inferSelect;
export type InsertDeliverySchedule = z.infer<typeof insertDeliveryScheduleSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
