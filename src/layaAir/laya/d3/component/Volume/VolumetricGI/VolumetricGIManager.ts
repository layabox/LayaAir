import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { IVolumeManager } from "../IVolumeManager";
import { VolumetricGI } from "./VolumetricGI";

/**
 * @internal
 * @en Manager class for Volumetric Global Illumination (GI).
 * @zh 体积全局光照(GI)管理器类。
 */
export class VolumetricGIManager implements IVolumeManager {
    /**
     * @en Whether all renders need to be updated.
     * @zh 是否需要更新所有渲染。
     */
    _needUpdateAllRender: boolean;

    private _GIVolumes: SingletonList<VolumetricGI> = new SingletonList<VolumetricGI>();

    /**
     * @en Constructor, initialize the VolumetricGI manager.
     * @zh 构造函数，初始化体积全局光照(VolumetricGI)管理器。
     */
    constructor() {
        this._needUpdateAllRender = true;
    }

    /**
     * @en Remove Volumetric GI from the specified renderer.
     * @zh 从指定的渲染器中移除体积全局光照。
     */
    removeVolumetricGI(renderer: BaseRender) {
        let shaderData = renderer._baseRenderNode.shaderData;
        shaderData.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_VOLUMETRICGI);
        renderer.lightProbe = null;
    }

    /**
     * @en Add a VolumetricGI volume to the collection.
     * @zh 添加一个体积全局光照(VolumetricGI)到集合中。
     */
    add(volume: VolumetricGI): void {
        this._GIVolumes.add(volume);
        this._needUpdateAllRender = true;
    }

    /**
     * @en Remove a VolumetricGI volume from the collection.
     * @zh 从集合中移除一个体积全局光照(VolumetricGI)。
     */
    remove(volume: VolumetricGI): void {
        this._GIVolumes.remove(volume);
        this._needUpdateAllRender = true;
    }

    /**
     * @en Update the render object based on the current VolumetricGI volumes.
     * This method checks for overlap between the renderer's bounds and VolumetricGI volumes, and applies the most overlapping volume's settings to the renderer.
     * @param renderer The BaseRender object to update.
     * @zh 根据当前的体积全局光照(VolumetricGI)更新渲染对象。
     * 此方法检查渲染器边界与VolumetricGI之间的重叠，并将重叠最多的体积的设置应用于渲染器。
     * @param renderer 要更新的BaseRender对象。
     */
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
            renderer.lightProbe = currentVolume;
        }
        else {
            this.removeVolumetricGI(renderer);
        }

    }
    /**
     * @en Handle the list of motion objects by updating their VolumetricGI settings.
     * @param motionObjects A SingletonList of BaseRender objects representing motion objects.
     * @zh 处理运动对象列表，更新它们的体积全局光照(VolumetricGI)设置。
     * @param motionObjects 表示运动对象的BaseRender对象的SingletonList。
     */
    handleMotionlist(motionObjects: SingletonList<BaseRender>): void {
        for (let index = 0; index < motionObjects.length; index++) {
            let render = motionObjects.elements[index];
            if (render._surportVolumetricGI) {
                this._updateRenderObject(render);
            }
        }
        this._needUpdateAllRender = false;
    }

    /**
     * @en Recalculate VolumetricGI settings for all render objects.
     * @param renders A SingletonList of BaseRender objects to recalculate.
     * @zh 重新计算所有渲染对象的体积全局光照(VolumetricGI)设置。
     * @param renders 需要重新计算的BaseRender对象的SingletonList。
     */
    reCaculateAllRenderObjects(renders: SingletonList<BaseRender>): void {
        for (let index = 0; index < renders.length; index++) {
            let render = renders.elements[index];
            if (render._surportVolumetricGI) {
                this._updateRenderObject(render);
            }
        }
        this._needUpdateAllRender = false;
    }
    /**
     * @en Destroy the instance and release resources.
     * @zh 销毁实例并释放资源。
     */
    destroy(): void {
    }
}