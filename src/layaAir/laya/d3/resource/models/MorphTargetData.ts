import { LayaGL } from "../../../layagl/LayaGL";
import { Vector4 } from "../../../maths/Vector4";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Texture2DArray } from "../../../resource/Texture2DArray";
import { Bounds } from "../../math/Bounds";
import { MorphTarget, MorphTargetChannel } from "./MorphTarget";

export class MorphTargetData {

    // keep origin insert order

    private targets: Array<MorphTarget>;

    private channels: Array<MorphTargetChannel>;

    vertexCount: number;

    /**
     * // todo 移除  
     * // 改为 从 VertexDeclaration 中获取
     * morph target attribute element count
     */
    elementCount: number;

    /**@internal */
    attributeOffset: Vector4;
    /**@internal */
    params: Vector4;

    /** @internal */
    targetTexture: Texture2DArray;

    vertexDec: VertexDeclaration;

    bounds: Bounds;

    constructor() {
        this.targets = new Array();
        this.channels = new Array();
        this.bounds = new Bounds();
        this.params = new Vector4();
    }

    addMorphChannel(channel: MorphTargetChannel) {

        channel._index = this.channels.length;
        this.channels.push(channel);

        channel.targets.forEach(target => {
            target._index = this.targets.length;
            this.targets.push(target);
        })
    }

    getMorphChannel(name: string): MorphTargetChannel {
        // return this.targets.find(value => value.name == name);
        return this.channels.find(value => value.name == name);
    }

    getMorphChannelbyIndex(index: number) {
        return this.channels[index];
    }

    /**
     * @internal
     */
    get targetCount(): number {
        return this.targets.length;
    }

    get channelCount(): number {
        return this.channels.length;
    }

    initData() {
        if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
            let targetNum = this.targets.length;

            let maxTexSize = LayaGL.renderEngine.getParams(RenderParams.MAX_Texture_Size);

            let vertexCount = this.vertexCount;

            let vertexDec = this.vertexDec;

            let morphStride = vertexDec.vertexStride / 4;

            let elementCount = vertexDec.vertexElementCount;
            this.elementCount = elementCount;

            let texHeight = Math.floor(elementCount * vertexCount / maxTexSize) + 1;

            let texelStride = 4;
            this.targetTexture = new Texture2DArray(maxTexSize, texHeight, targetNum, TextureFormat.R32G32B32A32, false, false, false);
            this.targetTexture.filterMode = FilterMode.Point;
            this.targetTexture.anisoLevel = 1;
            this.targetTexture.lock = true;

            let data = new Float32Array(maxTexSize * texHeight * targetNum * texelStride).fill(0);

            /**
             * x: position offset
             * y: normal offset
             * z: tangent offset
             */
            let attributeOffset = this.attributeOffset = new Vector4(0, 0, 0, 0);
            attributeOffset.x = vertexDec._vertexElements.indexOf(vertexDec.getVertexElementByUsage(VertexMesh.MESH_POSITION0));
            attributeOffset.y = vertexDec._vertexElements.indexOf(vertexDec.getVertexElementByUsage(VertexMesh.MESH_NORMAL0));
            attributeOffset.z = vertexDec._vertexElements.indexOf(vertexDec.getVertexElementByUsage(VertexMesh.MESH_TANGENT0));

            let targetStride = maxTexSize * texHeight;

            for (let targetIndex = 0; targetIndex < targetNum; targetIndex++) {
                let target = this.targets[targetIndex];
                for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
                    let dataOffset = (targetIndex * targetStride + vertexIndex * elementCount) * texelStride;
                    vertexDec._vertexElements.forEach((element, elementIndex) => {
                        let pixelOffset = dataOffset + elementIndex * 4;

                        let elementOffset = element.offset / 4;
                        let targetDataOffset = vertexIndex * morphStride + elementOffset;
                        switch (element.elementUsage) {
                            case VertexMesh.MESH_POSITION0:
                            case VertexMesh.MESH_NORMAL0:
                                data[pixelOffset] = target.data[targetDataOffset];
                                data[pixelOffset + 1] = target.data[targetDataOffset + 1];
                                data[pixelOffset + 2] = target.data[targetDataOffset + 2];
                                break;
                            case VertexMesh.MESH_TANGENT0:
                                data[pixelOffset] = target.data[targetDataOffset];
                                data[pixelOffset + 1] = target.data[targetDataOffset + 1];
                                data[pixelOffset + 2] = target.data[targetDataOffset + 2];
                                data[pixelOffset + 3] = target.data[targetDataOffset + 3];
                                break;
                            default:
                                break;
                        }
                    });
                }
            }

            this.targetTexture.setPixlesData(data, false, false);

            this.params.setValue(this.targetTexture.width, this.targetTexture.height, this.elementCount, this.channelCount);
        }
    }

    destroy() {
        if (this.targetTexture) {
            this.targetTexture.lock = false;
            this.targetTexture.destroy();
            this.targetTexture = null;
        }

        // todo
        this.targets = null;
        this.channels = null;
    }

    clone(): MorphTargetData {
        let res = new MorphTargetData();

        res.bounds.setMin(this.bounds.getMin());
        res.bounds.setMax(this.bounds.getMax());

        res.vertexCount = this.vertexCount;
        res.vertexDec = this.vertexDec;

        let channelCount = this.channelCount;
        for (let index = 0; index < channelCount; index++) {
            let channel = this.getMorphChannelbyIndex(index);

            let newChannel = new MorphTargetChannel();
            newChannel.name = channel.name;

            let targetCount = channel.targetCount;
            for (let targetIndex = 0; targetIndex < targetCount; targetIndex++) {
                let target = channel.getTargetByIndex(targetIndex);
                
                let newTarget = new MorphTarget();
                newTarget.name = target.name;
                newTarget.fullWeight = target.fullWeight;
                newTarget.data = new Float32Array(target.data);
                
                newChannel.addTarget(newTarget);
            }

            res.addMorphChannel(newChannel);
        }

        res.initData();
        return res;
    }

}