declare function b2Assert(condition: boolean, ...args: any[]): void /**asserts condition*/;
declare function b2Maybe<T>(value: T | undefined, def: T): T;
declare const b2_maxFloat: number;
declare const b2_epsilon: number;
declare const b2_epsilon_sq: number;
declare const b2_pi: number;
declare const b2_lengthUnitsPerMeter: number;
declare const b2_maxPolygonVertices: number;
declare const b2_maxManifoldPoints: number;
declare const b2_aabbExtension: number;
declare const b2_aabbMultiplier: number;
declare const b2_linearSlop: number;
declare const b2_angularSlop: number;
declare const b2_polygonRadius: number;
declare const b2_maxSubSteps: number;
declare const b2_maxTOIContacts: number;
declare const b2_maxLinearCorrection: number;
declare const b2_maxAngularCorrection: number;
declare const b2_maxTranslation: number;
declare const b2_maxTranslationSquared: number;
declare const b2_maxRotation: number;
declare const b2_maxRotationSquared: number;
declare const b2_baumgarte: number;
declare const b2_toiBaumgarte: number;
declare const b2_timeToSleep: number;
declare const b2_linearSleepTolerance: number;
declare const b2_angularSleepTolerance: number;
declare class b2Version {
    major: number;
    minor: number;
    revision: number;
    constructor(major?: number, minor?: number, revision?: number);
    toString(): string;
}
declare const b2_version: b2Version;
declare const b2_branch: string;
declare const b2_commit: string;
declare function b2ParseInt(v: string): number;
declare function b2ParseUInt(v: string): number;
declare function b2MakeArray<T>(length: number, init: (i: number) => T): T[];
declare function b2MakeNullArray<T>(length: number): Array<T | null>;
declare function b2MakeNumberArray(length: number, init?: number): number[];

declare function b2Alloc(size: number): any;
declare function b2Free(mem: any): void;
declare function b2Log(message: string, ...args: any[]): void;

declare const b2_pi_over_180: number;
declare const b2_180_over_pi: number;
declare const b2_two_pi: number;
declare const b2Abs: (x: number) => number;
declare function b2Min(a: number, b: number): number;
declare function b2Max(a: number, b: number): number;
declare function b2Clamp(a: number, lo: number, hi: number): number;
declare function b2Swap<T>(a: T[], b: T[]): void;
declare const b2IsValid: typeof isFinite;
declare function b2Sq(n: number): number;
declare function b2InvSqrt(n: number): number;
declare const b2Sqrt: (x: number) => number;
declare const b2Pow: (x: number, y: number) => number;
declare function b2DegToRad(degrees: number): number;
declare function b2RadToDeg(radians: number): number;
declare const b2Cos: (x: number) => number;
declare const b2Sin: (x: number) => number;
declare const b2Acos: (x: number) => number;
declare const b2Asin: (x: number) => number;
declare const b2Atan2: (y: number, x: number) => number;
declare function b2NextPowerOfTwo(x: number): number;
declare function b2IsPowerOfTwo(x: number): boolean;
declare function b2Random(): number;
declare function b2RandomRange(lo: number, hi: number): number;
interface XY {
    x: number;
    y: number;
}
declare class b2Vec2 implements XY {
    x: number;
    y: number;
    static readonly ZERO: Readonly<b2Vec2>;
    static readonly UNITX: Readonly<b2Vec2>;
    static readonly UNITY: Readonly<b2Vec2>;
    static readonly s_t0: b2Vec2;
    static readonly s_t1: b2Vec2;
    static readonly s_t2: b2Vec2;
    static readonly s_t3: b2Vec2;
    constructor(x?: number, y?: number);
    Clone(): b2Vec2;
    SetZero(): this;
    Set(x: number, y: number): this;
    Copy(other: XY): this;
    SelfAdd(v: XY): this;
    SelfAddXY(x: number, y: number): this;
    SelfSub(v: XY): this;
    SelfSubXY(x: number, y: number): this;
    SelfMul(s: number): this;
    SelfMulAdd(s: number, v: XY): this;
    SelfMulSub(s: number, v: XY): this;
    Dot(v: XY): number;
    Cross(v: XY): number;
    Length(): number;
    LengthSquared(): number;
    Normalize(): number;
    SelfNormalize(): this;
    SelfRotate(radians: number): this;
    SelfRotateCosSin(c: number, s: number): this;
    IsValid(): boolean;
    SelfCrossVS(s: number): this;
    SelfCrossSV(s: number): this;
    SelfMinV(v: XY): this;
    SelfMaxV(v: XY): this;
    SelfAbs(): this;
    SelfNeg(): this;
    SelfSkew(): this;
    static MakeArray(length: number): b2Vec2[];
    static AbsV<T extends XY>(v: XY, out: T): T;
    static MinV<T extends XY>(a: XY, b: XY, out: T): T;
    static MaxV<T extends XY>(a: XY, b: XY, out: T): T;
    static ClampV<T extends XY>(v: XY, lo: XY, hi: XY, out: T): T;
    static RotateV<T extends XY>(v: XY, radians: number, out: T): T;
    static DotVV(a: XY, b: XY): number;
    static CrossVV(a: XY, b: XY): number;
    static CrossVS<T extends XY>(v: XY, s: number, out: T): T;
    static CrossVOne<T extends XY>(v: XY, out: T): T;
    static CrossSV<T extends XY>(s: number, v: XY, out: T): T;
    static CrossOneV<T extends XY>(v: XY, out: T): T;
    static AddVV<T extends XY>(a: XY, b: XY, out: T): T;
    static SubVV<T extends XY>(a: XY, b: XY, out: T): T;
    static MulSV<T extends XY>(s: number, v: XY, out: T): T;
    static MulVS<T extends XY>(v: XY, s: number, out: T): T;
    static AddVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T;
    static SubVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T;
    static AddVCrossSV<T extends XY>(a: XY, s: number, v: XY, out: T): T;
    static MidVV<T extends XY>(a: XY, b: XY, out: T): T;
    static ExtVV<T extends XY>(a: XY, b: XY, out: T): T;
    static IsEqualToV(a: XY, b: XY): boolean;
    static DistanceVV(a: XY, b: XY): number;
    static DistanceSquaredVV(a: XY, b: XY): number;
    static NegV<T extends XY>(v: XY, out: T): T;
}
declare const b2Vec2_zero: Readonly<b2Vec2>;
declare class b2TypedVec2 implements b2Vec2 {
    readonly data: Float32Array;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    constructor();
    constructor(data: Float32Array);
    constructor(x: number, y: number);
    Clone(): b2TypedVec2;
    SetZero(): this;
    Set(x: number, y: number): this;
    Copy(other: XY): this;
    SelfAdd(v: XY): this;
    SelfAddXY(x: number, y: number): this;
    SelfSub(v: XY): this;
    SelfSubXY(x: number, y: number): this;
    SelfMul(s: number): this;
    SelfMulAdd(s: number, v: XY): this;
    SelfMulSub(s: number, v: XY): this;
    Dot(v: XY): number;
    Cross(v: XY): number;
    Length(): number;
    LengthSquared(): number;
    Normalize(): number;
    SelfNormalize(): this;
    SelfRotate(radians: number): this;
    SelfRotateCosSin(c: number, s: number): this;
    IsValid(): boolean;
    SelfCrossVS(s: number): this;
    SelfCrossSV(s: number): this;
    SelfMinV(v: XY): this;
    SelfMaxV(v: XY): this;
    SelfAbs(): this;
    SelfNeg(): this;
    SelfSkew(): this;
}
interface XYZ extends XY {
    z: number;
}
declare class b2Vec3 implements XYZ {
    static readonly ZERO: Readonly<b2Vec3>;
    static readonly s_t0: b2Vec3;
    readonly data: Float32Array;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
    constructor();
    constructor(data: Float32Array);
    constructor(x: number, y: number, z: number);
    Clone(): b2Vec3;
    SetZero(): this;
    SetXYZ(x: number, y: number, z: number): this;
    Copy(other: XYZ): this;
    SelfNeg(): this;
    SelfAdd(v: XYZ): this;
    SelfAddXYZ(x: number, y: number, z: number): this;
    SelfSub(v: XYZ): this;
    SelfSubXYZ(x: number, y: number, z: number): this;
    SelfMul(s: number): this;
    static DotV3V3(a: XYZ, b: XYZ): number;
    static CrossV3V3<T extends XYZ>(a: XYZ, b: XYZ, out: T): T;
}
declare class b2Mat22 {
    static readonly IDENTITY: Readonly<b2Mat22>;
    readonly ex: b2Vec2;
    readonly ey: b2Vec2;
    Clone(): b2Mat22;
    static FromVV(c1: XY, c2: XY): b2Mat22;
    static FromSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): b2Mat22;
    static FromAngle(radians: number): b2Mat22;
    SetSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): this;
    SetVV(c1: XY, c2: XY): this;
    SetAngle(radians: number): this;
    Copy(other: b2Mat22): this;
    SetIdentity(): this;
    SetZero(): this;
    GetAngle(): number;
    GetInverse(out: b2Mat22): b2Mat22;
    Solve<T extends XY>(b_x: number, b_y: number, out: T): T;
    SelfAbs(): this;
    SelfInv(): this;
    SelfAddM(M: b2Mat22): this;
    SelfSubM(M: b2Mat22): this;
    static AbsM(M: b2Mat22, out: b2Mat22): b2Mat22;
    static MulMV<T extends XY>(M: b2Mat22, v: XY, out: T): T;
    static MulTMV<T extends XY>(M: b2Mat22, v: XY, out: T): T;
    static AddMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22;
    static MulMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22;
    static MulTMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22;
}
declare class b2Mat33 {
    static readonly IDENTITY: Readonly<b2Mat33>;
    readonly data: Float32Array;
    readonly ex: b2Vec3;
    readonly ey: b2Vec3;
    readonly ez: b2Vec3;
    Clone(): b2Mat33;
    SetVVV(c1: XYZ, c2: XYZ, c3: XYZ): this;
    Copy(other: b2Mat33): this;
    SetIdentity(): this;
    SetZero(): this;
    SelfAddM(M: b2Mat33): this;
    Solve33<T extends XYZ>(b_x: number, b_y: number, b_z: number, out: T): T;
    Solve22<T extends XY>(b_x: number, b_y: number, out: T): T;
    GetInverse22(M: b2Mat33): void;
    GetSymInverse33(M: b2Mat33): void;
    static MulM33V3<T extends XYZ>(A: b2Mat33, v: XYZ, out: T): T;
    static MulM33XYZ<T extends XYZ>(A: b2Mat33, x: number, y: number, z: number, out: T): T;
    static MulM33V2<T extends XY>(A: b2Mat33, v: XY, out: T): T;
    static MulM33XY<T extends XY>(A: b2Mat33, x: number, y: number, out: T): T;
}
declare class b2Rot {
    static readonly IDENTITY: Readonly<b2Rot>;
    s: number;
    c: number;
    constructor(angle?: number);
    Clone(): b2Rot;
    Copy(other: b2Rot): this;
    SetAngle(angle: number): this;
    SetIdentity(): this;
    GetAngle(): number;
    GetXAxis<T extends XY>(out: T): T;
    GetYAxis<T extends XY>(out: T): T;
    static MulRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot;
    static MulTRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot;
    static MulRV<T extends XY>(q: b2Rot, v: XY, out: T): T;
    static MulTRV<T extends XY>(q: b2Rot, v: XY, out: T): T;
}
declare class b2Transform {
    static readonly IDENTITY: Readonly<b2Transform>;
    readonly p: b2Vec2;
    readonly q: b2Rot;
    Clone(): b2Transform;
    Copy(other: b2Transform): this;
    SetIdentity(): this;
    SetPositionRotation(position: XY, q: Readonly<b2Rot>): this;
    SetPositionAngle(pos: XY, a: number): this;
    SetPosition(position: XY): this;
    SetPositionXY(x: number, y: number): this;
    SetRotation(rotation: Readonly<b2Rot>): this;
    SetRotationAngle(radians: number): this;
    GetPosition(): Readonly<b2Vec2>;
    GetRotation(): Readonly<b2Rot>;
    GetRotationAngle(): number;
    GetAngle(): number;
    static MulXV<T extends XY>(T: b2Transform, v: XY, out: T): T;
    static MulTXV<T extends XY>(T: b2Transform, v: XY, out: T): T;
    static MulXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform;
    static MulTXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform;
}
declare class b2Sweep {
    readonly localCenter: b2Vec2;
    readonly c0: b2Vec2;
    readonly c: b2Vec2;
    a0: number;
    a: number;
    alpha0: number;
    Clone(): b2Sweep;
    Copy(other: b2Sweep): this;
    GetTransform(xf: b2Transform, beta: number): b2Transform;
    Advance(alpha: number): void;
    Normalize(): void;
}

interface RGB {
    r: number;
    g: number;
    b: number;
}
interface RGBA extends RGB {
    a: number;
}
declare class b2Color implements RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
    static readonly ZERO: Readonly<b2Color>;
    static readonly RED: Readonly<b2Color>;
    static readonly GREEN: Readonly<b2Color>;
    static readonly BLUE: Readonly<b2Color>;
    constructor(r?: number, g?: number, b?: number, a?: number);
    Clone(): b2Color;
    Copy(other: RGBA): this;
    IsEqual(color: RGBA): boolean;
    IsZero(): boolean;
    Set(r: number, g: number, b: number, a?: number): void;
    SetByteRGB(r: number, g: number, b: number): this;
    SetByteRGBA(r: number, g: number, b: number, a: number): this;
    SetRGB(rr: number, gg: number, bb: number): this;
    SetRGBA(rr: number, gg: number, bb: number, aa: number): this;
    SelfAdd(color: RGBA): this;
    Add<T extends RGBA>(color: RGBA, out: T): T;
    SelfSub(color: RGBA): this;
    Sub<T extends RGBA>(color: RGBA, out: T): T;
    SelfMul(s: number): this;
    Mul<T extends RGBA>(s: number, out: T): T;
    Mix(mixColor: RGBA, strength: number): void;
    static MixColors(colorA: RGBA, colorB: RGBA, strength: number): void;
    MakeStyleString(alpha?: number): string;
    static MakeStyleString(r: number, g: number, b: number, a?: number): string;
}
declare class b2TypedColor implements b2Color {
    readonly data: Float32Array;
    get r(): number;
    set r(value: number);
    get g(): number;
    set g(value: number);
    get b(): number;
    set b(value: number);
    get a(): number;
    set a(value: number);
    constructor();
    constructor(data: Float32Array);
    constructor(rr: number, gg: number, bb: number);
    constructor(rr: number, gg: number, bb: number, aa: number);
    Clone(): b2TypedColor;
    Copy(other: RGBA): this;
    IsEqual(color: RGBA): boolean;
    IsZero(): boolean;
    Set(r: number, g: number, b: number, a?: number): void;
    SetByteRGB(r: number, g: number, b: number): this;
    SetByteRGBA(r: number, g: number, b: number, a: number): this;
    SetRGB(rr: number, gg: number, bb: number): this;
    SetRGBA(rr: number, gg: number, bb: number, aa: number): this;
    SelfAdd(color: RGBA): this;
    Add<T extends RGBA>(color: RGBA, out: T): T;
    SelfSub(color: RGBA): this;
    Sub<T extends RGBA>(color: RGBA, out: T): T;
    SelfMul(s: number): this;
    Mul<T extends RGBA>(s: number, out: T): T;
    Mix(mixColor: RGBA, strength: number): void;
    MakeStyleString(alpha?: number): string;
}
declare enum b2DrawFlags {
    e_none = 0,
    e_shapeBit = 1,
    e_jointBit = 2,
    e_aabbBit = 4,
    e_pairBit = 8,
    e_centerOfMassBit = 16,
    e_all = 63
}
declare abstract class b2Draw {
    m_drawFlags: b2DrawFlags;
    SetFlags(flags: b2DrawFlags): void;
    GetFlags(): b2DrawFlags;
    AppendFlags(flags: b2DrawFlags): void;
    ClearFlags(flags: b2DrawFlags): void;
    abstract PushTransform(xf: b2Transform): void;
    abstract PopTransform(xf: b2Transform): void;
    abstract DrawPolygon(vertices: XY[], vertexCount: number, color: RGBA): void;
    abstract DrawSolidPolygon(vertices: XY[], vertexCount: number, color: RGBA): void;
    abstract DrawCircle(center: XY, radius: number, color: RGBA): void;
    abstract DrawSolidCircle(center: XY, radius: number, axis: XY, color: RGBA): void;
    abstract DrawSegment(p1: XY, p2: XY, color: RGBA): void;
    abstract DrawTransform(xf: b2Transform): void;
    abstract DrawPoint(p: XY, size: number, color: RGBA): void;
}

declare class b2Timer {
    m_start: number;
    Reset(): b2Timer;
    GetMilliseconds(): number;
}
declare class b2Counter {
    m_count: number;
    m_min_count: number;
    m_max_count: number;
    GetCount(): number;
    GetMinCount(): number;
    GetMaxCount(): number;
    ResetCount(): number;
    ResetMinCount(): void;
    ResetMaxCount(): void;
    Increment(): void;
    Decrement(): void;
}

declare class b2GrowableStack<T> {
    m_stack: Array<T | null>;
    m_count: number;
    constructor(N: number);
    Reset(): this;
    Push(element: T): void;
    Pop(): T | null;
    GetCount(): number;
}

declare class b2BlockAllocator {
}

declare class b2StackAllocator {
}

declare class b2DistanceProxy {
    readonly m_buffer: b2Vec2[];
    m_vertices: b2Vec2[];
    m_count: number;
    m_radius: number;
    Copy(other: Readonly<b2DistanceProxy>): this;
    Reset(): b2DistanceProxy;
    SetShape(shape: b2Shape, index: number): void;
    SetVerticesRadius(vertices: b2Vec2[], count: number, radius: number): void;
    Set(shape: b2Shape, index: number): void;
    Set(vertices: b2Vec2[], count: number, radius: number): void;
    GetSupport(d: b2Vec2): number;
    GetSupportVertex(d: b2Vec2): b2Vec2;
    GetVertexCount(): number;
    GetVertex(index: number): b2Vec2;
}
declare class b2SimplexCache {
    metric: number;
    count: number;
    readonly indexA: [number, number, number];
    readonly indexB: [number, number, number];
    Reset(): b2SimplexCache;
}
declare class b2DistanceInput {
    readonly proxyA: b2DistanceProxy;
    readonly proxyB: b2DistanceProxy;
    readonly transformA: b2Transform;
    readonly transformB: b2Transform;
    useRadii: boolean;
    Reset(): b2DistanceInput;
}
declare class b2DistanceOutput {
    readonly pointA: b2Vec2;
    readonly pointB: b2Vec2;
    distance: number;
    iterations: number;
    Reset(): b2DistanceOutput;
}
declare class b2ShapeCastInput {
    readonly proxyA: b2DistanceProxy;
    readonly proxyB: b2DistanceProxy;
    readonly transformA: b2Transform;
    readonly transformB: b2Transform;
    readonly translationB: b2Vec2;
}
declare class b2ShapeCastOutput {
    readonly point: b2Vec2;
    readonly normal: b2Vec2;
    lambda: number;
    iterations: number;
}
declare let b2_gjkCalls: number;
declare let b2_gjkIters: number;
declare let b2_gjkMaxIters: number;
declare function b2_gjk_reset(): void;
declare class b2SimplexVertex {
    readonly wA: b2Vec2;
    readonly wB: b2Vec2;
    readonly w: b2Vec2;
    a: number;
    indexA: number;
    indexB: number;
    Copy(other: b2SimplexVertex): b2SimplexVertex;
}
declare class b2Simplex {
    readonly m_v1: b2SimplexVertex;
    readonly m_v2: b2SimplexVertex;
    readonly m_v3: b2SimplexVertex;
    readonly m_vertices: b2SimplexVertex[];
    m_count: number;
    constructor();
    ReadCache(cache: b2SimplexCache, proxyA: b2DistanceProxy, transformA: b2Transform, proxyB: b2DistanceProxy, transformB: b2Transform): void;
    WriteCache(cache: b2SimplexCache): void;
    GetSearchDirection(out: b2Vec2): b2Vec2;
    GetClosestPoint(out: b2Vec2): b2Vec2;
    GetWitnessPoints(pA: b2Vec2, pB: b2Vec2): void;
    GetMetric(): number;
    Solve2(): void;
    Solve3(): void;
    private static s_e12;
    private static s_e13;
    private static s_e23;
}
declare function b2Distance(output: b2DistanceOutput, cache: b2SimplexCache, input: b2DistanceInput): void;
declare function b2ShapeCast(output: b2ShapeCastOutput, input: b2ShapeCastInput): boolean;

declare class b2MassData {
    mass: number;
    readonly center: b2Vec2;
    I: number;
}
declare enum b2ShapeType {
    e_unknown = -1,
    e_circleShape = 0,
    e_edgeShape = 1,
    e_polygonShape = 2,
    e_chainShape = 3,
    e_shapeTypeCount = 4
}
declare abstract class b2Shape {
    readonly m_type: b2ShapeType;
    m_radius: number;
    constructor(type: b2ShapeType, radius: number);
    abstract Clone(): b2Shape;
    Copy(other: b2Shape): b2Shape;
    GetType(): b2ShapeType;
    abstract GetChildCount(): number;
    abstract TestPoint(xf: b2Transform, p: XY): boolean;
    abstract RayCast(output: b2RayCastOutput, input: b2RayCastInput, transform: b2Transform, childIndex: number): boolean;
    abstract ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    abstract ComputeMass(massData: b2MassData, density: number): void;
    abstract SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    abstract ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    abstract Dump(log: (format: string, ...args: any[]) => void): void;
}

declare enum b2ContactFeatureType {
    e_vertex = 0,
    e_face = 1
}
declare class b2ContactFeature {
    private _key;
    private _key_invalid;
    private _indexA;
    private _indexB;
    private _typeA;
    private _typeB;
    get key(): number;
    set key(value: number);
    get indexA(): number;
    set indexA(value: number);
    get indexB(): number;
    set indexB(value: number);
    get typeA(): number;
    set typeA(value: number);
    get typeB(): number;
    set typeB(value: number);
}
declare class b2ContactID {
    readonly cf: b2ContactFeature;
    Copy(o: b2ContactID): b2ContactID;
    Clone(): b2ContactID;
    get key(): number;
    set key(value: number);
}
declare class b2ManifoldPoint {
    readonly localPoint: b2Vec2;
    normalImpulse: number;
    tangentImpulse: number;
    readonly id: b2ContactID;
    static MakeArray(length: number): b2ManifoldPoint[];
    Reset(): void;
    Copy(o: b2ManifoldPoint): b2ManifoldPoint;
}
declare enum b2ManifoldType {
    e_unknown = -1,
    e_circles = 0,
    e_faceA = 1,
    e_faceB = 2
}
declare class b2Manifold {
    readonly points: b2ManifoldPoint[];
    readonly localNormal: b2Vec2;
    readonly localPoint: b2Vec2;
    type: b2ManifoldType;
    pointCount: number;
    Reset(): void;
    Copy(o: b2Manifold): b2Manifold;
    Clone(): b2Manifold;
}
declare class b2WorldManifold {
    readonly normal: b2Vec2;
    readonly points: b2Vec2[];
    readonly separations: number[];
    private static Initialize_s_pointA;
    private static Initialize_s_pointB;
    private static Initialize_s_cA;
    private static Initialize_s_cB;
    private static Initialize_s_planePoint;
    private static Initialize_s_clipPoint;
    Initialize(manifold: b2Manifold, xfA: b2Transform, radiusA: number, xfB: b2Transform, radiusB: number): void;
}
declare enum b2PointState {
    b2_nullState = 0,
    b2_addState = 1,
    b2_persistState = 2,
    b2_removeState = 3
}
declare function b2GetPointStates(state1: b2PointState[], state2: b2PointState[], manifold1: b2Manifold, manifold2: b2Manifold): void;
declare class b2ClipVertex {
    readonly v: b2Vec2;
    readonly id: b2ContactID;
    static MakeArray(length: number): b2ClipVertex[];
    Copy(other: b2ClipVertex): b2ClipVertex;
}
declare class b2RayCastInput {
    readonly p1: b2Vec2;
    readonly p2: b2Vec2;
    maxFraction: number;
    Copy(o: b2RayCastInput): b2RayCastInput;
}
declare class b2RayCastOutput {
    readonly normal: b2Vec2;
    fraction: number;
    Copy(o: b2RayCastOutput): b2RayCastOutput;
}
declare class b2AABB {
    readonly lowerBound: b2Vec2;
    readonly upperBound: b2Vec2;
    private readonly m_cache_center;
    private readonly m_cache_extent;
    Copy(o: b2AABB): b2AABB;
    IsValid(): boolean;
    GetCenter(): b2Vec2;
    GetExtents(): b2Vec2;
    GetPerimeter(): number;
    Combine1(aabb: b2AABB): b2AABB;
    Combine2(aabb1: b2AABB, aabb2: b2AABB): b2AABB;
    static Combine(aabb1: b2AABB, aabb2: b2AABB, out: b2AABB): b2AABB;
    Contains(aabb: b2AABB): boolean;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput): boolean;
    TestContain(point: XY): boolean;
    TestOverlap(other: b2AABB): boolean;
}
declare function b2TestOverlapAABB(a: b2AABB, b: b2AABB): boolean;
declare function b2ClipSegmentToLine(vOut: [b2ClipVertex, b2ClipVertex], vIn: [b2ClipVertex, b2ClipVertex], normal: b2Vec2, offset: number, vertexIndexA: number): number;
declare function b2TestOverlapShape(shapeA: b2Shape, indexA: number, shapeB: b2Shape, indexB: number, xfA: b2Transform, xfB: b2Transform): boolean;

declare class b2TreeNode<T> {
    readonly m_id: number;
    readonly aabb: b2AABB;
    private _userData;
    get userData(): T;
    set userData(value: T);
    parent: b2TreeNode<T> | null;
    child1: b2TreeNode<T> | null;
    child2: b2TreeNode<T> | null;
    height: number;
    moved: boolean;
    constructor(id?: number);
    Reset(): void;
    IsLeaf(): boolean;
}
declare class b2DynamicTree<T> {
    m_root: b2TreeNode<T> | null;
    m_freeList: b2TreeNode<T> | null;
    m_insertionCount: number;
    readonly m_stack: b2GrowableStack<b2TreeNode<T> | null>;
    static readonly s_r: b2Vec2;
    static readonly s_v: b2Vec2;
    static readonly s_abs_v: b2Vec2;
    static readonly s_segmentAABB: b2AABB;
    static readonly s_subInput: b2RayCastInput;
    static readonly s_combinedAABB: b2AABB;
    static readonly s_aabb: b2AABB;
    Query(callback: (node: b2TreeNode<T>) => boolean, aabb: b2AABB): void;
    Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void;
    QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void;
    RayCast(callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number, input: b2RayCastInput): void;
    RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void;
    static s_node_id: number;
    AllocateNode(): b2TreeNode<T>;
    FreeNode(node: b2TreeNode<T>): void;
    CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T>;
    DestroyProxy(node: b2TreeNode<T>): void;
    private static MoveProxy_s_fatAABB;
    private static MoveProxy_s_hugeAABB;
    MoveProxy(node: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): boolean;
    InsertLeaf(leaf: b2TreeNode<T>): void;
    RemoveLeaf(leaf: b2TreeNode<T>): void;
    Balance(A: b2TreeNode<T>): b2TreeNode<T>;
    GetHeight(): number;
    private static GetAreaNode;
    GetAreaRatio(): number;
    static ComputeHeightNode<T>(node: b2TreeNode<T> | null): number;
    ComputeHeight(): number;
    ValidateStructure(node: b2TreeNode<T> | null): void;
    ValidateMetrics(node: b2TreeNode<T> | null): void;
    Validate(): void;
    private static GetMaxBalanceNode;
    GetMaxBalance(): number;
    RebuildBottomUp(): void;
    private static ShiftOriginNode;
    ShiftOrigin(newOrigin: XY): void;
}

declare class b2Pair<T> {
    proxyA: b2TreeNode<T>;
    proxyB: b2TreeNode<T>;
    constructor(proxyA: b2TreeNode<T>, proxyB: b2TreeNode<T>);
}
declare class b2BroadPhase<T> {
    readonly m_tree: b2DynamicTree<T>;
    m_proxyCount: number;
    m_moveCount: number;
    readonly m_moveBuffer: Array<b2TreeNode<T> | null>;
    m_pairCount: number;
    readonly m_pairBuffer: Array<b2Pair<T>>;
    CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T>;
    DestroyProxy(proxy: b2TreeNode<T>): void;
    MoveProxy(proxy: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): void;
    TouchProxy(proxy: b2TreeNode<T>): void;
    GetProxyCount(): number;
    UpdatePairs(callback: (a: T, b: T) => void): void;
    Query(callback: (node: b2TreeNode<T>) => boolean, aabb: b2AABB): void;
    Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void;
    QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void;
    RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void;
    GetTreeHeight(): number;
    GetTreeBalance(): number;
    GetTreeQuality(): number;
    ShiftOrigin(newOrigin: XY): void;
    BufferMove(proxy: b2TreeNode<T>): void;
    UnBufferMove(proxy: b2TreeNode<T>): void;
}

declare let b2_toiTime: number;
declare let b2_toiMaxTime: number;
declare let b2_toiCalls: number;
declare let b2_toiIters: number;
declare let b2_toiMaxIters: number;
declare let b2_toiRootIters: number;
declare let b2_toiMaxRootIters: number;
declare function b2_toi_reset(): void;
declare class b2TOIInput {
    readonly proxyA: b2DistanceProxy;
    readonly proxyB: b2DistanceProxy;
    readonly sweepA: b2Sweep;
    readonly sweepB: b2Sweep;
    tMax: number;
}
declare enum b2TOIOutputState {
    e_unknown = 0,
    e_failed = 1,
    e_overlapped = 2,
    e_touching = 3,
    e_separated = 4
}
declare class b2TOIOutput {
    state: b2TOIOutputState;
    t: number;
}
declare enum b2SeparationFunctionType {
    e_unknown = -1,
    e_points = 0,
    e_faceA = 1,
    e_faceB = 2
}
declare class b2SeparationFunction {
    m_proxyA: b2DistanceProxy;
    m_proxyB: b2DistanceProxy;
    readonly m_sweepA: b2Sweep;
    readonly m_sweepB: b2Sweep;
    m_type: b2SeparationFunctionType;
    readonly m_localPoint: b2Vec2;
    readonly m_axis: b2Vec2;
    Initialize(cache: b2SimplexCache, proxyA: b2DistanceProxy, sweepA: b2Sweep, proxyB: b2DistanceProxy, sweepB: b2Sweep, t1: number): number;
    FindMinSeparation(indexA: [number], indexB: [number], t: number): number;
    Evaluate(indexA: number, indexB: number, t: number): number;
}
declare function b2TimeOfImpact(output: b2TOIOutput, input: b2TOIInput): void;

declare class b2CircleShape extends b2Shape {
    readonly m_p: b2Vec2;
    constructor(radius?: number);
    Set(position: XY, radius?: number): this;
    Clone(): b2CircleShape;
    Copy(other: b2CircleShape): b2CircleShape;
    GetChildCount(): number;
    private static TestPoint_s_center;
    private static TestPoint_s_d;
    TestPoint(transform: b2Transform, p: XY): boolean;
    private static RayCast_s_position;
    private static RayCast_s_s;
    private static RayCast_s_r;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, transform: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_p;
    ComputeAABB(aabb: b2AABB, transform: b2Transform, childIndex: number): void;
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

declare class b2PolygonShape extends b2Shape {
    readonly m_centroid: b2Vec2;
    m_vertices: b2Vec2[];
    m_normals: b2Vec2[];
    m_count: number;
    constructor();
    Clone(): b2PolygonShape;
    Copy(other: b2PolygonShape): b2PolygonShape;
    GetChildCount(): number;
    private static Set_s_r;
    private static Set_s_v;
    Set(vertices: XY[]): b2PolygonShape;
    Set(vertices: XY[], count: number): b2PolygonShape;
    Set(vertices: number[]): b2PolygonShape;
    _Set(vertices: (index: number) => XY, count: number): b2PolygonShape;
    SetAsBox(hx: number, hy: number, center?: XY, angle?: number): b2PolygonShape;
    private static TestPoint_s_pLocal;
    TestPoint(xf: b2Transform, p: XY): boolean;
    private static RayCast_s_p1;
    private static RayCast_s_p2;
    private static RayCast_s_d;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_v;
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    private static ComputeMass_s_center;
    private static ComputeMass_s_s;
    private static ComputeMass_s_e1;
    private static ComputeMass_s_e2;
    ComputeMass(massData: b2MassData, density: number): void;
    private static Validate_s_e;
    private static Validate_s_v;
    Validate(): boolean;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    private static ComputeSubmergedArea_s_normalL;
    private static ComputeSubmergedArea_s_md;
    private static ComputeSubmergedArea_s_intoVec;
    private static ComputeSubmergedArea_s_outoVec;
    private static ComputeSubmergedArea_s_center;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static ComputeCentroid_s_s;
    private static ComputeCentroid_s_p1;
    private static ComputeCentroid_s_p2;
    private static ComputeCentroid_s_p3;
    private static ComputeCentroid_s_e1;
    private static ComputeCentroid_s_e2;
    static ComputeCentroid(vs: b2Vec2[], count: number, out: b2Vec2): b2Vec2;
}

declare function b2CollideCircles(manifold: b2Manifold, circleA: b2CircleShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void;
declare function b2CollidePolygonAndCircle(manifold: b2Manifold, polygonA: b2PolygonShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void;

declare function b2CollidePolygons(manifold: b2Manifold, polyA: b2PolygonShape, xfA: b2Transform, polyB: b2PolygonShape, xfB: b2Transform): void;

declare class b2EdgeShape extends b2Shape {
    readonly m_vertex1: b2Vec2;
    readonly m_vertex2: b2Vec2;
    readonly m_vertex0: b2Vec2;
    readonly m_vertex3: b2Vec2;
    m_oneSided: boolean;
    constructor();
    SetOneSided(v0: XY, v1: XY, v2: XY, v3: XY): b2EdgeShape;
    SetTwoSided(v1: XY, v2: XY): b2EdgeShape;
    Clone(): b2EdgeShape;
    Copy(other: b2EdgeShape): b2EdgeShape;
    GetChildCount(): number;
    TestPoint(xf: b2Transform, p: XY): boolean;
    private static RayCast_s_p1;
    private static RayCast_s_p2;
    private static RayCast_s_d;
    private static RayCast_s_e;
    private static RayCast_s_q;
    private static RayCast_s_r;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_v1;
    private static ComputeAABB_s_v2;
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

declare function b2CollideEdgeAndCircle(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void;
declare function b2CollideEdgeAndPolygon(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, polygonB: b2PolygonShape, xfB: b2Transform): void;

declare class b2ChainShape extends b2Shape {
    m_vertices: b2Vec2[];
    m_count: number;
    readonly m_prevVertex: b2Vec2;
    readonly m_nextVertex: b2Vec2;
    constructor();
    CreateLoop(vertices: XY[]): b2ChainShape;
    CreateLoop(vertices: XY[], count: number): b2ChainShape;
    CreateLoop(vertices: number[]): b2ChainShape;
    private _CreateLoop;
    CreateChain(vertices: XY[], prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;
    CreateChain(vertices: XY[], count: number, prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;
    CreateChain(vertices: number[], prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;
    private _CreateChain;
    Clone(): b2ChainShape;
    Copy(other: b2ChainShape): b2ChainShape;
    GetChildCount(): number;
    GetChildEdge(edge: b2EdgeShape, index: number): void;
    TestPoint(xf: b2Transform, p: XY): boolean;
    private static RayCast_s_edgeShape;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_v1;
    private static ComputeAABB_s_v2;
    private static ComputeAABB_s_lower;
    private static ComputeAABB_s_upper;
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

declare class b2Profile {
    step: number;
    collide: number;
    solve: number;
    solveInit: number;
    solveVelocity: number;
    solvePosition: number;
    broadphase: number;
    solveTOI: number;
    Reset(): this;
}
declare class b2TimeStep {
    dt: number;
    inv_dt: number;
    dtRatio: number;
    velocityIterations: number;
    positionIterations: number;
    warmStarting: boolean;
    Copy(step: b2TimeStep): b2TimeStep;
}
declare class b2Position {
    readonly c: b2Vec2;
    a: number;
    static MakeArray(length: number): b2Position[];
}
declare class b2Velocity {
    readonly v: b2Vec2;
    w: number;
    static MakeArray(length: number): b2Velocity[];
}
declare class b2SolverData {
    readonly step: b2TimeStep;
    positions: b2Position[];
    velocities: b2Velocity[];
}

declare enum b2JointType {
    e_unknownJoint = 0,
    e_revoluteJoint = 1,
    e_prismaticJoint = 2,
    e_distanceJoint = 3,
    e_pulleyJoint = 4,
    e_mouseJoint = 5,
    e_gearJoint = 6,
    e_wheelJoint = 7,
    e_weldJoint = 8,
    e_frictionJoint = 9,
    e_ropeJoint = 10,
    e_motorJoint = 11,
    e_areaJoint = 12
}
declare class b2Jacobian {
    readonly linear: b2Vec2;
    angularA: number;
    angularB: number;
    SetZero(): b2Jacobian;
    Set(x: XY, a1: number, a2: number): b2Jacobian;
}
declare class b2JointEdge {
    private _other;
    get other(): b2Body;
    set other(value: b2Body);
    readonly joint: b2Joint;
    prev: b2JointEdge | null;
    next: b2JointEdge | null;
    constructor(joint: b2Joint);
    Reset(): void;
}
interface b2IJointDef {
    type: b2JointType;
    userData?: any;
    bodyA: b2Body;
    bodyB: b2Body;
    collideConnected?: boolean;
}
declare abstract class b2JointDef implements b2IJointDef {
    readonly type: b2JointType;
    userData: any;
    bodyA: b2Body;
    bodyB: b2Body;
    collideConnected: boolean;
    constructor(type: b2JointType);
}
declare function b2LinearStiffness(def: {
    stiffness: number;
    damping: number;
}, frequencyHertz: number, dampingRatio: number, bodyA: b2Body, bodyB: b2Body): void;
declare function b2AngularStiffness(def: {
    stiffness: number;
    damping: number;
}, frequencyHertz: number, dampingRatio: number, bodyA: b2Body, bodyB: b2Body): void;
declare abstract class b2Joint {
    readonly m_type: b2JointType;
    m_prev: b2Joint | null;
    m_next: b2Joint | null;
    readonly m_edgeA: b2JointEdge;
    readonly m_edgeB: b2JointEdge;
    m_bodyA: b2Body;
    m_bodyB: b2Body;
    m_index: number;
    m_islandFlag: boolean;
    m_collideConnected: boolean;
    m_userData: any;
    constructor(def: b2IJointDef);
    GetType(): b2JointType;
    GetBodyA(): b2Body;
    GetBodyB(): b2Body;
    abstract GetAnchorA<T extends XY>(out: T): T;
    abstract GetAnchorB<T extends XY>(out: T): T;
    abstract GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    abstract GetReactionTorque(inv_dt: number): number;
    GetNext(): b2Joint | null;
    GetUserData(): any;
    SetUserData(data: any): void;
    IsEnabled(): boolean;
    GetCollideConnected(): boolean;
    Dump(log: (format: string, ...args: any[]) => void): void;
    ShiftOrigin(newOrigin: XY): void;
    private static Draw_s_p1;
    private static Draw_s_p2;
    private static Draw_s_color;
    private static Draw_s_c;
    Draw(draw: b2Draw): void;
    abstract InitVelocityConstraints(data: b2SolverData): void;
    abstract SolveVelocityConstraints(data: b2SolverData): void;
    abstract SolvePositionConstraints(data: b2SolverData): boolean;
}

declare class b2DestructionListener {
    SayGoodbyeJoint(joint: b2Joint): void;
    SayGoodbyeFixture(fixture: b2Fixture): void;
}
declare class b2ContactFilter {
    ShouldCollide(fixtureA: b2Fixture, fixtureB: b2Fixture): boolean;
    static readonly b2_defaultFilter: b2ContactFilter;
}
declare class b2ContactImpulse {
    normalImpulses: number[];
    tangentImpulses: number[];
    count: number;
}
declare class b2ContactListener {
    BeginContact(contact: b2Contact): void;
    EndContact(contact: b2Contact): void;
    PreSolve(contact: b2Contact, oldManifold: b2Manifold): void;
    PostSolve(contact: b2Contact, impulse: b2ContactImpulse): void;
    static readonly b2_defaultListener: b2ContactListener;
}
declare class b2QueryCallback {
    ReportFixture(fixture: b2Fixture): boolean;
}
declare type b2QueryCallbackFunction = (fixture: b2Fixture) => boolean;
declare class b2RayCastCallback {
    ReportFixture(fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number;
}
declare type b2RayCastCallbackFunction = (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number) => number;

declare function b2MixFriction(friction1: number, friction2: number): number;
declare function b2MixRestitution(restitution1: number, restitution2: number): number;
declare function b2MixRestitutionThreshold(threshold1: number, threshold2: number): number;
declare class b2ContactEdge {
    private _other;
    get other(): b2Body;
    set other(value: b2Body);
    readonly contact: b2Contact;
    prev: b2ContactEdge | null;
    next: b2ContactEdge | null;
    constructor(contact: b2Contact);
    Reset(): void;
}
declare abstract class b2Contact<A extends b2Shape = b2Shape, B extends b2Shape = b2Shape> {
    m_islandFlag: boolean;
    m_touchingFlag: boolean;
    m_enabledFlag: boolean;
    m_filterFlag: boolean;
    m_bulletHitFlag: boolean;
    m_toiFlag: boolean;
    m_prev: b2Contact | null;
    m_next: b2Contact | null;
    readonly m_nodeA: b2ContactEdge;
    readonly m_nodeB: b2ContactEdge;
    m_fixtureA: b2Fixture;
    m_fixtureB: b2Fixture;
    m_indexA: number;
    m_indexB: number;
    m_manifold: b2Manifold;
    m_toiCount: number;
    m_toi: number;
    m_friction: number;
    m_restitution: number;
    m_restitutionThreshold: number;
    m_tangentSpeed: number;
    m_oldManifold: b2Manifold;
    GetManifold(): b2Manifold;
    GetWorldManifold(worldManifold: b2WorldManifold): void;
    IsTouching(): boolean;
    SetEnabled(flag: boolean): void;
    IsEnabled(): boolean;
    GetNext(): b2Contact | null;
    GetFixtureA(): b2Fixture;
    GetChildIndexA(): number;
    GetShapeA(): A;
    GetFixtureB(): b2Fixture;
    GetChildIndexB(): number;
    GetShapeB(): B;
    abstract Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
    FlagForFiltering(): void;
    SetFriction(friction: number): void;
    GetFriction(): number;
    ResetFriction(): void;
    SetRestitution(restitution: number): void;
    GetRestitution(): number;
    ResetRestitution(): void;
    SetRestitutionThreshold(threshold: number): void;
    GetRestitutionThreshold(): number;
    ResetRestitutionThreshold(): void;
    SetTangentSpeed(speed: number): void;
    GetTangentSpeed(): number;
    Reset(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): void;
    Update(listener: b2ContactListener): void;
    private static ComputeTOI_s_input;
    private static ComputeTOI_s_output;
    ComputeTOI(sweepA: b2Sweep, sweepB: b2Sweep): number;
}

interface b2IDistanceJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    length?: number;
    minLength?: number;
    maxLength?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2DistanceJointDef extends b2JointDef implements b2IDistanceJointDef {
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    length: number;
    minLength: number;
    maxLength: number;
    stiffness: number;
    damping: number;
    constructor();
    Initialize(b1: b2Body, b2: b2Body, anchor1: XY, anchor2: XY): void;
}
declare class b2DistanceJoint extends b2Joint {
    m_stiffness: number;
    m_damping: number;
    m_bias: number;
    m_length: number;
    m_minLength: number;
    m_maxLength: number;
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    m_gamma: number;
    m_impulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_u: b2Vec2;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_currentLength: number;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    m_softMass: number;
    m_mass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    constructor(def: b2IDistanceJointDef);
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    SetLength(length: number): number;
    GetLength(): number;
    SetMinLength(minLength: number): number;
    SetMaxLength(maxLength: number): number;
    GetCurrentLength(): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_vpA;
    private static SolveVelocityConstraints_s_vpB;
    private static SolveVelocityConstraints_s_P;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(data: b2SolverData): boolean;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_axis;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_pRest;
    private static Draw_s_pMin;
    private static Draw_s_pMax;
    Draw(draw: b2Draw): void;
}

interface b2IAreaJointDef extends b2IJointDef {
    bodies: b2Body[];
    stiffness?: number;
    damping?: number;
}
declare class b2AreaJointDef extends b2JointDef implements b2IAreaJointDef {
    bodies: b2Body[];
    stiffness: number;
    damping: number;
    constructor();
    AddBody(body: b2Body): void;
}
declare class b2AreaJoint extends b2Joint {
    m_bodies: b2Body[];
    m_stiffness: number;
    m_damping: number;
    m_impulse: number;
    readonly m_targetLengths: number[];
    m_targetArea: number;
    readonly m_normals: b2Vec2[];
    readonly m_joints: b2DistanceJoint[];
    readonly m_deltas: b2Vec2[];
    readonly m_delta: b2Vec2;
    constructor(def: b2IAreaJointDef);
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    InitVelocityConstraints(data: b2SolverData): void;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
}

interface b2IFrictionJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    maxForce?: number;
    maxTorque?: number;
}
declare class b2FrictionJointDef extends b2JointDef implements b2IFrictionJointDef {
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    maxForce: number;
    maxTorque: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2): void;
}
declare class b2FrictionJoint extends b2Joint {
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    readonly m_linearImpulse: b2Vec2;
    m_angularImpulse: number;
    m_maxForce: number;
    m_maxTorque: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    readonly m_linearMass: b2Mat22;
    m_angularMass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    readonly m_K: b2Mat22;
    constructor(def: b2IFrictionJointDef);
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot_v2;
    private static SolveVelocityConstraints_s_impulseV;
    private static SolveVelocityConstraints_s_oldImpulseV;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    SetMaxForce(force: number): void;
    GetMaxForce(): number;
    SetMaxTorque(torque: number): void;
    GetMaxTorque(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IPrismaticJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    localAxisA?: XY;
    referenceAngle?: number;
    enableLimit?: boolean;
    lowerTranslation?: number;
    upperTranslation?: number;
    enableMotor?: boolean;
    maxMotorForce?: number;
    motorSpeed?: number;
}
declare class b2PrismaticJointDef extends b2JointDef implements b2IPrismaticJointDef {
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    readonly localAxisA: b2Vec2;
    referenceAngle: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    enableMotor: boolean;
    maxMotorForce: number;
    motorSpeed: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2, axis: b2Vec2): void;
}
declare class b2PrismaticJoint extends b2Joint {
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    readonly m_localXAxisA: b2Vec2;
    readonly m_localYAxisA: b2Vec2;
    m_referenceAngle: number;
    readonly m_impulse: b2Vec2;
    m_motorImpulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_lowerTranslation: number;
    m_upperTranslation: number;
    m_maxMotorForce: number;
    m_motorSpeed: number;
    m_enableLimit: boolean;
    m_enableMotor: boolean;
    m_indexA: number;
    m_indexB: number;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    readonly m_axis: b2Vec2;
    readonly m_perp: b2Vec2;
    m_s1: number;
    m_s2: number;
    m_a1: number;
    m_a2: number;
    readonly m_K: b2Mat22;
    readonly m_K3: b2Mat33;
    readonly m_K2: b2Mat22;
    m_translation: number;
    m_axialMass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    constructor(def: b2IPrismaticJointDef);
    private static InitVelocityConstraints_s_d;
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_P;
    private static SolveVelocityConstraints_s_df;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_d;
    private static SolvePositionConstraints_s_impulse;
    private static SolvePositionConstraints_s_impulse1;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetLocalAxisA(): Readonly<b2Vec2>;
    GetReferenceAngle(): number;
    private static GetJointTranslation_s_pA;
    private static GetJointTranslation_s_pB;
    private static GetJointTranslation_s_d;
    private static GetJointTranslation_s_axis;
    GetJointTranslation(): number;
    GetJointSpeed(): number;
    IsLimitEnabled(): boolean;
    EnableLimit(flag: boolean): void;
    GetLowerLimit(): number;
    GetUpperLimit(): number;
    SetLimits(lower: number, upper: number): void;
    IsMotorEnabled(): boolean;
    EnableMotor(flag: boolean): void;
    SetMotorSpeed(speed: number): void;
    GetMotorSpeed(): number;
    SetMaxMotorForce(force: number): void;
    GetMaxMotorForce(): number;
    GetMotorForce(inv_dt: number): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_axis;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_c5;
    private static Draw_s_lower;
    private static Draw_s_upper;
    private static Draw_s_perp;
    Draw(draw: b2Draw): void;
}

interface b2IRevoluteJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    referenceAngle?: number;
    enableLimit?: boolean;
    lowerAngle?: number;
    upperAngle?: number;
    enableMotor?: boolean;
    motorSpeed?: number;
    maxMotorTorque?: number;
}
declare class b2RevoluteJointDef extends b2JointDef implements b2IRevoluteJointDef {
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    referenceAngle: number;
    enableLimit: boolean;
    lowerAngle: number;
    upperAngle: number;
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: XY): void;
}
declare class b2RevoluteJoint extends b2Joint {
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    readonly m_impulse: b2Vec2;
    m_motorImpulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_enableMotor: boolean;
    m_maxMotorTorque: number;
    m_motorSpeed: number;
    m_enableLimit: boolean;
    m_referenceAngle: number;
    m_lowerAngle: number;
    m_upperAngle: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    readonly m_K: b2Mat22;
    m_angle: number;
    m_axialMass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    constructor(def: b2IRevoluteJointDef);
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot_v2;
    private static SolveVelocityConstraints_s_impulse_v2;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_C_v2;
    private static SolvePositionConstraints_s_impulse;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetReferenceAngle(): number;
    GetJointAngle(): number;
    GetJointSpeed(): number;
    IsMotorEnabled(): boolean;
    EnableMotor(flag: boolean): void;
    GetMotorTorque(inv_dt: number): number;
    GetMotorSpeed(): number;
    SetMaxMotorTorque(torque: number): void;
    GetMaxMotorTorque(): number;
    IsLimitEnabled(): boolean;
    EnableLimit(flag: boolean): void;
    GetLowerLimit(): number;
    GetUpperLimit(): number;
    SetLimits(lower: number, upper: number): void;
    SetMotorSpeed(speed: number): void;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_c5;
    private static Draw_s_color_;
    private static Draw_s_r;
    private static Draw_s_rlo;
    private static Draw_s_rhi;
    Draw(draw: b2Draw): void;
}

interface b2IGearJointDef extends b2IJointDef {
    joint1: b2RevoluteJoint | b2PrismaticJoint;
    joint2: b2RevoluteJoint | b2PrismaticJoint;
    ratio?: number;
}
declare class b2GearJointDef extends b2JointDef implements b2IGearJointDef {
    joint1: b2RevoluteJoint | b2PrismaticJoint;
    joint2: b2RevoluteJoint | b2PrismaticJoint;
    ratio: number;
    constructor();
}
declare class b2GearJoint extends b2Joint {
    m_joint1: b2RevoluteJoint | b2PrismaticJoint;
    m_joint2: b2RevoluteJoint | b2PrismaticJoint;
    m_typeA: b2JointType;
    m_typeB: b2JointType;
    m_bodyC: b2Body;
    m_bodyD: b2Body;
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    readonly m_localAnchorC: b2Vec2;
    readonly m_localAnchorD: b2Vec2;
    readonly m_localAxisC: b2Vec2;
    readonly m_localAxisD: b2Vec2;
    m_referenceAngleA: number;
    m_referenceAngleB: number;
    m_constant: number;
    m_ratio: number;
    m_impulse: number;
    m_indexA: number;
    m_indexB: number;
    m_indexC: number;
    m_indexD: number;
    readonly m_lcA: b2Vec2;
    readonly m_lcB: b2Vec2;
    readonly m_lcC: b2Vec2;
    readonly m_lcD: b2Vec2;
    m_mA: number;
    m_mB: number;
    m_mC: number;
    m_mD: number;
    m_iA: number;
    m_iB: number;
    m_iC: number;
    m_iD: number;
    readonly m_JvAC: b2Vec2;
    readonly m_JvBD: b2Vec2;
    m_JwA: number;
    m_JwB: number;
    m_JwC: number;
    m_JwD: number;
    m_mass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_qC: b2Rot;
    readonly m_qD: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    readonly m_lalcC: b2Vec2;
    readonly m_lalcD: b2Vec2;
    constructor(def: b2IGearJointDef);
    private static InitVelocityConstraints_s_u;
    private static InitVelocityConstraints_s_rA;
    private static InitVelocityConstraints_s_rB;
    private static InitVelocityConstraints_s_rC;
    private static InitVelocityConstraints_s_rD;
    InitVelocityConstraints(data: b2SolverData): void;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_u;
    private static SolvePositionConstraints_s_rA;
    private static SolvePositionConstraints_s_rB;
    private static SolvePositionConstraints_s_rC;
    private static SolvePositionConstraints_s_rD;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetJoint1(): b2PrismaticJoint | b2RevoluteJoint;
    GetJoint2(): b2PrismaticJoint | b2RevoluteJoint;
    GetRatio(): number;
    SetRatio(ratio: number): void;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IMotorJointDef extends b2IJointDef {
    linearOffset?: XY;
    angularOffset?: number;
    maxForce?: number;
    maxTorque?: number;
    correctionFactor?: number;
}
declare class b2MotorJointDef extends b2JointDef implements b2IMotorJointDef {
    readonly linearOffset: b2Vec2;
    angularOffset: number;
    maxForce: number;
    maxTorque: number;
    correctionFactor: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body): void;
}
declare class b2MotorJoint extends b2Joint {
    readonly m_linearOffset: b2Vec2;
    m_angularOffset: number;
    readonly m_linearImpulse: b2Vec2;
    m_angularImpulse: number;
    m_maxForce: number;
    m_maxTorque: number;
    m_correctionFactor: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    readonly m_linearError: b2Vec2;
    m_angularError: number;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    readonly m_linearMass: b2Mat22;
    m_angularMass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_K: b2Mat22;
    constructor(def: b2IMotorJointDef);
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    SetLinearOffset(linearOffset: b2Vec2): void;
    GetLinearOffset(): b2Vec2;
    SetAngularOffset(angularOffset: number): void;
    GetAngularOffset(): number;
    SetMaxForce(force: number): void;
    GetMaxForce(): number;
    SetMaxTorque(torque: number): void;
    GetMaxTorque(): number;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot_v2;
    private static SolveVelocityConstraints_s_impulse_v2;
    private static SolveVelocityConstraints_s_oldImpulse_v2;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IMouseJointDef extends b2IJointDef {
    target?: XY;
    maxForce?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2MouseJointDef extends b2JointDef implements b2IMouseJointDef {
    readonly target: b2Vec2;
    maxForce: number;
    stiffness: number;
    damping: number;
    constructor();
}
declare class b2MouseJoint extends b2Joint {
    readonly m_localAnchorB: b2Vec2;
    readonly m_targetA: b2Vec2;
    m_stiffness: number;
    m_damping: number;
    m_beta: number;
    readonly m_impulse: b2Vec2;
    m_maxForce: number;
    m_gamma: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_rB: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassB: number;
    m_invIB: number;
    readonly m_mass: b2Mat22;
    readonly m_C: b2Vec2;
    readonly m_qB: b2Rot;
    readonly m_lalcB: b2Vec2;
    readonly m_K: b2Mat22;
    constructor(def: b2IMouseJointDef);
    SetTarget(target: b2Vec2): void;
    GetTarget(): b2Vec2;
    SetMaxForce(maxForce: number): void;
    GetMaxForce(): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot;
    private static SolveVelocityConstraints_s_impulse;
    private static SolveVelocityConstraints_s_oldImpulse;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    ShiftOrigin(newOrigin: b2Vec2): void;
}

declare const b2_minPulleyLength: number;
interface b2IPulleyJointDef extends b2IJointDef {
    groundAnchorA?: XY;
    groundAnchorB?: XY;
    localAnchorA?: XY;
    localAnchorB?: XY;
    lengthA?: number;
    lengthB?: number;
    ratio?: number;
}
declare class b2PulleyJointDef extends b2JointDef implements b2IPulleyJointDef {
    readonly groundAnchorA: b2Vec2;
    readonly groundAnchorB: b2Vec2;
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    lengthA: number;
    lengthB: number;
    ratio: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, groundA: b2Vec2, groundB: b2Vec2, anchorA: b2Vec2, anchorB: b2Vec2, r: number): void;
}
declare class b2PulleyJoint extends b2Joint {
    readonly m_groundAnchorA: b2Vec2;
    readonly m_groundAnchorB: b2Vec2;
    m_lengthA: number;
    m_lengthB: number;
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    m_constant: number;
    m_ratio: number;
    m_impulse: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_uA: b2Vec2;
    readonly m_uB: b2Vec2;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    m_mass: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    constructor(def: b2IPulleyJointDef);
    private static InitVelocityConstraints_s_PA;
    private static InitVelocityConstraints_s_PB;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_vpA;
    private static SolveVelocityConstraints_s_vpB;
    private static SolveVelocityConstraints_s_PA;
    private static SolveVelocityConstraints_s_PB;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_PA;
    private static SolvePositionConstraints_s_PB;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetGroundAnchorA(): b2Vec2;
    GetGroundAnchorB(): b2Vec2;
    GetLengthA(): number;
    GetLengthB(): number;
    GetRatio(): number;
    private static GetCurrentLengthA_s_p;
    GetCurrentLengthA(): number;
    private static GetCurrentLengthB_s_p;
    GetCurrentLengthB(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    ShiftOrigin(newOrigin: b2Vec2): void;
}

interface b2IWeldJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    referenceAngle?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2WeldJointDef extends b2JointDef implements b2IWeldJointDef {
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    referenceAngle: number;
    stiffness: number;
    damping: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2): void;
}
declare class b2WeldJoint extends b2Joint {
    m_stiffness: number;
    m_damping: number;
    m_bias: number;
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    m_referenceAngle: number;
    m_gamma: number;
    readonly m_impulse: b2Vec3;
    m_indexA: number;
    m_indexB: number;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    readonly m_mass: b2Mat33;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    readonly m_K: b2Mat33;
    constructor(def: b2IWeldJointDef);
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot1;
    private static SolveVelocityConstraints_s_impulse1;
    private static SolveVelocityConstraints_s_impulse;
    private static SolveVelocityConstraints_s_P;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_C1;
    private static SolvePositionConstraints_s_P;
    private static SolvePositionConstraints_s_impulse;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetReferenceAngle(): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IWheelJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    localAxisA?: XY;
    enableLimit?: boolean;
    lowerTranslation?: number;
    upperTranslation?: number;
    enableMotor?: boolean;
    maxMotorTorque?: number;
    motorSpeed?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2WheelJointDef extends b2JointDef implements b2IWheelJointDef {
    readonly localAnchorA: b2Vec2;
    readonly localAnchorB: b2Vec2;
    readonly localAxisA: b2Vec2;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    enableMotor: boolean;
    maxMotorTorque: number;
    motorSpeed: number;
    stiffness: number;
    damping: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2, axis: b2Vec2): void;
}
declare class b2WheelJoint extends b2Joint {
    readonly m_localAnchorA: b2Vec2;
    readonly m_localAnchorB: b2Vec2;
    readonly m_localXAxisA: b2Vec2;
    readonly m_localYAxisA: b2Vec2;
    m_impulse: number;
    m_motorImpulse: number;
    m_springImpulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_translation: number;
    m_lowerTranslation: number;
    m_upperTranslation: number;
    m_maxMotorTorque: number;
    m_motorSpeed: number;
    m_enableLimit: boolean;
    m_enableMotor: boolean;
    m_stiffness: number;
    m_damping: number;
    m_indexA: number;
    m_indexB: number;
    readonly m_localCenterA: b2Vec2;
    readonly m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    readonly m_ax: b2Vec2;
    readonly m_ay: b2Vec2;
    m_sAx: number;
    m_sBx: number;
    m_sAy: number;
    m_sBy: number;
    m_mass: number;
    m_motorMass: number;
    m_axialMass: number;
    m_springMass: number;
    m_bias: number;
    m_gamma: number;
    readonly m_qA: b2Rot;
    readonly m_qB: b2Rot;
    readonly m_lalcA: b2Vec2;
    readonly m_lalcB: b2Vec2;
    readonly m_rA: b2Vec2;
    readonly m_rB: b2Vec2;
    constructor(def: b2IWheelJointDef);
    GetMotorSpeed(): number;
    GetMaxMotorTorque(): number;
    SetStiffness(hz: number): void;
    GetStiffness(): number;
    SetDamping(ratio: number): void;
    GetDamping(): number;
    private static InitVelocityConstraints_s_d;
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_P;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_d;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetDefinition(def: b2WheelJointDef): b2WheelJointDef;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetLocalAxisA(): Readonly<b2Vec2>;
    GetJointTranslation(): number;
    GetJointLinearSpeed(): number;
    GetJointAngle(): number;
    GetJointAngularSpeed(): number;
    GetPrismaticJointTranslation(): number;
    GetPrismaticJointSpeed(): number;
    GetRevoluteJointAngle(): number;
    GetRevoluteJointSpeed(): number;
    IsMotorEnabled(): boolean;
    EnableMotor(flag: boolean): void;
    SetMotorSpeed(speed: number): void;
    SetMaxMotorTorque(force: number): void;
    GetMotorTorque(inv_dt: number): number;
    IsLimitEnabled(): boolean;
    EnableLimit(flag: boolean): void;
    GetLowerLimit(): number;
    GetUpperLimit(): number;
    SetLimits(lower: number, upper: number): void;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_axis;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_c5;
    private static Draw_s_lower;
    private static Draw_s_upper;
    private static Draw_s_perp;
    Draw(draw: b2Draw): void;
}

declare class b2ContactRegister {
    pool: b2Contact[];
    createFcn: (() => b2Contact) | null;
    destroyFcn: ((contact: b2Contact) => void) | null;
    primary: boolean;
}
declare class b2ContactFactory {
    readonly m_registers: b2ContactRegister[][];
    constructor();
    private AddType;
    private InitializeRegisters;
    Create(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): b2Contact | null;
    Destroy(contact: b2Contact): void;
}

declare class b2ContactManager {
    readonly m_broadPhase: b2BroadPhase<b2FixtureProxy>;
    m_contactList: b2Contact | null;
    m_contactCount: number;
    m_contactFilter: b2ContactFilter;
    m_contactListener: b2ContactListener;
    readonly m_contactFactory: b2ContactFactory;
    AddPair(proxyA: b2FixtureProxy, proxyB: b2FixtureProxy): void;
    FindNewContacts(): void;
    Destroy(c: b2Contact): void;
    Collide(): void;
}

declare let g_blockSolve: boolean;
declare function get_g_blockSolve(): boolean;
declare function set_g_blockSolve(value: boolean): void;
declare class b2VelocityConstraintPoint {
    readonly rA: b2Vec2;
    readonly rB: b2Vec2;
    normalImpulse: number;
    tangentImpulse: number;
    normalMass: number;
    tangentMass: number;
    velocityBias: number;
    static MakeArray(length: number): b2VelocityConstraintPoint[];
}
declare class b2ContactVelocityConstraint {
    readonly points: b2VelocityConstraintPoint[];
    readonly normal: b2Vec2;
    readonly tangent: b2Vec2;
    readonly normalMass: b2Mat22;
    readonly K: b2Mat22;
    indexA: number;
    indexB: number;
    invMassA: number;
    invMassB: number;
    invIA: number;
    invIB: number;
    friction: number;
    restitution: number;
    threshold: number;
    tangentSpeed: number;
    pointCount: number;
    contactIndex: number;
    static MakeArray(length: number): b2ContactVelocityConstraint[];
}
declare class b2ContactPositionConstraint {
    readonly localPoints: b2Vec2[];
    readonly localNormal: b2Vec2;
    readonly localPoint: b2Vec2;
    indexA: number;
    indexB: number;
    invMassA: number;
    invMassB: number;
    readonly localCenterA: b2Vec2;
    readonly localCenterB: b2Vec2;
    invIA: number;
    invIB: number;
    type: b2ManifoldType;
    radiusA: number;
    radiusB: number;
    pointCount: number;
    static MakeArray(length: number): b2ContactPositionConstraint[];
}
declare class b2ContactSolverDef {
    readonly step: b2TimeStep;
    contacts: b2Contact[];
    count: number;
    positions: b2Position[];
    velocities: b2Velocity[];
}
declare class b2PositionSolverManifold {
    readonly normal: b2Vec2;
    readonly point: b2Vec2;
    separation: number;
    private static Initialize_s_pointA;
    private static Initialize_s_pointB;
    private static Initialize_s_planePoint;
    private static Initialize_s_clipPoint;
    Initialize(pc: b2ContactPositionConstraint, xfA: b2Transform, xfB: b2Transform, index: number): void;
}
declare class b2ContactSolver {
    readonly m_step: b2TimeStep;
    m_positions: b2Position[];
    m_velocities: b2Velocity[];
    readonly m_positionConstraints: b2ContactPositionConstraint[];
    readonly m_velocityConstraints: b2ContactVelocityConstraint[];
    m_contacts: b2Contact[];
    m_count: number;
    Initialize(def: b2ContactSolverDef): b2ContactSolver;
    private static InitializeVelocityConstraints_s_xfA;
    private static InitializeVelocityConstraints_s_xfB;
    private static InitializeVelocityConstraints_s_worldManifold;
    InitializeVelocityConstraints(): void;
    private static WarmStart_s_P;
    WarmStart(): void;
    private static SolveVelocityConstraints_s_dv;
    private static SolveVelocityConstraints_s_dv1;
    private static SolveVelocityConstraints_s_dv2;
    private static SolveVelocityConstraints_s_P;
    private static SolveVelocityConstraints_s_a;
    private static SolveVelocityConstraints_s_b;
    private static SolveVelocityConstraints_s_x;
    private static SolveVelocityConstraints_s_d;
    private static SolveVelocityConstraints_s_P1;
    private static SolveVelocityConstraints_s_P2;
    private static SolveVelocityConstraints_s_P1P2;
    SolveVelocityConstraints(): void;
    StoreImpulses(): void;
    private static SolvePositionConstraints_s_xfA;
    private static SolvePositionConstraints_s_xfB;
    private static SolvePositionConstraints_s_psm;
    private static SolvePositionConstraints_s_rA;
    private static SolvePositionConstraints_s_rB;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(): boolean;
    private static SolveTOIPositionConstraints_s_xfA;
    private static SolveTOIPositionConstraints_s_xfB;
    private static SolveTOIPositionConstraints_s_psm;
    private static SolveTOIPositionConstraints_s_rA;
    private static SolveTOIPositionConstraints_s_rB;
    private static SolveTOIPositionConstraints_s_P;
    SolveTOIPositionConstraints(toiIndexA: number, toiIndexB: number): boolean;
}

declare class b2Island {
    m_listener: b2ContactListener;
    readonly m_bodies: b2Body[];
    readonly m_contacts: b2Contact[];
    readonly m_joints: b2Joint[];
    readonly m_positions: b2Position[];
    readonly m_velocities: b2Velocity[];
    m_bodyCount: number;
    m_jointCount: number;
    m_contactCount: number;
    m_bodyCapacity: number;
    m_contactCapacity: number;
    m_jointCapacity: number;
    Initialize(bodyCapacity: number, contactCapacity: number, jointCapacity: number, listener: b2ContactListener): void;
    Clear(): void;
    AddBody(body: b2Body): void;
    AddContact(contact: b2Contact): void;
    AddJoint(joint: b2Joint): void;
    private static s_timer;
    private static s_solverData;
    private static s_contactSolverDef;
    private static s_contactSolver;
    private static s_translation;
    Solve(profile: b2Profile, step: b2TimeStep, gravity: b2Vec2, allowSleep: boolean): void;
    SolveTOI(subStep: b2TimeStep, toiIndexA: number, toiIndexB: number): void;
    private static s_impulse;
    Report(constraints: b2ContactVelocityConstraint[]): void;
}

declare class b2World {
    readonly m_contactManager: b2ContactManager;
    m_bodyList: b2Body | null;
    m_jointList: b2Joint | null;
    m_bodyCount: number;
    m_jointCount: number;
    readonly m_gravity: b2Vec2;
    m_allowSleep: boolean;
    m_destructionListener: b2DestructionListener | null;
    m_debugDraw: b2Draw | null;
    m_inv_dt0: number;
    m_newContacts: boolean;
    m_locked: boolean;
    m_clearForces: boolean;
    m_warmStarting: boolean;
    m_continuousPhysics: boolean;
    m_subStepping: boolean;
    m_stepComplete: boolean;
    readonly m_profile: b2Profile;
    readonly m_island: b2Island;
    readonly s_stack: Array<b2Body | null>;
    constructor(gravity: XY);
    SetDestructionListener(listener: b2DestructionListener | null): void;
    SetContactFilter(filter: b2ContactFilter): void;
    SetContactListener(listener: b2ContactListener): void;
    SetDebugDraw(debugDraw: b2Draw | null): void;
    CreateBody(def?: b2IBodyDef): b2Body;
    DestroyBody(b: b2Body): void;
    private static _Joint_Create;
    private static _Joint_Destroy;
    CreateJoint(def: b2IAreaJointDef): b2AreaJoint;
    CreateJoint(def: b2IDistanceJointDef): b2DistanceJoint;
    CreateJoint(def: b2IFrictionJointDef): b2FrictionJoint;
    CreateJoint(def: b2IGearJointDef): b2GearJoint;
    CreateJoint(def: b2IMotorJointDef): b2MotorJoint;
    CreateJoint(def: b2IMouseJointDef): b2MouseJoint;
    CreateJoint(def: b2IPrismaticJointDef): b2PrismaticJoint;
    CreateJoint(def: b2IPulleyJointDef): b2PulleyJoint;
    CreateJoint(def: b2IRevoluteJointDef): b2RevoluteJoint;
    CreateJoint(def: b2IWeldJointDef): b2WeldJoint;
    CreateJoint(def: b2IWheelJointDef): b2WheelJoint;
    DestroyJoint(j: b2Joint): void;
    private static Step_s_step;
    private static Step_s_stepTimer;
    private static Step_s_timer;
    Step(dt: number, velocityIterations: number, positionIterations: number): void;
    ClearForces(): void;
    private static DebugDraw_s_color;
    private static DebugDraw_s_vs;
    private static DebugDraw_s_xf;
    DebugDraw(): void;
    QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void;
    QueryAABB(aabb: b2AABB, fn: b2QueryCallbackFunction): void;
    private _QueryAABB;
    QueryAllAABB(aabb: b2AABB, out?: b2Fixture[]): b2Fixture[];
    QueryPointAABB(callback: b2QueryCallback, point: XY): void;
    QueryPointAABB(point: XY, fn: b2QueryCallbackFunction): void;
    private _QueryPointAABB;
    QueryAllPointAABB(point: XY, out?: b2Fixture[]): b2Fixture[];
    QueryFixtureShape(callback: b2QueryCallback, shape: b2Shape, index: number, transform: b2Transform): void;
    QueryFixtureShape(shape: b2Shape, index: number, transform: b2Transform, fn: b2QueryCallbackFunction): void;
    private static QueryFixtureShape_s_aabb;
    private _QueryFixtureShape;
    QueryAllFixtureShape(shape: b2Shape, index: number, transform: b2Transform, out?: b2Fixture[]): b2Fixture[];
    QueryFixturePoint(callback: b2QueryCallback, point: XY): void;
    QueryFixturePoint(point: XY, fn: b2QueryCallbackFunction): void;
    private _QueryFixturePoint;
    QueryAllFixturePoint(point: XY, out?: b2Fixture[]): b2Fixture[];
    RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void;
    RayCast(point1: XY, point2: XY, fn: b2RayCastCallbackFunction): void;
    private static RayCast_s_input;
    private static RayCast_s_output;
    private static RayCast_s_point;
    private _RayCast;
    RayCastOne(point1: XY, point2: XY): b2Fixture | null;
    RayCastAll(point1: XY, point2: XY, out?: b2Fixture[]): b2Fixture[];
    GetBodyList(): b2Body | null;
    GetJointList(): b2Joint | null;
    GetContactList(): b2Contact | null;
    SetAllowSleeping(flag: boolean): void;
    GetAllowSleeping(): boolean;
    SetWarmStarting(flag: boolean): void;
    GetWarmStarting(): boolean;
    SetContinuousPhysics(flag: boolean): void;
    GetContinuousPhysics(): boolean;
    SetSubStepping(flag: boolean): void;
    GetSubStepping(): boolean;
    GetProxyCount(): number;
    GetBodyCount(): number;
    GetJointCount(): number;
    GetContactCount(): number;
    GetTreeHeight(): number;
    GetTreeBalance(): number;
    GetTreeQuality(): number;
    SetGravity(gravity: XY, wake?: boolean): void;
    GetGravity(): Readonly<b2Vec2>;
    IsLocked(): boolean;
    SetAutoClearForces(flag: boolean): void;
    GetAutoClearForces(): boolean;
    ShiftOrigin(newOrigin: XY): void;
    GetContactManager(): b2ContactManager;
    GetProfile(): b2Profile;
    Dump(log: (format: string, ...args: any[]) => void): void;
    DrawShape(fixture: b2Fixture, color: b2Color): void;
    Solve(step: b2TimeStep): void;
    private static SolveTOI_s_subStep;
    private static SolveTOI_s_backup;
    private static SolveTOI_s_backup1;
    private static SolveTOI_s_backup2;
    private static SolveTOI_s_toi_input;
    private static SolveTOI_s_toi_output;
    SolveTOI(step: b2TimeStep): void;
}

declare enum b2BodyType {
    b2_unknown = -1,
    b2_staticBody = 0,
    b2_kinematicBody = 1,
    b2_dynamicBody = 2
}
interface b2IBodyDef {
    type?: b2BodyType;
    position?: XY;
    angle?: number;
    linearVelocity?: XY;
    angularVelocity?: number;
    linearDamping?: number;
    angularDamping?: number;
    allowSleep?: boolean;
    awake?: boolean;
    fixedRotation?: boolean;
    bullet?: boolean;
    enabled?: boolean;
    userData?: any;
    gravityScale?: number;
}
declare class b2BodyDef implements b2IBodyDef {
    type: b2BodyType;
    readonly position: b2Vec2;
    angle: number;
    readonly linearVelocity: b2Vec2;
    angularVelocity: number;
    linearDamping: number;
    angularDamping: number;
    allowSleep: boolean;
    awake: boolean;
    fixedRotation: boolean;
    bullet: boolean;
    enabled: boolean;
    userData: any;
    gravityScale: number;
}
declare class b2Body {
    m_type: b2BodyType;
    m_islandFlag: boolean;
    m_awakeFlag: boolean;
    m_autoSleepFlag: boolean;
    m_bulletFlag: boolean;
    m_fixedRotationFlag: boolean;
    m_enabledFlag: boolean;
    m_toiFlag: boolean;
    m_islandIndex: number;
    readonly m_xf: b2Transform;
    readonly m_sweep: b2Sweep;
    readonly m_linearVelocity: b2Vec2;
    m_angularVelocity: number;
    readonly m_force: b2Vec2;
    m_torque: number;
    m_world: b2World;
    m_prev: b2Body | null;
    m_next: b2Body | null;
    m_fixtureList: b2Fixture | null;
    m_fixtureCount: number;
    m_jointList: b2JointEdge | null;
    m_contactList: b2ContactEdge | null;
    m_mass: number;
    m_invMass: number;
    m_I: number;
    m_invI: number;
    m_linearDamping: number;
    m_angularDamping: number;
    m_gravityScale: number;
    m_sleepTime: number;
    m_userData: any;
    constructor(bd: b2IBodyDef, world: b2World);
    CreateFixture(def: b2IFixtureDef): b2Fixture;
    CreateFixture(shape: b2Shape): b2Fixture;
    CreateFixture(shape: b2Shape, density: number): b2Fixture;
    CreateFixtureDef(def: b2IFixtureDef): b2Fixture;
    private static CreateFixtureShapeDensity_s_def;
    CreateFixtureShapeDensity(shape: b2Shape, density?: number): b2Fixture;
    DestroyFixture(fixture: b2Fixture): void;
    SetTransformVec(position: XY, angle: number): void;
    SetTransformXY(x: number, y: number, angle: number): void;
    SetTransform(position: XY, angle: number): void;
    GetTransform(): Readonly<b2Transform>;
    GetPosition(): Readonly<b2Vec2>;
    SetPosition(position: XY): void;
    SetPositionXY(x: number, y: number): void;
    GetAngle(): number;
    SetAngle(angle: number): void;
    GetWorldCenter(): Readonly<b2Vec2>;
    GetLocalCenter(): Readonly<b2Vec2>;
    SetLinearVelocity(v: XY): void;
    GetLinearVelocity(): Readonly<b2Vec2>;
    SetAngularVelocity(w: number): void;
    GetAngularVelocity(): number;
    GetDefinition(bd: b2BodyDef): b2BodyDef;
    ApplyForce(force: XY, point: XY, wake?: boolean): void;
    ApplyForceToCenter(force: XY, wake?: boolean): void;
    ApplyTorque(torque: number, wake?: boolean): void;
    ApplyLinearImpulse(impulse: XY, point: XY, wake?: boolean): void;
    ApplyLinearImpulseToCenter(impulse: XY, wake?: boolean): void;
    ApplyAngularImpulse(impulse: number, wake?: boolean): void;
    GetMass(): number;
    GetInertia(): number;
    GetMassData(data: b2MassData): b2MassData;
    private static SetMassData_s_oldCenter;
    SetMassData(massData: b2MassData): void;
    private static ResetMassData_s_localCenter;
    private static ResetMassData_s_oldCenter;
    private static ResetMassData_s_massData;
    ResetMassData(): void;
    GetWorldPoint<T extends XY>(localPoint: XY, out: T): T;
    GetWorldVector<T extends XY>(localVector: XY, out: T): T;
    GetLocalPoint<T extends XY>(worldPoint: XY, out: T): T;
    GetLocalVector<T extends XY>(worldVector: XY, out: T): T;
    GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T;
    GetLinearVelocityFromLocalPoint<T extends XY>(localPoint: XY, out: T): T;
    GetLinearDamping(): number;
    SetLinearDamping(linearDamping: number): void;
    GetAngularDamping(): number;
    SetAngularDamping(angularDamping: number): void;
    GetGravityScale(): number;
    SetGravityScale(scale: number): void;
    SetType(type: b2BodyType): void;
    GetType(): b2BodyType;
    SetBullet(flag: boolean): void;
    IsBullet(): boolean;
    SetSleepingAllowed(flag: boolean): void;
    IsSleepingAllowed(): boolean;
    SetAwake(flag: boolean): void;
    IsAwake(): boolean;
    SetEnabled(flag: boolean): void;
    IsEnabled(): boolean;
    SetFixedRotation(flag: boolean): void;
    IsFixedRotation(): boolean;
    GetFixtureList(): b2Fixture | null;
    GetJointList(): b2JointEdge | null;
    GetContactList(): b2ContactEdge | null;
    GetNext(): b2Body | null;
    GetUserData(): any;
    SetUserData(data: any): void;
    GetWorld(): b2World;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static SynchronizeFixtures_s_xf1;
    SynchronizeFixtures(): void;
    SynchronizeTransform(): void;
    ShouldCollide(other: b2Body): boolean;
    ShouldCollideConnected(other: b2Body): boolean;
    Advance(alpha: number): void;
}

interface b2IFilter {
    categoryBits: number;
    maskBits: number;
    groupIndex?: number;
}
declare class b2Filter implements b2IFilter {
    static readonly DEFAULT: Readonly<b2Filter>;
    categoryBits: number;
    maskBits: number;
    groupIndex: number;
    Clone(): b2Filter;
    Copy(other: b2IFilter): this;
}
interface b2IFixtureDef {
    shape: b2Shape;
    userData?: any;
    friction?: number;
    restitution?: number;
    restitutionThreshold?: number;
    density?: number;
    isSensor?: boolean;
    filter?: b2IFilter;
}
declare class b2FixtureDef implements b2IFixtureDef {
    shape: b2Shape;
    userData: any;
    friction: number;
    restitution: number;
    restitutionThreshold: number;
    density: number;
    isSensor: boolean;
    readonly filter: b2Filter;
}
declare class b2FixtureProxy {
    readonly aabb: b2AABB;
    readonly fixture: b2Fixture;
    readonly childIndex: number;
    treeNode: b2TreeNode<b2FixtureProxy>;
    constructor(fixture: b2Fixture, childIndex: number);
    Reset(): void;
    Touch(): void;
    private static Synchronize_s_aabb1;
    private static Synchronize_s_aabb2;
    private static Synchronize_s_displacement;
    Synchronize(transform1: b2Transform, transform2: b2Transform): void;
}
declare class b2Fixture {
    m_density: number;
    m_next: b2Fixture | null;
    readonly m_body: b2Body;
    readonly m_shape: b2Shape;
    m_friction: number;
    m_restitution: number;
    m_restitutionThreshold: number;
    readonly m_proxies: b2FixtureProxy[];
    get m_proxyCount(): number;
    readonly m_filter: b2Filter;
    m_isSensor: boolean;
    m_userData: any;
    constructor(body: b2Body, def: b2IFixtureDef);
    Create(allocator: any, body: any, def: any): void;
    Destroy(): void;
    Reset(): void;
    GetType(): b2ShapeType;
    GetShape(): b2Shape;
    SetSensor(sensor: boolean): void;
    IsSensor(): boolean;
    SetFilterData(filter: b2Filter): void;
    GetFilterData(): Readonly<b2Filter>;
    Refilter(): void;
    GetBody(): b2Body;
    GetNext(): b2Fixture | null;
    GetUserData(): any;
    SetUserData(data: any): void;
    TestPoint(p: XY): boolean;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, childIndex: number): boolean;
    GetMassData(massData?: b2MassData): b2MassData;
    SetDensity(density: number): void;
    GetDensity(): number;
    GetFriction(): number;
    SetFriction(friction: number): void;
    GetRestitution(): number;
    SetRestitution(restitution: number): void;
    GetRestitutionThreshold(): number;
    SetRestitutionThreshold(threshold: number): void;
    GetAABB(childIndex: number): Readonly<b2AABB>;
    Dump(log: (format: string, ...args: any[]) => void, bodyIndex: number): void;
    CreateProxies(): void;
    DestroyProxies(): void;
    TouchProxies(): void;
    Synchronize(broadPhase: any, transform1: b2Transform, transform2: b2Transform): void;
    SynchronizeProxies(transform1: b2Transform, transform2: b2Transform): void;
}

declare class b2CircleContact extends b2Contact<b2CircleShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2PolygonContact extends b2Contact<b2PolygonShape, b2PolygonShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2PolygonAndCircleContact extends b2Contact<b2PolygonShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2EdgeAndCircleContact extends b2Contact<b2EdgeShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2EdgeAndPolygonContact extends b2Contact<b2EdgeShape, b2PolygonShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2ChainAndCircleContact extends b2Contact<b2ChainShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    private static Evaluate_s_edge;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2ChainAndPolygonContact extends b2Contact<b2ChainShape, b2PolygonShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    private static Evaluate_s_edge;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare enum b2StretchingModel {
    b2_pbdStretchingModel = 0,
    b2_xpbdStretchingModel = 1
}
declare enum b2BendingModel {
    b2_springAngleBendingModel = 0,
    b2_pbdAngleBendingModel = 1,
    b2_xpbdAngleBendingModel = 2,
    b2_pbdDistanceBendingModel = 3,
    b2_pbdHeightBendingModel = 4,
    b2_pbdTriangleBendingModel = 5
}
declare class b2RopeTuning {
    stretchingModel: b2StretchingModel;
    bendingModel: b2BendingModel;
    damping: number;
    stretchStiffness: number;
    stretchHertz: number;
    stretchDamping: number;
    bendStiffness: number;
    bendHertz: number;
    bendDamping: number;
    isometric: boolean;
    fixedEffectiveMass: boolean;
    warmStart: boolean;
    Copy(other: Readonly<b2RopeTuning>): this;
}
declare class b2RopeDef {
    readonly position: b2Vec2;
    readonly vertices: b2Vec2[];
    count: number;
    readonly masses: number[];
    readonly gravity: b2Vec2;
    readonly tuning: b2RopeTuning;
}
declare class b2Rope {
    private readonly m_position;
    private m_count;
    private m_stretchCount;
    private m_bendCount;
    private readonly m_stretchConstraints;
    private readonly m_bendConstraints;
    private readonly m_bindPositions;
    private readonly m_ps;
    private readonly m_p0s;
    private readonly m_vs;
    private readonly m_invMasses;
    private readonly m_gravity;
    private readonly m_tuning;
    Create(def: b2RopeDef): void;
    SetTuning(tuning: b2RopeTuning): void;
    Step(dt: number, iterations: number, position: Readonly<b2Vec2>): void;
    Reset(position: Readonly<b2Vec2>): void;
    Draw(draw: b2Draw): void;
    private SolveStretch_PBD;
    private SolveStretch_XPBD;
    private SolveBend_PBD_Angle;
    private SolveBend_XPBD_Angle;
    private SolveBend_PBD_Distance;
    private SolveBend_PBD_Height;
    private SolveBend_PBD_Triangle;
    private ApplyBendForces;
}

export { RGB, RGBA, XY, XYZ, b2AABB, b2Abs, b2Acos, b2Alloc, b2AngularStiffness, b2AreaJoint, b2AreaJointDef, b2Asin, b2Assert, b2Atan2, b2BendingModel, b2BlockAllocator, b2Body, b2BodyDef, b2BodyType, b2BroadPhase, b2ChainAndCircleContact, b2ChainAndPolygonContact, b2ChainShape, b2CircleContact, b2CircleShape, b2Clamp, b2ClipSegmentToLine, b2ClipVertex, b2CollideCircles, b2CollideEdgeAndCircle, b2CollideEdgeAndPolygon, b2CollidePolygonAndCircle, b2CollidePolygons, b2Color, b2Contact, b2ContactEdge, b2ContactFactory, b2ContactFeature, b2ContactFeatureType, b2ContactFilter, b2ContactID, b2ContactImpulse, b2ContactListener, b2ContactManager, b2ContactPositionConstraint, b2ContactRegister, b2ContactSolver, b2ContactSolverDef, b2ContactVelocityConstraint, b2Cos, b2Counter, b2DegToRad, b2DestructionListener, b2Distance, b2DistanceInput, b2DistanceJoint, b2DistanceJointDef, b2DistanceOutput, b2DistanceProxy, b2Draw, b2DrawFlags, b2DynamicTree, b2EdgeAndCircleContact, b2EdgeAndPolygonContact, b2EdgeShape, b2Filter, b2Fixture, b2FixtureDef, b2FixtureProxy, b2Free, b2FrictionJoint, b2FrictionJointDef, b2GearJoint, b2GearJointDef, b2GetPointStates, b2GrowableStack, b2IAreaJointDef, b2IBodyDef, b2IDistanceJointDef, b2IFilter, b2IFixtureDef, b2IFrictionJointDef, b2IGearJointDef, b2IJointDef, b2IMotorJointDef, b2IMouseJointDef, b2IPrismaticJointDef, b2IPulleyJointDef, b2IRevoluteJointDef, b2IWeldJointDef, b2IWheelJointDef, b2InvSqrt, b2IsPowerOfTwo, b2IsValid, b2Island, b2Jacobian, b2Joint, b2JointDef, b2JointEdge, b2JointType, b2LinearStiffness, b2Log, b2MakeArray, b2MakeNullArray, b2MakeNumberArray, b2Manifold, b2ManifoldPoint, b2ManifoldType, b2MassData, b2Mat22, b2Mat33, b2Max, b2Maybe, b2Min, b2MixFriction, b2MixRestitution, b2MixRestitutionThreshold, b2MotorJoint, b2MotorJointDef, b2MouseJoint, b2MouseJointDef, b2NextPowerOfTwo, b2Pair, b2ParseInt, b2ParseUInt, b2PointState, b2PolygonAndCircleContact, b2PolygonContact, b2PolygonShape, b2Position, b2PositionSolverManifold, b2Pow, b2PrismaticJoint, b2PrismaticJointDef, b2Profile, b2PulleyJoint, b2PulleyJointDef, b2QueryCallback, b2QueryCallbackFunction, b2RadToDeg, b2Random, b2RandomRange, b2RayCastCallback, b2RayCastCallbackFunction, b2RayCastInput, b2RayCastOutput, b2RevoluteJoint, b2RevoluteJointDef, b2Rope, b2RopeDef, b2RopeTuning, b2Rot, b2SeparationFunction, b2SeparationFunctionType, b2Shape, b2ShapeCast, b2ShapeCastInput, b2ShapeCastOutput, b2ShapeType, b2Simplex, b2SimplexCache, b2SimplexVertex, b2Sin, b2SolverData, b2Sq, b2Sqrt, b2StackAllocator, b2StretchingModel, b2Swap, b2Sweep, b2TOIInput, b2TOIOutput, b2TOIOutputState, b2TestOverlapAABB, b2TestOverlapShape, b2TimeOfImpact, b2TimeStep, b2Timer, b2Transform, b2TreeNode, b2TypedColor, b2TypedVec2, b2Vec2, b2Vec2_zero, b2Vec3, b2Velocity, b2VelocityConstraintPoint, b2Version, b2WeldJoint, b2WeldJointDef, b2WheelJoint, b2WheelJointDef, b2World, b2WorldManifold, b2_180_over_pi, b2_aabbExtension, b2_aabbMultiplier, b2_angularSleepTolerance, b2_angularSlop, b2_baumgarte, b2_branch, b2_commit, b2_epsilon, b2_epsilon_sq, b2_gjkCalls, b2_gjkIters, b2_gjkMaxIters, b2_gjk_reset, b2_lengthUnitsPerMeter, b2_linearSleepTolerance, b2_linearSlop, b2_maxAngularCorrection, b2_maxFloat, b2_maxLinearCorrection, b2_maxManifoldPoints, b2_maxPolygonVertices, b2_maxRotation, b2_maxRotationSquared, b2_maxSubSteps, b2_maxTOIContacts, b2_maxTranslation, b2_maxTranslationSquared, b2_minPulleyLength, b2_pi, b2_pi_over_180, b2_polygonRadius, b2_timeToSleep, b2_toiBaumgarte, b2_toiCalls, b2_toiIters, b2_toiMaxIters, b2_toiMaxRootIters, b2_toiMaxTime, b2_toiRootIters, b2_toiTime, b2_toi_reset, b2_two_pi, b2_version, g_blockSolve, get_g_blockSolve, set_g_blockSolve };
