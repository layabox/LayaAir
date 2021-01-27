import { Resource } from "./Resource";
/**
	 * @private
	 * <code>Bitmap</code> 图片资源类。
	 */
export class Bitmap extends Resource {
    /**@private */
    protected _width: number;
    /**@private */
    protected _height: number;

    /**
     * 获取宽度。
     */
    get width(): number {
        return this._width;
    }

    set width(width: number) {
        this._width = width;
    }

    /***
     * 获取高度。
     */
    get height(): number {
        return this._height;
    }

    set height(height: number) {
        this._height = height;
    }
    /**
     * 创建一个 <code>Bitmap</code> 实例。
     */
    constructor() {

        super();
        this._width = -1;
        this._height = -1;
    }

    /**
     * @internal
     * 获取纹理资源。
     */
    //TODO:coverage
    _getSource(): any {
        throw "Bitmap: must override it.";
    }
}

