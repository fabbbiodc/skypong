import { Vector3 } from "@babylonjs/core";

/**
 * Manages player input state across all connected clients
 * Collects keyboard inputs and provides aggregated movement vectors
 */
export class InputManager {
    private inputMap: Record<string, any> = {};
    private moveDirection: Vector3 = new Vector3(0, 0, 0); // Cached to avoid allocation

    setInput(sessionId: string, data: any): void {
        this.inputMap[sessionId] = data;
    }

    removeInput(sessionId: string): void {
        delete this.inputMap[sessionId];
    }

    getMovementVector(): Vector3 {
        // Reset cached vector instead of creating new one
        this.moveDirection.set(0, 0, 0);

        for (let sessionId in this.inputMap) {
            const inputs = this.inputMap[sessionId];

            if (inputs["w"]) this.moveDirection.z += 1;
            if (inputs["s"]) this.moveDirection.z -= 1;
            if (inputs["a"]) this.moveDirection.x -= 1;
            if (inputs["d"]) this.moveDirection.x += 1;
        }

        return this.moveDirection;
    }

    getPaddle2Movement(): number {
        let direction = 0;

        for (let sessionId in this.inputMap) {
            const inputs = this.inputMap[sessionId];

            if (inputs["j"]) direction -= 1;
            if (inputs["l"]) direction += 1;
        }

        return direction;
    }

    getInputForSession(sessionId: string): any {
        return this.inputMap[sessionId];
    }

    getAllInputs(): Record<string, any> {
        return this.inputMap;
    }

    clear(): void {
        this.inputMap = {};
    }
}
