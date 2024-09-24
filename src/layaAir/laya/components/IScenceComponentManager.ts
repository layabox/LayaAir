/**
 * @en Interface for the overall management of a type of component within a 3D scene.
 * @zh 用于3D场景中某类型组件的全面管理的接口。
 */
export interface IElementComponentManager {

    /**
     * @en An internal identifier used to find the manager by Scene3D.
     * @zh 由Scene3D用来查找管理器的内部名称。
     */
    name: string;

    /**
     * @en Initialization method called during Scene3D initialization.
     * @zh 在Scene3D初始化期间调用的方法。
     */
    Init(data: any): void;

    /**
     * @en Update method called every frame in the render loop.
     * @zh 在渲染循环中每帧调用的更新方法。
     */
    update(dt: number): void;
}