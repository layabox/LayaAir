export enum EColliderCapable {
    /**
     * @en Collision group for the collider.
     * @zh 碰撞体的碰撞分组。
     */
    Collider_CollisionGroup, 
    /**
     * @en Friction of the collider.
     * @zh 碰撞体的摩擦力。
     */
    Collider_Friction,   
    /**
     * @en Rolling friction of the collider.
     * @zh 碰撞体的滚动摩擦力。
     */
    Collider_RollingFriction,    
    /**
     * @en Restitution (bounciness) of the collider.
     * @zh 碰撞体的弹力。
     */
    Collider_Restitution,    
    /**
     * @en Whether the collider supports triggers.
     * @zh 碰撞体是否支持触发器。
     */
    Collider_AllowTrigger, 
    /**
     * @en Dynamic friction of the collider.
     * @zh 碰撞体的动态摩擦力。
     */
    Collider_DynamicFriction,
    /**
     * @en Static friction of the collider.
     * @zh 碰撞体的静态摩擦力。
     */
    Collider_StaticFriction,
    /**
     * @en Bounce combine mode of the collider.
     * @zh 碰撞体的弹力组合模式。
     */
    Collider_BounceCombine,
    /**
     * @en Friction combine mode of the collider.
     * @zh 碰撞体的摩擦力组合模式。
     */
    Collider_FrictionCombine,
    /**
     * @en Event filter for the collider.
     * @zh 碰撞体的事件过滤器。
     */
    Collider_EventFilter,   
    /**
     * @en Collision detection mode for the collider.
     * @zh 碰撞体的碰撞检测模式。
     */
    Collider_CollisionDetectionMode, 

    // RigidBody刚体能力
    /**
     * @en Whether the rigid body supports kinematic mode.
     * @zh 刚体是否支持运动学模式。
     */
    RigidBody_CanKinematic,   
    /**
     * @en Whether the rigid body supports sleeping.
     * @zh 刚体是否支持睡眠。
     */
    RigidBody_AllowSleep,   
    /**
     * @en Gravity applied to the rigid body.
     * @zh 应用于刚体的重力。
     */
    RigidBody_Gravity,   
    /**
     * @en Linear damping of the rigid body.
     * @zh 刚体的线性阻尼。
     */
    RigidBody_LinearDamp, 
    /**
     * @en Angular damping of the rigid body.
     * @zh 刚体的角度阻尼。
     */
    RigidBody_AngularDamp,    
    /**
     * @en Linear velocity of the rigid body.
     * @zh 刚体的线速度。
     */
    RigidBody_LinearVelocity, 
    /**
     * @en Angular velocity of the rigid body.
     * @zh 刚体的角速度。
     */
    RigidBody_AngularVelocity,    
    /**
     * @en Mass of the rigid body.
     * @zh 刚体的质量。
     */
    RigidBody_Mass,  
    /**
     * @en World position of the rigid body.
     * @zh 刚体在世界坐标中的位置。
     */
    RigidBody_WorldPosition,   
    /**
     * @en World orientation of the rigid body.
     * @zh 刚体在世界坐标中的旋转。
     */
    RigidBody_WorldOrientation,   
    /**
     * @en Inertia tensor of the rigid body.
     * @zh 刚体的惯性张量。
     */
    RigidBody_InertiaTensor,  
    /**
     * @en Center of mass of the rigid body.
     * @zh 刚体的重心。
     */
    RigidBody_MassCenter, 
    /**
     * @en Maximum angular velocity of the rigid body.
     * @zh 刚体的最大角速度。
     */
    RigidBody_MaxAngularVelocity, 
    /**
     * @en Maximum depenetration velocity of the rigid body.
     * @zh 刚体的最大侵入速度。
     */
    RigidBody_MaxDepenetrationVelocity,   
    /**
     * @en Sleep threshold of the rigid body. 
     * @zh 刚体的睡眠阈值。
     */
    RigidBody_SleepThreshold, //可能是bug TODO
    /**
     * @en Sleep angular velocity of the rigid body. 
     * @zh 刚体的睡眠角速度。
     */
    RigidBody_SleepAngularVelocity,   // 调用的是睡眠阈值接口是否有问题 TODO
    /**
     * @en Number of physics iterations for the rigid body.
     * @zh 刚体的物理迭代次数。
     */
    RigidBody_SolverIterations,   
    /**
     * @en Whether the rigid body supports dynamic switching of object types.
     * @zh 刚体是否支持动态切换物体类型。
     */
    RigidBody_AllowDetectionMode,   
    /**
     * @en Whether the rigid body supports kinematic mode.
     * @zh 刚体是否支持运动学模式。
     */
    RigidBody_AllowKinematic,   
    /**
     * @en Whether the rigid body supports character mode.
     * @zh 刚体是否支持角色模式。
     */
    RigidBody_AllowCharacter,   
    /**
     * @en Linear velocity scale factor of the rigid body.
     * @zh 刚体的线速度缩放因子。
     */
    RigidBody_LinearFactor,   
    /**
     * @en Angular velocity scale factor of the rigid body.
     * @zh 刚体的角速度缩放因子。
     */
    RigidBody_AngularFactor,  
    /**
     * @en Apply force to the rigid body.
     * @zh 对刚体施加力。
     */
    RigidBody_ApplyForce, 
    /**
     * @en Clear forces applied to the rigid body.
     * @zh 清除施加在刚体上的力。
     */
    RigidBody_ClearForce, 
    /**
     * @en Apply force at an offset position to the rigid body.
     * @zh 对刚体施加偏移位置的力。
     */
    RigidBody_ApplyForceWithOffset,    
    /**
     * @en Apply torque to the rigid body.
     * @zh 对刚体施加扭力。
     */
    RigidBody_ApplyTorque,    
    /**
     * @en Apply impulse to the rigid body.
     * @zh 对刚体施加冲量。
     */
    RigidBody_ApplyImpulse,   
    /**
     * @en Apply torque impulse to the rigid body.
     * @zh 对刚体施加扭力冲量。
     */
    RigidBody_ApplyTorqueImpulse, 
}