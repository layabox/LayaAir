export enum EPhysicsCapable {
    /**
     * @en Gravity in the physics system.
     * @zh 物理系统中的重力。
     */
    Physics_Gravity,   
    /**
     * @en Support for static collider mode.
     * @zh 是否支持静态碰撞体模式。
     */
    Physics_StaticCollider,  
    /**
     * @en Support for dynamic collider mode.
     * @zh 是否支持动态碰撞体模式。
     */
    Physics_DynamicCollider, 
    /**
     * @en Support for character collider mode.
     * @zh 是否支持角色碰撞体模式。
     */
    Physics_CharacterCollider,   
    /**
     * @en Box-shaped collider shape.
     * @zh 盒状碰撞形状。
     */
    Physics_BoxColliderShape,   
    /**
     * @en Sphere-shaped collider shape.
     * @zh 球状碰撞形状。
     */
    Physics_SphereColliderShape,    
    /**
     * @en Capsule-shaped collider shape.
     * @zh 胶囊碰撞形状。
     */
    Physics_CapsuleColliderShape,   
    /**
     * @en Cylinder-shaped collider shape.
     * @zh 圆柱碰撞形状。
     */
    Physics_CylinderColliderShape,  
    /**
     * @en Cone-shaped collider shape.
     * @zh 圆锥碰撞形状。
     */
    Physics_ConeColliderShape,  
    /**
     * @en Mesh collider shape. 
     * @zh 网格碰撞形状。
     */
    Physics_MeshColliderShape,  // _bt TODO暂不支持
    /**
     * @en Compound collider shape. 
     * @zh 组合碰撞形状。
     */
    Physics_CompoundColliderShape,   // _bt TODO暂不支持
    /**
     * @en Support for creating curve mesh. 
     * @zh 支持创建曲线网格。
     */
    Physics_CreateCorveMesh,   // _bt TODO暂不支持
    /**
     * @en Height field collider shape.
     * @zh 高度场碰撞形状。
     */
    physics_heightFieldColliderShape,
    /**
     * @en General joint capability.
     * @zh 常规关节能力。
     */
    Physics_Joint,
    /**
     * @en Fixed joint capability.
     * @zh 固定关节能力。
     */
    Physics_FixedJoint,
    /**
     * @en Spring joint capability.
     * @zh 弹簧关节能力。
     */
    Physics_SpringJoint,
    /**
     * @en Hinge joint capability.
     * @zh 铰链关节能力。
     */
    Physics_HingeJoint,
    /**
     * @en 6 Degrees of Freedom (D6) joint capability.
     * @zh 6自由度（D6）关节能力。
     */
    Physics_D6Joint,
}