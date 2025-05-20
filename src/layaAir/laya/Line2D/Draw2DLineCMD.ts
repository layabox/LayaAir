import { LayaGL } from "../layagl/LayaGL";
import { Line2DRender } from "./Line2DRender";
import { Color } from "../maths/Color";
import { Matrix } from "../maths/Matrix";
import { Vector3 } from "../maths/Vector3";
import { Draw2DElementCMD } from "../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { Command2D } from "../display/Scene2DSpecial/RenderCMD2D/Command2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { LineShader } from "./shader/Line2DShader";
import { Sprite } from "../display/Sprite";
import { IRenderStruct2D } from "../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { SpriteGlobalTransform } from "../display/SpriteGlobaTransform";

export class Draw2DLineCMD extends Command2D {
    private static _pool: Draw2DLineCMD[] = [];

    static create(pointArray: number[], mat: Matrix, color: Color = Color.WHITE, lineWidth: number = 3) {
        var cmd = Draw2DLineCMD._pool.length > 0 ? Draw2DLineCMD._pool.pop() : new Draw2DLineCMD();
        // cmd.color = color;
        // cmd.positions = pointArray;
        // cmd.lineWidth = lineWidth;
        cmd._line2DRender.color = color;
        cmd._line2DRender.positions = pointArray;
        cmd._line2DRender.lineWidth = lineWidth;
        cmd._setMatrix(mat);
        return cmd;
    }

    private _drawElementData: Draw2DElementCMD;
    _line2DRender: Line2DRender;
    private _needUpdateElement: boolean;
    private _matrix: Matrix;
    private _shaderData:ShaderData;
    private _struct:IRenderStruct2D;

    constructor() {
        super();
        this._drawElementData = LayaGL.render2DRenderPassFactory.createDraw2DElementCMDData();
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);

        this._struct = LayaGL.render2DRenderPassFactory.createRenderStruct2D();

        // this._struct.transform = new SpriteGlobalTransform(null);
        this._line2DRender = new Line2DRender;
        this._line2DRender._struct = this._struct;
        this._line2DRender._initRender();
        this._line2DRender._spriteShaderData = this._shaderData;

        this._matrix = new Matrix();

        this._line2DRender.enableDashedMode = false;
        this._drawElementData.setRenderelements(this._line2DRender._renderElements)
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
        this._line2DRender.onPreRender();
        if (this._needUpdateElement) {
            this._drawElementData.setRenderelements(this._line2DRender._renderElements)
            this._needUpdateElement = false;
        }
    }


    /**
     * @inheritDoc
     * @override
     * @en Recovers the render command for reuse.
     * @zh 回收渲染命令以供重用。
     */
    recover(): void {
        Draw2DLineCMD._pool.push(this);
        super.recover();
    }

}