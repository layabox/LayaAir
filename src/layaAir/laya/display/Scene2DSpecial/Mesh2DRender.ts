import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector3 } from "../../maths/Vector3";
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

    private _baseRender2DTexture: BaseTexture;

    private _color: Color = new Color();

    private _normal2DTexture: BaseTexture;
    private _normal2DStrength: number = 0;

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
            VertexMesh2D.getMeshDefine(value, meshArrayDefine);
            for (var i: number = 0, n: number = meshArrayDefine.length; i < n; i++)
                this._spriteShaderData.addDefine(meshArrayDefine[i]);
            value._addReference();
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
        if (this._color.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._color);
        this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._color);
    }

    get color() {
        return this._color;
    }

    /**
     * @en Rendering textures will not take effect if there is no UV in 2dmesh
     * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
     */
    set texture(value: BaseTexture) {
        if (!value) {
            value = Texture2D.whiteTexture;
        }
        if (value == this._baseRender2DTexture)
            return;

        if (this._baseRender2DTexture)
            this._baseRender2DTexture._removeReference(1)

        value._addReference();
        this._baseRender2DTexture = value;

        this._spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value.gammaCorrection != 1) {//预乘纹理特殊处理
            this._spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this._spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }
    }

    get texture(): BaseTexture {
        return this._baseRender2DTexture;
    }

    /**
     * @en Rendering textures will not take effect if there is no UV in 2dmesh
     * @zh 渲染纹理，如果2DMesh中没有uv，则不会生效 
     */
    set normalTexture(value: BaseTexture) {
        if (value === this._normal2DTexture)
            return;

        if (this._normal2DTexture)
            this._normal2DTexture._removeReference(1)

        if (value)
            value._addReference();
        this._normal2DTexture = value;

        this._spriteShaderData.setTexture(BaseRenderNode2D.NORMAL2DTEXTURE, value);
        if (this._normal2DStrength > 0 && this._normal2DTexture)
            this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else this._spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }

    get normalTexture(): BaseTexture {
        return this._normal2DTexture;
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
        if (value > 0 && this._normal2DTexture)
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

    /**
     * @internal
     */
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
        this._lightReceive && this._updateLight();
    }

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
        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        this._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this._color);
    }
}