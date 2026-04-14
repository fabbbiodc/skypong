import { Scene, KeyboardEventTypes, Observer, KeyboardInfo } from "@babylonjs/core";

export class InputController {
    private inputMap: { [key: string]: boolean } = {};
    private _keyboardObserver: Observer<KeyboardInfo> | null = null;

    public pressLeft() { this.inputMap['a'] = true; }
    public releaseLeft() { this.inputMap['a'] = false; }
    public pressRight() { this.inputMap['d'] = true; }
    public releaseRight() { this.inputMap['d'] = false; }

    constructor(scene: Scene) {
        this.inputMap = {};

        this._keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            switch (key) {
                case 'a':
                    kbInfo.type == KeyboardEventTypes.KEYDOWN ? this.pressLeft() : this.releaseLeft();
                    break;
                case 'd':
                    kbInfo.type == KeyboardEventTypes.KEYDOWN ? this.pressRight() : this.releaseRight();
                    break;
                case 'j':
                case 'l':
                    this.inputMap[key] = kbInfo.type === KeyboardEventTypes.KEYDOWN;
                    break;
            }
        });
    }

    public getPaddle1InputState() {
        return {
            a: !!this.inputMap['a'], d: !!this.inputMap['d']
        };
    }
    public getPaddle2InputState() {
        return {
            j: !!this.inputMap['j'], l: !!this.inputMap['l']
        };
    }

    public dispose(): void {
        this.inputMap = {};
        this._keyboardObserver = null;
    }
}
