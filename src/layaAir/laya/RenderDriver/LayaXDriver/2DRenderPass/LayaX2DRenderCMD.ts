import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import {
    SetRendertarget2DCMD,
    Draw2DElementCMD,
    Blit2DQuadCMD
} from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";

// ============================================
// SetRendertarget2DCMD
// ============================================
export class LayaXSetRendertarget2DCMD extends SetRendertarget2DCMD {
    _nativeObj: any;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXSetRendertarget2DCMD();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }

    get rt(): InternalRenderTarget { return this._rt; }
    set rt(value: InternalRenderTarget) {
        this._rt = value;
        this._nativeObj.setRT(
            value ? (value as any)._nativeObj : null,
            this.size.x, this.size.y
        );
    }

    get clearColor(): boolean { return this._clearColor; }
    set clearColor(value: boolean) {
        this._clearColor = value;
        this._nativeObj.setClearColor(value);
    }

    get clearColorValue(): Color { return this._clearColorValue; }
    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
        this._nativeObj.clearColorValue(this._clearColorValue);
    }

    get invertY(): boolean { return this._invertY; }
    set invertY(value: boolean) {
        this._invertY = value;
        this._nativeObj.setinvertY(value);
    }
}

// ============================================
// Draw2DElementCMD
// ============================================
export class LayaXDraw2DElementCMD extends Draw2DElementCMD {
    _nativeObj: any;

    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
        this._nativeObj = new (window as any).conchLayaXDraw2DElementCMD();
    }

    setRenderelements(value: IRenderElement2D[]): void {
        this._nativeObj.clearElement();
        for (let i = 0, n = value.length; i < n; i++) {
            this._nativeObj.addOneElement((value[i] as any)._nativeObj);
        }
    }
}

// ============================================
// Blit2DQuadCMD
// ============================================
export class LayaXBlit2DQuadCMD extends Blit2DQuadCMD {
    _nativeObj: any;

    constructor() {
        super();
        this._nativeObj = new (window as any).conchLayaXBlit2DQuadCMD();
        this.type = RenderCMDType.Blit;
        this._offsetScale = new Vector4();
    }

    get element(): IRenderElement2D { return this._element; }
    set element(value: IRenderElement2D) {
        this._element = value;
        this._nativeObj.setRenderElement(value ? (value as any)._nativeObj : null);
    }

    get dest(): InternalRenderTarget { return this._dest; }
    set dest(value: InternalRenderTarget) {
        this._dest = value;
        this._nativeObj.setDest(value ? (value as any)._nativeObj : null);
    }

    get source(): InternalTexture { return this._source; }
    set source(value: InternalTexture) {
        this._source = value;
        this._nativeObj.setSource(value ? (value as any)._nativeObj : null);
    }

    get offsetScale(): Vector4 { return this._offsetScale; }
    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
        this._nativeObj.setOffsetScale(this._offsetScale);
    }
}
