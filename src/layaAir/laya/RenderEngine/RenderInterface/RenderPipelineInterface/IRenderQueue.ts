// import { SingletonList } from "../../../utils/SingletonList";
// import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
// import { RenderElement } from "../../../d3/core/render/RenderElement";
// import { IRenderContext3D } from "../../../d3/RenderDriverLayer/IRenderContext3D";

// /**
//  * RenderQueue,渲染队列
//  */
// export interface IRenderQueue {
//     /** @interanl */
//     _isTransparent: boolean;
//     /** @internal */
//     elements: SingletonList<RenderElement>;
//     /**@internal 共享渲染数据 */
//     _context: IRenderContext3D
//     /**
//      * @param context 渲染上下文
//      * @return 返回渲染数量
//      */
//     renderQueue(context: RenderContext3D): number;
//     //增加渲染队列
//     addRenderElement(renderElement: RenderElement): void;
//     //清除队列
//     clear(): void
//     //destroy
//     destroy():void;


// }