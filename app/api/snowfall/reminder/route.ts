import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/snowfall/reminder
 * Sets a cookie to remember that the user clicked "remind me later" on the snowfall notification
 * The notification won't be shown again for 7 days
 */
export async function POST() {
    try {
        const cookieStore = await cookies();

        // Set reminder cookie for 7 days
        cookieStore.set("snowfall_reminder", "reminded", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error setting snowfall reminder:", error);
        return NextResponse.json(
            { success: false, error: "Failed to set reminder" },
            { status: 500 }
        );
    }
}
