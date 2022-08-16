import { IClone } from "../utils/IClone";
import { Animation2DNext } from "./Animation2DNext";
import { AnimationClip2D } from "./AnimationClip2D";
import { AnimatorState2DScript } from "./AnimatorState2DScript"

export class AnimatorState2D implements IClone {
    /** @internal */
    private _referenceCount = 0;

    /** @internal */
    _clip: AnimationClip2D | null = null;

    _currentFrameIndices: Int16Array | null = null;

    /**名称。*/
    name: string;
    /**动画播放速度,1.0为正常播放速度。*/
    speed = 1.0;
    /**动作播放起始时间。*/
    clipStart = 0.0;
    /**动作播放结束时间。*/
    clipEnd = 1.0;

    /** 动画循环次数，1为播放一次，2为播放2次，0为无限循环*/
    loop = 1.0;
    /**是否为一次正播放，一次倒播放模式 */
    yoyo = false;


    nexts: Animation2DNext[];


    _scripts: AnimatorState2DScript[] | null = null;




    _realtimeDatas: Array<number | string | boolean> = [];

    /**
         * 动作。
         */
    get clip(): AnimationClip2D | null {
        return this._clip;
    }

    clone() {
        var dest: AnimatorState2D = new AnimatorState2D();
        this.cloneTo(dest);
        return dest;
    }
    cloneTo(destObject: any): void {
        var dest: AnimatorState2D = <AnimatorState2D>destObject;
        dest.name = this.name;
        dest.speed = this.speed;
        dest.clip = this._clip;
    }

    set clip(value: AnimationClip2D | null) {
        if (this._clip != value) {
            if (this._clip)
                (this._referenceCount > 0) && (this._clip._removeReference(this._referenceCount));
            if (value) {
                var clipNodes = value._nodes!;
                var count = clipNodes.count;
                this._currentFrameIndices = new Int16Array(count);
                this._resetFrameIndices();
                (this._referenceCount > 0) && (value._addReference(this._referenceCount));
                this._realtimeDatas.length = count;
            }
            this._clip = value;
        }
    }

    _resetFrameIndices(): void {
        for (var i = 0, n = this._currentFrameIndices!.length; i < n; i++)
            this._currentFrameIndices![i] = -1;
    }



    _getReferenceCount(): number {
        return this._referenceCount;
    }
    _addReference(count: number): void {
        (this._clip) && (this._clip._addReference(count));
        this._referenceCount += count;
    }
    _removeReference(count: number): void {
        (this._clip) && (this._clip._removeReference(count));
        this._referenceCount -= count;
    }
    _clearReference(): void {
        this._removeReference(-this._referenceCount);
    }

    destroy() {
        this._clip = null;
        this._currentFrameIndices = null;
        this._scripts = null;
        this.nexts = null;
        this._realtimeDatas.length = 0;
    }

}