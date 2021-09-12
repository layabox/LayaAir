import { Resource } from "../../resource/Resource";
import { Animator } from "./Animator";

/**
 * 用来描述动画层遮罩
 */
export class AvatarMask{
    /**@internal */
    private _avatarPathMap:{[key:string]:boolean} = {};
    private _catchAnimator:Animator;
    /**
     * 创建一个<code>AvatarMask</code>实例
     */
    constructor(animator:Animator){
        this._catchAnimator = animator;
    }

    /**
     * 获得动态
     */
    get getCatchAnimator():Animator{
        return this._catchAnimator;
    }

    /**
     * 查找节点路径遮罩
     * @param path 
     * @returns 
     */
    getTransformActive(path:string):boolean{
        return this._avatarPathMap[path];
    }

    /**
     * 设置
     * @param path 
     * @param value 
     */
    setTransformActive(path:string,value:boolean){
        this._avatarPathMap[path] = value;
    }

    /**
     * 获得遮罩信息
     * @returns 
     */
    getAllTranfromPath(){
        return this._avatarPathMap;
    }

}
