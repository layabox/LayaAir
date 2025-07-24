import { Color } from "../../../../maths/Color";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../../spine/material/SpineShaderInit";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Graphics2DBufferBlock, I2DBaseRenderDataHandle, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { GLESRenderContext2D } from "../../../OpenGLESDriver/2DRenderPass/GLESRenderContext2D";
import { RTRenderStruct2D } from "./RTRenderStruct2D";
import { Vector2 } from "../../../../maths/Vector2";

export abstract class RTRender2DDataHandle implements IRender2DDataHandle {
    _nativeObj: any;
    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
        this.needUseMatrix = true;
    }
    protected _owner: RTRenderStruct2D;
    public get owner(): RTRenderStruct2D {
        return this._owner;
    }
    public set owner(value: RTRenderStruct2D) {
        this._owner = value;
        this._nativeObj.setOwner(value ? value._nativeObj : null);
    }

    private _needUseMatrix: boolean;
    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
        this._needUseMatrix = value;
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
    constructor(nativeObj?: any) {
        super(nativeObj || new (window as any).conchRTRender2DDataHandle());
        this.lightReceive = false;
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
        this.baseColor = new Color(1, 1, 1, 1);
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
}

export class RTSpineRenderDataHandle extends RTBaseRenderDataHandle implements ISpineRenderDataHandle {
    private _offset: Vector2 = new Vector2();
    skeleton: spine.Skeleton;

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


    public get offset(): Vector2 {
        return this._offset;
    }
    public set offset(value: Vector2) {
        this._offset = value;
        this._nativeObj.setOffset(this._offset);
    }
}