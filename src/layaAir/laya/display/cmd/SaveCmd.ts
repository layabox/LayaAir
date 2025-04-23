import { Pool } from "../../utils/Pool"
import { IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

/**
 * @en Save command, used in conjunction with restore
 * @zh 存储命令，与restore配套使用
 */
export class SaveCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the SaveCmd
     * @zh 存储命令的标识符
     */
    static ID: string = "Save";

    /**
     * @en Create a SaveCmd instance
     * @returns SaveCmd instance
     * @zh 创建一个存储命令实例
     * @returns 存储命令实例
     */
    static create(): SaveCmd {
        return Pool.getItemByClass("SaveCmd", SaveCmd);
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        Pool.recover("SaveCmd", this);
    }

    /**
     * @en Execute the save command
     * @param runner The rendering context
     * @zh 执行存储命令
     * @param runner 渲染上下文
     */
    run(runner: GraphicsRunner): void {
        runner.save();
    }

    /**
     * @en The identifier for the SaveCmd
     * @zh 存储命令的标识符
     */
    get cmdID(): string {
        return SaveCmd.ID;
    }
}

