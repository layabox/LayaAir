import { SingletonList } from "../../../d3/component/SingletonList";
import { IRenderElement } from "./IRenderElement";

export interface ISortPass{
    /**
     * 排序
     * @param elements 
     * @param left 
     * @param right 
     */
    sort(elements:SingletonList<IRenderElement>,left:number,right:number):void;
}