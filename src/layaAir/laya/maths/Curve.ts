import { IClone } from "../utils/IClone";
import { FloatKeyframe } from "./FloatKeyframe";
import { WeightedMode } from "./Keyframe";

/**
 * @en Wrap mode for curve evaluation when time is outside the keyframe range.
 * @zh 当时间超出关键帧范围时，曲线求值的循环模式。
 */
export enum CurveWrapMode {
    /**
     * @en Clamp the value to the first/last keyframe value.
     * @zh 将值钳制到第一个/最后一个关键帧的值。
     */
    Clamp = 0,
    /**
     * @en Loop the curve by repeating the keyframe range.
     * @zh 通过重复关键帧范围来循环曲线。
     */
    Loop = 1,
    /**
     * @en Ping-pong the curve, alternating forward and backward.
     * @zh 乒乓模式，交替正向和反向播放。
     */
    PingPong = 2,
}

/**
 * @en The `Curve` class stores a collection of float keyframes and provides evaluation of interpolated values.
 * It supports Hermite spline interpolation with optional weighted tangents.
 * @zh `Curve` 类存储一组浮点关键帧，并提供插值求值功能。
 * 支持 Hermite 样条插值以及可选的加权切线。
 */
export class Curve implements IClone {

    /** @internal */
    private static _FRAME_STRIDE = 7;

    /**
     * @en Pre-wrap mode applied when time is before the first keyframe.
     * @zh 当时间早于第一个关键帧时应用的前循环模式。
     */
    preWrapMode: CurveWrapMode = CurveWrapMode.Clamp;

    /**
     * @en Post-wrap mode applied when time is after the last keyframe.
     * @zh 当时间晚于最后一个关键帧时应用的后循环模式。
     */
    postWrapMode: CurveWrapMode = CurveWrapMode.Clamp;

    /** @internal */
    private _keys: FloatKeyframe[] = [];

    /**
     * @ignore
     * @en Creates an instance of `Curve`.
     * @zh 创建一个 `Curve` 的实例。
     */
    constructor() {
    }

    /**
     * @en Flat keyframe data for serialization. Every 7 floats form one keyframe:
     * [time, value, inTangent, outTangent, inWeight, outWeight, weightedMode].
     * @zh 用于序列化的关键帧平坦数据。每 7 个 float 为一组关键帧:
     * [time, value, inTangent, outTangent, inWeight, outWeight, weightedMode]。
     */
    get frameData(): number[] {
        const keys = this._keys;
        const n = keys.length;
        const stride = Curve._FRAME_STRIDE;
        const data: number[] = new Array(n * stride);
        for (let i = 0; i < n; i++) {
            const k = keys[i];
            const off = i * stride;
            data[off] = k.time;
            data[off + 1] = k.value;
            data[off + 2] = k.inTangent;
            data[off + 3] = k.outTangent;
            data[off + 4] = k.inWeight;
            data[off + 5] = k.outWeight;
            data[off + 6] = k.weightedMode;
        }
        return data;
    }
    set frameData(value: number[]) {
        this._keys.length = 0;
        if (!value) return;
        const stride = Curve._FRAME_STRIDE;
        const count = Math.floor(value.length / stride);
        for (let i = 0; i < count; i++) {
            const off = i * stride;
            const key = new FloatKeyframe();
            key.time = value[off];
            key.value = value[off + 1];
            key.inTangent = value[off + 2];
            key.outTangent = value[off + 3];
            key.inWeight = value[off + 4];
            key.outWeight = value[off + 5];
            key.weightedMode = value[off + 6];
            this._keys.push(key);
        }
    }

    /**
     * @en The number of keyframes in the curve.
     * @zh 曲线中关键帧的数量。
     */
    get length(): number {
        return this._keys.length;
    }

    /**
     * @en The duration of the curve (time of the last keyframe minus time of the first keyframe).
     * @zh 曲线的时长（最后一个关键帧的时间减去第一个关键帧的时间）。
     */
    get duration(): number {
        if (this._keys.length === 0)
            return 0;
        return this._keys[this._keys.length - 1].time - this._keys[0].time;
    }

    /**
     * @en The start time of the curve (time of the first keyframe).
     * @zh 曲线的起始时间（第一个关键帧的时间）。
     */
    get startTime(): number {
        if (this._keys.length === 0)
            return 0;
        return this._keys[0].time;
    }

    /**
     * @en The end time of the curve (time of the last keyframe).
     * @zh 曲线的结束时间（最后一个关键帧的时间）。
     */
    get endTime(): number {
        if (this._keys.length === 0)
            return 0;
        return this._keys[this._keys.length - 1].time;
    }

    /**
     * @en Gets the keyframe at the specified index.
     * @param index The index of the keyframe.
     * @returns The keyframe at the index.
     * @zh 获取指定索引处的关键帧。
     * @param index 关键帧的索引。
     * @returns 该索引处的关键帧。
     */
    getKey(index: number): FloatKeyframe {
        return this._keys[index];
    }

    /**
     * @en Gets a readonly copy of all keyframes.
     * @returns The array of keyframes.
     * @zh 获取所有关键帧的只读副本。
     * @returns 关键帧数组。
     */
    get keys(): readonly FloatKeyframe[] {
        return this._keys;
    }

    /**
     * @en Adds a keyframe to the curve. Keyframes are kept sorted by time.
     * @param key The keyframe to add.
     * @returns The index at which the keyframe was inserted.
     * @zh 向曲线添加一个关键帧。关键帧按时间排序。
     * @param key 要添加的关键帧。
     * @returns 关键帧插入的索引位置。
     */
    addKey(key: FloatKeyframe): number;
    /**
     * @en Adds a keyframe with the specified time and value. Tangents default to 0.
     * @param time The time of the keyframe.
     * @param value The value of the keyframe.
     * @returns The index at which the keyframe was inserted.
     * @zh 使用指定的时间和值添加关键帧。切线默认为 0。
     * @param time 关键帧的时间。
     * @param value 关键帧的值。
     * @returns 关键帧插入的索引位置。
     */
    addKey(time: number, value: number): number;
    addKey(timeOrKey: number | FloatKeyframe, value?: number): number {
        let key: FloatKeyframe;
        if (typeof timeOrKey === "number") {
            key = new FloatKeyframe();
            key.time = timeOrKey;
            key.value = value!;
            key.inTangent = 0;
            key.outTangent = 0;
        } else {
            key = timeOrKey;
        }

        // Binary search for insertion position
        let index = this._findInsertIndex(key.time);
        this._keys.splice(index, 0, key);
        return index;
    }

    /**
     * @en Removes the keyframe at the specified index.
     * @param index The index of the keyframe to remove.
     * @zh 移除指定索引处的关键帧。
     * @param index 要移除的关键帧的索引。
     */
    removeKey(index: number): void {
        this._keys.splice(index, 1);
    }

    /**
     * @en Removes all keyframes from the curve.
     * @zh 移除曲线中的所有关键帧。
     */
    clear(): void {
        this._keys.length = 0;
    }

    /**
     * @en Evaluates the curve at the given time and returns the interpolated value.
     * Uses Hermite spline interpolation between keyframes, with optional weighted tangents.
     * @param time The time at which to evaluate the curve.
     * @returns The interpolated value.
     * @zh 在给定时间点对曲线求值，返回插值后的值。
     * 在关键帧之间使用 Hermite 样条插值，支持可选的加权切线。
     * @param time 求值的时间点。
     * @returns 插值后的值。
     */
    evaluate(time: number): number {
        return this._evaluate(time);
    }

    /**
     * @en Automatically computes smooth tangents for all keyframes.
     * @zh 自动为所有关键帧计算平滑切线。
     */
    smoothTangents(): void {
        const keys = this._keys;
        const count = keys.length;

        for (let i = 0; i < count; i++) {
            this.smoothTangent(i);
        }
    }

    /**
     * @en Computes a smooth tangent for the keyframe at the given index.
     * Uses the Catmull-Rom approach based on neighboring keyframes.
     * @param index The keyframe index.
     * @zh 为指定索引处的关键帧计算平滑切线。
     * 使用基于相邻关键帧的 Catmull-Rom 方法。
     * @param index 关键帧索引。
     */
    smoothTangent(index: number): void {
        const keys = this._keys;
        const count = keys.length;

        if (count < 2) return;

        const key = keys[index];

        if (index === 0) {
            // First key: use forward difference
            const next = keys[1];
            const tangent = (next.value - key.value) / (next.time - key.time);
            key.inTangent = tangent;
            key.outTangent = tangent;
        } else if (index === count - 1) {
            // Last key: use backward difference
            const prev = keys[index - 1];
            const tangent = (key.value - prev.value) / (key.time - prev.time);
            key.inTangent = tangent;
            key.outTangent = tangent;
        } else {
            // Middle keys: average of slopes to neighbors
            const prev = keys[index - 1];
            const next = keys[index + 1];
            const tangent = 0.5 * (
                (key.value - prev.value) / (key.time - prev.time) +
                (next.value - key.value) / (next.time - key.time)
            );
            key.inTangent = tangent;
            key.outTangent = tangent;
        }
    }

    /**
     * @en Sets a flat (zero) tangent for the keyframe at the given index.
     * @param index The keyframe index.
     * @zh 将指定索引处的关键帧的切线设置为平坦（零）。
     * @param index 关键帧索引。
     */
    flatTangent(index: number): void {
        const key = this._keys[index];
        if (key) {
            key.inTangent = 0;
            key.outTangent = 0;
        }
    }

    /**
     * @inheritDoc
     * @override
     * @en Clones the data to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆数据到目标对象。
     * @param destObject 克隆目标。
     */
    cloneTo(destObject: Curve): void {
        destObject.preWrapMode = this.preWrapMode;
        destObject.postWrapMode = this.postWrapMode;
        destObject._keys.length = 0;
        for (let i = 0, n = this._keys.length; i < n; i++) {
            destObject._keys.push(this._keys[i].clone());
        }
    }

    /**
     * @en Creates a clone of the current curve.
     * @returns A clone of the current curve.
     * @zh 克隆当前曲线。
     * @returns 克隆副本。
     */
    clone(): Curve {
        const dest = new Curve();
        this.cloneTo(dest);
        return dest;
    }

    /**
     * @internal
     * @en Internal curve evaluation with clamping and Hermite interpolation.
     * @zh 内部曲线求值，包含边界钳位和 Hermite 插值。
     */
    private _evaluate(time: number): number {
        const keys = this._keys;
        const count = keys.length;

        if (count === 0)
            return 0;

        if (count === 1)
            return keys[0].value;

        const firstTime = keys[0].time;
        const lastTime = keys[count - 1].time;

        // Handle time outside keyframe range
        if (time <= firstTime) {
            if (this.preWrapMode === CurveWrapMode.Clamp || firstTime === lastTime)
                return keys[0].value;
            time = this._wrapTime(time, firstTime, lastTime, this.preWrapMode);
        } else if (time >= lastTime) {
            if (this.postWrapMode === CurveWrapMode.Clamp || firstTime === lastTime)
                return keys[count - 1].value;
            time = this._wrapTime(time, firstTime, lastTime, this.postWrapMode);
        }

        // Find the keyframe segment
        const index = this._findFrameIndex(time);
        const frame = keys[index];
        const nextFrame = keys[index + 1];

        // Calculate normalized t in segment
        const dur = nextFrame.time - frame.time;
        if (dur <= 0)
            return frame.value;

        const t = (time - frame.time) / dur;

        return this._curveInterpolate(frame, nextFrame, t, dur);
    }

    /**
     * @internal
     * @en Wrap time according to the given mode.
     * @zh 根据给定模式包裹时间。
     */
    private _wrapTime(time: number, firstTime: number, lastTime: number, mode: CurveWrapMode): number {
        const duration = lastTime - firstTime;
        if (duration <= 0)
            return firstTime;

        switch (mode) {
            case CurveWrapMode.Loop: {
                let t = (time - firstTime) % duration;
                if (t < 0) t += duration;
                return firstTime + t;
            }
            case CurveWrapMode.PingPong: {
                let t = (time - firstTime) % (duration * 2);
                if (t < 0) t += duration * 2;
                if (t > duration)
                    t = duration * 2 - t;
                return firstTime + t;
            }
            default:
                return time;
        }
    }

    /**
     * @internal
     * @en Find the insertion index for a given time using binary search.
     * @zh 使用二分查找找到给定时间的插入索引。
     */
    private _findInsertIndex(time: number): number {
        const keys = this._keys;
        let low = 0;
        let high = keys.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (keys[mid].time < time)
                low = mid + 1;
            else
                high = mid;
        }
        return low;
    }

    /**
     * @internal
     * @en Find the frame index for evaluation. Returns the index of the keyframe at or just before the given time.
     * @zh 查找求值时的帧索引。返回给定时间处或之前的关键帧索引。
     */
    private _findFrameIndex(time: number): number {
        const keys = this._keys;
        let low = 0;
        let high = keys.length - 2; // max valid index is length-2 (so next is length-1)
        while (low <= high) {
            const mid = (low + high) >>> 1;
            if (keys[mid + 1].time <= time)
                low = mid + 1;
            else if (keys[mid].time > time)
                high = mid - 1;
            else
                return mid;
        }
        return Math.max(0, Math.min(low, keys.length - 2));
    }

    /**
     * @internal
     * @en Check whether standard Hermite interpolation should be used (non-weighted mode).
     * @zh 检查是否应使用标准 Hermite 插值（非加权模式）。
     */
    private _isStandardHermite(weightMode: number, nextWeightMode: number): boolean {
        return ((weightMode & WeightedMode.Out) === 0) && ((nextWeightMode & WeightedMode.In) === 0);
    }

    /**
     * @internal
     * @en Hermite spline interpolation between two keyframes.
     * @zh 两个关键帧之间的 Hermite 样条插值。
     */
    private _hermiteInterpolate(frame: FloatKeyframe, nextFrame: FloatKeyframe, t: number, dur: number): number {
        const t0 = frame.outTangent;
        const t1 = nextFrame.inTangent;
        if (Number.isFinite(t0) && Number.isFinite(t1)) {
            const t2 = t * t;
            const t3 = t2 * t;
            const a = 2.0 * t3 - 3.0 * t2 + 1.0;
            const b = t3 - 2.0 * t2 + t;
            const c = t3 - t2;
            const d = -2.0 * t3 + 3.0 * t2;
            return a * frame.value + b * t0 * dur + c * t1 * dur + d * nextFrame.value;
        }
        return frame.value;
    }

    /**
     * @internal
     * @en Weighted Hermite spline interpolation using third-order Householder root finding.
     * @zh 使用三阶 Householder 求根法的加权 Hermite 样条插值。
     */
    private _hermiteWeightedInterpolate(
        frameValue: number, frameTime: number, frameOutWeight: number, frameOutTangent: number,
        nextFrameValue: number, nextFrameTime: number, nextFrameInWeight: number, nextFrameInTangent: number,
        time: number
    ): number {
        const Eps = 2.22e-16;

        const x = time;
        const x1 = frameTime;
        const y1 = frameValue;
        const wt1 = frameOutWeight;
        const x2 = nextFrameTime;
        const y2 = nextFrameValue;
        const wt2 = nextFrameInWeight;

        const dx = x2 - x1;
        let dy = y2 - y1;
        dy = Math.max(Math.abs(dy), Eps) * (dy < 0 ? -1 : 1);

        let yp1 = frameOutTangent;
        let yp2 = nextFrameInTangent;

        if (!Number.isFinite(yp1) || !Number.isFinite(yp2)) {
            return frameValue;
        }

        yp1 = yp1 * dx / dy;
        yp2 = yp2 * dx / dy;

        const wt2s = 1 - wt2;

        let t = 0.5;
        let t2 = 0;

        if (Math.abs(wt1 - 0.33333334) < 0.0001 && Math.abs(wt2 - 0.33333334) < 0.0001) {
            t = x;
            t2 = 1 - t;
        } else {
            while (true) {
                t2 = (1 - t);
                const fg = 3 * t2 * t2 * t * wt1 + 3 * t2 * t * t * wt2s + t * t * t - x;
                if (Math.abs(fg) <= 2.5 * Eps)
                    break;

                // Third order Householder method
                const fpg = 3 * t2 * t2 * wt1 + 6 * t2 * t * (wt2s - wt1) + 3 * t * t * (1 - wt2s);
                const fppg = 6 * t2 * (wt2s - 2 * wt1) + 6 * t * (1 - 2 * wt2s + wt1);
                const fpppg = 18 * wt1 - 18 * wt2s + 6;

                t -= (6 * fg * fpg * fpg - 3 * fg * fg * fppg) / (6 * fpg * fpg * fpg - 6 * fg * fpg * fppg + fg * fg * fpppg);
            }
        }

        const y = 3 * t2 * t2 * t * wt1 * yp1 + 3 * t2 * t * t * (1 - wt2 * yp2) + t * t * t;

        return y * dy + y1;
    }

    /**
     * @internal
     * @en Interpolate between two keyframes, choosing standard or weighted Hermite.
     * @zh 在两个关键帧之间插值，自动选择标准或加权 Hermite。
     */
    private _curveInterpolate(frame: FloatKeyframe, nextFrame: FloatKeyframe, t: number, dur: number): number {
        if (!frame.weightedMode || this._isStandardHermite(frame.weightedMode, nextFrame.weightedMode)) {
            return this._hermiteInterpolate(frame, nextFrame, t, dur);
        } else {
            return this._hermiteWeightedInterpolate(
                frame.value, frame.time, frame.outWeight, frame.outTangent,
                nextFrame.value, nextFrame.time, nextFrame.inWeight, nextFrame.inTangent,
                t
            );
        }
    }
}
