import { Color } from "../../../../../maths/Color";
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";
import { BaseRenderNode2D } from "../../../../../NodeRender2D/BaseRenderNode2D";
import { IRenderContext2D } from "../../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { ISpineRenderDataHandle } from "../../../../interface/ISpineRenderDataHandle";
import type { WebRenderStruct2D } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { ShaderDefines2D } from "../../../../../webgl/shader/d2/ShaderDefines2D";
import { SpineShaderInit } from "../../../../shader/SpineShaderInit";
import type { StandardSpine2DRenderer } from "../SpineRendererTypes2D";

const _setRenderColor = new Color(1, 1, 1, 1);

/** @internal Web Spine handle. Matrix changes are consumed during render traversal. */
export class WebSpineRenderDataHandle implements ISpineRenderDataHandle {
    private _owner: WebRenderStruct2D;
    private _nMatrix_0: Vector3 = new Vector3();
    private _nMatrix_1: Vector3 = new Vector3();
    private _needUseMatrix: boolean = true;
    private _lightReceive: boolean = false;
    private _renderAlpha = -1;
    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _offset: Vector2;
    private _renderMatrixVersion: number = -1;
    private _normalRender: StandardSpine2DRenderer = null;

    skeleton: spine.Skeleton;

    public get needUseMatrix(): boolean {
        return this._needUseMatrix;
    }

    public set needUseMatrix(value: boolean) {
        if (this._needUseMatrix === value)
            return;
        this._needUseMatrix = value;
        this._renderMatrixVersion = -1;
        if (!value && this._owner?.spriteShaderData) {
            this._nMatrix_0.set(1, 0, 0);
            this._nMatrix_1.set(0, 1, 0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
            this._owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
        }
    }

    public get lightReceive(): boolean {
        return this._lightReceive;
    }

    public set lightReceive(value: boolean) {
        if (this._lightReceive === value)
            return;
        this._lightReceive = value;
        if (!this._owner?.spriteShaderData)
            return;
        if (value)
            this._owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        else
            this._owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
    }

    bindNormalRender(value: StandardSpine2DRenderer): void {
        this._normalRender = value;
        this._renderMatrixVersion = -1;
    }

    public get renderMatrixVersion(): number {
        return this._renderMatrixVersion;
    }

    public set renderMatrixVersion(value: number) {
        this._renderMatrixVersion = value;
    }

    /** @internal Used by the Spine normal batching path. */
    get normalUpdater() {
        return this._normalRender?.normalUpdater;
    }

    public get baseColor(): Color {
        return this._baseColor;
    }

    public set baseColor(value: Color) {
        if (value !== this._baseColor && this._baseColor.equal(value))
            return;
        value = value || Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
        if (this._owner?.spriteShaderData)
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._baseColor);
    }

    public get owner(): WebRenderStruct2D {
        return this._owner;
    }

    public set owner(value: WebRenderStruct2D) {
        if (value === this._owner)
            return;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.removeDefine(SpineShaderInit.SPINE_UV);
            shaderData.removeDefine(SpineShaderInit.SPINE_COLOR);
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
        this._owner = value;
        this._renderMatrixVersion = -1;
        if (this._owner) {
            let shaderData = this._owner.spriteShaderData;
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
            shaderData.addDefine(SpineShaderInit.SPINE_UV);
            shaderData.addDefine(SpineShaderInit.SPINE_COLOR);
            if (this._lightReceive)
                shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
    }

    public get offset(): Vector2 {
        return this._offset;
    }

    public set offset(value: Vector2) {
        this._offset = value;
        this._renderMatrixVersion = -1;
    }

    inheriteRenderData(context: IRenderContext2D): void {
        if (!this._owner || !this._owner.spriteShaderData || !this.skeleton)
            return;

        let matrixVersion = this._owner.getRenderMatrixVersion();
        if (matrixVersion < 0 || this._renderMatrixVersion !== matrixVersion) {
            let shaderData = this._owner.spriteShaderData;
            let mat = this._owner.renderMatrix;
            if (this._needUseMatrix) {
                this._renderMatrixVersion = matrixVersion;
                if (this._offset) {
                    let ofx = this._offset.x;
                    let ofy = this._offset.y;
                    this._nMatrix_0.setValue(mat.a, mat.c, mat.tx + mat.a * ofx + mat.c * ofy);
                    this._nMatrix_1.setValue(mat.b, mat.d, mat.ty + mat.b * ofx + mat.d * ofy);
                } else {
                    this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
                    this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
                }
                shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
                shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);
            } else {
                this._normalRender?.updateRenderMatrix(mat, this._offset, true);
            }
        }

        if (this._renderAlpha !== this._owner.globalAlpha) {
            let alpha = this._owner.globalAlpha * this._baseColor.a;
            _setRenderColor.setValue(this._baseColor.r, this._baseColor.g, this._baseColor.b, alpha);
            this._owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, _setRenderColor);
            this._renderAlpha = this._owner.globalAlpha;
        }
    }

    destroy(): void {
        this.owner = null;
        this._normalRender = null;
        this.skeleton = null;
    }
}
