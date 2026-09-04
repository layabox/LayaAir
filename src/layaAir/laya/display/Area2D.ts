import { Camera2D } from "./Scene2DSpecial/Camera2D";
import { Sprite } from "./Sprite";
import { Node } from "./Node";
import { Point } from "../maths/Point";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { LayaGL } from "../layagl/LayaGL";
import { I2DGlobalRenderData } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SpriteConst } from "./SpriteConst";
import { Matrix } from "../maths/Matrix";
import { LayaEnv } from "../../LayaEnv";
import { ILaya } from "../../ILaya";

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
            this._globalShaderData.addDefine(Camera2D.SHADERDEFINE_CAMERA2D);
        } else {
            this._globalShaderData.removeDefine(Camera2D.SHADERDEFINE_CAMERA2D);
        }

        this._mainCamera = camera;
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
                this._globalShaderData.setMatrix3x3(Camera2D.VIEW2D, this._mainCamera._getCameraTransform());
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
        // Use globalTrans.localToGlobal (cached path) which includes Stage scale,
        // producing pixel-space coordinates consistent with RenderState2D dimensions
        // and the camera matrix. Sprite.localToGlobal stops before Stage, returning
        // design-space coordinates that mismatch with the pixel-space camera transform.
        let p = this.globalTrans.localToGlobal(x, y);
        let px = p.x, py = p.y;
        this.transformPoint(px, py, out);
        return out;
    }

    /**
     * @en Converts Stage logical coordinates to Area2D internal coordinates, taking the main Camera2D into account.
     * Stage logical coordinates do not include the scaling represented by `Stage.clientScaleX/Y`.
     * @param x The x coordinate in the Stage logical coordinate system.
     * @param y The y coordinate in the Stage logical coordinate system.
     * @param out The output point. If not passed, a new point will be created.
     * @returns The output point. 
     * @zh 将 Stage 逻辑坐标转换为 Area2D 内部坐标，转换过程会考虑主 Camera2D。
     * Stage 逻辑坐标不包含 `Stage.clientScaleX/Y` 所表示的缩放，鼠标事件的舞台坐标可直接传入。
     * @param x Stage 逻辑坐标系中的 x 坐标。
     * @param y Stage 逻辑坐标系中的 y 坐标。
     * @param out 输出点，如果不传入，则会创建一个新的点。
     * @returns 输出点。
     */
    transformPoint(x: number, y: number, out?: Point): Point {
        out = out || new Point();
        out.setTo(x, y);

        if (!this._mainCamera) {
            // 如果没有主相机，Stage 逻辑坐标就是相对于 Area2D 的内部坐标。
            return out;
        }

        let halfWidth = RenderState2D.width * 0.5;
        let halfHeight = RenderState2D.height * 0.5;
        // x/y 是舞台逻辑坐标，而 RenderState2D 使用渲染画布坐标。
        // clientScale 不为 1 时必须先进入同一坐标系再计算相对视口中心的位置。
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
     * @en Converts Area2D internal coordinates to Stage logical coordinates. This is the inverse operation of `transformPoint`.
     * The returned coordinates do not include the scaling represented by `Stage.clientScaleX/Y` and can be used directly by Stage display objects.
     * @param x The x coordinate in the Area2D internal coordinate system.
     * @param y The y coordinate in the Area2D internal coordinate system.
     * @param out The output point. If not passed, a new point will be created.
     * @returns The output point.
     * @zh 将 Area2D 内部坐标转换为 Stage 逻辑坐标，是 `transformPoint` 的逆运算。
     * 返回值不包含 `Stage.clientScaleX/Y` 所表示的缩放，可直接用于 Stage 显示对象，无需调用者再次处理 clientScale。
     * @param x Area2D 内部坐标系中的 x 坐标。
     * @param y Area2D 内部坐标系中的 y 坐标。
     * @param out 输出点，如果不传入，则会创建一个新的点。
     * @returns 输出点。
     */
    inverseTransformPoint(x: number, y: number, out?: Point): Point {
        out = out || new Point();
        out.setTo(x, y);

        if (!this._mainCamera) {
            return out;
        }

        // transformPoint 最后使用 Area2D 全局矩阵的逆矩阵，这里先用正矩阵还原。
        let areaMatrix = this._globalTrans.getMatrix();
        let globalX = areaMatrix.a * x + areaMatrix.c * y + areaMatrix.tx;
        let globalY = areaMatrix.b * x + areaMatrix.d * y + areaMatrix.ty;

        // 渲染使用的是相机矩阵的逆矩阵（view matrix）。
        let viewElements = this._mainCamera._getCameraTransform().elements;
        out.x = (viewElements[0] * globalX + viewElements[3] * globalY + viewElements[6] + RenderState2D.width * 0.5) / ILaya.stage.clientScaleX;
        out.y = (viewElements[1] * globalX + viewElements[4] * globalY + viewElements[7] + RenderState2D.height * 0.5) / ILaya.stage.clientScaleY;

        return out;
    }
}
