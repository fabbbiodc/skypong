import {
  AdvancedDynamicTexture,
  TextBlock,
  StackPanel,
  Control,
} from "@babylonjs/gui";
import { GUI_STYLES } from "../config/GUIStyles";
import {
  UITexts,
  Language,
  HUDTexts,
  ControlHintTexts,
} from "../config/UITexts";
import { GUIElements } from "./GUIElements";
import { touchDetection } from "../utils/touchDetection";
import { GameMode } from "../types/GameSessionConfig";

export class GameHUD {
  private _player1Container: StackPanel;
  private _player2Container: StackPanel;

  private _player1Text: TextBlock;
  private _player2Text: TextBlock;
  private _player1ScoreText: TextBlock;
  private _player2ScoreText: TextBlock;
  private _countdownText: TextBlock;
  private _controlHintTexts: TextBlock[] = [];

  private _player1Name: string;
  private _player2Name: string;
  private _player1Score: number = 0;
  private _player2Score: number = 0;
  private _isMobile: boolean;
  private _texts: HUDTexts;
  private _winningScore: string;
  private _scorePopupText: TextBlock;
  private _scorePopupTimeout: any = null;
  private _mobileControlHints: TextBlock[] = [];

  constructor(
    private _texture: AdvancedDynamicTexture,
    language: Language = "en",
    gameMode?: GameMode,
    winningScore: string = "5",
  ) {
    this._isMobile = touchDetection();
    this._texts = UITexts[language].hud;
    this._player1Name = this._texts.player1Default;
    this._player2Name = this._texts.player2Default;
    this._winningScore = winningScore;

    this._player2Container = GUIElements.CreateStackPanel(
      "player2Container",
      GUI_STYLES.CONTAINER.HUD_PLAYER2,
      true,
    );
    this._texture.addControl(this._player2Container);

    const player2TextStyle = this._isMobile
      ? GUI_STYLES.TEXT.HUD_NAME_MOBILE
      : GUI_STYLES.TEXT.HUD_NAME;
    const player2ScoreStyle = this._isMobile
      ? GUI_STYLES.TEXT.HUD_SCORE_MOBILE
      : GUI_STYLES.TEXT.HUD_SCORE;

    this._player2Text = GUIElements.CreateText(
      "player2Text",
      "",
      player2TextStyle,
    );
    this._player2ScoreText = GUIElements.CreateText(
      "player2ScoreText",
      "0/" + this._winningScore,
      player2ScoreStyle,
    );

    this._player2Container.addControl(this._player2Text);
    this._player2Container.addControl(this._player2ScoreText);

    this._player1Container = GUIElements.CreateStackPanel(
      "player1Container",
      GUI_STYLES.CONTAINER.HUD_PLAYER1,
      true,
    );

    if (this._isMobile) {
      this._player1Container.paddingBottom = "100px";
      this._player1Container.top = "0px";
    }

    this._texture.addControl(this._player1Container);

    const player1TextStyle = this._isMobile
      ? GUI_STYLES.TEXT.HUD_NAME_MOBILE
      : GUI_STYLES.TEXT.HUD_NAME;
    const player1ScoreStyle = this._isMobile
      ? GUI_STYLES.TEXT.HUD_SCORE_MOBILE
      : GUI_STYLES.TEXT.HUD_SCORE;

    this._player1ScoreText = GUIElements.CreateText(
      "player1ScoreText",
      "0/" + this._winningScore,
      player1ScoreStyle,
    );
    this._player1Text = GUIElements.CreateText(
      "player1Text",
      "",
      player1TextStyle,
    );

    this._player1Container.addControl(this._player1ScoreText);
    this._player1Container.addControl(this._player1Text);

    this._countdownText = GUIElements.CreateText(
      "countdownText",
      "",
      GUI_STYLES.TEXT.COUNTDOWN,
    );
    this._texture.addControl(this._countdownText);

    this._scorePopupText = GUIElements.CreateText(
      "scorePopupText",
      "",
      GUI_STYLES.TEXT.SCORE_POPUP,
    );
    this._scorePopupText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this._scorePopupText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this._scorePopupText.isVisible = false;
    this._texture.addControl(this._scorePopupText);

    // Create control hints for non-touch desktop devices
    const isDesktop =
      !this._isMobile &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768;
    if (isDesktop && gameMode) {
      const controlHintTexts: ControlHintTexts = UITexts[language].controlHints;
      const lines: string[] =
        gameMode === "local-2p"
          ? [controlHintTexts.paddleControlP1, controlHintTexts.paddleControlP2]
          : [controlHintTexts.paddleControlSingle];

      lines.forEach((line, i) => {
        const tb = new TextBlock(`controlHint${i}`, line);
        tb.color = GUI_STYLES.TEXT.CONTROL_HINT.color;
        tb.fontSize = GUI_STYLES.TEXT.CONTROL_HINT.fontSize;
        tb.fontFamily = GUI_STYLES.FONT_FAMILY;
        tb.shadowColor = GUI_STYLES.TEXT.CONTROL_HINT.shadowColor!;
        tb.shadowOffsetX = GUI_STYLES.TEXT.CONTROL_HINT.shadowOffsetX!;
        tb.shadowOffsetY = GUI_STYLES.TEXT.CONTROL_HINT.shadowOffsetY!;
        tb.shadowBlur = GUI_STYLES.TEXT.CONTROL_HINT.shadowBlur!;
        tb.resizeToFit = true;
        tb.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        tb.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        tb.left = "20px";
        tb.top = `${-60 - (lines.length - 1 - i) * 22}px`;
        tb.isVisible = false;
        this._texture.addControl(tb);
        this._controlHintTexts.push(tb);
      });
    }

    if (this._isMobile && gameMode) {
      const controlHintTexts: ControlHintTexts = UITexts[language].controlHints;
      const tb = new TextBlock("mobileControlHint", controlHintTexts.paddleControlMobile);
      tb.color = GUI_STYLES.TEXT.CONTROL_HINT.color;
      tb.fontSize = GUI_STYLES.TEXT.CONTROL_HINT.fontSize;
      tb.fontFamily = GUI_STYLES.FONT_FAMILY;
      tb.shadowColor = GUI_STYLES.TEXT.CONTROL_HINT.shadowColor!;
      tb.shadowOffsetX = GUI_STYLES.TEXT.CONTROL_HINT.shadowOffsetX!;
      tb.shadowOffsetY = GUI_STYLES.TEXT.CONTROL_HINT.shadowOffsetY!;
      tb.shadowBlur = GUI_STYLES.TEXT.CONTROL_HINT.shadowBlur!;
      tb.resizeToFit = true;
      tb.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      tb.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      tb.left = "20px";
      tb.top = "-60px";
      tb.isVisible = false;
      this._texture.addControl(tb);
      this._mobileControlHints.push(tb);
    }
  }

  public showPauseButton(onClick: () => void): void {
    const iconStyles = this._isMobile
      ? GUI_STYLES.ICON_BUTTON_MOBILE
      : GUI_STYLES.ICON_BUTTON;
    const pauseBtn = GUIElements.CreateIconButton(
      "pauseButton",
      iconStyles.PAUSE,
      onClick,
      () => {},
    );
    pauseBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    pauseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    pauseBtn.top = "20px";
    pauseBtn.left = "-20px";
    this._texture.addControl(pauseBtn);
  }

  public show(player1Name: string, player2Name: string): void {
    this._player1Name = player1Name;
    this._player2Name = player2Name;

    this._player1Text.text = player1Name;
    this._player2Text.text = player2Name;

    this._player1Container.isVisible = true;
    this._player2Container.isVisible = true;
    this._countdownText.isVisible = false;

    this._controlHintTexts.forEach((tb) => (tb.isVisible = true));
    this._mobileControlHints.forEach((tb) => (tb.isVisible = true));
  }

  public hide(): void {
    this._player1Container.isVisible = false;
    this._player2Container.isVisible = false;
    this._countdownText.isVisible = false;
    this._scorePopupText.isVisible = false;

    this._controlHintTexts.forEach((tb) => (tb.isVisible = false));
    this._mobileControlHints.forEach((tb) => (tb.isVisible = false));
  }

  public updateCountdown(text: string): void {
    this._countdownText.text = text;
    this._countdownText.isVisible = text !== "";
  }

  public updatePlayerNames(player1Name: string, player2Name: string): void {
    this._player1Name = player1Name;
    this._player2Name = player2Name;
    this._player1Text.text = player1Name;
    this._player2Text.text = player2Name;
  }

  public updatePlayerColors(player1Color: string, player2Color: string): void {
    this._player1Text.color = player1Color;
    this._player2Text.color = player2Color;
  }

  public updateScores(
    player1Score: number,
    player2Score: number,
    winningScore: string,
  ): void {
    if (typeof player1Score !== "number" || typeof player2Score !== "number") {
      console.warn(
        "[GameHUD] updateScores called with invalid values:",
        player1Score,
        player2Score,
      );
      return;
    }
    this._player1Score = player1Score;
    this._player2Score = player2Score;
    this._player1ScoreText.text = player1Score.toString() + "/" + winningScore;
    this._player2ScoreText.text = player2Score.toString() + "/" + winningScore;
  }

  public getScores(): { player1Score: number; player2Score: number } {
    return {
      player1Score: this._player1Score,
      player2Score: this._player2Score,
    };
  }

  public showScorePopup(playerName: string, color: string): void {
    if (this._scorePopupTimeout) {
      clearTimeout(this._scorePopupTimeout);
    }

    this._scorePopupText.text = `${playerName} ${this._texts.scoresText}`;
    this._scorePopupText.color = color;
    this._scorePopupText.alpha = 1;
    this._scorePopupText.isVisible = true;

    this._scorePopupTimeout = setTimeout(() => {
      this._scorePopupText.isVisible = false;
    }, 1500);
  }
}
