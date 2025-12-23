import { ISpineRender, IBoneInfo, ISlotInfo, ITrackEntry } from "../interface/ISpineRender";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineTemplet } from "../SpineTemplet";
import { ESpineRenderMode, ESpineRenderState, TSpineBakeData } from "../SpineConst";
import { Vector2 } from "../../maths/Vector2";
import { Color } from "../../maths/Color";

/**
 * @en Native Spine Optimize Render 2D wrapper class.
 * @zh Native Spine 优化渲染 2D 封装类。
 */
export class NativeSpineOptimizeRender2D implements ISpineRender {
    private _nativeRender: any; // conchSpineOptimizeRender2D from C++
    private _owner: Spine2DRenderNode;
    private _templet: SpineTemplet;
    private _listeners: any; // Event listeners wrapper

    private _premultipliedAlpha: boolean = true;
    private _mode: ESpineRenderMode = ESpineRenderMode.Optimize;
    state: ESpineRenderState = ESpineRenderState.Stopped;
    currentTime: number = 0;
    trackEntry: ITrackEntry = null;

    constructor(owner: Spine2DRenderNode, nativeRender: any) {
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
        // Material will be created from template in _getMaterial method
        this._nativeRender.init(nativeOptimize);

        // Set skeleton to handle (native layer should provide a method to get skeleton reference)
        if (handle && handle.setSkeleton && this._nativeRender.getSkeleton) {
            const skeletonRef = this._nativeRender.getSkeleton();
            if (skeletonRef && handle.setSkeleton) {
                handle.setSkeleton(skeletonRef);
            }
        }

        // Set base color
        if (handle && handle.setBaseColor) {
            const color = new Color();
            color.setValue(1, 1, 1, 1);
            handle.setBaseColor(color);
        }
    }

    play(animationName: string, loop: boolean = true, trackIndex: number = 0, start: number = 0, end: number = 0): void {
        if (!this._nativeRender) {
            return;
        }

        // start and end are in seconds in web version, pass directly to native
        this._nativeRender.play(animationName, loop, trackIndex, start, end);

        // Update track entry from native layer
        if (this._nativeRender.getTrackEntry) {
            const entry = this._nativeRender.getTrackEntry(trackIndex);
            if (entry) {
                this.trackEntry = entry;
            }
        }

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
        if (!this._nativeRender) {
            return null;
        }

        // Get bone info from native layer
        if (this._nativeRender.findBone) {
            return this._nativeRender.findBone(boneName);
        }

        return null;
    }

    findSlot(slotName: string): ISlotInfo | null {
        if (!this._nativeRender) {
            return null;
        }

        // Get slot info from native layer
        if (this._nativeRender.findSlot) {
            return this._nativeRender.findSlot(slotName);
        }

        return null;
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
        if (!this._nativeRender) {
            return [];
        }

        // Get bones from native layer
        if (this._nativeRender.getBones) {
            return this._nativeRender.getBones();
        }

        return [];
    }

    getSkeletonTransform(): Vector2 {
        if (!this._nativeRender) {
            return new Vector2(0, 0);
        }

        // Get transform from native layer
        if (this._nativeRender.getSkeletonTransform) {
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

