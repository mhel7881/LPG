// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt2 from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";

// server/storage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, or, count, sum, sql as drizzleSql, gt } from "drizzle-orm";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, integer, decimal, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"),
  // "customer" | "admin"
  name: text("name").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  termsAccepted: boolean("terms_accepted").default(false).notNull(),
  privacyAccepted: boolean("privacy_accepted").default(false).notNull(),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyAcceptedAt: timestamp("privacy_accepted_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull()
});
var addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  label: text("label").notNull(),
  // "Home", "Work", etc.
  street: text("street").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  zipCode: text("zip_code").notNull(),
  coordinates: jsonb("coordinates"),
  // { lat: number, lng: number }
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});
var deliverySchedules = pgTable("delivery_schedules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  addressId: uuid("address_id").references(() => addresses.id).notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  type: text("type").notNull(),
  // "new" | "swap"
  frequency: text("frequency").notNull(),
  // "weekly" | "biweekly" | "monthly"
  dayOfWeek: integer("day_of_week"),
  // 0-6 for weekly/biweekly (0=Sunday)
  dayOfMonth: integer("day_of_month"),
  // 1-31 for monthly
  nextDelivery: timestamp("next_delivery").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull()
});
var products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  weight: text("weight").notNull(),
  // "7kg", "11kg", "22kg"
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  swapPrice: decimal("swap_price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull()
});
var orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerId: uuid("customer_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  addressId: uuid("address_id").references(() => addresses.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  type: text("type").notNull(),
  // "new" | "swap"
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(),
  // "pending" | "processing" | "out_for_delivery" | "delivered" | "cancelled"
  paymentMethod: text("payment_method").notNull(),
  // "cod" | "gcash"
  paymentStatus: text("payment_status").default("pending").notNull(),
  // "pending" | "paid" | "failed"
  notes: text("notes"),
  scheduledDate: timestamp("scheduled_date"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull()
});
var cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  type: text("type").notNull(),
  // "new" | "swap"
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  receiverId: uuid("receiver_id").references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  message: text("message").notNull(),
  type: text("type").default("text").notNull(),
  // "text" | "image" | "system"
  isRead: boolean("is_read").default(false),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});
var notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  // "order_update" | "promo" | "reminder" | "system"
  data: jsonb("data"),
  // Additional data like order_id, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`).notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  termsAccepted: true,
  privacyAccepted: true,
  termsAcceptedAt: true,
  privacyAcceptedAt: true,
  createdAt: true,
  updatedAt: true
});
var insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertDeliveryScheduleSchema = createInsertSchema(deliverySchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// server/storage.ts
import bcrypt from "bcrypt";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var sql2 = postgres(process.env.DATABASE_URL);
var db = drizzle(sql2);
var DrizzleStorage = class {
  async getUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async createUser(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await db.insert(users).values({
      ...user,
      password: hashedPassword
    }).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const result = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async validateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  async getUserAddresses(userId) {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }
  async createAddress(address) {
    const result = await db.insert(addresses).values(address).returning();
    return result[0];
  }
  async updateAddress(id, updates) {
    const result = await db.update(addresses).set(updates).where(eq(addresses.id, id)).returning();
    return result[0];
  }
  async deleteAddress(id) {
    const result = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return result.length > 0;
  }
  async getAllAddressesWithUsers() {
    const result = await db.select({
      id: addresses.id,
      label: addresses.label,
      street: addresses.street,
      city: addresses.city,
      province: addresses.province,
      zipCode: addresses.zipCode,
      coordinates: addresses.coordinates,
      isDefault: addresses.isDefault,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone
      }
    }).from(addresses).innerJoin(users, eq(addresses.userId, users.id));
    return result.filter((addr) => addr.coordinates != null);
  }
  async getProducts() {
    return await db.select().from(products).where(eq(products.isActive, true));
  }
  async getProduct(id) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  async getProductById(id) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  async createProduct(product) {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  async updateProduct(id, updates) {
    const result = await db.update(products).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, id)).returning();
    return result[0];
  }
  async updateProductStock(id, stock) {
    const result = await db.update(products).set({
      stock,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id) {
    try {
      console.log("Attempting to delete product:", id);
      const existingProduct = await this.getProduct(id);
      console.log("Existing product:", existingProduct);
      if (!existingProduct) {
        console.log("Product not found");
        return false;
      }
      await db.update(products).set({
        isActive: false
      }).where(eq(products.id, id));
      console.log("Update completed");
      return true;
    } catch (error) {
      console.error("Delete product error:", error);
      return false;
    }
  }
  async getOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrdersByCustomer(customerId) {
    return await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
  }
  async getOrderById(id) {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }
  async createOrder(order) {
    const orderNumber = `GF-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(Date.now()).slice(-6)}`;
    const result = await db.insert(orders).values({
      ...order,
      orderNumber
    }).returning();
    return result[0];
  }
  async updateOrderStatus(id, status) {
    const updates = { status, updatedAt: /* @__PURE__ */ new Date() };
    if (status === "delivered") {
      updates.deliveredAt = /* @__PURE__ */ new Date();
    }
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }
  async getOrdersWithLocationData() {
    const result = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      createdAt: orders.createdAt,
      quantity: orders.quantity,
      type: orders.type,
      unitPrice: orders.unitPrice,
      totalAmount: orders.totalAmount,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      notes: orders.notes,
      customer: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone
      },
      address: {
        id: addresses.id,
        street: addresses.street,
        city: addresses.city,
        province: addresses.province,
        zipCode: addresses.zipCode,
        coordinates: addresses.coordinates
      }
    }).from(orders).innerJoin(users, eq(orders.customerId, users.id)).leftJoin(addresses, eq(orders.addressId, addresses.id)).orderBy(desc(orders.createdAt));
    return result.filter(
      (order) => order.address?.coordinates != null && ["pending", "processing", "out_for_delivery"].includes(order.status)
    );
  }
  async getCartItems(userId) {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }
  async addCartItem(item) {
    const existing = await db.select().from(cartItems).where(and(
      eq(cartItems.userId, item.userId),
      eq(cartItems.productId, item.productId),
      eq(cartItems.type, item.type)
    )).limit(1);
    if (existing.length > 0) {
      const result = await db.update(cartItems).set({ quantity: (existing[0].quantity || 0) + (item.quantity || 1) }).where(eq(cartItems.id, existing[0].id)).returning();
      return result[0];
    } else {
      const result = await db.insert(cartItems).values(item).returning();
      return result[0];
    }
  }
  async updateCartItem(id, quantity) {
    const result = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return result[0];
  }
  async removeCartItem(id) {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }
  async clearCart(userId) {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    return result.length > 0;
  }
  async getChatMessages(userId, orderId) {
    if (orderId) {
      return await db.select().from(chatMessages).where(and(
        eq(chatMessages.orderId, orderId),
        eq(chatMessages.isDeleted, false)
      )).orderBy(chatMessages.createdAt);
    } else {
      return await db.select().from(chatMessages).where(and(
        or(
          eq(chatMessages.senderId, userId),
          eq(chatMessages.receiverId, userId)
        ),
        eq(chatMessages.isDeleted, false)
      )).orderBy(chatMessages.createdAt);
    }
  }
  async createChatMessage(message) {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }
  async updateChatMessage(messageId, userId, newMessage) {
    const result = await db.update(chatMessages).set({
      message: newMessage,
      isEdited: true,
      editedAt: /* @__PURE__ */ new Date()
    }).where(and(
      eq(chatMessages.id, messageId),
      eq(chatMessages.senderId, userId),
      // Only sender can edit their own messages
      eq(chatMessages.isDeleted, false)
    )).returning();
    return result.length > 0 ? result[0] : null;
  }
  async deleteChatMessage(messageId, userId) {
    const result = await db.update(chatMessages).set({
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }).where(and(
      eq(chatMessages.id, messageId),
      eq(chatMessages.senderId, userId),
      // Only sender can delete their own messages
      eq(chatMessages.isDeleted, false)
    )).returning();
    return result.length > 0;
  }
  async unsendChatMessage(messageId, userId) {
    const result = await db.delete(chatMessages).where(and(
      eq(chatMessages.id, messageId),
      eq(chatMessages.senderId, userId)
      // Only sender can unsend their own messages
    )).returning();
    return result.length > 0;
  }
  async markMessagesAsRead(userId) {
    const result = await db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.receiverId, userId)).returning();
    return result.length > 0;
  }
  // Get list of customers who have sent messages to admin
  async getChatCustomers() {
    const latestMessages = await db.select({
      customerId: chatMessages.senderId,
      maxTime: drizzleSql`max(${chatMessages.createdAt})`.as("max_time")
    }).from(chatMessages).innerJoin(users, eq(chatMessages.senderId, users.id)).where(and(
      eq(users.role, "customer"),
      eq(chatMessages.isDeleted, false)
    )).groupBy(chatMessages.senderId);
    const result = [];
    for (const item of latestMessages) {
      const customerMessages = await db.select({
        customerId: chatMessages.senderId,
        customer: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar
        },
        lastMessage: chatMessages.message,
        lastMessageTime: chatMessages.createdAt
      }).from(chatMessages).innerJoin(users, eq(chatMessages.senderId, users.id)).where(and(
        eq(chatMessages.senderId, item.customerId),
        drizzleSql`${chatMessages.createdAt} = ${item.maxTime}::timestamp`,
        eq(chatMessages.isDeleted, false)
      )).limit(1);
      if (customerMessages.length > 0) {
        const unreadCount = await db.select({
          count: drizzleSql`count(*)`.as("count")
        }).from(chatMessages).where(and(
          eq(chatMessages.senderId, item.customerId),
          eq(chatMessages.isRead, false),
          eq(chatMessages.isDeleted, false)
        ));
        result.push({
          ...customerMessages[0],
          unreadCount: unreadCount[0]?.count || 0
        });
      }
    }
    return result.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }
  // Get messages for a specific conversation between admin and customer
  async getConversationMessages(customerId, adminId) {
    return await db.select({
      id: chatMessages.id,
      senderId: chatMessages.senderId,
      receiverId: chatMessages.receiverId,
      orderId: chatMessages.orderId,
      message: chatMessages.message,
      type: chatMessages.type,
      isRead: chatMessages.isRead,
      isEdited: chatMessages.isEdited,
      isDeleted: chatMessages.isDeleted,
      editedAt: chatMessages.editedAt,
      deletedAt: chatMessages.deletedAt,
      createdAt: chatMessages.createdAt,
      sender: {
        id: users.id,
        name: users.name,
        role: users.role
      }
    }).from(chatMessages).innerJoin(users, eq(chatMessages.senderId, users.id)).where(and(
      or(
        and(eq(chatMessages.senderId, customerId), eq(chatMessages.receiverId, adminId)),
        and(eq(chatMessages.senderId, adminId), eq(chatMessages.receiverId, customerId))
      ),
      eq(chatMessages.isDeleted, false)
    )).orderBy(chatMessages.createdAt);
  }
  async getUserNotifications(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async createNotification(notification) {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }
  async markNotificationAsRead(id) {
    const result = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }
  async deleteNotification(id, userId) {
    const result = await db.delete(notifications).where(and(
      eq(notifications.id, id),
      eq(notifications.userId, userId)
      // Ensure user can only delete their own notifications
    )).returning();
    return result.length > 0;
  }
  async getDashboardStats() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const [salesResult] = await db.select({
      totalSales: sum(orders.totalAmount),
      totalOrders: count(orders.id)
    }).from(orders).where(eq(orders.status, "delivered"));
    const [pendingResult] = await db.select({
      pendingOrders: count(orders.id)
    }).from(orders).where(eq(orders.status, "pending"));
    const [customersResult] = await db.select({
      activeCustomers: count(users.id)
    }).from(users).where(eq(users.role, "customer"));
    return {
      totalSales: Number(salesResult.totalSales) || 0,
      totalOrders: Number(salesResult.totalOrders) || 0,
      pendingOrders: Number(pendingResult.pendingOrders) || 0,
      activeCustomers: Number(customersResult.activeCustomers) || 0
    };
  }
  async getOrderDetailsForReceipt(orderId, userId) {
    const result = await db.select({
      order: {
        id: orders.id,
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
        deliveredAt: orders.deliveredAt,
        quantity: orders.quantity,
        type: orders.type,
        unitPrice: orders.unitPrice,
        totalAmount: orders.totalAmount,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        status: orders.status,
        notes: orders.notes
      },
      product: {
        name: products.name,
        weight: products.weight
      },
      customer: {
        name: users.name,
        email: users.email,
        phone: users.phone
      },
      address: {
        street: addresses.street,
        city: addresses.city,
        province: addresses.province,
        zipCode: addresses.zipCode
      }
    }).from(orders).innerJoin(users, eq(orders.customerId, users.id)).leftJoin(products, eq(orders.productId, products.id)).leftJoin(addresses, eq(orders.addressId, addresses.id)).where(and(
      eq(orders.id, orderId),
      eq(orders.customerId, userId)
      // Ensure user can only access their own orders
    )).limit(1);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  }
  // Delivery Schedules
  async getDeliverySchedules(userId) {
    return await db.select().from(deliverySchedules).where(eq(deliverySchedules.userId, userId)).orderBy(desc(deliverySchedules.createdAt));
  }
  async getAllDeliverySchedules() {
    return await db.select().from(deliverySchedules).orderBy(desc(deliverySchedules.nextDelivery));
  }
  async getDeliveryScheduleById(id) {
    const result = await db.select().from(deliverySchedules).where(eq(deliverySchedules.id, id)).limit(1);
    return result[0];
  }
  async createDeliverySchedule(schedule) {
    const result = await db.insert(deliverySchedules).values(schedule).returning();
    return result[0];
  }
  async updateDeliverySchedule(id, updates) {
    const result = await db.update(deliverySchedules).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(deliverySchedules.id, id)).returning();
    return result[0];
  }
  async deleteDeliverySchedule(id) {
    const result = await db.delete(deliverySchedules).where(eq(deliverySchedules.id, id)).returning();
    return result.length > 0;
  }
  async updateUserEmailVerification(id, verified) {
    const result = await db.update(users).set({
      emailVerified: verified,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async setEmailVerificationToken(id, token, expires) {
    const result = await db.update(users).set({
      emailVerificationToken: token,
      emailVerificationExpires: expires,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getUserByVerificationToken(token) {
    const result = await db.select().from(users).where(and(
      eq(users.emailVerificationToken, token),
      gt(users.emailVerificationExpires, /* @__PURE__ */ new Date())
    )).limit(1);
    return result[0];
  }
  async clearEmailVerificationToken(id) {
    const result = await db.update(users).set({
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async setPasswordResetToken(id, token, expires) {
    const result = await db.update(users).set({
      passwordResetToken: token,
      passwordResetExpires: expires,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getUserByPasswordResetToken(token) {
    const result = await db.select().from(users).where(and(
      eq(users.passwordResetToken, token),
      gt(users.passwordResetExpires, /* @__PURE__ */ new Date())
    )).limit(1);
    return result[0];
  }
  async clearPasswordResetToken(id) {
    const result = await db.update(users).set({
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async seedData() {
    try {
      const testResult = await db.select().from(users).limit(1);
      console.log("Database connection test:", testResult.length, "users found");
      const adminResult = await db.select().from(users).where(eq(users.email, "admin@gasflow.com")).limit(1);
      if (adminResult.length === 0) {
        const adminUser = await this.createUser({
          email: "admin@gasflow.com",
          password: "admin123",
          name: "Admin User",
          role: "admin",
          phone: "+63 912 345 6789"
        });
        await this.updateUserEmailVerification(adminUser.id, true);
        console.log("Admin user created and verified");
      } else {
        console.log("Admin user already exists");
      }
    } catch (error) {
      console.error("Database connection or seeding error:", error);
      return;
    }
    const customerExists = await this.getUserByEmail("customer@demo.com");
    let customerId;
    if (!customerExists) {
      const customerUser = await this.createUser({
        email: "customer@demo.com",
        password: "demo123",
        name: "John Doe",
        role: "customer",
        phone: "+63 917 123 4567"
      });
      await this.updateUserEmailVerification(customerUser.id, true);
      customerId = customerUser.id;
    } else {
      customerId = customerExists.id;
    }
    const existingAddresses = await this.getUserAddresses(customerId);
    if (existingAddresses.length === 0) {
      await this.createAddress({
        userId: customerId,
        label: "Home",
        street: "123 Mabini Street, Barangay San Jose",
        city: "Manila",
        province: "Metro Manila",
        zipCode: "1000",
        coordinates: JSON.stringify({ lat: 14.5995, lng: 120.9842 }),
        isDefault: true
      });
      await this.createAddress({
        userId: customerId,
        label: "Office",
        street: "456 Rizal Avenue, Bonifacio Global City",
        city: "Taguig",
        province: "Metro Manila",
        zipCode: "1634",
        coordinates: JSON.stringify({ lat: 14.5176, lng: 121.0509 }),
        isDefault: false
      });
      await this.createAddress({
        userId: customerId,
        label: "Vacation House",
        street: "789 Beach Road, Poblacion",
        city: "Boracay",
        province: "Aklan",
        zipCode: "5608",
        coordinates: JSON.stringify({ lat: 11.9674, lng: 121.9248 }),
        isDefault: false
      });
    }
    const existingProducts = await this.getProducts();
    if (existingProducts.length === 0) {
      await this.createProduct({
        name: "7kg LPG Tank",
        description: "Compact tank ideal for small families",
        weight: "7kg",
        newPrice: "950.00",
        swapPrice: "650.00",
        stock: 8,
        isActive: true
      });
      await this.createProduct({
        name: "11kg LPG Tank",
        description: "Premium quality LPG tank perfect for home cooking",
        weight: "11kg",
        newPrice: "1200.00",
        swapPrice: "900.00",
        stock: 45,
        isActive: true
      });
      await this.createProduct({
        name: "22kg LPG Tank",
        description: "Heavy-duty tank for commercial use",
        weight: "22kg",
        newPrice: "2400.00",
        swapPrice: "1800.00",
        stock: 2,
        isActive: true
      });
    }
  }
};
var storage = new DrizzleStorage();

// server/email-service.ts
import nodemailer from "nodemailer";
import crypto from "crypto";
var EmailService = class {
  transporter;
  constructor() {
    const config = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || ""
      }
    };
    this.transporter = nodemailer.createTransport(config);
  }
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - GasFlow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to GasFlow!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with GasFlow. Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #007bff;">
            ${verificationUrl}
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; text-align: center;">
            If you didn't create an account with GasFlow, please ignore this email.
          </p>
        </div>
      `
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password - GasFlow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset for your GasFlow account. Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #dc3545;">
            ${resetUrl}
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; text-align: center;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }
};
var emailService = new EmailService();

// server/middleware/security.ts
import { rateLimit } from "express-rate-limit";
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: process.env.NODE_ENV === "development" ? 1e3 : 100,
  // Much higher limit in dev
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: 15 * 60
    // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === "development") {
      return req.path.includes("/@fs/") || req.path.includes("/node_modules/") || req.path.includes(".js") || req.path.includes(".css") || req.path.includes(".map") || req.path.includes("/assets/");
    }
    return false;
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 authentication attempts per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
  // Don't count successful requests
});
var orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 10,
  // Limit each IP to 10 orders per 5 minutes
  message: {
    error: "Too many orders placed, please wait before placing another order.",
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});
var posLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 20,
  // Limit each IP to 20 POS transactions per minute
  message: {
    error: "Too many POS transactions, please slow down.",
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});
var securityHeaders = (req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; frame-ancestors 'none';"
  );
  next();
};
var sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === "string") {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]*>/g, "").trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};
var requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  console.log(`[${timestamp2}] ${req.method} ${req.path} - IP: ${req.ip}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp2}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
};
var fileUploadSecurity = {
  limits: {
    fileSize: 5 * 1024 * 1024,
    // 5MB max file size
    files: 1
    // Max 1 file per request
  },
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf"
  ],
  sanitizeFilename: (filename) => {
    return filename.replace(/[^a-zA-Z0-9\-_\.]/g, "").substring(0, 100);
  }
};

// server/routes.ts
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.use(securityHeaders);
  app2.use(sanitizeInput);
  app2.use(requestLogger);
  app2.use(generalLimiter);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, req) => {
    console.log("WebSocket connection established");
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth") {
          const token = message.token;
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await storage.getUserById(decoded.userId);
            if (user) {
              clients.set(user.id, ws);
              ws.send(JSON.stringify({ type: "auth_success", userId: user.id }));
            }
          } catch (error) {
            ws.send(JSON.stringify({ type: "auth_error", message: "Invalid token" }));
          }
        }
        if (message.type === "chat_message") {
        }
        if (message.type === "order_update") {
          const order = await storage.getOrderById(message.orderId);
          if (order) {
            const customerWs = clients.get(order.customerId);
            if (customerWs && customerWs.readyState === WebSocket.OPEN) {
              customerWs.send(JSON.stringify({
                type: "order_status_update",
                order
              }));
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      for (const [userId, client] of Array.from(clients.entries())) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });
  try {
    await storage.seedData();
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
  app2.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.emailVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
          emailVerified: false,
          email: user.email
        });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      const verificationToken = emailService.generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await storage.setEmailVerificationToken(user.id, verificationToken, tokenExpires);
      try {
        await emailService.sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
      res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        phone: req.user.phone,
        avatar: req.user.avatar,
        emailVerified: req.user.emailVerified
      }
    });
  });
  app2.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      await storage.updateUserEmailVerification(user.id, true);
      res.json({
        message: "Email verified successfully! You can now log in to your account.",
        verified: true
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  app2.post("/api/auth/resend-verification", authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      const verificationToken = emailService.generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await storage.setEmailVerificationToken(user.id, verificationToken, tokenExpires);
      try {
        await emailService.sendVerificationEmail(user.email, verificationToken);
        res.json({ message: "Verification email sent successfully" });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });
  app2.put("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const isValid = await bcrypt2.compare(currentPassword, req.user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      const user = await storage.updateUser(req.user.id, { password: hashedPassword });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }
      const resetToken = emailService.generatePasswordResetToken();
      const tokenExpires = new Date(Date.now() + 60 * 60 * 1e3);
      await storage.setPasswordResetToken(user.id, resetToken, tokenExpires);
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
        res.json({ message: "Password reset email sent successfully" });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        res.status(500).json({ message: "Failed to send password reset email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const user = await storage.getUserByPasswordResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      const updatedUser = await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/users/addresses", authenticateToken, async (req, res) => {
    try {
      const addresses2 = await storage.getUserAddresses(req.user.id);
      res.json(addresses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  app2.post("/api/users/addresses", authenticateToken, async (req, res) => {
    try {
      const addressData = insertAddressSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const address = await storage.createAddress(addressData);
      res.status(201).json(address);
    } catch (error) {
      res.status(400).json({ message: "Invalid address data" });
    }
  });
  app2.put("/api/users/addresses/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const address = await storage.updateAddress(id, updates);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: "Failed to update address" });
    }
  });
  app2.delete("/api/users/addresses/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAddress(id);
      if (!success) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete address" });
    }
  });
  app2.put("/api/users/me", authenticateToken, async (req, res) => {
    try {
      const { name, phone } = req.body;
      const updates = {};
      if (name !== void 0) updates.name = name;
      if (phone !== void 0) updates.phone = phone;
      const user = await storage.updateUser(req.user.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });
  app2.put("/api/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const product = await storage.updateProduct(id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("DELETE route called for product:", id);
      const product = await storage.getProduct(id);
      console.log("Product lookup result:", product);
      if (!product) {
        console.log("Product not found");
        return res.status(404).json({ message: "Product not found" });
      }
      console.log("Calling storage.deleteProduct");
      const success = await storage.deleteProduct(id);
      console.log("Storage delete result:", success);
      if (!success) {
        console.log("Storage delete returned false");
        return res.status(500).json({ message: "Failed to delete product" });
      }
      console.log("Delete successful");
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Route error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cartItems2 = await storage.getCartItems(req.user.id);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cartItemData = {
        ...req.body,
        userId: req.user.id
      };
      const cartItem = await storage.addCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to add item to cart" });
    }
  });
  app2.put("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeCartItem(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(400).json({ message: "Failed to remove item from cart" });
    }
  });
  app2.delete("/api/cart", authenticateToken, async (req, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      let orders2;
      if (req.user.role === "admin") {
        orders2 = await storage.getOrders();
      } else {
        orders2 = await storage.getOrdersByCustomer(req.user.id);
      }
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        customerId: req.user.id
      });
      const order = await storage.createOrder(orderData);
      await storage.clearCart(req.user.id);
      await storage.createNotification({
        userId: req.user.id,
        title: "Order Placed",
        message: `Your order ${order.orderNumber} has been placed successfully.`,
        type: "order_update",
        data: { orderId: order.id }
      });
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:id/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      await storage.createNotification({
        userId: order.customerId,
        title: "Order Update",
        message: `Your order ${order.orderNumber} status has been updated to ${status}.`,
        type: "order_update",
        data: { orderId: order.id }
      });
      const customerWs = clients.get(order.customerId);
      if (customerWs && customerWs.readyState === WebSocket.OPEN) {
        customerWs.send(JSON.stringify({
          type: "order_status_update",
          order
        }));
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/admin/addresses", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const addresses2 = await storage.getAllAddressesWithUsers();
      res.json(addresses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  app2.get("/api/admin/orders/tracking", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getOrdersWithLocationData();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders for tracking" });
    }
  });
  app2.get("/api/chat/messages", authenticateToken, async (req, res) => {
    try {
      const { orderId } = req.query;
      const messages = await storage.getChatMessages(req.user.id, orderId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/chat/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user.id
      };
      if (req.user.role === "customer" && !messageData.receiverId) {
        const adminUser = await storage.getUserByEmail("admin@gasflow.com");
        if (adminUser) {
          messageData.receiverId = adminUser.id;
        } else {
          try {
            const fallbackAdmin = await storage.createUser({
              email: "admin@gasflow.com",
              password: "admin123",
              name: "Admin User",
              role: "admin",
              phone: "+63 912 345 6789"
            });
            await storage.updateUserEmailVerification(fallbackAdmin.id, true);
            messageData.receiverId = fallbackAdmin.id;
          } catch (error) {
            console.error("Failed to create fallback admin user:", error);
            return res.status(500).json({ message: "Unable to send message - admin user not available" });
          }
        }
      }
      const message = await storage.createChatMessage(messageData);
      if (messageData.receiverId) {
        const receiverWs = clients.get(messageData.receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify({
            type: "new_message",
            message
          }));
        }
      }
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Failed to create message" });
    }
  });
  app2.post("/api/chat/messages/read", authenticateToken, async (req, res) => {
    try {
      await storage.markMessagesAsRead(req.user.id);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });
  app2.put("/api/chat/messages/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const updatedMessage = await storage.updateChatMessage(id, req.user.id, message.trim());
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found or not authorized to edit" });
      }
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message" });
    }
  });
  app2.delete("/api/chat/messages/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteChatMessage(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found or not authorized to delete" });
      }
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });
  app2.delete("/api/chat/messages/:id/unsend", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.unsendChatMessage(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found or not authorized to unsend" });
      }
      res.json({ message: "Message unsent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsend message" });
    }
  });
  app2.get("/api/chat/customers", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const customers = await storage.getChatCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat customers" });
    }
  });
  app2.get("/api/chat/conversation/:customerId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { customerId } = req.params;
      const messages = await storage.getConversationMessages(customerId, req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation messages" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifications2 = await storage.getUserNotifications(req.user.id);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.delete("/api/notifications/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteNotification(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found or not authorized to delete" });
      }
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete notification" });
    }
  });
  app2.get("/api/orders/:id/receipt", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const orderDetails = await storage.getOrderDetailsForReceipt(id, req.user.id);
      if (!orderDetails) {
        return res.status(404).json({ message: "Order not found or access denied" });
      }
      res.json(orderDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order details for receipt" });
    }
  });
  app2.get("/api/analytics/dashboard", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/schedules", authenticateToken, async (req, res) => {
    try {
      const schedules = await storage.getDeliverySchedules(req.user.id);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/schedules", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const schedules = await storage.getAllDeliverySchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/schedules", authenticateToken, async (req, res) => {
    try {
      const scheduleData = {
        ...req.body,
        userId: req.user.id
      };
      const schedule = await storage.createDeliverySchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/schedules/:id", authenticateToken, async (req, res) => {
    try {
      const schedule = await storage.updateDeliverySchedule(req.params.id, req.body);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/schedules/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteDeliverySchedule(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/pos/sale", posLimiter, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { customerId, items, totalAmount, paymentMethod, amountPaid, change } = req.body;
      let addressId = "pos-default";
      if (customerId) {
        const addresses2 = await storage.getUserAddresses(customerId);
        if (addresses2 && addresses2.length > 0) {
          addressId = addresses2[0].id;
        }
      }
      const orderData = {
        customerId: customerId || "walk-in-customer",
        productId: items[0].productId,
        // Main product
        addressId,
        // Use default or customer's address
        quantity: items.reduce((sum2, item) => sum2 + item.quantity, 0),
        type: items[0].type,
        unitPrice: (totalAmount / items.reduce((sum2, item) => sum2 + item.quantity, 0)).toString(),
        totalAmount: totalAmount.toString(),
        status: "delivered",
        // POS sales are immediate
        paymentMethod,
        notes: `POS Sale - ${paymentMethod}${paymentMethod === "cash" ? ` | Paid: \u20B1${amountPaid} | Change: \u20B1${change}` : ""}`
      };
      const order = await storage.createOrder(orderData);
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.updateProduct(item.productId, {
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }
      res.status(201).json({
        success: true,
        orderId: order.id,
        receiptNumber: order.orderNumber
      });
    } catch (error) {
      console.error("POS sale error:", error);
      res.status(500).json({ message: error.message || "Failed to process sale" });
    }
  });
  app2.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const role = req.query.role;
      const users2 = await storage.getAllUsers();
      const filteredUsers = role ? users2.filter((user) => user.role === role) : users2;
      res.json(filteredUsers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    }
  });
  app2.post("/api/upload/image", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(req.file.originalname)}`;
      res.json({
        message: "Image uploaded successfully",
        imageUrl,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: error.message || "Failed to upload image" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    hmr: {
      host: "0.0.0.0"
    },
    headers: {
      "X-Frame-Options": "ALLOWALL",
      "Content-Security-Policy": "frame-ancestors *;"
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
