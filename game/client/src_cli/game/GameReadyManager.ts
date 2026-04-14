import { RoomManager } from "./RoomManager";
import { CountdownManager } from "./CountdownManager";
import { FreeCamera } from "@babylonjs/core";
import { animateCameraIntro } from "../utils/Camera";

export interface GameReadyManagerConfig {
    roomManager: RoomManager;
    countdownManager: CountdownManager;
    gui: any;
    isPvP: boolean;
    isOnline: boolean;
    initialGameStarted: boolean;
    camera: FreeCamera;
    cameraView: 'angled' | 'top-down';
    onGameReady?: (onLaunch: () => void, isWaitingForOpponent?: boolean) => void | null;
}

export class GameReadyManager {
    private _roomManager: RoomManager;
    private _countdownManager: CountdownManager;
    private _gui: any;
    private _isPvP: boolean;
    private _isOnline: boolean;
    private _gameStarted: boolean;
    private _isWaitingForOpponent: boolean = false;
    private _onGameReady: ((onLaunch: () => void, isWaitingForOpponent?: boolean) => void) | undefined;
    private _savedLaunchCallback: (() => void) | null = null;
    private _hasLaunched: boolean = false;
    private _camera: FreeCamera;
    private _cameraView: 'angled' | 'top-down';

    constructor(config: GameReadyManagerConfig) {
        this._roomManager = config.roomManager;
        this._countdownManager = config.countdownManager;
        this._gui = config.gui;
        this._isPvP = config.isPvP;
        this._isOnline = config.isOnline;
        this._gameStarted = config.initialGameStarted;
        this._onGameReady = config.onGameReady ?? undefined;
        this._camera = config.camera;
        this._cameraView = config.cameraView;
    }

    public start(): void {
        if (this._isOnline) {
            this._roomManager.signalClientReady();
        }

        const isWaitingForOpponent = this._isPvP && !this._gameStarted;
        this._isWaitingForOpponent = isWaitingForOpponent;
        
        const launchCallback = () => this._startCountdown();

        if (isWaitingForOpponent) {
            this._savedLaunchCallback = launchCallback;
            if (this._onGameReady) {
                this._onGameReady(launchCallback, true);
            }
        } else {
            if (this._onGameReady) {
                const cb = this._onGameReady;
                this._onGameReady = undefined;
                cb(launchCallback, false);
            } else {
                launchCallback();
            }
        }
    }

    public signalReady(): void {
        if (this._isOnline) {
            this._roomManager.signalClientReady();
        }
    }

    public isGameStarted(): boolean {
        return this._gameStarted;
    }

    public updateGameStarted(gameStarted: boolean): void {
        this._gameStarted = gameStarted;
        
        if (gameStarted && this._isWaitingForOpponent && this._savedLaunchCallback) {
            this._isWaitingForOpponent = false;
            
            if (this._onGameReady) {
                const cb = this._onGameReady;
                this._onGameReady = undefined;
                cb(this._savedLaunchCallback!, false);
                this._savedLaunchCallback = null;
            } else {
                this._savedLaunchCallback();
                this._savedLaunchCallback = null;
            }
        }
    }

    public triggerCountdown(): void {
        this._startCountdown();
    }

    public dispose(): void {
        this._onGameReady = undefined;
        this._savedLaunchCallback = null;
    }

    private _startCountdown(): void {
        if (this._hasLaunched) return;
        this._hasLaunched = true;

        const isPlayer2 = this._roomManager.isPlayer2;

        animateCameraIntro(this._camera, this._cameraView, isPlayer2, () => {
            this._countdownManager.start();
        });
    }
}
