import { Bounds } from "../../math/Bounds";

export interface IBaseRenderNode {
    renderQueue: number[];
    sortingFudge: number;
    distanceForSort: number;
    castShadow: boolean;
    enable: boolean;
    renderbitFlag: number
    layer: number;
    bounds: Bounds;
    customCull: boolean;
    customCullResoult: boolean;
    _commonUniformMap: Array<string>;
    staticMask: number;
}