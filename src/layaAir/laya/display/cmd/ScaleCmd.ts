import { Context } from "../../renders/Context"
import { Pool } from "../../utils/Pool"
/**
 * @en Scale command
 * @zh 缩放命令
 */
export class ScaleCmd {
    /**
     * @en Identifier for the ScaleCmd
     * @zh 缩放命令的标识符
     */
    static ID: string = "Scale";

    /**
     * @en Horizontal scaling value.
     * @zh 水平方向缩放值。
     */
    scaleX: number;
    /**
     * @en Vertical scaling value.
     * @zh 垂直方向缩放值。
     */
    scaleY: number;
    /**
     * @en (Optional) Horizontal axis point coordinates.
     * @zh （可选）水平方向轴心点坐标。
     */
    pivotX: number;
    /**
     * @en (Optional) Vertical axis point coordinates.
     * @zh （可选）垂直方向轴心点坐标。
     */
    pivotY: number;

    /**
     * @private
     * @en Create a ScaleCmd instance
     * @param scaleX Horizontal scaling value
     * @param scaleY Vertical scaling value
     * @param pivotX Horizontal axis point coordinates
     * @param pivotY Vertical axis point coordinates
     * @returns ScaleCmd instance
     * @zh 创建一个缩放命令实例
     * @param scaleX 水平方向缩放值
     * @param scaleY 垂直方向缩放值
     * @param pivotX 水平方向轴心点坐标
     * @param pivotY 垂直方向轴心点坐标
     * @returns 缩放命令实例
     */
    static create(scaleX: number, scaleY: number, pivotX: number, pivotY: number): ScaleCmd {
        var cmd: ScaleCmd = Pool.getItemByClass("ScaleCmd", ScaleCmd);
        cmd.scaleX = scaleX;
        cmd.scaleY = scaleY;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {

        Pool.recover("ScaleCmd", this);
    }

    /**
     * @private
     * @en Execute the scale command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行缩放命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        context._scale(this.scaleX, this.scaleY, this.pivotX + gx, this.pivotY + gy);
    }

    /**
     * @private
     * @en The identifier for the ScaleCmd
     * @zh 缩放命令的标识符
     */
    get cmdID(): string {
        return ScaleCmd.ID;
    }

}

