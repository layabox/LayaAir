/**
 * @en Interface for the overall management of a type of component within a 3D scene.
 * @zh 用于全面管理场景中的某一类组件的界面。
 */
export interface IElementComponentManager {
    /**
     * @en An internal identifier used to find the manager by Scene.
     * @zh 用于按Scene查找管理器的内部标识符。
     */
    name: string;

    /**
     * @en Initialization method called during Scene initialization.
     * @zh 在Scene初始化期间调用的初始化方法。
     */
    init(data: any): void;

    /**
     * @en Update method called every frame in the render loop.
     * @zh 在渲染循环中的每帧调用
     */
    update(dt: number): void;
}