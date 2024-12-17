import { Context } from "../renders/Context";
import { Camera2D } from "./Scene2DSpecial/Camera2D";
import { Sprite } from "./Sprite";
import { Scene } from "./Scene";
import { Node } from "./Node";

export class Area2D extends Sprite {
    private _mainCamera: Camera2D;
    declare _scene: Scene;
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

    _preRenderUpdate(context: Context) {
        let shaderData = this._scene.sceneShaderData;
        if (this._mainCamera) {
            context.drawLeftData();
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
    render(ctx: Context, x: number, y: number): void {
        this._preRenderUpdate(ctx);
        this._scene._curCamera = this.mainCamera;
        super.render(ctx, x, y);
        if (this._mainCamera) {
            let shaderData = this._scene.sceneShaderData;
            ctx.drawLeftData();
            if (shaderData) {
                shaderData.removeDefine(Camera2D.SHADERDEFINE_CAMERA2D);
            }
        }
        this._scene._curCamera = null;

    }

    _setBelongScene(scene: Node): void {
        super._setBelongScene(scene);
        this._scene._Area2Ds.push(this);
    }

    /**
      * @internal
      * @en Unset the node from its belong scene.
      * @zh 从所属场景中移除节点。
      */
    _setUnBelongScene(): void {
        let areaArray = this._scene._Area2Ds
        let index = areaArray.indexOf(this);
        if (index != -1) {
            areaArray.splice(index, 1);
        }

        super._setUnBelongScene();
    }
}