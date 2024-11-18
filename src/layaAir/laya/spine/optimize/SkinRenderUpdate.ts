
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineAdapter } from "../SpineAdapter";
import { Material } from "../../resource/Material";
import { VBCreator } from "./VBCreator";
import { Mesh2D } from "../../resource/Mesh2D";
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
import { IVBChange } from "./interface/IVBChange";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { SkinAniRenderData, FrameRenderData } from "./AnimationRender";
import { MultiRenderData } from "./MultiRenderData";

/**
 * @en SkinRenderUpdate used for rendering Spine skins.
 * @zh SkinRenderUpdate 类用于渲染 Spine 皮肤。
 */
export class SkinRenderUpdate {
    /**
     * @en The owner of this SkinRender.
     * @zh 此 SkinRender 的所有者。
     */
    owner: SpineOptimizeRender;

    /**
     * @en The name of the skin.
     * @zh 皮肤的名称。
     */
    name: string;

    private hasNormalRender: boolean;
    
    /** @internal */
    _renderer: ISpineRender;

    /**
     * @en The Spine template.
     * @zh Spine 模板。
     */
    templet: SpineTemplet;

    /**
     * @en The type of skin attachment.
     * @zh 皮肤附件的类型。
     */
    skinAttachType: ESpineRenderType;

    /**
     * @en Array of current materials.
     * @zh 当前材质数组。
     */
    currentMaterials: Material[] = [];

    /**
     * @en An array to cache materials for different render states.
     * Each inner array represents a set of materials for a specific render state.
     * @zh 用于缓存不同渲染状态的材质数组。
     * 每个内部数组代表一个特定渲染状态的材质集合。
     */
    cacheMaterials: Material[][] = [];


    vChanges: IVBChange[] = [];

    /**
     * @en Create a new instance of SkinRender.
     * @param owner The SpineOptimizeRender that owns this SkinRender.
     * @param skinAttach The SkinAttach data.
     * @zh 创建 SkinRender 的新实例。
     * @param owner 拥有此 SkinRender 的 SpineOptimizeRender。
     * @param skinAttach SkinAttach 数据。
     */
    constructor(owner: SpineOptimizeRender, skinAttach: any) {
        this.owner = owner;
        this.name = skinAttach.name;
        this.hasNormalRender = skinAttach.hasNormalRender;
        this.skinAttachType = skinAttach.type;
    }

    /**
     * @en Get material by name and blend mode.
     * @param name The name of the texture.
     * @param blendMode The blend mode.
     * @zh 通过名称和混合模式获取材质。
     * @param name 纹理的名称。
     * @param blendMode 混合模式。
     */
    getMaterialByName(name: string, blendMode: number): Material {
        return this.templet.getMaterial(this.templet.getTexture(name), blendMode);
    }

    /**
     * 渲染更新
     * @param skindata 动画渲染数据
     * @param frame 当前帧
     * @param lastFrame 上一帧
     */
    renderUpdate(skindata: SkinAniRenderData, frame: number, lastFrame: number) {
        const renderNode = this.owner._nodeOwner;
        let needUpdate = false;
        if (skindata.isDynamic) {
            needUpdate = this.updateDynamicRender(skindata, frame, lastFrame, renderNode);
        } else {
            needUpdate = this.handleRender(skindata, frame, renderNode , skindata.getMesh());
        }
        if (needUpdate) renderNode._updateRenderElements();
    }

    private updateDynamicRender(skindata: SkinAniRenderData, frame: number, lastFrame: number, renderNode: Spine2DRenderNode): boolean {
        let mesh = this.owner.getDynamicMesh(skindata.vb.vertexDeclaration);
        let needUpload = frame <= 0;

        let currentChanges = this.vChanges;
        this.updateCurrentChanges(currentChanges, lastFrame, frame, skindata);
        needUpload = this.processCurrentChanges(currentChanges, frame, skindata) || needUpload;
        if (needUpload) {
            this.uploadVertexBuffer(skindata.vb, mesh);
        }
        let frameData = skindata.getFrameData(frame);
        if (frameData.ib || frame < 0) {
            this.uploadIndexBuffer(frameData, mesh);
        }

        let needUpdateMesh = SpineMeshUtils._updateSpineSubMesh(mesh, frameData);
        let needUpdateRender = this.handleRender(skindata, frame, renderNode , mesh);
        return needUpdateMesh || needUpdateRender;
    }

    private updateCurrentChanges(currentChanges: IVBChange[], lastFrame: number, frame: number, skindata: SkinAniRenderData) {
        for (let f = lastFrame + 1; f <= frame; f++) {
            let frameData = skindata.getFrameData(f);
            let frameChanges = frameData.vChanges;
            if (frameChanges) {
                for (const change of frameChanges) {
                    if (!currentChanges.includes(change)) {
                        currentChanges.push(change);
                    }
                }
            }
        }
    }

    private processCurrentChanges(currentChanges: IVBChange[], frame: number, skindata: SkinAniRenderData): boolean {
        let needUpload = false;
        for (let i = currentChanges.length - 1; i >= 0; i--) {
            let change = currentChanges[i];
            if (change.apply(frame, skindata.vb, this.owner.slots)) {
                needUpload = true;
            } else {
                currentChanges.splice(i, 1);
            }
        }
        return needUpload;
    }

    private handleRender(skindata: SkinAniRenderData, frame: number, renderNode: Spine2DRenderNode , mesh:Mesh2D): boolean {
        let frameData = skindata.getFrameData(frame);
        let mulitRenderData = frameData.mulitRenderData;
        let mats = this.cacheMaterials[mulitRenderData.id] || this.createMaterials(mulitRenderData);
        let needUpdate = false;
        if (this.currentMaterials !== mats) {
            renderNode._updateMaterials(mats);
            needUpdate = true;
            this.currentMaterials = mats;
        }

        return !renderNode._onMeshChange(mesh) || needUpdate;;
    }

    private createMaterials(mulitRenderData: MultiRenderData): Material[] {
        let mats = mulitRenderData.renderData.map(data => 
            this.getMaterialByName(data.textureName, data.blendMode)
        );
        this.cacheMaterials[mulitRenderData.id] = mats;
        return mats;
    }

    /**
     * @en Submit IndexData.
     * @param frameData Frame rendering data.
     * @param mesh Mesh2D object.
     * @zh 提交索引数据。
     * @param frameData 帧渲染数据。
     * @param mesh 网格对象。
     */
    uploadIndexBuffer(frameData: FrameRenderData, mesh: Mesh2D) {
        let indexData = frameData.ib;
        let indexbuffer = mesh._indexBuffer;
        indexbuffer.indexType = frameData.type;
        indexbuffer.indexCount = indexData.length;
        indexbuffer._setIndexDataLength(indexData.byteLength);
        indexbuffer._setIndexData(indexData, 0);
    }

    /**
     * @en Submit vertex data.
     * @param vbCreator Vertex buffer creator object.
     * @param mesh Mesh2D object.
     * @zh 提交顶点数据。
     * @param vbCreator 构建顶点缓冲区对象。
     * @param mesh 网格对象。
     */
    uploadVertexBuffer(vbCreator: VBCreator, mesh: Mesh2D) {
        let vertexBuffer = mesh.vertexBuffers[0];
        let vblen = vbCreator.vbLength * 4;
        vertexBuffer.setDataLength(vbCreator.maxVertexCount * vbCreator.vertexSize * 4);
        vertexBuffer.setData(vbCreator.vb.buffer, 0, 0, vblen);
    }

    /**
     * @en Initialize renderer
     * @param skeleton spine.skeleton instance
     * @param templet Engine spine animation template
     * @param renderNode Rendering component
     * @zh 初始化渲染器
     * @param skeleton spine.skeleton 实例
     * @param templet 引擎spine动画模板
     * @param renderNode 渲染组件
     */
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode) {
        this.templet = templet;
        if (this.hasNormalRender) {
            this._renderer = SpineAdapter.createNormalRender(templet, false);
        }
    }

    /**
     * @en Render the skin at a specific time.
     * @param time The time to render at.
     * @zh 在特定时间渲染皮肤。
     * @param time 要渲染的时间。
     */
    render(time: number) {

    }
}