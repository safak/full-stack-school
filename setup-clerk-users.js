/**
 * Setup script to create test users in Clerk with proper metadata
 * Run this after the app is running: node setup-clerk-users.js
 */

const { ClerkClient } = require("@clerk/backend");

const clerkClient = new ClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function setupUsers() {
  console.log("🚀 Setting up test users in Clerk...\n");

  const users = [
    {
      username: "admin1",
      password: "Admin@123456",
      email: "admin1@school.com",
      firstName: "Admin",
      lastName: "One",
      role: "admin",
    },
    {
      username: "teacher1",
      password: "Teacher@123456",
      email: "teacher1@school.com",
      firstName: "John",
      lastName: "Teacher",
      role: "teacher",
    },
    {
      username: "student1",
      password: "Student@123456",
      email: "student1@school.com",
      firstName: "John",
      lastName: "Student",
      role: "student",
    },
    {
      username: "parent1",
      password: "Parent@123456",
      email: "parent1@school.com",
      firstName: "Jane",
      lastName: "Parent",
      role: "parent",
    },
  ];

  for (const userData of users) {
    try {
      // Try to create user
      const user = await clerkClient.users.createUser({
        username: userData.username,
        password: userData.password,
        emailAddress: [userData.email],
        firstName: userData.firstName,
        lastName: userData.lastName,
        publicMetadata: {
          role: userData.role,
        },
      });

      console.log(
        `✅ Created ${userData.role}: ${userData.username} (${userData.email})`
      );
      console.log(`   Password: ${userData.password}\n`);
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log(
          `⚠️  User ${userData.username} already exists, skipping...\n`
        );
      } else {
        console.error(
          `❌ Error creating ${userData.username}:`,
          error.message,
          "\n"
        );
      }
    }
  }

  console.log("\n✨ Setup complete!\n");
  console.log("📝 Test Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  users.forEach((user) => {
    console.log(`\n${user.role.toUpperCase()}:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Email: ${user.email}`);
  });
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

setupUsers().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
