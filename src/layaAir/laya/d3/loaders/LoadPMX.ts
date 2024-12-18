import { Byte } from "../../utils/Byte";
import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Vector3 } from "../../maths/Vector3";
import { Vector2 } from "../../maths/Vector2";
import { VertexBuffer3D } from "../graphics/VertexBuffer3D";
import { IndexBuffer3D } from "../graphics/IndexBuffer3D";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { Skeleton } from "../../ani/bone/Skeleton";
import { Bone } from "../../ani/bone/Bone";
import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { PBRMaterial } from "../core/material/PBRMaterial";
import { PBRStandardMaterial } from "../core/material/PBRStandardMaterial";
import { Color } from "../../maths/Color";
import { Texture2D } from "../../resource/Texture2D";
import { Handler } from "../../utils/Handler";
import { Bounds } from "../math/Bounds";

export class LoadModelPMX {
    private static _readData: Byte;
    private static _mesh: Mesh;
    private static _subMeshes: SubMesh[];
    private static _encoding: string;
    private static _textureNames: string[];
    private static _modelInfo:any;

    static parse(readData: Byte): Mesh {
        let mesh = new Mesh();
        LoadModelPMX._mesh = mesh;
        LoadModelPMX._subMeshes = [];
        LoadModelPMX._readData = readData;

        LoadModelPMX.READ_HEADER();
        LoadModelPMX.READ_VERTEX();
        LoadModelPMX.READ_FACE();
        LoadModelPMX.READ_TEXTURE();
        LoadModelPMX.READ_MATERIAL();
        // LoadModelPMX.READ_BONE();
        // 可以根据需要添加更多的读取方法

        mesh._setSubMeshes(LoadModelPMX._subMeshes);
        LoadModelPMX._readData = null;
        LoadModelPMX._mesh = null;
        LoadModelPMX._subMeshes = null;
        return mesh;
    }

    private static READ_HEADER(): void {
        const reader = LoadModelPMX._readData;
        // 读取PMX文件标识
        const signature = reader.readUTFBytes(4);
        if (signature !== "PMX ") {
            throw new Error("Invalid PMX file");
        }
        // 读取版本号
        const version = reader.getFloat32();

        // 读取全局信息数量 (PMX 2.0固定为8)
        const globalCount = reader.getByte();
        if (globalCount !== 8) {
            throw new Error("Invalid PMX global info count");
        }

        // 读取全局信息
        const globals = new Array(globalCount);
        for (let i = 0; i < globalCount; i++) {
            globals[i] = reader.getByte();
        }

        // 解析全局信息
        LoadModelPMX._encoding = globals[0] === 0 ? "utf16le" : "utf8";
        const additionalVec4Count = globals[1];
        const vertexIndexSize = globals[2];
        const textureIndexSize = globals[3];
        const materialIndexSize = globals[4];
        const boneIndexSize = globals[5];
        const morphIndexSize = globals[6];
        const rigidBodyIndexSize = globals[7];

        // 读取模型信息
        const modelNameLocal = this.readString();
        const modelNameUniversal = this.readString();
        const commentsLocal = this.readString();
        const commentsUniversal = this.readString();

        // 存储读取的信息
        this._modelInfo = {
            version,
            encoding: LoadModelPMX._encoding,
            additionalVec4Count,
            vertexIndexSize,
            textureIndexSize,
            materialIndexSize,
            boneIndexSize,
            morphIndexSize,
            rigidBodyIndexSize,
            modelNameLocal,
            modelNameUniversal,
            commentsLocal,
            commentsUniversal
        };
    }

    private static READ_VERTEX(): void {
        const reader = LoadModelPMX._readData;
        const mesh = LoadModelPMX._mesh;

        const vertexCount = reader.getUint32();
        console.log("Vertex count:", vertexCount);

        // 修改：增加骨骼权重和索引的数量
        const vertexSize = 12 + 12 + 8 + //pos+norm+uv
            //this._modelInfo.additionalVec4Count*16 + //addition vec4
         + 16 + 16; //  boneIndices(4) + boneWeights(4)
        const vertexData = new ArrayBuffer(vertexCount * vertexSize);
        const positionArray = new Float32Array(vertexData, 0, vertexCount * 3);
        const normalArray = new Float32Array(vertexData, vertexCount * 12, vertexCount * 3);
        const uvArray = new Float32Array(vertexData, vertexCount * 24, vertexCount * 2);
        // 修改：将骨骼索引和权重数组扩展为4个元素
        const boneIndicesArray = new Uint16Array(vertexData, vertexCount * 32, vertexCount * 4);
        const boneWeightsArray = new Float32Array(vertexData, vertexCount * 40, vertexCount * 4);

        console.log("Vertex data buffer created");

        let minx=10000,miny=10000,minz=10000;
        let maxx=-10000,maxy=-10000,maxz=-10000;

        for (let i = 0; i < vertexCount; i++) {
            // 读取位置
            let x = reader.getFloat32();
            let y = reader.getFloat32();
            let z = reader.getFloat32();
            if(x<minx)minx=x; if(x>maxx)maxx=x;
            if(y<miny)miny=y; if(y>maxy)maxy=y;
            if(z<minz)minz=z; if(z>maxz)maxz=z;
            positionArray[i * 3] = x;
            positionArray[i * 3 + 1] = y;
            positionArray[i * 3 + 2] = z;

            // 读取法线
            normalArray[i * 3] = reader.getFloat32();
            normalArray[i * 3 + 1] = reader.getFloat32();
            normalArray[i * 3 + 2] = reader.getFloat32();

            // 读取UV
            uvArray[i * 2] = reader.getFloat32();
            uvArray[i * 2 + 1] = 1 - reader.getFloat32(); // 修改：PMX的UV坐标系与常见3D坐标系不同，需要翻转Y轴

            // 读取额外UV（如果有的话）
            reader.pos = reader.pos + this._modelInfo.additionalVec4Count*16;//额外附加的vec4

            // 读取骨骼权重类型
            const weightType = reader.getByte();
            // 修改：重写骨骼权重读取逻辑
            switch (weightType) {
                case 0: // BDEF1
                    boneIndicesArray[i * 4] = reader.getInt16();//TODO 根据 this._modelInfo.boneIndexSize
                    boneWeightsArray[i * 4] = 1.0;
                    break;
                case 1: // BDEF2
                    boneIndicesArray[i * 4] = reader.getInt16();
                    boneIndicesArray[i * 4 + 1] = reader.getInt16();
                    boneWeightsArray[i * 4] = reader.getFloat32();
                    boneWeightsArray[i * 4 + 1] = 1 - boneWeightsArray[i * 4];
                    break;
                case 2: // BDEF4
                    for (let j = 0; j < 4; j++) {
                        boneIndicesArray[i * 4 + j] = reader.getInt16();
                    }
                    //这种情况下权重和不保证=1
                    for (let j = 0; j < 4; j++) {
                        boneWeightsArray[i * 4 + j] = reader.getFloat32();
                    }
                    break;
                case 3: // SDEF
                    throw "1"
                    console.log("SDEF weight type not fully supported");
                    // 简化处理SDEF，仅读取必要数据
                    for (let j = 0; j < 2; j++) {
                        boneIndicesArray[i * 4 + j] = reader.getInt16();
                    }
                    boneWeightsArray[i * 4] = reader.getFloat32();
                    boneWeightsArray[i * 4 + 1] = 1 - boneWeightsArray[i * 4];
                    reader.getFloat32(); reader.getFloat32(); reader.getFloat32(); // C
                    reader.getFloat32(); reader.getFloat32(); reader.getFloat32(); // R0
                    reader.getFloat32(); reader.getFloat32(); reader.getFloat32(); // R1
                    break;
                case 4://QDEF
                    throw '2'
                    break;
                default:
                    throw '3'
                    console.error("Unknown weight type:", weightType);
                    break;

            }

            // 读取边缘放大率
            const edgeScale = reader.getFloat32();
        }

        const vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV,BLENDWEIGHT,BLENDINDICES");
        const vertexBuffer = new VertexBuffer3D(vertexData.byteLength, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexData);

        mesh._vertexBuffer = vertexBuffer;
        mesh._vertexCount = vertexCount;
        mesh.bounds = new Bounds(new Vector3(minx,miny,minz), new Vector3(maxx,maxy,maxz));
    }

    private static READ_FACE(): void {
        const reader = LoadModelPMX._readData;
        const mesh = LoadModelPMX._mesh;

        const indexCount = reader.getUint32();
        const indexData = new Uint16Array(indexCount);

        for (let i = 0; i < indexCount; i++) {
            indexData[i] = reader.getUint16();
        }

        const indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, indexCount, BufferUsage.Static, true);
        indexBuffer.setData(indexData);

        mesh._indexBuffer = indexBuffer;
        mesh._indexFormat = IndexFormat.UInt16;
        mesh._setBuffer(mesh._vertexBuffer, indexBuffer);
    }

    private static READ_TEXTURE(): void {
        const reader = LoadModelPMX._readData;
        const textureCount = reader.getUint32();
        LoadModelPMX._textureNames = [];

        for (let i = 0; i < textureCount; i++) {
            const texturePath = LoadModelPMX.readString();
            LoadModelPMX._textureNames.push(texturePath);
        }
    }

    private static readTextureIndex(){
        const reader = LoadModelPMX._readData;
        switch(this._modelInfo.textureIndexSize){
            case 1:
                return reader.getByte();
            case 2:
                return reader.getInt16();
            case 4:
                return reader.getInt32();
            default:
                throw 'err255'
        }
    }

    private static READ_MATERIAL(): void {
        const mesh = this._mesh;
        const reader = LoadModelPMX._readData;
        const materialCount = reader.getUint32();
        
        let indexStart = 0;
        for (let i = 0; i < materialCount; i++) {
            const materialName = LoadModelPMX.readString();
            const materialNameEng = LoadModelPMX.readString();

            // 读取漫反射颜色
            const diffuseR = reader.getFloat32();
            const diffuseG = reader.getFloat32();
            const diffuseB = reader.getFloat32();
            const diffuseA = reader.getFloat32();

            // 读取高光颜色
            const specularR = reader.getFloat32();
            const specularG = reader.getFloat32();
            const specularB = reader.getFloat32();
            // 高光强度
            const shininess = reader.getFloat32();

            // 读取环境光颜色
            const ambientR = reader.getFloat32();
            const ambientG = reader.getFloat32();
            const ambientB = reader.getFloat32();

            // 跳过一些标志位
            const flags = reader.getByte();

            // 读取边缘颜色 Vec4
            const edgeR = reader.getFloat32();
            const edgeG = reader.getFloat32();
            const edgeB = reader.getFloat32();
            const edgeA = reader.getFloat32();
            // 边缘比例 [0,1]
            const edgeSize = reader.getFloat32();

            // 读取贴图索引
            const textureIndex = this.readTextureIndex();
            const sphereTextureIndex = this.readTextureIndex();

            // 读取球体模式
            const envBlendMode = reader.getByte();  //0 = disabled, 1 = multiply, 2 = additive, 3 = additional vec4*

            // 读取共享Toon标志
            const toonRef = reader.getByte();   //0 贴图索引， 1 内部引用

            let toonTextureIndex;
            if (toonRef === 0) {
                toonTextureIndex = this.readTextureIndex();
            } else {
                toonTextureIndex = reader.getByte();
            }

            const memo = LoadModelPMX.readString();

            const indexCount = reader.getInt32();

            // 创建材质和SubMesh
            const material = new PBRMaterial();
            // 设置材质属性...
            // 设置材质属性
            material.albedoColor = new Color(diffuseR, diffuseG, diffuseB);
            //material.specularColor = new Color(specularR, specularG, specularB);
            //material.shininess = shininess;

            if (textureIndex >= 0 && textureIndex < LoadModelPMX._textureNames.length) {
                const texturePath = LoadModelPMX._textureNames[textureIndex];
                // 加载贴图
                Texture2D.load(texturePath, Handler.create(null, (texture: Texture2D) => {
                    material.albedoTexture = texture;
                }));
            }

            // 处理球面贴图
            if (sphereTextureIndex >= 0) {
                // 根据sphereMode设置相应的贴图
            }

            // 处理Toon贴图
            if (toonRef === 0 && toonTextureIndex >= 0) {
                // 加载自定义Toon贴图
            } else if (toonRef === 1) {
                // 使用内置Toon贴图
            }

            const subMesh = new SubMesh(mesh);
            subMesh._indexBuffer = mesh._indexBuffer;
            subMesh._vertexBuffer = mesh._vertexBuffer;
            subMesh._setIndexRange(indexStart, indexCount);
    
            //const subMesh = new SubMesh(indexStart, indexCount);
            //subMesh.material = material;

            LoadModelPMX._subMeshes.push(subMesh);

            indexStart += indexCount;
        }
        // 设置网格的SubMesh
        LoadModelPMX._mesh._setSubMeshes(LoadModelPMX._subMeshes);
    }

    private static READ_BONE(): void {
        const reader = LoadModelPMX._readData;
        const boneCount = reader.getUint32();

        for (let i = 0; i < boneCount; i++) {
            const boneName = LoadModelPMX.readString();
            const boneNameEng = LoadModelPMX.readString();

            // 读取位置
            const posX = reader.getFloat32();
            const posY = reader.getFloat32();
            const posZ = reader.getFloat32();

            const parentBoneIndex = reader.getInt32();
            const transformationLevel = reader.getInt32();

            const boneFlag = reader.getUint16();

            // 根据boneFlag读取不同的数据...

            // 创建骨骼并添加到骨骼系统
            // 创建Bone对象
            const bone = new Bone();
            bone.name = boneName;
            bone.transform.position = new Vector3(posX, posY, posZ);

            // 设置父骨骼
            if (parentBoneIndex >= 0) {
                // 需要一个骨骼数组来存储所有的骨骼
                const parentBone = boneArray[parentBoneIndex];
                parentBone.addChild(bone);
            }

            // 根据boneFlag处理不同的bone属性
            if (boneFlag & 0x0001) bone.inheritTranslation = true;
            if (boneFlag & 0x0002) bone.inheritRotation = true;
            if (boneFlag & 0x0004) bone.inheritScale = true;
            if (boneFlag & 0x0008) {
                // 可视骨骼
                // 可以设置一些visual属性
            }
            if (boneFlag & 0x0010) {
                // 可以被操作
                bone.isOperatable = true;
            }
            // ... 处理其他标志位

            // 将bone添加到骨骼数组
            boneArray.push(bone);
        }

        // 创建骨骼系统并设置给Mesh
        const skeleton = new Skeleton();
        skeleton.bones = boneArray;
        LoadModelPMX._mesh.skeleton = skeleton;
    }

    private static READ_MORPH(): void {
        const reader = LoadModelPMX._readData;
        const morphCount = reader.getUint32();

        for (let i = 0; i < morphCount; i++) {
            const morphName = LoadModelPMX.readString();
            const morphNameEng = LoadModelPMX.readString();
            const panel = reader.getByte();
            const morphType = reader.getByte();

            const offsetCount = reader.getUint32();

            switch (morphType) {
                case 0: // Group morph
                    // 处理组变形
                    break;
                case 1: // Vertex morph
                    // 处理顶点变形
                    break;
                case 2: // Bone morph
                    // 处理骨骼变形
                    break;
                case 3: // UV morph
                case 4: // UV1 morph
                case 5: // UV2 morph
                case 6: // UV3 morph
                case 7: // UV4 morph
                    // 处理UV变形
                    break;
                case 8: // Material morph
                    // 处理材质变形
                    break;
                case 9: // Flip morph
                    // 处理翻转变形
                    break;
                case 10: // Impulse morph
                    // 处理冲击变形
                    break;
            }

            // 创建Morph对象并添加到Mesh
            // LayaAir可能需要自定义实现Morph系统
        }
    }

    private static readString(): string {
        const reader = LoadModelPMX._readData;
        const length = reader.getInt32();
        let ab = reader.readArrayBuffer(length);
        const decoder = new TextDecoder('utf-16le');
        return decoder.decode(ab);
    }
}