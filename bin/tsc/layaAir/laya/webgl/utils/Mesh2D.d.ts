/// <reference types="webgl2" />
import { VertexBuffer2D } from "./VertexBuffer2D";
import { IndexBuffer2D } from "./IndexBuffer2D";
/**
 * Mesh2d只是保存数据。描述attribute用的。本身不具有渲染功能。
 */
export declare class Mesh2D {
    _stride: number;
    vertNum: number;
    indexNum: number;
    protected _applied: boolean;
    _vb: VertexBuffer2D;
    _ib: IndexBuffer2D;
    private _vao;
    private static _gvaoid;
    private _attribInfo;
    protected _quadNum: number;
    canReuse: boolean;
    /**
     *
     * @param	stride
     * @param	vballoc  vb预分配的大小。主要是用来提高效率。防止不断的resizebfufer
     * @param	iballoc
     */
    constructor(stride: number, vballoc: number, iballoc: number);
    /**
     * 重新创建一个mesh。复用这个对象的vertex结构，ib对象和attribinfo对象
     */
    cloneWithNewVB(): Mesh2D;
    /**
     * 创建一个mesh，使用当前对象的vertex结构。vb和ib自己提供。
     * @return
     */
    cloneWithNewVBIB(): Mesh2D;
    /**
     * 获得一个可以写的vb对象
     */
    getVBW(): VertexBuffer2D;
    /**
     * 获得一个只读vb
     */
    getVBR(): VertexBuffer2D;
    getIBR(): IndexBuffer2D;
    /**
     * 获得一个可写的ib
     */
    getIBW(): IndexBuffer2D;
    /**
     * 直接创建一个固定的ib。按照固定四边形的索引。
     * @param	var QuadNum
     */
    createQuadIB(QuadNum: number): void;
    /**
     * 设置mesh的属性。每3个一组，对应的location分别是0,1,2...
     * 含义是：type,size,offset
     * 不允许多流。因此stride是固定的，offset只是在一个vertex之内。
     * @param	attribs
     */
    setAttributes(attribs: any[]): void;
    /**
     * 初始化VAO的配置，只需要执行一次。以后使用的时候直接bind就行
     * @param	gl
     */
    private configVAO;
    /**
     * 应用这个mesh
     * @param	gl
     */
    useMesh(gl: WebGL2RenderingContext): void;
    getEleNum(): number;
    /**
     * 子类实现。用来把自己放到对应的回收池中，以便复用。
     */
    releaseMesh(): void;
    /**
     * 释放资源。
     */
    destroy(): void;
    /**
     * 清理vb数据
     */
    clearVB(): void;
}
