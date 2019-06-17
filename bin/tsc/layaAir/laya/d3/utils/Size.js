import { RenderContext3D } from "../core/render/RenderContext3D";
export class Size {
    constructor(width, height) {
        this._width = 0;
        this._height = 0;
        this._width = width;
        this._height = height;
    }
    static get fullScreen() {
        return new Size(-1, -1);
    }
    get width() {
        if (this._width === -1)
            return RenderContext3D.clientWidth;
        return this._width;
    }
    get height() {
        if (this._height === -1)
            return RenderContext3D.clientHeight;
        return this._height;
    }
}
