
import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";
import { Event } from "../../../events/Event";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { ModifierVolumeData } from "../../common/data/ModifierVolumeData";
import { BaseNavMeshSurface } from "../../common/component/BaseNavMeshSurface";
import { BaseNavigationManager } from "../../common/BaseNavigationManager";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";

/**
 * @en NavMeshModifierVolume is a component that modifies the navigation mesh in a specific volume.
 * @zh NavMeshModifierVolume 是一个在特定体积内修改导航网格的组件。
 */
export class NavMeshModifierVolume extends Component {

    /**@internal */
    protected _volumeData: ModifierVolumeData;
    
    /**@internal */
    private _center: Vector3 = new Vector3();

    /**@internal */
    private _size: Vector3 = new Vector3(1, 1, 1);

    /**
     * @en The agent type that this volume applies to.
     * @zh 该体积适用的代理类型。
     */
    set agentType(value: string) {
        this._volumeData.agentType = value;
    }

    get agentType() {
        return this._volumeData.agentType;
    }

    /**
     * @en The area flag for this volume.
     * @zh 该体积的区域标志。
     */
    set areaFlag(value: string) {
        this._volumeData.areaFlag = value;
    }

    get areaFlag() {
        return this._volumeData.areaFlag;
    }
    

    /**
     * @en The center of the modifier volume.
     * @zh 修改体积的中心点。
     */
    get center(): Vector3 {
        return this._center;
    }
    set center(value: Vector3) {
        value.cloneTo(this._center);
        this._onWorldMatNeedChange();
    }

    /**
     * @en The size of the modifier volume.
     * @zh 修改体积的大小。
     */
    get size(): Vector3 {
        return this._size;
    }
    set size(value: Vector3) {
        value.cloneTo(this._size);
        this._onWorldMatNeedChange();
    }

    /**
     * <code>NavModifleBase<Code>
     */
    constructor() {
        super();
        this._volumeData = new ModifierVolumeData();

    }
    /**
     * @internal
     */
    protected _onEnable(): void {
        let surface = new Array<BaseNavMeshSurface>();
        BaseNavigationManager.findNavMeshSurface(surface, this.owner, [this.agentType]);
        this._volumeData._initSurface(surface);
        this._onWorldMatNeedChange();
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange)
    }

    
    /**
     * @internal
     */
    protected _onDisable(): void {
        this._volumeData._destory();
    }

    /**
     * @override 
     */
    protected _onWorldMatNeedChange() {
        let transform = this._volumeData._transfrom;
        Matrix4x4.createAffineTransformation(this._center, Quaternion.DEFAULT, this._size, transform);
        Matrix4x4.multiply((<Sprite3D>this.owner).transform.worldMatrix, transform, transform);
        this._volumeData._refeahTransfrom();
    }


    /**@internal */
    _cloneTo(dest: Component): void {
        let volume = dest as NavMeshModifierVolume;
        this._size.cloneTo(volume._size);
        this._center.cloneTo(volume._center);
        super._cloneTo(dest);
    }
}