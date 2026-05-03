import {
  Scene,
  KeyboardEventTypes,
  Observer,
  KeyboardInfo,
} from "@babylonjs/core";

export class InputController {
  private inputMap: { [key: string]: boolean } = {};
  private _keyboardObserver: Observer<KeyboardInfo> | null = null;

  public pressLeft() {
    this.inputMap["a"] = true;
  }
  public releaseLeft() {
    this.inputMap["a"] = false;
  }
  public pressRight() {
    this.inputMap["d"] = true;
  }
  public releaseRight() {
    this.inputMap["d"] = false;
  }

  constructor(scene: Scene) {
    this.inputMap = {};

    this._keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
      const key = kbInfo.event.key.toLowerCase();
      const isKeyDown = kbInfo.type === KeyboardEventTypes.KEYDOWN;
      
      switch (key) {
        // Player 1: A/D keys
        case "a":
          this.inputMap["a"] = isKeyDown;
          break;
        case "d":
          this.inputMap["d"] = isKeyDown;
          break;
        // Player 1: W/S keys (alternative)
        case "w":
          this.inputMap["w"] = isKeyDown;
          break;
        case "s":
          this.inputMap["s"] = isKeyDown;
          break;
        // Player 2: J/L keys
        case "j":
          this.inputMap["j"] = isKeyDown;
          break;
        case "l":
          this.inputMap["l"] = isKeyDown;
          break;
        // Player 2: Arrow keys
        case "arrowup":
          this.inputMap["arrowup"] = isKeyDown;
          break;
        case "arrowdown":
          this.inputMap["arrowdown"] = isKeyDown;
          break;
      }
    });
  }

  public getPaddle1InputState() {
    return {
      a: !!this.inputMap["a"],
      d: !!this.inputMap["d"],
      w: !!this.inputMap["w"],
      s: !!this.inputMap["s"],
    };
  }
  public getPaddle2InputState() {
    return {
      j: !!this.inputMap["j"],
      l: !!this.inputMap["l"],
      arrowup: !!this.inputMap["arrowup"],
      arrowdown: !!this.inputMap["arrowdown"],
    };
  }

  public dispose(): void {
    this.inputMap = {};
    this._keyboardObserver = null;
  }
}
