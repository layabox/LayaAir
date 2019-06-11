import { TrailFilter } from "././TrailFilter";
import { TrailRenderer } from "././TrailRenderer";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Node } from "laya/display/Node";
/**
 * <code>TrailSprite3D</code> 类用于创建拖尾渲染精灵。
 */
export declare class TrailSprite3D extends RenderableSprite3D {
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __init__(): void;
    /** @private */
    private _geometryFilter;
    /**
     * 获取Trail过滤器。
     * @return  Trail过滤器。
     */
    readonly trailFilter: TrailFilter;
    /**
     * 获取Trail渲染器。
     * @return  Trail渲染器。
     */
    readonly trailRenderer: TrailRenderer;
    constructor(name?: string);
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    _cloneTo(destObject: any, srcSprite: Node, dstSprite: Node): void;
    /**
     * <p>销毁此对象。</p>
     * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(destroyChild?: boolean): void;
    /**
     * @private
     */
    protected _create(): Node;
}
