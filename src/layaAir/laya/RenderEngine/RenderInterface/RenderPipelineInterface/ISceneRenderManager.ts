import { IBaseRenderNode } from "../../../d3/RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { SingletonList } from "../../../utils/SingletonList";

/**
 * 可替换的SceneManager
 */
export interface ISceneRenderManager {

    list: SingletonList<BaseRender>;
    baseRenderList:SingletonList<IBaseRenderNode>

    /**
     * add one BaseRender
     * @param object 
     */
    addRenderObject(object: BaseRender): void;
    /**
     * remove RenderObject
     * @param object 
     */
    removeRenderObject(object: BaseRender): void;
    /**
     * 移除某个动态的渲染节点
     * @param object 
     */
    removeMotionObject(object: BaseRender): void;
    /**
     * 增加运动物体
     * @param object 
     */
    addMotionObject(object: BaseRender): void;
    /**
     * 更新运动物体
     * @param object 
     */
    updateMotionObjects(): void;
    /**
     * release Manager Node
     */
    destroy(): void;
}