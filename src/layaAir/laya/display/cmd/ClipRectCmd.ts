import { Pool } from "../../utils/Pool"
import { type GraphicsCommandInfo, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";
import { GraphicsCommandInfoHelper } from "../Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";

const className = "ClipRectCmd";

/**
 * @deprecated Use `Sprite.scrollRect` instead. Graphics command clipping is no longer supported.
 * @en Clip command
 * @zh 裁剪命令
 * @zh 已弃用。请改用 `Sprite.scrollRect`，Graphics 命令裁剪已不再支持。
 * @blueprintIgnore
 */
export class ClipRectCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the ClipRectCmd
     * @zh 裁剪命令的标识符
     */
    static readonly ID: string = className;
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
        var cmd: ClipRectCmd = Pool.getItemByClass(className, ClipRectCmd);
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
        Pool.recover(className, this);
    }

    /**
     * @en Execute the clip rectangle command in the given context.
     * @param runner The rendering context.
     * @param gx The global x coordinate.
     * @param gy The global y coordinate.
     * @zh 在给定的上下文中执行裁剪矩形命令。
     * @param runner 渲染上下文。
     * @param gx 全局 x 坐标。
     * @param gy 全局 y 坐标。
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        console.warn("ClipRectCmd is deprecated and no longer supported. Use Sprite.scrollRect so clipping is handled by the render struct.");
    }

    /**
     * @en The identifier for the ClipRectCmd
     * @zh 裁剪命令的标识符
     */
    get cmdID(): string {
        return ClipRectCmd.ID;
    }

    /** @internal */
    getGraphicsCommandInfo(out: GraphicsCommandInfo): GraphicsCommandInfo {
        return GraphicsCommandInfoHelper.writeState(out);
    }
}
