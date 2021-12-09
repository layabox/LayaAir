
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { WebXRCamera } from "./WebXRCamera";
import { WebXRRenderTexture } from "./WebXRRenderTexture";
import { WebXRSessionManager } from "./WebXRSessionManager";

/**
 * @author miner
 * 此类用来管理XRCamera
 */
export class WebXRCameraManager {
    private _referenceQuaternion: Quaternion = new Quaternion();
    private _referencedPosition: Vector3 = new Vector3();
    private _webXRSessionManager: WebXRSessionManager;
    private _lastXRViewerPose:any;//: XRViewerPose;
    private _firstFrame = true;//初始帧
    private _XRRenderTexture:WebXRRenderTexture = new WebXRRenderTexture();
    /**control Camera */
    public _rigCameras = new Array<WebXRCamera>();
    /**camera Position */
    public _position = new Vector3();
    
    public owner: any;

    
    
    public get position(): Vector3 {
        return this._position;
    }

    public set position(newPosition: Vector3) {

        newPosition.cloneTo(this._position);
    }


    public set rotationQuaternion(value: Quaternion) {
        value.cloneTo(this._referenceQuaternion);
    }
    public get rotationQuaternion(): Quaternion {
        return this._referenceQuaternion;
    }

    /** @hidden */
    public get rigCameras(): WebXRCamera[] {
        return this._rigCameras;
    }

    constructor(camera: any, manager: WebXRSessionManager = null) {
        this.owner = camera;
        this.owner.enableRender = false;
        if(!this.owner.aspectRatio){
            console.warn("owner is not Camera");
        }
        this._webXRSessionManager = manager;
        this._webXRSessionManager.on("xrFrameLoop",this,this._updateFromXRSession);
        this._webXRSessionManager.on("xrFrameLoop",this,this._updateReferenceSpace);
    }


    _updateFromXRSession() {
        //XRViewerPose
        let pose = this._webXRSessionManager.currentFrame && this._webXRSessionManager.currentFrame.getViewerPose(this._webXRSessionManager.referenceSpace);
        this._lastXRViewerPose = pose || undefined;

        const pos = pose.transform.position;
        const orientation = pose.transform.orientation;
        this._referenceQuaternion.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
        this._referencedPosition.setValue(pos.x, pos.y, pos.z);

        if (this._firstFrame) {
            this._firstFrame = false;
            this.position.y += this._referencedPosition.y;
            // avoid using the head rotation on the first frame.
            this._referenceQuaternion.setValue(0, 0, 0, 1);
        } else {
            // update position and rotation as reference
            this.rotationQuaternion = this._referenceQuaternion;
            this.position = this._referencedPosition;
        }
        // Update camera rigs
        if (this.rigCameras.length !== pose.views.length) {
            this._updateNumberOfRigCameras(pose.views.length);
        }

        //XRView
        pose.views.forEach((view:any, i:any) => {
            const currentRig = this.rigCameras[i];
            if (view.eye === "right")
                currentRig.name = "right";
            else if (view.eye === "left")
                currentRig.name = "left";

            // Update view/projection matrix
            const pos = view.transform.position;
            const orientation = view.transform.orientation;

            currentRig.transform.position.setValue(pos.x, pos.y, pos.z);
            currentRig.transform.rotation.setValue(orientation.x, orientation.y, orientation.z, orientation.w);
            currentRig.transform.position = currentRig.transform.position;
            currentRig.transform.rotation = currentRig.transform.rotation;
            // Update viewport
            if (this._webXRSessionManager.session.renderState.baseLayer) {
                var viewport = this._webXRSessionManager.session.renderState.baseLayer.getViewport(view);
                var width = this._webXRSessionManager.session.renderState.baseLayer.framebufferWidth;
                var height = this._webXRSessionManager.session.renderState.baseLayer.framebufferHeight;
                this._XRRenderTexture.frameBuffer = this._webXRSessionManager.session.renderState.baseLayer.framebuffer;
                //bind FrameBuffer
                currentRig.renderTarget = this._XRRenderTexture;
                //bind clientSize
                currentRig.clientWidth = width;
                currentRig.clientHeight = height;
                //bind viewPort
                var cameraViewPort = currentRig.viewport;
                cameraViewPort.x = viewport.x;
                cameraViewPort.y = viewport.y;
                cameraViewPort.width = viewport.width;
                cameraViewPort.height = viewport.height;
                currentRig.viewport = cameraViewPort;
                currentRig.projectionMatrix.cloneByArray(view.projectionMatrix);
                
            }
        });
    }

    private _updateNumberOfRigCameras(viewCount = 1) {
        while (this.rigCameras.length < viewCount) {
            //add camera
            var xrcamera = new WebXRCamera(this.owner.aspectRatio,this.owner.nearPlane,this.owner.farPlane);
            xrcamera.clearFlag = this.owner.clearFlag;
            this.owner.addChild(xrcamera);
            this.rigCameras.push(xrcamera);
        }
        while (this.rigCameras.length > viewCount) {
            //remove camera
            let xrcamera = this.rigCameras.pop();
            this.owner.removeChild(xrcamera);
        }
    }

    private _updateReferenceSpace(){
        //TODO:
        
    }

    private testOwnerCamera(){
        this.owner.transform.position = this._referencedPosition;
        this.owner.transform.rotation = this._referenceQuaternion;
    }
    destroy(){
        this._webXRSessionManager.off("xrFrameLoop",this,this._updateFromXRSession);
        this._webXRSessionManager.off("xrFrameLoop",this,this._updateReferenceSpace);
    }

}