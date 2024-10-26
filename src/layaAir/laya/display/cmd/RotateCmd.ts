import { Context } from "../../renders/Context"
import { Pool } from "../../utils/Pool"

/**
 * @en Rotate command
 * @zh 旋转命令
 */
export class RotateCmd {
    /**
     * @en Identifier for the RotateCmd
     * @zh 旋转命令的标识符
     */
    static ID: string = "Rotate";

    /**
     * @en Rotation angle in radians.
     * @zh 旋转角度，以弧度计。
     */
    angle: number;
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
     * @en Create a RotateCmd instance
     * @param angle Rotation angle in radians
     * @param pivotX Horizontal axis point coordinates.
     * @param pivotY Vertical axis point coordinates.
     * @returns RotateCmd instance
     * @zh 创建一个旋转命令实例
     * @param angle 旋转角度，以弧度计。
     * @param pivotX 水平方向轴心点坐标。
     * @param pivotY 垂直方向轴心点坐标。
     * @returns 旋转命令实例
     */
    static create(angle: number, pivotX: number, pivotY: number): RotateCmd {
        var cmd: RotateCmd = Pool.getItemByClass("RotateCmd", RotateCmd);
        cmd.angle = angle;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {

        Pool.recover("RotateCmd", this);
    }

    /**
     * @en Execute the rotate command
     * @param context The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行旋转命令
     * @param context 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(context: Context, gx: number, gy: number): void {
        context._rotate(this.angle, this.pivotX + gx, this.pivotY + gy);
    }

    /**
     * @en The identifier for the RotateCmd
     * @zh 旋转命令的标识符
     */
    get cmdID(): string {
        return RotateCmd.ID;
    }

}

