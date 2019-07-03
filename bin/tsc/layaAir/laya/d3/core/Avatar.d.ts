import { IClone } from "./IClone";
import { Animator } from "../component/Animator";
import { Resource } from "../../resource/Resource";
import { Handler } from "../../utils/Handler";
/**
 * <code>Avatar</code> 类用于创建Avatar。
 */
export declare class Avatar extends Resource implements IClone {
    /**Avatar资源。*/
    static AVATAR: string;
    /**
     * @inheritDoc
     */
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): Avatar;
    /**
     * 加载Avatar文件。
     * @param url Avatar文件。
     * @param complete 完成回掉。
     */
    static load(url: string, complete: Handler): void;
    /** [NATIVE]*/
    private _nativeNodeCount;
    /**
     * 创建一个 <code>Avatar</code> 实例。
     */
    constructor();
    private _initCloneToAnimator;
    private _parseNode;
    /**
     * 克隆数据到Avatr。
     * @param	destObject 克隆源。
     */
    _cloneDatasToAnimator(destAnimator: Animator): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
