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
        x *= ILaya.stage.scaleX;
        y *= ILaya.stage.scaleY;

        let halfWidth = RenderState2D.width * 0.5;
        let halfHeight = RenderState2D.height * 0.5;
        let c_x = x - halfWidth;
        let c_y = y - halfHeight;
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
}