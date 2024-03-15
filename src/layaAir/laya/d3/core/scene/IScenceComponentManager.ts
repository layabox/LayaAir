/**
 * Interface Overall management of a type of component
 */
export interface IElementComponentManager {

    /**@internal name used find manager by scene3D */
    name: string;

    /**@internal init by Scene3D Init*/
    Init(data: any): void;

    /**@internal update when frame loop */
    update(dt: number): void;
}