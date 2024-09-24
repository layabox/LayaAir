import { ILaya } from "../../../../ILaya";
import { EventDispatcher } from "../../../events/EventDispatcher";

/**
 * @en Manages an XRSession to work with the LayaAir engine.
 * @zh 管理 XRSession 用以与 LayaAir 引擎协同工作。
 */
export class WebXRSessionManager extends EventDispatcher {

    static EVENT_MANAGER_END: string = "xrManagerDestory";
    static EVENT_FRAME_LOOP: string = "xrFrameLoop";


    /**
     * @en The underlying XR session being managed.
     * @zh 被管理的底层 XR 会话。
     */
    public session: any//: 
    /**
     * @en The XRReferenceSpace used for setting up the viewer's reference space.
     * @zh 用于设置观察者参考空间的 XRReferenceSpace。
     */
    public viewerReferenceSpace: any; //XRReferenceSpace;

    /**
     * @en The base reference space for the XR session.
     * @zh XR 会话的基参考空间。
     */
    public baseReferenceSpace: any;//;
    /**
     * @en The current XR frame in the session.
     * @zh 会话中的当前 XR 帧。
     */
    public currentFrame: any;//
    /**
     * @en The WebXR timestamp updated every frame.
     * @zh 每帧更新的 WebXR 时间戳。
     */
    public currentTimestamp: number = -1;
    /**
     * @en The default height compensation used when initialization fails.
     * @zh 初始化失败后使用的高度补偿默认值。
     */
    public defaultHeightCompensation = 1.7;

    /**
     * XRReferenceSpace
     */
    private _referenceSpace: any;
    /** "inline" | "immersive-vr" | "immersive-ar"*/
    private _sessionMode: any;
    /** session enable state */
    private _sessionEnded: boolean = false;
    /**WebXR Base Layer */
    private _baseLayer:any;
    /**web XRSystem */
    private _xrNavigator: any;
    /**
     * @internal
     * 类用来管理WebXR状态
     */
    constructor() {
        super();
    }

    /**
     * @en The current reference space used in this session.
     * @zh 当前会话中使用参考空间。
     */
    public get referenceSpace() {
        return this._referenceSpace;
    }

    public set referenceSpace(newReferenceSpace) {
        this._referenceSpace = newReferenceSpace;
    }

    /**
     * @en The mode for the managed XR session.
     * @zh 管理 XR 会话的模式。
     */
    public get sessionMode() {
        return this._sessionMode;
    }

    /**
     * @en Stops the XR session and restores the render loop.
     * @zh 停止 XR 会话并恢复渲染循环。
     */
    exitXR() {
        this.endXRRenderLoop();
        this.event(WebXRSessionManager.EVENT_MANAGER_END);
    }

    /**
     * @en Initializes the XR layer for the session.
     * @param xrSession The XR session to initialize.
     * @param gl The WebGL rendering context.
     * @returns A promise that resolves to true if the XR layer is successfully initialized.
     * @zh 为会话初始化 XR 层。
     * @param xrSession 要初始化的 XR 会话。
     * @param gl WebGL 渲染上下文。
     * @returns 一个承诺，该承诺在 XR 层成功初始化时解决为 true。。
     */
    public initializeXRGL(xrSession: any, gl: WebGLRenderingContext): Promise<boolean> {//: XRWebGLLayer {
        return (gl as any).makeXRCompatible().then(()=> {
            return true;
        });
    };

    /**
     * @en Checks if the browser supports WebXR.
     * @returns A promise that resolves if WebXR is supported.
     * @zh 检查浏览器是否支持 WebXR。
     * @returns 如果支持 WebXR 则返回一个解决的承诺。
     */
    public initializeAsync(): Promise<void> {
        // Check if the browser supports webXR
        this._xrNavigator = navigator;
        if (!this._xrNavigator.xr) {
            return Promise.reject("WebXR not available");
        }
        return Promise.resolve();
    }

    /**
     * @en Checks if the session mode is supported by the browser.
     * @param sessionMode The session mode to check, "inline", "immersive-vr", or "immersive-ar".
     * @returns A promise that resolves to true if the session mode is supported, and false if not.
     * @zh 检查会话模式是否得到浏览器支持。
     * @param sessionMode 要检查的会话模式，可以是 "inline"、"immersive-vr" 或 "immersive-ar"。
     * @returns 如果会话模式得到支持则返回一个解决为 true 的承诺，如果不支持则为 false。
     */
    public isSessionSupportedAsync(sessionMode: string): Promise<boolean> {
        if (!(navigator as any).xr) {
            return Promise.resolve(false);
        } else {
            this._xrNavigator = navigator;
        }
        const functionToUse = (navigator as any).xr.isSessionSupported || (navigator as any).xr.supportsSession;
        if (!functionToUse)
            return Promise.resolve(false);
        else {
            return (navigator as any).xr.isSessionSupported(sessionMode);
        }
    }

    /**
     * @en Initializes the XR session with the specified mode and initialization info.
     * @param xrSessionMode The mode for the XR session.
     * @param xrSessionInit The initialization info for the XR session.
     * @returns A promise that resolves with the XR session if successful.
     * @zh 使用指定的模式和初始化信息初始化 XR 会话。
     * @param xrSessionMode XR 会话的模式。
     * @param xrSessionInit XR 会话的初始化信息。
     * @returns 如果成功，返回一个解决为 XR 会话的承诺。
     */
    public initializeSessionAsync(xrSessionMode = 'immersive-vr', xrSessionInit = {}): Promise<any> {
        return this._xrNavigator.xr.requestSession('immersive-vr').then((session: any) => {
            this.session = session;
            this._sessionMode = xrSessionMode;
            this._sessionEnded = false;

            // 增加结束handle
            this.session.addEventListener(
                "end",
                () => {
                    this._sessionEnded = true;
                    this.exitXR();
                },
                { once: true }
            );

            return this.session;
        });
    }

    /**
     * @en Resets the reference space to the one used at the start of the session.
     * @zh 将参考空间重置为会话开始时使用的空间。
     */
    public resetReferenceSpace() {
        this.referenceSpace = this.baseReferenceSpace;
    }

    /**
     * @en Starts the rendering loop for the XR session and binds it to the session's animation frame request.
     * @zh 启动 XR 会话的渲染循环，并将其绑定到会话的动画帧请求。
     */
    public runXRRenderLoop() {
        this.session.requestAnimationFrame.bind(this.session);
        let fn = (timestamp: any, xrFrame: any) => {
            this._updateByXrFrame(xrFrame, timestamp);
            this.event(WebXRSessionManager.EVENT_FRAME_LOOP, [xrFrame]);
            ILaya.stage._loop();
            this.session.requestAnimationFrame(fn);
        };
        this.session.requestAnimationFrame(fn);
    }

    /**
     * @en Ends the rendering loop for the XR session.
     * @zh 结束 XR 会话的渲染循环。
     */
    public endXRRenderLoop(){

    }

    /**
     * Update
     * @param xrFrame 
     */
    private _updateByXrFrame(xrFrame: any, timestamp: number) {
        this.currentFrame = xrFrame;
        this.currentTimestamp = timestamp;
    }

    /**
     * @en Sets the reference space on the XR session.
     * @param referenceSpaceType The type of space to set, defaults to "local-floor".
     * @returns A promise that resolves once the reference space has been set.
     * @zh 在 XR 会话上设置参考空间。
     * @param referenceSpaceType 要设置的参考空间类型，默认为 "local-floor"。
     * @returns 一个promise，该promise在参考空间已被设置时解决。
     */
    public setReferenceSpaceTypeAsync(referenceSpaceType = "local-floor"): Promise<any> {//XRReferenceSpace
        return this.session
            .requestReferenceSpace(referenceSpaceType)
            .then(
                (referenceSpace: any) => {
                    return referenceSpace;
                },
                (rejectionReason: any) => {
                    return this.session.requestReferenceSpace("viewer").then(
                        (referenceSpace: any) => {
                            //@ts-ignore
                            const heightCompensation = new XRRigidTransform({ x: 0, y: -this.defaultHeightCompensation, z: 0 });
                            return (referenceSpace).getOffsetReferenceSpace(heightCompensation);
                        },
                        (rejectionReason: any) => {

                            throw 'XR initialization failed: required "viewer" reference space type not supported.';
                        }
                    );
                }
            ).then((referenceSpace: any) => {
                // initialize the base and offset (currently the same)
                this.referenceSpace = this.baseReferenceSpace = referenceSpace;
                return this.referenceSpace;
            });
    }

    /**
     * @en Updates the render state of the WebXR session.
     * @param state The new render state to be applied.
     * @returns A promise that resolves once the render state has been updated.
     * @zh 更新 WebXR 会话的渲染状态。
     * @param state 要应用的新渲染状态。
     * @returns 一个promise，该promise在渲染状态已被更新时解决。
     */
    public updateRenderStateAsync(state: any) {//: XRRenderState) {
        if (state.baseLayer) {
            this._baseLayer = state.baseLayer;
        }
        return this.session.updateRenderState(state);
    }

    /**
     * @en The current frame rate reported by the device.
     * @zh 设备报告的当前帧率。
     */
    public get currentFrameRate(): number | undefined {
        return this.session?.frameRate;
    }

    /**
     * @en A list of supported frame rates, available only while in a session.
     * @zh 支持的帧率列表，此属性仅在会话中可用。
     */
    public get supportedFrameRates(): Float32Array | undefined {
        return this.session?.supportedFrameRates;
    }

    /**
     * @en Sets the frame rate for the WebXR session.
     * @param rate The new frame rate to be set, must be within the supportedFrameRates range.
     * @returns A promise that resolves once the frame rate has been set.
     * @zh 为 WebXR 会话设置帧率。
     * @param rate 要设置的新帧率，必须在支持的帧率范围内。
     * @returns 一个承诺，该承诺在帧率已被设置时解决。
     */
    public updateTargetFrameRate(rate: number): Promise<void> {
        return this.session.updateTargetFrameRate(rate);
    }

    /**
     * @en Cleans up and destroys the WebXR session manager.
     * @zh 清理并销毁 WebXR 会话管理器。
     */
    destroy() {
        if (!this._sessionEnded) {
            this.exitXR();
        }
    }
}