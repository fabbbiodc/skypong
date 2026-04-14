import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { GUI_STYLES } from "../config/GUIStyles";
import { UITexts, Language, PauseTexts } from "../config/UITexts";
import { GUIElements } from "./GUIElements";

export class PauseOverlay {
  private _container: ReturnType<typeof GUIElements.CreateContainer>;
  private _titleText: ReturnType<typeof GUIElements.CreateText>;
  private _resumeButton: Button;
  private _quitButton: Button;
  private _isVisible: boolean = false;
  private _texts: PauseTexts;

  constructor(
    private _texture: AdvancedDynamicTexture,
    private _onResume: () => void,
    private _onQuit: () => void,
    language: Language = "en",
  ) {
    this._texts = UITexts[language].pause;
    this._container = GUIElements.CreateContainer(
      "pauseContainer",
      GUI_STYLES.CONTAINER.OVERLAY,
    );
    this._container.isVisible = false;
    this._container.zIndex = 100;
    this._container.adaptWidthToChildren = false;
    this._container.adaptHeightToChildren = false;
    this._texture.addControl(this._container);

    const titleStyle = {
      ...GUI_STYLES.PAUSE_TITLE,
      top: GUI_STYLES.PAUSE_POSITIONS.TITLE.top,
    };
    this._titleText = GUIElements.CreateText(
      "pauseTitle",
      this._texts.title,
      titleStyle,
    );
    this._container.addControl(this._titleText);

    const resumeStyle = {
      ...GUI_STYLES.BUTTON.DEFAULT,
      ...GUI_STYLES.PAUSE_POSITIONS.RESUME_BUTTON,
      zIndex: 101,
    };
    this._resumeButton = GUIElements.CreateTextButton(
      "resumeButton",
      this._texts.resume,
      resumeStyle,
      () => this._onResume(),
    );
    this._container.addControl(this._resumeButton);
    const quitStyle = {
      ...GUI_STYLES.BUTTON.DEFAULT,
      ...GUI_STYLES.PAUSE_POSITIONS.QUIT_BUTTON,
      zIndex: 101,
    };
    this._quitButton = GUIElements.CreateTextButton(
      "quitButton",
      this._texts.quitToMenu,
      quitStyle,
      () => this._onQuit(),
    );
    this._container.addControl(this._quitButton);
  }
  public show(): void {
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
