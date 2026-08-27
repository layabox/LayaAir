import { BaseRenderType } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import type { BaseRender } from "../../../d3/core/render/BaseRender";
import { RTParticleBatchBuffer, RTParticleCommand, RTParticleCommandBatchBuffer, RTParticleConfigBatchBuffer,
    RTParticleOwnerBatchBuffer, RTParticleOwnerRecord, RTParticleShadowRecord } from "./RTParticleBatchBuffer";
import { compileRTParticleSpawnProgram, RT_PARTICLE_SPAWN_VALUE_COUNT } from "./RTParticleSpawnProgram";
import { RTParticleColdConfigTracker } from "./RTParticleColdConfigTracker";
import { ShuriKenParticle3DShaderDeclaration } from "../ShuriKenParticle3DShaderDeclaration";

interface NativeParticleManager {
    createEmitter(capacity: number): number;
    destroyEmitter(handle: number): void;
    reset(): void;
    syncConfigBatch(configBuffer: Uint32Array): void;
    syncBatch(frameBuffer: Uint32Array): void;
    syncOwnerBatch(ownerBuffer: Uint32Array): void;
    syncCommandBatch(commandBuffer: Uint32Array): void;
    bindInstanceBuffer(handle: number, nativeBuffer: any): boolean;
    bindFrameClock(frameClock: ArrayBuffer): void;
    bindEmitterState(handle: number, stateBuffer: ArrayBuffer): boolean;
    syncEmitterState?(handle: number): boolean;
    writeEmitterFallbackSnapshot?(handle: number, records: ArrayBuffer,
        state: ArrayBuffer): boolean;
    bindEmitterResources(handle: number, nativeTransform: any, nativeGeometry: any,
        nativeBuffer: any, nativeShaderData: any, currentTimeProperty: number,
        geometryMode: number, drawCountPerParticle: number, simulationSpeed: number): boolean;
    releaseBootstrapMemory(): void;
    stageInstanceUpload(handle: number, sourceBuffer: ArrayBuffer, byteStride: number,
        firstActive: number, firstFree: number, ringSize: number,
        releaseSource: boolean, captureParity: boolean): boolean;
    simulateAndPack(): void;
    uploadAndCommit(): void;
    writeOwnerStateBatch(output: Uint32Array): void;
    writeSpawnMismatchDiagnostics(output: Uint32Array): void;
    getLastSubmittedCount(): number;
    getLastEligibleCount(): number;
    getInvalidHandleCount(): number;
    getSyncedFrameCount(): number;
    getLastSupportedCount(): number;
    getLastFallbackCount(): number;
    getLastMismatchCount(): number;
    getTotalMismatchCount(): number;
    getReseedCount(): number;
    getLastPredictedAliveCount(): number;
    getLastOracleAliveCount(): number;
    getLastFallbackLifetimeCount(): number;
    getLastFallbackBurstCount(): number;
    getLastFallbackDistanceCount(): number;
    getLastFallbackDelayCount(): number;
    getLastFallbackRateCount(): number;
    getLastFallbackBufferCount(): number;
    getLastFallbackDurationCount(): number;
    getLastFallbackAutoRandomCount(): number;
    getLastFallbackSpawnCount(): number;
    getLastSpawnRecordMismatchCount(): number;
    getTotalSpawnRecordMismatchCount(): number;
    getConfigSyncCount(): number;
    getLastUploadCount(): number;
    getLastUploadBytes(): number;
    getTotalCommandCount(): number;
    getTotalEmitCommandCount(): number;
    getTotalAddCommandCount(): number;
    getTotalManualSpawnCount(): number;
    getNativeWorldFrameCount(): number;
    getNativeWorldEmitterCount(): number;
    getNativeWorldLastFrameMs(): number;
    getNativeWorldLastSimulationMs(): number;
    getNativeWorldLastCommitMs(): number;
    getNativeWorldLastShaderUpdateCount?(): number;
    getNativeWorldLastStateHotWriteCount?(): number;
    getNativeWorldStateSnapshotSyncCount?(): number;
}

type NativeParticleManagerConstructor = new () => NativeParticleManager;

interface EmissionShadowLike {
    enable: boolean;
    emissionRate: number;
    emissionRateOverDistance: number;
    getBurstsCount(): number;
    _bursts: Array<{ time: number; minCount: number; maxCount: number }>;
}

interface ParticleSystemShadowLike {
    maxParticles: number;
    simulationSpace: number;
    aliveParticleCount: number;
    duration: number;
    looping: boolean;
    startLifetimeType: number;
    startLifetimeConstant: number;
    startLifetimeConstantMin: number;
    startLifetimeConstantMax: number;
    autoRandomSeed: boolean;
    isEmitting: boolean;
    isPaused: boolean;
    isPlaying: boolean;
    emission: EmissionShadowLike;
    _currentTime: number;
    _emissionTime: number;
    _frameRateTime: number;
    _playStartDelay: number;
    _totalDelayTime: number;
    _bufferMaxParticles: number;
    _firstActiveElement: number;
    _firstNewElement: number;
    _firstFreeElement: number;
    _firstRetiredElement: number;
    _burstsIndex: number;
    _randomSeeds: Uint32Array;
    _nativeBurstRandomEnabled: boolean;
    _nativeBurstRandomSeed: number;
    _nativeSpawnRandomEnabled: boolean;
    _nativeSpawnRandomSeed: number;
    _nativeParticleUploadOwned: boolean;
    _nativeParticleSimulationOwned: boolean;
    _nativeParticleActiveCount: number;
    _nativeParticleDrawParamsOwned: boolean;
    _nativeParticleRenderPhaseOwned: boolean;
    _nativeParticleFrameElapsedTime: number;
    _nativeParticleFrameLastPosition: Float32Array;
    _nativeParticleCommands: RTParticleCommand[];
    _nativeParticleCommandSink: ((command: RTParticleCommand) => void) | null;
    _nativeParticleStateReader: (() => void) | null;
    _nativeParticleStateWords: Uint32Array | null;
    _nativeParticleFallbackRingReleased: boolean;
    _nativeRefreshParticleControlFlags?(runtimeFlags: number): void;
    _maxStartLifetime: number;
    _owner: { transform: { position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number; w: number } } };
    _instanceVertex?: Float32Array;
    _instanceParticleVertexBuffer?: { _deviceBuffer?: { _nativeObj?: any } };
    _vertices?: Float32Array;
    _floatCountPerParticleData?: number;
    _floatCountPerVertex: number;
    _vertexStride: number;
    _startLifeTimeIndex: number;
    _timeIndex: number;
    _nativePrepareParticleOwnerFrame(): void;
    _nativeApplyParticleOwnerState(runtimeFlags: number, activeCount: number,
        currentTime: number, emissionTime: number, burstsIndex: number): void;
    _nativeSetParticleSimulationOwned(value: boolean): void;
    _nativeReleaseParticleFallbackRing(): number;
    _nativeRestoreParticleFallbackRing(): ArrayBuffer | null;
    _nativePrepareParticleOwnerBuffer(): void;
}

interface ParticleRenderLike extends BaseRender {
    particleSystem?: ParticleSystemShadowLike;
    _nativeParticleConfigEpoch?: number;
    _nativeParticleConfigSink?: (() => void) | null;
}

interface EmitterBridge {
    handle: number;
    configEpoch: number;
    configValues: Float64Array;
    spawnValues: Float64Array;
    burstValues: Float64Array;
    burstCount: number;
    initialized: boolean;
    lastLoopCount: number;
    lastCurrentTime: number;
    lastFirstFree: number;
    lastFirstActive: number;
    lastRuntimeFlags: number;
    lastEmissionTime: number;
    lastFrameRateTime: number;
    lastTotalDelayTime: number;
    lastBurstIndex: number;
    lastBurstSeed: number;
    ownerActive: boolean;
    sourceConfigEpoch: number;
    sourceColdVersion: number;
    coldTracker: RTParticleColdConfigTracker;
    fallbackFlags: number;
    spawnSupported: boolean;
    nativeInstanceBuffer: any;
    uploadOwned: boolean;
    nativeWorldBound: boolean;
    stateBuffer: ArrayBuffer;
    stateWords: Uint32Array;
    stateView: DataView;
    stateBarrierFrame: number;
    fallbackRingBytes: number;
}

const enum ShadowFlags {
    Supported = 1 << 0,
    Reseed = 1 << 1,
    EmissionEnabled = 1 << 2,
    Emitting = 1 << 3,
    Paused = 1 << 4,
    Looping = 1 << 5,
    Playing = 1 << 6,
    AutoRandomSeed = 1 << 7,
    FallbackLifetime = 1 << 8,
    FallbackBurst = 1 << 9,
    FallbackDistance = 1 << 10,
    FallbackDelay = 1 << 11,
    FallbackRate = 1 << 12,
    FallbackBuffer = 1 << 13,
    FallbackDuration = 1 << 14,
    FallbackAutoRandom = 1 << 15,
    FallbackSpawn = 1 << 16,
    SimulationOwner = 1 << 17,
    ControlSync = 1 << 18
}

const CONFIG_VALUE_COUNT = 12;

/**
 * Per-Scene P1 scalar shadow runtime. TypeScript remains the simulation owner;
 * Native independently evaluates the supported emission/lifetime subset and
 * compares compact TS oracle counters. An explicit experimental flag can move
 * 152-byte instance-buffer uploads to Native without changing simulation ownership.
 */
export class RTParticleSceneRuntime {
    private _native: NativeParticleManager;
    private _batch: RTParticleBatchBuffer = new RTParticleBatchBuffer();
    private _ownerBatch: RTParticleOwnerBatchBuffer = new RTParticleOwnerBatchBuffer();
    private _commandBatch: RTParticleCommandBatchBuffer = new RTParticleCommandBatchBuffer();
    private _configBatch: RTParticleConfigBatchBuffer = new RTParticleConfigBatchBuffer();
    private _emitters: Map<BaseRender, EmitterBridge> = new Map();
    private _seedScratch: Float64Array = new Float64Array(64);
    private _spawnScratch: Float64Array = new Float64Array(RT_PARTICLE_SPAWN_VALUE_COUNT);
    private _spawnMismatchDiagnostics: Uint32Array = new Uint32Array(46);
    private _ownerStateBuffer: Uint32Array = new Uint32Array(4 + 64 * 8);
    // Native handles encode slotIndex + 1 in the low 16 bits. Owner-state
    // mirroring is a per-frame hot loop, so use direct slot lookup and retain
    // the complete handle as the generation guard instead of two Map probes.
    private _handlesBySlot: number[] = [];
    private _particlesBySlot: (ParticleSystemShadowLike | null)[] = [];
    private _bridgesBySlot: (EmitterBridge | null)[] = [];
    private _debugFrame: number = 0;
    private _loopCount: number = 0;
    private _uploadTakeover: boolean;
    private _spawnParity: boolean;
    private _singleOwner: boolean;
    private _nativeWorldOwner: boolean;
    private _frameClockBuffer: ArrayBuffer = new ArrayBuffer(8 * 4);
    private _frameClockWords: Uint32Array;
    private _frameClockView: DataView;
    private _nativeWorldDirty: Set<BaseRender> = new Set();
    private _nativeWorldDebugFrame: number = 0;
    private _bootstrapMemoryReleaseCountdown: number = -1;
    private _uploadCandidates: number = 0;
    private _uploadBound: number = 0;
    private _uploadStages: number = 0;
    private _ownerCount: number = 0;
    private _ownerMirroredAlive: number = 0;
    private _coldConfigCompileCount: number = 0;
    private _coldConfigSteadySkipCount: number = 0;
    private _coldConfigCompileTotal: number = 0;
    private _coldConfigSteadySkipTotal: number = 0;
    private _ownerStateApplyTimeMs: number = 0;
    private _ownerDrawParamCommitCount: number = 0;
    private _fallbackRingReleaseCount: number = 0;
    private _fallbackRingRestoreCount: number = 0;
    private _fallbackRingReleasedBytes: number = 0;
    private _record: RTParticleShadowRecord = {
        handle: 0,
        flags: 0,
        configEpoch: 0,
        capacity: 0,
        currentTime: 0,
        emissionTime: 0,
        frameRateTime: 0,
        duration: 0,
        emissionRate: 0,
        lifetime: 0,
        oracleAlive: 0,
        oracleSpawned: 0,
        oracleRetired: 0,
        oracleBurstIndex: 0,
        oracleBurstSeed: 0,
        totalDelayTime: 0,
        playStartDelay: 0
        ,elapsedTime: 0
        ,emitterPositionX: 0
        ,emitterPositionY: 0
        ,emitterPositionZ: 0
        ,emissionLastPositionX: 0
        ,emissionLastPositionY: 0
        ,emissionLastPositionZ: 0
        ,emitterRotationX: 0
        ,emitterRotationY: 0
        ,emitterRotationZ: 0
        ,emitterRotationW: 1
    };
    private _ownerRecord: RTParticleOwnerRecord = {
        handle: 0,
        configEpoch: 0,
        elapsedTime: 0,
        hasWorldTransform: false,
        emitterPositionX: 0,
        emitterPositionY: 0,
        emitterPositionZ: 0,
        emissionLastPositionX: 0,
        emissionLastPositionY: 0,
        emissionLastPositionZ: 0,
        emitterRotationX: 0,
        emitterRotationY: 0,
        emitterRotationZ: 0,
        emitterRotationW: 1
    };

    constructor(ctor: NativeParticleManagerConstructor) {
        this._native = new ctor();
        this._uploadTakeover = (globalThis as any).__LayaNativeParticleDownshiftP1Upload === true;
        this._spawnParity = (globalThis as any).__LayaNativeParticleDownshiftP2SpawnParity === true;
        this._singleOwner = (globalThis as any).__LayaNativeParticleDownshiftP2Owner === true;
        this._nativeWorldOwner = (globalThis as any).__LayaNativeParticleDownshiftP3World === true;
        this._frameClockWords = new Uint32Array(this._frameClockBuffer);
        this._frameClockView = new DataView(this._frameClockBuffer);
        this._frameClockWords[0] = 0x50574330;
        this._frameClockWords[1] = 1;
        this._native.bindFrameClock(this._frameClockBuffer);
        if (this._nativeWorldOwner)
            this._singleOwner = true;
        if (this._singleOwner)
            this._uploadTakeover = true;
    }

    get usesSingleOwner(): boolean {
        return this._singleOwner;
    }

    get usesNativeWorld(): boolean {
        return this._nativeWorldOwner;
    }

    attachSceneManager(nativeSceneManager: any): void {
        nativeSceneManager?.setParticleWorld?.(this._native);
    }

    finishBootstrap(): void {
        if (this._nativeWorldOwner)
            this._bootstrapMemoryReleaseCountdown = 120;
    }

    updateFrameClock(loopCount: number, deltaMilliseconds: number): void {
        this._loopCount = loopCount >>> 0;
        if (this._bootstrapMemoryReleaseCountdown > 0 &&
            --this._bootstrapMemoryReleaseCountdown === 0)
            this._native.releaseBootstrapMemory();
        if (this._nativeWorldOwner && this._nativeWorldDirty.size > 0) {
            // Commands are event-driven and may target emitters that are not
            // config-dirty. Submit them before beginFrame resets the TS encoder;
            // syncBatch does not consume the native command queue.
            if (this._commandBatch.count > 0)
                this._native.syncCommandBatch(this._commandBatch.seal());
            this.beginFrame(loopCount);
            for (const render of this._nativeWorldDirty)
                this.collect(render, true);
            if (this._configBatch.count > 0)
                this._native.syncConfigBatch(this._configBatch.seal());
            if (this._batch.count > 0)
                this._native.syncBatch(this._batch.seal());
            if (this._ownerBatch.count > 0)
                this._native.syncOwnerBatch(this._ownerBatch.seal());
            this._nativeWorldDirty.clear();
            this._commandBatch.begin();
        } else if (this._nativeWorldOwner && this._commandBatch.count > 0) {
            this._native.syncCommandBatch(this._commandBatch.seal());
            this._commandBatch.begin();
        }
        this._frameClockWords[2] = loopCount >>> 0;
        this._frameClockView.setFloat32(4 * 4,
            Math.max(0, Number.isFinite(deltaMilliseconds) ? deltaMilliseconds / 1000 : 0), true);
        if (this._nativeWorldOwner && ++this._nativeWorldDebugFrame % 60 === 0) {
            const stats = {
                ownerCount: this._emitters.size,
                fallback: this._native.getLastFallbackCount(),
                frameMismatches: this._native.getLastMismatchCount(),
                invalidHandles: this._native.getInvalidHandleCount(),
                coldConfig: {
                    totalCompiles: this._coldConfigCompileTotal,
                    totalSteadySkips: this._coldConfigSteadySkipTotal
                },
                nativeWorld: {
                    enabled: true,
                    frames: this._native.getNativeWorldFrameCount(),
                    emitters: this._native.getNativeWorldEmitterCount(),
                    dirty: this._nativeWorldDirty.size,
                    ownerInputRecords: 0,
                    ownerResultRecords: 0,
                    lastFrameMs: this._native.getNativeWorldLastFrameMs(),
                    lastSimulationMs: this._native.getNativeWorldLastSimulationMs(),
                    lastCommitMs: this._native.getNativeWorldLastCommitMs(),
                    shaderTimeUpdates: this._native.getNativeWorldLastShaderUpdateCount?.() ?? 0,
                    stateHotWrites: this._native.getNativeWorldLastStateHotWriteCount?.() ?? 0,
                    stateSnapshotSyncs: this._native.getNativeWorldStateSnapshotSyncCount?.() ?? 0
                },
                fallbackRing: {
                    releases: this._fallbackRingReleaseCount,
                    restores: this._fallbackRingRestoreCount,
                    releasedBytes: this._fallbackRingReleasedBytes
                }
            };
            (globalThis as any).__LayaNativeParticleDownshiftP3Stats = stats;
            (globalThis as any).__LayaNativeParticleDownshiftP1Stats = stats;
        }
    }

    beginFrame(loopCount: number): void {
        this._loopCount = loopCount >>> 0;
        this._uploadCandidates = 0;
        this._uploadBound = 0;
        this._uploadStages = 0;
        this._coldConfigCompileCount = 0;
        this._coldConfigSteadySkipCount = 0;
        this._ownerStateApplyTimeMs = 0;
        this._ownerDrawParamCommitCount = 0;
        this._configBatch.begin();
        this._batch.begin(this._loopCount);
        this._ownerBatch.begin(this._loopCount);
        this._commandBatch.begin();
    }

    collect(render: BaseRender, ownerPass: boolean = false): void {
        if (render._baseRenderNode.renderNodeType !== BaseRenderType.ParticleRender)
            return;

        const particleSystem = (render as ParticleRenderLike).particleSystem;
        if (!particleSystem)
            return;
        if (ownerPass)
            particleSystem._nativePrepareParticleOwnerFrame();

        let bridge = this._emitters.get(render);
        if (!bridge) {
            const handle = this._native.createEmitter(particleSystem.maxParticles);
            if (handle === 0)
                return;
            bridge = {
                handle,
                configEpoch: 1,
                configValues: new Float64Array(CONFIG_VALUE_COUNT),
                spawnValues: new Float64Array(RT_PARTICLE_SPAWN_VALUE_COUNT),
                burstValues: new Float64Array(0),
                burstCount: 0,
                initialized: false,
                lastLoopCount: 0,
                lastCurrentTime: 0,
                lastFirstFree: 0,
                lastFirstActive: 0,
                lastRuntimeFlags: 0,
                lastEmissionTime: 0,
                lastFrameRateTime: 0,
                lastTotalDelayTime: 0,
                lastBurstIndex: 0,
                lastBurstSeed: 0,
                ownerActive: false,
                sourceConfigEpoch: 0,
                sourceColdVersion: 0,
                coldTracker: new RTParticleColdConfigTracker(),
                fallbackFlags: 0,
                spawnSupported: false,
                nativeInstanceBuffer: null,
                uploadOwned: false,
                nativeWorldBound: false,
                stateBuffer: new ArrayBuffer(12 * 4),
                stateWords: null,
                stateView: null,
                stateBarrierFrame: 0,
                fallbackRingBytes: 0
            };
            bridge.stateWords = new Uint32Array(bridge.stateBuffer);
            bridge.stateView = new DataView(bridge.stateBuffer);
            bridge.configValues.fill(Number.NaN);
            bridge.spawnValues.fill(Number.NaN);
            this._emitters.set(render, bridge);
            const slotIndex = (handle & 0xffff) - 1;
            this._handlesBySlot[slotIndex] = handle;
            this._particlesBySlot[slotIndex] = particleSystem;
            this._bridgesBySlot[slotIndex] = bridge;
        }

        // maxParticles/render-mode changes rebuild the TS ring before the dirty
        // callback reaches us. Reconcile accounting before deciding ownership.
        if (bridge.fallbackRingBytes > 0 && !particleSystem._nativeParticleFallbackRingReleased) {
            this._fallbackRingReleasedBytes -= bridge.fallbackRingBytes;
            bridge.fallbackRingBytes = 0;
        }

        const emission = particleSystem.emission;
        if (particleSystem.autoRandomSeed && !particleSystem._nativeBurstRandomEnabled) {
            particleSystem._nativeBurstRandomEnabled = true;
            particleSystem._nativeBurstRandomSeed = Math.floor(Math.random() * 4294967296) >>> 0;
        }
        if (particleSystem.autoRandomSeed && !particleSystem._nativeSpawnRandomEnabled)
            this._enableDeterministicSpawnStreams(particleSystem);
        const sourceConfigEpoch = (render as ParticleRenderLike)._nativeParticleConfigEpoch ?? 0;
        const coldVersion = bridge.coldTracker.poll(particleSystem);
        const coldConfigChanged = !bridge.initialized ||
            bridge.sourceConfigEpoch !== sourceConfigEpoch ||
            bridge.sourceColdVersion !== coldVersion;
        let configChanged = false;
        if (coldConfigChanged) {
            ++this._coldConfigCompileCount;
            ++this._coldConfigCompileTotal;
            bridge.coldTracker.refresh(particleSystem);
            const spawnSupported = compileRTParticleSpawnProgram(
                particleSystem, render, this._spawnScratch);
            let fallbackFlags = 0;
            if (!this._hasReadableParticleBuffer(particleSystem) &&
                !(bridge.ownerActive && particleSystem._nativeParticleFallbackRingReleased))
                fallbackFlags |= ShadowFlags.FallbackBuffer;
            if ((particleSystem.startLifetimeType !== 0 && particleSystem.startLifetimeType !== 2) ||
                (particleSystem.startLifetimeType === 0 &&
                    (!Number.isFinite(particleSystem.startLifetimeConstant) || particleSystem.startLifetimeConstant <= 0)) ||
                (particleSystem.startLifetimeType === 2 &&
                    (!Number.isFinite(particleSystem.startLifetimeConstantMin) ||
                        !Number.isFinite(particleSystem.startLifetimeConstantMax) ||
                        Math.max(particleSystem.startLifetimeConstantMin,
                            particleSystem.startLifetimeConstantMax) <= 0)))
                fallbackFlags |= ShadowFlags.FallbackLifetime;
            if (!spawnSupported)
                fallbackFlags |= ShadowFlags.FallbackSpawn;
            if (!Number.isFinite(particleSystem.duration) || particleSystem.duration <= 0)
                fallbackFlags |= ShadowFlags.FallbackDuration;
            const burstCount = emission.getBurstsCount();
            if ((!Number.isFinite(emission.emissionRate) || emission.emissionRate <= 0) && burstCount === 0)
                fallbackFlags |= ShadowFlags.FallbackRate;
            if (emission.emissionRateOverDistance !== 0)
                fallbackFlags |= ShadowFlags.FallbackDistance;
            let hasRandomBurstCount = false;
            for (let i = 0; i < burstCount; i++) {
                const burst = emission._bursts[i];
                if (burst.minCount !== burst.maxCount) {
                    hasRandomBurstCount = true;
                    break;
                }
            }
            if (particleSystem.autoRandomSeed && hasRandomBurstCount &&
                !particleSystem._nativeBurstRandomEnabled) {
                fallbackFlags |= ShadowFlags.FallbackBurst;
                fallbackFlags |= ShadowFlags.FallbackAutoRandom;
            }
            const supported = fallbackFlags === 0;
            const baseConfigChanged = this._updateConfigValues(bridge, particleSystem, emission, supported);
            const spawnConfigChanged = this._updateSpawnValues(bridge, this._spawnScratch);
            const burstConfigChanged = this._updateBurstValues(bridge, emission);
            configChanged = baseConfigChanged || spawnConfigChanged || burstConfigChanged;
            bridge.sourceConfigEpoch = sourceConfigEpoch;
            bridge.sourceColdVersion = coldVersion;
            bridge.spawnSupported = spawnSupported;
            bridge.fallbackFlags = fallbackFlags;
            if (configChanged && bridge.initialized)
                ++bridge.configEpoch;
            if (configChanged)
                this._configBatch.push(bridge.handle, bridge.configEpoch, emission._bursts,
                    burstCount, bridge.spawnValues);
        } else {
            ++this._coldConfigSteadySkipCount;
            ++this._coldConfigSteadySkipTotal;
        }
        const fallbackFlags = bridge.fallbackFlags;
        const supported = fallbackFlags === 0;

        let runtimeFlags = fallbackFlags;
        if (emission.enable)
            runtimeFlags |= ShadowFlags.EmissionEnabled;
        if (particleSystem.isEmitting)
            runtimeFlags |= ShadowFlags.Emitting;
        if (particleSystem.isPaused)
            runtimeFlags |= ShadowFlags.Paused;
        if (particleSystem.looping)
            runtimeFlags |= ShadowFlags.Looping;
        if (particleSystem.isPlaying)
            runtimeFlags |= ShadowFlags.Playing;
        if (particleSystem.autoRandomSeed)
            runtimeFlags |= ShadowFlags.AutoRandomSeed;

        const ringSize = Math.max(1, particleSystem._bufferMaxParticles);
        const timeWentBack = particleSystem._currentTime + 1e-12 < bridge.lastCurrentTime;
        const frameGap = bridge.initialized && this._loopCount !== ((bridge.lastLoopCount + 1) >>> 0);
        const runtimeChanged = bridge.initialized && bridge.lastRuntimeFlags !== runtimeFlags;
        const continuingOwner = ownerPass && bridge.ownerActive;
        const hasPendingCommands = continuingOwner && particleSystem._nativeParticleCommands.length > 0;
        const burstSeed = particleSystem.autoRandomSeed ?
            particleSystem._nativeBurstRandomSeed : (particleSystem._randomSeeds[0] ?? 0);
        const scalarControlChanged = continuingOwner && (
            !Object.is(particleSystem._currentTime, bridge.lastCurrentTime) ||
            !Object.is(particleSystem._emissionTime, bridge.lastEmissionTime) ||
            !Object.is(particleSystem._frameRateTime, bridge.lastFrameRateTime) ||
            !Object.is(particleSystem._totalDelayTime, bridge.lastTotalDelayTime) ||
            particleSystem._burstsIndex !== bridge.lastBurstIndex ||
            burstSeed !== bridge.lastBurstSeed);
        const controlSync = continuingOwner && (configChanged ||
            (!hasPendingCommands && (runtimeChanged || scalarControlChanged)));
        const fullReseed = !bridge.initialized || (!continuingOwner &&
            (configChanged || timeWentBack || frameGap || runtimeChanged));
        const reseed = fullReseed || controlSync;

        let oracleSpawned = 0;
        let oracleRetired = 0;
        if (!reseed) {
            oracleSpawned = this._ringDelta(bridge.lastFirstFree, particleSystem._firstFreeElement, ringSize);
            oracleRetired = this._ringDelta(bridge.lastFirstActive, particleSystem._firstActiveElement, ringSize);
        }

        let flags = runtimeFlags;
        let seedCount = 0;
        if (reseed) {
            flags |= ShadowFlags.Reseed;
            if (supported && fullReseed)
                seedCount = this._collectSeeds(particleSystem);
        }

        const uploadOwned = this._updateUploadOwnership(bridge, particleSystem, ownerPass, supported, fullReseed,
            oracleSpawned !== 0 || oracleRetired !== 0);
        const ownerActive = ownerPass && supported && uploadOwned;
        if (bridge.ownerActive && !ownerActive)
            this._restoreFallbackRing(bridge, particleSystem);
        particleSystem._nativeSetParticleSimulationOwned(ownerActive);

        if (this._nativeWorldOwner && ownerActive && (!bridge.nativeWorldBound || coldConfigChanged)) {
            const transformNative = (particleSystem._owner.transform as any)._nativeObj;
            const geometry = (particleSystem as any)._geometryElementOBj;
            const geometryNative = geometry?._nativeObj;
            const shaderNative = ((render as any)._baseRenderNode?.shaderData as any)?._nativeObj;
            const drawCount = (particleSystem as any)._meshIndexCount ?? (particleSystem as any)._indexStride;
            bridge.nativeWorldBound = this._native.bindEmitterResources(
                bridge.handle, transformNative, geometryNative, bridge.nativeInstanceBuffer,
                shaderNative, ShuriKenParticle3DShaderDeclaration.CURRENTTIME,
                ((particleSystem as any)._instanceVertex ||
                    particleSystem._nativeParticleFallbackRingReleased) ? 1 : 0,
                drawCount >>> 0, (particleSystem as any).simulationSpeed ?? 1);
            if (bridge.nativeWorldBound) {
                particleSystem._nativeParticleRenderPhaseOwned = true;
                this._native.bindEmitterState(bridge.handle, bridge.stateBuffer);
                particleSystem._nativeParticleStateWords = bridge.stateWords;
                const markNativeWorldDirty = (): void => {
                    this._nativeWorldDirty.add(render);
                };
                (render as ParticleRenderLike)._nativeParticleConfigSink = markNativeWorldDirty;
                bridge.coldTracker.connectPush(particleSystem, markNativeWorldDirty);
                particleSystem._nativeParticleCommandSink = (command: RTParticleCommand): void => {
                    bridge.stateBarrierFrame = this._loopCount;
                    this._commandBatch.push(bridge.handle, command);
                };
                particleSystem._nativeParticleStateReader = (): void => {
                    this._native.syncEmitterState?.(bridge.handle);
                    const words = bridge.stateWords;
                    if (words[0] !== 0x50535430 || words[1] !== bridge.handle)
                        return;
                    if (words[5] <= bridge.stateBarrierFrame)
                        return;
                    particleSystem._nativeParticleActiveCount = words[3];
                    particleSystem._currentTime = bridge.stateView.getFloat64(6 * 4, true);
                    particleSystem._emissionTime = bridge.stateView.getFloat64(8 * 4, true);
                    particleSystem._frameRateTime = bridge.stateView.getFloat64(10 * 4, true);
                    particleSystem._burstsIndex = words[4];
                    particleSystem._nativeRefreshParticleControlFlags?.(words[2]);
                };
            }
        }

        if (supported && (!ownerPass || ownerActive))
            flags |= ShadowFlags.Supported;
        if (ownerActive)
            flags |= ShadowFlags.SimulationOwner;
        if (ownerActive && controlSync)
            flags |= ShadowFlags.ControlSync;

        if (ownerActive && continuingOwner && !reseed) {
            const ownerRecord = this._ownerRecord;
            ownerRecord.handle = bridge.handle;
            ownerRecord.configEpoch = bridge.configEpoch;
            ownerRecord.elapsedTime = particleSystem._nativeParticleFrameElapsedTime;
            ownerRecord.hasWorldTransform = particleSystem.simulationSpace === 0;
            if (ownerRecord.hasWorldTransform) {
                const transform = particleSystem._owner.transform;
                const position = transform.position;
                const rotation = transform.rotation;
                const lastPosition = particleSystem._nativeParticleFrameLastPosition;
                ownerRecord.emitterPositionX = position.x;
                ownerRecord.emitterPositionY = position.y;
                ownerRecord.emitterPositionZ = position.z;
                ownerRecord.emissionLastPositionX = lastPosition?.[0] ?? position.x;
                ownerRecord.emissionLastPositionY = lastPosition?.[1] ?? position.y;
                ownerRecord.emissionLastPositionZ = lastPosition?.[2] ?? position.z;
                ownerRecord.emitterRotationX = rotation.x;
                ownerRecord.emitterRotationY = rotation.y;
                ownerRecord.emitterRotationZ = rotation.z;
                ownerRecord.emitterRotationW = rotation.w;
            }
            this._ownerBatch.push(ownerRecord);
        } else {
            const record = this._record;
            record.handle = bridge.handle;
            record.flags = flags;
            record.configEpoch = bridge.configEpoch;
            record.capacity = particleSystem.maxParticles;
            record.currentTime = particleSystem._currentTime;
            record.emissionTime = particleSystem._emissionTime;
            record.frameRateTime = particleSystem._frameRateTime;
            record.duration = particleSystem.duration;
            record.emissionRate = emission.emissionRate;
            record.lifetime = particleSystem._maxStartLifetime;
            record.oracleAlive = particleSystem.aliveParticleCount;
            record.oracleSpawned = oracleSpawned;
            record.oracleRetired = oracleRetired;
            record.oracleBurstIndex = particleSystem._burstsIndex;
            record.oracleBurstSeed = burstSeed;
            record.totalDelayTime = particleSystem._totalDelayTime;
            record.playStartDelay = particleSystem._playStartDelay;
            record.elapsedTime = particleSystem._nativeParticleFrameElapsedTime;
            const transform = particleSystem._owner.transform;
            const position = transform.position;
            const rotation = transform.rotation;
            const lastPosition = particleSystem._nativeParticleFrameLastPosition;
            record.emitterPositionX = position.x;
            record.emitterPositionY = position.y;
            record.emitterPositionZ = position.z;
            record.emissionLastPositionX = lastPosition?.[0] ?? position.x;
            record.emissionLastPositionY = lastPosition?.[1] ?? position.y;
            record.emissionLastPositionZ = lastPosition?.[2] ?? position.z;
            record.emitterRotationX = rotation.x;
            record.emitterRotationY = rotation.y;
            record.emitterRotationZ = rotation.z;
            record.emitterRotationW = rotation.w;
            this._batch.push(record, fullReseed && supported ? this._seedScratch : null, seedCount,
                reseed && supported ? particleSystem._randomSeeds : null);
        }

        if (this._nativeWorldOwner && ownerActive && bridge.nativeWorldBound)
            this._releaseFallbackRing(bridge, particleSystem);

        if (ownerActive && particleSystem._nativeParticleCommands.length > 0) {
            for (const command of particleSystem._nativeParticleCommands)
                this._commandBatch.push(bridge.handle, command);
            particleSystem._nativeParticleCommands.length = 0;
        }

        bridge.initialized = true;
        bridge.lastLoopCount = this._loopCount;
        bridge.lastCurrentTime = particleSystem._currentTime;
        bridge.lastFirstFree = particleSystem._firstFreeElement;
        bridge.lastFirstActive = particleSystem._firstActiveElement;
        bridge.lastRuntimeFlags = runtimeFlags;
        bridge.lastEmissionTime = particleSystem._emissionTime;
        bridge.lastFrameRateTime = particleSystem._frameRateTime;
        bridge.lastTotalDelayTime = particleSystem._totalDelayTime;
        bridge.lastBurstIndex = particleSystem._burstsIndex;
        bridge.lastBurstSeed = burstSeed;
        bridge.ownerActive = ownerActive;
    }

    remove(render: BaseRender): void {
        const bridge = this._emitters.get(render);
        if (!bridge)
            return;
        const particleSystem = (render as ParticleRenderLike).particleSystem;
        if (particleSystem)
            this._restoreFallbackRing(bridge, particleSystem);
        if (particleSystem)
            particleSystem._nativeSetParticleSimulationOwned(false);
        if (particleSystem)
            particleSystem._nativeParticleUploadOwned = false;
        if (particleSystem)
            particleSystem._nativeParticleCommandSink = null;
        if (particleSystem)
            particleSystem._nativeParticleRenderPhaseOwned = false;
        if (particleSystem)
            particleSystem._nativeParticleStateReader = null;
        if (particleSystem)
            particleSystem._nativeParticleStateWords = null;
        (render as ParticleRenderLike)._nativeParticleConfigSink = null;
        this._nativeWorldDirty.delete(render);
        this._native.destroyEmitter(bridge.handle);
        bridge.coldTracker.destroy();
        const slotIndex = (bridge.handle & 0xffff) - 1;
        if (this._handlesBySlot[slotIndex] === bridge.handle) {
            this._handlesBySlot[slotIndex] = 0;
            this._particlesBySlot[slotIndex] = null;
            this._bridgesBySlot[slotIndex] = null;
        }
        this._emitters.delete(render);
    }

    flush(): void {
        if (this._configBatch.count > 0)
            this._native.syncConfigBatch(this._configBatch.seal());
        this._native.syncBatch(this._batch.seal());
        if (this._ownerBatch.count > 0)
            this._native.syncOwnerBatch(this._ownerBatch.seal());
        if (this._commandBatch.count > 0)
            this._native.syncCommandBatch(this._commandBatch.seal());
        this._native.simulateAndPack();
        if (this._singleOwner) {
            this._ensureOwnerStateCapacity(this._batch.count + this._ownerBatch.count);
            this._native.writeOwnerStateBatch(this._ownerStateBuffer);
            this._applyOwnerStates();
        }
        this._native.uploadAndCommit();
        if (this._nativeWorldOwner)
            this._commandBatch.begin();
        if (++this._debugFrame % 60 === 0) {
            this._native.writeSpawnMismatchDiagnostics(this._spawnMismatchDiagnostics);
            const stats = {
                submitted: this._native.getLastSubmittedCount(),
                eligible: this._native.getLastEligibleCount(),
                supported: this._native.getLastSupportedCount(),
                fallback: this._native.getLastFallbackCount(),
                frameMismatches: this._native.getLastMismatchCount(),
                totalMismatches: this._native.getTotalMismatchCount(),
                spawnRecordMismatches: this._native.getLastSpawnRecordMismatchCount(),
                totalSpawnRecordMismatches: this._native.getTotalSpawnRecordMismatchCount(),
                spawnMismatchByShape: Array.from(this._spawnMismatchDiagnostics.subarray(2, 8)),
                spawnMismatchByField: Array.from(this._spawnMismatchDiagnostics.subarray(8, 46)),
                reseeds: this._native.getReseedCount(),
                predictedAlive: this._native.getLastPredictedAliveCount(),
                oracleAlive: this._native.getLastOracleAliveCount(),
                fallbackReasons: {
                    lifetime: this._native.getLastFallbackLifetimeCount(),
                    burst: this._native.getLastFallbackBurstCount(),
                    distance: this._native.getLastFallbackDistanceCount(),
                    delay: this._native.getLastFallbackDelayCount(),
                    rate: this._native.getLastFallbackRateCount(),
                    buffer: this._native.getLastFallbackBufferCount(),
                    duration: this._native.getLastFallbackDurationCount(),
                    autoRandom: this._native.getLastFallbackAutoRandomCount(),
                    spawn: this._native.getLastFallbackSpawnCount()
                },
                configSyncs: this._native.getConfigSyncCount(),
                uploads: this._native.getLastUploadCount(),
                uploadBytes: this._native.getLastUploadBytes(),
                uploadCandidates: this._uploadCandidates,
                uploadBound: this._uploadBound,
                uploadStages: this._uploadStages,
                ownerCount: this._ownerCount,
                ownerMirroredAlive: this._ownerMirroredAlive,
                coldConfig: {
                    compiles: this._coldConfigCompileCount,
                    steadySkips: this._coldConfigSteadySkipCount,
                    totalCompiles: this._coldConfigCompileTotal,
                    totalSteadySkips: this._coldConfigSteadySkipTotal
                },
                ownerStateApplyTimeMs: this._ownerStateApplyTimeMs,
                ownerDrawParamCommits: this._ownerDrawParamCommitCount,
                ownerAbi: {
                    fullRecords: this._batch.count,
                    fullBytes: this._batch.usedByteLength,
                    compactRecords: this._ownerBatch.count,
                    compactBytes: this._ownerBatch.usedByteLength,
                    commandRecords: this._commandBatch.count,
                    commandBytes: this._commandBatch.usedByteLength,
                    resultBytes: (4 + this._ownerCount * 8) * 4
                },
                commands: {
                    total: this._native.getTotalCommandCount(),
                    emit: this._native.getTotalEmitCommandCount(),
                    add: this._native.getTotalAddCommandCount(),
                    spawned: this._native.getTotalManualSpawnCount()
                },
                nativeWorld: {
                    enabled: this._nativeWorldOwner,
                    frames: this._native.getNativeWorldFrameCount(),
                    emitters: this._native.getNativeWorldEmitterCount()
                },
                fallbackRing: {
                    releases: this._fallbackRingReleaseCount,
                    restores: this._fallbackRingRestoreCount,
                    releasedBytes: this._fallbackRingReleasedBytes
                },
                invalidHandles: this._native.getInvalidHandleCount(),
                syncedFrames: this._native.getSyncedFrameCount()
            };
            (globalThis as any).__LayaNativeParticleDownshiftP1Stats = stats;
            (globalThis as any).__LayaNativeParticleDownshiftP0Stats = stats;
        }
    }

    destroy(): void {
        for (const render of this._emitters.keys()) {
            const particleSystem = (render as ParticleRenderLike).particleSystem;
            if (particleSystem)
                particleSystem._nativeSetParticleSimulationOwned(false);
            if (particleSystem)
                particleSystem._nativeParticleUploadOwned = false;
            if (particleSystem)
                particleSystem._nativeParticleCommandSink = null;
            if (particleSystem)
                particleSystem._nativeParticleRenderPhaseOwned = false;
            if (particleSystem)
                particleSystem._nativeParticleStateReader = null;
            if (particleSystem)
                particleSystem._nativeParticleStateWords = null;
            (render as ParticleRenderLike)._nativeParticleConfigSink = null;
            this._emitters.get(render)?.coldTracker.destroy();
        }
        this._native.reset();
        this._emitters.clear();
        this._nativeWorldDirty.clear();
        this._handlesBySlot.length = 0;
        this._particlesBySlot.length = 0;
        this._bridgesBySlot.length = 0;
    }

    private _ensureOwnerStateCapacity(recordCount: number): void {
        const required = 4 + recordCount * 8;
        if (this._ownerStateBuffer.length >= required)
            return;
        let next = this._ownerStateBuffer.length;
        while (next < required)
            next = Math.max(next + 8, next + (next >> 1));
        this._ownerStateBuffer = new Uint32Array(next);
    }

    private _applyOwnerStates(): void {
        const applyStart = performance.now();
        const words = this._ownerStateBuffer;
        this._ownerCount = 0;
        this._ownerMirroredAlive = 0;
        if (words[0] !== 0x50525330 || words[1] !== 2) {
            this._ownerStateApplyTimeMs = performance.now() - applyStart;
            return;
        }
        const recordCount = words[2];
        const usedWords = Math.min(words[3], words.length);
        const view = new DataView(words.buffer, words.byteOffset, words.byteLength);
        let cursor = 4;
        for (let recordIndex = 0; recordIndex < recordCount; recordIndex++, cursor += 8) {
            if (cursor + 8 > usedWords)
                break;
            const handle = words[cursor];
            const slotIndex = (handle & 0xffff) - 1;
            if (slotIndex < 0 || this._handlesBySlot[slotIndex] !== handle)
                continue;
            const particleSystem = this._particlesBySlot[slotIndex];
            if (!particleSystem)
                continue;
            const bridge = this._bridgesBySlot[slotIndex];
            const runtimeFlags = words[cursor + 1];
            const activeCount = words[cursor + 2];
            const currentTime = view.getFloat64((cursor + 4) * 4, true);
            const emissionTime = view.getFloat64((cursor + 6) * 4, true);
            if (!particleSystem._nativeParticleDrawParamsOwned ||
                particleSystem._nativeParticleActiveCount !== activeCount)
                ++this._ownerDrawParamCommitCount;
            particleSystem._nativeApplyParticleOwnerState(
                runtimeFlags,
                activeCount,
                currentTime,
                emissionTime,
                words[cursor + 3]);
            ++this._ownerCount;
            this._ownerMirroredAlive += activeCount;
            if (bridge) {
                bridge.lastCurrentTime = currentTime;
                bridge.lastEmissionTime = emissionTime;
                bridge.lastBurstIndex = words[cursor + 3];
                bridge.lastRuntimeFlags = runtimeFlags & ~(
                    ShadowFlags.Supported | ShadowFlags.Reseed |
                    ShadowFlags.SimulationOwner | ShadowFlags.ControlSync);
                bridge.ownerActive = true;
            }
        }
        this._ownerStateApplyTimeMs = performance.now() - applyStart;
    }

    private _hasReadableParticleBuffer(particleSystem: ParticleSystemShadowLike): boolean {
        if (particleSystem._instanceVertex)
            return (particleSystem._floatCountPerParticleData ?? 0) > 0;
        return !!particleSystem._vertices && particleSystem._floatCountPerVertex > 0 && particleSystem._vertexStride > 0;
    }

    private _releaseFallbackRing(bridge: EmitterBridge,
        particleSystem: ParticleSystemShadowLike): void {
        if (bridge.fallbackRingBytes > 0 ||
            typeof this._native.writeEmitterFallbackSnapshot !== "function")
            return;
        const releasedBytes = particleSystem._nativeReleaseParticleFallbackRing();
        if (releasedBytes <= 0)
            return;
        bridge.fallbackRingBytes = releasedBytes;
        this._fallbackRingReleasedBytes += releasedBytes;
        ++this._fallbackRingReleaseCount;
    }

    private _restoreFallbackRing(bridge: EmitterBridge,
        particleSystem: ParticleSystemShadowLike): boolean {
        if (!particleSystem._nativeParticleFallbackRingReleased)
            return true;
        const output = particleSystem._nativeRestoreParticleFallbackRing();
        const stateBuffer = new ArrayBuffer(34 * 4);
        if (!output || !this._native.writeEmitterFallbackSnapshot?.(
            bridge.handle, output, stateBuffer)) {
            particleSystem._nativeReleaseParticleFallbackRing();
            console.error("[RTParticleRuntime] Failed to restore the TS particle fallback ring.");
            return false;
        }
        const words = new Uint32Array(stateBuffer);
        const view = new DataView(stateBuffer);
        if (words[0] !== 0x50524630 || words[1] !== 1) {
            particleSystem._nativeReleaseParticleFallbackRing();
            console.error("[RTParticleRuntime] Invalid Native particle fallback snapshot.");
            return false;
        }
        particleSystem._nativeParticleActiveCount = words[2];
        particleSystem._burstsIndex = words[4];
        particleSystem._nativeBurstRandomSeed = words[5];
        for (let i = 0; i < particleSystem._randomSeeds.length && i < 18; i++)
            particleSystem._randomSeeds[i] = words[6 + i];
        particleSystem._currentTime = view.getFloat64(24 * 4, true);
        particleSystem._emissionTime = view.getFloat64(26 * 4, true);
        particleSystem._frameRateTime = view.getFloat64(28 * 4, true);
        particleSystem._totalDelayTime = view.getFloat64(30 * 4, true);
        particleSystem._playStartDelay = view.getFloat64(32 * 4, true);
        particleSystem._nativeRefreshParticleControlFlags?.(words[3]);
        const position = particleSystem._owner.transform.position as any;
        const lastPosition = (particleSystem as any)._emissionLastPosition;
        position.cloneTo?.(lastPosition);
        this._fallbackRingReleasedBytes -= bridge.fallbackRingBytes;
        bridge.fallbackRingBytes = 0;
        ++this._fallbackRingRestoreCount;
        return true;
    }

    private _updateUploadOwnership(bridge: EmitterBridge, particleSystem: ParticleSystemShadowLike,
        ownerPass: boolean, supported: boolean, reseed: boolean, ringChanged: boolean): boolean {
        const instanceData = particleSystem._instanceVertex;
        const byteStride = (particleSystem._floatCountPerParticleData ?? 0) * 4;
        if (ownerPass && this._singleOwner && supported && instanceData && byteStride === 152)
            particleSystem._nativePrepareParticleOwnerBuffer();
        const nativeBuffer = particleSystem._instanceParticleVertexBuffer?._deviceBuffer?._nativeObj;
        const hasReleasedOwnedRing = particleSystem._nativeParticleFallbackRingReleased &&
            bridge.uploadOwned && bridge.nativeInstanceBuffer === nativeBuffer;
        const canOwn = this._uploadTakeover && supported && !!nativeBuffer &&
            ((!!instanceData && byteStride === 152) || hasReleasedOwnedRing);
        if (canOwn)
            ++this._uploadCandidates;
        const wasOwned = particleSystem._nativeParticleUploadOwned;

        if (!canOwn) {
            particleSystem._nativeParticleUploadOwned = false;
            bridge.uploadOwned = false;
            return false;
        }

        if (bridge.nativeInstanceBuffer !== nativeBuffer || !bridge.uploadOwned) {
            bridge.nativeInstanceBuffer = nativeBuffer;
            bridge.uploadOwned = this._native.bindInstanceBuffer(bridge.handle, nativeBuffer);
        }
        const shouldStage = instanceData && byteStride === 152 && supported &&
            (this._spawnParity || (this._singleOwner && ownerPass) ||
                (!this._singleOwner && wasOwned && bridge.nativeInstanceBuffer && (reseed || ringChanged)));
        if (bridge.uploadOwned && shouldStage) {
            if (this._native.stageInstanceUpload(bridge.handle, instanceData.buffer, byteStride,
                particleSystem._firstActiveElement, particleSystem._firstFreeElement,
                particleSystem._bufferMaxParticles,
                ownerPass && this._singleOwner && !this._spawnParity, this._spawnParity)) {
                ++this._uploadStages;
            } else {
                bridge.uploadOwned = false;
            }
        }
        particleSystem._nativeParticleUploadOwned = bridge.uploadOwned;
        if (bridge.uploadOwned)
            ++this._uploadBound;
        return bridge.uploadOwned;
    }

    private _updateConfigValues(bridge: EmitterBridge, particleSystem: ParticleSystemShadowLike,
        emission: EmissionShadowLike, supported: boolean): boolean {
        const values = bridge.configValues;
        let changed = false;
        changed = this._setConfigValue(values, 0, particleSystem.maxParticles) || changed;
        changed = this._setConfigValue(values, 1, particleSystem.duration) || changed;
        changed = this._setConfigValue(values, 2, particleSystem.looping ? 1 : 0) || changed;
        changed = this._setConfigValue(values, 3, particleSystem.startLifetimeType) || changed;
        changed = this._setConfigValue(values, 4, particleSystem.startLifetimeConstant) || changed;
        changed = this._setConfigValue(values, 5, emission.enable ? 1 : 0) || changed;
        changed = this._setConfigValue(values, 6, emission.emissionRate) || changed;
        changed = this._setConfigValue(values, 7, emission.emissionRateOverDistance) || changed;
        changed = this._setConfigValue(values, 8, emission.getBurstsCount()) || changed;
        changed = this._setConfigValue(values, 9, supported ? 1 : 0) || changed;
        changed = this._setConfigValue(values, 10, particleSystem.autoRandomSeed ? 1 : 0) || changed;
        changed = this._setConfigValue(values, 11, particleSystem._nativeBurstRandomEnabled ? 1 : 0) || changed;
        return changed;
    }

    private _updateBurstValues(bridge: EmitterBridge, emission: EmissionShadowLike): boolean {
        const burstCount = emission.getBurstsCount();
        const required = burstCount * 3;
        let changed = bridge.burstCount !== burstCount;
        if (bridge.burstValues.length < required) {
            bridge.burstValues = new Float64Array(required);
            bridge.burstValues.fill(Number.NaN);
            changed = true;
        }
        bridge.burstCount = burstCount;
        for (let i = 0; i < burstCount; i++) {
            const burst = emission._bursts[i];
            changed = this._setConfigValue(bridge.burstValues, i * 3, burst.time) || changed;
            changed = this._setConfigValue(bridge.burstValues, i * 3 + 1, burst.minCount) || changed;
            changed = this._setConfigValue(bridge.burstValues, i * 3 + 2, burst.maxCount) || changed;
        }
        return changed;
    }

    private _setConfigValue(values: Float64Array, index: number, value: number): boolean {
        if (Object.is(values[index], value))
            return false;
        values[index] = value;
        return true;
    }

    private _updateSpawnValues(bridge: EmitterBridge, source: Float64Array): boolean {
        let changed = false;
        for (let i = 0; i < source.length; i++) {
            if (!Object.is(bridge.spawnValues[i], source[i])) {
                bridge.spawnValues[i] = source[i];
                changed = true;
            }
        }
        return changed;
    }

    private _enableDeterministicSpawnStreams(particleSystem: ParticleSystemShadowLike): void {
        const baseSeed = Math.floor(Math.random() * 4294967296) >>> 0;
        particleSystem._nativeSpawnRandomSeed = baseSeed;
        particleSystem._nativeSpawnRandomEnabled = true;
        const offsets = (particleSystem as any).constructor._RANDOMOFFSET as Uint32Array;
        if (!offsets)
            return;
        for (let i = 0; i < particleSystem._randomSeeds.length && i < offsets.length; i++)
            particleSystem._randomSeeds[i] = (baseSeed + offsets[i]) >>> 0;
    }

    private _ringDelta(previous: number, current: number, ringSize: number): number {
        return current >= previous ? current - previous : ringSize - previous + current;
    }

    private _collectSeeds(particleSystem: ParticleSystemShadowLike): number {
        const instanceData = particleSystem._instanceVertex;
        const data = instanceData ?? particleSystem._vertices;
        if (!data)
            return 0;

        const stride = instanceData ? (particleSystem._floatCountPerParticleData ?? 0) :
            particleSystem._floatCountPerVertex * particleSystem._vertexStride;
        const ringSize = particleSystem._bufferMaxParticles;
        const count = this._ringDelta(particleSystem._firstActiveElement, particleSystem._firstNewElement, ringSize);
        this._ensureSeedCapacity(count * 2);

        let particle = particleSystem._firstActiveElement;
        for (let i = 0; i < count; i++) {
            const base = particle * stride;
            this._seedScratch[i * 2] = data[base + particleSystem._timeIndex];
            this._seedScratch[i * 2 + 1] = data[base + particleSystem._startLifeTimeIndex];
            if (++particle >= ringSize)
                particle = 0;
        }
        return count;
    }

    private _ensureSeedCapacity(required: number): void {
        if (required <= this._seedScratch.length)
            return;
        let next = this._seedScratch.length;
        while (next < required)
            next = Math.max(next + 2, next + (next >> 1));
        this._seedScratch = new Float64Array(next);
    }
}

export class RTParticleRuntime {
    /**
     * P1 shadow is opt-in because it deliberately runs both implementations.
     * Set `globalThis.__LayaNativeParticleDownshiftP1Shadow = true` before Laya
     * initialisation. The old P0 flag remains accepted for compatibility.
     */
    static createSceneRuntime(nativeSceneManager?: any): RTParticleSceneRuntime | null {
        const globals = globalThis as any;
        if (globals.__LayaNativeParticleDownshiftP3World !== true &&
            globals.__LayaNativeParticleDownshiftP2Owner !== true &&
            globals.__LayaNativeParticleDownshiftP1Shadow !== true &&
            globals.__LayaNativeParticleDownshiftP0 !== true)
            return null;

        const ctor = globals.conchRTParticleManager as NativeParticleManagerConstructor;
        if (typeof ctor !== "function") {
            console.warn("[RTParticleRuntime] Native particle shadow requested but conchRTParticleManager is unavailable.");
            return null;
        }
        const runtime = new RTParticleSceneRuntime(ctor);
        runtime.attachSceneManager(nativeSceneManager);
        return runtime;
    }
}
