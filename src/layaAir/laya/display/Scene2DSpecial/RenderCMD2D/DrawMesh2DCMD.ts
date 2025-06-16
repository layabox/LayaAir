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
import { Texture2D } from "../../../resource/Texture2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { Mesh2DRender } from "../Mesh2DRender";
import { Command2D } from "./Command2D";

export class DrawMesh2DCMD extends Command2D {

    private static _pool: DrawMesh2DCMD[] = [];

    /**
     * @param mesh 
     * @param mat 
     * @param texture 
     * @param color 
     * @param material 
     * @returns 
     */
    static create(mesh: Mesh2D, mat: Matrix, texture: BaseTexture, color: Color, material: Material): DrawMesh2DCMD {
        var cmd = DrawMesh2DCMD._pool.length > 0 ? DrawMesh2DCMD._pool.pop() : new DrawMesh2DCMD();
        cmd.mesh = mesh;
        cmd.material = material || Mesh2DRender.mesh2DDefaultMaterial;
        cmd.texture = texture;
        cmd.color = color;
        cmd._setMatrix(mat);
        return cmd;
    }

    private _drawElementData: Draw2DElementCMD;

    // private _mesh2DRender: Mesh2DRender;

    private _renderElements : IRenderElement2D[] = [];

    private _shaderData:ShaderData;

    private _needUpdateElement: boolean;

    private _matrix: Matrix;

    private _mesh:Mesh2D

    private _matrial:Material;

    private _color:Color;

    private _renderColor = new Color(1,1,1,1);

    private _texture:BaseTexture;

    constructor() {
        super();
        this._drawElementData = LayaGL.render2DRenderPassFactory.createDraw2DElementCMDData();
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
        this._shaderData.setVector(BaseRenderNode2D.BASERENDER2DTEXTURERANGE, new Vector4(0,0,1,1));

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

        this._matrial = value;
        this._needUpdateElement = true;
    }
    get material(): Material {
        return this._matrial;
    }

    set mesh(value: Mesh2D) {
        if (value == this.mesh)
            return;

        if (this._mesh) {
            let defines:ShaderDefine[] = [];
            VertexMesh2D.getMeshDefine(this._mesh, defines);
            for (var i: number = 0, n: number = defines.length; i < n; i++)
                this._shaderData.removeDefine(defines[i]);
        }
        
        if (value) {
            let defines:ShaderDefine[] = [];
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

    set texture(value: BaseTexture) {
        value = value ? value : Texture2D.whiteTexture;
        
        if (value.gammaCorrection != 1) {//预乘纹理特殊处理
            this._shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            this._shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }
        this._texture = value;
        this._shaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE,value);
    }
    get texture(): BaseTexture {
        return this._texture;
    }

    set color(value: Color) {
        this._color = value;
        let a = value.a;
        let renderColor:Color = this._renderColor;
        renderColor.setValue(value.r * a, value.g * a, value.b * a, a);
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
            let length = Math.max(elementLength , subMeshCount);
            for (let i = 0; i < length; i++) {
                let subMesh = this._mesh.getSubMesh(i);
                let element = this._renderElements[i];
                if (subMesh) {
                    if (!element) {
                        element = this._renderElements[i]  = LayaGL.render2DRenderPassFactory.createRenderElement2D();
                    }
                    element.nodeCommonMap = ["BaseRender2D"];
                    element.geometry = subMesh;
                    element.renderStateIsBySprite = false;
                    element.value2DShaderData = this._shaderData;
                    element.materialShaderData = this._matrial.shaderData;
                    element.subShader = this._matrial._shader.getSubShaderAt(0);
                }else{
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
        DrawMesh2DCMD._pool.push(this);
        super.recover();
        this.material = null;
        this.texture = null;
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
        this._matrial = null;
    }
}