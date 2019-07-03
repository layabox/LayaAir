import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { TrailFilter } from "././TrailFilter";
/**
 * <code>TrailGeometry</code> 类用于创建拖尾渲染单元。
 */
export declare class TrailGeometry extends GeometryElement {
    /** 轨迹准线_面向摄像机。*/
    static ALIGNMENT_VIEW: number;
    /** 轨迹准线_面向运动方向。*/
    static ALIGNMENT_TRANSFORM_Z: number;
    private tmpColor;
    constructor(owner: TrailFilter);
    /**
     * @inheritDoc
     */
    _getType(): number;
    /**
     * @inheritDoc
     */
    _prepareRender(state: RenderContext3D): boolean;
    /**
     * @inheritDoc
     */
    _render(state: RenderContext3D): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
