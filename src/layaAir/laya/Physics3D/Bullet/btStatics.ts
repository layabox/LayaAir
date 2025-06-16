import { Vector3 } from "../../maths/Vector3";

export class btStatics {
    static bt: any;

    /**
         * @en Default collision group
         * @zh 默认碰撞组
         */
    static COLLISIONFILTERGROUP_DEFAULTFILTER: number = 0x1;
    /**
     * @en Static collision group
     * @zh 静态碰撞组
     */
    static COLLISIONFILTERGROUP_STATICFILTER: number = 0x2;
    /**
     * @en Kinematic rigid body collision group
     * @zh 运动学刚体碰撞组
     */
    static COLLISIONFILTERGROUP_KINEMATICFILTER: number = 0x4;
    /**
     * @en Debris collision group
     * @zh 碎片碰撞组
     */
    static COLLISIONFILTERGROUP_DEBRISFILTER: number = 0x8;
    /**
     * @en Sensor trigger group
     * @zh 传感器触发器组
     */
    static COLLISIONFILTERGROUP_SENSORTRIGGER: number = 0x10;
    /**
     * @en Character filter group
     * @zh 角色过滤器组
     */
    static COLLISIONFILTERGROUP_CHARACTERFILTER: number = 0x20;
    /**
     * @en Custom filter group 1
     * @zh 自定义过滤组 1
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER1: number = 0x40;
    /**
     * @en Custom filter group 2
     * @zh 自定义过滤组 2
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER2: number = 0x80;
    /**
     * @en Custom filter group 3
     * @zh 自定义过滤组 3
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER3: number = 0x100;
    /**
     * @en Custom filter group 4
     * @zh 自定义过滤组 4
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER4: number = 0x200;
    /**
     * @en Custom filter group 5
     * @zh 自定义过滤组 5
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER5: number = 0x400;
    /**
     * @en Custom filter group 6
     * @zh 自定义过滤组 6
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER6: number = 0x800;
    /**
     * @en Custom filter group 7
     * @zh 自定义过滤组 7
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER7: number = 0x1000;
    /**
     * @en Custom filter group 8
     * @zh 自定义过滤组 8
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER8: number = 0x2000;
    /**
     * @en Custom filter group 9
     * @zh 自定义过滤组 9
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER9: number = 0x4000;
    /**
     * @en Custom filter group 10
     * @zh 自定义过滤组 10
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER10: number = 0x8000;
    /**
     * @en All filter groups
     * @zh 所有过滤组
     */
    static COLLISIONFILTERGROUP_ALLFILTER: number = -1;


    /**
     * @internal
     * @en Active tag for activation state
     * @zh 激活状态的标签
     */
    static ACTIVATIONSTATE_ACTIVE_TAG = 1;
    /**
     * @internal
     * @en Island sleeping tag for activation state
     * @zh 落地休眠状态的标签
     */
    static ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
    /**
     * @internal
     * @en Wants deactivation tag for activation state
     * @zh 希望停用状态的标签
     */
    static ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
    /**
     * @internal
     * @en Disable deactivation tag for activation state
     * @zh 禁用停用状态的标签
     */
    static ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
    /**
     * @internal
     * @en Disable simulation tag for activation state
     * @zh 禁用模拟状态的标签
     */
    static ACTIVATIONSTATE_DISABLE_SIMULATION = 5;

    /**
     * @internal
     * @en Collision flag: Static object
     * @zh 碰撞标志：静态对象
     */
    static COLLISIONFLAGS_STATIC_OBJECT = 1;
    /**
     * @internal
     * @en Collision flag: Kinematic object
     * @zh 碰撞标志：运动学对象
     */
    static COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
    /**
     * @internal
     * @en Collision flag: No contact response
     * @zh 碰撞标志：无接触响应
     */
    static COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
    /**
     * @internal
     * @en Collision flag: Custom material callback.This allows per-triangle material (friction/restitution)
     * @zh 碰撞标志：自定义材质回调。这允许每个三角形使用单独的材质（摩擦力/弹性）
     */
    static COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;
    /**
     * @internal
     * @en Collision flag: Character object
     * @zh 碰撞标志：角色对象
     */
    static COLLISIONFLAGS_CHARACTER_OBJECT = 16;
    /**
     * @internal
     * @en Collision flag: Disable visualize object.Disables debug drawing
     * @zh 碰撞标志：禁用可视化对象。禁用调试绘制
     */
    static COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;
    /**
     * @internal
     * @en Collision flag: Disable SPU collision processing.Disables parallel/SPU processing
     * @zh 碰撞标志：禁用 SPU 碰撞处理。禁用并行/SPU 处理
     */
    static COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;

    /**
     * @internal
     * @en Physics engine flag: None.Indicates no specific physics engine features are enabled.
     * @zh 物理引擎标志：无。表示没有启用任何特定的物理引擎功能。
     */
    static PHYSICSENGINEFLAGS_NONE = 0x0;
    /**
     * @internal
     * @en Physics engine flag: Collisions only.Enables collision detection without full physics simulation.
     * @zh 物理引擎标志：仅碰撞。启用碰撞检测，但不进行完整的物理模拟。
     */
    static PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
    /**
     * @internal
     * @en Physics engine flag: Soft body support.Enables soft body physics simulation.
     * @zh 物理引擎标志：软体支持。启用软体物理模拟。
     */
    static PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
    /**
     * @internal
     * @en Physics engine flag: Multi-threaded.Enables multi-threaded physics computations.
     * @zh 物理引擎标志：多线程。启用多线程物理计算。
     */
    static PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
    /**
     * @internal
     * @en Physics engine flag: Use hardware when possible.Enables hardware acceleration for physics calculations when available.
     * @zh 物理引擎标志：尽可能使用硬件加速。在可用时启用硬件加速进行物理计算。
     */
    static PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;

    /**
     * @internal
     * @en Solver mode: Randomize order.Randomizes the order of constraint solving.
     * @zh 求解器模式：随机顺序。随机化约束求解的顺序。
     */
    static SOLVERMODE_RANDMIZE_ORDER = 1;
    /**
     * @internal
     * @en Solver mode: Separate friction.Handles friction separately from other constraints.
     * @zh 求解器模式：分离摩擦力。将摩擦力与其他约束分开处理。
     */
    static SOLVERMODE_FRICTION_SEPARATE = 2;
    /**
     * @internal
     * @en Solver mode: Use warm starting.Uses previous solution as a starting point for faster convergence.
     * @zh 求解器模式：使用热启动。使用前一次的解作为起点，以加快收敛速度。
     */
    static SOLVERMODE_USE_WARMSTARTING = 4;
    /**
     * @internal
     * @en Solver mode: Use 2 friction directions.Applies friction in two orthogonal directions.
     * @zh 求解器模式：使用两个摩擦方向。在两个正交方向上应用摩擦力。
     */
    static SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
    /**
     * @internal
     * @en Solver mode: Enable friction direction caching。Caches friction directions for improved performance.
     * @zh 求解器模式：启用摩擦方向缓存。缓存摩擦方向以提高性能。
     */
    static SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
    /**
     * @internal
     * @en Solver mode: Disable velocity-dependent friction direction.Friction direction does not depend on relative velocity.
     * @zh 求解器模式：禁用速度相关的摩擦方向。摩擦方向不依赖于相对速度。
     */
    static SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
    /**
     * @internal
     * @en Solver mode: Cache friendly.Optimizes memory access patterns for better cache utilization.
     * @zh 求解器模式：缓存友好。优化内存访问模式以更好地利用缓存。
     */
    static SOLVERMODE_CACHE_FRIENDLY = 128;
    /**
     * @internal
     * @en Solver mode: SIMD.Uses SIMD instructions for improved performance.
     * @zh 求解器模式：SIMD。使用 SIMD 指令以提高性能。
     */
    static SOLVERMODE_SIMD = 256;
    /**
     * @internal
     * @en Solver mode: Interleave contact and friction constraints.Alternates between contact and friction constraint solving.
     * @zh 求解器模式：交错接触和摩擦约束。在接触约束和摩擦约束求解之间交替进行。
     */
    static SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
    /**
     * @internal
     * @en Solver mode: Allow zero length friction directions.Permits friction calculations even when relative velocity is zero.
     * @zh 求解器模式：允许零长度摩擦方向。即使相对速度为零也允许进行摩擦力计算。
     */
    static SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
    /**
     * @internal
     * @en Ray result callback flag: None.No special flags applied to the ray callback.
     * @zh 射线结果回调标志：无。不应用特殊标志到射线回调。
     */
    static HITSRAYRESULTCALLBACK_FLAG_NONE = 0;
    /**
     * @internal
     * @en Ray result callback flag: Ignore back faces.Ray test will ignore back faces of triangles.
     * @zh 射线回调模式：忽略反面。射线检测时，会忽略掉反面的三角形
     */
    static HITSRAYRESULTCALLBACK_FLAG_FILTERBACKFACESS = 1;
    /**
     * @internal
     * @en Ray result callback flag: Keep unflipped normal.Maintains the original normal direction of hit surfaces.
     * @zh 射线结果回调标志：保持未翻转的法线。保持命中表面的原始法线方向。
     */
    static HITSRAYRESULTCALLBACK_FLAG_KEEPUNFILIPPEDNORMAL = 2;
    /**
     * @internal
     * @en Ray result callback flag: Use sub-simplex convex cast ray test.Employs a sub-simplex algorithm for convex shape ray casting.
     * @zh 射线结果回调标志：使用子单纯形凸体投射射线测试。使用子单纯形算法进行凸形体的射线投射。
     */
    static HITSRAYRESULTCALLBACK_FLAG_USESUBSIMPLEXCONVEXCASTRAYTEST = 4;
    /**
     * @internal
     * @en Ray result callback flag: Use GJK convex cast ray test.Utilizes the GJK algorithm for convex shape ray casting.
     * @zh 射线结果回调标志：使用 GJK 凸体投射射线测试。使用 GJK 算法进行凸形体的射线投射。
     */
    static HITSRAYRESULTCALLBACK_FLAG_USEGJKCONVEXCASTRAYTEST = 8;
    /**
     * @internal
     * @en Ray result callback flag: Terminator.Indicates the end of ray callback flags.
     * @zh 射线结果回调标志：终止符。表示射线回调标志的结束。
     */
    static HITSRAYRESULTCALLBACK_FLAG_TERMINATOR = 0xffffffff;
}

/**
 * @internal
 */
export function convertToBulletVec3(lVector: Vector3, out: number): void {
    btStatics.bt.btVector3_setValue(out, lVector.x, lVector.y, lVector.z);
}