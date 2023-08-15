export enum EStaticCapable {
    Static_AllowSleep,   // 是否支持睡眠
    Static_CollisionGroup, // 碰撞分组
    Static_Friction,   // 摩擦力
    Static_RollingFriction,    // 滚动摩擦力
    Static_Restitution,    // 弹力
    Static_AllowTrigger, // 是否支持触发器
    Static_BoxColliderShape,   // 盒状碰撞形状
    Static_SphereColliderShape,    // 球状碰撞形状
    Static_PlaneColliderShape,    // 片状碰撞形状
    Static_CapsuleColliderShape,   // 胶囊碰撞形状
    Static_CylinderColliderShape,  // 圆柱碰撞形状
    Static_ConeColliderShape,  // 圆锥碰撞形状
    Static_MeshColliderShape,  // 网格碰撞形状 // 是还没实现Mesh
    Static_CompoundColliderShape,  // 组合碰撞形状 //是还没实现组合网格
}