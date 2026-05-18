import { Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock } from "@babylonjs/gui";
import { GameHUD } from "./GameHUD";
import { GameOverOverlay } from "./GameOverOverlay";
import { PauseOverlay } from "./PauseOverlay";
import { GameSessionConfig } from "../types/GameSessionConfig";
import { Language } from "../config/UITexts";

export class GameUIManager {
  public texture: AdvancedDynamicTexture;
  public hud: GameHUD;
  public gameOverOverlay: GameOverOverlay;
  public pauseOverlay: PauseOverlay;
  private _errorPanel: Rectangle | null = null;

  constructor(
    scene: Scene,
    config: GameSessionConfig,
    onBackToMenu: () => void,
    onResume?: () => void,
    onRetry?: () => void,
  ) {
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI(
      "GameUI",
      true,
      scene,
    );

    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      this.texture.idealWidth = 1920;
    }

    if (this.texture.layer) {
      (this.texture.layer as any).renderingGroupId = 2;
    }

    const language: Language = config.language ?? "en";

    this.pauseOverlay = new PauseOverlay(
      this.texture,
      () => {
        this.pauseOverlay.hide();
        if (onResume) onResume();
      },
      () => {
        this.pauseOverlay.hide();
        onBackToMenu();
      },
      language,
    );

    this.hud = new GameHUD(this.texture, language, config.gameMode);
    this.gameOverOverlay = new GameOverOverlay(
      this.texture,
      onBackToMenu,
      config,
      onRetry,
      language,
    );
  }

  public showGameHUD(player1Name: string, player2Name: string): void {
    this.hud.show(player1Name, player2Name);
  }

  public showError(message: string): void {
    if (this._errorPanel) {
      this.texture.removeControl(this._errorPanel);
    }

    this._errorPanel = new Rectangle("errorPanel");
    this._errorPanel.background = "rgba(0, 0, 0, 0.85)";
    this._errorPanel.width = 1;
    this._errorPanel.height = 1;
    this._errorPanel.zIndex = 100;

    const textBlock = new TextBlock("errorText");
    textBlock.text = message;
    textBlock.color = "#ff4444";
    textBlock.fontSize = 24;
    textBlock.fontFamily = "Space Grotesk, sans-serif";
    textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;

    this._errorPanel.addControl(textBlock);
    this.texture.addControl(this._errorPanel);
  }

  public hideAll(): void {
    this.hud.hide();
    this.gameOverOverlay.hide();
    this.pauseOverlay.hide();
  }

  public dispose(): void {
    this.gameOverOverlay.dispose();
    this.pauseOverlay.dispose();
    this.texture.dispose();
  }
}
