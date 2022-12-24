import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { PixelLineSprite3D } from "../../core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../../core/Sprite3D";
import { WebXRCameraManager } from "./WebXRCameraManager";
import { WebXRInput } from "./WebXRInput";
import { WebXRSessionManager } from "./WebXRSessionManager";


/**
 * @author miner
 * 类用来管理输入设备
 * The path of the CDN the sample will fetch controller models from：
 * MeshSource https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.9/dist/profiles/
 */
export class WebXRInputManager {
    static tempVec: Vector3 = new Vector3();
    static tempVec1: Vector3 = new Vector3();
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
     * 类用于创建WebXRInput管理类
     * @param webxrManager WebXR Session manager
     * @param webXRCamera WebXR Manager
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
            WebXRInputManager.tempVec.setValue(ray.origin.x, ray.origin.y, ray.origin.z);
            Vector3.scale(ray.direction, this.rayLength, WebXRInputManager.tempVec1);
            Vector3.add(WebXRInputManager.tempVec, WebXRInputManager.tempVec1, WebXRInputManager.tempVec1);
            line.addLine(WebXRInputManager.tempVec, WebXRInputManager.tempVec1, this.lineColor, this.lineColor);
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
            }else
                xrInput = this.controllers.get(key);
            if(xrInput){
                xrInput = this.controllers.get(key);
                xrInput._inputSource = inputSource;
                xrInput._updateByXRPose(xrFrame, refSpace);
            }
            
        }
    }

    /**
     * 绑定输入设备渲染节点
     * @param meshSprite 渲染挂点
     * @param handness 设备名称left/right
     */
    bindMeshNode(meshSprite: Sprite3D, handness: string) {
        this.controllerHandMesh.set(handness, meshSprite);
    }

    /**
     * 绑定输入设备射线
     * @param lineSprite 线
     * @param handness 设备名称left/right
     */
    bindRayNode(lineSprite: PixelLineSprite3D, handness: string) {
        this.controllerLineRender.set(handness, lineSprite);
    }

    /**
     * 获得输入设备
     * @param handness 设备名称left/right
     * @returns 
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
     * @internal
     * 删除
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

