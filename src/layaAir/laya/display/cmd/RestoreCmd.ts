import { Context } from "../../renders/Context"
import { Pool } from "../../utils/Pool"

/**
 * @en Restore command, used in conjunction with save
 * @zh 恢复命令，与save配套使用
 */
export class RestoreCmd {
    /**
     * @en Identifier for the RestoreCmd
     * @zh 恢复命令的标识符
     */
    static ID: string = "Restore";



    /**
     * @en Create a RestoreCmd instance
     * @returns RestoreCmd instance
     * @zh 创建一个恢复命令实例
     * @returns 恢复命令实例
     */
    static create(): RestoreCmd {
        var cmd: RestoreCmd = Pool.getItemByClass("RestoreCmd", RestoreCmd);

        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {

        Pool.recover("RestoreCmd", this);
    }

    /**
     * @en Execute the restore command
     * @param context The rendering context
     * @zh 执行恢复命令
     * @param context 渲染上下文
     */
    run(context: Context): void {
        context.restore();
    }

    /**
     * @en The identifier for the RestoreCmd
     * @zh 恢复命令的标识符
     */
    get cmdID(): string {
        return RestoreCmd.ID;
    }

}