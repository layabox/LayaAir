import { Command2D } from "../../display/Scene2DSpecial/RenderCMD2D/Command2D";
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Matrix } from "../../maths/Matrix";
import { Vector3 } from "../../maths/Vector3";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { Draw2DElementCMD } from "../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { CullMode } from "../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Material } from "../../resource/Material";
import { Pool } from "../../utils/Pool";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { PhysicsLineGemetry } from "./PhysicsLineGemetry";
import { PhysicsLineShader } from "./shader/PhysicsLineShader";


export class PhysicsDrawLine2DCMD extends Command2D {
    private static readonly _pool = Pool.createPool(PhysicsDrawLine2DCMD);
    _renderElements: IRenderElement2D[] = [];
    private _physicsGeometry: PhysicsLineGemetry;
    private _material: Material;

    get physicsGeometry(): PhysicsLineGemetry {
        return this._physicsGeometry;
    }

    static create(pointArray: number[], mat: Matrix, color: Color = Color.WHITE, lineWidth: number = 3) {
        var cmd = PhysicsDrawLine2DCMD._pool.take();
        cmd.physicsGeometry.positions = pointArray;
        cmd.lineWidth = lineWidth;
        cmd.color = color;
        cmd._needUpdateElement = true;
        cmd._setMatrix(mat);
        return cmd;
    }

    private _drawElementData: Draw2DElementCMD;
    private _needUpdateElement: boolean;
    private _matrix: Matrix;
    private _shaderData: ShaderData;
    private _struct: IRenderStruct2D;
    private _renderGeometry: IRenderGeometryElement;
    constructor() {
        super();
        this._material = new Material();
        // The pooled command owns this material for its entire lifetime.
        this._material._addReference();
        this._material.setShaderName("PhysicsLineShader");
        this._material.cull = CullMode.Off;
        this._material.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
        this._material.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        this._material.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        this._material.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        this._material.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        this._material.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        this._material.setFloatByIndex(ShaderDefines2D.UNIFORM_VERTALPHA, 1.0);
        this._material.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
        this._drawElementData = LayaGL.render2DRenderPassFactory.createDraw2DElementCMDData();
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);

        this._struct = LayaGL.render2DRenderPassFactory.createRenderStruct2D();
        this._renderElements[0] = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        this._physicsGeometry = new PhysicsLineGemetry();
        this._physicsGeometry.updateGeometry();
        this._renderElements[0].nodeCommonMap = ["BaseRender2D"];

        BaseRenderNode2D._setRenderElement2DMaterial(this._renderElements[0], this._material);
        this._matrix = new Matrix();

    }

    set lineWidth(value: number) {
        this._material.shaderData.setNumber(PhysicsLineShader.LINEWIDTH, value);
    }

    set color(value: Color) {
        this._shaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, value);
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
        // this._line2DRender.onPreRender();
        if (this._needUpdateElement) {
            this.physicsGeometry.updateGeometry();
            this._renderElements[0].geometry = this._renderGeometry = this._physicsGeometry.renderGeometry;
            this._renderElements[0].renderStateIsBySprite = false;
            this._renderElements[0].value2DShaderData = this._shaderData;
            this._renderElements[0].materialShaderData = this._material.shaderData;
            this._renderElements[0].subShader = this._material._shader.getSubShaderAt(0);
            this._drawElementData.setRenderelements(this._renderElements);
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
        PhysicsDrawLine2DCMD._pool.recover(this);
        super.recover();
    }

}
