import { Context } from "../../renders/Context"
import { Pool } from "../../utils/Pool"

/**
 * @en Save command, used in conjunction with restore
 * @zh 存储命令，与restore配套使用
 */
export class SaveCmd {
    /**
     * @en Identifier for the SaveCmd
     * @zh 存储命令的标识符
     */
    static ID: string = "Save";



    /**
     * @private
     * @en Create a SaveCmd instance
     * @returns SaveCmd instance
     * @zh 创建一个存储命令实例
     * @returns 存储命令实例
     */
    static create(): SaveCmd {
        var cmd: SaveCmd = Pool.getItemByClass("SaveCmd", SaveCmd);

        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {

        Pool.recover("SaveCmd", this);
    }

    /**
     * @private
     * @en Execute the save command
     * @param context The rendering context
     * @zh 执行存储命令
     * @param context 渲染上下文
     */
    run(context: Context): void {
        context.save();
    }

    /**
     * @private
     * @en The identifier for the SaveCmd
     * @zh 存储命令的标识符
     */
    get cmdID(): string {
        return SaveCmd.ID;
    }

}

