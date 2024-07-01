import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Script } from "../../components/Script";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { AnimationRender } from "./AnimationRender";
import { SketonOptimise } from "./SketonOptimise";

export class SpineBakeInTime extends Script {
    sketonOptimize: SketonOptimise;

    onAwake(): void {
        
    }

    onEnable(): void {
       let renderNode= this.owner.getComponent(Spine2DRenderNode);
        if(renderNode){
            this.sketonOptimize = renderNode.templet.sketonOptimise;
            this.sketonOptimize.cacheBone();
            this.bake();
            renderNode.spineItem.initBake(this.sketonOptimize.bakeData);
        }
    }

    checkBake(animator: AnimationRender) {
        for (let i = 0, n = animator.skinDataArray.length; i < n; i++) {
            if(!animator.skinDataArray[i].isNormalRender){
                 return true;
            }
         }
         return false;
    }

    bake() {
        if (this.sketonOptimize.bakeData) return;
        let animators = this.sketonOptimize.animators;
        let maxBoneNumber = this.sketonOptimize.maxBoneNumber;
        let usePixelNums: number = 0;
        animators.forEach((animator) => {
            if (!this.checkBake(animator)) return;
            let frameCount = 2*animator.boneFrames.length-1;
            let bonds = maxBoneNumber;//animator.skinDataArray[0].vb.boneArray.length / 2;
            usePixelNums += (frameCount * bonds * 2);
        });
        let textureWidth = Math.pow(2, Math.ceil(Math.log2(Math.sqrt(usePixelNums))));
        if (textureWidth > 2048) {
            return;
        }
        if (textureWidth == 0) {
            return;
        }
        let a = new Texture2D(textureWidth, textureWidth, TextureFormat.R32G32B32A32, false, false, false, false);

        let pixelData = new Float32Array(textureWidth * textureWidth * 4);
        let bakeData = {
            bonesNums: maxBoneNumber,
            aniOffsetMap: {
            },
            texture2d: a
        }
        this.realBake(pixelData, bakeData);
        a.setPixelsData(pixelData, false, false);
        this.sketonOptimize.bakeData = bakeData;
    }

    realBake(pixelData: Float32Array, bakeData: any) {
        let pixelOffset: number = 0;
        //spineOpt.maxBoneNumber
        let animators = this.sketonOptimize.animators;
        let maxBoneNumber = this.sketonOptimize.maxBoneNumber;
        animators.forEach((animator) => {
            if (!this.checkBake(animator)) return;
            let boneFrames = animator.boneFrames;
            let boneArray = animator.skinDataArray[animator.skinDataArray.length-1].vb.boneArray;
            let bonds = maxBoneNumber;//boneArray.length / 2;
            bakeData.aniOffsetMap[animator.name] = pixelOffset / 4;
            boneFrames.forEach((boneFrame: Float32Array[], index: number) => {
                if (index > 0) {
                    for (let i = 0, n = boneArray.length; i < n; i += 2) {
                        let offset = pixelOffset + boneArray[i] * 8;
                        let boneIndex = boneArray[i + 1];
                        let boneFloatArray = boneFrames[index - 1][boneIndex];
                        let boneFloatArray2 = boneFrame[boneIndex];
                        pixelData[offset] = (boneFloatArray[0] + boneFloatArray2[0]) / 2;
                        pixelData[offset + 1] = (boneFloatArray[1] + boneFloatArray2[1]) / 2;
                        pixelData[offset + 2] = (boneFloatArray[2] + boneFloatArray2[2]) / 2;
                        pixelData[offset + 3] = 0
                        pixelData[offset + 4] = (boneFloatArray[4] + boneFloatArray2[4]) / 2;
                        pixelData[offset + 5] = (boneFloatArray[5] + boneFloatArray2[5]) / 2;
                        pixelData[offset + 6] = (boneFloatArray[6] + boneFloatArray2[6]) / 2;
                        pixelData[offset + 7] = 0;
                    }
                    pixelOffset += bonds * 8;
                }

                for (let i = 0, n = boneArray.length; i < n; i += 2) {
                    let offset = pixelOffset + boneArray[i] * 8;
                    let boneIndex = boneArray[i + 1];
                    //if (boneFrame[boneIndex].length + offset < pixelData.length)
                    pixelData.set(boneFrame[boneIndex], offset);
                }
                pixelOffset += bonds * 8;
            });
        });
    }
}