import { Node } from "../../display/Node";
import { Handler } from "../../utils/Handler";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Transform3D } from "./Transform3D";
import { ICreateResource } from "../../resource/ICreateResource";
/**
 * <code>Sprite3D</code> 类用于实现3D精灵。
 */
export declare class Sprite3D extends Node implements ICreateResource {
    /**Hierarchy资源。*/
    static HIERARCHY: string;
    /**
     * 创建精灵的克隆实例。
     * @param	original  原始精灵。
     * @param   parent    父节点。
     * @param   worldPositionStays 是否保持自身世界变换。
     * @param	position  世界位置,worldPositionStays为false时生效。
     * @param	rotation  世界旋转,worldPositionStays为false时生效。
     * @return  克隆实例。
     */
    static instantiate(original: Sprite3D, parent?: Node, worldPositionStays?: boolean, position?: Vector3, rotation?: Quaternion): Sprite3D;
    /**
     * 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回掉。
     */
    static load(url: string, complete: Handler): void;
    /**
     * 获取唯一标识ID。
     *   @return	唯一标识ID。
     */
    readonly id: number;
    /**
     * 获取蒙版。
     * @return	蒙版。
     */
    /**
    * 设置蒙版。
    * @param	value 蒙版。
    */
    layer: number;
    /**
     * 获取资源的URL地址。
     * @return URL地址。
     */
    readonly url: string;
    /**
     * 获取是否为静态。
     * @return 是否为静态。
     */
    readonly isStatic: boolean;
    /**
     * 获取精灵变换。
     * @return 精灵变换。
     */
    readonly transform: Transform3D;
    /**
     * 创建一个 <code>Sprite3D</code> 实例。
     * @param name 精灵名称。
     * @param isStatic 是否为静态。
     */
    constructor(name?: string, isStatic?: boolean);
    /**
     *
     */
    _setCreateURL(url: string): void;
    /**
     * @inheritDoc
     */
    protected _onAdded(): void;
    /**
     * @inheritDoc
     */
    protected _onRemoved(): void;
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    _cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): Node;
    /**
     * @inheritDoc
     */
    destroy(destroyChild?: boolean): void;
}
