export enum EPhysicsCapable {
    Physics_CanSleep,   // 是否支持睡眠
    Physics_Gravity,   // 重力 
    Physics_CollisionGroup, // 碰撞分组
    Physics_Friction,   // 摩擦力
    Physics_RollingFriction,    // 滚动摩擦力
    Physics_Restitution,    // 弹力
    Physics_LinearDamp, // 线性阻尼
    Physics_AngularDamp,    // 角度阻尼
    Physics_LinearVelocity, // 线速度
    Physics_AngularVelocity,    // 角速度 
    Physics_Mass,   // 质量
    Physics_InertiaTensor,  // 惯性张量
    Physics_MassCenter, // 重心
    Physics_MaxAngularVelocity, // 最大角速度
    Physics_MaxDepenetrationVelocity,   // 最大侵入速度
    Physics_SleepThreshold, //睡眠阈值可能是bug TODO
    Physics_SleepAngularVelocity,   // 睡眠角速度 调用的是睡眠阈值接口是否有问题 TODO
    Physics_SolverIterations,   // 物理迭代次数
    Physics_CanDetectionMode,   // 是否支持动态切换物体类型
    Physics_CanKinematic,   // 是否支持运动学模式
    Physics_CanStatic,  // 是否支持静态模式
    Physics_CanDynamic, // 是否支持动态模式
    Physics_CanCharacter,   // 是否支持角色模式
    Physics_LinearFactor,   // 线速度缩放因子
    Physics_AngularFactor,  // 角速度缩放因子
    Physics_ApplyForce, // 施加力
    Physics_ClearForce, // 清除力
    Physics_ApplyForceWithOffset,    // 施加偏移位置的力
    Physics_ApplyTorque,    // 应用扭力
    Physics_ApplyImpulse,   // 应用冲量
    Physics_ApplyTorqueImpulse, // 应用扭力冲量
    Physics_CanTrigger, // 是否支持触发器
    Physics_BoxColliderShape,   // 盒状碰撞形状
    Physics_SphereColliderShape,    // 球状碰撞形状
    Physics_PlaneColliderShape,    // 片状碰撞形状
    Physics_CapsuleColliderShape,   // 胶囊碰撞形状
    Physics_CylinderColliderShape,  // 圆柱碰撞形状
    Physics_ConeColliderShape,  // 圆锥碰撞形状
    Physics_MeshColliderShape,  // 网格碰撞形状 // _bt TODO暂不支持
    Physics_CompoundColliderShape,  // 组合碰撞形状 // _bt TODO暂不支持
    Physics_WorldPosition,  // 设置位置
    Physics_Move,   // 移动
    Physics_Jump,   // 跳跃
    Physics_StepOffset, // 步幅偏移
    Physics_UpDirection,    // 挑起方向
    Physics_FallSpeed,  // 下落速度
    Physics_SlopeLimit, // 坡度限制
    Physics_PushForce,  // 角色碰撞其他物体的力

    // Joint TODO
}