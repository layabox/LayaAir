import { Graphics } from "../display/Graphics";
import { Material } from "../resource/Material";
import { Texture } from "../resource/Texture";
import { ISlotExtend } from "./slot/ISlotExtend";
import { SlotExtend } from "./slot/SlotExtend";
import { SlotExtendRG } from "./slot/SlotExtendRG";
import { ERenderType } from "./SpineSkeleton";
import { SpineSkeletonRenderer } from "./SpineSkeletonRenderer";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineMesh } from "./mesh/ISpineMesh";
import { SpinBone4Mesh } from "./mesh/SpineBone4Mesh";
import { SpineRigidBodyMesh } from "./mesh/SpineRigidBodyMesh";



export class SpineOptimize {
    slots: ISlotExtend[] = [];
    bones: spine.Bone[];
    mapIndex: Map<number, number>;
    slotMap: { [key: number]: ISlotExtend } = {};
    isInit: boolean = false;

    animationType: Map<string, ERenderType>;

    mesh: ISpineMesh;
    private _type: ERenderType;

    _meshConstructor: new (material: Material) => ISpineMesh;

    _slotConstructor: new () => ISlotExtend;
    constructor() {
        this.mapIndex = new Map();
        this._type = ERenderType.normal;
        this.animationType = new Map();
    }

    static checkOptimizable(animation: spine.Animation): boolean {
        for (let i = 0, n = animation.timelines.length; i < n; i++) {
            let timeline = animation.timelines[i];
            if (timeline instanceof spine.AttachmentTimeline || timeline instanceof spine.DrawOrderTimeline) {
                return false;
            }
        }
        return true;
    }

    setType(type: ERenderType) {
        this._type = type;
        switch (type) {
            case ERenderType.rigidBody:
                this._meshConstructor = SpineRigidBodyMesh;
                this._slotConstructor = SlotExtendRG;
                break;
            case ERenderType.boneGPU:
                this._meshConstructor = SpinBone4Mesh;
                this._slotConstructor = SlotExtend
                break;
            default:
                break;
        }
    }

    getRenderType(animationName: string) {
        let type = this.animationType.get(animationName);
        if (type == undefined) {
            type = ERenderType.normal;
        }
        return type;
    }

    _initSpineRender(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics) {
        let spineItem: ISpineRender;
        switch (this._type) {
            case ERenderType.boneGPU:
                spineItem = new SpineBoneGPURender();
                break;
            case ERenderType.normal:
                spineItem = new SpineNormalRender();
                break;
            case ERenderType.rigidBody:
                spineItem = new SpineRigidBodyRender();
                break;
        }
        spineItem.init(skeleton, templet, graphics);
        return spineItem;
    }


    init(slots: spine.Slot[], templet: SpineTemplet, mainTex: Texture) {
        if (this.isInit) return this.mesh.clone();
        this.mesh = new this._meshConstructor(templet.getMaterial(mainTex, 0));
        let declare = this.mesh.vertexDeclarition;
        let boneMaxId = 0;
        this.bones = slots[0].bone.skeleton.bones;

        let getBoneId = (boneIndex: number) => {
            let id = this.mapIndex.get(boneIndex);
            if (id == undefined) {
                id = boneMaxId;
                this.mapIndex.set(boneIndex, id);
                boneMaxId++;
            }
            return id;
        }
        let vside = declare.vertexStride / 4;
        for (let i = 0, n = slots.length; i < n; i++) {
            let slot = this.getSlot(slots[i], vside);
            if (slot) {
                this.mesh.appendSlot(slot, getBoneId);
            }
        }
        this.isInit = true;
        return this.mesh;
    }

    getSlot(slot: spine.Slot, vside: number) {
        let attachment = slot.getAttachment();
        if (attachment instanceof spine.RegionAttachment || attachment instanceof spine.MeshAttachment) {
            let slotMap = this.slotMap;
            let slotex = slotMap[slot.data.index];
            if (!slotex) {
                slotex = new this._slotConstructor();
                if (!slotex.init(slot, vside)) {
                    return null;
                }
                slotMap[slot.data.index] = slotex;
                this.slots.push(slotex);
            }
            return slotex;
        }
        else if (attachment) {
            debugger;
        }
        return null;
    }

    update(bones: spine.Bone[], boneMat: Float32Array) {
        this.mapIndex.forEach((value, key) => {
            let offset = value * 8;
            let bone = bones[key];
            boneMat[offset] = bone.a;
            boneMat[offset + 1] = bone.b;
            boneMat[offset + 2] = bone.worldX;
            boneMat[offset + 3] = 0;
            boneMat[offset + 4] = bone.c;
            boneMat[offset + 5] = bone.d;
            boneMat[offset + 6] = bone.worldY;
            boneMat[offset + 7] = 0;

            // boneMat[offset] = 0.1;
            // boneMat[offset + 1] =0;
            // boneMat[offset + 2] = 100;
            // boneMat[offset + 3] = 0.1;
            // boneMat[offset + 4] = 0;
            // boneMat[offset + 5] = 100;
        });
    }
}

export interface ISpineRender {
    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics): void;
    render(): void;
}

export class SpineBoneGPURender implements ISpineRender {
    bones: spine.Bone[];
    graphics: Graphics;
    mesh: ISpineMesh;
    boneMat: Float32Array = new Float32Array(200 * 4);
    slotManger: SpineOptimize;

    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics) {
        this.graphics = graphics;
        this.slotManger = templet.slotManger;
        this.mesh = this.slotManger.init(skeleton.slots, templet, templet.mainTexture);
        this.bones = skeleton.bones;
    }

    render() {
        let mesh = this.mesh;
        let boneMat = this.boneMat;
        this.slotManger.update(this.bones, boneMat);
        (mesh.material as any).boneMat = boneMat;
        if (this.graphics.cmds.length == 0) {
            mesh.draw(this.graphics);
        }
    }
}

export class SpineNormalRender implements ISpineRender {

    graphics: Graphics;
    _renerer: SpineSkeletonRenderer;
    _skeleton: spine.Skeleton;
    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics): void {
        this.graphics = graphics;
        this._renerer = new SpineSkeletonRenderer(templet, false);
        this._skeleton = skeleton;

    }

    render() {
        this.graphics.clear();
        this._renerer.draw(this._skeleton, this.graphics, -1, -1);
    }
}

export class SpineRigidBodyRender implements ISpineRender {
    bones: spine.Bone[];
    graphics: Graphics;
    mesh: ISpineMesh;
    boneMat: Float32Array = new Float32Array(200 * 4);
    slotManger: SpineOptimize;

    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics) {
        this.graphics = graphics;
        this.slotManger = templet.slotManger;
        this.mesh = this.slotManger.init(skeleton.slots, templet, templet.mainTexture);
        this.bones = skeleton.bones;
    }

    render() {
        let mesh = this.mesh;
        let boneMat = this.boneMat;
        this.slotManger.update(this.bones, boneMat);
        (mesh.material as any).boneMat = boneMat;
        if (this.graphics.cmds.length == 0) {
            mesh.draw(this.graphics);
        }
    }
}
