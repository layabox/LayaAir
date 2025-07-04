import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { GLESInternalRT } from "../RenderDevice/GLESInternalRT";
import { GLESInternalTex } from "../RenderDevice/GLESInternalTex";
import { GLESRenderElement2D } from "./GLESRenderElement2D";

export class GLESSetRendertarget2DCMD extends SetRendertarget2DCMD {
    
    _nativeObj: any;

    protected _rt: GLESInternalRT;
    constructor() {
        super();
        this._nativeObj = new (window as any).conchGLESSetRendertarget2DCMD();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }
    /**
   * @en Flip Y Rendering
   * @zh 翻转Y轴渲染
   */
    get invertY(): boolean {
        return this._invertY;
    }

    set invertY(value: boolean) {
        this._invertY = value;
        this._nativeObj.setinvertY(value);
    }

    /**
     * @en clear rt color value
     * @zh RT清理颜色
     */
    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
        this._nativeObj.clearColorValue(value);
    }

    /**
     * @en set render target
     * @zh 设置渲染目标RT
     */
    get rt(): GLESInternalRT {
        return this._rt;
    }

    set rt(value: GLESInternalRT) {
        this._rt = value;
        this._nativeObj.setRT(value ? value._nativeObj : null);
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
        this._nativeObj.setClearColor(value);
    }
}

export class GLESDraw2DElementCMD extends Draw2DElementCMD {

    private _elemets: GLESRenderElement2D[];

    _nativeObj: any;
    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
        this._nativeObj = new (window as any).conchGLESDraw2DElementCMD();
    }

    setRenderelements(value: GLESRenderElement2D[]): void {
        this._elemets = value;
        this._nativeObj.clearElement();
        if (value.length == 1) {
            this._nativeObj.addOneElement(value[0]._nativeObj);
        } else {
            value.forEach(element => {
                this._nativeObj.addOneElement(element._nativeObj);
            });
        }
    }
}

export class GLESBlit2DQuadCMD extends Blit2DQuadCMD {
    _nativeObj: any;

    protected _dest: GLESInternalRT;

    protected _source: GLESInternalTex;

    protected _scissor: Vector4;

    protected _offsetScale: Vector4;

    protected _element: GLESRenderElement2D;

    type: RenderCMDType;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchGLESBlit2DQuadCMD();
        this.type = RenderCMDType.Blit;
        this._offsetScale = new Vector4();
    }

    set source(value: GLESInternalTex) {
        this._source = value;
        this._nativeObj.setSource(value._nativeObj);
    }

    /**
     * @en copy Texture
     * @zh 拷贝纹理
     */
    get source(): GLESInternalTex {
        return this._source;
    }

    /**
   * @en render element
   * @zh 渲染元素
   */
    public get element(): GLESRenderElement2D {
        return this._element;
    }

    public set element(value: GLESRenderElement2D) {
        this._element = value;
        this._nativeObj.setRenderElement(value._nativeObj);
    }

    /**
     * @en render dest
     * @zh 渲染目标
     */
    get dest(): GLESInternalRT {
        return this._dest;
    }

    set dest(value: GLESInternalRT) {
        this._dest = value;
        this._nativeObj.setDest(value ? value._nativeObj : null);
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }

    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
        this._nativeObj.setOffsetScale(this._offsetScale);
    }

}