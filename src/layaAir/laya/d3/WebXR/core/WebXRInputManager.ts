import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { WebXRCameraManager } from "./WebXRCameraManager";
import { WebXRInput } from "./WebXRInput";
import { WebXRSessionManager } from "./WebXRSessionManager";

/**
 * 控制器管理类
 * The path of the CDN the sample will fetch controller models from：
 * https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.9/dist/profiles/
 */
export class WebXRInputManager{
    static tempVec:Vector3 = new Vector3();
    static tempVec1:Vector3 = new Vector3();
    private webXRSessionManager:WebXRSessionManager;
    private webXRCameraManager:WebXRCameraManager;
    private controllers:Map<string,WebXRInput> = new Map();
    private controllerHandMesh:Map<string,Sprite3D> = new Map();
    private controllerLineRender:Map<string,PixelLineSprite3D> = new Map();
    private lineColor:Color = Color.RED;
    private rayLength:number = 2;
    
    constructor(webxrManager:WebXRSessionManager,webXRCamera:WebXRCameraManager){
        this.webXRSessionManager = webxrManager;
        this.webXRCameraManager = webXRCamera;
        //TODO退出事件
        //TODO帧循环事件
        this.webXRSessionManager.on("xrFrameLoop",this,this._updateFromXRFrame);
    }

    /**
     * 
     * @param meshSprite 
     * @param bindInput 
     */
    bindMeshNode(meshSprite:Sprite3D,bindInput:string){
        this.controllerHandMesh.set(bindInput,meshSprite);
    }
    /**
     * 
     * @param lineSprite 
     * @param bindInput 
     */
    bindRayNode(lineSprite:PixelLineSprite3D,bindInput:string){
        this.controllerLineRender.set(bindInput,lineSprite);
    }

    _updateFromXRFrame(xrFrame:any){
        //frame, this.xrSessionManager.referenceSpace, this.xrCamera
        const session = this.webXRSessionManager.session;
        const refSpace = this.webXRSessionManager.referenceSpace;
        for (let inputSource of session.inputSources) {
            const key = inputSource.handedness;
            let xrInput:WebXRInput;
            if(!this.controllers.has(key)){
                xrInput = this.getController(key,inputSource);
            }
            
            xrInput = this.controllers.get(key);
            xrInput._inputSource = inputSource;
            xrInput._updateByXRPose(xrFrame,refSpace);
        }
    }

    /**
     * 
     * @param handness left/right
     */
    getController(handness:string,inputsource:any = null):WebXRInput{
        if(handness!="left"&&handness!="right")
            return null;
        if(!this.controllers.has(handness)){
            let value = new WebXRInput(handness,inputsource);
            this.controllers.set(handness,value);
            value.on("frameXRInputUpdate",this,this.updataMeshRender);
        }
        return this.controllers.get(handness);
    }

    /**
     * 
     * @param xrInput 
     */
    updataMeshRender(xrInput:WebXRInput){
        const handness = xrInput.handness;
        //mesh
        if(this.controllerHandMesh.has(handness)){
            let meshNode = this.controllerHandMesh.get(handness);
            meshNode.transform.position = xrInput.position;
            meshNode.transform.rotation = xrInput.rotation;
        }
        //rayLine
        if(this.controllerLineRender.has(handness)){
            let line = this.controllerLineRender.get(handness);
            line.clear();
            let ray = xrInput.ray;
            WebXRInputManager.tempVec.setValue(ray.origin.x,ray.origin.y,ray.origin.z);
            Vector3.scale(ray.direction,this.rayLength,WebXRInputManager.tempVec1);
            Vector3.add(WebXRInputManager.tempVec,WebXRInputManager.tempVec1,WebXRInputManager.tempVec1);
            line.addLine(WebXRInputManager.tempVec,WebXRInputManager.tempVec1,this.lineColor,this.lineColor);
        }
    }



    /**
     * 删除
     */
    destory(){
        this.webXRSessionManager.off("xrFrameLoop",this,this._updateFromXRFrame);
        for(let key in this.controllers){
            this.controllers.get(key).off("getVexXRInputInfo",this,this.updataMeshRender);
        }
    }
}

