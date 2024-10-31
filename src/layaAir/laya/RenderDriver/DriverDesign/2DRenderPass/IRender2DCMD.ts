import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../RenderDevice/InternalTexture";
import { IRenderCMD, RenderCMDType } from "../RenderDevice/IRenderCMD";
import { IRenderContext2D } from "./IRenderContext2D";
import { IRenderElement2D } from "./IRenderElement2D";

export interface IRender2DCMD extends IRenderCMD {
    apply(context: IRenderContext2D): void;
}

export class SetRendertarget2DCMD implements IRender2DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _rt: InternalRenderTarget;

    protected _clearColor: boolean;

    protected _clearColorValue: Color;

    private _invertY: boolean;

    /**
     * @en Flip Y Rendering
     * @zh 翻转Y轴渲染
     */
    get invertY(): boolean {
        return this._invertY;
    }

    set invertY(value: boolean) {
        this._invertY = value;
    }

    /**
     * @en clear rt color value
     * @zh RT清理颜色
     */
    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        this._clearColorValue = value;
    }

    /**
     * @en set render target
     * @zh 设置渲染目标RT
     */
    get rt(): InternalRenderTarget {
        return this._rt;
    }

    set rt(value: InternalRenderTarget) {
        this._rt = value;
    }

    /**
     * @en Clean rt or not
     * @zh 是否清理rt
     */
    get clearColor(): boolean {
        return this._clearColor;
    }

    set clearColor(value: boolean) {
        this._clearColor = value;
    }

    apply(context: IRenderContext2D): void {
        throw new Error("Method not implemented.");
    }
}

export class Draw2DElementCMD implements IRender2DCMD {
    /**
    * @en render cmd type
    * @zh 渲染指令类型
    */
    type: RenderCMDType;

    setRenderelements(value: IRenderElement2D[]): void {
        throw new Error("Method not implemented.");
    }

    apply(context: IRenderContext2D): void {
        throw new Error("Method not implemented.");
    }
}

export class Blit2DQuadCMD implements IRender2DCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _dest: InternalRenderTarget;

    protected _viewport: Viewport;

    protected _source: InternalTexture;

    protected _offsetScale: Vector4;

    protected _element: IRenderElement2D;

    /**
     * @en render element
     * @zh 渲染元素
     */
    public get element(): IRenderElement2D {
        return this._element;
    }

    public set element(value: IRenderElement2D) {
        this._element = value;
    }

    /**
     * @en render dest
     * @zh 渲染目标
     */
    get dest(): InternalRenderTarget {
        return this._dest;
    }

    set dest(value: InternalRenderTarget) {
        this._dest = value;
    }

    /**
     * @en copy Texture
     * @zh 拷贝纹理
     */
    get source(): InternalTexture {
        return this._source;
    }

    set source(value: InternalTexture) {
        this._source = value;

    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        this._offsetScale = value;
    }

    apply(context: IRenderContext2D): void {
        throw new Error("Method not implemented.");
    }
}