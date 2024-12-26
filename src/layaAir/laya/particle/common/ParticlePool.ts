export class ParticleInfo {
    /**
     * emit time
     */
    timeIndex: number = 0;
    lifetimeIndex: number = 0;
}


export class ParticlePool {

    private _maxCount: number;
    private _particleStride: number;

    get particleStride(): number {
        return this._particleStride;
    }

    private _particleByteStride: number;

    get particleByteStride(): number {
        return this._particleByteStride;
    }

    particleDatas: Float32Array;

    readonly particleInfo: ParticleInfo;

    /**
     * @internal
     * active range [activeStartIndex, activeEndIndex)
     */
    activeStartIndex: number;
    /** @internal */
    activeEndIndex: number;

    /** @internal */
    updateStartIndex: number;
    /** @internal */
    updateEndIndex: number;

    get activeParticleCount(): number {
        if (this.activeEndIndex >= this.activeStartIndex) {
            return this.activeEndIndex - this.activeStartIndex;
        }
        else {
            return this._maxCount - this.activeStartIndex + this.activeEndIndex;
        }
    };

    constructor(maxCount: number, particleByteStride: number, particleInfo: ParticleInfo) {
        this._maxCount = maxCount + 1;
        this._particleStride = particleByteStride / Float32Array.BYTES_PER_ELEMENT;
        this._particleByteStride = particleByteStride;

        this.particleDatas = new Float32Array(this._maxCount * this._particleStride);

        this.particleInfo = particleInfo;

        this.clear();
    }

    clear() {
        this.activeStartIndex = 0;
        this.activeEndIndex = 0;
        this.updateStartIndex = 0;
        this.updateEndIndex = 0;
    }

    retireParticles(totleTime: number) {

        let activeStart = this.activeStartIndex;
        let activeEnd = this.activeEndIndex;

        while (this.activeStartIndex != this.activeEndIndex) {
            let index = this.activeStartIndex * this._particleStride;

            let timeIndex = this.particleInfo.timeIndex + index;
            let particleEmitTime = this.particleDatas[timeIndex];

            let particleAge = totleTime - particleEmitTime;

            let lifetimeIndex = this.particleInfo.lifetimeIndex + index;
            let particleLifetime = this.particleDatas[lifetimeIndex];

            if (particleAge < particleLifetime) {
                break;
            }

            this.activeStartIndex = (this.activeStartIndex + 1) % this._maxCount;
        }

        this.updateStartIndex = this.updateEndIndex = this.activeEndIndex;

        return;
    }

    addParticleData(data: Float32Array) {
        let index = this.activeEndIndex;
        let offset = index * this._particleStride;
        this.particleDatas.set(data, offset);

        this.activeEndIndex = (this.activeEndIndex + 1) % this._maxCount;
        this.updateEndIndex = this.activeEndIndex;
    }

    destroy() {
        this.clear();
        this.particleDatas = null;
    }

}
