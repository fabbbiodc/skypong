import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { GUI_STYLES } from "../config/GUIStyles";
import { UITexts, Language, GameOverTexts } from "../config/UITexts";
import { GUIElements } from "./GUIElements";
import { GameSessionConfig } from "../types/GameSessionConfig";

export class GameOverOverlay {
  private _container: ReturnType<typeof GUIElements.CreateContainer>;
  private _titleText: ReturnType<typeof GUIElements.CreateText>;
  private _winnerText: ReturnType<typeof GUIElements.CreateText>;
  private _scoreText: ReturnType<typeof GUIElements.CreateText>;
  private _retryButton: Button | null = null;
  private _backButton: Button;
  private _isVisible: boolean = false;
  private _config: GameSessionConfig;
  private _onRetry: (() => void) | null = null;
  private _texts: GameOverTexts;

  constructor(
    private _texture: AdvancedDynamicTexture,
    private _onBackClick: () => void,
    config: GameSessionConfig,
    onRetry?: () => void,
    language: Language = "en",
  ) {
    this._config = config;
    this._onRetry = onRetry || null;
    this._texts = UITexts[language].gameOver;
    this._container = GUIElements.CreateContainer(
      "gameOverContainer",
      GUI_STYLES.CONTAINER.OVERLAY,
    );
    this._container.isVisible = false;
    this._container.isHitTestVisible = true;
    this._container.zIndex = 100;
    this._container.adaptWidthToChildren = false;
    this._container.adaptHeightToChildren = false;
    this._texture.addControl(this._container);

    const titleStyle = {
      ...GUI_STYLES.TEXT.GAME_OVER_TITLE,
      top: GUI_STYLES.GAME_OVER_POSITIONS.TITLE.top,
    };
    this._titleText = GUIElements.CreateText(
      "gameOverTitle",
      this._texts.title,
      titleStyle,
    );
    this._container.addControl(this._titleText);

    const winnerStyle = {
      ...GUI_STYLES.TEXT.GAME_OVER_WINNER,
      top: GUI_STYLES.GAME_OVER_POSITIONS.WINNER.top,
    };
    this._winnerText = GUIElements.CreateText("winnerText", "", winnerStyle);
    this._container.addControl(this._winnerText);

    const scoreStyle = {
      ...GUI_STYLES.TEXT.GAME_OVER_SCORE,
      top: GUI_STYLES.GAME_OVER_POSITIONS.SCORE.top,
    };
    this._scoreText = GUIElements.CreateText("finalScoreText", "", scoreStyle);
    this._container.addControl(this._scoreText);

    // Show retry button only for local/AI modes (not for online modes)
    const showRetryButton = [
      "ai-easy",
      "ai-medium",
      "ai-hard",
      "local-2p",
    ].includes(this._config.gameMode);

    if (showRetryButton && this._onRetry) {
      const retryButtonStyle = {
        ...GUI_STYLES.BUTTON.DEFAULT,
        top: "100px",
        zIndex: 101,
      };
      this._retryButton = GUIElements.CreateTextButton(
        "retryButton",
        this._texts.playAgain,
        retryButtonStyle,
        () => {
          // console.log('[GameOverOverlay] Retry button clicked');
          if (this._onRetry) {
            this._onRetry();
          }
        },
      );
      this._container.addControl(this._retryButton);
    }

    const buttonStyle = {
      ...GUI_STYLES.BUTTON.DEFAULT,
      top: "180px",
      zIndex: 101,
    };
    this._backButton = GUIElements.CreateTextButton(
      "backButton",
      this._texts.backToMenu,
      buttonStyle,
      () => {
        // console.log('[GameOverOverlay] Back button clicked');
        this._onBackClick();
      },
    );
    this._container.addControl(this._backButton);
  }

  public show(
    winnerName: string,
    isWinnerPlayer1: boolean,
    player1Score: number,
    player2Score: number,
    player1Name: string,
    player2Name: string,
  ): void {
    this._winnerText.text = this._texts.winner.replace(
      "{winnerName}",
      winnerName,
    );

    this._scoreText.text = `${player1Name}: ${player1Score} - ${player2Name}: ${player2Score}`;

    this._container.isVisible = true;
    this._isVisible = true;
  }

  public hide(): void {
    this._container.isVisible = false;
    this._isVisible = false;
  }

  public isVisible(): boolean {
    return this._isVisible;
  }

  public dispose(): void {
    this._container.dispose();
  }
}
