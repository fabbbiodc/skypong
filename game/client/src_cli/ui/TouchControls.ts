import { AdvancedDynamicTexture, Control, StackPanel } from "@babylonjs/gui";
import { InputController } from "src_cli/input/InputController";
import { GUI_STYLES } from "../config/GUIStyles";
import { GUIElements } from "./GUIElements";
import { touchDetection } from "../utils/touchDetection";

export class TouchControls {
  private texture: AdvancedDynamicTexture;
  private container: StackPanel | null = null;
  private controller: InputController | null = null;
  private isMobile: boolean;

  constructor(texture: AdvancedDynamicTexture) {
    this.texture = texture;
    this.isMobile = touchDetection();
  }

  public hideControls(): void {
    if (this.container) {
      this.texture.removeControl(this.container);
      this.container = null;
    }
  }

  public setInputController(controller: InputController): void {
    this.controller = controller;
  }

  public showControls(): void {
    this.container = new StackPanel();
    this.container.isVertical = false;
    this.container.horizontalAlignment =
      GUI_STYLES.TOUCH_CONTAINER.horizontalAlignment;
    this.container.verticalAlignment =
      GUI_STYLES.TOUCH_CONTAINER.verticalAlignment;
    this.container.height = this.isMobile ? "94px" : GUI_STYLES.TOUCH_CONTAINER.height;

    const iconStyles = this.isMobile ? GUI_STYLES.ICON_BUTTON_MOBILE : GUI_STYLES.ICON_BUTTON;

    const leftButton = GUIElements.CreateIconButton(
      "btnLeft",
      iconStyles.LEFT,
      () => this.controller?.pressLeft(),
      () => this.controller?.releaseLeft(),
    );
    leftButton.paddingRight = iconStyles.LEFT.paddingRight ?? "0px";

    const rightButton = GUIElements.CreateIconButton(
      "btnRight",
      iconStyles.RIGHT,
      () => this.controller?.pressRight(),
      () => this.controller?.releaseRight(),
    );
    rightButton.paddingLeft = iconStyles.RIGHT.paddingLeft ?? "0px";

    this.container.addControl(leftButton);
    this.container.addControl(rightButton);

    this.texture.addControl(this.container);
  }
}
