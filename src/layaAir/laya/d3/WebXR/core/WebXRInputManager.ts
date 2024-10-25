import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { PixelLineSprite3D } from "../../core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../../core/Sprite3D";
import { WebXRCameraManager } from "./WebXRCameraManager";
import { WebXRInput } from "./WebXRInput";
import { WebXRSessionManager } from "./WebXRSessionManager";


/**
 * @en The `WebXRInputManager` class is responsible for managing input devices in a WebXR environment.
 * - The path of the CDN from which the sample will fetch controller models:
 * - MeshSource https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.9/dist/profiles/
 * @zh `WebXRInputManager` 类用来在 WebXR 环境中管理输入设备。
 * - 样本将从此 CDN 路径获取控制器模型的路径：
 * - MeshSource <https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.9/dist/profiles/>
 */
export class WebXRInputManager {
    /**
     * Session Manager
     */
    private webXRSessionManager: WebXRSessionManager;
    /**
     * webXRCamera Manager
     */
    private webXRCameraManager: WebXRCameraManager;
    /**
     * array of XRInput
     */
    private controllers: Map<string, WebXRInput> = new Map();
    /**
     * bind of XRInput Node Render
     */
    private controllerHandMesh: Map<string, Sprite3D> = new Map();
    /**
     * bind of XRInput Ray Render
     */
    private controllerLineRender: Map<string, PixelLineSprite3D> = new Map();
    /**
     * line Color
     */
    private lineColor: Color = Color.RED;
    /**
     * Ray length
     */
    private rayLength: number = 2;

    /**
     * @en Creates a new instance of the `WebXRInputManager` class.
     * @param webxrManager WebXR Session manager
     * @param webXRCamera WebXR Manager
     * @zh 创建 WebXRInputManager 类的新实例
     * @param webxrManager WebXR 会话管理器
     * @param webXRCamera WebXR 管理器
     */
    constructor(webxrManager: WebXRSessionManager, webXRCamera: WebXRCameraManager) {
        this.webXRSessionManager = webxrManager;
        this.webXRCameraManager = webXRCamera;
        this.webXRSessionManager.on(WebXRSessionManager.EVENT_MANAGER_END, this, this.destory);
        this.webXRSessionManager.on(WebXRSessionManager.EVENT_FRAME_LOOP, this, this._updateFromXRFrame);
    }

    /**
     * 更新输入挂点
     * @param xrInput 
     */
    private _updataMeshRender(xrInput: WebXRInput) {
        const handness = xrInput.handness;
        //mesh
        if (this.controllerHandMesh.has(handness)) {
            let meshNode = this.controllerHandMesh.get(handness);
            meshNode.transform.position = xrInput.position;
            meshNode.transform.rotation = xrInput.rotation;
        }
        //rayLine
        if (this.controllerLineRender.has(handness)) {
            let line = this.controllerLineRender.get(handness);
            line.clear();
            let ray = xrInput.ray;
            tempVec.setValue(ray.origin.x, ray.origin.y, ray.origin.z);
            Vector3.scale(ray.direction, this.rayLength, tempVec1);
            Vector3.add(tempVec, tempVec1, tempVec1);
            line.addLine(tempVec, tempVec1, this.lineColor, this.lineColor);
        }
    }

    /**
     * WebXRInput帧循环
     * @param xrFrame 
     */
    private _updateFromXRFrame(xrFrame: any) {
        //frame, this.xrSessionManager.referenceSpace, this.xrCamera
        const session = this.webXRSessionManager.session;
        const refSpace = this.webXRSessionManager.referenceSpace;
        for (let inputSource of session.inputSources) {
            const key = inputSource.handedness;
            let xrInput: WebXRInput;
            if (!this.controllers.has(key)) {
                xrInput = this.getController(key);
            } else
                xrInput = this.controllers.get(key);
            if (xrInput) {
                xrInput = this.controllers.get(key);
                xrInput._inputSource = inputSource;
                xrInput._updateByXRPose(xrFrame, refSpace);
            }

        }
    }

    /**
     * @en Binds a rendering node to the input device.
     * @param meshSprite The rendering sprite to bind.
     * @param handness The handness of the device, "left" or "right".
     * @zh 将渲染节点绑定到输入设备。
     * @param meshSprite 渲染挂点。
     * @param handness 设备名称，"left" 或 "right"。
     */
    bindMeshNode(meshSprite: Sprite3D, handness: string) {
        this.controllerHandMesh.set(handness, meshSprite);
    }

    /**
     * @en Binds a ray to the input device for visual representation.
     * @param lineSprite The line sprite to bind as a ray.
     * @param handness The handness of the device, "left" or "right".
     * @zh 为输入设备绑定射线以进行可视化表示。
     * @param lineSprite 作为射线绑定的线条精灵。
     * @param handness 设备名称，"left" 或 "right"。
     */
    bindRayNode(lineSprite: PixelLineSprite3D, handness: string) {
        this.controllerLineRender.set(handness, lineSprite);
    }

    /**
     * @en Retrieves the input device based on the specified handness.
     * @param handness The handness of the device, "left" or "right".
     * @returns The WebXRInput instance or null if handness is not valid.
     * @zh 根据指定的设备名称获得输入设备。
     * @param handness 设备名称，"left" 或 "right"。
     * @returns 返回 WebXRInput 实例，如果手部设备名称无效则返回 null。
     */
    getController(handness: string): WebXRInput {
        if (handness != "left" && handness != "right")
            return null;
        if (!this.controllers.has(handness)) {
            let value = new WebXRInput(handness);
            this.controllers.set(handness, value);
            value.on(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT, this, this._updataMeshRender);
        }
        return this.controllers.get(handness);
    }

    /**
     * @en Destroys and cleans up the WebXR input manager.
     * @zh 销毁并清理 WebXR 输入管理器。
     */
    destory() {
        this.webXRSessionManager.off(WebXRSessionManager.EVENT_FRAME_LOOP, this, this._updateFromXRFrame);
        for (let key in this.controllers) {
            this.controllers.get(key).off("frameXRInputUpdate", this, this._updataMeshRender);
            this.controllers.get(key).destroy();
        }
        this.controllers = null;
        this.controllerHandMesh = null;
        this.controllerLineRender = null;
    }
}

const tempVec: Vector3 = new Vector3();
const tempVec1: Vector3 = new Vector3();