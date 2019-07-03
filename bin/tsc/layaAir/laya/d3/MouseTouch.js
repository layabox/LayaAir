/**
 * @internal
 */
export class MouseTouch {
    constructor() {
        /**@internal */
        this._pressedSprite = null;
        /**@internal */
        this._pressedLoopCount = -1;
        /**@internal */
        this.sprite = null;
        /**@internal */
        this.mousePositionX = 0;
        /**@internal */
        this.mousePositionY = 0;
    }
}
