import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { PostProcess2DEffect } from "../RenderDriver/RenderModuleData/WebModuleData/2D/PostProcess2DEffect";
import { Render2D } from "../renders/Render2D";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { MeshQuadTexture } from "../webgl/utils/MeshQuadTexture";
import { ColorFilter } from "./ColorFilter";
import { IFilter } from "./IFilter";

/**
 * @en The `Filter` class is the base class for filters. Filters are post-processing operations on nodes, so they inevitably operate on a renderTexture.
 * @zh Filter 是滤镜基类。滤镜是针对节点的后处理过程，所以必然操作一个rendertexture
 */
export abstract class Filter extends EventDispatcher implements IFilter {
    /**
     * @private 
     * @en color filter
     * @zh 颜色滤镜。
     */
    static COLOR = 0x20;
    /** @internal*/
    _glRender: any;

    /**
     * @en The coordinate of the result origin, relative to the original origin of the sprite. If extended, left and top may be negative.
     * @zh 结果原点的坐标，相对于sprite的原始原点。如果进行了扩展，left 和 top 可能是负值。
     */
    protected left = 0;
    protected top = 0;
    /**
     * @en The size of the rendering result.
     * @zh 渲染结果的大小。
     */
    protected width = 0;
    protected height = 0;
    protected texture: RenderTexture2D;  //TODO 创建 优化
    protected _render2D: Render2D;

    /**
     * @en Current usage
     * @zh 当前使用的
     */
    protected _rectMesh: MeshQuadTexture;
    protected _rectMeshVB: Float32Array;

    /**
     * @en Version with normal UV coordinates
     * @zh uv坐标正常的版本
     */
    private _rectMeshNormY: MeshQuadTexture;
    private _rectMeshVBNormY: Float32Array;
    /**
     * @en Version of UV coordinate flipping
     * @zh uv坐标翻转的版本
     */
    private _rectMeshInvY: MeshQuadTexture;
    private _rectMeshVBInvY: Float32Array;

    /**
     * @ignore
     */
    constructor() {
        super();
        let rect1 = this._rectMeshNormY = new MeshQuadTexture();
        rect1.addQuad([0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], 0xffffffff, true)
        this._rectMeshVBNormY = new Float32Array(rect1.vbBuffer);

        let rectInvY = this._rectMeshInvY = new MeshQuadTexture();
        rectInvY.addQuad([0, 0, 1, 0, 1, 1, 0, 1], [0, 1, 1, 1, 1, 0, 0, 0], 0xffffffff, true)
        this._rectMeshVBInvY = new Float32Array(rectInvY.vbBuffer);
        this.useFlipY(false);
    }

    protected onChange() {
        this.event(Event.CHANGED);
    }

    /**
     * @en Sets the mesh and vertex buffer to use based on whether Y-flip is needed.
     * @zh 根据是否需要翻转 Y 坐标来设置使用的网格和顶点缓冲区。
     */
    useFlipY(b: boolean) {
        this._rectMesh = b ? this._rectMeshInvY : this._rectMeshNormY;
        this._rectMeshVB = b ? this._rectMeshVBInvY : this._rectMeshVBNormY;
    }

    abstract getEffect(): PostProcess2DEffect;

    /**
     * @en The setter for the Render2D object used for rendering.
     * @zh 用于设置渲染用的 Render2D 对象。
     */
    set render2D(r: Render2D) {
        this._render2D = r;
    }

    /**
     * @private
     * @en Gets the type of the filter.
     * @zh 获取滤镜类型。
     */
    get type(): number { return -1 }

    /**
     * @en Applies multiple filters to a sprite within the given context.
     * @param this The context in which this function is executed, typically a RenderSprite instance.
     * @param sprite The sprite to which the filters are applied.
     * @param context The current rendering context.
     * @param x The x-coordinate at which the sprite is being rendered.
     * @param y The y-coordinate at which the sprite is being rendered.
     * @zh 在给定的上下文中为精灵应用多个滤镜。
     * @param this 执行此函数的上下文，通常是 RenderSprite 实例。
     * @param sprite 应用滤镜的精灵。
     * @param context 当前的渲染上下文。
     * @param x 精灵正在渲染的 x 坐标。
     * @param y 精灵正在渲染的 y 坐标。
     */
    static _filter = function (this: any, sprite: Sprite, context: any, x: number, y: number): void {
    }
}