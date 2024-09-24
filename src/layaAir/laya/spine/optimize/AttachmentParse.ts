import { Color } from "../../maths/Color";
import { SpineOptimizeConst } from "./SpineOptimizeConst";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
/**
 * @en Represents a parser for spine attachments.
 * @zh 表示一个spine附件解析器。
 */
export class AttachmentParse {
    /**
     * @en The ID of the slot.
     * @zh 插槽的ID。
     */
    slotId: number;
    /**
     * @en The name of the attachment.
     * @zh 附件的名称。
     */
    attachment: string;
    /**
     * @en The color of the attachment.
     * @zh 附件的颜色。
     */
    color: TColor;
    lightColor: TColor;
    // darkColor: TColor;
    /**
     * @en The blend mode of the attachment.
     * @zh 附件的混合模式。
     */
    blendMode: number;
    /**
     * @en The vertex array of the attachment.
     * @zh 附件的顶点数组。
     */
    vertexArray: Float32Array;
    /**
     * @en The index array of the attachment.
     * @zh 附件的索引数组。
     */
    indexArray: Array<number>;
    /**
     * @en The UV coordinates of the attachment.
     * @zh 附件的UV坐标。
     */
    uvs: spine.ArrayLike<number>;
    /**
     * @en The stride of the vertex data.
     * @zh 顶点数据的步长。
     */
    stride: number;
    /**
     * @en The index of the bone.
     * @zh 骨骼的索引。
     */
    boneIndex: number;
    /**
     * @en The name of the texture.
     * @zh 纹理的名称。
     */
    textureName: string;
    /**
     * @en Indicates if the attachment is a clipping attachment.
     * @zh 指示附件是否为裁剪附件。
     */
    isclip: boolean;
    isPath:boolean;
    /**
     * @en The source data of the attachment.
     * @zh 附件的源数据。
     */
    sourceData: spine.Attachment;
    /**
     * @en The number of vertices in the attachment.
     * @zh 附件中的顶点数量。
     */
    vertexCount: number = 0;
    indexCount:number = 0;
    // static boneMap:number[] = [];

    /**
     * @en Initializes the attachment parser with the given parameters.
     * @param attachment The spine attachment to parse.
     * @param boneIndex The index of the bone.
     * @param slotId The ID of the slot.
     * @param deform The deformation array.
     * @param slot The slot data.
     * @zh 使用给定的参数初始化附件解析器。
     * @param attachment 要解析的spine附件。
     * @param boneIndex 骨骼的索引。
     * @param slotId 插槽的ID。
     * @param deform 变形数组。
     * @param slot 插槽数据。
     */
    init(attachment: spine.Attachment, boneIndex: number, slotId: number, deform: number[], slot: spine.SlotData) {
        this.slotId = slotId;
        this.sourceData = attachment;
        this.attachment = attachment.name;
        this.boneIndex = boneIndex;
        let slotColor = slot.color;
        this.blendMode = slot.blendMode;
        let color = this.color = new Color();
        let attchmentColor: spine.Color;
        let darkColor:spine.Color = slot.darkColor;
        // let boneMap:number[] = AttachmentParse.boneMap;

        if (attachment instanceof spine.RegionAttachment) {
            attchmentColor = attachment.color;
            let region = attachment as spine.RegionAttachment;
            this.vertexArray = region.offset as Float32Array;
            this.stride = 2;
            this.indexArray = QUAD_TRIANGLES;
            this.uvs = region.uvs;
            //region.region.
            this.textureName = (region.region as any).page.name;
        }
        else if (attachment instanceof spine.MeshAttachment) {
            attchmentColor = attachment.color;
            let vside = SpineOptimizeConst.BONEVERTEX;
            //return false;
            let mesh = attachment as spine.MeshAttachment;
            this.textureName = (mesh.region as any).page.name;
            if (!mesh.bones || mesh.bones.length == 0) {
                if (deform && deform.length > 1) {
                    //debugger;
                    this.vertexArray = new Float32Array(deform);
                }
                else {
                    this.vertexArray = mesh.vertices as Float32Array;
                }
                this.stride = 2;
                this.indexArray = mesh.triangles;
                this.uvs = mesh.uvs;

            }
            else {
                if (deform && deform.length > 1) {
                    debugger;
                }
                this.stride = vside - 6;
                let vertexSize = mesh.uvs.length / 2;
                // debugger;
                let vertexArray = this.vertexArray = new Float32Array(vertexSize * this.stride);
                this.indexArray = mesh.triangles;
                this.uvs = mesh.uvs;


                let vertices = mesh.vertices;
                let bones = mesh.bones;
                let v = 0;
                let needPoint = (vside - 6) / 4;
                for (let w = 0, b = 0; w < vertexSize; w++) {
                    let n = bones[v++];
                    n += v;
                    let offset = w * this.stride;
                    let nid = 0;

                    let result = [];
                    for (; v < n; v++, b += 3, nid++) {
                        result.push([vertices[b], vertices[b + 1], vertices[b + 2], bones[v]]);
                        // if(boneMap.indexOf(bones[v]) == -1){
                        //     boneMap.push(bones[v]);
                        // }
                    }
                    // console.log(boneMap);
                    if (result.length == needPoint) {

                    }
                    else if (result.length < needPoint) {
                        let n = needPoint - result.length;
                        for (let i = 0; i < n; i++) {
                            result.push([0, 0, 0, 0]);
                        }
                    }
                    else {
                        result = result.sort((a: any, b: any) => {
                            return b[2] - a[2];
                        });
                        result.length = needPoint;
                    }

                    for (let i = 0; i < result.length; i++) {
                        let v: any = result[i];
                        vertexArray[offset + i * 4] = v[0];
                        vertexArray[offset + i * 4 + 1] = v[1];
                        vertexArray[offset + i * 4 + 2] = v[2];
                        vertexArray[offset + i * 4 + 3] = v[3];
                    }
                }
            }
        }
        else if (attachment instanceof spine.ClippingAttachment) {
            this.attachment = null;
            this.isclip = true;
        }
        else if (attachment instanceof spine.PathAttachment) {
            this.attachment = attachment.name;
            this.vertexArray = new Float32Array(attachment.vertices);
            this.isPath = true;
        }
        else {
            //debugger;
            this.attachment = null;
        }

        if (this.textureName) {
            this.vertexCount = this.vertexArray.length / this.stride;
            this.indexCount = this.indexArray.length;
        }

        if (attchmentColor) {
            if (attchmentColor.a != 1 || attchmentColor.r != 1 || attchmentColor.g != 1 && attchmentColor.b != 1) {
                this.lightColor = attchmentColor;
            }
            color.r = slotColor.r * attchmentColor.r;
            color.g = slotColor.g * attchmentColor.g;
            color.b = slotColor.b * attchmentColor.b;
            let a = color.a = slotColor.a * attchmentColor.a;
            //预乘
            color.r *= a;
            color.g *= a;
            color.b *= a;
        }

        // if (darkColor) {
            
        // }
        return true;
    }
}

type TColor = {
    r: number;
    g: number;
    b: number;
    a: number;
}
