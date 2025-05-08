import { Camera2D } from "./Scene2DSpecial/Camera2D";
import { Sprite } from "./Sprite";
import { Scene } from "./Scene";
import { Node } from "./Node";
import { Point } from "../maths/Point";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { NodeFlags } from "../Const";
import { Vector4 } from "../maths/Vector4";

const TEMP_Vector4 = new Vector4(0, 0, 0, 0);
export class Area2D extends Sprite {
    private _mainCamera: Camera2D;
    declare _scene: Scene;

    constructor() {
        super();
        this._setBit(NodeFlags.AREA_2D, true);
    }

    get mainCamera(): Camera2D {
        return this._mainCamera;
    }

    _setMainCamera(camera: Camera2D) {
        if (camera == this._mainCamera)
            return;
        this._mainCamera && (this._mainCamera._isMain = false);
        this._mainCamera = camera;
        if (this._mainCamera) {
            this._mainCamera._isMain = true;
        }
    }

    _preRenderUpdate() {
        let shaderData = this._scene.sceneShaderData;
        if (this._mainCamera) {
            //context.drawLeftData();
            if (shaderData) {
                shaderData.addDefine(Camera2D.SHADERDEFINE_CAMERA2D);
                shaderData.setMatrix3x3(Camera2D.VIEW2D, this._mainCamera._getCameraTransform());
            }
        }
    }

    /**
     * @internal
     * @param ctx 
     * @param x 
     * @param y 
     */
    render( x: number, y: number): void {
        // this._preRenderUpdate();
        // this._scene._curCamera = this._mainCamera;
        // let mgr = ctx._render2DManager;
        // let restoreMask = mgr.renderLayerMask;
        // mgr.renderLayerMask = this._mainCamera.visiableLayer;
        
        // mgr.cullRect.cloneTo(TEMP_Vector4);

        // let rect = this._mainCamera._rect;
        // mgr.cullRect = Vector4.TEMP.setValue(rect.x , rect.z , rect.y , rect.w);
        
        // super.render(ctx, x, y);
        // if (this._mainCamera) {
        //     let shaderData = this._scene.sceneShaderData;
        //     ctx.drawLeftData();
        //     if (shaderData) {
        //         shaderData.removeDefine(Camera2D.SHADERDEFINE_CAMERA2D);
        //     }
        // }
        
        // this._scene._curCamera = null;
        // mgr.cullRect = TEMP_Vector4;
        // mgr.renderLayerMask = restoreMask;
    }   

    _setBelongScene(scene: Node): void {
        super._setBelongScene(scene);
        this._scene._area2Ds.push(this);
    }

    /**
      * @internal
      * @en Unset the node from its belong scene.
      * @zh 从所属场景中移除节点。
      */
    _setUnBelongScene(): void {
        let areaArray = this._scene._area2Ds;
        let index = areaArray.indexOf(this);
        if (index != -1) {
            areaArray.splice(index, 1);
        }

        super._setUnBelongScene();
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
        if (!this._mainCamera)
            return out;

        //如果之前没有Camera，根据scene计算screen坐标
        this.localToGlobal(out);
        //根据camera计算实际的world坐标
        this.mainCamera.localToGlobal(out);
        //根据实际坐标计算scene的实际local坐标
        out.x -= RenderState2D.width * 0.5;
        out.y -= RenderState2D.height * 0.5;
        this.globalToLocal(out);
        return out;
    }
}