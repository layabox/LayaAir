import { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { ISpineRenderDataHandle } from "../interface/ISpineRenderDataHandle";
import { ISpineFactory } from "../interface/ISpineFactory";
import { ISpineTempletParser } from "../interface/ISpineParse";
import { ISpineRender } from "../interface/ISpineRender";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { NativeSpineTempletParser } from "./NativeSpineTempletParser";
import { NativeSpineOptimizeRender2D } from "./NativeSpineOptimizeRender2D";
import { NativeSpineOptimizeRender3D } from "./NativeSpineOptimizeRender3D";
import { NativeSpineRenderDataHandle } from "./NativeSpineRenderDataHandle";


/**
 * @en Native Spine Factory for creating parsers and renderers.
 * @zh Native Spine 工厂，用于创建解析器和渲染器。
 */
export class NativeSpineFactory implements ISpineFactory {
    private _nativeFactory: any; // conchNativeSpineFactory from C++

    constructor() {
        // @ts-ignore
        this._nativeFactory = new conchNativeSpineFactory();
    }

    /**
     * @en Create Spine templet parser.
     * @returns Parser instance.
     * @zh 创建 Spine 模板解析器。
     */
    createSpineTempletParser(): ISpineTempletParser {
        return new NativeSpineTempletParser();
    }

    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        return new NativeSpineRenderDataHandle();
    }

    /**
     * @en Create Spine 2D renderer.
     * @param owner Render node.
     * @returns Renderer instance.
     * @zh 创建 Spine 2D 渲染器。
     */
    createSpineRender2D(owner: Spine2DRenderNode): ISpineRender {
        // Get native objects from owner
        const handle = owner._getRenderHandle();
        const struct = owner._struct;
        const nativeRender = this._nativeFactory.createSpineRender2D((handle as any)._nativeObj, (struct as any)._nativeObj);
        
        // Wrap in TypeScript class
        return new NativeSpineOptimizeRender2D(owner, nativeRender);
    }

    /**
     * @en Create Spine 3D renderer.
     * @param owner Render node (provides shader data internally).
     * @returns Renderer instance.
     * @zh 创建 Spine 3D 渲染器。
     * @param owner 渲染节点（内部提供 shader data）。
     */
    createSpineRender3D(owner: IBaseRenderNode): ISpineRender {
        // renderNode already contains shaderData, no need to pass it separately
        const nativeRender = this._nativeFactory.createSpineRender3D((owner as any)._nativeObj);

        // Wrap in TypeScript class
        return new NativeSpineOptimizeRender3D(owner, nativeRender);
    }
}

