import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface SnowfallPreferences {
    enabled: boolean;
    color: string;
}

/**
 * GET /api/snowfall/preferences
 * Retrieves snowfall preferences from cookies
 */
export async function GET() {
    try {
        const cookieStore = await cookies();

        // Default to enabled if no cookie exists
        const enabledCookie = cookieStore.get("snowfall_enabled")?.value;
        const enabled = enabledCookie === undefined ? true : enabledCookie === "true";
        const color = cookieStore.get("snowfall_color")?.value || "#FFFAFA";

        return NextResponse.json({
            enabled,
            color,
        });
    } catch (error) {
        console.error("Error getting snowfall preferences:", error);
        return NextResponse.json(
            { success: false, error: "Failed to get preferences" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/snowfall/preferences
 * Saves snowfall preferences to cookies
 * Body: { enabled: boolean, color?: string }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { enabled, color } = body as Partial<SnowfallPreferences>;

        const cookieStore = await cookies();

        // Set enabled/disabled state
        if (typeof enabled === "boolean") {
            cookieStore.set("snowfall_enabled", enabled.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 365, // 1 year
                path: "/",
            });
        }

        // Set color if provided
        if (color && typeof color === "string") {
            // Basic validation for hex color
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            const validColor = hexColorRegex.test(color) ? color : "#FFFAFA";

            cookieStore.set("snowfall_color", validColor, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 365, // 1 year
                path: "/",
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error setting snowfall preferences:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save preferences" },
            { status: 500 }
        );
    }
}
