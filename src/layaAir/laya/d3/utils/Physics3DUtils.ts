/**
 * @en Physics3DUtils class represents a 3D physics collision group.
 * @zh Physics3DUtils 类表示3D物理碰撞组。
 */
export class Physics3DUtils {
	/**
	 * @en Default collision filter group.
	 * @zh 默认碰撞组。
	 */
	static COLLISIONFILTERGROUP_DEFAULTFILTER: number = 0x1;
	/**
	 * @en Static collision filter group.
	 * @zh 静态碰撞组。
	 */
	static COLLISIONFILTERGROUP_STATICFILTER: number = 0x2;
	/**
	 * @en Kinematic rigid body collision filter group.
	 * @zh 运动学刚体碰撞组。
	 */
	static COLLISIONFILTERGROUP_KINEMATICFILTER: number = 0x4;
	/**
	 * @en Debris collision filter group.
	 * @zh 碎片碰撞组。
	 */
	static COLLISIONFILTERGROUP_DEBRISFILTER: number = 0x8;
	/**
	 * @en Sensor trigger filter group.
	 * @zh 传感器触发器。
	 */
	static COLLISIONFILTERGROUP_SENSORTRIGGER: number = 0x10;
	/**
	 * @en Character filter group.
	 * @zh 字符过滤器。
	 */
	static COLLISIONFILTERGROUP_CHARACTERFILTER: number = 0x20;
	/**
	 * @en Custom filter group 1.
	 * @zh 自定义过滤1。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER1: number = 0x40;
	/**
	 * @en Custom filter group 2.
	 * @zh 自定义过滤2。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER2: number = 0x80;
	/**
	 * @en Custom filter group 3.
	 * @zh 自定义过滤3。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER3: number = 0x100;
	/**
	 * @en Custom filter group 4.
	 * @zh 自定义过滤4。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER4: number = 0x200;
	/**
	 * @en Custom filter group 5.
	 * @zh 自定义过滤5。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER5: number = 0x400;
	/**
	 * @en Custom filter group 6.
	 * @zh 自定义过滤6。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER6: number = 0x800;
	/**
	 * @en Custom filter group 7.
	 * @zh 自定义过滤7。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER7: number = 0x1000;
	/**
	 * @en Custom filter group 8.
	 * @zh 自定义过滤8。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER8: number = 0x2000;
	/**
	 * @en Custom filter group 9.
	 * @zh 自定义过滤9。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER9: number = 0x4000;
	/**
	 * @en Custom filter group 10.
	 * @zh 自定义过滤10。
	 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER10: number = 0x8000;
	/**
	 * @en All filter group that includes all other filter groups.
	 * @zh 包含所有其他过滤组的所有过滤组。
	 */
	static COLLISIONFILTERGROUP_ALLFILTER: number = -1;
	/**
	 * @en Default mask value used in PhysX.
	 * @zh 在PhysX中使用的默认掩码值。
	 */
	static PHYSXDEFAULTMASKVALUE: number = 0xffffffff;
}


