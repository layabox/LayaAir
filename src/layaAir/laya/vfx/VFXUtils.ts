import { MathUtil } from "../maths/MathUtil";
import { Rand } from "../maths/Rand";
import { Vector2 } from "../maths/Vector2";
/**
 * 从 [min, max] 范围采样，min === max 时直接返回常量，不消耗 rand 状态
 */
export function sampleRange(range: Vector2, rand: Rand): number {
    return range.x === range.y ? range.x : MathUtil.lerp(range.x, range.y, rand.getFloat());
}
