/**
 * Logging utility for server-side debug output
 * All debug logging should go through this to allow easy enable/disable
 */

import { SERVER_CONFIG } from "./ServerConfig";

/**
 * Logger class for conditional debug output
 * Logs only when DEBUG_MODE is enabled in SERVER_CONFIG
 */
export class Logger {
    private static readonly DEBUG_MODE: boolean = SERVER_CONFIG.DEBUG_MODE;

    /**
     * Log a debug message (only shown when DEBUG_MODE is true)
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static debug(message: string, ...optionalParams: unknown[]): void {
        if (Logger.DEBUG_MODE) {
            console.log(`[DEBUG] ${message}`, ...optionalParams);
        }
    }

    /**
     * Log an info message (always shown)
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static info(message: string, ...optionalParams: unknown[]): void {
        console.log(`[INFO] ${message}`, ...optionalParams);
    }

    /**
     * Log a warning message (always shown)
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static warn(message: string, ...optionalParams: unknown[]): void {
        console.warn(`[WARN] ${message}`, ...optionalParams);
    }

    /**
     * Log an error message (always shown)
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static error(message: string, ...optionalParams: unknown[]): void {
        console.error(`[ERROR] ${message}`, ...optionalParams);
    }

    /**
     * Log a physics-related debug message
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static physics(message: string, ...optionalParams: unknown[]): void {
        if (Logger.DEBUG_MODE) {
            console.log(`[PHYSICS] ${message}`, ...optionalParams);
        }
    }

    /**
     * Log a goal-related message (always shown - important game events)
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static goal(message: string, ...optionalParams: unknown[]): void {
        console.log(`[GOAL] ${message}`, ...optionalParams);
    }

    /**
     * Log a game over message (always shown - important game events)
     * @param message - The message to log
     * @param optionalParams - Additional parameters to log
     */
    public static gameOver(message: string, ...optionalParams: unknown[]): void {
        console.log(`[GAME OVER] ${message}`, ...optionalParams);
    }
}
