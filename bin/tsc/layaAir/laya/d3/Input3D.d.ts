import { Touch } from "./Touch";
/**
 * <code>Input3D</code> 类用于实现3D输入。
 */
export declare class Input3D {
    /**
     * 获取触摸点个数。
     * @return 触摸点个数。
     */
    touchCount(): number;
    /**
     * 获取是否可以使用多点触摸。
     * @return 是否可以使用多点触摸。
     */
    /**
    * 设置是否可以使用多点触摸。
    * @param 是否可以使用多点触摸。
    */
    multiTouchEnabled: boolean;
    /**
     *	获取触摸点。
     * 	@param	index 索引。
     * 	@return 触摸点。
     */
    getTouch(index: number): Touch;
}
