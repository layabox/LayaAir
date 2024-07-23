import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
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
    private _sharedMesh: Mesh2D;

    /**@internal */
    private _baseRender2DTexture: BaseTexture;

    /**@internal */
    private _color: Color;


    /**
     * @en 2D Mesh 
     * @zh 2D 渲染网格
     */
    set shareMesh(value: Mesh2D) {
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
        this._changeMesh();
    }

    get shareMesh(): Mesh2D {
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
            for (var i = this._renderElements.length, n = submeshNum; i < n; i++) {
                let element = this._renderElements[i];
                element.destroy();
            }
            this._renderElements.length = submeshNum;
        }
        for (var i = 0, n = submeshNum; i < n; i++) {
            let element = this._renderElements[i];
            if (element)
                element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            element.geometry = this._sharedMesh.getSubMesh(i);
            element.value2DShaderData = this._spriteShaderData;
            BaseRenderNode2D._setRenderElement2DMaterial(element, this._materials[i] ? this._materials[i] : Mesh2DRender.mesh2DDefaultMaterial);
            element.renderStateIsBySprite = false;
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
    }

    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];
    }

}