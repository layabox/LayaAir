import { BaseRender } from "../../../d3/core/render/BaseRender";
import { FastSinglelist, SingletonList } from "../../../utils/SingletonList";
import { BaseRenderType, IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { IBatchModuleAgent } from "./IBatchModuleAgent";



/**
 * 可替换的SceneManager
 */
export interface ISceneRenderManager {

    list: FastSinglelist<BaseRender>;
    baseRenderList: SingletonList<IBaseRenderNode>;
    batchAgentList: Map<number, IBatchModuleAgent>;
    /**
     * 注册批处理模块
     * @param agent 
     */
    registerBatchModuleAgent(renderNodeType: number | BaseRenderType, agent: IBatchModuleAgent): void;
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
     */
    updateMotionObjects(): void;

    /**
     * 更新属性
     * @param object 
     * @param property 
     */
    updateProperty(object: BaseRender, property: string | number): void;

    /**
     * release Manager Node
     */
    destroy(): void;
}