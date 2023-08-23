export enum EColliderCapable {
    Collider_CollisionGroup, // 碰撞分组
    Collider_Friction,   // 摩擦力
    Collider_RollingFriction,    // 滚动摩擦力
    Collider_Restitution,    // 弹力
    Collider_AllowTrigger, // 是否支持触发器
    Collider_DynamicFriction,
    Collider_StaticFriction,
    Collider_BounceCombine,
    Collider_FrictionCombine,

    // RigidBody刚体能力
    RigidBody_CanKinematic,   // 是否支持运动学模式
    RigidBody_AllowSleep,   // 是否支持睡眠
    RigidBody_Gravity,   // 重力
    RigidBody_Friction,   // 摩擦力
    RigidBody_RollingFriction,    // 滚动摩擦力
    RigidBody_Restitution,    // 弹力
    RigidBody_LinearDamp, // 线性阻尼
    RigidBody_AngularDamp,    // 角度阻尼
    RigidBody_LinearVelocity, // 线速度
    RigidBody_AngularVelocity,    // 角速度 
    RigidBody_Mass,   // 质量
    RigidBody_WorldPosition,   // 位置
    RigidBody_WorldOrientation,   // 旋转
    RigidBody_InertiaTensor,  // 惯性张量
    RigidBody_MassCenter, // 重心
    RigidBody_MaxAngularVelocity, // 最大角速度
    RigidBody_MaxDepenetrationVelocity,   // 最大侵入速度
    RigidBody_SleepThreshold, //睡眠阈值可能是bug TODO
    RigidBody_SleepAngularVelocity,   // 睡眠角速度 调用的是睡眠阈值接口是否有问题 TODO
    RigidBody_SolverIterations,   // 物理迭代次数
    RigidBody_AllowDetectionMode,   // 是否支持动态切换物体类型
    RigidBody_AllowKinematic,   // 是否支持运动学模式
    RigidBody_AllowStatic,  // 是否支持静态模式
    RigidBody_AllowDynamic, // 是否支持动态模式
    RigidBody_AllowCharacter,   // 是否支持角色模式
    RigidBody_LinearFactor,   // 线速度缩放因子
    RigidBody_AngularFactor,  // 角速度缩放因子
    RigidBody_ApplyForce, // 施加力
    RigidBody_ClearForce, // 清除力
    RigidBody_ApplyForceWithOffset,    // 施加偏移位置的力
    RigidBody_ApplyTorque,    // 应用扭力
    RigidBody_ApplyImpulse,   // 应用冲量
    RigidBody_ApplyTorqueImpulse, // 应用扭力冲量
    RigidBody_AllowTrigger, // 是否支持触发器
}