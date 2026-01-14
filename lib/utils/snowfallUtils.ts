/**
 * Snowfall utility functions for cookie management and color handling
 */

export interface SnowfallPreferences {
    enabled: boolean;
    color: string;
    reminderSet: boolean;
}

export interface SnowfallColor {
    name: string;
    hex: string;
    emoji?: string;
}

/**
 * Default snowfall color palette
 */
export const SNOWFALL_COLORS: SnowfallColor[] = [
    { name: "Snow White", hex: "#FFFAFA", emoji: "❄️" },
    { name: "Ice Blue", hex: "#B0E0E6", emoji: "🧊" },
    { name: "Silver", hex: "#C0C0C0", emoji: "✨" },
    { name: "Gold", hex: "#FFD700", emoji: "⭐" },
    { name: "Rose Pink", hex: "#FFB6C1", emoji: "🌸" },
];

/**
 * Get a cookie value by name from document.cookie
 */
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }

    return null;
}

/**
 * Parse snowfall preferences from cookies
 * Note: This is for client-side use only since cookies are HTTP-only
 * Preferences should be fetched from the API endpoint instead
 */
export function getSnowfallPreferences(): SnowfallPreferences {
    const enabled = getCookie("snowfall_enabled") === "true";
    const color = getCookie("snowfall_color") || "#FFFAFA";
    const reminderSet = getCookie("snowfall_reminder") === "reminded";

    return {
        enabled,
        color,
        reminderSet,
    };
}

/**
 * Validate if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
}

/**
 * Get the default snowfall color
 */
export function getDefaultSnowfallColor(): string {
    return SNOWFALL_COLORS[0].hex;
}

/**
 * Find a color object by hex value
 */
export function findColorByHex(hex: string): SnowfallColor | undefined {
    return SNOWFALL_COLORS.find(
        (color) => color.hex.toLowerCase() === hex.toLowerCase()
    );
}
