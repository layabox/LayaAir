import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Context } from "../../renders/Context";
import { BaseTexture } from "../../resource/BaseTexture";
import { Material } from "../../resource/Material";
import { Mesh2D, VertexMesh2D } from "../../resource/Mesh2D";
import { Texture2D } from "../../resource/Texture2D";
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

    private _texture: BaseTexture = Texture2D.whiteTexture;
    private _textureRange: Vector4;

    private _color: Color;
    private _setRenderColor: Color;

    private _normalTexture: BaseTexture;
    private _normal2DStrength: number = 0;

    private _renderAlpha: number = -1;
    private _textureRangeIsClip: boolean = false;
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
        if (value != this._color && this._color.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._color);
        this._renderAlpha = -1;
    }


    get color() {
        return this._color;
    }

    /**
     * @en Rendering textures will not take effect if there is no UV in 2dmesh
     * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
     */
    set texture(value: BaseTexture) {
        if (this._texture != null && value == this._texture)
            return;

        if (this._texture)
            this._texture._removeReference();

        this._texture = value;
        value = value ? value : Texture2D.whiteTexture;
        this._spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value) {
            value._addReference();
            if (value.gammaCorrection != 1) {//预乘纹理特殊处理
                this._spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                this._spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }
        }
    }

    get texture(): BaseTexture {
        return this._texture;
    }

    /**
     * @en Texture range，if textureRangeIsClip is false, xy represents texture offset, zw represents scaling, if textureRangeIsClip is true, xy represents texture min, zw represents texture max
     * @zh 纹理范围，如果textureRangeIsClip为false，xy表示纹理偏移，zw表示缩放，如果textureRangeIsClip为true，xy表示纹理最小值，zw表示纹理最大值
     */
    set textureRange(value: Vector4) {
        if (!value)
            return;
        this._spriteShaderData.setVector(BaseRenderNode2D.BASERENDER2DTEXTURERANGE, value);
        value ? value.cloneTo(this._textureRange) : null;
    }

    get textureRange(): Vector4 {
        return this._textureRange;
    }

    /**
     * @en If textureRangeIsClip is true, the texture will be clipped to the textureRange, otherwise the texture will be stretched to the textureRange
     * @zh 如果textureRangeIsClip为true，纹理将被裁剪到textureRange,否则纹理将被拉伸到textureRange
     */
    set textureRangeIsClip(value: boolean) {
        this._textureRangeIsClip = value;
        if (value)
        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_CLIPMODE);
        else
        this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_CLIPMODE);
    }

    get textureRangeIsClip(): boolean {
        return this._textureRangeIsClip;
    }

    /**
     * @en Rendering textures will not take effect if there is no UV in 2dmesh
     * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
     */
    set normalTexture(value: BaseTexture) {
        if (value === this._normalTexture)
            return;

        if (this._normalTexture)
            this._normalTexture._removeReference(1)

        if (value)
            value._addReference();
        this._normalTexture = value;

        this._spriteShaderData.setTexture(BaseRenderNode2D.NORMAL2DTEXTURE, value);
        if (this._normal2DStrength > 0 && this._normalTexture)
            this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }

    get normalTexture(): BaseTexture {
        return this._normalTexture;
    }

    /**
     * @en normal strengh
     * @zh 法线效果强度
     */
    set normalStrength(value: number) {
        value = Math.max(0, Math.min(1, value)); //值应该在0~1之间
        if (this._normal2DStrength === value)
            return
        this._normal2DStrength = value;
        this._spriteShaderData.setNumber(BaseRenderNode2D.NORMAL2DSTRENGTH, value);
        if (value > 0 && this._normalTexture)
            this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }

    get normalStrength() {
        return this._normal2DStrength;
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
        if (submeshNum > this._renderElements.length) {
            for (var i = this._renderElements.length, n = submeshNum; n < i; i--) {
                let element = this._renderElements[i];
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
        let mat = context._curMat;
        let vec3 = Vector3.TEMP;
        vec3.x = mat.a;
        vec3.y = mat.c;
        vec3.z = px * mat.a + py * mat.c + mat.tx;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, vec3);
        vec3.x = mat.b;
        vec3.y = mat.d;
        vec3.z = px * mat.b + py * mat.d + mat.ty;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, vec3);
        this._setRenderSize(context.width, context.height)
        context._copyClipInfoToShaderData(this._spriteShaderData);
        if (this._renderAlpha !== context.globalAlpha) {
            let a = context.globalAlpha * this._color.a;
            this._setRenderColor.setValue(this._color.r * a, this._color.g * a, this._color.b * a, a);
            this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._setRenderColor);
            this._renderAlpha = context.globalAlpha;
        }
        this._lightReceive && this._updateLight();
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
        this._color = new Color();
        this._setRenderColor = new Color();
        this._textureRange = new Vector4(0, 0, 1, 1);
        this.textureRange = this._textureRange;
        this.texture = null;
        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._color);
    }
}