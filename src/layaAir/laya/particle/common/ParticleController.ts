import { ParticleInfo, ParticlePool } from "./ParticlePool";

export abstract class ParticleControler {

    particlePool: ParticlePool;

    /** @internal */
    _initParticlePool(maxParticles: number, particleByteStride: number, particleInfo: ParticleInfo) {

        if (this.particlePool) {
            this.particlePool.destroy();
        }

        this.particlePool = new ParticlePool(maxParticles, particleByteStride, particleInfo);
    }

    /**
     * 播放时间（单位: 秒）
     */
    time: number = 0;

    /**
     * 总播放时间（单位: 秒）
     */
    totalTime: number = 0;

    /**
     * @internal
     * 上次 emit 的时间
     */
    _lastEmitTime: number = 0;
    /** @internal */
    _emitDistance: number = 0;
    /** @internal */
    _nextBurstIndex: number = 0;
    /** @internal */
    _burstLoopCount: number = 0;

    protected _isEmitting: boolean = false;

    get isEmitting(): boolean {
        return this._isEmitting;
    }

    protected _isPlaying: boolean = false;

    get isPlaying(): boolean {
        return this._isPlaying;
    }

    protected _isPaused: boolean = false;

    get isPaused(): boolean {
        return this._isPaused;
    }

    protected _isStopped: boolean = true;

    get isStopped(): boolean {
        return this._isStopped;
    }

    play() {
        this._isEmitting = true;
        this._isPlaying = true;
        this._isPaused = false;
        this._isStopped = false;
    }

    pause() {
        if (this.isPlaying) {
            this._isEmitting = false;
            this._isPlaying = false;
            this._isPaused = true;
            this._isStopped = false;
        }
    }

    stop() {
        this._isEmitting = false;
        this._isPlaying = false;
        this._isPaused = false;
        this._isStopped = true;

        this.clear();
    }

    clear() {
        this.time = 0;
        this.totalTime = 0;

        this._lastEmitTime = 0;

        this._emitDistance = 0;

        this._nextBurstIndex = 0;
        this._burstLoopCount = 0;

        this.particlePool.clear();
    }

    abstract simulate(time: number, restart: boolean): void;

    destroy() {
        this.clear();
        this.particlePool.destroy();
        this.particlePool = null;
    }
}