import { SingletonList } from "../../../utils/SingletonList";
import { RenderElement } from "../../../d3/core/render/RenderElement";

export interface ISortPass {
    /**
     * 排序
     * @param elements 
     * @param left 
     * @param right 
     */
    sort(elements: SingletonList<RenderElement>, isTransparent: boolean, left: number, right: number): void;
}