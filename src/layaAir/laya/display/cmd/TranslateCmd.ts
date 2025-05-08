import { Matrix } from "../../maths/Matrix";
import { Pool } from "../../utils/Pool"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";
/**
 * @en Translate command
 * @zh 位移命令
 */
export class TranslateCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the TranslateCmd
     * @zh 位移命令的标识符
     */
    static ID: string = "Translate";

    /**
     * @en The value to be added to the horizontal coordinate (x).
     * @zh 添加到水平坐标（x）上的值。
     */
    tx: number;
    /**
     * @en The value to be added to the vertical coordinate (y).
     * @zh 添加到垂直坐标（y）上的值。
     */
    ty: number;

    /**
     * @en Create a TranslateCmd instance
     * @param tx The value to be added to the horizontal coordinate
     * @param ty The value to be added to the vertical coordinate
     * @returns TranslateCmd instance
     * @zh 创建一个位移命令实例
     * @param tx 要添加到水平坐标的值
     * @param ty 要添加到垂直坐标的值
     * @returns 位移命令实例
     */
    static create(tx: number, ty: number): TranslateCmd {
        var cmd: TranslateCmd = Pool.getItemByClass("TranslateCmd", TranslateCmd);
        cmd.tx = tx;
        cmd.ty = ty;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {

        Pool.recover("TranslateCmd", this);
    }

    /**
     * @en Execute the translate command
     * @param context The rendering context
     * @zh 执行位移命令
     * @param context 渲染上下文
     */
    run(context: GraphicsRunner): void {
        context.translate(this.tx, this.ty);
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        tempMatrix.identity();
        tempMatrix.translate(this.tx, this.ty);
        assembler.concatMatrix(tempMatrix);
    }

    /**
     * @en The identifier for the TranslateCmd
     * @zh 位移命令的标识符
     */
    get cmdID(): string {
        return TranslateCmd.ID;
    }
}

const tempMatrix = new Matrix();

