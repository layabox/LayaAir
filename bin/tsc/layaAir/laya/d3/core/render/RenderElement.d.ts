import { BaseRender } from "././BaseRender";
import { RenderContext3D } from "././RenderContext3D";
import { RenderQueue } from "././RenderQueue";
import { GeometryElement } from "../GeometryElement";
import { Transform3D } from "../Transform3D";
import { BaseMaterial } from "../material/BaseMaterial";
import { Shader3D } from "../../shader/Shader3D";
/**
 * @private
 * <code>RenderElement</code> 类用于实现渲染元素。
 */
export declare class RenderElement {
    /** @private */
    static RENDERTYPE_NORMAL: number;
    /** @private */
    static RENDERTYPE_STATICBATCH: number;
    /** @private */
    static RENDERTYPE_INSTANCEBATCH: number;
    /** @private */
    static RENDERTYPE_VERTEXBATCH: number;
    /** @private */
    _transform: Transform3D;
    /** @private */
    _geometry: GeometryElement;
    /** @private */
    material: BaseMaterial;
    /** @private */
    render: BaseRender;
    /** @private */
    staticBatch: GeometryElement;
    /** @private */
    renderType: number;
    /**
     * 创建一个 <code>RenderElement</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    getInvertFront(): boolean;
    /**
     * @private
     */
    setTransform(transform: Transform3D): void;
    /**
     * @private
     */
    setGeometry(geometry: GeometryElement): void;
    /**
     * @private
     */
    addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void;
    /**
     * @private
     */
    addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void;
    /**
     * @private
     */
    _render(context: RenderContext3D, isTarget: boolean, customShader?: Shader3D, replacementTag?: string): void;
    /**
     * @private
     */
    destroy(): void;
}
