import type { VisualEffect } from "../VisualEffect";
import { sampleRange } from "../VFXUtils";
import { VFXSpawnerState } from "./VFXSpawnerState";
import { VFXEventAttributeType } from "../VFXEventAttribute";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Rand } from "../../maths/Rand";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";

/**
 * 用户脚本驱动 spawn 的回调签名
 * @param state 当前 spawnerState（可读 totalTime/loopIndex/loopCount/deltaTime 等）
 * @param dt    本帧 deltaTime
 * @returns     本帧要 spawn 的粒子数（>=0；可为分数，runtime 会按 floor + 余量累计）
 */
export type IVFXCustomSpawnCallback = (state: VFXSpawnerState, dt: number) => number;

export abstract class VFXSpawnerTask {

    abstract init(): void;

    play(): void { };

    stop(): void { };
    /**
     * 每当一个新的循环开始时调用
     */
    abstract internalInit(rand: Rand): void;

    abstract internalUpdate(spawnerState: VFXSpawnerState): void;

    update(spawnerState: VFXSpawnerState, rand: Rand): void {
        if (spawnerState.newLoop) {
            this.internalInit(rand);
        }

        if (spawnerState.isPlaying()) {
            this.internalUpdate(spawnerState);
        }

    }

    abstract release(): void;

}

// 持续生成：每秒以固定速率生成粒子
export class VFXSpawnerConstantRate extends VFXSpawnerTask {

    // 每秒生成的粒子数
    rate: number = 1;

    init(): void {

    }

    internalInit(rand: Rand): void {

    }

    internalUpdate(spawnerState: VFXSpawnerState): void {
        spawnerState.spawnCount += this.rate * spawnerState.deltaTime;
    }


    release(): void {
        // throw new Error("Method not implemented.");
    }

}

// 单次爆发：在延迟后一次性生成粒子，每个循环只触发一次
export class VFXSpawnerSingleBurst extends VFXSpawnerTask {

    // 每次爆发的粒子数（x=min, y=max）
    count: Vector2 = new Vector2(1, 1);

    // 循环开始后到首次爆发的延迟时间（x=min, y=max），单位：秒
    delay: Vector2 = new Vector2();

    // 当为 true 时，burst count = spawnerState.loopIndex % countModulo（对齐 Unity VFX LoopIndex → burst count 连接）
    countFromLoopIndex: boolean = false;
    countModulo: number = 0;

    private sleeping: boolean = false;
    private nextTriggerTime: number = 0;
    private sampledCount: number = 0;

    init(): void {
        this.sleeping = false;
        this.nextTriggerTime = 0;
        this.sampledCount = 0;
    }

    internalInit(rand: Rand): void {
        this.sleeping = false;
        this.nextTriggerTime = sampleRange(this.delay, rand);
        this.sampledCount = Math.round(sampleRange(this.count, rand));
    }

    internalUpdate(spawnerState: VFXSpawnerState): void {
        if (this.sleeping) {
            return;
        }
        /**
         * 单次 burst 无循环， 所以只触发一次
         */
        if (spawnerState.totalTime < this.nextTriggerTime) {
            return;
        }

        this.sleeping = true;
        if (this.countFromLoopIndex) {
            // Unity Modulo(loopIndex, N) → count 语义：loop 0 spawn 0 颗，loop 1 spawn 1 颗，... loop N-1 spawn N-1 颗，loop N 又 0 颗循环。
            // 之前写 `idx + 1` 让 loop 0 就 spawn 1 颗 texIndex=0 → 数字 atlas 起点错位（看到 "0" 而非 "1"）。
            const idx = this.countModulo > 0 ? (spawnerState.loopIndex % this.countModulo) : spawnerState.loopIndex;
            spawnerState.spawnCount += idx;
        } else {
            spawnerState.spawnCount += this.sampledCount;
        }
    }


    release(): void {

    }

}

// 位移累积：VFX 节点世界位移每累积 distance 发射 1 颗
export class VFXSpawnerOverDistance extends VFXSpawnerTask {

    distance: number = 1;

    owner: Sprite3D = null;   // 由 VisualEffect 注入

    private _lastPos: Vector3 = new Vector3();
    private _hasLast: boolean = false;
    private _accum: number = 0;

    init(): void {
        this._hasLast = false;
        this._accum = 0;
    }

    internalInit(rand: Rand): void {
        // 新循环重置累积，但保留位置跟踪以连续累加跨循环位移没意义
        this._accum = 0;
    }

    internalUpdate(spawnerState: VFXSpawnerState): void {
        if (!this.owner) return;
        const p = this.owner.transform.position;
        if (!this._hasLast) {
            this._lastPos.setValue(p.x, p.y, p.z);
            this._hasLast = true;
            return;
        }
        const dx = p.x - this._lastPos.x;
        const dy = p.y - this._lastPos.y;
        const dz = p.z - this._lastPos.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        this._accum += d;
        this._lastPos.setValue(p.x, p.y, p.z);

        const step = Math.max(this.distance, 1e-4);
        while (this._accum >= step) {
            spawnerState.spawnCount += 1;
            this._accum -= step;
        }
    }

    release(): void {
        this.owner = null;
    }
}

// 用户脚本驱动：每帧调用注册的 callback 决定 spawnCount
// 用法：VisualEffect.setCustomSpawnCallback("myName", (state, dt) => count)
export class VFXSpawnerCustomWrapper extends VFXSpawnerTask {

    callbackName: string = "default";

    effect: VisualEffect = null;   // 由 VisualEffect 注入，用于查 callback map

    init(): void { }

    internalInit(rand: Rand): void { }

    internalUpdate(spawnerState: VFXSpawnerState): void {
        if (!this.effect) return;
        const cb = this.effect.getCustomSpawnCallback(this.callbackName);
        if (!cb) return;
        const n = cb(spawnerState, spawnerState.deltaTime);
        if (n > 0) spawnerState.spawnCount += n;
    }

    // 注意：不能在 release 里清 effect — VFXSpawnerSystem.init() 第一行就调 release()
    // 把 effect 置 null 会导致 init 后 internalUpdate 永远拿不到 effect
    release(): void { }
}

// 写 spawn event attribute（对齐 Unity VFXSpawnerSetAttribute）
// 每帧把固定值或 loopIndex(%N) 写入 spawnerState.eventAttribute，
// 让粒子 Initialize 阶段 setAttribute(attr, source=Source) 能读到。
// 这是 Strip / GPU Event 链上 stripIndex / texIndex / lifetime 等正确分配的关键
export class VFXSpawnerSetEventAttribute extends VFXSpawnerTask {

    attribute: string = "lifetime";
    value: [number, number, number, number] = [0, 0, 0, 0];
    fromLoopIndex: boolean = false;
    loopIndexModulo: number = 0;
    // Unity SpawnContext 模式：lifetime ← Add(spawnState.loopDuration, spawnState.delayAfterLoop)
    // runtime 时用 spawnerState.loopDuration + delayAfterLoop 当 lifetime 值
    fromSpawnStateLoop: boolean = false;

    init(): void { }
    internalInit(rand: Rand): void { }

    internalUpdate(spawnerState: VFXSpawnerState): void {
        const attr = spawnerState.eventAttribute;
        if (!attr || !attr.desc.hasAttribute(this.attribute)) return;
        let v = this.value;
        if (this.fromLoopIndex) {
            const idx = this.loopIndexModulo > 0
                ? (spawnerState.loopIndex % this.loopIndexModulo)
                : spawnerState.loopIndex;
            v = [idx, 0, 0, 0];
        } else if (this.fromSpawnStateLoop) {
            const dur = (spawnerState as any).settings?.loopDuration ?? 1;
            const delay = (spawnerState as any).settings?.delayAfterLoop ?? 0;
            v = [dur + delay, 0, 0, 0];
        }
        const t = attr.desc.getAttributeType(this.attribute);
        switch (t) {
            case VFXEventAttributeType.Bool: attr.setBool(this.attribute, v[0] !== 0); break;
            case VFXEventAttributeType.Int: attr.setInt(this.attribute, v[0]); break;
            case VFXEventAttributeType.Uint: attr.setUint(this.attribute, v[0] >>> 0); break;
            case VFXEventAttributeType.Float: attr.setFloat(this.attribute, v[0]); break;
            case VFXEventAttributeType.Vector2: attr.setVector2(this.attribute, v[0], v[1]); break;
            case VFXEventAttributeType.Vector3: attr.setVector3(this.attribute, v[0], v[1], v[2]); break;
            case VFXEventAttributeType.Vector4: attr.setVector4(this.attribute, v[0], v[1], v[2], v[3]); break;
        }
    }

    release(): void { }
}

// 周期爆发：按固定间隔重复生成粒子
export class VFXSpawnerPeriodicBurst extends VFXSpawnerTask {

    // 每次爆发的粒子数（x=min, y=max）
    count: Vector2 = new Vector2(1, 1);

    // 爆发间隔（x=min, y=max），单位：秒；同时作为首次触发时间
    delay: Vector2 = new Vector2(1, 1);

    private nextTriggerTime: number = 0;

    // 持有 rand 引用，用于每次触发时重新采样
    private rand: Rand;

    init(): void {
        this.nextTriggerTime = 0;
    }

    internalInit(rand: Rand): void {
        this.rand = rand;
        this.nextTriggerTime = sampleRange(this.delay, rand);
    }

    internalUpdate(spawnerState: VFXSpawnerState): void {
        // 支持单帧内多次触发（帧率低或 delay 很短时）
        while (spawnerState.totalTime >= this.nextTriggerTime) {
            spawnerState.spawnCount += Math.round(sampleRange(this.count, this.rand));
            this.nextTriggerTime += sampleRange(this.delay, this.rand);
        }
    }

    release(): void {

    }

}
