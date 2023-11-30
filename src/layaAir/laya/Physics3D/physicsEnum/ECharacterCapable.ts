export enum ECharacterCapable {
    //Charcater_AllowSleep,   // 允许睡眠
    //Charcater_AllowTrigger, // 运行触发器
    Charcater_Gravity,  // 重力
    Charcater_CollisionGroup, // 碰撞分组
    //Charcater_Friction,   // 摩擦力
    //Charcater_RollingFriction,    // 滚动摩擦力
    //Charcater_Restitution,    // 弹力
    Charcater_WorldPosition,    // 角色位置
    Charcater_Move, // 方向移动
    Charcater_Jump, // 跳跃
    Charcater_StepOffset,   // 步幅偏移
    Character_UpDirection,  // 角色向上方向
    Character_FallSpeed, // 下落速度
    Character_SlopeLimit,   // 坡度限制
    Character_PushForce,    // 碰撞其他物体的力
    Character_Radius,   // 坡度限制
    Character_Height,   // 坡度限制
    Character_offset,   // 坡度限制
    Character_Skin,   // 坡度限制
    Character_minDistance,
    Character_EventFilter, // 控制器事件过滤
}