import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../../spine/material/SpineShaderInit";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { BufferModifyType, Graphics2DBufferBlock, I2DBaseRenderDataHandle, I2DGraphicBufferDataView, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { IRenderStruct2D } from "../../Design/2D/IRenderStruct2D";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { WebRenderStruct2D } from "../../WebModuleData/2D/WebRenderStruct2D";
import { Vector2 } from "../../../../maths/Vector2";

export abstract class RTRender2DDataHandle implements IRender2DDataHandle {
    _nativeObj: any;
    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
    }
    protected _owner: RTRenderStruct2D;
    public get owner(): RTRenderStruct2D {
        return this._owner;
    }
    public set owner(value: RTRenderStruct2D) {
        this._owner = value;
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }
    public get needUseMatrix(): boolean {
        return this._nativeObj.needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
        this._nativeObj.needUseMatrix = value;
    }
    destroy(): void {
        this._nativeObj.destroy();
    }

    inheriteRenderData(context: GLESRenderContext2D): void {
        this._nativeObj.inheriteRenderData(context._nativeObj);
    }
}
export class RTPrimitiveDataHandle extends RTRender2DDataHandle implements I2DPrimitiveDataHandle {
    constructor() {
        super(new (window as any).conchRTPrimitiveDataHandle());
    }

    _mask: RTRenderStruct2D | null = null;
    get mask(): RTRenderStruct2D | null {
        return this._mask;
    }
    set mask(value: RTRenderStruct2D | null) {
        this._mask = value;
        this._nativeObj.setMask(value ? value._nativeObj : null);
    }

    private _blocks: Graphics2DBufferBlock[] = null;

    applyVertexBufferBlock(blocks: Graphics2DBufferBlock[]): void {
        this._blocks = blocks;
        this._nativeObj.applyVertexBufferBlock(blocks);
    }

    inheriteRenderData(context: GLESRenderContext2D): void {
        this._nativeObj.inheriteRenderData(context._nativeObj);
    }
}


export class RTBaseRenderDataHandle extends RTRender2DDataHandle implements I2DBaseRenderDataHandle {
    constructor(nativeObj ?: any) {
        super(nativeObj || new (window as any).conchRTRender2DDataHandle());
    }

    private _lightReceive: boolean;

    public get lightReceive(): boolean {
        return this._lightReceive;
    }
    public set lightReceive(value: boolean) {
        this._lightReceive = value;
        if (value) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        } else {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
    }

    public get owner(): RTRenderStruct2D {
        return this._owner;
    }
    public set owner(value: RTRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
        this._owner = value;
        this._nativeObj.setOwner(this._owner._nativeObj);

        if (this._owner) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
    }
}

export class RTMesh2DRenderDataHandle extends RTBaseRenderDataHandle implements IMesh2DRenderDataHandle {
    constructor() {
        super(new (window as any).conchRTMesh2DRenderDataHandle());
    }

    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _baseTexture: BaseTexture;
    private _normal2DTexture: BaseTexture;

    public get baseColor(): Color {
        return this._baseColor;
    }
    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
        this._nativeObj.setBaseColor(this._baseColor);
    }

    public get baseTexture(): BaseTexture {
        return this._baseTexture;
    }
    public set baseTexture(value: BaseTexture) {
        if (this._baseTexture != null && value == this._baseTexture)
            return;

        if (this._baseTexture)
            this._baseTexture._removeReference();

        this._baseTexture = value;
        value = value ? value : Texture2D.whiteTexture;
        this._owner.spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value) {
            value._addReference();
            if (value.gammaCorrection != 1) {//预乘纹理特殊处理
                this._owner.spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                this._owner.spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }
        }
    }

    public get normal2DTexture(): BaseTexture {
        return this._normal2DTexture;
    }
    public set normal2DTexture(value: BaseTexture) {
        if (value === this._normal2DTexture)
            return;

        if (this._normal2DTexture)
            this._normal2DTexture._removeReference(1)

        if (value)
            value._addReference();
        this._normal2DTexture = value;

        this._owner.spriteShaderData.setTexture(BaseRenderNode2D.NORMAL2DTEXTURE, value);
        if (this._normal2DStrength > 0 && this._normal2DTexture)
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }
    private _normal2DStrength: number;
    public get normal2DStrength(): number {
        return this._normal2DStrength;
    }
    public set normal2DStrength(value: number) {
        value = Math.max(0, Math.min(1, value)); //值应该在0~1之间
        if (this._normal2DStrength === value)
            return
        this._normal2DStrength = value;
        this._owner.spriteShaderData.setNumber(BaseRenderNode2D.NORMAL2DSTRENGTH, value);
        if (value > 0 && this._normal2DTexture)
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }

    // inheriteRenderData(context: IRenderContext2D): void {
    //     super.inheriteRenderData(context);
    //     if (this._renderAlpha != this._owner.globalAlpha) {
    //         let a = this._owner.globalAlpha * this._baseColor.a;
    //         WebMesh2DRenderDataHandle._setRenderColor.setValue(this._baseColor.r * a, this._baseColor.g * a, this._baseColor.b * a, a);
    //         this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, WebMesh2DRenderDataHandle._setRenderColor);
    //         this._renderAlpha = this._owner.globalAlpha;
    //     }
    // }
}

export class RTSpineRenderDataHandle extends RTBaseRenderDataHandle implements ISpineRenderDataHandle {
    private _offset: Vector2 = new Vector2();

    constructor() {
        super(new (window as any).conchRTSpineRenderDataHandle());
    }

    public get owner(): RTRenderStruct2D {
        return this._owner;
    }

    public set owner(value: RTRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
        }
        this._owner = value;
        this._nativeObj.setOwner(this._owner._nativeObj);
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.addDefine(SpineShaderInit.SPINE_UV);
            shaderData.addDefine(SpineShaderInit.SPINE_COLOR);
        }

    }

    private _skeleton: spine.Skeleton;
    public get skeleton(): spine.Skeleton {
        return this._skeleton;
    }
    public set skeleton(value: spine.Skeleton) {
        this._skeleton = value;
        if (this._skeleton) {
            this._offset.setValue(this._skeleton.x, this._skeleton.y);
        } else {
            this._offset.setValue(0, 0);
        }
        this._nativeObj.setOffset(this._offset);
    }

    // inheriteRenderData(context: IRenderContext2D): void {
    //     if (!this._owner || !this._owner.spriteShaderData || !this.skeleton)
    //         return
    //     let shaderData = this.owner.spriteShaderData;
    //     let trans = this.owner.renderMatrix;
    //     let mat = trans;
    //     let ofx = - this.skeleton.x;
    //     let ofy = this.skeleton.y;
    //     this._nMatrix_0.setValue(mat.a, mat.b, mat.tx + mat.a * ofx + mat.c * ofy);
    //     this._nMatrix_1.setValue(mat.c, mat.d, mat.ty + mat.b * ofx + mat.d * ofy);
    //     this._nMatrix_0.setValue(mat.a, mat.b, mat.tx);
    //     this._nMatrix_1.setValue(mat.c, mat.d, mat.ty);
    //     shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
    //     shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
    // }
}