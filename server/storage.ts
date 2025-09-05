import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, or, count, sum, sql as drizzleSql, gt } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Address,
  type InsertAddress,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  type ChatMessage,
  type InsertChatMessage,
  type Notification,
  type InsertNotification,
  type DeliverySchedule,
  type InsertDeliverySchedule,
  users,
  addresses,
  products,
  orders,
  cartItems,
  chatMessages,
  notifications,
  deliverySchedules
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Users
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Auth
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Addresses
  getUserAddresses(userId: string): Promise<Address[]>;
  getAllAddressesWithUsers(): Promise<any[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, updates: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: string, stock: number): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrdersWithLocationData(): Promise<any[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Cart
  getCartItems(userId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Chat
  getChatMessages(userId: string, orderId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessage(messageId: string, userId: string, newMessage: string): Promise<ChatMessage | null>;
  deleteChatMessage(messageId: string, userId: string): Promise<boolean>;
  unsendChatMessage(messageId: string, userId: string): Promise<boolean>;
  markMessagesAsRead(userId: string): Promise<boolean>;
  
  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  deleteNotification(id: string, userId: string): Promise<boolean>;
  
  // Delivery Schedules
  getDeliverySchedules(userId: string): Promise<DeliverySchedule[]>;
  getAllDeliverySchedules(): Promise<DeliverySchedule[]>;
  getDeliveryScheduleById(id: string): Promise<DeliverySchedule | undefined>;
  createDeliverySchedule(schedule: InsertDeliverySchedule): Promise<DeliverySchedule>;
  updateDeliverySchedule(id: string, updates: Partial<InsertDeliverySchedule>): Promise<DeliverySchedule | undefined>;
  deleteDeliverySchedule(id: string): Promise<boolean>;
  
  // Analytics
  getDashboardStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    pendingOrders: number;
    activeCustomers: number;
  }>;
  
  // Receipt
  getOrderDetailsForReceipt(orderId: string, userId: string): Promise<any>;
  
  // Email verification
  updateUserEmailVerification(id: string, verified: boolean): Promise<User | undefined>;
  setEmailVerificationToken(id: string, token: string, expires: Date): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  clearEmailVerificationToken(id: string): Promise<User | undefined>;

  // Password reset
  setPasswordResetToken(id: string, token: string, expires: Date): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(id: string): Promise<User | undefined>;

  // Seed data
  seedData(): Promise<void>;
}

export class DrizzleStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const result = await db.update(users).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const result = await db.insert(addresses).values(address).returning();
    return result[0];
  }

  async updateAddress(id: string, updates: Partial<InsertAddress>): Promise<Address | undefined> {
    const result = await db.update(addresses).set(updates).where(eq(addresses.id, id)).returning();
    return result[0];
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return result.length > 0;
  }

  async getAllAddressesWithUsers(): Promise<any[]> {
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
        phone: users.phone,
      }
    })
    .from(addresses)
    .innerJoin(users, eq(addresses.userId, users.id));
    
    // Filter out null coordinates in memory for now
    return result.filter(addr => addr.coordinates != null);
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async updateProductStock(id: string, stock: number): Promise<Product | undefined> {
    const result = await db.update(products).set({
      stock,
      updatedAt: new Date(),
    }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log('Attempting to delete product:', id);
      // First check if product exists
      const existingProduct = await this.getProduct(id);
      console.log('Existing product:', existingProduct);

      if (!existingProduct) {
        console.log('Product not found');
        return false;
      }

      await db.update(products).set({
        isActive: false,
      }).where(eq(products.id, id));
      console.log('Update completed');
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `GF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const result = await db.insert(orders).values({
      ...order,
      orderNumber,
    }).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
    }
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getOrdersWithLocationData(): Promise<any[]> {
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
        phone: users.phone,
      },
      address: {
        id: addresses.id,
        street: addresses.street,
        city: addresses.city,
        province: addresses.province,
        zipCode: addresses.zipCode,
        coordinates: addresses.coordinates,
      }
    })
    .from(orders)
    .innerJoin(users, eq(orders.customerId, users.id))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .orderBy(desc(orders.createdAt));

    // Filter in memory for active orders with coordinates
    return result.filter(order =>
      order.address?.coordinates != null &&
      ['pending', 'processing', 'out_for_delivery'].includes(order.status)
    );
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId),
        eq(cartItems.type, item.type)
      )).limit(1);

    if (existing.length > 0) {
      // Update quantity
      const result = await db.update(cartItems)
        .set({ quantity: (existing[0].quantity || 0) + (item.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Insert new item
      const result = await db.insert(cartItems).values(item).returning();
      return result[0];
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0];
  }

  async removeCartItem(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    return result.length > 0;
  }

  async getChatMessages(userId: string, orderId?: string): Promise<ChatMessage[]> {
    if (orderId) {
      return await db.select().from(chatMessages)
        .where(and(
          eq(chatMessages.orderId, orderId),
          eq(chatMessages.isDeleted, false)
        ))
        .orderBy(chatMessages.createdAt);
    } else {
      return await db.select().from(chatMessages)
        .where(and(
          or(
            eq(chatMessages.senderId, userId),
            eq(chatMessages.receiverId, userId)
          ),
          eq(chatMessages.isDeleted, false)
        ))
        .orderBy(chatMessages.createdAt);
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async updateChatMessage(messageId: string, userId: string, newMessage: string): Promise<ChatMessage | null> {
    const result = await db.update(chatMessages)
      .set({ 
        message: newMessage,
        isEdited: true,
        editedAt: new Date()
      })
      .where(and(
        eq(chatMessages.id, messageId),
        eq(chatMessages.senderId, userId), // Only sender can edit their own messages
        eq(chatMessages.isDeleted, false)
      ))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  async deleteChatMessage(messageId: string, userId: string): Promise<boolean> {
    const result = await db.update(chatMessages)
      .set({ 
        isDeleted: true,
        deletedAt: new Date()
      })
      .where(and(
        eq(chatMessages.id, messageId),
        eq(chatMessages.senderId, userId), // Only sender can delete their own messages
        eq(chatMessages.isDeleted, false)
      ))
      .returning();
    
    return result.length > 0;
  }

  async unsendChatMessage(messageId: string, userId: string): Promise<boolean> {
    // Completely remove the message from database (hard delete)
    const result = await db.delete(chatMessages)
      .where(and(
        eq(chatMessages.id, messageId),
        eq(chatMessages.senderId, userId) // Only sender can unsend their own messages
      ))
      .returning();
    
    return result.length > 0;
  }

  async markMessagesAsRead(userId: string): Promise<boolean> {
    const result = await db.update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.receiverId, userId))
      .returning();
    return result.length > 0;
  }

  // Get list of customers who have sent messages to admin
  async getChatCustomers(): Promise<any[]> {
    // Get the latest message from each customer
    const latestMessages = await db
      .select({
        customerId: chatMessages.senderId,
        maxTime: drizzleSql<string>`max(${chatMessages.createdAt})`.as('max_time')
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(and(
        eq(users.role, 'customer'),
        eq(chatMessages.isDeleted, false)
      ))
      .groupBy(chatMessages.senderId);

    // Then get full details for each customer
    const result: any[] = [];
    for (const item of latestMessages) {
      const customerMessages = await db.select({
        customerId: chatMessages.senderId,
        customer: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
        lastMessage: chatMessages.message,
        lastMessageTime: chatMessages.createdAt,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(and(
        eq(chatMessages.senderId, item.customerId),
        drizzleSql`${chatMessages.createdAt} = ${item.maxTime}::timestamp`,
        eq(chatMessages.isDeleted, false)
      ))
      .limit(1);

      if (customerMessages.length > 0) {
        // Get unread count
        const unreadCount = await db.select({
          count: drizzleSql<number>`count(*)`.as('count')
        })
        .from(chatMessages)
        .where(and(
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
  async getConversationMessages(customerId: string, adminId: string): Promise<ChatMessage[]> {
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
        role: users.role,
      }
    })
    .from(chatMessages)
    .innerJoin(users, eq(chatMessages.senderId, users.id))
    .where(and(
      or(
        and(eq(chatMessages.senderId, customerId), eq(chatMessages.receiverId, adminId)),
        and(eq(chatMessages.senderId, adminId), eq(chatMessages.receiverId, customerId))
      ),
      eq(chatMessages.isDeleted, false)
    ))
    .orderBy(chatMessages.createdAt);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, userId) // Ensure user can only delete their own notifications
      ))
      .returning();
    return result.length > 0;
  }

  async getDashboardStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    pendingOrders: number;
    activeCustomers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesResult] = await db.select({
      totalSales: sum(orders.totalAmount),
      totalOrders: count(orders.id),
    }).from(orders).where(eq(orders.status, 'delivered'));

    const [pendingResult] = await db.select({
      pendingOrders: count(orders.id),
    }).from(orders).where(eq(orders.status, 'pending'));

    const [customersResult] = await db.select({
      activeCustomers: count(users.id),
    }).from(users).where(eq(users.role, 'customer'));

    return {
      totalSales: Number(salesResult.totalSales) || 0,
      totalOrders: Number(salesResult.totalOrders) || 0,
      pendingOrders: Number(pendingResult.pendingOrders) || 0,
      activeCustomers: Number(customersResult.activeCustomers) || 0,
    };
  }

  async getOrderDetailsForReceipt(orderId: string, userId: string): Promise<any> {
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
        notes: orders.notes,
      },
      product: {
        name: products.name,
        weight: products.weight,
      },
      customer: {
        name: users.name,
        email: users.email,
        phone: users.phone,
      },
      address: {
        street: addresses.street,
        city: addresses.city,
        province: addresses.province,
        zipCode: addresses.zipCode,
      }
    })
    .from(orders)
    .innerJoin(users, eq(orders.customerId, users.id))
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(and(
      eq(orders.id, orderId),
      eq(orders.customerId, userId) // Ensure user can only access their own orders
    ))
    .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  // Delivery Schedules
  async getDeliverySchedules(userId: string): Promise<DeliverySchedule[]> {
    return await db.select().from(deliverySchedules)
      .where(eq(deliverySchedules.userId, userId))
      .orderBy(desc(deliverySchedules.createdAt));
  }

  async getAllDeliverySchedules(): Promise<DeliverySchedule[]> {
    return await db.select().from(deliverySchedules)
      .orderBy(desc(deliverySchedules.nextDelivery));
  }

  async getDeliveryScheduleById(id: string): Promise<DeliverySchedule | undefined> {
    const result = await db.select().from(deliverySchedules)
      .where(eq(deliverySchedules.id, id))
      .limit(1);
    return result[0];
  }

  async createDeliverySchedule(schedule: InsertDeliverySchedule): Promise<DeliverySchedule> {
    const result = await db.insert(deliverySchedules)
      .values(schedule)
      .returning();
    return result[0];
  }

  async updateDeliverySchedule(id: string, updates: Partial<InsertDeliverySchedule>): Promise<DeliverySchedule | undefined> {
    const result = await db.update(deliverySchedules)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(deliverySchedules.id, id))
      .returning();
    return result[0];
  }

  async deleteDeliverySchedule(id: string): Promise<boolean> {
    const result = await db.delete(deliverySchedules)
      .where(eq(deliverySchedules.id, id))
      .returning();
    return result.length > 0;
  }

  async updateUserEmailVerification(id: string, verified: boolean): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        emailVerified: verified,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async setEmailVerificationToken(id: string, token: string, expires: Date): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(and(
        eq(users.emailVerificationToken, token),
        gt(users.emailVerificationExpires, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async clearEmailVerificationToken(id: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async setPasswordResetToken(id: string, token: string, expires: Date): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetExpires, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async clearPasswordResetToken(id: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async seedData(): Promise<void> {
    try {
      // Test database connection with a simple query
      const testResult = await db.select().from(users).limit(1);
      console.log('Database connection test:', testResult.length, 'users found');
      
      // Create admin user
      const adminResult = await db.select().from(users).where(eq(users.email, 'admin@gasflow.com')).limit(1);
      if (adminResult.length === 0) {
        const adminUser = await this.createUser({
          email: 'admin@gasflow.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
          phone: '+63 912 345 6789',
        });
        // Mark admin as email verified
        await this.updateUserEmailVerification(adminUser.id, true);
        console.log('Admin user created and verified');
      } else {
        console.log('Admin user already exists');
      }
    } catch (error) {
      console.error('Database connection or seeding error:', error);
      // Don't throw error, let app continue running
      return;
    }

    // Create sample customer
    const customerExists = await this.getUserByEmail('customer@demo.com');
    let customerId: string;
    
    if (!customerExists) {
      const customerUser = await this.createUser({
        email: 'customer@demo.com',
        password: 'demo123',
        name: 'John Doe',
        role: 'customer',
        phone: '+63 917 123 4567',
      });
      // Mark customer as email verified
      await this.updateUserEmailVerification(customerUser.id, true);
      customerId = customerUser.id;
    } else {
      customerId = customerExists.id;
    }

    // Create sample addresses for demo customer
    const existingAddresses = await this.getUserAddresses(customerId);
    if (existingAddresses.length === 0) {
      // Add demo addresses
      await this.createAddress({
        userId: customerId,
        label: 'Home',
        street: '123 Mabini Street, Barangay San Jose',
        city: 'Manila',
        province: 'Metro Manila',
        zipCode: '1000',
        coordinates: JSON.stringify({ lat: 14.5995, lng: 120.9842 }),
        isDefault: true,
      });

      await this.createAddress({
        userId: customerId,
        label: 'Office',
        street: '456 Rizal Avenue, Bonifacio Global City',
        city: 'Taguig',
        province: 'Metro Manila',
        zipCode: '1634',
        coordinates: JSON.stringify({ lat: 14.5176, lng: 121.0509 }),
        isDefault: false,
      });

      await this.createAddress({
        userId: customerId,
        label: 'Vacation House',
        street: '789 Beach Road, Poblacion',
        city: 'Boracay',
        province: 'Aklan',
        zipCode: '5608',
        coordinates: JSON.stringify({ lat: 11.9674, lng: 121.9248 }),
        isDefault: false,
      });
    }

    // Create sample products
    const existingProducts = await this.getProducts();
    if (existingProducts.length === 0) {
      await this.createProduct({
        name: '7kg LPG Tank',
        description: 'Compact tank ideal for small families',
        weight: '7kg',
        newPrice: '950.00',
        swapPrice: '650.00',
        stock: 8,
        isActive: true,
      });

      await this.createProduct({
        name: '11kg LPG Tank',
        description: 'Premium quality LPG tank perfect for home cooking',
        weight: '11kg',
        newPrice: '1200.00',
        swapPrice: '900.00',
        stock: 45,
        isActive: true,
      });

      await this.createProduct({
        name: '22kg LPG Tank',
        description: 'Heavy-duty tank for commercial use',
        weight: '22kg',
        newPrice: '2400.00',
        swapPrice: '1800.00',
        stock: 2,
        isActive: true,
      });
    }
  }
}

export const storage = new DrizzleStorage();
