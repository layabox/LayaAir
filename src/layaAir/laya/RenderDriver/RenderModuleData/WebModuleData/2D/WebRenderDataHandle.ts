import { LayaGL } from "../../../../layagl/LayaGL";
import { Color } from "../../../../maths/Color";
import { Matrix } from "../../../../maths/Matrix";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../../spine/material/SpineShaderInit";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { I2DBaseRenderDataHandle, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle, ISpineRenderDataHandle, Graphics2DBufferBlock, I2DGraphicBufferDataView } from "../../Design/2D/IRender2DDataHandle";
import { Web2DGraphic2DBufferDataView } from "./Web2DGraphic2DBufferDataView";
import { WebRenderStruct2D } from "./WebRenderStruct2D";

export abstract class WebRender2DDataHandle implements IRender2DDataHandle {
    protected _owner: WebRenderStruct2D;
    public get owner(): WebRenderStruct2D {
        return this._owner;
    }
    public set owner(value: WebRenderStruct2D) {
        this._owner = value;
    }
    protected _nMatrix_0 = new Vector3();
    protected _nMatrix_1 = new Vector3();
    constructor() {
    }
    private _needUseMatrix: boolean = true;
    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }
    public set needUseMatrix(value: boolean) {
        this._needUseMatrix = value;
        if (!value) {
            this._nMatrix_0.set(1, 0, 0);
            this._nMatrix_1.set(0, 1, 0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
        }
    }
    destroy(): void {

    }

    inheriteRenderData(context: IRenderContext2D): void {
        //更新位置
        //todo  如果没有更新世界位置 不需要更新Matrix到shaderData
        let data = this._owner.spriteShaderData;
        if (!data)
            return;
        if (this._needUseMatrix) {
            let mat = this._owner.renderMatrix;
            this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
            this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
        }
    }
}

export class WebPrimitiveDataHandle extends WebRender2DDataHandle implements I2DPrimitiveDataHandle {

    mask: WebRenderStruct2D | null = null;

    private _bufferBlocks: Graphics2DBufferBlock[] = [];
    private _needUpdateBuffer: boolean = false;
    private _modifiedFrame: number = -1;
    private _clonesViews: I2DGraphicBufferDataView[];

    applyVertexBufferBlock(blocks: Graphics2DBufferBlock[]): void {
        this._bufferBlocks = blocks;
        this._needUpdateBuffer = blocks.length > 0;
        this.updateCloneView();
    }

    /** @internal */
    _getBlocks() {
        return this._bufferBlocks;
    }

    inheriteRenderData(context: IRenderContext2D): void {
        let data = this._owner.spriteShaderData;
        if (!data)
            return;

        let trans = this._owner.trans;

        if (
            this._needUpdateBuffer
            || this._modifiedFrame < trans.modifiedFrame
        ) {

            let mat = trans.matrix;

            if (!this._bufferBlocks || !this._bufferBlocks.length) {
                //更新位置
                if (this.mask && this.mask.trans) {
                    let maskMatrix = this.mask.renderMatrix;
                    let tempMatirx = Matrix.mul(maskMatrix, mat, Matrix.TEMP);
                    this._nMatrix_0.setValue(tempMatirx.a, tempMatirx.c, tempMatirx.tx);
                    this._nMatrix_1.setValue(tempMatirx.b, tempMatirx.d, tempMatirx.ty);
                }
                else {
                    this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
                    this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
                }

                this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
                this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
            } else {
                let pos = 0, dataViewIndex = 0, ci = 0;
                let dataView: Web2DGraphic2DBufferDataView = null;
                let m00 = mat.a, m01 = mat.b, m10 = mat.c, m11 = mat.d, tx = mat.tx, ty = mat.ty;
                let vbdata = null;
                let blocks = this._bufferBlocks;
                let vertexCount = 0, positions: number[] = null, vertexViews: Web2DGraphic2DBufferDataView[] = null;

                for (let i = 0, n = this._bufferBlocks.length; i < n; i++) {
                    let vertexs = blocks[i].vertexs;

                    for (let index = 0, len = vertexs.length; index < len; index++) {
                        positions = vertexs[index].positions;
                        vertexViews = vertexs[index].vertexViews as Web2DGraphic2DBufferDataView[];

                        vertexCount = positions.length / 2;
                        dataView = null;
                        pos = 0, ci = 0, dataViewIndex = 0;

                        for (let j = 0; j < vertexCount; j++) {

                            if (!dataView || dataView.length <= pos) {
                                dataView = vertexViews[dataViewIndex];
                                dataView.modify();
                                dataViewIndex++;
                                pos = 0;
                                vbdata = dataView.getData();
                            }

                            let x = positions[ci], y = positions[ci + 1];
                            vbdata[pos] = x * m00 + y * m10 + tx;
                            vbdata[pos + 1] = x * m01 + y * m11 + ty;
                            pos += 12;
                            ci += 2;
                        }
                    }

                }
                this._needUpdateBuffer = false;
            }

            this._modifiedFrame = trans.modifiedFrame;
        }

        // //更新indexView
        // for (let i = 0, n = this._indexViews.length; i < n; i++) {
        //     let indexView = this._indexViews[i];
        //     if(indexView){
        //         indexView.modify();
        //     }
        // }
    }

    getCloneViews(): I2DGraphicBufferDataView[] {
        if (!this._clonesViews) {
            this._clonesViews = [];
            for (let i = 0, n = this._bufferBlocks.length; i < n; i++) {
                this._clonesViews[i] = this._cloneView(this._bufferBlocks[i].indexView);
            }
        }
        return this._clonesViews;
    }

    updateCloneView() {
        let cloneViews = this.getCloneViews();
        let blockLength = this._bufferBlocks.length;
        let length = Math.max(cloneViews.length, blockLength);
        for (let i = 0; i < length; i++) {
            let view = cloneViews[i]
            let block = this._bufferBlocks[i];
            if (block) {
                cloneViews[i] = this._cloneView(block.indexView , view);
            } else {
                view.geometry.destroy();
                if (view.owner)
                    view.owner.removeDataView(view);
            }
        }
        this._clonesViews.length = blockLength;
    }

    private _cloneView(view: I2DGraphicBufferDataView, oView: I2DGraphicBufferDataView = null) {
        let clone = view.clone(false, false);
        if (oView && oView.geometry) {
            clone.geometry = oView.geometry;
        } else {
            clone.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            clone.geometry.indexFormat = IndexFormat.UInt16;
        }
        return clone;
    }
}


export class Web2DBaseRenderDataHandle extends WebRender2DDataHandle implements I2DBaseRenderDataHandle {
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
}

export class WebMesh2DRenderDataHandle extends Web2DBaseRenderDataHandle implements IMesh2DRenderDataHandle {
    private static _setRenderColor: Color = new Color(1, 1, 1, 1);
    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _baseTexture: BaseTexture;
    private _textureRangeIsClip: boolean;
    private _baseTextureRange: Vector4 = new Vector4();
    private _normal2DTexture: BaseTexture;
    private _renderAlpha = -1;


    public get owner(): WebRenderStruct2D {
        return this._owner;
    }
    public set owner(value: WebRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }
        this._owner = value;
        if (this._owner) {
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        }

    }

    public get baseColor(): Color {
        return this._baseColor;
    }
    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
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

    public get baseTextureRange(): Vector4 {
        return this._baseTextureRange;
    }
    public set baseTextureRange(value: Vector4) {
        if (!value)
            return;
        this._owner.spriteShaderData.setVector(BaseRenderNode2D.BASERENDER2DTEXTURERANGE, value);
        value ? value.cloneTo(this._baseTextureRange) : null;
    }

    public get textureRangeIsClip(): boolean {
        return this._textureRangeIsClip;
    }
    public set textureRangeIsClip(value: boolean) {
        if (this._textureRangeIsClip != value) {
            this._textureRangeIsClip = value;
            if (value)
                this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_CLIPMODE);
            else
                this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_CLIPMODE);
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

    inheriteRenderData(context: IRenderContext2D): void {
        super.inheriteRenderData(context);
        if (this._renderAlpha != this._owner.globalAlpha) {
            let a = this._owner.globalAlpha * this._baseColor.a;
            WebMesh2DRenderDataHandle._setRenderColor.setValue(this._baseColor.r * a, this._baseColor.g * a, this._baseColor.b * a, a);
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, WebMesh2DRenderDataHandle._setRenderColor);
            this._renderAlpha = this._owner.globalAlpha;
        }
    }
}

export class WebSpineRenderDataHandle extends Web2DBaseRenderDataHandle implements ISpineRenderDataHandle {

    public get owner(): WebRenderStruct2D {
        return this._owner;
    }
    public set owner(value: WebRenderStruct2D) {
        if (value == this.owner) return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
        }
        this._owner = value;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.addDefine(SpineShaderInit.SPINE_UV);
            shaderData.addDefine(SpineShaderInit.SPINE_COLOR);
        }

    }

    skeleton: spine.Skeleton;

    inheriteRenderData(context: IRenderContext2D): void {
        if (!this._owner || !this._owner.spriteShaderData)
            return
        let shaderData = this.owner.spriteShaderData;
        let trans = this.owner.renderMatrix;
        let mat = trans;
        let ofx = - this.skeleton.x;
        let ofy = this.skeleton.y;
        this._nMatrix_0.setValue(mat.a, mat.b, mat.tx + mat.a * ofx + mat.c * ofy);
        this._nMatrix_1.setValue(mat.c, mat.d, mat.ty + mat.b * ofx + mat.d * ofy);
        this._nMatrix_0.setValue(mat.a, mat.b, mat.tx);
        this._nMatrix_1.setValue(mat.c, mat.d, mat.ty);
        shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
        shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
    }
}