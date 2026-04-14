import { CLIENT_TIMING } from "../config";

export interface CountdownManagerConfig {
    onCountdownUpdate: (count: number) => void;
    onCountdownComplete: () => void;
}

export class CountdownManager {
    private _onCountdownUpdate: (count: number) => void;
    private _onCountdownComplete: () => void;
    private _intervalId: number | null = null;

    constructor(config: CountdownManagerConfig) {
        this._onCountdownUpdate = config.onCountdownUpdate;
        this._onCountdownComplete = config.onCountdownComplete;
    }

    public start(initialCount: number = CLIENT_TIMING.COUNTDOWN.DURATION_SECONDS): void {
        let currentCount = initialCount;

        this._onCountdownUpdate(currentCount);

        this._intervalId = window.setInterval(() => {
            currentCount--;

            if (currentCount > 0) {
                this._onCountdownUpdate(currentCount);
            } else {
                this.stop();
                this._onCountdownUpdate(0);
                this._onCountdownComplete();
            }
        }, CLIENT_TIMING.COUNTDOWN.INTERVAL_MS);
    }

    public stop(): void {
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    public dispose(): void {
        this.stop();
    }
}
