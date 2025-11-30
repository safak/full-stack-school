/**
 * Set Password for Clerk User
 * This allows you to sign in with email + password
 * Usage: node set-password.js <USER_ID> <NEW_PASSWORD>
 * Example: node set-password.js user_36B1_rSLAsQh61 YourPassword123!
 */

const { ClerkClient } = require("@clerk/backend");

const clerkClient = new ClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function setPassword() {
  const userId = process.argv[2];
  const newPassword = process.argv[3];

  if (!userId || !newPassword) {
    console.error("❌ Error: Missing arguments");
    console.log("\nUsage: node set-password.js <USER_ID> <NEW_PASSWORD>");
    console.log("\nExample:");
    console.log("  node set-password.js user_36B1_rSLAsQh61 MyPassword123!");
    console.log("\nYour User ID: user_36B1_rSLAsQh61");
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters");
    process.exit(1);
  }

  try {
    console.log(`🔐 Setting password for user: ${userId}`);

    const updatedUser = await clerkClient.users.updateUser(userId, {
      password: newPassword,
    });

    console.log("✅ Password set successfully!\n");
    console.log("📧 Sign in with:");
    console.log(`   Email: ${updatedUser.emailAddresses[0]?.emailAddress}`);
    console.log(`   Password: ${newPassword}\n`);
    console.log("🌐 Go to: http://localhost:3000/sign-in");
  } catch (error) {
    console.error("❌ Error setting password:", error.message);
    process.exit(1);
  }
}

setPassword();
