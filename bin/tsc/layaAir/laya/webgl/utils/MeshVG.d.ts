import { Mesh2D } from "././Mesh2D";
import { Context } from "../../resource/Context";
/**
 * 用来画矢量的mesh。顶点格式固定为 x,y,rgba
 */
export declare class MeshVG extends Mesh2D {
    static const_stride: number;
    private static _fixattriInfo;
    private static _POOL;
    constructor();
    static getAMesh(mainctx: boolean): MeshVG;
    /**
     * 往矢量mesh中添加顶点和index。会把rgba和points在mesh中合并。
     * @param	points	顶点数组，只包含x,y。[x,y,x,y...]
     * @param	rgba	rgba颜色
     * @param	ib		index数组。
     */
    addVertAndIBToMesh(ctx: Context, points: any[], rgba: number, ib: any[]): void;
    /**
     * 把本对象放到回收池中，以便getMesh能用。
     */
    releaseMesh(): void;
    destroy(): void;
}
