import { Mesh2D } from "./Mesh2D";
/**
 * drawImage，fillRect等会用到的简单的mesh。每次添加必然是一个四边形。
 */
export declare class MeshParticle2D extends Mesh2D {
    static const_stride: number;
    private static _fixattriInfo;
    private static _POOL;
    constructor(maxNum: number);
    setMaxParticleNum(maxNum: number): void;
    /**
     *
     */
    static getAMesh(maxNum: number): MeshParticle2D;
    /**
     * 把本对象放到回收池中，以便getMesh能用。
     */
    releaseMesh(): void;
    destroy(): void;
}
