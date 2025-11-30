import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to add role metadata to a Clerk user
 * POST /api/admin/setup
 * Body: { userId: "user_xxx", role: "admin" | "teacher" | "student" | "parent" }
 */

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "teacher", "student", "parent"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Update user with role metadata
    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role,
      },
    });

    return NextResponse.json(
      {
        message: "User role updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.emailAddresses[0]?.emailAddress,
          role: role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
