import { IClone } from "../../../utils/IClone";
import { Burst } from "./Burst";

/**
 * @en The Emission class is used for particle emitters.
 * @zh Emission 类用于粒子发射器。
 */
export class Emission implements IClone {
    /** @internal Mutation version consumed by the Native particle cold-config chain. */
    _nativeParticleConfigVersion: number = 1;
    /** @internal */
    private _destroyed: boolean;
    /** @internal */
    private _emissionRate: number = 10;

    private _emissionRateOverDistance: number = 0;

    /**
     * @internal
     * @en Particle bursts, not allowed to modify.
     * @zh 粒子的爆发，不允许修改。
     */
    _bursts: Burst[];

    /**
     * @en Whether the emission is enabled.
     * @zh 是否启用。
     */
    enable: boolean;

    /**
     * @en The particle emission rate.
     * @zh 粒子发射速率。
     */
    get emissionRate(): number {
        return this._emissionRate;
    }

    set emissionRate(value: number) {
        if (value < 0)
            throw new Error("emissionRate value must large or equal than 0.");
        if (Object.is(this._emissionRate, value))
            return;
        this._emissionRate = value;
        this._markNativeParticleConfigChanged();
    }


    /**
     * @en Particle emission rate based on distance (particles/meter).
     * @zh 粒子基于距离的发射速率（个/米）。
     */
    get emissionRateOverDistance(): number {
        return this._emissionRateOverDistance;
    }

    set emissionRateOverDistance(value: number) {
        value = Math.max(0, value);
        if (Object.is(this._emissionRateOverDistance, value))
            return;
        this._emissionRateOverDistance = value;
        this._markNativeParticleConfigChanged();
    }

    /**
     * @en Whether the object has been destroyed.
     * @zh 是否已销毁。
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    /**
     * @ignore
     * @en Creates an instance of the Emission class.
     * @zh 创建Emission类的实例。
     */
    constructor() {
        this._destroyed = false;
        this._bursts = [];
    }

    private _markNativeParticleConfigChanged(): void {
        this._nativeParticleConfigVersion = (this._nativeParticleConfigVersion + 1) >>> 0;
        if (this._nativeParticleConfigVersion === 0)
            this._nativeParticleConfigVersion = 1;
    }

    /**
     * @private
     * @en Destroy the object.
     * @zh 销毁对象。
     */
    destroy(): void {
        this._bursts = null;
        this._destroyed = true;
    }

    /**
     * @en Get the number of particle bursts.
     * @zh 获取粒子爆发个数。
     */
    getBurstsCount(): number {
        return this._bursts.length;
    }

    /**
     * @en Get a particle burst by index.
     * @param index The burst index.
     * @returns The particle burst.
     * @zh 通过索引获取粒子爆发。
     * @param index 粒子爆发索引。
     * @return 粒子爆发。
     */
    getBurstByIndex(index: number): Burst {
        return this._bursts[index];
    }

    /**
     * @en Add a particle burst.
     * @param burst The burst to add.
     * @zh 增加粒子爆发。
     * @param burst 要添加的爆发。
     */
    addBurst(burst: Burst): void {
        var burstsCount: number = this._bursts.length;
        if (burstsCount > 0)
            for (var i: number = 0; i < burstsCount; i++) {
                if (this._bursts[i].time > burst.time)
                    this._bursts.splice(i, 0, burst);
            }
        this._bursts.push(burst);
        this._markNativeParticleConfigChanged();
    }

    /**
     * @en Remove a particle burst.
     * @param burst The burst to remove.
     * @zh 移除粒子爆发。
     * @param burst 要移除的爆发。
     */
    removeBurst(burst: Burst): void {
        var index: number = this._bursts.indexOf(burst);
        if (index !== -1) {
            this._bursts.splice(index, 1);
            this._markNativeParticleConfigChanged();
        }
    }

    /**
     * @en Remove a particle burst by index.
     * @param index The burst index to remove.
     * @zh 通过索引移除粒子爆发。
     * @param index 爆发索引。
     */
    removeBurstByIndex(index: number): void {
        const previousLength = this._bursts.length;
        this._bursts.splice(index, 1);
        if (this._bursts.length !== previousLength)
            this._markNativeParticleConfigChanged();
    }

    /**
     * @en Clear all particle bursts.
     * @zh 清空粒子爆发。
     */
    clearBurst(): void {
        if (this._bursts.length === 0)
            return;
        this._bursts.length = 0;
        this._markNativeParticleConfigChanged();
    }

    /**
     * @en Clones to a target object.
     * @param destObject The target object to clone to.
     * @zh 克隆到目标对象。
     * @param destObject 要克隆到的目标对象。
     */
    cloneTo(destObject: Emission): void {
        var destBursts: Burst[] = destObject._bursts;
        destBursts.length = this._bursts.length;
        for (var i: number = 0, n: number = this._bursts.length; i < n; i++) {
            var destBurst: Burst = destBursts[i];
            if (destBurst)
                this._bursts[i].cloneTo(destBurst);
            else
                destBursts[i] = this._bursts[i].clone();
        }

        destObject._emissionRate = this._emissionRate;
        destObject._emissionRateOverDistance = this._emissionRateOverDistance;
        destObject.enable = this.enable;
        destObject._markNativeParticleConfigChanged();
    }

    /**
     * @en Clone.
     * @returns Clone copy.
     * @zh 克隆。
     * @returns 克隆副本。
     */
    clone() {
        var destEmission: Emission = new Emission();
        this.cloneTo(destEmission);
        return destEmission;
    }
}
