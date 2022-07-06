import { LayaGL } from "../../../layagl/LayaGL";
import { Camera } from "../../core/Camera";
import { WebXRCameraManager } from "./WebXRCameraManager";
import { WebXRInputManager } from "./WebXRInputManager";
import { WebXRSessionManager } from "./WebXRSessionManager";
export class WebXRCameraInfo {
    /**depth far */
    depthFar: number;
    /**depth near */
    depthNear: number;
    /**camera */
    camera: any;
}

/**
 * 类用来管理WebXR
 * @author miner
 */
export class WebXRExperienceHelper {

    static glInstance: any;
    /**
     * single XRManager 
     */
    public static xr_Manager = new WebXRSessionManager();
    /**
     * support webXR
     */
    public static supported = false;
    /**
     * default WebLayer option
     * XRWebGLLayerInit
     */
    public static canvasOptions = {
        antialias: true,
        depth: true,
        stencil: false,
        alpha: true,
        multiview: false,
        framebufferScaleFactor: 1,
    };

    /**
     * 支持XRSession模式
     * @param sessionMode XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";
     * @returns 
     */
    public static supportXR(sessionMode: string): Promise<boolean> {
        return WebXRExperienceHelper.xr_Manager.isSessionSupportedAsync(sessionMode).then(value => {
            WebXRExperienceHelper.supported = value;
            return value;
        });
    }

    /**
     * 申请WewXR交互
     * @param sessionMode XRSessionMode
     * @param referenceSpaceType referenceType = "viewer" | "local" | "local-floor" | "unbounded";
     * @param cameraInfo WebXRCameraInfo webXRCamera设置
     * @returns Promise<WebXRSessionManager> 
     */
    public static enterXRAsync(sessionMode: string, referenceSpaceType: string, cameraInfo: WebXRCameraInfo): Promise<WebXRSessionManager> {
        if (sessionMode === "immersive-ar" && referenceSpaceType !== "unbounded") {
            console.warn("We recommend using 'unbounded' reference space type when using 'immersive-ar' session mode");
        }

        //session
        return WebXRExperienceHelper.xr_Manager.initializeSessionAsync(sessionMode).then(() => {
            //refernceSpace
            return WebXRExperienceHelper.xr_Manager.setReferenceSpaceTypeAsync(referenceSpaceType);
        }).then(() => {
            //webglSurport
            //@ts-ignore
            return WebXRExperienceHelper.xr_Manager.initializeXRGL(sessionMode, LayaGL.renderEngine._gl);
        }).then(() => {
            //@ts-ignore
            WebXRExperienceHelper.glInstance = LayaGL.renderEngine._gl;
            return WebXRExperienceHelper.xr_Manager.updateRenderStateAsync({
                depthFar: cameraInfo.depthFar,
                depthNear: cameraInfo.depthNear,
                //@ts-ignore
                baseLayer: new XRWebGLLayer(WebXRExperienceHelper.xr_Manager.session, LayaGL.instance),
            });
        }).then(() => {
            WebXRExperienceHelper.xr_Manager.runXRRenderLoop();
            return WebXRExperienceHelper.xr_Manager;
        });
    }

    /**
     * config WebXRCameraManager
     * @param camera Camera
     * @param manager WebXRSessionManager
     * @returns 
     */
    public static setWebXRCamera(camera: Camera, manager: WebXRSessionManager): WebXRCameraManager {
        return new WebXRCameraManager(camera, manager);
    }

    /**
     * config WebXRInputManager
     * @param sessionManager WebXRSessionManager
     * @param cameraManager WebXRCameraManager
     * @returns 
     */
    public static setWebXRInput(sessionManager: WebXRSessionManager, cameraManager: WebXRCameraManager): WebXRInputManager {
        return new WebXRInputManager(sessionManager, cameraManager);
    }
}