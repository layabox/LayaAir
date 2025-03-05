declare module spine {
    interface StringMap<T> {
        [key: string]: T;
    }
    class IntSet {
        array: number[];
        add(value: number): boolean;
        contains(value: number): boolean;
        remove(value: number): void;
        clear(): void;
    }
    class StringSet {
        entries: StringMap<boolean>;
        size: number;
        add(value: string): boolean;
        addAll(values: string[]): boolean;
        contains(value: string): boolean;
        clear(): void;
    }
    type NumberArrayLike = Array<number> | Float32Array;
    type IntArrayLike = Array<number> | Int16Array;
    interface Disposable {
        dispose(): void;
    }
    interface Restorable {
        restore(): void;
    }
    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        static WHITE: Color;
        static RED: Color;
        static GREEN: Color;
        static BLUE: Color;
        static MAGENTA: Color;
        constructor(r?: number, g?: number, b?: number, a?: number);
        set(r: number, g: number, b: number, a: number): this;
        setFromColor(c: Color): this;
        setFromString(hex: string): this;
        add(r: number, g: number, b: number, a: number): this;
        clamp(): this;
        static rgba8888ToColor(color: Color, value: number): void;
        static rgb888ToColor(color: Color, value: number): void;
        toRgb888(): number;
        static fromString(hex: string): Color;
    }
    class MathUtils {
        static PI: number;
        static PI2: number;
        static invPI2: number;
        static radiansToDegrees: number;
        static radDeg: number;
        static degreesToRadians: number;
        static degRad: number;
        static clamp(value: number, min: number, max: number): number;
        static cosDeg(degrees: number): number;
        static sinDeg(degrees: number): number;
        static atan2Deg(y: number, x: number): number;
        static signum(value: number): number;
        static toInt(x: number): number;
        static cbrt(x: number): number;
        static randomTriangular(min: number, max: number): number;
        static randomTriangularWith(min: number, max: number, mode: number): number;
        static isPowerOfTwo(value: number): boolean;
    }
    abstract class Interpolation {
        protected abstract applyInternal(a: number): number;
        apply(start: number, end: number, a: number): number;
    }
    class Pow extends Interpolation {
        protected power: number;
        constructor(power: number);
        applyInternal(a: number): number;
    }
    class PowOut extends Pow {
        constructor(power: number);
        applyInternal(a: number): number;
    }
    class Utils {
        static SUPPORTS_TYPED_ARRAYS: boolean;
        static arrayCopy<T>(source: ArrayLike<T>, sourceStart: number, dest: ArrayLike<T>, destStart: number, numElements: number): void;
        static arrayFill<T>(array: ArrayLike<T>, fromIndex: number, toIndex: number, value: T): void;
        static setArraySize<T>(array: Array<T>, size: number, value?: any): Array<T>;
        static ensureArrayCapacity<T>(array: Array<T>, size: number, value?: any): Array<T>;
        static newArray<T>(size: number, defaultValue: T): Array<T>;
        static newFloatArray(size: number): NumberArrayLike;
        static newShortArray(size: number): IntArrayLike;
        static toFloatArray(array: Array<number>): number[] | Float32Array;
        static toSinglePrecision(value: number): number;
        static webkit602BugfixHelper(alpha: number, blend: MixBlend): void;
        static contains<T>(array: Array<T>, element: T, identity?: boolean): boolean;
        static enumValue(type: any, name: string): any;
    }
    class DebugUtils {
        static logBones(skeleton: Skeleton): void;
    }
    class Pool<T> {
        private items;
        private instantiator;
        constructor(instantiator: () => T);
        obtain(): T;
        free(item: T): void;
        freeAll(items: ArrayLike<T>): void;
        clear(): void;
    }
    class Vector2 {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        set(x: number, y: number): Vector2;
        length(): number;
        normalize(): this;
    }
    class TimeKeeper {
        maxDelta: number;
        framesPerSecond: number;
        delta: number;
        totalTime: number;
        private lastTime;
        private frameCount;
        private frameTime;
        update(): void;
    }
    interface ArrayLike<T> {
        length: number;
        [n: number]: T;
    }
    class WindowedMean {
        values: Array<number>;
        addedValues: number;
        lastValue: number;
        mean: number;
        dirty: boolean;
        constructor(windowSize?: number);
        hasEnoughData(): boolean;
        addValue(value: number): void;
        getMean(): number;
    }
}
declare module spine {
    class Animation {
        name: string;
        timelines: Array<Timeline>;
        timelineIds: StringSet;
        duration: number;
        constructor(name: string, timelines: Array<Timeline>, duration: number);
        setTimelines(timelines: Array<Timeline>): void;
        hasTimeline(ids: string[]): boolean;
        apply(skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    enum MixBlend {
        setup = 0,
        first = 1,
        replace = 2,
        add = 3
    }
    enum MixDirection {
        mixIn = 0,
        mixOut = 1
    }
    abstract class Timeline {
        propertyIds: string[];
        frames: NumberArrayLike;
        constructor(frameCount: number, propertyIds: string[]);
        getPropertyIds(): string[];
        getFrameEntries(): number;
        getFrameCount(): number;
        getDuration(): number;
        abstract apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event> | null, alpha: number, blend: MixBlend, direction: MixDirection): void;
        static search1(frames: NumberArrayLike, time: number): number;
        static search(frames: NumberArrayLike, time: number, step: number): number;
    }
    interface BoneTimeline {
        boneIndex: number;
    }
    interface SlotTimeline {
        slotIndex: number;
    }
    abstract class CurveTimeline extends Timeline {
        protected curves: NumberArrayLike;
        constructor(frameCount: number, bezierCount: number, propertyIds: string[]);
        setLinear(frame: number): void;
        setStepped(frame: number): void;
        shrink(bezierCount: number): void;
        setBezier(bezier: number, frame: number, value: number, time1: number, value1: number, cx1: number, cy1: number, cx2: number, cy2: number, time2: number, value2: number): void;
        getBezierValue(time: number, frameIndex: number, valueOffset: number, i: number): number;
    }
    abstract class CurveTimeline1 extends CurveTimeline {
        constructor(frameCount: number, bezierCount: number, propertyId: string);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, value: number): void;
        getCurveValue(time: number): number;
        getRelativeValue(time: number, alpha: number, blend: MixBlend, current: number, setup: number): number;
        getAbsoluteValue(time: number, alpha: number, blend: MixBlend, current: number, setup: number): number;
        getAbsoluteValue2(time: number, alpha: number, blend: MixBlend, current: number, setup: number, value: number): number;
        getScaleValue(time: number, alpha: number, blend: MixBlend, direction: MixDirection, current: number, setup: number): number;
    }
    abstract class CurveTimeline2 extends CurveTimeline {
        constructor(frameCount: number, bezierCount: number, propertyId1: string, propertyId2: string);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, value1: number, value2: number): void;
    }
    class RotateTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event> | null, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class TranslateTimeline extends CurveTimeline2 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class TranslateXTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class TranslateYTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class ScaleTimeline extends CurveTimeline2 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class ScaleXTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class ScaleYTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class ShearTimeline extends CurveTimeline2 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class ShearXTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class ShearYTimeline extends CurveTimeline1 implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, bezierCount: number, boneIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class InheritTimeline extends Timeline implements BoneTimeline {
        boneIndex: number;
        constructor(frameCount: number, boneIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, inherit: Inherit): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class RGBATimeline extends CurveTimeline implements SlotTimeline {
        slotIndex: number;
        constructor(frameCount: number, bezierCount: number, slotIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, r: number, g: number, b: number, a: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class RGBTimeline extends CurveTimeline implements SlotTimeline {
        slotIndex: number;
        constructor(frameCount: number, bezierCount: number, slotIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, r: number, g: number, b: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class AlphaTimeline extends CurveTimeline1 implements SlotTimeline {
        slotIndex: number;
        constructor(frameCount: number, bezierCount: number, slotIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class RGBA2Timeline extends CurveTimeline implements SlotTimeline {
        slotIndex: number;
        constructor(frameCount: number, bezierCount: number, slotIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, r: number, g: number, b: number, a: number, r2: number, g2: number, b2: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class RGB2Timeline extends CurveTimeline implements SlotTimeline {
        slotIndex: number;
        constructor(frameCount: number, bezierCount: number, slotIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, r: number, g: number, b: number, r2: number, g2: number, b2: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class AttachmentTimeline extends Timeline implements SlotTimeline {
        slotIndex: number;
        attachmentNames: Array<string | null>;
        constructor(frameCount: number, slotIndex: number);
        getFrameCount(): number;
        setFrame(frame: number, time: number, attachmentName: string | null): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
        setAttachment(skeleton: Skeleton, slot: Slot, attachmentName: string | null): void;
    }
    class DeformTimeline extends CurveTimeline implements SlotTimeline {
        slotIndex: number;
        attachment: VertexAttachment;
        vertices: Array<NumberArrayLike>;
        constructor(frameCount: number, bezierCount: number, slotIndex: number, attachment: VertexAttachment);
        getFrameCount(): number;
        setFrame(frame: number, time: number, vertices: NumberArrayLike): void;
        setBezier(bezier: number, frame: number, value: number, time1: number, value1: number, cx1: number, cy1: number, cx2: number, cy2: number, time2: number, value2: number): void;
        getCurvePercent(time: number, frame: number): number;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class EventTimeline extends Timeline {
        static propertyIds: string[];
        events: Array<Event>;
        constructor(frameCount: number);
        getFrameCount(): number;
        setFrame(frame: number, event: Event): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class DrawOrderTimeline extends Timeline {
        static propertyIds: string[];
        drawOrders: Array<Array<number> | null>;
        constructor(frameCount: number);
        getFrameCount(): number;
        setFrame(frame: number, time: number, drawOrder: Array<number> | null): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class IkConstraintTimeline extends CurveTimeline {
        constraintIndex: number;
        constructor(frameCount: number, bezierCount: number, ikConstraintIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, mix: number, softness: number, bendDirection: number, compress: boolean, stretch: boolean): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class TransformConstraintTimeline extends CurveTimeline {
        constraintIndex: number;
        constructor(frameCount: number, bezierCount: number, transformConstraintIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, mixRotate: number, mixX: number, mixY: number, mixScaleX: number, mixScaleY: number, mixShearY: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class PathConstraintPositionTimeline extends CurveTimeline1 {
        constraintIndex: number;
        constructor(frameCount: number, bezierCount: number, pathConstraintIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class PathConstraintSpacingTimeline extends CurveTimeline1 {
        constraintIndex: number;
        constructor(frameCount: number, bezierCount: number, pathConstraintIndex: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class PathConstraintMixTimeline extends CurveTimeline {
        constraintIndex: number;
        constructor(frameCount: number, bezierCount: number, pathConstraintIndex: number);
        getFrameEntries(): number;
        setFrame(frame: number, time: number, mixRotate: number, mixX: number, mixY: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    abstract class PhysicsConstraintTimeline extends CurveTimeline1 {
        constraintIndex: number;
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number, property: number);
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
        abstract setup(constraint: PhysicsConstraint): number;
        abstract get(constraint: PhysicsConstraint): number;
        abstract set(constraint: PhysicsConstraint, value: number): void;
        abstract global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintInertiaTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintStrengthTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintDampingTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintMassTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintWindTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintGravityTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintMixTimeline extends PhysicsConstraintTimeline {
        constructor(frameCount: number, bezierCount: number, physicsConstraintIndex: number);
        setup(constraint: PhysicsConstraint): number;
        get(constraint: PhysicsConstraint): number;
        set(constraint: PhysicsConstraint, value: number): void;
        global(constraint: PhysicsConstraintData): boolean;
    }
    class PhysicsConstraintResetTimeline extends Timeline {
        private static propertyIds;
        constraintIndex: number;
        constructor(frameCount: number, physicsConstraintIndex: number);
        getFrameCount(): number;
        setFrame(frame: number, time: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
    class SequenceTimeline extends Timeline implements SlotTimeline {
        static ENTRIES: number;
        static MODE: number;
        static DELAY: number;
        slotIndex: number;
        attachment: HasTextureRegion;
        constructor(frameCount: number, slotIndex: number, attachment: HasTextureRegion);
        getFrameEntries(): number;
        getSlotIndex(): number;
        getAttachment(): Attachment;
        setFrame(frame: number, time: number, mode: SequenceMode, index: number, delay: number): void;
        apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    }
}
declare module spine {
    class AnimationState {
        static _emptyAnimation: Animation;
        private static emptyAnimation;
        data: AnimationStateData;
        tracks: TrackEntry[];
        timeScale: number;
        unkeyedState: number;
        events: Event[];
        listeners: AnimationStateListener[];
        queue: EventQueue;
        propertyIDs: StringSet;
        animationsChanged: boolean;
        trackEntryPool: Pool<TrackEntry>;
        constructor(data: AnimationStateData);
        update(delta: number): void;
        updateMixingFrom(to: TrackEntry, delta: number): boolean;
        apply(skeleton: Skeleton): boolean;
        applyMixingFrom(to: TrackEntry, skeleton: Skeleton, blend: MixBlend): number;
        applyAttachmentTimeline(timeline: AttachmentTimeline, skeleton: Skeleton, time: number, blend: MixBlend, attachments: boolean): void;
        setAttachment(skeleton: Skeleton, slot: Slot, attachmentName: string | null, attachments: boolean): void;
        applyRotateTimeline(timeline: RotateTimeline, skeleton: Skeleton, time: number, alpha: number, blend: MixBlend, timelinesRotation: Array<number>, i: number, firstFrame: boolean): void;
        queueEvents(entry: TrackEntry, animationTime: number): void;
        clearTracks(): void;
        clearTrack(trackIndex: number): void;
        setCurrent(index: number, current: TrackEntry, interrupt: boolean): void;
        setAnimation(trackIndex: number, animationName: string, loop?: boolean): TrackEntry;
        setAnimationWith(trackIndex: number, animation: Animation, loop?: boolean): TrackEntry;
        addAnimation(trackIndex: number, animationName: string, loop?: boolean, delay?: number): TrackEntry;
        addAnimationWith(trackIndex: number, animation: Animation, loop?: boolean, delay?: number): TrackEntry;
        setEmptyAnimation(trackIndex: number, mixDuration?: number): TrackEntry;
        addEmptyAnimation(trackIndex: number, mixDuration?: number, delay?: number): TrackEntry;
        setEmptyAnimations(mixDuration?: number): void;
        expandToIndex(index: number): TrackEntry;
        trackEntry(trackIndex: number, animation: Animation, loop: boolean, last: TrackEntry | null): TrackEntry;
        clearNext(entry: TrackEntry): void;
        _animationsChanged(): void;
        computeHold(entry: TrackEntry): void;
        getCurrent(trackIndex: number): TrackEntry;
        addListener(listener: AnimationStateListener): void;
        removeListener(listener: AnimationStateListener): void;
        clearListeners(): void;
        clearListenerNotifications(): void;
    }
    class TrackEntry {
        animation: Animation | null;
        previous: TrackEntry | null;
        next: TrackEntry | null;
        mixingFrom: TrackEntry | null;
        mixingTo: TrackEntry | null;
        listener: AnimationStateListener | null;
        trackIndex: number;
        loop: boolean;
        holdPrevious: boolean;
        reverse: boolean;
        shortestRotation: boolean;
        eventThreshold: number;
        mixAttachmentThreshold: number;
        alphaAttachmentThreshold: number;
        mixDrawOrderThreshold: number;
        animationStart: number;
        animationEnd: number;
        animationLast: number;
        nextAnimationLast: number;
        delay: number;
        trackTime: number;
        trackLast: number;
        nextTrackLast: number;
        trackEnd: number;
        timeScale: number;
        alpha: number;
        mixTime: number;
        _mixDuration: number;
        interruptAlpha: number;
        totalAlpha: number;
        get mixDuration(): number;
        set mixDuration(mixDuration: number);
        setMixDurationWithDelay(mixDuration: number, delay: number): void;
        mixBlend: MixBlend;
        timelineMode: number[];
        timelineHoldMix: TrackEntry[];
        timelinesRotation: number[];
        reset(): void;
        getAnimationTime(): number;
        setAnimationLast(animationLast: number): void;
        isComplete(): boolean;
        resetRotationDirections(): void;
        getTrackComplete(): number;
        wasApplied(): boolean;
        isNextReady(): boolean;
    }
    class EventQueue {
        objects: Array<any>;
        drainDisabled: boolean;
        animState: AnimationState;
        constructor(animState: AnimationState);
        start(entry: TrackEntry): void;
        interrupt(entry: TrackEntry): void;
        end(entry: TrackEntry): void;
        dispose(entry: TrackEntry): void;
        complete(entry: TrackEntry): void;
        event(entry: TrackEntry, event: Event): void;
        drain(): void;
        clear(): void;
    }
    enum EventType {
        start = 0,
        interrupt = 1,
        end = 2,
        dispose = 3,
        complete = 4,
        event = 5
    }
    interface AnimationStateListener {
        start?: (entry: TrackEntry) => void;
        interrupt?: (entry: TrackEntry) => void;
        end?: (entry: TrackEntry) => void;
        dispose?: (entry: TrackEntry) => void;
        complete?: (entry: TrackEntry) => void;
        event?: (entry: TrackEntry, event: Event) => void;
    }
    abstract class AnimationStateAdapter implements AnimationStateListener {
        start(entry: TrackEntry): void;
        interrupt(entry: TrackEntry): void;
        end(entry: TrackEntry): void;
        dispose(entry: TrackEntry): void;
        complete(entry: TrackEntry): void;
        event(entry: TrackEntry, event: Event): void;
    }
    const SUBSEQUENT = 0;
    const FIRST = 1;
    const HOLD_SUBSEQUENT = 2;
    const HOLD_FIRST = 3;
    const HOLD_MIX = 4;
    const SETUP = 1;
    const CURRENT = 2;
}
declare module spine {
    class AnimationStateData {
        skeletonData: SkeletonData;
        animationToMixTime: StringMap<number>;
        defaultMix: number;
        constructor(skeletonData: SkeletonData);
        setMix(fromName: string, toName: string, duration: number): void;
        setMixWith(from: Animation, to: Animation, duration: number): void;
        getMix(from: Animation, to: Animation): number;
    }
}
declare module spine {
    class AssetManagerBase implements Disposable {
        private pathPrefix;
        private textureLoader;
        private downloader;
        private assets;
        private errors;
        private toLoad;
        private loaded;
        constructor(textureLoader: (image: HTMLImageElement | ImageBitmap) => Texture, pathPrefix?: string, downloader?: Downloader);
        private start;
        private success;
        private error;
        loadAll(): Promise<AssetManagerBase>;
        setRawDataURI(path: string, data: string): void;
        loadBinary(path: string, success?: (path: string, binary: Uint8Array) => void, error?: (path: string, message: string) => void): void;
        loadText(path: string, success?: (path: string, text: string) => void, error?: (path: string, message: string) => void): void;
        loadJson(path: string, success?: (path: string, object: object) => void, error?: (path: string, message: string) => void): void;
        loadTexture(path: string, success?: (path: string, texture: Texture) => void, error?: (path: string, message: string) => void): void;
        loadTextureAtlas(path: string, success?: (path: string, atlas: TextureAtlas) => void, error?: (path: string, message: string) => void, fileAlias?: {
            [keyword: string]: string;
        }): void;
        get(path: string): any;
        require(path: string): any;
        remove(path: string): any;
        removeAll(): void;
        isLoadingComplete(): boolean;
        getToLoad(): number;
        getLoaded(): number;
        dispose(): void;
        hasErrors(): boolean;
        getErrors(): StringMap<string>;
    }
    class Downloader {
        private callbacks;
        rawDataUris: StringMap<string>;
        dataUriToString(dataUri: string): string;
        base64ToUint8Array(base64: string): Uint8Array;
        dataUriToUint8Array(dataUri: string): Uint8Array;
        downloadText(url: string, success: (data: string) => void, error: (status: number, responseText: string) => void): void;
        downloadJson(url: string, success: (data: object) => void, error: (status: number, responseText: string) => void): void;
        downloadBinary(url: string, success: (data: Uint8Array) => void, error: (status: number, responseText: string) => void): void;
        private start;
        private finish;
    }
}
declare module spine {
    class AtlasAttachmentLoader implements AttachmentLoader {
        atlas: TextureAtlas;
        constructor(atlas: TextureAtlas);
        loadSequence(name: string, basePath: string, sequence: Sequence): void;
        newRegionAttachment(skin: Skin, name: string, path: string, sequence: Sequence): RegionAttachment;
        newMeshAttachment(skin: Skin, name: string, path: string, sequence: Sequence): MeshAttachment;
        newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
        newPathAttachment(skin: Skin, name: string): PathAttachment;
        newPointAttachment(skin: Skin, name: string): PointAttachment;
        newClippingAttachment(skin: Skin, name: string): ClippingAttachment;
    }
}
declare module spine {
    abstract class Attachment {
        name: string;
        constructor(name: string);
        abstract copy(): Attachment;
    }
    abstract class VertexAttachment extends Attachment {
        private static nextID;
        id: number;
        bones: Array<number> | null;
        vertices: NumberArrayLike;
        worldVerticesLength: number;
        timelineAttachment: Attachment;
        constructor(name: string);
        computeWorldVertices(slot: Slot, start: number, count: number, worldVertices: NumberArrayLike, offset: number, stride: number): void;
        copyTo(attachment: VertexAttachment): void;
    }
}
declare module spine {
    interface AttachmentLoader {
        newRegionAttachment(skin: Skin, name: string, path: string, sequence: Sequence | null): RegionAttachment;
        newMeshAttachment(skin: Skin, name: string, path: string, sequence: Sequence | null): MeshAttachment;
        newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
        newPathAttachment(skin: Skin, name: string): PathAttachment;
        newPointAttachment(skin: Skin, name: string): PointAttachment;
        newClippingAttachment(skin: Skin, name: string): ClippingAttachment;
    }
}
declare module spine {
    class BoundingBoxAttachment extends VertexAttachment {
        color: Color;
        constructor(name: string);
        copy(): Attachment;
    }
}
declare module spine {
    class ClippingAttachment extends VertexAttachment {
        endSlot: SlotData | null;
        color: Color;
        constructor(name: string);
        copy(): Attachment;
    }
}
declare module spine {
    interface HasTextureRegion {
        path: string;
        region: TextureRegion | null;
        updateRegion(): void;
        color: Color;
        sequence: Sequence | null;
    }
}
declare module spine {
    class MeshAttachment extends VertexAttachment implements HasTextureRegion {
        region: TextureRegion | null;
        path: string;
        regionUVs: NumberArrayLike;
        uvs: NumberArrayLike;
        triangles: Array<number>;
        color: Color;
        width: number;
        height: number;
        hullLength: number;
        edges: Array<number>;
        private parentMesh;
        sequence: Sequence | null;
        tempColor: Color;
        constructor(name: string, path: string);
        updateRegion(): void;
        getParentMesh(): MeshAttachment;
        setParentMesh(parentMesh: MeshAttachment): void;
        copy(): Attachment;
        computeWorldVertices(slot: Slot, start: number, count: number, worldVertices: NumberArrayLike, offset: number, stride: number): void;
        newLinkedMesh(): MeshAttachment;
    }
}
declare module spine {
    class PathAttachment extends VertexAttachment {
        lengths: Array<number>;
        closed: boolean;
        constantSpeed: boolean;
        color: Color;
        constructor(name: string);
        copy(): Attachment;
    }
}
declare module spine {
    class PointAttachment extends VertexAttachment {
        x: number;
        y: number;
        rotation: number;
        color: Color;
        constructor(name: string);
        computeWorldPosition(bone: Bone, point: Vector2): Vector2;
        computeWorldRotation(bone: Bone): number;
        copy(): Attachment;
    }
}
declare module spine {
    class RegionAttachment extends Attachment implements HasTextureRegion {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        width: number;
        height: number;
        color: Color;
        path: string;
        region: TextureRegion | null;
        sequence: Sequence | null;
        offset: number[] | Float32Array;
        uvs: number[] | Float32Array;
        tempColor: Color;
        constructor(name: string, path: string);
        updateRegion(): void;
        computeWorldVertices(slot: Slot, worldVertices: NumberArrayLike, offset: number, stride: number): void;
        copy(): Attachment;
        static X1: number;
        static Y1: number;
        static C1R: number;
        static C1G: number;
        static C1B: number;
        static C1A: number;
        static U1: number;
        static V1: number;
        static X2: number;
        static Y2: number;
        static C2R: number;
        static C2G: number;
        static C2B: number;
        static C2A: number;
        static U2: number;
        static V2: number;
        static X3: number;
        static Y3: number;
        static C3R: number;
        static C3G: number;
        static C3B: number;
        static C3A: number;
        static U3: number;
        static V3: number;
        static X4: number;
        static Y4: number;
        static C4R: number;
        static C4G: number;
        static C4B: number;
        static C4A: number;
        static U4: number;
        static V4: number;
    }
}
declare module spine {
    class Sequence {
        private static _nextID;
        id: number;
        regions: TextureRegion[];
        start: number;
        digits: number;
        setupIndex: number;
        constructor(count: number);
        copy(): Sequence;
        apply(slot: Slot, attachment: HasTextureRegion): void;
        getPath(basePath: string, index: number): string;
        private static nextID;
    }
    enum SequenceMode {
        hold = 0,
        once = 1,
        loop = 2,
        pingpong = 3,
        onceReverse = 4,
        loopReverse = 5,
        pingpongReverse = 6
    }
    const SequenceModeValues: SequenceMode[];
}
declare module spine {
    class Bone implements Updatable {
        data: BoneData;
        skeleton: Skeleton;
        parent: Bone | null;
        children: Bone[];
        x: number;
        y: number;
        rotation: number;
        scaleX: number;
        scaleY: number;
        shearX: number;
        shearY: number;
        ax: number;
        ay: number;
        arotation: number;
        ascaleX: number;
        ascaleY: number;
        ashearX: number;
        ashearY: number;
        a: number;
        b: number;
        c: number;
        d: number;
        worldY: number;
        worldX: number;
        inherit: Inherit;
        sorted: boolean;
        active: boolean;
        constructor(data: BoneData, skeleton: Skeleton, parent: Bone | null);
        isActive(): boolean;
        update(physics: Physics): void;
        updateWorldTransform(): void;
        updateWorldTransformWith(x: number, y: number, rotation: number, scaleX: number, scaleY: number, shearX: number, shearY: number): void;
        setToSetupPose(): void;
        updateAppliedTransform(): void;
        getWorldRotationX(): number;
        getWorldRotationY(): number;
        getWorldScaleX(): number;
        getWorldScaleY(): number;
        worldToLocal(world: Vector2): Vector2;
        localToWorld(local: Vector2): Vector2;
        worldToParent(world: Vector2): Vector2;
        parentToWorld(world: Vector2): Vector2;
        worldToLocalRotation(worldRotation: number): number;
        localToWorldRotation(localRotation: number): number;
        rotateWorld(degrees: number): void;
    }
}
declare module spine {
    class BoneData {
        index: number;
        name: string;
        parent: BoneData | null;
        length: number;
        x: number;
        y: number;
        rotation: number;
        scaleX: number;
        scaleY: number;
        shearX: number;
        shearY: number;
        inherit: Inherit;
        skinRequired: boolean;
        color: Color;
        icon?: string;
        visible: boolean;
        constructor(index: number, name: string, parent: BoneData | null);
    }
    enum Inherit {
        Normal = 0,
        OnlyTranslation = 1,
        NoRotationOrReflection = 2,
        NoScale = 3,
        NoScaleOrReflection = 4
    }
}
declare module spine {
    abstract class ConstraintData {
        name: string;
        order: number;
        skinRequired: boolean;
        constructor(name: string, order: number, skinRequired: boolean);
    }
}
declare module spine {
    class Event {
        data: EventData;
        intValue: number;
        floatValue: number;
        stringValue: string | null;
        time: number;
        volume: number;
        balance: number;
        constructor(time: number, data: EventData);
    }
}
declare module spine {
    class EventData {
        name: string;
        intValue: number;
        floatValue: number;
        stringValue: string | null;
        audioPath: string | null;
        volume: number;
        balance: number;
        constructor(name: string);
    }
}
declare module spine {
    class IkConstraint implements Updatable {
        data: IkConstraintData;
        bones: Array<Bone>;
        target: Bone;
        bendDirection: number;
        compress: boolean;
        stretch: boolean;
        mix: number;
        softness: number;
        active: boolean;
        constructor(data: IkConstraintData, skeleton: Skeleton);
        isActive(): boolean;
        setToSetupPose(): void;
        update(physics: Physics): void;
        apply1(bone: Bone, targetX: number, targetY: number, compress: boolean, stretch: boolean, uniform: boolean, alpha: number): void;
        apply2(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, stretch: boolean, uniform: boolean, softness: number, alpha: number): void;
    }
}
declare module spine {
    class IkConstraintData extends ConstraintData {
        bones: BoneData[];
        private _target;
        set target(boneData: BoneData);
        get target(): BoneData;
        bendDirection: number;
        compress: boolean;
        stretch: boolean;
        uniform: boolean;
        mix: number;
        softness: number;
        constructor(name: string);
    }
}
declare module spine {
    class PathConstraint implements Updatable {
        static NONE: number;
        static BEFORE: number;
        static AFTER: number;
        static epsilon: number;
        data: PathConstraintData;
        bones: Array<Bone>;
        target: Slot;
        position: number;
        spacing: number;
        mixRotate: number;
        mixX: number;
        mixY: number;
        spaces: number[];
        positions: number[];
        world: number[];
        curves: number[];
        lengths: number[];
        segments: number[];
        active: boolean;
        constructor(data: PathConstraintData, skeleton: Skeleton);
        isActive(): boolean;
        setToSetupPose(): void;
        update(physics: Physics): void;
        computeWorldPositions(path: PathAttachment, spacesCount: number, tangents: boolean): number[];
        addBeforePosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
        addAfterPosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
        addCurvePosition(p: number, x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number, out: Array<number>, o: number, tangents: boolean): void;
    }
}
declare module spine {
    class PathConstraintData extends ConstraintData {
        bones: BoneData[];
        private _target;
        set target(slotData: SlotData);
        get target(): SlotData;
        positionMode: PositionMode;
        spacingMode: SpacingMode;
        rotateMode: RotateMode;
        offsetRotation: number;
        position: number;
        spacing: number;
        mixRotate: number;
        mixX: number;
        mixY: number;
        constructor(name: string);
    }
    enum PositionMode {
        Fixed = 0,
        Percent = 1
    }
    enum SpacingMode {
        Length = 0,
        Fixed = 1,
        Percent = 2,
        Proportional = 3
    }
    enum RotateMode {
        Tangent = 0,
        Chain = 1,
        ChainScale = 2
    }
}
declare module spine {
    class PhysicsConstraint implements Updatable {
        readonly data: PhysicsConstraintData;
        private _bone;
        set bone(bone: Bone);
        get bone(): Bone;
        inertia: number;
        strength: number;
        damping: number;
        massInverse: number;
        wind: number;
        gravity: number;
        mix: number;
        _reset: boolean;
        ux: number;
        uy: number;
        cx: number;
        cy: number;
        tx: number;
        ty: number;
        xOffset: number;
        xVelocity: number;
        yOffset: number;
        yVelocity: number;
        rotateOffset: number;
        rotateVelocity: number;
        scaleOffset: number;
        scaleVelocity: number;
        active: boolean;
        readonly skeleton: Skeleton;
        remaining: number;
        lastTime: number;
        constructor(data: PhysicsConstraintData, skeleton: Skeleton);
        reset(): void;
        setToSetupPose(): void;
        isActive(): boolean;
        update(physics: Physics): void;
        translate(x: number, y: number): void;
        rotate(x: number, y: number, degrees: number): void;
    }
}
declare module spine {
    class PhysicsConstraintData extends ConstraintData {
        private _bone;
        set bone(boneData: BoneData);
        get bone(): BoneData;
        x: number;
        y: number;
        rotate: number;
        scaleX: number;
        shearX: number;
        limit: number;
        step: number;
        inertia: number;
        strength: number;
        damping: number;
        massInverse: number;
        wind: number;
        gravity: number;
        mix: number;
        inertiaGlobal: boolean;
        strengthGlobal: boolean;
        dampingGlobal: boolean;
        massGlobal: boolean;
        windGlobal: boolean;
        gravityGlobal: boolean;
        mixGlobal: boolean;
        constructor(name: string);
    }
}
declare module spine {
    class Skeleton {
        private static quadTriangles;
        static yDown: boolean;
        data: SkeletonData;
        bones: Array<Bone>;
        slots: Array<Slot>;
        drawOrder: Array<Slot>;
        ikConstraints: Array<IkConstraint>;
        transformConstraints: Array<TransformConstraint>;
        pathConstraints: Array<PathConstraint>;
        physicsConstraints: Array<PhysicsConstraint>;
        _updateCache: Updatable[];
        skin: Skin | null;
        color: Color;
        scaleX: number;
        private _scaleY;
        get scaleY(): number;
        set scaleY(scaleY: number);
        x: number;
        y: number;
        time: number;
        constructor(data: SkeletonData);
        updateCache(): void;
        sortIkConstraint(constraint: IkConstraint): void;
        sortPathConstraint(constraint: PathConstraint): void;
        sortTransformConstraint(constraint: TransformConstraint): void;
        sortPathConstraintAttachment(skin: Skin, slotIndex: number, slotBone: Bone): void;
        sortPathConstraintAttachmentWith(attachment: Attachment, slotBone: Bone): void;
        sortPhysicsConstraint(constraint: PhysicsConstraint): void;
        sortBone(bone: Bone): void;
        sortReset(bones: Array<Bone>): void;
        updateWorldTransform(physics: Physics): void;
        updateWorldTransformWith(physics: Physics, parent: Bone): void;
        setToSetupPose(): void;
        setBonesToSetupPose(): void;
        setSlotsToSetupPose(): void;
        getRootBone(): Bone;
        findBone(boneName: string): Bone;
        findSlot(slotName: string): Slot;
        setSkinByName(skinName: string): void;
        setSkin(newSkin: Skin): void;
        getAttachmentByName(slotName: string, attachmentName: string): Attachment | null;
        getAttachment(slotIndex: number, attachmentName: string): Attachment | null;
        setAttachment(slotName: string, attachmentName: string): void;
        findIkConstraint(constraintName: string): IkConstraint;
        findTransformConstraint(constraintName: string): TransformConstraint;
        findPathConstraint(constraintName: string): PathConstraint;
        findPhysicsConstraint(constraintName: string): PhysicsConstraint;
        getBoundsRect(): {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        getBounds(offset: Vector2, size: Vector2, temp?: Array<number>, clipper?: SkeletonClipping | null): void;
        update(delta: number): void;
        physicsTranslate(x: number, y: number): void;
        physicsRotate(x: number, y: number, degrees: number): void;
    }
    enum Physics {
        none = 0,
        reset = 1,
        update = 2,
        pose = 3
    }
}
declare module spine {
    class SkeletonBinary {
        scale: number;
        attachmentLoader: AttachmentLoader;
        private linkedMeshes;
        constructor(attachmentLoader: AttachmentLoader);
        readSkeletonData(binary: Uint8Array | ArrayBuffer): SkeletonData;
        private readSkin;
        private readAttachment;
        private readSequence;
        private readVertices;
        private readFloatArray;
        private readShortArray;
        private readAnimation;
    }
    class BinaryInput {
        strings: string[];
        private index;
        private buffer;
        constructor(data: Uint8Array | ArrayBuffer, strings?: string[], index?: number, buffer?: DataView);
        readByte(): number;
        readUnsignedByte(): number;
        readShort(): number;
        readInt32(): number;
        readInt(optimizePositive: boolean): number;
        readStringRef(): string | null;
        readString(): string | null;
        readFloat(): number;
        readBoolean(): boolean;
    }
}
declare module spine {
    class SkeletonBounds {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        boundingBoxes: BoundingBoxAttachment[];
        polygons: (number[] | Float32Array)[];
        private polygonPool;
        update(skeleton: Skeleton, updateAabb: boolean): void;
        aabbCompute(): void;
        aabbContainsPoint(x: number, y: number): boolean;
        aabbIntersectsSegment(x1: number, y1: number, x2: number, y2: number): boolean;
        aabbIntersectsSkeleton(bounds: SkeletonBounds): boolean;
        containsPoint(x: number, y: number): BoundingBoxAttachment | null;
        containsPointPolygon(polygon: NumberArrayLike, x: number, y: number): boolean;
        intersectsSegment(x1: number, y1: number, x2: number, y2: number): BoundingBoxAttachment;
        intersectsSegmentPolygon(polygon: NumberArrayLike, x1: number, y1: number, x2: number, y2: number): boolean;
        getPolygon(boundingBox: BoundingBoxAttachment): number[] | Float32Array;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module spine {
    class SkeletonClipping {
        private triangulator;
        private clippingPolygon;
        private clipOutput;
        clippedVertices: number[];
        clippedUVs: number[];
        clippedTriangles: number[];
        private scratch;
        private clipAttachment;
        private clippingPolygons;
        clipStart(slot: Slot, clip: ClippingAttachment): number;
        clipEndWithSlot(slot: Slot): void;
        clipEnd(): void;
        isClipping(): boolean;
        clipTriangles(vertices: NumberArrayLike, verticesLength: number, triangles: NumberArrayLike, trianglesLength: number): void;
        clipTriangles(vertices: NumberArrayLike, verticesLength: number, triangles: NumberArrayLike, trianglesLength: number, uvs: NumberArrayLike, light: Color, dark: Color, twoColor: boolean): void;
        clipTriangles(vertices: NumberArrayLike, triangles: NumberArrayLike, trianglesLength: number): void;
        clipTriangles(vertices: NumberArrayLike, triangles: NumberArrayLike, trianglesLength: number, uvs: NumberArrayLike, light: Color, dark: Color, twoColor: boolean): void;
        private clipTrianglesNoRender;
        private clipTrianglesRender;
        clipTrianglesUnpacked(vertices: NumberArrayLike, triangles: NumberArrayLike, trianglesLength: number, uvs: NumberArrayLike): void;
        clip(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, clippingArea: Array<number>, output: Array<number>): boolean;
        static makeClockwise(polygon: NumberArrayLike): void;
    }
}
declare module spine {
    class SkeletonData {
        name: string | null;
        bones: BoneData[];
        slots: SlotData[];
        skins: Skin[];
        defaultSkin: Skin | null;
        events: EventData[];
        animations: Animation[];
        ikConstraints: IkConstraintData[];
        transformConstraints: TransformConstraintData[];
        pathConstraints: PathConstraintData[];
        physicsConstraints: PhysicsConstraintData[];
        x: number;
        y: number;
        width: number;
        height: number;
        referenceScale: number;
        version: string | null;
        hash: string | null;
        fps: number;
        imagesPath: string | null;
        audioPath: string | null;
        findBone(boneName: string): BoneData;
        findSlot(slotName: string): SlotData;
        findSkin(skinName: string): Skin;
        findEvent(eventDataName: string): EventData;
        findAnimation(animationName: string): Animation;
        findIkConstraint(constraintName: string): IkConstraintData;
        findTransformConstraint(constraintName: string): TransformConstraintData;
        findPathConstraint(constraintName: string): PathConstraintData;
        findPhysicsConstraint(constraintName: string): PhysicsConstraintData;
    }
}
declare module spine {
    class SkeletonJson {
        attachmentLoader: AttachmentLoader;
        scale: number;
        private linkedMeshes;
        constructor(attachmentLoader: AttachmentLoader);
        readSkeletonData(json: string | any): SkeletonData;
        readAttachment(map: any, skin: Skin, slotIndex: number, name: string, skeletonData: SkeletonData): Attachment | null;
        readSequence(map: any): Sequence;
        readVertices(map: any, attachment: VertexAttachment, verticesLength: number): void;
        readAnimation(map: any, name: string, skeletonData: SkeletonData): void;
    }
}
declare module spine {
    class SkinEntry {
        slotIndex: number;
        name: string;
        attachment: Attachment;
        constructor(slotIndex: number, name: string, attachment: Attachment);
    }
    class Skin {
        name: string;
        attachments: StringMap<Attachment>[];
        bones: BoneData[];
        constraints: ConstraintData[];
        color: Color;
        constructor(name: string);
        setAttachment(slotIndex: number, name: string, attachment: Attachment): void;
        addSkin(skin: Skin): void;
        copySkin(skin: Skin): void;
        getAttachment(slotIndex: number, name: string): Attachment | null;
        removeAttachment(slotIndex: number, name: string): void;
        getAttachments(): Array<SkinEntry>;
        getAttachmentsForSlot(slotIndex: number, attachments: Array<SkinEntry>): void;
        clear(): void;
        attachAll(skeleton: Skeleton, oldSkin: Skin): void;
    }
}
declare module spine {
    class Slot {
        data: SlotData;
        bone: Bone;
        color: Color;
        darkColor: Color | null;
        attachment: Attachment | null;
        attachmentState: number;
        sequenceIndex: number;
        deform: number[];
        constructor(data: SlotData, bone: Bone);
        getSkeleton(): Skeleton;
        getAttachment(): Attachment | null;
        setAttachment(attachment: Attachment | null): void;
        setToSetupPose(): void;
    }
}
declare module spine {
    class SlotData {
        index: number;
        name: string;
        boneData: BoneData;
        color: Color;
        darkColor: Color | null;
        attachmentName: string | null;
        blendMode: BlendMode;
        visible: boolean;
        constructor(index: number, name: string, boneData: BoneData);
    }
    enum BlendMode {
        Normal = 0,
        Additive = 1,
        Multiply = 2,
        Screen = 3
    }
}
declare module spine {
    abstract class Texture {
        protected _image: HTMLImageElement | ImageBitmap | any;
        constructor(image: HTMLImageElement | ImageBitmap | any);
        getImage(): HTMLImageElement | ImageBitmap | any;
        abstract setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
        abstract setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
        abstract dispose(): void;
    }
    enum TextureFilter {
        Nearest = 9728,
        Linear = 9729,
        MipMap = 9987,
        MipMapNearestNearest = 9984,
        MipMapLinearNearest = 9985,
        MipMapNearestLinear = 9986,
        MipMapLinearLinear = 9987
    }
    enum TextureWrap {
        MirroredRepeat = 33648,
        ClampToEdge = 33071,
        Repeat = 10497
    }
    class TextureRegion {
        texture: any;
        u: number;
        v: number;
        u2: number;
        v2: number;
        width: number;
        height: number;
        degrees: number;
        offsetX: number;
        offsetY: number;
        originalWidth: number;
        originalHeight: number;
    }
    class FakeTexture extends Texture {
        setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
        setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
        dispose(): void;
    }
}
declare module spine {
    class TextureAtlas implements Disposable {
        pages: TextureAtlasPage[];
        regions: TextureAtlasRegion[];
        constructor(atlasText: string);
        findRegion(name: string): TextureAtlasRegion | null;
        setTextures(assetManager: AssetManagerBase, pathPrefix?: string): void;
        dispose(): void;
    }
    class TextureAtlasPage {
        name: string;
        minFilter: TextureFilter;
        magFilter: TextureFilter;
        uWrap: TextureWrap;
        vWrap: TextureWrap;
        texture: Texture | null;
        width: number;
        height: number;
        pma: boolean;
        regions: TextureAtlasRegion[];
        constructor(name: string);
        setTexture(texture: Texture): void;
    }
    class TextureAtlasRegion extends TextureRegion {
        page: TextureAtlasPage;
        name: string;
        x: number;
        y: number;
        offsetX: number;
        offsetY: number;
        originalWidth: number;
        originalHeight: number;
        index: number;
        degrees: number;
        names: string[] | null;
        values: number[][] | null;
        constructor(page: TextureAtlasPage, name: string);
    }
}
declare module spine {
    class TransformConstraint implements Updatable {
        data: TransformConstraintData;
        bones: Array<Bone>;
        target: Bone;
        mixRotate: number;
        mixX: number;
        mixY: number;
        mixScaleX: number;
        mixScaleY: number;
        mixShearY: number;
        temp: Vector2;
        active: boolean;
        constructor(data: TransformConstraintData, skeleton: Skeleton);
        isActive(): boolean;
        setToSetupPose(): void;
        update(physics: Physics): void;
        applyAbsoluteWorld(): void;
        applyRelativeWorld(): void;
        applyAbsoluteLocal(): void;
        applyRelativeLocal(): void;
    }
}
declare module spine {
    class TransformConstraintData extends ConstraintData {
        bones: BoneData[];
        private _target;
        set target(boneData: BoneData);
        get target(): BoneData;
        mixRotate: number;
        mixX: number;
        mixY: number;
        mixScaleX: number;
        mixScaleY: number;
        mixShearY: number;
        offsetRotation: number;
        offsetX: number;
        offsetY: number;
        offsetScaleX: number;
        offsetScaleY: number;
        offsetShearY: number;
        relative: boolean;
        local: boolean;
        constructor(name: string);
    }
}
declare module spine {
    class Triangulator {
        private convexPolygons;
        private convexPolygonsIndices;
        private indicesArray;
        private isConcaveArray;
        private triangles;
        private polygonPool;
        private polygonIndicesPool;
        triangulate(verticesArray: NumberArrayLike): Array<number>;
        decompose(verticesArray: Array<number>, triangles: Array<number>): Array<Array<number>>;
        private static isConcave;
        private static positiveArea;
        private static winding;
    }
}
declare module spine {
    interface Updatable {
        update(physics: Physics): void;
        isActive(): boolean;
    }
}
