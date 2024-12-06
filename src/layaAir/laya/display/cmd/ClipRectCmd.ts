import { Context, IGraphicCMD } from "../../renders/Context"
import { Pool } from "../../utils/Pool"

/**
 * @en Clip command
 * @zh 裁剪命令
 */
export class ClipRectCmd  implements IGraphicCMD{
    /**
     * @en Identifier for the ClipRectCmd
     * @zh 裁剪命令的标识符
     */
    static ID: string = "ClipRect";
    /**
     * @en X-axis offset.
     * @zh X 轴偏移量。
     */
    x: number;
    /**
     * @en Y-axis offset.
     * @zh Y 轴偏移量。
     */
    y: number;
    /**
     * @en Width of the clip rectangle.
     * @zh 裁剪矩形的宽度。
     */
    width: number;
    /**
     * @en Height of the clip rectangle.
     * @zh 裁剪矩形的高度。
     */
    height: number;

    /**
     * @en Creates or retrieves a ClipRectCmd instance from the object pool and initializes it with the specified parameters.
     * @param x The x-coordinate of the top-left corner of the clip rectangle.
     * @param y The y-coordinate of the top-left corner of the clip rectangle.
     * @param width The width of the clip rectangle.
     * @param height The height of the clip rectangle.
     * @returns A ClipRectCmd instance initialized with the given parameters.
     * @zh 从对象池创建或获取一个 ClipRectCmd 实例，并使用指定的参数进行初始化。
     * @param x 裁剪矩形左上角的 x 坐标。
     * @param y 裁剪矩形左上角的 y 坐标。
     * @param width 裁剪矩形的宽度。
     * @param height 裁剪矩形的高度。
     * @returns 一个已用给定参数初始化的 ClipRectCmd 实例。
     */
    static create(x: number, y: number, width: number, height: number): ClipRectCmd {
        var cmd: ClipRectCmd = Pool.getItemByClass("ClipRectCmd", ClipRectCmd);
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        return cmd;
    }

    /**
     * @en Recycle the instance to the object pool.
     * @zh 将实例回收到对象池。
     */
    recover(): void {

        Pool.recover("ClipRectCmd", this);
    }

    /**
     * @en Execute the clip rectangle command in the given context.
     * @param context The rendering context.
     * @param gx The global x coordinate.
     * @param gy The global y coordinate.
     * @zh 在给定的上下文中执行裁剪矩形命令。
     * @param context 渲染上下文。
     * @param gx 全局 x 坐标。
     * @param gy 全局 y 坐标。
     */
    run(context: Context, gx: number, gy: number): void {
        context.clipRect(this.x + gx, this.y + gy, this.width, this.height);
    }

    /**
     * @en The identifier for the ClipRectCmd
     * @zh 裁剪命令的标识符
     */
    get cmdID(): string {
        return ClipRectCmd.ID;
    }

}

