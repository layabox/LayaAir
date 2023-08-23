export enum EPhysicsCapable {
    Physics_Gravity,   // 重力 
    Physics_StaticCollider,  // 是否支持静态模式
    Physics_DynamicCollider, // 是否支持动态模式
    Physics_CharacterCollider,   // 是否支持角色模式
    Physics_BoxColliderShape,   // 盒状碰撞形状
    Physics_SphereColliderShape,    // 球状碰撞形状
    Physics_CapsuleColliderShape,   // 胶囊碰撞形状
    Physics_CylinderColliderShape,  // 圆柱碰撞形状
    Physics_ConeColliderShape,  // 圆锥碰撞形状
    Physics_MeshColliderShape,  // 网格碰撞形状 // _bt TODO暂不支持
    Physics_CompoundColliderShape,  // 组合碰撞形状 // _bt TODO暂不支持
    Physics_Joint
}