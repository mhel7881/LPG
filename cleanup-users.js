#!/usr/bin/env node

/**
 * Cleanup script to remove all user accounts except admin and demo accounts
 * Run this script when the database is accessible
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { users } from "./shared/schema.js";

async function cleanupUsers() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.log("Please set DATABASE_URL in your .env file");
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    console.log("🔍 Checking database connection...");

    // Test connection
    await db.select().from(users).limit(1);
    console.log("✅ Database connection successful");

    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`📊 Found ${allUsers.length} total users`);

    // Filter users to keep (admin and demo)
    const usersToKeep = allUsers.filter(user =>
      user.email === 'admin@gasflow.com' ||
      user.email === 'customer@demo.com'
    );

    // Filter users to delete
    const usersToDelete = allUsers.filter(user =>
      user.email !== 'admin@gasflow.com' &&
      user.email !== 'customer@demo.com'
    );

    console.log(`✅ Users to keep: ${usersToKeep.length}`);
    console.log(`🗑️  Users to delete: ${usersToDelete.length}`);

    if (usersToDelete.length === 0) {
      console.log("🎉 No users to delete. Database is already clean!");
      return;
    }

    // Show users that will be deleted
    console.log("\n🚨 Users that will be DELETED:");
    usersToDelete.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Show users that will be kept
    console.log("\n✅ Users that will be KEPT:");
    usersToKeep.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Ask for confirmation (in a real script, you'd use readline)
    console.log("\n⚠️  WARNING: This action cannot be undone!");
    console.log("Make sure you have backed up your database if needed.");

    // For now, just show what would be deleted
    console.log("\n🔧 To actually delete the users, uncomment the deletion code below:");

    console.log(`
// Delete users (uncomment to run):
for (const user of usersToDelete) {
  await db.delete(users).where(eq(users.id, user.id));
  console.log(\`Deleted user: \${user.name} (\${user.email})\`);
}
    `);

    console.log(`\n📝 Summary:`);
    console.log(`   - Admin account: ${usersToKeep.find(u => u.email === 'admin@gasflow.com')?.name || 'Not found'}`);
    console.log(`   - Demo account: ${usersToKeep.find(u => u.email === 'customer@demo.com')?.name || 'Not found'}`);
    console.log(`   - Users to delete: ${usersToDelete.length}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("password authentication failed")) {
      console.log("💡 Tip: Check your DATABASE_URL and database credentials");
    }
  } finally {
    await sql.end();
  }
}

// Run the cleanup
cleanupUsers().catch(console.error);