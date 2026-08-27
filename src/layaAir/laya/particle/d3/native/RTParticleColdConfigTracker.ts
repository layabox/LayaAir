type DirtyListener = () => void;

interface ObservedTarget {
    indices: Map<PropertyKey, number>;
    entries: any[];
    listener: DirtyListener;
    listenerReferences: number;
    extraListeners: Map<DirtyListener, number> | null;
}

const observedObjects = new WeakMap<object, ObservedTarget>();
const sharedAccessors = new Map<PropertyKey, PropertyDescriptor>();
const ENTRY_STRIDE = 8;
const ENTRY_KIND = 0;
const ENTRY_OWN = 1;
const ENTRY_ENUMERABLE = 2;
const ENTRY_WRITABLE = 3;
const ENTRY_GETTER = 4;
const ENTRY_SETTER = 5;
const ENTRY_VALUE = 6;
const ENTRY_REFERENCES = 7;
function findDescriptor(target: object, key: PropertyKey): {
    descriptor: PropertyDescriptor;
    own: boolean;
} | null {
    const ownDescriptor = Object.getOwnPropertyDescriptor(target, key);
    if (ownDescriptor)
        return { descriptor: ownDescriptor, own: true };
    let prototype = Object.getPrototypeOf(target);
    while (prototype) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        if (descriptor)
            return { descriptor, own: false };
        prototype = Object.getPrototypeOf(prototype);
    }
    return null;
}

function notifyTarget(state: ObservedTarget): void {
    state.listener?.();
    if (state.extraListeners) {
        for (const callback of state.extraListeners.keys())
            callback();
    }
}

function addTargetListener(state: ObservedTarget, listener: DirtyListener): void {
    if (!state.listener || state.listener === listener) {
        state.listener = listener;
        ++state.listenerReferences;
        return;
    }
    if (!state.extraListeners)
        state.extraListeners = new Map();
    state.extraListeners.set(listener, (state.extraListeners.get(listener) ?? 0) + 1);
}

function removeTargetListener(state: ObservedTarget, listener: DirtyListener): void {
    if (state.listener === listener) {
        if (--state.listenerReferences === 0)
            state.listener = null;
        return;
    }
    const references = state.extraListeners?.get(listener) ?? 0;
    if (references <= 1)
        state.extraListeners?.delete(listener);
    else
        state.extraListeners.set(listener, references - 1);
    if (state.extraListeners?.size === 0)
        state.extraListeners = null;
}

/** One accessor pair is shared by every observed object for the same key. */
function getSharedAccessor(key: PropertyKey): PropertyDescriptor {
    let accessor = sharedAccessors.get(key);
    if (accessor)
        return accessor;
    accessor = {
        configurable: true,
        get: function (this: any): any {
            const state = observedObjects.get(this);
            const index = state?.indices.get(key);
            if (!state || index === undefined)
                return undefined;
            const entries = state.entries;
            return entries[index + ENTRY_KIND] === 0 ? entries[index + ENTRY_VALUE] :
                entries[index + ENTRY_GETTER]?.call(this);
        },
        set: function (this: any, nextValue: any): void {
            const state = observedObjects.get(this);
            const index = state?.indices.get(key);
            if (!state || index === undefined)
                return;
            const entries = state.entries;
            if (entries[index + ENTRY_KIND] === 0) {
                if (Object.is(entries[index + ENTRY_VALUE], nextValue))
                    return;
                entries[index + ENTRY_VALUE] = nextValue;
            } else {
                const getter = entries[index + ENTRY_GETTER];
                const setter = entries[index + ENTRY_SETTER];
                if (!setter)
                    return;
                const previousValue = getter?.call(this);
                setter.call(this, nextValue);
                const currentValue = getter ? getter.call(this) : nextValue;
                if (Object.is(previousValue, currentValue))
                    return;
            }
            notifyTarget(state);
        }
    };
    sharedAccessors.set(key, accessor);
    return accessor;
}

/** Installs one low-allocation observation group on a cold object. */
function observeProperties(target: any, keys: readonly PropertyKey[], listener: DirtyListener): boolean {
    if (!target)
        return false;
    let state = observedObjects.get(target);
    if (!state) {
        state = {
            indices: new Map(), entries: [], listener: null,
            listenerReferences: 0, extraListeners: null
        };
        observedObjects.set(target, state);
    }
    let observedCount = 0;
    for (const key of keys) {
        const existingIndex = state.indices.get(key);
        if (existingIndex !== undefined) {
            ++state.entries[existingIndex + ENTRY_REFERENCES];
            ++observedCount;
            continue;
        }
        const found = findDescriptor(target, key);
        if (!found || found.descriptor.configurable === false ||
            (!("value" in found.descriptor) && !found.descriptor.set))
            continue;
        const descriptor = found.descriptor;
        const index = state.entries.length;
        state.indices.set(key, index);
        state.entries.push(
            "value" in descriptor ? 0 : 1,
            found.own,
            descriptor.enumerable === true,
            descriptor.writable === true,
            descriptor.get ?? null,
            descriptor.set ?? null,
            "value" in descriptor ? target[key] : undefined,
            1
        );
        const accessor = getSharedAccessor(key);
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: descriptor.enumerable,
            get: accessor.get,
            set: accessor.set
        });
        ++observedCount;
    }
    if (observedCount === 0) {
        if (state.indices.size === 0)
            observedObjects.delete(target);
        return false;
    }
    addTargetListener(state, listener);
    return true;
}

function unobserveProperties(target: any, keys: readonly PropertyKey[], listener: DirtyListener): void {
    const state = observedObjects.get(target);
    if (!state)
        return;
    removeTargetListener(state, listener);
    for (const key of keys) {
        const index = state.indices.get(key);
        if (index === undefined || --state.entries[index + ENTRY_REFERENCES] !== 0)
            continue;
        const entries = state.entries;
        if (entries[index + ENTRY_KIND] === 0)
            Object.defineProperty(target, key, {
                configurable: true,
                enumerable: entries[index + ENTRY_ENUMERABLE],
                writable: entries[index + ENTRY_WRITABLE],
                value: entries[index + ENTRY_VALUE]
            });
        else if (entries[index + ENTRY_OWN])
            Object.defineProperty(target, key, {
                configurable: true,
                enumerable: entries[index + ENTRY_ENUMERABLE],
                get: entries[index + ENTRY_GETTER] ?? undefined,
                set: entries[index + ENTRY_SETTER] ?? undefined
            });
        else
            delete target[key];
        state.indices.delete(key);
    }
    if (state.indices.size === 0)
        observedObjects.delete(target);
}

/**
 * Hybrid dirty/version chain. ParticleSystem stays in fast-property mode: its
 * 19 legacy plain scalar fields and 9 replaceable vector references are polled
 * without allocation. Nested cold-only Vector/Shape/module objects use
 * mutation hooks, so their values are not rescanned on steady frames.
 */
export class RTParticleColdConfigTracker {
    private _version: number = 1;
    private _values: Float64Array = new Float64Array(19);
    private _references: any[] = new Array(9);
    private _subscriptionTargets: any[] = [];
    private _subscriptionKeys: (readonly PropertyKey[])[] = [];
    private _pushConnected: boolean = false;
    private _pushTarget: any = null;
    private _pushKeys: readonly PropertyKey[] = null;
    private _dirtyListener: DirtyListener = null;

    constructor() {
        this._values.fill(Number.NaN);
    }

    get version(): number {
        return this._version;
    }

    poll(particleSystem: any): number {
        const values = this._values;
        let changed = false;
        let value = particleSystem.maxParticles;
        if (!Object.is(values[0], value)) { values[0] = value; changed = true; }
        value = particleSystem.duration;
        if (!Object.is(values[1], value)) { values[1] = value; changed = true; }
        value = particleSystem.looping ? 1 : 0;
        if (values[2] !== value) { values[2] = value; changed = true; }
        value = particleSystem.autoRandomSeed ? 1 : 0;
        if (values[3] !== value) { values[3] = value; changed = true; }
        value = particleSystem.startSpeedType;
        if (!Object.is(values[4], value)) { values[4] = value; changed = true; }
        value = particleSystem.startSpeedConstant;
        if (!Object.is(values[5], value)) { values[5] = value; changed = true; }
        value = particleSystem.startSpeedConstantMin;
        if (!Object.is(values[6], value)) { values[6] = value; changed = true; }
        value = particleSystem.startSpeedConstantMax;
        if (!Object.is(values[7], value)) { values[7] = value; changed = true; }
        value = particleSystem.threeDStartSize ? 1 : 0;
        if (values[8] !== value) { values[8] = value; changed = true; }
        value = particleSystem.startSizeType;
        if (!Object.is(values[9], value)) { values[9] = value; changed = true; }
        value = particleSystem.startSizeConstant;
        if (!Object.is(values[10], value)) { values[10] = value; changed = true; }
        value = particleSystem.startSizeConstantMin;
        if (!Object.is(values[11], value)) { values[11] = value; changed = true; }
        value = particleSystem.startSizeConstantMax;
        if (!Object.is(values[12], value)) { values[12] = value; changed = true; }
        value = particleSystem.startRotationType;
        if (!Object.is(values[13], value)) { values[13] = value; changed = true; }
        value = particleSystem.randomizeRotationDirection;
        if (!Object.is(values[14], value)) { values[14] = value; changed = true; }
        value = particleSystem.startRotationConstant;
        if (!Object.is(values[15], value)) { values[15] = value; changed = true; }
        value = particleSystem.startRotationConstantMin;
        if (!Object.is(values[16], value)) { values[16] = value; changed = true; }
        value = particleSystem.startRotationConstantMax;
        if (!Object.is(values[17], value)) { values[17] = value; changed = true; }
        value = particleSystem.startColorType;
        if (!Object.is(values[18], value)) { values[18] = value; changed = true; }

        const references = this._references;
        value = particleSystem.startSizeConstantSeparate;
        if (references[0] !== value) { references[0] = value; changed = true; }
        value = particleSystem.startSizeConstantMinSeparate;
        if (references[1] !== value) { references[1] = value; changed = true; }
        value = particleSystem.startSizeConstantMaxSeparate;
        if (references[2] !== value) { references[2] = value; changed = true; }
        value = particleSystem.startRotationConstantSeparate;
        if (references[3] !== value) { references[3] = value; changed = true; }
        value = particleSystem.startRotationConstantMinSeparate;
        if (references[4] !== value) { references[4] = value; changed = true; }
        value = particleSystem.startRotationConstantMaxSeparate;
        if (references[5] !== value) { references[5] = value; changed = true; }
        value = particleSystem.startColorConstant;
        if (references[6] !== value) { references[6] = value; changed = true; }
        value = particleSystem.startColorConstantMin;
        if (references[7] !== value) { references[7] = value; changed = true; }
        value = particleSystem.startColorConstantMax;
        if (references[8] !== value) { references[8] = value; changed = true; }
        if (changed)
            this._markDirty();
        return this._version;
    }

    /** Rebinds nested observers after any object-valued cold property changes. */
    refresh(particleSystem: any): void {
        this._clearSubscriptions();
        this._watchVector(particleSystem.startSizeConstantSeparate, 3);
        this._watchVector(particleSystem.startSizeConstantMinSeparate, 3);
        this._watchVector(particleSystem.startSizeConstantMaxSeparate, 3);
        this._watchVector(particleSystem.startRotationConstantSeparate, 3);
        this._watchVector(particleSystem.startRotationConstantMinSeparate, 3);
        this._watchVector(particleSystem.startRotationConstantMaxSeparate, 3);
        this._watchVector(particleSystem.startColorConstant, 4);
        this._watchVector(particleSystem.startColorConstantMin, 4);
        this._watchVector(particleSystem.startColorConstantMax, 4);

        const emission = particleSystem.emission;
        this._watch(emission, ["enable", "_nativeParticleConfigVersion"]);

        const shape = particleSystem._shape ?? particleSystem.shape;
        this._watch(shape, ["enable", "shapeType", "randomDirection", "x", "y", "z",
            "radius", "arc", "emitFromEdge", "angle", "length", "emitType", "emitFromShell"]);

        const colorLifetime = particleSystem._colorOverLifetime ?? particleSystem.colorOverLifetime;
        this._watch(colorLifetime, ["enable"]);
        this._watchVector(colorLifetime?.color?.constant, 4);
        this._watchVector(colorLifetime?.color?.constantMin, 4);
        this._watchVector(colorLifetime?.color?.constantMax, 4);

        const sizeLifetime = particleSystem._sizeOverLifetime ?? particleSystem.sizeOverLifetime;
        this._watch(sizeLifetime, ["enable"]);
        this._watchVector(sizeLifetime?.size?.constantMinSeparate, 3);
        this._watchVector(sizeLifetime?.size?.constantMaxSeparate, 3);

        const velocityLifetime = particleSystem._velocityOverLifetime ?? particleSystem.velocityOverLifetime;
        this._watch(velocityLifetime, ["enable"]);
        const rotationLifetime = particleSystem._rotationOverLifetime ?? particleSystem.rotationOverLifetime;
        this._watch(rotationLifetime, ["enable"]);

        const texture = particleSystem._textureSheetAnimation ?? particleSystem.textureSheetAnimation;
        this._watch(texture, ["enable", "type", "randomRow", "rowIndex", "cycles", "tiles"]);
        this._watchVector(texture?.tiles, 2);
    }

    /**
     * NativeWorld converts the remaining legacy public fields into dirty notifications
     * once at registration. This removes the steady per-emitter poll while
     * preserving direct assignment semantics (including vector replacement).
     */
    connectPush(particleSystem: any, listener: DirtyListener): void {
        this._dirtyListener = listener;
        if (this._pushConnected)
            return;
        const properties: PropertyKey[] = [
            "maxParticles", "duration", "looping", "autoRandomSeed", "simulationSpeed",
            "startSpeedType", "startSpeedConstant", "startSpeedConstantMin", "startSpeedConstantMax",
            "threeDStartSize", "startSizeType", "startSizeConstant", "startSizeConstantMin", "startSizeConstantMax",
            "startRotationType", "randomizeRotationDirection", "startRotationConstant",
            "startRotationConstantMin", "startRotationConstantMax", "startColorType",
            "startSizeConstantSeparate", "startSizeConstantMinSeparate", "startSizeConstantMaxSeparate",
            "startRotationConstantSeparate", "startRotationConstantMinSeparate", "startRotationConstantMaxSeparate",
            "startColorConstant", "startColorConstantMin", "startColorConstantMax"
        ];
        this._pushConnected = observeProperties(particleSystem, properties, this._markDirty);
        if (this._pushConnected) {
            this._pushTarget = particleSystem;
            this._pushKeys = properties;
        }
    }

    destroy(): void {
        this._clearSubscriptions();
        if (this._pushConnected)
            unobserveProperties(this._pushTarget, this._pushKeys, this._markDirty);
        this._pushConnected = false;
        this._pushTarget = null;
        this._pushKeys = null;
        this._dirtyListener = null;
    }

    private _markDirty = (): void => {
        this._version = (this._version + 1) >>> 0;
        if (this._version === 0)
            this._version = 1;
        this._dirtyListener?.();
    };

    private _watch(target: any, properties: readonly PropertyKey[]): void {
        if (observeProperties(target, properties, this._markDirty)) {
            this._subscriptionTargets.push(target);
            this._subscriptionKeys.push(properties);
        }
    }

    private _watchVector(vector: any, dimensions: number): void {
        this._watch(vector, dimensions === 4 ? ["x", "y", "z", "w"] :
            dimensions === 3 ? ["x", "y", "z"] : ["x", "y"]);
    }

    private _clearSubscriptions(): void {
        for (let i = this._subscriptionTargets.length - 1; i >= 0; i--)
            unobserveProperties(this._subscriptionTargets[i], this._subscriptionKeys[i], this._markDirty);
        this._subscriptionTargets.length = 0;
        this._subscriptionKeys.length = 0;
    }
}
