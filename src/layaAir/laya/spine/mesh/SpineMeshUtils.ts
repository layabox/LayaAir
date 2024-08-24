import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { Mesh2D } from "../../resource/Mesh2D";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { IBCreator } from "../optimize/IBCreator";
import { MultiRenderData } from "../optimize/MultiRenderData";
import { SketonDynamicInfo } from "../optimize/SketonOptimise";
import { VBCreator } from "../optimize/VBCreator";

export class SpineMeshUtils{

    static SPINEMESH_COLOR2:number = 11;

    static createMesh( type:ESpineRenderType , vbCreator:VBCreator , ibCreator:IBCreator , isDynamic:boolean = false , uploadBuffer:boolean = true):Mesh2D{
        let mesh = new Mesh2D;
        
        let vertexBuffers:IVertexBuffer[] = [];
        
        let usage = isDynamic ? BufferUsage.Dynamic : BufferUsage.Static

        let vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(usage);
        let vertexDeclaration = vbCreator.vertexDeclaration;
        let vertexStride = vertexDeclaration.vertexStride;
        vertexBuffer.vertexDeclaration = vertexDeclaration;

        let vbByteLength = vbCreator.maxVertexCount * vertexStride ;
        let vbUploadLength = vbCreator.vbLength * Float32Array.BYTES_PER_ELEMENT;
        vertexBuffer.setDataLength(vbByteLength);
        if (uploadBuffer) {
            vertexBuffer.setData(vbCreator.vb.buffer, 0 , 0 , vbUploadLength );
        }
        vertexBuffers.push(vertexBuffer);

        mesh._vertexCount = vbByteLength / vertexStride;
        mesh._vertexBuffers = vertexBuffers;

        let ibByteLength = ibCreator.maxIndexCount * ibCreator.size;
        let ibUploadLength = ibCreator.ibLength; 
        let indexbuffer = LayaGL.renderDeviceFactory.createIndexBuffer(usage);
        indexbuffer.indexType = ibCreator.type;
        indexbuffer.indexCount = ibCreator.maxIndexCount;
        indexbuffer._setIndexDataLength(ibByteLength);

        if (uploadBuffer) {
            indexbuffer._setIndexData(ibCreator.ib,0);
        }
        
        mesh._indexBuffer = indexbuffer;

        let state = mesh._bufferState;
        state.applyState(vertexBuffers, indexbuffer);

        // //@ts-ignore
        // mesh._customData = {
        //     vb:vbCreator.vb.slice(0,vbCreator.vbLength),
        //     ib:ibCreator.ib.slice(0,ibCreator.ibLength)
        // }
       
        let subMeshes:IRenderGeometryElement[] = [];

        let multi = ibCreator.outRenderData;
        for (let i = 0 , len = multi.renderData.length; i < len; i++) {
            let data = multi.renderData[i];
            let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            geometry.bufferState = state;
            geometry.setDrawElemenParams(data.length , data.offset * ibCreator.size);
            geometry.indexFormat = ibCreator.type;
            subMeshes.push(geometry);
        }

        mesh._setSubMeshes(subMeshes);

		var memorySize: number = vbByteLength + ibByteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);

        return mesh;
    }

    static createMeshDynamic( vertexDeclaration:VertexDeclaration , maxVertexCount:number , maxIndexCount:number , indexFormat:IndexFormat , indexSize:number):Mesh2D{
        let mesh = new Mesh2D;
        
        let vertexBuffers:IVertexBuffer[] = [];
        
        let usage = BufferUsage.Dynamic;

        let vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(usage);
        let vertexStride = vertexDeclaration.vertexStride;
        vertexBuffer.vertexDeclaration = vertexDeclaration;

        let vbByteLength = maxVertexCount * vertexStride ;
        vertexBuffer.setDataLength(vbByteLength);

        vertexBuffers.push(vertexBuffer);

        mesh._vertexCount = vbByteLength / vertexStride;
        mesh._vertexBuffers = vertexBuffers;

        let ibByteLength = maxIndexCount * indexSize;
        // let ibUploadLength = ibCreator.ibLength; 
        let indexbuffer = LayaGL.renderDeviceFactory.createIndexBuffer(usage);
        indexbuffer.indexType = indexFormat;
        indexbuffer.indexCount = maxIndexCount;
        indexbuffer._setIndexDataLength(ibByteLength);
   
        mesh._indexBuffer = indexbuffer;


        let state = mesh._bufferState;
        state.applyState(vertexBuffers, indexbuffer);

        // //@ts-ignore
        // mesh._customData = {
        //     vb:vbCreator.vb.slice(0,vbCreator.vbLength),
        //     ib:ibCreator.ib.slice(0,ibCreator.ibLength)
        // }
       
        // let subMeshes:IRenderGeometryElement[] = [];

        // let multi = ibCreator.outRenderData;
        // for (let i = 0 , len = multi.renderData.length; i < len; i++) {
        //     let data = multi.renderData[i];

        //     let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        //     geometry.bufferState = state;

        //     geometry.setDrawElemenParams(data.length , data.offset * ibCreator.size);

        //     geometry.indexFormat = ibCreator.type;
        //     subMeshes.push(geometry);
        // }

        // mesh._setSubMeshes(subMeshes);

		var memorySize: number = vbByteLength + ibByteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);

        return mesh;
    }

    static updateSpineSubMesh( mesh:Mesh2D , mulitRenderData:MultiRenderData , dynamicInfo : SketonDynamicInfo):boolean{
        let subMeshCount = mesh.subMeshCount;
        let renderdata = mulitRenderData.renderData;
        let rdLength = renderdata.length;
        let needUpdate = subMeshCount != rdLength;
        let subMeshes = mesh._subMeshes;

        if (needUpdate) {
            let flen = Math.max(rdLength , subMeshCount);
            let state = mesh._bufferState;

            for (let i = 0; i < flen; i++) {
                let submesh = subMeshes[i];
                let data = renderdata[i];
                if (data) {
                    if (!submesh) {
                        submesh = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
                        submesh.bufferState = state;
                        submesh.indexFormat = dynamicInfo.indexFormat;
                        subMeshes[i] = submesh;
                    }

                    submesh.clearRenderParams();
                    submesh.setDrawElemenParams(data.length , data.offset * dynamicInfo.indexByteCount);
                }else{
                    submesh.destroy();
                }
            }
            subMeshes.length = rdLength;
        }else{
            for (let i = 0; i < subMeshCount; i++) {
                let submesh = subMeshes[i];
                let data = renderdata[i];
                submesh.clearRenderParams();
                submesh.setDrawElemenParams(data.length , data.offset * dynamicInfo.indexByteCount);
            }
        }
        return needUpdate;
    }

    private static _vertexDeclarationMap: any = {};

    static getVertexDeclaration( vertexFlag:string ){
        var verDec: VertexDeclaration = SpineMeshUtils._vertexDeclarationMap[vertexFlag];
		if (!verDec) {
			var subFlags: any[] = vertexFlag.split(",");
			var elements: VertexElement[] = [];
            var offset: number = 0;

			for (var i: number = 0, n: number = subFlags.length; i < n; i++) {
				var element: VertexElement;
				switch (subFlags[i]) {
                    case "COLOR2":
						element = new VertexElement(offset, VertexElementFormat.Vector4, SpineMeshUtils.SPINEMESH_COLOR2);
						offset += 16;
						break;
					case "BONE":
						element = new VertexElement(offset, VertexElementFormat.Single, 3);
        				elements.push(element);
                        offset += 4;

                        element = new VertexElement(offset, VertexElementFormat.Single, 4);
        				elements.push(element);
                        offset += 4;

                        element = new VertexElement(offset, VertexElementFormat.Vector4, 5);
        				elements.push(element);
                        offset += 16;

                        element = new VertexElement(offset, VertexElementFormat.Vector4, 6);
        				elements.push(element);
                        offset += 16;

                        element = new VertexElement(offset, VertexElementFormat.Vector4, 7);
                        offset += 16;
						break;
                    case "RIGIDBODY":
                        element = new VertexElement(offset, VertexElementFormat.Single, 4);
                        offset += 4;
                        break;
                    case "UV":
                        element = new VertexElement(offset, VertexElementFormat.Vector2, 0);
                        offset += 8;
                        break;
                    case "COLOR":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, 1);
                        offset += 16;
                        break;
                    case "POSITION":
                        element = new VertexElement(offset, VertexElementFormat.Vector2, 2);
                        offset += 8
                        break;
                        
					default:
						throw "VertexMesh: unknown vertex flag.";
				}
				elements.push(element);
			}

			verDec = new VertexDeclaration(offset, elements);
			SpineMeshUtils._vertexDeclarationMap[vertexFlag] = verDec;
		}
          
        return verDec;
    }
}