import { Matrix } from "../../maths/Matrix"
import { Pool } from "../../utils/Pool"
import { type GraphicsCommandInfo, IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";
import { GraphicsCommandInfoHelper } from "../Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";

const className = "TransformCmd";

/**
 * @en Transform command
 * @zh 矩阵变换命令
 * @blueprintIgnore
 */
export class TransformCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the TransformCmd
     * @zh 矩阵变换命令的标识符
     */
    static readonly ID: string = className;

    /**
     * @en The transformation matrix.
     * @zh 变换矩阵。
     */
    matrix: Matrix;
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
     * @en Create a TransformCmd instance
     * @param matrix The transformation matrix
     * @param pivotX Horizontal axis point coordinates
     * @param pivotY Vertical axis point coordinates
     * @returns TransformCmd instance
     * @zh 创建一个矩阵变换命令实例
     * @param matrix 变换矩阵
     * @param pivotX 水平方向轴心点坐标
     * @param pivotY 垂直方向轴心点坐标
     * @returns 矩阵变换命令实例
     */
    static create(matrix: Matrix, pivotX: number, pivotY: number): TransformCmd {
        var cmd: TransformCmd = Pool.getItemByClass(className, TransformCmd);
        cmd.matrix = matrix;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.matrix = null;
        Pool.recover(className, this);
    }

    /**
     * @en Execute the transform command
     * @param runner The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行矩阵变换命令
     * @param runner 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        runner._transform(this.matrix, this.pivotX + gx, this.pivotY + gy);
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        tempMatrix.identity();
        tempMatrix.translate(-this.pivotX, -this.pivotY);
        tempMatrix.concat(this.matrix);
        tempMatrix.translate(this.pivotX, this.pivotY);
        assembler.concatMatrix(tempMatrix);
    }

    /**
     * @en The identifier for the TransformCmd
     * @zh 矩阵变换命令的标识符
     */
    get cmdID(): string {
        return TransformCmd.ID;
    }

    /** @internal */
    getGraphicsCommandInfo(out: GraphicsCommandInfo): GraphicsCommandInfo {
        return GraphicsCommandInfoHelper.writeState(out);
    }

}

const tempMatrix = new Matrix();
