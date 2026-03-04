import { Const } from "../../../Const";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { Draw2DElementCMD } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Mesh2D, VertexMesh2D } from "../../../resource/Mesh2D";
import { Texture } from "../../../resource/Texture";
import { Texture2D } from "../../../resource/Texture2D";
import { Pool } from "../../../utils/Pool";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Mesh2DRender } from "../Mesh2DRender";
import { Command2D } from "./Command2D";

export class DrawMesh2DCMD extends Command2D {

    private static readonly _pool = Pool.createPool(DrawMesh2DCMD);

    /**
     * @param mesh 
     * @param mat 
     * @param texture 
     * @param color 
     * @param material 
     * @returns 
     */
    static create(mesh: Mesh2D, mat: Matrix, texture: BaseTexture | Texture, color: Color, material: Material): DrawMesh2DCMD {
        let cmd = DrawMesh2DCMD._pool.take();
        cmd.mesh = mesh;
        cmd.material = material || Mesh2DRender.mesh2DDefaultMaterial;
        cmd.texture = texture;
        cmd.color = color;
        cmd._setMatrix(mat);
        return cmd;
    }

    private _drawElementData: Draw2DElementCMD;

    // private _mesh2DRender: Mesh2DRender;

    private _renderElements: IRenderElement2D[] = [];

    private _shaderData: ShaderData;

    private _needUpdateElement: boolean;

    private _matrix: Matrix;

    private _mesh: Mesh2D

    private _material: Material;

    private _color: Color;

    private _renderColor = new Color(1, 1, 1, 1);

    private _texture: BaseTexture | Texture;

    private _textureTilingOffset: Vector4 = new Vector4(0, 0, 1, 1);

    private _tilingOffset: Vector4 = new Vector4(0, 0, 1, 1);

    constructor() {
        super();
        this._drawElementData = LayaGL.render2DRenderPassFactory.createDraw2DElementCMDData();
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        let temp = Vector4.TEMP.setValue(0, 0, 0, 0);
        this._shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATPOS, temp);
        temp.x = temp.w = Const.MAX_CLIP_SIZE;
        this._shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, temp);

        this._needUpdateElement = true;
        this._matrix = new Matrix();
    }

    _setMatrix(value: Matrix) {
        value ? value.copyTo(this._matrix) : Matrix.EMPTY.copyTo(this._matrix)
        let mat = this._matrix;
        let vec3 = Vector3.TEMP;
        vec3.x = mat.a;
        vec3.y = mat.c;
        vec3.z = mat.tx;
        //vec3.z = mat.tx + mat.a * px + mat.c * py;
        this._shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, vec3);
        vec3.x = mat.b;
        vec3.y = mat.d;
        vec3.z = mat.ty;
        //vec3.z = mat.ty + mat.b * px + mat.d * py;
        this._shaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, vec3);
    }

    set material(value: Material) {
        if (value == this.material)
            return;
        if (!value)
            value = Mesh2DRender.mesh2DDefaultMaterial;
        // this._mesh2DRender.sharedMaterial = value;

        this._material = value;
        this._needUpdateElement = true;
    }
    get material(): Material {
        return this._material;
    }

    set mesh(value: Mesh2D) {
        if (value == this.mesh)
            return;

        if (this._mesh) {
            let defines: ShaderDefine[] = [];
            VertexMesh2D.getMeshDefine(this._mesh, defines);
            for (var i: number = 0, n: number = defines.length; i < n; i++)
                this._shaderData.removeDefine(defines[i]);
        }

        if (value) {
            let defines: ShaderDefine[] = [];
            VertexMesh2D.getMeshDefine(value, defines);
            for (var i: number = 0, n: number = defines.length; i < n; i++)
                this._shaderData.addDefine(defines[i]);
        }

        this._mesh = value;
        this._needUpdateElement = true;
    }

    get mesh(): Mesh2D {
        return this._mesh;
    }

    set texture(value: BaseTexture | Texture) {
        if (this._texture instanceof Texture) {
            this._texture._removeReference();
        }
        this._texture = value;

        let baseTexture: BaseTexture;
        if (value instanceof Texture) {
            value._addReference();

            if (value.uv !== Texture.DEF_UV) {
                let sx = value.uvrect[2] / value.width;
                let sy = value.uvrect[3] / value.height;
                this._textureTilingOffset.setValue(
                    value.uvrect[0] - value.offsetX * sx,
                    value.uvrect[1] - value.offsetY * sy,
                    value.sourceWidth * sx,
                    value.sourceHeight * sy
                );
            } else {
                this._textureTilingOffset.setValue(0, 0, 1, 1);
            }
            baseTexture = value.bitmap;
        } else {
            this._textureTilingOffset.setValue(0, 0, 1, 1);
            baseTexture = value ? value : Texture2D.whiteTexture;
        }

        if (baseTexture.gammaCorrection != 1) {
            this._shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this._shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }

        this._tilingOffset.setValue(
            this._textureTilingOffset.x,
            this._textureTilingOffset.y,
            this._textureTilingOffset.z,
            this._textureTilingOffset.w
        );
        this._shaderData.setVector(BaseRenderNode2D.TILINGOFFSET, this._tilingOffset);
        this._shaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, baseTexture);
    }
    get texture(): BaseTexture | Texture {
        return this._texture;
    }

    set color(value: Color) {
        this._color = value;
        let renderColor: Color = this._renderColor;
        renderColor.setValue(value.r, value.g, value.b, value.a);
        this._shaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, renderColor);
    }
    get color(): Color {
        return this._color;
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): Draw2DElementCMD {
        return this._drawElementData;
    }

    /**
     * @en Runs the  command.
     * @zh 运行命令。
     */
    run(): void {

        if (this._needUpdateElement) {
            // this._drawElementData.setRenderelements(this._mesh2DRender._renderElements)
            let elementLength = this._renderElements.length;
            let subMeshCount = this._mesh.subMeshCount;
            let length = Math.max(elementLength, subMeshCount);
            for (let i = 0; i < length; i++) {
                let subMesh = this._mesh.getSubMesh(i);
                let element = this._renderElements[i];
                if (subMesh) {
                    if (!element) {
                        element = this._renderElements[i] = LayaGL.render2DRenderPassFactory.createRenderElement2D();
                    }
                    element.nodeCommonMap = ["BaseRender2D"];
                    element.geometry = subMesh;
                    element.renderStateIsBySprite = false;
                    element.value2DShaderData = this._shaderData;
                    element.materialShaderData = this._material.shaderData;
                    element.subShader = this._material._shader.getSubShaderAt(0);
                } else {
                    element.destroy();
                }
            }
            this._renderElements.length = length;
            this._drawElementData.setRenderelements(this._renderElements);
            this._needUpdateElement = false;
        }
        // this._mesh2DRender.addCMDCall()
        // this._mesh2DRender._setRenderSize(this._commandBuffer._renderSize.x, this._commandBuffer._renderSize.y);
    }

    /**
     * @inheritDoc
     * @override
     * @en Recovers the render command for reuse.
     * @zh 回收渲染命令以供重用。
     */
    recover(): void {
        DrawMesh2DCMD._pool.recover(this);
        super.recover();
        this.material = null;
        if (this._texture instanceof Texture) {
            this._texture._removeReference();
        }
        this._texture = null;
        this.mesh = null;
    }

    /**
     * @en Destroys the render command.
     * @zh 销毁渲染命令。
     */
    destroy(): void {
        super.destroy();
        this._shaderData.destroy();
        this._shaderData = null;
        this._mesh = null
        this._material = null;
    }
}