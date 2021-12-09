import { ILaya } from "ILaya";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Event } from "Laya/events/Event";
import { EventDispatcher } from "laya/events/EventDispatcher";
import { Render } from "laya/renders/Render";
/**
 * local
 * 一个XRReferenceSpace跟踪空间，其原始原点位于创建会话时查看器位置附近。具体位置取决于底层平台和实现。如果用户超出起始位置，则不希望用户移动太多，并且跟踪针对该用例进行了优化。对于具有六自由度（6DoF）跟踪的设备，局部参考空间试图保持原点相对于环境的稳定。
 * local-floor
 * 与本地类型类似的XRReferenceSpace，除了起始位置放置在观众站立的安全位置，其中y轴的值在楼层级别为0。如果该楼层标高未知，则用户代理将估计楼层标高。如果估计的楼层标高不为零，则浏览器应将其四舍五入，以避免出现指纹（可能精确到厘米）。
 * viewer
 * 一种XRReferenceSpace跟踪空间，其原始原点跟踪查看器的位置和方向。这用于用户可以在其中进行物理移动的环境，所有XRSession实例（沉浸式和内联）都支持这一功能，尽管它对内联会话最有用。在确定查看器和输入之间的距离或使用偏移空间时，它特别有用。否则，通常会更频繁地使用其他参照空间类型之一。
 */

/**
 * Manages an XRSession to work with layaAir engine
 * @author miner
 */
export class WebXRSessionManager extends EventDispatcher {

    /** XRReferenceSpace*/
    public baseReferenceSpace: any;//;

    /**
    * Current XR frame
    * XRFrame;
    */
    public currentFrame:any;//

    /** WebXR timestamp updated every frame */
    public currentTimestamp: number = -1;

    /**默认高度补偿,在init失败后使用 */
    public defaultHeightCompensation = 1.7;

    /**
     * Fires when the xr session is ended either by the device or manually done
     * 当结束时调用
     */
    public onXRSessionEnded:any;

    //当空间转变时的事件
    onXRReferenceSpaceChanged: Event;

    //
    public onXRSessionInit: Event;

    /**
     * Underlying xr session
     * XRSession
     */
    public session:any//: 

    //The viewer (head position) reference space. This can be used to get the XR world coordinates or get the offset the player is currently at.
    public viewerReferenceSpace:any; //XRReferenceSpace;



    /** XRReferenceSpace*/
    private _referenceSpace:any;//XRReferenceSpace;
    /** "inline" | "immersive-vr" | "immersive-ar"*/
    private _sessionMode:any;
    private _sessionEnded: boolean = false;
    private _xrNavigator: any;
    private _baseLayer:any = null;
    constructor() {
        super();
        //this.on("xrFrameLoop",this,this.updateByXrFrame);
    }

    /**
    * The current reference space used in this session. This reference space can constantly change!
    * It is mainly used to offset the camera's position.
    * @returns XRReferenceSpace;
    */
    public get referenceSpace() {
        return this._referenceSpace;
    }

    public set referenceSpace(newReferenceSpace) {
        this._referenceSpace = newReferenceSpace;
        //this.onXRReferenceSpaceChanged.on
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

    }

    /**
    * Gets the correct render target texture to be rendered this frame for this eye
    * @param eye XREye //the eye for which to get the render target
    * @returns the render target for the specified eye or null if not available
    */
    public getRenderTargetTextureForEye(eye:any): RenderTexture {
        return null;
    }

    //Creates a WebXRRenderTarget object for the XR session
    public getWebXRRenderTarget() {
        //option
        // defaults.canvasOptions = {
        //     antialias: true,
        //     depth: true,
        //     stencil: engine ? engine.isStencilEnable : true,
        //     alpha: true,
        //     multiview: false,
        //     framebufferScaleFactor: 1,
        // };
    }

    /**Initializes the xr layer for the session */
    public initializeXRGL(xrSession:any,gl:WebGLRenderingContext):Promise<boolean> {//: XRWebGLLayer {
        //TODO
        //this.onXRLayerInitObservable.notifyObservers(layer);
        //return layer;
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
     * 模式是否支持
     * @param sessionMode "inline" | "immersive-vr" | "immersive-ar"
     * @returns A Promise that resolves to true if supported and false if not
     */
    public isSessionSupportedAsync(sessionMode: string): Promise<boolean> {
        if (!(navigator as any).xr) {
            return Promise.resolve(false);
        }else{
            this._xrNavigator = navigator;
        }
        const functionToUse = (navigator as any).xr.isSessionSupported || (navigator as any).xr.supportsSession;
        if (!functionToUse)
            return Promise.resolve(false);
        else {
            (navigator as any).xr.isSessionSupported('immersive-vr').then((supported:any) => {
                return Promise.resolve(supported);
            });
        }
        return Promise.resolve(false);
    }

    public initializeSessionAsync(xrSessionMode = 'immersive-vr', xrSessionInit = {}):Promise<any> {
        return this._xrNavigator.xr.requestSession('immersive-vr').then((session: any) => {
            this.session = session;
            this._sessionMode = xrSessionMode;
            //通知SessionInit方案队列
            //this.onXRSessionInit.notifyObservers(session);

            this._sessionEnded = false;

            // 增加结束handle
            this.session.addEventListener(
                "end",
                () => {
                    this._sessionEnded = true;

                    // Notify frame observers
                    //this.onXRSessionEnded.notifyObservers(null);
                    // Remove render target texture
                    //this._rttProvider = null;

                    // if (this._engine) {
                    //     // make sure dimensions object is restored
                    //     this._engine.framebufferDimensionsObject = null;

                    //     // Restore frame buffer to avoid clear on xr framebuffer after session end
                    //     this._engine.restoreDefaultFramebuffer();

                    //     // Need to restart render loop as after the session is ended the last request for new frame will never call callback
                    //     this._engine.customAnimationFrameRequester = null;
                    //     this._engine._renderLoop();
                    // }

                    // Dispose render target textures
                    // if (this.isNative) {
                    //     this._renderTargetTextures.forEach((rtt) => rtt.dispose());
                    //     this._renderTargetTextures.length = 0;
                    // }
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
        // Render.customRequestAnimationFrame(this.session.requestAnimationFrame,(timestamp, xrFrame)=>{
        //     this.updateByXrFrame(xrFrame,timestamp);
        //     this.event("xrFrameLoop",[xrFrame]);
        //     ILaya.stage._loop();
        // }) ;
        let fn = (timestamp: any, xrFrame: any)=>{
                this.updateByXrFrame(xrFrame,timestamp);
                this.event("xrFrameLoop",[xrFrame]);
                ILaya.stage._loop();
                this.session.requestAnimationFrame(fn);
        };
        this.session.requestAnimationFrame(fn);
    }


    /**
     * Update
     * @param xrFrame 
     */
    public updateByXrFrame(xrFrame: any,timestamp: number){
        //TODO:
        this.currentFrame = xrFrame;
        this.currentTimestamp = timestamp;
    }

    


    /**
    * Sets the reference space on the xr session
    * @param referenceSpaceType space to set
    * @returns a promise that will resolve once the reference space has been set
    */
    //type XRReferenceSpaceType = "viewer" | "local" | "local-floor" | "unbounded";
    public setReferenceSpaceTypeAsync(referenceSpaceType = "local-floor"): Promise<any>{//XRReferenceSpace
        return this.session
            .requestReferenceSpace(referenceSpaceType)
            .then(
                (referenceSpace: any) => {
                    return referenceSpace;
                },
                (rejectionReason:any) => {
                    return this.session.requestReferenceSpace("viewer").then(
                        (referenceSpace:any) => {
                            //@ts-ignore
                            const heightCompensation = new XRRigidTransform({ x: 0, y: -this.defaultHeightCompensation, z: 0 });
                            return (referenceSpace).getOffsetReferenceSpace(heightCompensation);
                        },
                        (rejectionReason:any) => {

                            throw 'XR initialization failed: required "viewer" reference space type not supported.';
                        }
                    );
                }
            ).then((referenceSpace:any) => {
                // initialize the base and offset (currently the same)
                this.referenceSpace = this.baseReferenceSpace = referenceSpace;
                return this.referenceSpace;
            });
            // .then((referenceSpace) => {
            //     // create viewer reference space before setting the first reference space
            //     return this.session.requestReferenceSpace("viewer").then((viewerReferenceSpace) => {
            //         this.viewerReferenceSpace = viewerReferenceSpace;
            //         return referenceSpace;
            //     });
            // })
    }


    /**
    * Updates the render state of the session
    * @param state state to set
    * @returns a promise that resolves once the render state has been updated
    */
    public updateRenderStateAsync(state:any) {//: XRRenderState) {
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