
/**
 * @en The gradient mode.
 * @zh  渐变模式
 */
export class GradientMode {
    /**
     * @en Finds the two keys adjacent to the requested evaluation time and linearly interpolates between them to obtain a blended color.
     * @zh 找到与请求的评估时间相邻的两个键,并线性插值在他们之间,以获得一种混合的颜色。
     */
	static Blend: number = 0;

    /**
     * @en Returns a fixed color by finding the first key with a time value greater than the requested evaluation time.
     * @zh 返回一个固定的颜色，通过查找第一个键的时间值大于所请求的评估时间。
     */
	static Fixed: number = 1;
}

