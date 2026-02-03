import { Bridge3DSprite } from "../Bridge3DSprite";
import { RenderListQueue } from "../../../layaAir/laya/RenderDriver/DriverCommon/RenderListQueue";
import { IRenderContext2D } from "../../../layaAir/laya/RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { FastSinglelist } from "laya/utils/SingletonList";

/**
 * Bridge3D队列收集器，收集所有Bridge3DRenderElement的_opaqueList
 *
 * @remarks
 * 该类负责从所有注册的Bridge3DSprite中收集不透明渲染队列，
 * 用于Bridge3DCamera的阴影渲染。收集过程包括：
 * 1. 遍历所有Bridge3DSprite
 * 2. 调用每个Bridge3DRenderElement的_prepare方法
 * 3. 收集填充好的_opaqueList队列
 * 4. 返回队列列表供Bridge3DCamera使用
 */
export class Bridge3DQueueCollector {

    /**
     * 收集所有Bridge3D的不透明渲染队列
     *
     * @param bridge3DSprites 所有注册的Bridge3DSprite
     * @param out 
     *
     * @remarks
     * 该方法是Bridge3D阴影渲染的核心步骤之一：
     * 1. 遍历所有Bridge3DSprite，获取其Bridge3DRenderElement
     * 2. 调用Bridge3DRenderElement的_prepare方法，这会填充_opaqueList和_transparentList
     * 3. 收集所有非空的_opaqueList队列（用于阴影渲染）
     */
    static collectOpaqueQueues(
        bridge3DSprites: Bridge3DSprite[],
        out: FastSinglelist<RenderListQueue>
    ): void {

        // 遍历所有Bridge3DSprite
        for (const bridge3DSprite of bridge3DSprites) {
            if (!bridge3DSprite) {
                continue;
            }

            // 获取Bridge3DRenderElement
            const bridge3DElement = bridge3DSprite.bridge3DRenderElement;
            if (!bridge3DElement) {
                continue;
            }

            // 收集不透明队列（用于阴影渲染）
            const opaqueList = bridge3DElement.getOpaqueList();
            if (opaqueList && opaqueList.elements && opaqueList.elements.length > 0) {
                out.add(opaqueList);
            }
        }
    }

    /**
     * 收集所有Bridge3D的透明渲染队列
     *
     * @param bridge3DSprites 所有注册的Bridge3DSprite
     * @param context2D 2D渲染上下文
     * @returns 透明渲染队列列表
     *
     * @remarks
     * 该方法用于收集透明渲染队列，虽然当前Bridge3DCamera主要关注阴影渲染（不透明对象），
     * 但为了完整性和未来扩展，也提供透明队列的收集功能。
     */
    static collectTransparentQueues(
        bridge3DSprites: Bridge3DSprite[],
        out: FastSinglelist<RenderListQueue>
    ): void {

        // 遍历所有Bridge3DSprite
        for (const bridge3DSprite of bridge3DSprites) {
            if (!bridge3DSprite) {
                continue;
            }

            // 获取Bridge3DRenderElement
            const bridge3DElement = bridge3DSprite.bridge3DRenderElement
            if (!bridge3DElement) {
                continue;
            }

            // 注意：这里假设_prepare已经被调用过了
            // 在实际使用中，通常先调用collectOpaqueQueues，然后再调用这个方法

            // 收集透明队列
            const transparentList = bridge3DElement.getTransparentList();
            if (transparentList && transparentList.elements && transparentList.elements.length > 0) {
                out.add(transparentList);
            }
        }
    }

    /**
     * 收集所有Bridge3D的渲染队列（包括不透明和透明）
     *
     * @param bridge3DSprites 所有注册的Bridge3DSprite
     * @returns 包含不透明和透明队列的对象
     *
     * @remarks
     * 该方法一次性收集所有类型的渲染队列，避免重复调用_prepare方法。
     * 返回的对象包含：
     * - opaqueQueues: 不透明渲染队列列表
     * - transparentQueues: 透明渲染队列列表
     */
    static collectAllQueues(
        bridge3DSprites: Bridge3DSprite[],
    ): { opaqueQueues: RenderListQueue[], transparentQueues: RenderListQueue[] } {

        const result = {
            opaqueQueues: [] as RenderListQueue[],
            transparentQueues: [] as RenderListQueue[]
        };

        // 验证输入参数
        if (!bridge3DSprites || bridge3DSprites.length === 0) {
            return result;
        }

        // 遍历所有Bridge3DSprite
        for (const bridge3DSprite of bridge3DSprites) {
            if (!bridge3DSprite) {
                continue;
            }

            // 获取Bridge3DRenderElement
            const bridge3DElement = bridge3DSprite.bridge3DRenderElement;
            if (!bridge3DElement) {
                continue;
            }

            // 调用updateRenderElements方法（只调用一次）
            bridge3DElement.updateRenderElements();

            // 收集不透明队列
            const opaqueList = bridge3DElement.getOpaqueList();
            if (opaqueList && opaqueList.elements && opaqueList.elements.length > 0) {
                result.opaqueQueues.push(opaqueList);
            }

            // 收集透明队列
            const transparentList = bridge3DElement.getTransparentList();
            if (transparentList && transparentList.elements && transparentList.elements.length > 0) {
                result.transparentQueues.push(transparentList);
            }

        }

        return result;
    }
}