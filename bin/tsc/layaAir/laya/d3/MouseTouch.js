/**
 * @private
 */
export class MouseTouch {
    constructor() {
        /**@private */
        this._pressedSprite = null;
        /**@private */
        this._pressedLoopCount = -1;
        /**@private */
        this.sprite = null;
        /**@private */
        this.mousePositionX = 0;
        /**@private */
        this.mousePositionY = 0;
    }
}
