import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { IVolumeManager } from "../IVolumeManager";
import { VolumetricGI } from "./VolumetricGI";

/**
 * @internal
 */
export class VolumetricGIManager implements IVolumeManager {
    _needUpdateAllRender: boolean;

    private _GIVolumes: SingletonList<VolumetricGI> = new SingletonList<VolumetricGI>();

    constructor() {
        this._needUpdateAllRender = true;
    }

    removeVolumetricGI(renderer: BaseRender) {
        let shaderData = renderer._baseRenderNode.shaderData;
        shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_VOLUMETRICGI);
        renderer.lightProb = null;
    }

    add(volume: VolumetricGI): void {
        this._GIVolumes.add(volume);
        this._needUpdateAllRender = true;
    }

    remove(volume: VolumetricGI): void {
        this._GIVolumes.remove(volume);
        this._needUpdateAllRender = true;
    }

    _updateRenderObject(renderer: BaseRender): void {
        if (this._GIVolumes.length == 0) {
            this.removeVolumetricGI(renderer);
            return;
        }

        let renderBounds = renderer.bounds;
        let maxOverlap = 0, overlap = 0;
        let currentVolume: VolumetricGI;

        let volumes = this._GIVolumes.elements;
        for (let index = 0; index < this._GIVolumes.length; index++) {
            let volume = volumes[index];
            if (!currentVolume) {
                overlap = renderBounds.calculateBoundsintersection(volume.bounds);
                if (overlap < maxOverlap)
                    continue;
            }
            else {
                if (currentVolume.importance > volume.importance)
                    continue;
                overlap = renderBounds.calculateBoundsintersection(volume.bounds);
                if (overlap < maxOverlap && currentVolume.importance == volume.importance)
                    continue;
            }
            currentVolume = volume;
            maxOverlap = overlap;
        }

        if (currentVolume) {
            renderer.lightProb = currentVolume;
        }
        else {
            this.removeVolumetricGI(renderer);
        }

    }
    handleMotionlist(motionObjects: SingletonList<BaseRender>): void {
        for (let index = 0; index < motionObjects.length; index++) {
            let render = motionObjects.elements[index];
            if (render._surportVolumetricGI) {
                this._updateRenderObject(render);
            }
        }
        this._needUpdateAllRender = false;
    }

    reCaculateAllRenderObjects(renders: SingletonList<BaseRender>): void {
        for (let index = 0; index < renders.length; index++) {
            let render = renders.elements[index];
            if (render._surportVolumetricGI) {
                this._updateRenderObject(render);
            }
        }
        this._needUpdateAllRender = false;
    }

    destroy(): void {
        // throw new Error("Method not implemented.");
    }
}