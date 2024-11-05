import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { Matrix } from "../../../maths/Matrix";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { Draw2DElementCMD } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Command2D } from "./Command2D";

export class DrawRenderElement2DCMD extends Command2D {
    private static _pool: DrawRenderElement2DCMD[] = [];

    static create(element: IRenderElement2D, mat: Matrix = null): DrawRenderElement2DCMD {
        var cmd = DrawRenderElement2DCMD._pool.length > 0 ? DrawRenderElement2DCMD._pool.pop() : new DrawRenderElement2DCMD();
        cmd.renderElement = element;
        cmd._setMatrix(mat);
        return cmd;
    }

    private _matreix: Matrix;
    private _renderElement: IRenderElement2D;
    private _renderSize: Vector2;

    /**
     * @en The render element of this command.
     * @zh 此命令的渲染元素。
     */
    get renderElement(): IRenderElement2D {
        return this._renderElement;
    }

    set renderElement(value: IRenderElement2D) {
        this._renderElement = value;
        this._drawElementCMDData.setRenderelements([this._renderElement]);
    }



    /**@internal */
    _drawElementCMDData: Draw2DElementCMD;

    constructor() {
        super();
        this._drawElementCMDData = LayaGL.render2DRenderPassFactory.createDraw2DElementCMDData();
        this._renderSize = new Vector2();
    }

    _setMatrix(value: Matrix) {
        value ? (this._matreix = value.clone()) : (this._matreix = null);
        if (this._matreix && this.renderElement.nodeCommonMap.indexOf("BaseRender2D") != -1) {
            let vec3 = Vector3._tempVector3;
            vec3.x = this._matreix.a;
            vec3.y = this._matreix.b;
            vec3.z = this._matreix.tx;
            //vec3.z = mat.tx + mat.a * px + mat.c * py;
            this._renderElement.value2DShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, vec3);
            vec3.x = this._matreix.c;
            vec3.y = this._matreix.d;
            vec3.z = this._matreix.ty;
            //vec3.z = mat.ty + mat.b * px + mat.d * py;
            this._renderElement.value2DShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, vec3);
        }
    }

    run(): void {
        if (Vector2.equals(this._renderSize, this._commandBuffer._renderSize))
            return;
        this._renderSize.setValue(this._commandBuffer._renderSize.x, this._commandBuffer._renderSize.y);
        this._renderElement.value2DShaderData.setVector2(BaseRenderNode2D.BASERENDERSIZE, this._renderSize);
    }

    /**
     * @inheritDoc
     * @override
     * @en Recovers the command for reuse.
     * @zh 回收命令以供重用。
     */
    recover(): void {
        super.recover();
        DrawRenderElement2DCMD._pool.push(this);
    }

    /**
    * @override
    * @internal
    * @en Gets the render command data.
    * @zh 获取渲染命令数据。
    */
    getRenderCMD(): Draw2DElementCMD {
        return this._drawElementCMDData;
    }

    /**
     * @en Destroys the command.
     * @zh 销毁命令。
     */
    destroy() {
        this._renderElement = null;
        this._drawElementCMDData = null;
    }

}