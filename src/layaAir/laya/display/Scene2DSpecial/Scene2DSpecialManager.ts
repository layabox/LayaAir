import { LayaGL } from "../../layagl/LayaGL";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Context } from "../../renders/Context";
import { Camera2D } from "./Camera2D";

export class Scene2DSpecialManager {
    /**@internal */
    _shaderData: ShaderData;

    _mainCamera: Camera2D;
    constructor() {
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    }

    _setMainCamera(camera: Camera2D) {
        if (camera == this._mainCamera)
            return;
        this._mainCamera && (this._mainCamera._isMain = false);
        this._mainCamera = camera;
        this._mainCamera._isMain = true;
        if (this._mainCamera) {
            this._shaderData.addDefine(Camera2D.SHADERDEFINE_CAMERA2D)
        } else {
            this._shaderData.removeDefine(Camera2D.SHADERDEFINE_CAMERA2D);
        }
    }


    _preRenderUpdate(context:Context) {
        if (this._mainCamera) {
            context.drawLeftData();
            this._shaderData.setMatrix3x3(Camera2D.VIEW2D, this._mainCamera._getCameraTransform());
        }
    }

}