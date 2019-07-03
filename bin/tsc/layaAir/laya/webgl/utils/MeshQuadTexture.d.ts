import { Mesh2D } from "./Mesh2D";
/**
 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
 */
export declare class MeshQuadTexture extends Mesh2D {
    static const_stride: number;
    private static _fixib;
    private static _maxIB;
    private static _fixattriInfo;
    private static _POOL;
    constructor();
    /**
     *
     */
    static getAMesh(mainctx: boolean): MeshQuadTexture;
    /**
     * 把本对象放到回收池中，以便getMesh能用。
     */
    releaseMesh(): void;
    destroy(): void;
    /**
     *
     * @param	pos
     * @param	uv
     * @param	color
     * @param	clip   ox,oy,xx,xy,yx,yy
     * @param 	useTex 是否使用贴图。false的话是给fillRect用的
     */
    addQuad(pos: any[], uv: ArrayLike<number>, color: number, useTex: boolean): void;
}
