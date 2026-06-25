import { VFXStaticMeshSystemDesc } from "../VFXAsset";
import { VFXState } from "../VFXState";
import { VFXSystem } from "./VFXSystem";
import { UnlitMaterial } from "../../d3/core/material/UnlitMaterial";
import { MeshFilter } from "../../d3/core/MeshFilter";
import { Mesh } from "../../d3/resource/models/Mesh";
import { MeshRenderer } from "../../d3/core/MeshRenderer";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Color } from "../../maths/Color";
import { Vector3 } from "../../maths/Vector3";
import { ComputeCommandBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { Material } from "../../resource/Material";
import { Laya } from "../../../Laya";

/**
 * Unity VFXStaticMeshOutput 对齐：渲染单个 mesh，不跑 particle simulation
 * - 在 owner（VisualEffect 节点）下创建子 Sprite3D + MeshFilter + MeshRenderer
 * - 子节点 transform 默认 identity（mesh 跟随 owner 世界 transform）
 * - material 由 .vfx props 提供 UUID，runtime 异步加载；未指定 / 加载失败 fallback unlit material
 *
 * 后续可扩展：graph property binding 驱动 material color / transform offset
 */
export class VFXStaticMeshSystem extends VFXSystem {

    desc: VFXStaticMeshSystemDesc;

    private _child: Sprite3D = null;
    private _meshFilter: MeshFilter = null;
    private _meshRenderer: MeshRenderer = null;

    /** 运行时更换 mesh（VFX 组件级 Mesh 属性 override）。静态 mesh 直接换 sharedMesh。 */
    setMesh(mesh: Mesh): void {
        if (!mesh) return;
        this.desc.mesh = mesh;
        if (this._meshFilter) this._meshFilter.sharedMesh = mesh;
    }

    init(): void {
        if (this._child) this.release();

        const owner = this.effect?.owner;
        if (!owner) return;

        this._child = new Sprite3D("VFXStaticMesh");
        this._meshFilter = this._child.addComponent(MeshFilter);
        this._meshRenderer = this._child.addComponent(MeshRenderer);

        if (this.desc.mesh) this._meshFilter.sharedMesh = this.desc.mesh;

        // material 加载：UUID → res:// 路径（异步），加载完毕后 sharedMaterial 设置 + 立刻应用一次 binding
        if (this.desc.materialUuid) {
            const matUrl = this.desc.materialUuid.startsWith("res://") ? this.desc.materialUuid : "res://" + this.desc.materialUuid;
            Laya.loader.load(matUrl).then((mat: Material) => {
                if (mat && this._meshRenderer) {
                    this._meshRenderer.sharedMaterial = mat;
                    this._applyBindings();
                } else if (this._meshRenderer) {
                    console.warn(`[VFXStaticMeshSystem] load returned null for ${matUrl}, fallback unlit`);
                    this._applyFallbackMaterial();
                }
            }).catch((e: any) => {
                console.error(`[VFXStaticMeshSystem] load failed for ${matUrl}`, e);
                this._applyFallbackMaterial();
            });
        } else {
            this._applyFallbackMaterial();
        }

        owner.addChild(this._child);

        // 注意：不能在这里调 _applyBindings —— material 是异步加载的，此刻 sharedMaterial 仍是
        // MeshRenderer 默认的全局共享 Material 基类实例，写到它的 albedoColor 字段不影响 shader，
        // 还会污染所有共享该默认 material 的其他 renderer。binding 应用应在 material 加载完成 +
        // 每帧 update 时触发。
    }

    private _applyFallbackMaterial(): void {
        if (!this._meshRenderer) return;
        const mat = new UnlitMaterial();
        mat.albedoColor = new Color(1, 1, 1, 1);
        this._meshRenderer.sharedMaterial = mat;
        this._applyBindings();
    }

    private _tmpVec3: Vector3 = new Vector3();
    private _tmpColor: Color = new Color();

    update(state: VFXState, cmd: ComputeCommandBuffer): void {
        // 应用 graph driven binding
        this._applyBindings();
    }

    private _applyBindings(): void {
        if (!this._child || !this.desc.bindings || this.desc.bindings.length === 0) return;

        for (const b of this.desc.bindings) {
            const v = this._evalSource(b);
            if (!v) continue;

            switch (b.target) {
                case "position":
                    this._tmpVec3.setValue(v.x, v.y, v.z);
                    this._child.transform.localPosition = this._tmpVec3;
                    break;
                case "rotation":
                    this._tmpVec3.setValue(v.x, v.y, v.z);
                    this._child.transform.localRotationEuler = this._tmpVec3;
                    break;
                case "scale":
                    this._tmpVec3.setValue(v.x, v.y, v.z);
                    this._child.transform.localScale = this._tmpVec3;
                    break;
                case "color":
                    if (!this._meshRenderer?.sharedMaterial) break;
                    this._tmpColor.setValue(v.r, v.g, v.b, v.a);
                    // LayaAir loader 加载 .lmat 返回基类 Material 实例（不实例化 PBR/BlinnPhong 子类），
                    // 写 albedoColor 字段不影响 shader。改用 Material.setColor(uniformName, color) 直写 shader uniform。
                    // 同时写多个 known uniform name 覆盖各种 shader：
                    //   PBR / Unlit → u_AlbedoColor，BlinnPhong → u_DiffuseColor，其他 → u_BaseColor
                    // 未被 shader 使用的 uniform 写入会塞到 ShaderData 但 shader 不读就 no-op，无害。
                    const mat = this._meshRenderer.sharedMaterial as any;
                    mat.setColor("u_AlbedoColor", this._tmpColor);
                    mat.setColor("u_DiffuseColor", this._tmpColor);
                    mat.setColor("u_BaseColor", this._tmpColor);
                    break;
            }
        }
    }

    /** 取出 binding 的实际值（inline 直接返回 / property 运行时从 effect 读） */
    private _evalSource(b: any): any {
        if (b.source === "inline") {
            return b.target === "color" ? b.value : { x: b.value.x, y: b.value.y, z: b.value.z };
        }
        // property: 从 effect._propertyValues 读 number[]
        const entry = (this.effect as any)?._propertyValues?.get(b.name);
        if (!entry) return null;
        const arr = entry.value;
        if (b.target === "color") {
            return { r: arr[0] ?? 0, g: arr[1] ?? 0, b: arr[2] ?? 0, a: arr[3] ?? 1 };
        }
        return { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0 };
    }

    release(): void {
        if (this._child) {
            if (this._child.parent) this._child.parent.removeChild(this._child);
            this._child.destroy();
            this._child = null;
        }
        this._meshFilter = null;
        this._meshRenderer = null;
    }
}
