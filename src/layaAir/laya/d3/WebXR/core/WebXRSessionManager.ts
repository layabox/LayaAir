import { ILaya } from "../../../../ILaya";
import { EventDispatcher } from "../../../events/EventDispatcher";

/**
 * Manages an XRSession to work with layaAir engine
 * @author miner
 */
export class WebXRSessionManager extends EventDispatcher {

    static EVENT_MANAGER_END:string = "xrManagerDestory";
    static EVENT_FRAME_LOOP:string = "xrFrameLoop";

    
    /**
     * Underlying xr session
     */
    public session: any//: 
    /**
     * XRReferenceSpace TODO
     */
    public viewerReferenceSpace: any; //XRReferenceSpace;

    /** baseRefernceSpace */
    public baseReferenceSpace: any;//;
    /** Current XR  XRFrame*/
    public currentFrame: any;//
    /** WebXR timestamp updated every frame */
    public currentTimestamp: number = -1;
    /**默认高度补偿,在init失败后使用 */
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
    * The current reference space used in this session.
    * @returns XRReferenceSpace;
    */
    public get referenceSpace() {
        return this._referenceSpace;
    }

    /**
     * set 参考空间
     */
    public set referenceSpace(newReferenceSpace) {
        this._referenceSpace = newReferenceSpace;
    }

    /**
    * The mode for the managed XR session
    */
    public get sessionMode() {
        return this._sessionMode;
    }

    /**
     * Stops the xrSession and restores the render loop
     */
    exitXR() {
        this.endXRRenderLoop();
        this.event(WebXRSessionManager.EVENT_MANAGER_END);
    }
    
    /**
     * Initializes the xr layer for the session 
     * @param xrSession 
     * @param gl 
     * @returns 
     */
    public initializeXRGL(xrSession: any, gl: WebGLRenderingContext): Promise<boolean> {//: XRWebGLLayer {
        return (gl as any).makeXRCompatible().then(
            Promise.resolve(true)
        );
    };

    /**
     * 浏览器是否支持WebXR
     * @returns WebXR
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
     * Sessiopn模式是否支持
     * @param sessionMode "inline" | "immersive-vr" | "immersive-ar"
     * @returns A Promise that resolves to true if supported and false if not
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
     * 初始化Session
     * @param xrSessionMode xrsessionMode
     * @param xrSessionInit any initInfo
     * @returns 
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
     * Resets the reference space to the one started the session
     */
    public resetReferenceSpace() {
        this.referenceSpace = this.baseReferenceSpace;
    }

    /**
     * Starts rendering to the xr layer
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
    * Sets the reference space on the xr session
    * @param referenceSpaceType space to set
    * @returns a promise that will resolve once the reference space has been set
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
    * Updates the render state of the session
    * @param state state to set
    * @returns a promise that resolves once the render state has been updated
    */
    public updateRenderStateAsync(state: any) {//: XRRenderState) {
        if (state.baseLayer) {
            this._baseLayer = state.baseLayer;
        }
        return this.session.updateRenderState(state);
    }

    /**
     * The current frame rate as reported by the device
     */
    public get currentFrameRate(): number | undefined {
        return this.session?.frameRate;
    }

    /**
    * A list of supported frame rates (only available in-session!
    */
    public get supportedFrameRates(): Float32Array | undefined {
        return this.session?.supportedFrameRates;
    }

    /**
     * Set the framerate of the session.
     * @param rate the new framerate. This value needs to be in the supportedFrameRates array
     * @returns a promise that resolves once the framerate has been set
     */
    public updateTargetFrameRate(rate: number): Promise<void> {
        return this.session.updateTargetFrameRate(rate);
    }

    destroy() {
        if (!this._sessionEnded) {
            this.exitXR();
        }
    }
}