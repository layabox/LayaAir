import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
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

    /**@internal */
    private _shareMesh: Mesh2D;

    /**@internal */
    private _baseRender2DTexture: BaseTexture;

    /**@internal */
    private _color: Color;


    /**
     * @en 2D Mesh 
     * @zh 2D 渲染网格
     */
    set shareMesh(value: Mesh2D) {
        if (this._shareMesh == value)
            return;
        let meshArrayDefine = new Array();
        if (this._shareMesh) {
            VertexMesh2D.getMeshDefine(this._shareMesh, meshArrayDefine);
            for (var i: number = 0, n: number = meshArrayDefine.length; i < n; i++)
                this._spriteShaderData.removeDefine(meshArrayDefine[i]);
            this._shareMesh._removeReference()
        }
        meshArrayDefine.length = 0;
        if (value) {
            VertexMesh2D.getMeshDefine(value, meshArrayDefine);
            for (var i: number = 0, n: number = meshArrayDefine.length; i < n; i++)
                this._spriteShaderData.addDefine(meshArrayDefine[i]);
            value._addReference();
        }
        this._shareMesh = value;
        this._changeMesh();
    }

    get shareMesh(): Mesh2D {
        return this._shareMesh;
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
        let submeshNum = this._shareMesh ? this._shareMesh.subMeshCount : 0;
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
            element.geometry = this._shareMesh.getSubMesh(i);
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
        let vec3 = Vector3._tempVector3;
        vec3.x = mat.a;
        vec3.y = mat.b;
        vec3.z = mat.tx + mat.a * px + mat.c * py;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, vec3);
        vec3.x = mat.c;
        vec3.y = mat.d;
        vec3.z = mat.ty + mat.b * px + mat.d * py;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, vec3);
        Vector2.TempVector2.setValue(context.width, context.height);
        this._spriteShaderData.setVector2(BaseRenderNode2D.BASERENDERSIZE, Vector2.TempVector2);
        this._setRenderSize(context.width, context.height)
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
    }

}