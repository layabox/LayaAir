import { Camera } from "../../core/Camera";
import { WebXRCameraManager } from "./WebXRCameraManager";
import { WebXRInputManager } from "./WebXRInputManager";
import { WebXRSessionManager } from "./WebXRSessionManager";
export class cameraInfo {
    depthFar: number;
    depthNear: number;
    camera: any;
}

export class WebXRExperienceHelper {

    public static xr_Manager = new WebXRSessionManager();
    public static supported = false;
    public static canvasOptions = {
        antialias: true,
        depth: true,
        stencil: false,
        alpha: true,
        multiview: false,
        framebufferScaleFactor: 1,
    };//XRWebGLLayerInit;
    /**
     * 判断是否
     * @param scene the scene to attach the experience helper to
     * @returns a promise for the experience helper
     */
    public static CreateAsync(): Promise<void> {
        return WebXRExperienceHelper.xr_Manager
            .initializeAsync()
            .then(() => {
                WebXRExperienceHelper.supported = true;
                Promise.resolve();
            })
            .catch((e) => {
                throw e;
            });
    }

    public static async supportXR(sessionMode: string) {
        return await WebXRExperienceHelper.xr_Manager.isSessionSupportedAsync(sessionMode);
    }

    //type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";
    //type XRReferenceSpaceType = "viewer" | "local" | "local-floor" | "unbounded";
    public static async enterXRAsync(sessionMode: string, referenceSpaceType: string, gl: WebGLRenderingContext, cameraInfo: cameraInfo): Promise<WebXRSessionManager> {

        if (sessionMode === "immersive-ar" && referenceSpaceType !== "unbounded") {
            console.warn("We recommend using 'unbounded' reference space type when using 'immersive-ar' session mode");
        }
        try {
            let ss = await WebXRExperienceHelper.xr_Manager.initializeSessionAsync(sessionMode);
            let space = await WebXRExperienceHelper.xr_Manager.setReferenceSpaceTypeAsync(referenceSpaceType);
            let webglSurport = await WebXRExperienceHelper.xr_Manager.initializeXRGL(sessionMode, gl);
            await WebXRExperienceHelper.xr_Manager.updateRenderStateAsync({
                depthFar: cameraInfo.depthFar,
                depthNear: cameraInfo.depthNear,
                //@ts-ignore
                baseLayer: new XRWebGLLayer(WebXRExperienceHelper.xr_Manager.session, gl),
            });
            WebXRExperienceHelper.xr_Manager.runXRRenderLoop();

            return WebXRExperienceHelper.xr_Manager;
        } catch (e) {
            throw e;
        }
    }

    public static setWebXRCamera(camera:Camera, manager: WebXRSessionManager) {
        return new WebXRCameraManager(camera, manager);
    }

    public static setWebXRInput(sessionManager: WebXRSessionManager,cameraManager:WebXRCameraManager){
        return new WebXRInputManager(sessionManager,cameraManager);
    }
}