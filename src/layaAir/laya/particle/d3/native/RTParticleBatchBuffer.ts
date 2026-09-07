export interface RTParticleShadowRecord {
    handle: number;
    flags: number;
    configEpoch: number;
    capacity: number;
    currentTime: number;
    emissionTime: number;
    frameRateTime: number;
    duration: number;
    emissionRate: number;
    lifetime: number;
    oracleAlive: number;
    oracleSpawned: number;
    oracleRetired: number;
    oracleBurstIndex: number;
    oracleBurstSeed: number;
    totalDelayTime: number;
    playStartDelay: number;
    elapsedTime: number;
    emitterPositionX: number;
    emitterPositionY: number;
    emitterPositionZ: number;
    emissionLastPositionX: number;
    emissionLastPositionY: number;
    emissionLastPositionZ: number;
    emitterRotationX: number;
    emitterRotationY: number;
    emitterRotationZ: number;
    emitterRotationW: number;
}

export interface RTParticleBurstConfig {
    time: number;
    minCount: number;
    maxCount: number;
}

/**
 * Bootstrap/resynchronisation frame protocol shared with Native ParticleManager.
 *
 * Header (5 x uint32):
 *   magic, ABI version, loopCount, recordCount, used word count
 *
 * Each ABI-v5 record has 49 fixed words followed by `seedCount` pairs of float64
 * birth time/lifetime values and `randomSeedCount` uint32 RNG stream states.
 * Seed data is present only on initialisation or resynchronisation; ordinary
 * frames remain fixed-size records.
 */
export class RTParticleBatchBuffer {
    static readonly MAGIC: number = 0x50525430;
    static readonly ABI_VERSION: number = 5;
    static readonly HEADER_WORDS: number = 5;
    static readonly RECORD_WORDS: number = 49;

    private _capacityWords: number;
    private _buffer: ArrayBuffer;
    private _words: Uint32Array;
    private _view: DataView;
    private _recordCount: number = 0;
    private _usedWords: number = RTParticleBatchBuffer.HEADER_WORDS;

    constructor(initialRecordCapacity: number = 64) {
        this._capacityWords = RTParticleBatchBuffer.HEADER_WORDS +
            Math.max(1, initialRecordCapacity) * RTParticleBatchBuffer.RECORD_WORDS;
        this._buffer = new ArrayBuffer(this._capacityWords * 4);
        this._words = new Uint32Array(this._buffer);
        this._view = new DataView(this._buffer);
    }

    begin(loopCount: number): void {
        this._recordCount = 0;
        this._usedWords = RTParticleBatchBuffer.HEADER_WORDS;
        this._words[0] = RTParticleBatchBuffer.MAGIC;
        this._words[1] = RTParticleBatchBuffer.ABI_VERSION;
        this._words[2] = loopCount >>> 0;
        this._words[3] = 0;
        this._words[4] = this._usedWords;
    }

    push(record: RTParticleShadowRecord, seedData: Float64Array | null, seedCount: number,
        randomSeeds: Uint32Array | null = null): void {
        const seedWords = seedCount * 4;
        const randomSeedCount = randomSeeds?.length ?? 0;
        const requiredWords = this._usedWords + RTParticleBatchBuffer.RECORD_WORDS + seedWords;
        const totalRequiredWords = requiredWords + randomSeedCount;
        if (totalRequiredWords > this._capacityWords)
            this._grow(totalRequiredWords);

        const start = this._usedWords;
        this._words[start] = record.handle >>> 0;
        this._words[start + 1] = record.flags >>> 0;
        this._words[start + 2] = record.configEpoch >>> 0;
        this._words[start + 3] = record.capacity >>> 0;
        this._writeFloat64(start + 4, record.currentTime);
        this._writeFloat64(start + 6, record.emissionTime);
        this._writeFloat64(start + 8, record.frameRateTime);
        this._writeFloat64(start + 10, record.duration);
        this._writeFloat64(start + 12, record.emissionRate);
        this._writeFloat64(start + 14, record.lifetime);
        this._words[start + 16] = record.oracleAlive >>> 0;
        this._words[start + 17] = record.oracleSpawned >>> 0;
        this._words[start + 18] = record.oracleRetired >>> 0;
        this._words[start + 19] = seedCount >>> 0;
        this._words[start + 20] = record.oracleBurstIndex >>> 0;
        this._words[start + 21] = record.oracleBurstSeed >>> 0;
        this._writeFloat64(start + 22, record.totalDelayTime);
        this._writeFloat64(start + 24, record.playStartDelay);
        this._writeFloat64(start + 26, record.elapsedTime);
        this._writeFloat64(start + 28, record.emitterPositionX);
        this._writeFloat64(start + 30, record.emitterPositionY);
        this._writeFloat64(start + 32, record.emitterPositionZ);
        this._writeFloat64(start + 34, record.emissionLastPositionX);
        this._writeFloat64(start + 36, record.emissionLastPositionY);
        this._writeFloat64(start + 38, record.emissionLastPositionZ);
        this._writeFloat64(start + 40, record.emitterRotationX);
        this._writeFloat64(start + 42, record.emitterRotationY);
        this._writeFloat64(start + 44, record.emitterRotationZ);
        this._writeFloat64(start + 46, record.emitterRotationW);
        this._words[start + 48] = randomSeedCount >>> 0;

        if (seedCount > 0 && seedData) {
            let word = start + RTParticleBatchBuffer.RECORD_WORDS;
            for (let i = 0; i < seedCount; i++) {
                this._writeFloat64(word, seedData[i * 2]);
                this._writeFloat64(word + 2, seedData[i * 2 + 1]);
                word += 4;
            }
        }

        if (randomSeeds)
            this._words.set(randomSeeds, start + RTParticleBatchBuffer.RECORD_WORDS + seedWords);

        this._usedWords = totalRequiredWords;
        ++this._recordCount;
    }

    seal(): Uint32Array {
        this._words[3] = this._recordCount;
        this._words[4] = this._usedWords;
        return this._words;
    }

    get count(): number {
        return this._recordCount;
    }

    get usedByteLength(): number {
        return this._usedWords * 4;
    }

    private _writeFloat64(wordOffset: number, value: number): void {
        this._view.setFloat64(wordOffset * 4, value, true);
    }

    private _grow(requiredWords: number): void {
        let next = this._capacityWords;
        while (next < requiredWords)
            next = Math.max(next + 1, next + (next >> 1));

        const grown = new ArrayBuffer(next * 4);
        new Uint32Array(grown).set(this._words.subarray(0, this._usedWords));
        this._buffer = grown;
        this._words = new Uint32Array(grown);
        this._view = new DataView(grown);
        this._capacityWords = next;
    }
}

export interface RTParticleOwnerRecord {
    handle: number;
    configEpoch: number;
    elapsedTime: number;
    hasWorldTransform: boolean;
    emitterPositionX: number;
    emitterPositionY: number;
    emitterPositionZ: number;
    emissionLastPositionX: number;
    emissionLastPositionY: number;
    emissionLastPositionZ: number;
    emitterRotationX: number;
    emitterRotationY: number;
    emitterRotationZ: number;
    emitterRotationW: number;
}

/**
 * Compact hot-path ABI used after Native has accepted simulation ownership.
 * Local-space emitters use six words (24 bytes); world-space emitters append
 * ten float32 transform words and use sixteen words (64 bytes).
 */
export class RTParticleOwnerBatchBuffer {
    static readonly MAGIC: number = 0x50524f30; // PRO0
    static readonly ABI_VERSION: number = 1;
    static readonly HEADER_WORDS: number = 5;
    static readonly BASE_RECORD_WORDS: number = 6;
    static readonly WORLD_RECORD_WORDS: number = 16;

    private _capacityWords: number = RTParticleOwnerBatchBuffer.HEADER_WORDS + 64 * RTParticleOwnerBatchBuffer.BASE_RECORD_WORDS;
    private _buffer: ArrayBuffer = new ArrayBuffer(this._capacityWords * 4);
    private _words: Uint32Array = new Uint32Array(this._buffer);
    private _view: DataView = new DataView(this._buffer);
    private _recordCount: number = 0;
    private _usedWords: number = RTParticleOwnerBatchBuffer.HEADER_WORDS;

    begin(loopCount: number): void {
        this._recordCount = 0;
        this._usedWords = RTParticleOwnerBatchBuffer.HEADER_WORDS;
        this._words[0] = RTParticleOwnerBatchBuffer.MAGIC;
        this._words[1] = RTParticleOwnerBatchBuffer.ABI_VERSION;
        this._words[2] = loopCount >>> 0;
        this._words[3] = 0;
        this._words[4] = this._usedWords;
    }

    push(record: RTParticleOwnerRecord): void {
        const recordWords = record.hasWorldTransform ?
            RTParticleOwnerBatchBuffer.WORLD_RECORD_WORDS : RTParticleOwnerBatchBuffer.BASE_RECORD_WORDS;
        const required = this._usedWords + recordWords;
        if (required > this._capacityWords)
            this._grow(required);

        const start = this._usedWords;
        this._words[start] = record.handle >>> 0;
        this._words[start + 1] = record.configEpoch >>> 0;
        this._words[start + 2] = recordWords;
        this._words[start + 3] = record.hasWorldTransform ? 1 : 0;
        this._view.setFloat64((start + 4) * 4, record.elapsedTime, true);
        if (record.hasWorldTransform) {
            this._view.setFloat32((start + 6) * 4, record.emitterPositionX, true);
            this._view.setFloat32((start + 7) * 4, record.emitterPositionY, true);
            this._view.setFloat32((start + 8) * 4, record.emitterPositionZ, true);
            this._view.setFloat32((start + 9) * 4, record.emissionLastPositionX, true);
            this._view.setFloat32((start + 10) * 4, record.emissionLastPositionY, true);
            this._view.setFloat32((start + 11) * 4, record.emissionLastPositionZ, true);
            this._view.setFloat32((start + 12) * 4, record.emitterRotationX, true);
            this._view.setFloat32((start + 13) * 4, record.emitterRotationY, true);
            this._view.setFloat32((start + 14) * 4, record.emitterRotationZ, true);
            this._view.setFloat32((start + 15) * 4, record.emitterRotationW, true);
        }
        this._usedWords = required;
        ++this._recordCount;
    }

    seal(): Uint32Array {
        this._words[3] = this._recordCount;
        this._words[4] = this._usedWords;
        return this._words;
    }

    get count(): number {
        return this._recordCount;
    }

    get usedByteLength(): number {
        return this._usedWords * 4;
    }

    private _grow(requiredWords: number): void {
        let next = this._capacityWords;
        while (next < requiredWords)
            next = Math.max(next + 1, next + (next >> 1));
        const grown = new ArrayBuffer(next * 4);
        new Uint32Array(grown).set(this._words.subarray(0, this._usedWords));
        this._buffer = grown;
        this._words = new Uint32Array(grown);
        this._view = new DataView(grown);
        this._capacityWords = next;
    }
}

export const enum RTParticleCommandType {
    Play = 1,
    Pause = 2,
    Stop = 3,
    Simulate = 4,
    Emit = 5,
    AddParticle = 6
}

export interface RTParticleCommand {
    type: RTParticleCommandType;
    values?: number[];
    burstSeed?: number;
    randomSeeds?: Uint32Array;
}

/** Rare control operations are collected per Scene and cross the JS/C++ ABI once. */
export class RTParticleCommandBatchBuffer {
    static readonly MAGIC: number = 0x50434d30; // PCM0
    static readonly ABI_VERSION: number = 1;
    static readonly HEADER_WORDS: number = 4;
    static readonly RECORD_WORDS: number = 4;

    private _capacityWords: number = 128;
    private _buffer: ArrayBuffer = new ArrayBuffer(this._capacityWords * 4);
    private _words: Uint32Array = new Uint32Array(this._buffer);
    private _view: DataView = new DataView(this._buffer);
    private _recordCount: number = 0;
    private _usedWords: number = RTParticleCommandBatchBuffer.HEADER_WORDS;

    begin(): void {
        this._recordCount = 0;
        this._usedWords = RTParticleCommandBatchBuffer.HEADER_WORDS;
        this._words[0] = RTParticleCommandBatchBuffer.MAGIC;
        this._words[1] = RTParticleCommandBatchBuffer.ABI_VERSION;
        this._words[2] = 0;
        this._words[3] = this._usedWords;
    }

    push(handle: number, command: RTParticleCommand): void {
        const values = command.values ?? [];
        const seeds = command.randomSeeds;
        const seedCount = seeds?.length ?? 0;
        const extraWords = command.type === RTParticleCommandType.Play ? 4 + seedCount : values.length * 2;
        const recordWords = RTParticleCommandBatchBuffer.RECORD_WORDS + extraWords;
        const required = this._usedWords + recordWords;
        if (required > this._capacityWords)
            this._grow(required);

        const start = this._usedWords;
        this._words[start] = handle >>> 0;
        this._words[start + 1] = command.type;
        this._words[start + 2] = recordWords;
        this._words[start + 3] = 0;
        if (command.type === RTParticleCommandType.Play) {
            this._view.setFloat64((start + 4) * 4, values[0] ?? 0, true);
            this._words[start + 6] = command.burstSeed ?? 0;
            this._words[start + 7] = seedCount;
            if (seeds)
                this._words.set(seeds, start + 8);
        } else {
            let word = start + RTParticleCommandBatchBuffer.RECORD_WORDS;
            for (const value of values) {
                this._view.setFloat64(word * 4, value, true);
                word += 2;
            }
        }
        this._usedWords = required;
        ++this._recordCount;
    }

    seal(): Uint32Array {
        this._words[2] = this._recordCount;
        this._words[3] = this._usedWords;
        return this._words;
    }

    get count(): number {
        return this._recordCount;
    }

    get usedByteLength(): number {
        return this._usedWords * 4;
    }

    private _grow(requiredWords: number): void {
        let next = this._capacityWords;
        while (next < requiredWords)
            next = Math.max(next + 1, next + (next >> 1));
        const grown = new ArrayBuffer(next * 4);
        new Uint32Array(grown).set(this._words.subarray(0, this._usedWords));
        this._buffer = grown;
        this._words = new Uint32Array(grown);
        this._view = new DataView(grown);
        this._capacityWords = next;
    }
}

/** Cold Burst configuration protocol. It is flushed only when an emitter's
 * config epoch changes, independently from the per-frame shadow batch. */
export class RTParticleConfigBatchBuffer {
    static readonly MAGIC: number = 0x50524330;
    static readonly ABI_VERSION: number = 2;
    static readonly HEADER_WORDS: number = 4;
    static readonly RECORD_WORDS: number = 5;
    static readonly BURST_WORDS: number = 6;

    private _capacityWords: number = 256;
    private _buffer: ArrayBuffer = new ArrayBuffer(this._capacityWords * 4);
    private _words: Uint32Array = new Uint32Array(this._buffer);
    private _view: DataView = new DataView(this._buffer);
    private _recordCount: number = 0;
    private _usedWords: number = RTParticleConfigBatchBuffer.HEADER_WORDS;

    begin(): void {
        this._recordCount = 0;
        this._usedWords = RTParticleConfigBatchBuffer.HEADER_WORDS;
        this._words[0] = RTParticleConfigBatchBuffer.MAGIC;
        this._words[1] = RTParticleConfigBatchBuffer.ABI_VERSION;
        this._words[2] = 0;
        this._words[3] = this._usedWords;
    }

    push(handle: number, configEpoch: number, bursts: ArrayLike<RTParticleBurstConfig>, burstCount: number,
        spawnValues: Float64Array): void {
        const required = this._usedWords + RTParticleConfigBatchBuffer.RECORD_WORDS +
            burstCount * RTParticleConfigBatchBuffer.BURST_WORDS + spawnValues.length * 2;
        if (required > this._capacityWords)
            this._grow(required);

        let word = this._usedWords;
        this._words[word] = handle >>> 0;
        this._words[word + 1] = configEpoch >>> 0;
        this._words[word + 2] = burstCount >>> 0;
        this._words[word + 3] = spawnValues.length >>> 0;
        this._words[word + 4] = 0;
        word += RTParticleConfigBatchBuffer.RECORD_WORDS;
        for (let i = 0; i < burstCount; i++) {
            const burst = bursts[i];
            this._view.setFloat64(word * 4, burst.time, true);
            this._view.setFloat64((word + 2) * 4, burst.minCount, true);
            this._view.setFloat64((word + 4) * 4, burst.maxCount, true);
            word += RTParticleConfigBatchBuffer.BURST_WORDS;
        }
        for (let i = 0; i < spawnValues.length; i++) {
            this._view.setFloat64(word * 4, spawnValues[i], true);
            word += 2;
        }
        this._usedWords = required;
        ++this._recordCount;
    }

    seal(): Uint32Array {
        this._words[2] = this._recordCount;
        this._words[3] = this._usedWords;
        return this._words;
    }

    get count(): number {
        return this._recordCount;
    }

    private _grow(requiredWords: number): void {
        let next = this._capacityWords;
        while (next < requiredWords)
            next = Math.max(next + 1, next + (next >> 1));
        const grown = new ArrayBuffer(next * 4);
        new Uint32Array(grown).set(this._words.subarray(0, this._usedWords));
        this._buffer = grown;
        this._words = new Uint32Array(grown);
        this._view = new DataView(grown);
        this._capacityWords = next;
    }
}
