import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Vector3 } from "../../../maths/Vector3";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { Draw2DElementCMD } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Mesh2D } from "../../../resource/Mesh2D";
import { Mesh2DRender } from "../Mesh2DRender";
import { Command2D } from "./Command2D";

export class DrawMesh2DCMD extends Command2D {

    private static _pool: DrawMesh2DCMD[] = [];

    /**
     * @param mesh 
     * @param mat 
     * @param meshTexture 
     * @param color 
     * @param material 
     * @returns 
     */
    static create(mesh: Mesh2D, mat: Matrix, texture: BaseTexture, color: Color, material: Material): DrawMesh2DCMD {
        var cmd = DrawMesh2DCMD._pool.length > 0 ? DrawMesh2DCMD._pool.pop() : new DrawMesh2DCMD();
        cmd.mesh = mesh;
        cmd.material = material;
        cmd.texture = texture;
        cmd.color = color;
        cmd._setMatrix(mat);
        return cmd;
    }

    private _drawElementData: Draw2DElementCMD;

    private _mesh2DRender: Mesh2DRender;

    private _needUpdateElement: boolean;

    private _matrix: Matrix;

    constructor() {
        super();
        this._drawElementData = LayaGL.render2DRenderPassFactory.createDraw2DElementCMDData();
        this._mesh2DRender = new Mesh2DRender();
        this._needUpdateElement = true;
        this._matrix = new Matrix();
    }

    _setMatrix(value: Matrix) {
        value ? value.copyTo(this._matrix) : Matrix.EMPTY.copyTo(this._matrix)
        let mat = this._matrix;
        let vec3 = Vector3._tempVector3;
        vec3.x = mat.a;
        vec3.y = mat.b;
        vec3.z = mat.tx;
        //vec3.z = mat.tx + mat.a * px + mat.c * py;
        this._mesh2DRender._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, vec3);
        vec3.x = mat.c;
        vec3.y = mat.d;
        vec3.z = mat.ty;
        //vec3.z = mat.ty + mat.b * px + mat.d * py;
        this._mesh2DRender._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, vec3);
    }

    set material(value: Material) {
        if (value == this.material)
            return;
        if (!value)
            value = Mesh2DRender.mesh2DDefaultMaterial;
        this._mesh2DRender.sharedMaterial = value;
        this._needUpdateElement = true;
    }
    get material(): Material {
        return this._mesh2DRender.sharedMaterial;
    }

    set mesh(value: Mesh2D) {
        if (value == this.mesh)
            return;
        this._mesh2DRender.shareMesh = value;
        this._needUpdateElement = true;
    }

    get mesh(): Mesh2D {
        return this._mesh2DRender.shareMesh;
    }

    set texture(value: BaseTexture) {
        this._mesh2DRender.texture = value;
    }
    get texture(): BaseTexture {
        return this._mesh2DRender.texture;
    }

    set color(value: Color) {
        this._mesh2DRender.color = value;
    }
    get color(): Color {
        return this._mesh2DRender.color;
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
            this._drawElementData.setRenderelements(this._mesh2DRender._renderElements)
            this._needUpdateElement = false;
        }
        this._mesh2DRender._setRenderSize(this._commandBuffer._renderSize.x, this._commandBuffer._renderSize.y);
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
        this.material = null;
    }
}