import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector4 } from "../../maths/Vector4";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IMesh2DRenderDataHandle } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Context } from "../../renders/Context";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { Mesh2D, VertexMesh2D } from "../../resource/Mesh2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";

/**
 * 用于在 2D 中显示 Mesh2D 的节点
 */
export class Mesh2DRender extends BaseRenderNode2D {
    /**
     * @en Default mesh2d render material
     * @zh 默认Mesh2D渲染材质 
     */
    static mesh2DDefaultMaterial: Material;
    private _sharedMesh: Mesh2D;
    declare _renderHandle: IMesh2DRenderDataHandle;
    /**
     * @en 2D Mesh 
     * @zh 2D 渲染网格
     */
    set sharedMesh(value: Mesh2D) {
        if (this._sharedMesh == value)
            return;
        let meshArrayDefine = new Array();
        if (this._sharedMesh) {
            VertexMesh2D.getMeshDefine(this._sharedMesh, meshArrayDefine);
            for (var i: number = 0, n: number = meshArrayDefine.length; i < n; i++)
                this._spriteShaderData.removeDefine(meshArrayDefine[i]);
            this._sharedMesh._removeReference()
        }
        meshArrayDefine.length = 0;
        if (value) {
            if (!value._vertexBuffers) {
                value = null;
                console.warn("not a 2D mesh");
            }
            else {
                VertexMesh2D.getMeshDefine(value, meshArrayDefine);
                for (var i: number = 0, n: number = meshArrayDefine.length; i < n; i++)
                    this._spriteShaderData.addDefine(meshArrayDefine[i]);
                value._addReference();
            }
        }
        this._sharedMesh = value;
        this._changeMesh();
    }

    get sharedMesh(): Mesh2D {
        return this._sharedMesh;
    }

    /**
     * @en render color
     * @zh 渲染颜色
     */
    set color(value: Color) {
        this._renderHandle.baseColor = value;
    }


    get color() {
        return this._renderHandle.baseColor;
    }

    /**
     * @en Rendering textures will not take effect if there is no UV in 2dmesh
     * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
     */
    set texture(value: BaseTexture) {
        this._renderHandle.baseTexture = value;
    }

    get texture(): BaseTexture {
        return this._renderHandle.baseTexture;
    }

    /**
     * @en Texture range，if textureRangeIsClip is false, xy represents texture offset, zw represents scaling, if textureRangeIsClip is true, xy represents texture min, zw represents texture max
     * @zh 纹理范围，如果textureRangeIsClip为false，xy表示纹理偏移，zw表示缩放，如果textureRangeIsClip为true，xy表示纹理最小值，zw表示纹理最大值
     */
    set textureRange(value: Vector4) {
        this._renderHandle.baseTextureRange = value;
    }

    get textureRange(): Vector4 {
        return this._renderHandle.baseTextureRange;
    }

    /**
     * @en If textureRangeIsClip is true, the texture will be clipped to the textureRange, otherwise the texture will be stretched to the textureRange
     * @zh 如果textureRangeIsClip为true，纹理将被裁剪到textureRange,否则纹理将被拉伸到textureRange
     */
    set textureRangeIsClip(value: boolean) {
        this._renderHandle.textureRangeIsClip = value;
    }

    get textureRangeIsClip(): boolean {
        return this._renderHandle.textureRangeIsClip;
    }

    /**
     * @en Rendering textures will not take effect if there is no UV in 2dmesh
     * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
     */
    set normalTexture(value: BaseTexture) {
        this._renderHandle.normal2DTexture = value;
    }

    get normalTexture(): BaseTexture {
        return this._renderHandle.normal2DTexture;
    }

    /**
     * @en normal strengh
     * @zh 法线效果强度
     */
    set normalStrength(value: number) {
        this._renderHandle.normal2DStrength = value
    }

    get normalStrength() {
        return this._renderHandle.normal2DStrength;
    }

    /**
     * @en Render material
     * @zh 渲染材质
     */
    set sharedMaterial(value: Material) {
        super.sharedMaterial = value;
        this._changeMesh();
    }

    get sharedMaterial() {
        return this._materials[0];
    }

    private _changeMesh() {
        let submeshNum = this._sharedMesh ? this._sharedMesh.subMeshCount : 0;
        if (submeshNum < this._renderElements.length) {
            for (var i = this._renderElements.length, n = submeshNum; n < i; i--) {
                let element = this._renderElements[i - 1];
                element.destroy();
            }
            this._renderElements.length = submeshNum;
        }
        for (var i = 0, n = submeshNum; i < n; i++) {
            let element = this._renderElements[i];
            if (!element)
                element = this._renderElements[i] = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            element.geometry = this._sharedMesh.getSubMesh(i);
            element.value2DShaderData = this._spriteShaderData;
            BaseRenderNode2D._setRenderElement2DMaterial(element, this._materials[i] ? this._materials[i] : Mesh2DRender.mesh2DDefaultMaterial);
            element.renderStateIsBySprite = false;
            element.nodeCommonMap = this._getcommonUniformMap();
        }
    }

    /**
     * @internal
     * @protected
     * cmd run时调用，可以用来计算matrix等获得即时context属性
     * @param context 
     * @param px 
     * @param py 
     */
    addCMDCall(context: Context, px: number, py: number): void {
        //TODO  挪到底层
        // let mat = context._curMat;
        // let vec3 = Vector3.TEMP;
        // vec3.x = mat.a;
        // vec3.y = mat.c;
        // vec3.z = px * mat.a + py * mat.c + mat.tx;
        // this._spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, vec3);
        // vec3.x = mat.b;
        // vec3.y = mat.d;
        // vec3.z = px * mat.b + py * mat.d + mat.ty;
        // this._spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, vec3);
        // //this._setRenderSize(context.width, context.height)
        // context._copyClipInfoToShaderData(this._spriteShaderData);
        // if (this._renderAlpha !== context.globalAlpha) {
        //     let a = context.globalAlpha * this._color.a;
        //     this._setRenderColor.setValue(this._color.r * a, this._color.g * a, this._color.b * a, a);
        //     this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._setRenderColor);
        //     this._renderAlpha = context.globalAlpha;
        // }
        // this._lightReceive && this._updateLight();
    }

    /**@ignore */
    constructor() {
        super();
        if (!Mesh2DRender.mesh2DDefaultMaterial) {
            Mesh2DRender.mesh2DDefaultMaterial = new Material();
            Mesh2DRender.mesh2DDefaultMaterial.setShaderName("baseRender2D");
            Mesh2DRender.mesh2DDefaultMaterial.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
            Mesh2DRender.mesh2DDefaultMaterial.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
            Mesh2DRender.mesh2DDefaultMaterial.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
            Mesh2DRender.mesh2DDefaultMaterial.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
            Mesh2DRender.mesh2DDefaultMaterial.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
            Mesh2DRender.mesh2DDefaultMaterial.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
            Mesh2DRender.mesh2DDefaultMaterial.setFloatByIndex(ShaderDefines2D.UNIFORM_VERTALPHA, 1.0);
            Mesh2DRender.mesh2DDefaultMaterial.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
        }
        this._renderElements = [];
        this._materials = [];
        this.color = new Color();
        this.textureRange = new Vector4(0, 0, 1, 1);
        this.texture = null;
        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
    }
}