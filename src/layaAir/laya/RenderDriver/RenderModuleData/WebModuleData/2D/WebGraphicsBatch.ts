import { LayaGL } from "../../../../layagl/LayaGL";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../../utils/SingletonList";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IBatch2DRender } from "./WebRender2DPass";
import { WebRenderStruct2D } from "./WebRenderStruct2D";

const TEMP_SINGLE_LIST = new FastSinglelist<number>();

export class WebGraphicsBatch implements IBatch2DRender {

    static instance : WebGraphicsBatch = null;

    static _pool: IRenderElement2D[] = [];

    static createRenderElement2D() {
        if (this._pool.length > 0) {
            return this._pool.pop();
        }
        let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        element.geometry.indexFormat = IndexFormat.UInt16;
        element.nodeCommonMap = ["Sprite2D"];
        element.renderStateIsBySprite = false;
        return element;
    }

    static recoverRenderElement2D(value: IRenderElement2D) {
        if (!value) return;
        value.geometry.clearRenderParams();
        value.geometry.bufferState = null;
        value.materialShaderData = null;
        value.value2DShaderData = null;
        value.subShader = null;
        value.renderStateIsBySprite = false;
        this._pool.push(value);
    }

    // _recoverList = new FastSinglelist<IRenderElement2D>();

    batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number , recoverList: FastSinglelist<IRenderElement2D>): void {
        let elementArray = list.elements;
        let batchStart = -1;
        let count = 0;
        let end = length - 1;
        for (let index = 0 ; index < end ; index ++) {
            let offset = start + index;
            let cElement = elementArray[offset];
            let nElement = elementArray[offset + 1];

            if (this.check(cElement, nElement)) {
                if (batchStart == -1) {
                    batchStart = index;
                    count = 2;
                }else
                    count ++;
            } else {
                if (count !== 0) {
                    this.batch(list, batchStart + start, count , recoverList);
                }else{
                    list.add(cElement);
                }
                count = 0;
                batchStart = -1;
            }
        }

        if ( count !== 0) {
            this.batch(list, batchStart + start, count , recoverList);
        }else{
            list.add(elementArray[end + start]);
        }
    }

    batch(list: FastSinglelist<IRenderElement2D>, start: number, length: number , recoverList: FastSinglelist<IRenderElement2D>): void {
        let elementArray = list.elements;
        let staticBatchRenderElement:IRenderElement2D = WebGraphicsBatch.createRenderElement2D();
        let drawArray : number[][] = [];
        let i = 0;
        let drawLengths :number[] = [];
        for (i = 0; i < length; i++) {
            let element = elementArray[start + i];
            let geometry = element.geometry;
            if (!i) {
                staticBatchRenderElement.geometry.bufferState = geometry.bufferState;
                staticBatchRenderElement.materialShaderData = element.materialShaderData;
                staticBatchRenderElement.value2DShaderData = element.value2DShaderData;
                staticBatchRenderElement.subShader = element.subShader;
                staticBatchRenderElement.renderStateIsBySprite = element.renderStateIsBySprite;
            }
            
            geometry.getDrawDataParams(TEMP_SINGLE_LIST);
            drawArray.push(TEMP_SINGLE_LIST.elements);
            drawLengths.push(TEMP_SINGLE_LIST.length);
        }
        
        let geometry = staticBatchRenderElement.geometry;
        let len = drawArray.length;
        let currentOffset = 0;
        let currentCount = 0;
        let isFirst = true;

        for ( i = 0; i < len; i++) {
            let drawParam = drawArray[i];
            let drawLength = drawLengths[i];
            for (let j = 0 ; j < drawLength ; j += 2) {
                let offset = drawParam[j];
                let count = drawParam[j + 1];

                if (isFirst) {
                    currentOffset = offset;
                    currentCount = count;
                    isFirst = false;
                    continue;
                }

                // 检查是否可以合并
                if (currentOffset + currentCount * 2 === offset) {
                    currentCount += count;
                } else {
                    geometry.setDrawElemenParams(currentCount, currentOffset);
                    currentOffset = offset;
                    currentCount = count;
                }
            }
        }

        // 一次性合并完整了
        if (!isFirst) {
            geometry.setDrawElemenParams(currentCount, currentOffset);
        }   

        recoverList.add(staticBatchRenderElement);
        list.add(staticBatchRenderElement);
    }

    /**
     * @en Check if two render elements can be merged.
     * @param left The left render element to compare.
     * @param right The right render element to compare.
     * @returns True if the elements can be merged, false otherwise.
     * @zh 检测两个渲染元素是否可以合并。
     * @param left 要比较的左侧渲染元素。
     * @param right 要比较的右侧渲染元素。
     * @returns 如果元素可以合并则返回 true，否则返回 false。
     */
    check(left: IRenderElement2D, right: IRenderElement2D): boolean {
        let leftType = left.type;
        let rightType = right.type;

        if (
            left.subShader === right.subShader
            && left.geometry.bufferState === right.geometry.bufferState // 同mesh
            && leftType === rightType
        ){

            if (leftType & 32) { //或者比对材质 clip 优先忽略
                return false;
            }else if (( left.owner as WebRenderStruct2D).getClipInfo() === (right.owner as WebRenderStruct2D).getClipInfo()) {
                return true;
            }
            return false;
        }
        // BlendMode  3 ,  use Custom Matierl 4 , 
        // if ((leftType & 31) !== (rightType & 31))
        //     return false;

        // let lUseMaterial = leftType & 16;
        // let rUseMaterial = rightType & 16;
        // // use custom material
        // //A或者B一方使用自定义材质，使用的自定义材质且材质id不同
        // if (lUseMaterial !== rUseMaterial || lUseMaterial)
        //     return false;            
        // // clip or 
        // if ((leftType & 32) !== (rightType & 32)) {
        //     return false;
        // }
        // // tex
        // let leftTexId = leftType & 63;
        // let rightTexId = rightType & 63;
        // // 双方都使用贴图且不同 , 有一方没使用贴图就不能继续
        // // 待考虑
        // if (
        //     leftTexId !== 0
        //     && rightTexId !== 0
        //     && leftTexId !== rightTexId
        // )
        //     return false;

        return false;
    }

    /**
     * 
     */
    recover(list: FastSinglelist<IRenderElement2D>): void {
        let length = list.length;
        let recoverArray = list.elements;
        for (let i = 0; i < length; i++) {
            let info = recoverArray[i];
            WebGraphicsBatch.recoverRenderElement2D(info);
        }
        list.length = 0;
    }

}

