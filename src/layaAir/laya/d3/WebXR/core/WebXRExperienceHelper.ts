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
 * @en Used to manage WebXR
 * @zh 用来管理WebXR
 */
export class WebXRExperienceHelper {
    /**
     * @en The WebGL instance.
     * @zh WebGL 实例。
     */
    static glInstance: any;
    /**
     * @en The singleton instance of the XR session manager.
     * @zh XR 会话管理器的单例实例。
     */
    public static xr_Manager = new WebXRSessionManager();
    /**
     * @en Indicates whether WebXR is supported in the current environment.
     * @zh 表示当前环境是否支持 WebXR。
     */
    public static supported = false;
    /**
     * @en Default options for the XRWebGLLayer.
     * @zh XRWebGLLayer 的默认选项。
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
     * @en Checks if a specific XRSession mode is supported.
     * @param sessionMode The session mode to check, e.g., "inline", "immersive-vr", "immersive-ar".
     * @returns A promise that resolves to a boolean indicating whether the mode is supported.
     * @zh 检查是否支持特定的 XRSession 模式。
     * @param sessionMode 要检查的会话模式，例如："inline"、"immersive-vr"、"immersive-ar"。
     * @returns 一个 Promise，该 Promise 将解析为一个布尔值，表示是否支持。
     */
    public static supportXR(sessionMode: string): Promise<boolean> {
        return WebXRExperienceHelper.xr_Manager.isSessionSupportedAsync(sessionMode).then(value => {
            WebXRExperienceHelper.supported = value;
            return value;
        });
    }

    /**
     * @en Enters the specified XR session mode and sets up the reference space and WebGL layer.
     * @param sessionMode The session mode, e.g., "inline", "immersive-vr", "immersive-ar".
     * @param referenceSpaceType The reference space type, e.g., "viewer", "local", "local-floor", "unbounded".
     * @param cameraInfo The WebXR camera settings.
     * @returns A promise that resolves to the WebXRSessionManager.
     * @zh 进入指定的 XR 会话模式，并设置引用空间和 WebGL 层。
     * @param sessionMode 要进入的会话模式，例如："inline"、"immersive-vr"、"immersive-ar"。
     * @param referenceSpaceType 要使用的参考空间类型，例如："viewer"、"local"、"local-floor"、"unbounded"。
     * @param cameraInfo WebXR相机设置。
     * @returns 一个 Promise，该 Promise 将解析为 WebXRSessionManager。
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
            return WebXRExperienceHelper.xr_Manager.initializeXRGL(sessionMode, LayaGL.renderEngine.gl);
        }).then(() => {
            //@ts-ignore
            WebXRExperienceHelper.glInstance = LayaGL.renderEngine.gl;
            return WebXRExperienceHelper.xr_Manager.updateRenderStateAsync({
                depthFar: cameraInfo.depthFar,
                depthNear: cameraInfo.depthNear,
                //@ts-ignore
                baseLayer: new XRWebGLLayer(WebXRExperienceHelper.xr_Manager.session, LayaGL.renderEngine.gl),
            });
        }).then(() => {
            WebXRExperienceHelper.xr_Manager.runXRRenderLoop();
            return WebXRExperienceHelper.xr_Manager;
        });
    }

    /**
     * @en Configures a WebXRCameraManager with the given camera and session manager.
     * @param camera The camera to configure.
     * @param manager The WebXR session manager.
     * @returns A new WebXRCameraManager instance.
     * @zh 使用给定的摄像机和会话管理器配置 WebXRCameraManager。
     * @param camera 要配置的摄像机。
     * @param manager WebXR 会话管理器。
     * @returns 一个新的 WebXRCameraManager 实例。
     */
    public static setWebXRCamera(camera: Camera, manager: WebXRSessionManager): WebXRCameraManager {
        return new WebXRCameraManager(camera, manager);
    }

    /**
     * @en Configures a WebXRInputManager with the given session and camera managers.
     * @param sessionManager The WebXR session manager.
     * @param cameraManager The WebXR camera manager.
     * @returns A new WebXRInputManager instance.
     * @zh 使用给定的会话和摄像机管理器配置 WebXRInputManager。
     * @param sessionManager WebXR 会话管理器。
     * @param cameraManager WebXR 摄像机管理器。
     * @returns 一个新的 WebXRInputManager 实例。
     */
    public static setWebXRInput(sessionManager: WebXRSessionManager, cameraManager: WebXRCameraManager): WebXRInputManager {
        return new WebXRInputManager(sessionManager, cameraManager);
    }
}