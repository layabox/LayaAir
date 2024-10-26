import { Context, IGraphicCMD } from "../../renders/Context"
import { Pool } from "../../utils/Pool"

/**
 * @en Alpha command.
 * @zh 透明命令
 */
export class AlphaCmd implements IGraphicCMD {
    /**
     * @en Identifier for the AlphaCmd
     * @zh 透明命令的标识符
     */
    static ID: string = "Alpha";

    /**
     * @en The opacity level of the command.
     * @zh 透明度值。
     */
    alpha: number;

    /**
     * @en Creates or retrieves an AlphaCmd instance from the object pool and initializes it with the specified alpha value.
     * @param alpha The alpha value to set for the AlphaCmd instance.
     * @returns An AlphaCmd instance initialized with the given alpha value.
     * @zh 从对象池创建或获取一个 AlphaCmd 实例，并使用指定的 alpha 值进行初始化。
     * @param alpha 用于设置 AlphaCmd 实例的 alpha 值。
     * @returns 一个已用给定 alpha 值初始化的 AlphaCmd 实例。
     */
    static create(alpha: number): AlphaCmd {
        var cmd: AlphaCmd = Pool.getItemByClass("AlphaCmd", AlphaCmd);
        cmd.alpha = alpha;
        return cmd;
    }

    /**
     * @en Recovers the `AlphaCmd` instance to the object pool for reuse.
     * @zh 将 `AlphaCmd` 实例回收到对象池以供重用。
     */
    recover(): void {
        Pool.recover("AlphaCmd", this);
    }

    /**
     * @en Execute the alpha command in the given context.
     * @param context The rendering context.
     * @param gx The global x coordinate (unused in this method).
     * @param gy The global y coordinate (unused in this method).
     * @zh 在给定的上下文中执行 alpha 命令。
     * @param context 渲染上下文。
     * @param gx 全局 x 坐标（本方法中未使用）。
     * @param gy 全局 y 坐标（本方法中未使用）。
     */
    run(context: Context, gx: number, gy: number): void {
        context.alpha(this.alpha);
    }

    /**
     * @en Get the identifier for the AlphaCmd
     * @zh 获得透明命令的标识符
     */
    get cmdID(): string {
        return AlphaCmd.ID;
    }
}

