/**
 * <code>Physics</code> 类用于简单物理检测。
 */
export class Physics3DUtils {
	/**默认碰撞组 */
	static COLLISIONFILTERGROUP_DEFAULTFILTER: number = 0x1;
	/**静态碰撞组 */
	static COLLISIONFILTERGROUP_STATICFILTER: number = 0x2;
	/**运动学刚体碰撞组 */
	static COLLISIONFILTERGROUP_KINEMATICFILTER: number = 0x4;
	/**碎片碰撞组 */
	static COLLISIONFILTERGROUP_DEBRISFILTER: number = 0x8;
	/**传感器触发器*/
	static COLLISIONFILTERGROUP_SENSORTRIGGER: number = 0x10;
	/**字符过滤器 */
	static COLLISIONFILTERGROUP_CHARACTERFILTER: number = 0x20;
	/**自定义过滤1 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER1: number = 0x40;
	/**自定义过滤2 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER2: number = 0x80;
	/**自定义过滤3 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER3: number = 0x100;
	/**自定义过滤4 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER4: number = 0x200;
	/**自定义过滤5 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER5: number = 0x400;
	/**自定义过滤6 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER6: number = 0x800;
	/**自定义过滤7 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER7: number = 0x1000;
	/**自定义过滤8 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER8: number = 0x2000;
	/**自定义过滤9 */
	static COLLISIONFILTERGROUP_CUSTOMFILTER9: number = 0x4000;
	/**自定义过滤10*/
	static COLLISIONFILTERGROUP_CUSTOMFILTER10: number = 0x8000;
	/**所有过滤 */
	static COLLISIONFILTERGROUP_ALLFILTER: number = -1;
	/**PHYSX默认分组 */
	static PHYSXDEFAULTMASKVALUE: number = 0xffffffff;
}


