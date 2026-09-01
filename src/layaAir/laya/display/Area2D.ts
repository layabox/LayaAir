import { Camera2D } from "./Scene2DSpecial/Camera2D";
import { Sprite } from "./Sprite";
import { Node } from "./Node";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { LayaGL } from "../layagl/LayaGL";
import { I2DGlobalRenderData } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SpriteConst } from "./SpriteConst";
import { Matrix } from "../maths/Matrix";
import { Scene2DSpecialManager } from "./Scene2DSpecial/Scene2DSpecialManager";
import { LayaEnv } from "../../LayaEnv";
import { ILaya } from "../../ILaya";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";

export class Area2D extends Sprite {
    private _mainCamera: Camera2D;

    _globalRenderData: I2DGlobalRenderData;
    _globalShaderData: ShaderData;

    constructor() {
        super();
        this._renderType |= SpriteConst.AREA2D;
        this._initShaderData();
        this._globalRenderData = LayaGL.render2DRenderPassFactory.create2DGlobalRenderDataHandle();
        this._globalRenderData.globalShaderData = this._globalShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        this._globalShaderData.addDefine(Scene2DSpecialManager.SPRITE2DGLOBAL);
        this._globalRenderData.renderLayerMask = -1;
        this._struct.globalRenderData = this._globalRenderData;
    }

    get mainCamera(): Camera2D {
        return this._mainCamera;
    }

    _setMainCamera(camera: Camera2D) {
        if (camera == this._mainCamera || !LayaEnv.isPlaying)
            return;
        this._mainCamera && (this._mainCamera._isMain = false);

        if (camera) {
            camera._isMain = true;
            this._globalShaderData.addDefine(ShaderDefines2D.SHADERDEFINE_CAMERA2D);
        } else {
            this._globalShaderData.removeDefine(ShaderDefines2D.SHADERDEFINE_CAMERA2D);
        }

        this._mainCamera = camera;
    }

    /**
     * @en When a main camera exists, returns screen-sized bounds in Area2D local space,
     * so that the parent's RT covers the full screen for correct post-processing.
     * @zh 当存在主相机时，返回覆盖全屏的本地空间 bounds，
     * 使父级 RT 为屏幕大小，后处理可覆盖相机全视野。
     */
    getSelfBounds(out?: Rectangle, recursive?: boolean): Rectangle {
        if (this._mainCamera) {
            if (!out) out = new Rectangle();

            let invMatrix = Matrix.TEMP;
            this._globalTrans.getMatrixInv(invMatrix);

            let screenW = RenderState2D.width;
            let screenH = RenderState2D.height;

            // Transform all 4 screen corners to Area2D local space
            let a = invMatrix.a, b = invMatrix.b, c = invMatrix.c, d = invMatrix.d;
            let tx = invMatrix.tx, ty = invMatrix.ty;

            // corner (0, 0)
            let x0 = tx;
            let y0 = ty;
            // corner (screenW, 0)
            let x1 = a * screenW + tx;
            let y1 = b * screenW + ty;
            // corner (0, screenH)
            let x2 = c * screenH + tx;
            let y2 = d * screenH + ty;
            // corner (screenW, screenH)
            let x3 = a * screenW + c * screenH + tx;
            let y3 = b * screenW + d * screenH + ty;

            let minX = Math.min(x0, x1, x2, x3);
            let minY = Math.min(y0, y1, y2, y3);
            let maxX = Math.max(x0, x1, x2, x3);
            let maxY = Math.max(y0, y1, y2, y3);

            out.setTo(minX, minY, maxX - minX, maxY - minY);
            return out;
        }
        return super.getSelfBounds(out, recursive);
    }

    /**
     * @internal
     * @param ctx
     * @param x
     * @param y
     */
    render(): void {
        if (this._mainCamera) {
            if (this._globalShaderData) {
                this._globalRenderData.renderLayerMask = this._mainCamera.visiableLayer;
                this._globalRenderData.cullRect = this._mainCamera._rect;
                this._globalShaderData.setMatrix3x3(ShaderDefines2D.VIEW2D, this._mainCamera._getCameraTransform());
            }
        }
    }

    _setBelongScene(scene: Node): void {
        super._setBelongScene(scene);
        this._scene._area2Ds.add(this);
    }

    /**
      * @internal
      * @en Unset the node from its belong scene.
      * @zh 从所属场景中移除节点。
      */
    _setUnBelongScene(): void {
        this._scene._area2Ds.delete(this);
        super._setUnBelongScene();
    }

    localToView(x: number, y: number, out?: Point): Point {
        out = out || new Point();
        out.setTo(x, y);
        this.localToGlobal(out);
        this.transformPoint(out.x, out.y, out);
        return out;
    }

    /**
     * @en Convert screen coordinates to Area2D internal UI coordinates.
     * @param x The x axis of screen coordinates.
     * @param y The y axis of screen coordinates.
     * @param out The output point. If not passed, a new point will be created.
     * @returns The output point. 
     * @zh 将屏幕坐标转换为Area2D内部UI坐标
     * @param x 屏幕坐标的x轴.
     * @param y 屏幕坐标的y轴.
     * @param out 输出点，如果不传入，则会创建一个新的点。
     * @returns 输出点。
     */
    transformPoint(x: number, y: number, out?: Point): Point {
        out = out || new Point();
        out.setTo(x, y);

        if (!this._mainCamera) {
            // 如果没有主相机，屏幕坐标就是相对于Area2D的UI坐标
            return out;
        }

        let halfWidth = RenderState2D.width * 0.5;
        let halfHeight = RenderState2D.height * 0.5;
        let c_x = x * ILaya.stage.clientScaleX - halfWidth;
        let c_y = y * ILaya.stage.clientScaleY - halfHeight;
        // 获取相机的变换矩阵
        this._mainCamera._getCameraTransform();
        let cameraMatrix = this._mainCamera.cameraMatrix;
        let elements = cameraMatrix.elements;

        let newX = elements[0] * c_x + elements[3] * c_y + elements[6];
        let newY = elements[1] * c_x + elements[4] * c_y + elements[7];

        let matrix = Matrix.TEMP;
        this._globalTrans.getMatrixInv(matrix);
        out.x = matrix.a * newX + matrix.c * newY + matrix.tx;
        out.y = matrix.b * newX + matrix.d * newY + matrix.ty;

        return out;
    }

    /**
     * @en Convert Area2D internal UI coordinates to screen coordinates (inverse of transformPoint).
     * @param x The x axis of Area2D internal coordinates.
     * @param y The y axis of Area2D internal coordinates.
     * @param out The output point. If not passed, a new point will be created.
     * @returns The output point.
     * @zh 将Area2D内部UI坐标转换为屏幕坐标（transformPoint的逆操作）
     * @param x Area2D内部坐标的x轴.
     * @param y Area2D内部坐标的y轴.
     * @param out 输出点，如果不传入，则会创建一个新的点。
     * @returns 输出点。
     */
    inverseTransformPoint(x: number, y: number, out?: Point): Point {
        out = out || new Point();
        out.setTo(x, y);

        if (!this._mainCamera) {
            return out;
        }

        // Apply Area2D global transform (local → world)
        let globalMatrix = Matrix.TEMP;
        this._globalTrans.getMatrix(globalMatrix);
        let worldX = globalMatrix.a * x + globalMatrix.c * y + globalMatrix.tx;
        let worldY = globalMatrix.b * x + globalMatrix.d * y + globalMatrix.ty;

        // Apply view matrix (world → screen offset). _getCameraTransform() returns the inverse camera matrix.
        let viewMatrix = this._mainCamera._getCameraTransform();
        let ve = viewMatrix.elements;

        let camX = ve[0] * worldX + ve[3] * worldY + ve[6];
        let camY = ve[1] * worldX + ve[4] * worldY + ve[7];

        // Convert from camera space to screen coordinates
        let halfWidth = RenderState2D.width * 0.5;
        let halfHeight = RenderState2D.height * 0.5;
        let scaleX = ILaya.stage.clientScaleX;
        let scaleY = ILaya.stage.clientScaleY;
        out.x = (camX + halfWidth) / scaleX;
        out.y = (camY + halfHeight) / scaleY;

        return out;
    }
}