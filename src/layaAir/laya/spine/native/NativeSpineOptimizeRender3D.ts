import { ISpineRender, IBoneInfo, ISlotInfo, ITrackEntry } from "../interface/ISpineRender";
import { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SpineTemplet } from "../SpineTemplet";
import { ESpineRenderMode, ESpineRenderState, TSpineBakeData } from "../SpineConst";
import { Vector2 } from "../../maths/Vector2";
import { Color } from "../../maths/Color";

/**
 * @en Native Spine Optimize Render 3D wrapper class.
 * @zh Native Spine 优化渲染 3D 封装类。
 */
export class NativeSpineOptimizeRender3D implements ISpineRender {
    private _nativeRender: any; // conchSpineOptimizeRender3D from C++
    private _owner: IBaseRenderNode;
    private _templet: SpineTemplet;
    private _listeners: any; // Event listeners wrapper

    // Shared buffers for automatic data sync with C++ layer
    private _sharedBoneBuffer: Float32Array | null = null; // Shared bone data buffer
    private _sharedTrackEntryBuffer: Float32Array = new Float32Array(6); // Shared track entry buffer
    private _boneNames: string[] = []; // Bone names in order

    private _premultipliedAlpha: boolean = true;
    private _mode: ESpineRenderMode = ESpineRenderMode.Optimize;
    state: ESpineRenderState = ESpineRenderState.Stopped;
    currentTime: number = 0;
    trackEntry: ITrackEntry = null;

    constructor(owner: IBaseRenderNode, nativeRender: any) {
        this._owner = owner;
        this._nativeRender = nativeRender;
    }

    getSkeleton(): spine.Skeleton {
        // Return null or a wrapper object, skeleton is managed by native layer
        // If TS layer needs skeleton access, it should go through native methods
        return null as any;
    }

    init(templet: SpineTemplet): void {
        this._templet = templet;

        // Get optimize data from templet
        const optimize = templet.optimize as any;
        if (!optimize) {
            throw new Error("SpineTemplet.optimize is required for native rendering");
        }

        // Get native optimize object
        const nativeOptimize = optimize._getNativeOptimise ? optimize._getNativeOptimise() : optimize;

        // Initialize native render - native layer will create skeleton and animation state internally
        this._nativeRender.init(nativeOptimize);

        // Bind shared buffers for automatic data sync
        // Get bone names first (only for getting count and names)
        if (this._nativeRender.getBoneNames) {
            this._boneNames = this._nativeRender.getBoneNames();
            if (this._boneNames.length > 0) {
                // Create shared bone buffer (2 floats for skeleton position + 8 floats per bone)
                this._sharedBoneBuffer = new Float32Array(2 + this._boneNames.length * 8);
                // Bind buffer to C++ layer - C++ will auto-update it in render()
                this._nativeRender.bindBoneDataBuffer(this._sharedBoneBuffer);
            }
        }

        // Bind shared track entry buffer - C++ will auto-update it in play()/update()
        if (this._nativeRender.bindTrackEntryBuffer) {
            this._nativeRender.bindTrackEntryBuffer(this._sharedTrackEntryBuffer);
        }

        // Sync premultipliedAlpha priority logic (from templet)
        if (templet.premultipliedAlpha !== undefined) {
            this.premultipliedAlpha = templet.premultipliedAlpha;
        }
    }

    play(animationName: string, loop: boolean = true, trackIndex: number = 0, start: number = 0, end: number = 0): void {
        if (!this._nativeRender) {
            return;
        }

        // start and end are in seconds in web version, pass directly to native
        // C++ will automatically update shared track entry buffer
        this._nativeRender.play(animationName, loop, trackIndex, start, end);

        this.state = ESpineRenderState.Playing;
    }

    addAnimation(animationName: string, loop: boolean = false, delay: number = 0, trackIndex: number = 0): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles animation addition
        this._nativeRender.addAnimation(animationName, loop, delay, trackIndex);
    }

    setMix(fromAnimation: string, toAnimation: string, duration: number): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles mix setup
        this._nativeRender.setMix(fromAnimation, toAnimation, duration);
    }

    update(delta: number): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.update(delta);

        // Update current time from native layer
        if (this._nativeRender.getCurrentTime) {
            this.currentTime = this._nativeRender.getCurrentTime();
        }
    }

    render(time: number, physicsUpdate: number = 2): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.render(time, physicsUpdate);
    }

    setSkinIndex(index: number): void {
        if (!this._nativeRender) {
            return;
        }

        this._nativeRender.setSkinIndex(index);
    }

    showSkinByIndex(skinIndex: number): void {
        this.setSkinIndex(skinIndex);
    }

    setAttachment(slotName: string, attachmentName: string): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles attachment setting
        this._nativeRender.setAttachment(slotName, attachmentName);
    }

    findBone(boneName: string): IBoneInfo | null {
        if (!this._sharedBoneBuffer || !this._boneNames.length) {
            return null;
        }

        // Find bone index by name
        const boneIndex = this._boneNames.indexOf(boneName);
        if (boneIndex === -1) {
            return null;
        }

        // Read from shared buffer (C++ has already updated it)
        // Format: [skeletonX, skeletonY, bone0Data..., bone1Data..., ...]
        // Each bone data: [worldX, worldY, a, b, c, d, 0, length]
        const offset = 2 + boneIndex * 8; // offset by 2 for skeleton position
        return {
            worldX: this._sharedBoneBuffer[offset + 0],
            worldY: this._sharedBoneBuffer[offset + 1],
            a: this._sharedBoneBuffer[offset + 2],
            b: this._sharedBoneBuffer[offset + 3],
            c: this._sharedBoneBuffer[offset + 4],
            d: this._sharedBoneBuffer[offset + 5],
            data: {
                name: boneName,
                length: this._sharedBoneBuffer[offset + 7]
            }
        };
    }

    findSlot(slotName: string): ISlotInfo | null {
        if (!this._nativeRender) {
            return null;
        }

        // Slot query is simple, just return name
        // Native layer doesn't need to provide findSlot since we only need name
        return {
            name: slotName
        };
    }

    setSkeletonPosition(x: number, y: number): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles skeleton position
        this._nativeRender.setSkeletonPosition(x, y);
    }

    physicsTranslate(x: number, y: number): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles physics translation
        this._nativeRender.physicsTranslate(x, y);
    }

    getBones(): IBoneInfo[] {
        if (!this._sharedBoneBuffer || !this._boneNames.length) {
            return [];
        }

        // Read from shared buffer (C++ has already updated it)
        // Format: [skeletonX, skeletonY, bone0Data..., bone1Data..., ...]
        const bones: IBoneInfo[] = [];
        for (let i = 0; i < this._boneNames.length; i++) {
            const offset = 2 + i * 8; // offset by 2 for skeleton position
            bones.push({
                worldX: this._sharedBoneBuffer[offset + 0],
                worldY: this._sharedBoneBuffer[offset + 1],
                a: this._sharedBoneBuffer[offset + 2],
                b: this._sharedBoneBuffer[offset + 3],
                c: this._sharedBoneBuffer[offset + 4],
                d: this._sharedBoneBuffer[offset + 5],
                data: {
                    name: this._boneNames[i],
                    length: this._sharedBoneBuffer[offset + 7]
                }
            });
        }

        return bones;
    }

    getSkeletonTransform(): Vector2 {
        // Read directly from shared buffer (first 2 floats are skeleton x, y)
        if (this._sharedBoneBuffer && this._sharedBoneBuffer.length >= 2) {
            return new Vector2(this._sharedBoneBuffer[0], this._sharedBoneBuffer[1]);
        }

        // Fallback to native method if buffer not available
        if (this._nativeRender && this._nativeRender.getSkeletonTransform) {
            return this._nativeRender.getSkeletonTransform();
        }

        return new Vector2(0, 0);
    }

    resetExternalSkin(): void {
        if (!this._nativeRender) {
            return;
        }

        // Call native resetExternalSkin method
        if (this._nativeRender.resetExternalSkin) {
            this._nativeRender.resetExternalSkin();
        }
    }

    reset(): void {
        if (!this._nativeRender) {
            return;
        }

        // Call native reset method
        if (this._nativeRender.reset) {
            this._nativeRender.reset();
        }

        this.currentTime = 0;
        this.state = ESpineRenderState.Stopped;
        this.trackEntry = null;
    }

    getSpineColor(): Color {
        if (!this._nativeRender) {
            return new Color(1, 1, 1, 1);
        }

        // Get color from native layer
        if (this._nativeRender.getSpineColor) {
            const color = this._nativeRender.getSpineColor();
            if (color) {
                return new Color(color.r, color.g, color.b, color.a);
            }
        }

        return new Color(1, 1, 1, 1);
    }

    get premultipliedAlpha(): boolean {
        return this._premultipliedAlpha;
    }

    set premultipliedAlpha(value: boolean) {
        if (this._premultipliedAlpha === value) return;
        
        this._premultipliedAlpha = value;
        
        // Update native layer
        if (this._nativeRender && this._nativeRender.setPremultipliedAlpha) {
            this._nativeRender.setPremultipliedAlpha(value);
        }
    }

    get mode(): ESpineRenderMode {
        return this._mode;
    }

    set mode(value: ESpineRenderMode) {
        if (this._mode === value) return;
        
        this._mode = value;
        
        // Update native layer
        if (this._nativeRender && this._nativeRender.setMode) {
            this._nativeRender.setMode(value);
        }
    }

    complete(): void {
        if (!this._nativeRender) {
            return;
        }

        // Native layer handles animation completion
        this._nativeRender.complete();
    }

    initBake(obj: TSpineBakeData): void {
        if (!this._nativeRender) {
            return;
        }

        // TODO: Implement bake initialization
        // This might require native side support for bake data
    }

    setEventListener(listeners: {
        start?: (entry: any) => void;
        interrupt?: (entry: any) => void;
        end?: (entry: any) => void;
        dispose?: (entry: any) => void;
        complete?: (entry: any) => void;
        event?: (entry: any, event: any) => void;
    }): void {
        if (!this._nativeRender) {
            return;
        }

        // Store listeners for cleanup
        this._listeners = listeners;

        // Native layer handles event listener setup
        if (this._nativeRender.setEventListener) {
            this._nativeRender.setEventListener(listeners);
        }
    }

    destroy(): void {
        if (this._nativeRender) {
            // Remove event listeners if needed
            if (this._listeners && this._nativeRender.removeEventListener) {
                this._nativeRender.removeEventListener();
            }

            this._nativeRender.destroy();
            this._nativeRender = null;
        }

        this._listeners = null;
        this._templet = null;
        this._owner = null;
    }
}

