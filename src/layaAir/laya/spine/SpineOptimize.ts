import { Graphics } from "../display/Graphics";
import { Texture } from "../resource/Texture";
import { SlotExtend } from "./SlotExtend";
import { SpineSkeletonRenderer } from "./SpineSkeletonRenderer";
import { SpineTemplet } from "./SpineTemplet";
import { SpinBone4Mesh } from "./mesh/SpineBone4Mesh";


export class SpineOptimize {
    slots: SlotExtend[] = [];
    bones: spine.Bone[];
    mapIndex: Map<number, number>;
    slotMap: { [key: number]: SlotExtend } = {};
    isInit: boolean = false;

    mesh: SpinBone4Mesh;
    constructor() {
        this.mapIndex = new Map();
    }


    init(slots: spine.Slot[], templet: SpineTemplet, mainTex: Texture) {
        if (this.isInit) return this.mesh.clone();
        this.mesh = new SpinBone4Mesh(templet.getFastMaterial(mainTex, 0));
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
                slotex = new SlotExtend();
                if (!slotex.init(slot, vside)) {
                    return null;
                }
                slotMap[slot.data.index] = slotex;
                this.slots.push(slotex);
            }
            return slotex;
        }
        return null;
    }

    update(bones: spine.Bone[], boneMat: Float32Array) {
        this.mapIndex.forEach((value, key) => {
            let offset = value * 6;
            let bone = bones[key];
            boneMat[offset] = bone.a;
            boneMat[offset + 1] = bone.b;
            boneMat[offset + 2] = bone.worldX;
            boneMat[offset + 3] = bone.c;
            boneMat[offset + 4] = bone.d;
            boneMat[offset + 5] = bone.worldY;
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
    mesh: SpinBone4Mesh;
    boneMat: Float32Array = new Float32Array(256 * 3);
    slotManger: SpineOptimize;

    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics){
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