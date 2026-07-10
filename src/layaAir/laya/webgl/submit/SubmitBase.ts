import { GraphicsRunner } from "../../display/Scene2DSpecial/GraphicsRunner";
import { LayaGL } from "../../layagl/LayaGL";
import { Vector4 } from "../../maths/Vector4";
import { IPrimitiveRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";
import { IPool, Pool } from "../../utils/Pool";
import { BlendMode } from "../canvas/BlendMode";
import { Shader2D } from "../shader/d2/Shader2D";
import { GraphicsDefines } from "../shader/d2/GraphicsDefines";
import { SubmitKey } from "./SubmitKey";

export class SubmitBase {

    static readonly _pool: IPool<IPrimitiveRenderElement2D> = Pool.createPool2<IPrimitiveRenderElement2D>(() => {
        let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
        element.renderStateIsBySprite = false;
        element.nodeCommonMap = ["Sprite2D"];
        return element;
    }, (element: IPrimitiveRenderElement2D, needGeometry?: boolean) => {
        if (needGeometry || needGeometry == null) {
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            element.geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
        } else if (element.geometry) {
            element.geometry.destroy();
            element.geometry = null;
        }
    }, (element: IPrimitiveRenderElement2D) => {
        if (element.geometry) {
            element.geometry.clearRenderParams();
            element.geometry.bufferState = null;
        }
        element.materialShaderData = null;
        element.value2DShaderData = null;
        element.primitiveShaderData = null;
        element.globalShaderData = null;
        element.owner = null;
        element.subShader = null;
        element.renderStateIsBySprite = false;
        element.typeKey = 0;
        element.textureKey = 0;
    });

    static RENDERBASE: SubmitBase;
    static ID = 1;

    protected _id = 0;
    /** @internal */
    _renderType = 0;
    /** @internal */
    _key = new SubmitKey();
    renderElement: IPrimitiveRenderElement2D = null;

    textureHost: Texture | BaseTexture = null;
    texArrayLayer: number = 0;
    enableVertexSize: boolean = false;
    fillTexture: boolean = false;
    _blend: BlendMode | null = null;

    private _texRange: Vector4 = new Vector4();
    private _vertexSize: Vector4 = new Vector4();
    private _material: Material;

    constructor() {
        this._id = ++SubmitBase.ID;
        this.toDefault();
    }

    public get material(): Material {
        return this._material;
    }

    public set material(value: Material) {
        if (this._material == value)
            return;
        if (this._material && this.renderElement)
            this._material._removeOwnerElement(this.renderElement);
        this._material = value;

        if (!this.renderElement)
            return;

        if (value) {
            this.renderElement.subShader = value.shader.getSubShaderAt(0);
            this.renderElement.materialShaderData = value.shaderData;
            value._setOwner2DElement(this.renderElement);
        } else {
            this.renderElement.subShader = Shader2D.graphicsShader.getSubShaderAt(0);
            this.renderElement.materialShaderData = null;
        }
    }

    get u_TexRange(): Vector4 {
        return this._texRange;
    }

    set u_TexRange(value: Vector4) {
        value ? value.cloneTo(this._texRange) : this._texRange.setValue(0, 0, 1, 1);
    }

    get vertexSize(): Vector4 {
        return this._vertexSize;
    }

    set vertexSize(value: Vector4) {
        value ? value.cloneTo(this._vertexSize) : this._vertexSize.setValue(0, 0, 0, 0);
    }

    toDefault(): void {
        this._texRange.setValue(0, 0, 1, 1);
        this._vertexSize.setValue(0, 0, 0, 0);
        this.textureHost = null;
        this.texArrayLayer = 0;
        this.enableVertexSize = false;
        this.fillTexture = false;
    }

    clear(): void {
        this._key.clear();
        this.toDefault();
        this._blend = null;
        this.material = null;
    }

    destroy(): void {
        this.clear();
        if (this.renderElement)
            SubmitBase._pool.recover(this.renderElement);
        this.renderElement = null;
    }

    update(runner: GraphicsRunner): void {
        let sBlendMode = runner.sprite._struct.blendMode;
        let blendType = runner._nBlendType;
        this._key.blendShader = blendType;
        this._blend = runner.globalCompositeOperation != sBlendMode ? blendType : null;
    }
}

SubmitBase.RENDERBASE = new SubmitBase();
