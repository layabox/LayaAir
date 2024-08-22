export enum ECharacterCapable {
    //Charcater_AllowSleep,   // 允许睡眠
    //Charcater_AllowTrigger, // 运行触发器
    /**
     * @en Gravity applied to the character.
     * @zh 应用于角色的重力。
     */
    Charcater_Gravity,  
    /**
     * @en Collision group for the character.
     * @zh 角色的碰撞分组。
     */
    Charcater_CollisionGroup, 
    //Charcater_Friction,   // 摩擦力
    //Charcater_RollingFriction,    // 滚动摩擦力
    //Charcater_Restitution,    // 弹力
    /**
     * @en World position of the character.
     * @zh 角色在世界坐标中的位置。
     */
    Charcater_WorldPosition,    
    /**
     * @en Directional movement of the character.
     * @zh 角色的方向移动。
     */
    Charcater_Move, 
    /**
     * @en Jump capability of the character.
     * @zh 角色的跳跃能力。
     */
    Charcater_Jump, 
    /**
     * @en Step offset for the character.
     * @zh 角色的步幅偏移。
     */
    Charcater_StepOffset,   
    /**
     * @en Up direction of the character.
     * @zh 角色的向上方向。
     */
    Character_UpDirection,  
    /**
     * @en Fall speed of the character.
     * @zh 角色的下落速度。
     */
    Character_FallSpeed, 
    /**
     * @en Slope limit for the character.
     * @zh 角色的坡度限制。
     */
    Character_SlopeLimit,   
    /**
     * @en Force when character collides with other objects.
     * @zh 角色碰撞其他物体的力。
     */
    Character_PushForce,    
    /**
     * @en Radius of the character.
     * @zh 角色的半径。
     */
    Character_Radius,   
    /**
     * @en Height of the character.
     * @zh 角色的高度。
     */
    Character_Height,   
    /**
     * @en Offset of the character.
     * @zh 角色的偏移。
     */
    Character_offset,   
    /**
     * @en Skin of the character.
     * @zh 角色的皮肤。
     */
    Character_Skin,   
    /**
     * @en Minimum distance for the character.
     * @zh 角色的最小距离。
     */
    Character_minDistance,
    /**
     * @en Event filter for the character controller.
     * @zh 角色控制器的事件过滤器。
     */
    Character_EventFilter, 
    /**
     * @en Simulate gravity for the character controller.
     * @zh 模拟角色控制器的重力。
     */
    Character_SimulateGravity,  
}