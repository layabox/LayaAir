/**
 * @en Interface for the overall management of a type of component within a 3D scene.
 * @zh 3D 场景中某种类型组件的全面管理接口
 * @blueprintIgnore
 */
export interface IElementComponentManager {

    /**
     * @en An internal identifier used to find the manager by Scene3D.
     * @zh 用于通过 Scene3D 查找管理器的内部标识符
     */
    name: string;

    /**
     * @en Initialization method called during Scene3D initialization.
     * @zh 在 Scene3D 初始化过程中调用的初始化方法
     */
    Init(data: any): void;

    /**
     * @en Update method called every frame in the render loop.
     * @zh 渲染循环中每一帧调用的更新方法
     */
    update(dt: number): void;

    /**
     * @en This method is called to clean up resources and perform any necessary destruction tasks for the manager.
     * @zh 该方法用于清理资源并执行管理器所需的销毁任务。
     */
    destroy(): void;
}