import { ConsoleLogger, type ILogger } from "./ILogger";
import { MmdDataDeserializer } from "./mmdDataDeserializer";
import type { Vec3, Vec4 } from "./mmdTypes";
import { PmxObject } from "./pmxObject";

class IndexReader {
    private readonly _vertexIndexSize: number;
    private readonly _textureIndexSize: number;
    private readonly _materialIndexSize: number;
    private readonly _boneIndexSize: number;
    private readonly _morphIndexSize: number;
    private readonly _rigidBodyIndexSize: number;

    public constructor(
        vertexIndexSize: number,
        textureIndexSize: number,
        materialIndexSize: number,
        boneIndexSize: number,
        morphIndexSize: number,
        rigidBodyIndexSize: number
    ) {
        this._vertexIndexSize = vertexIndexSize;
        this._textureIndexSize = textureIndexSize;
        this._materialIndexSize = materialIndexSize;
        this._boneIndexSize = boneIndexSize;
        this._morphIndexSize = morphIndexSize;
        this._rigidBodyIndexSize = rigidBodyIndexSize;
    }

    public getVertexIndex(dataDeserializer: MmdDataDeserializer): number {
        switch (this._vertexIndexSize) {
        case 1:
            return dataDeserializer.getUint8();
        case 2:
            return dataDeserializer.getUint16();
        case 4:
            return dataDeserializer.getInt32();
        default:
            throw new Error(`Invalid vertexIndexSize: ${this._vertexIndexSize}`);
        }
    }

    private _getNonVertexIndex(dataDeserializer: MmdDataDeserializer, indexSize: number): number {
        switch (indexSize) {
        case 1:
            return dataDeserializer.getInt8();
        case 2:
            return dataDeserializer.getInt16();
        case 4:
            return dataDeserializer.getInt32();
        default:
            throw new Error(`Invalid indexSize: ${indexSize}`);
        }
    }

    public getTextureIndex(dataDeserializer: MmdDataDeserializer): number {
        return this._getNonVertexIndex(dataDeserializer, this._textureIndexSize);
    }

    public getMaterialIndex(dataDeserializer: MmdDataDeserializer): number {
        return this._getNonVertexIndex(dataDeserializer, this._materialIndexSize);
    }

    public getBoneIndex(dataDeserializer: MmdDataDeserializer): number {
        return this._getNonVertexIndex(dataDeserializer, this._boneIndexSize);
    }

    public getMorphIndex(dataDeserializer: MmdDataDeserializer): number {
        return this._getNonVertexIndex(dataDeserializer, this._morphIndexSize);
    }

    public getRigidBodyIndex(dataDeserializer: MmdDataDeserializer): number {
        return this._getNonVertexIndex(dataDeserializer, this._rigidBodyIndexSize);
    }
}

/**
 * PmxReader is a static class that parses PMX data
 */
export class PmxReader {
    private constructor() { /* block constructor */ }

    /**
     * Parses PMX data asynchronously
     * @param data Arraybuffer of PMX data
     * @param logger Logger
     * @returns PMX data
     * @throws {Error} If the parse fails
     */
    public static async ParseAsync(data: ArrayBufferLike, logger: ILogger = new ConsoleLogger()) {
        const dataDeserializer = new MmdDataDeserializer(data);

        const header = this._ParseHeader(dataDeserializer, logger);
        const indexReader = new IndexReader(
            header.vertexIndexSize,
            header.textureIndexSize,
            header.materialIndexSize,
            header.boneIndexSize,
            header.morphIndexSize,
            header.rigidBodyIndexSize
        );

        const vertices = await this._ParseVerticesAsync(dataDeserializer, indexReader, header);
        const indices = this._ParseIndices(dataDeserializer, indexReader, header);
        const textures = this._ParseTextures(dataDeserializer);
        const materials = this._ParseMaterials(dataDeserializer, indexReader);
        const bones = this._ParseBones(dataDeserializer, indexReader);
        const morphs = this._ParseMorphs(dataDeserializer, indexReader);
        const displayFrames = this._ParseDisplayFrames(dataDeserializer, indexReader);
        const rigidBodies = this._ParseRigidBodies(dataDeserializer, indexReader);
        const joints = this._ParseJoints(dataDeserializer, indexReader);
        const softBodies = header.version <= 2.0
            ? []
            : this._ParseSoftBodies(dataDeserializer, indexReader, header);

        if (dataDeserializer.bytesAvailable > 0) {
            logger.warn(`There are ${dataDeserializer.bytesAvailable} bytes left after parsing`);
        }

        const pmxObject: PmxObject = {
            header,
            vertices,
            indices,
            textures,
            materials,
            bones,
            morphs,
            displayFrames,
            rigidBodies,
            joints,
            softBodies,
        };

        return pmxObject;
    }

    private static _ParseHeader(dataDeserializer: MmdDataDeserializer, logger: ILogger): PmxObject.Header {
        if (dataDeserializer.bytesAvailable < (
            4 // signature
            + 4 // version (float32)
            + 1 // globalsCount (uint8)
            + 1 // encoding (uint8)
            + 1 // additionalVec4Count (uint8)
            + 1 // vertexIndexSize (uint8)
            + 1 // textureIndexSize (uint8)
            + 1 // materialIndexSize (uint8)
            + 1 // boneIndexSize (uint8)
            + 1 // morphIndexSize (uint8)
            + 1 // rigidBodyIndexSize (uint8)
        )) {
            throw new RangeError("is not pmx file");
        }
        const signature = dataDeserializer.getSignatureString(3);
        if (signature !== "PMX") {
            throw new RangeError("is not pmx file");
        }
        dataDeserializer.getInt8(); // skip byte alignment

        const version = dataDeserializer.getFloat32();

        const globalsCount = dataDeserializer.getUint8();

        const encoding = dataDeserializer.getUint8();
        dataDeserializer.initializeTextDecoder(encoding === PmxObject.Header.Encoding.Utf8 ? "utf-8" : "utf-16le");

        const additionalVec4Count = dataDeserializer.getUint8();
        const vertexIndexSize = dataDeserializer.getUint8();
        const textureIndexSize = dataDeserializer.getUint8();
        const materialIndexSize = dataDeserializer.getUint8();
        const boneIndexSize = dataDeserializer.getUint8();
        const morphIndexSize = dataDeserializer.getUint8();
        const rigidBodyIndexSize = dataDeserializer.getUint8();

        if (globalsCount < 8) {
            throw new Error(`Invalid globalsCount: ${globalsCount}`);
        } else if (8 < globalsCount) {
            logger.warn(`globalsCount is greater than 8: ${globalsCount} files may be corrupted or higher version`);
            for (let i = 8; i < globalsCount; ++i) {
                dataDeserializer.getUint8();
            }
        }

        const modelName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
        const englishModelName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
        const comment = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
        const englishComment = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

        const header: PmxObject.Header = {
            signature,
            version,

            encoding,
            additionalVec4Count,

            vertexIndexSize,
            textureIndexSize,
            materialIndexSize,
            boneIndexSize,
            morphIndexSize,
            rigidBodyIndexSize,

            modelName,
            englishModelName,
            comment,
            englishComment
        };
        return header;
    }

    private static async _ParseVerticesAsync(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader,
        header: PmxObject.Header
    ): Promise<PmxObject.Vertex[]> {
        const verticesCount = dataDeserializer.getInt32();

        const vertices: PmxObject.Vertex[] = [];

        let time = performance.now();
        for (let i = 0; i < verticesCount; ++i) {
            const position = dataDeserializer.getFloat32Tuple(3);
            const normal = dataDeserializer.getFloat32Tuple(3);
            const uv = dataDeserializer.getFloat32Tuple(2);
            const additionalVec4: Vec4[] = [];
            for (let j = 0; j < header.additionalVec4Count; ++j) {
                additionalVec4.push(dataDeserializer.getFloat32Tuple(4));
            }
            const weightType: PmxObject.Vertex.BoneWeightType = dataDeserializer.getUint8();

            let boneWeight: PmxObject.Vertex.BoneWeight;

            switch (weightType) {
            case PmxObject.Vertex.BoneWeightType.Bdef1: {
                const bdef1weight: PmxObject.Vertex.BoneWeight<PmxObject.Vertex.BoneWeightType.Bdef1> = {
                    boneIndices: indexReader.getBoneIndex(dataDeserializer),
                    boneWeights: null
                };
                boneWeight = bdef1weight;
                break;
            }
            case PmxObject.Vertex.BoneWeightType.Bdef2: {
                const bdef2weight: PmxObject.Vertex.BoneWeight<PmxObject.Vertex.BoneWeightType.Bdef2> = {
                    boneIndices: [indexReader.getBoneIndex(dataDeserializer), indexReader.getBoneIndex(dataDeserializer)],
                    boneWeights: dataDeserializer.getFloat32()
                };
                boneWeight = bdef2weight;
                break;
            }
            case PmxObject.Vertex.BoneWeightType.Bdef4: {
                const bdef4weight: PmxObject.Vertex.BoneWeight<PmxObject.Vertex.BoneWeightType.Bdef4> = {
                    boneIndices: [
                        indexReader.getBoneIndex(dataDeserializer),
                        indexReader.getBoneIndex(dataDeserializer),
                        indexReader.getBoneIndex(dataDeserializer),
                        indexReader.getBoneIndex(dataDeserializer)
                    ],
                    boneWeights: [
                        dataDeserializer.getFloat32(),
                        dataDeserializer.getFloat32(),
                        dataDeserializer.getFloat32(),
                        dataDeserializer.getFloat32()
                    ]
                };
                boneWeight = bdef4weight;
                break;
            }
            case PmxObject.Vertex.BoneWeightType.Sdef: {
                const sdefweight: PmxObject.Vertex.BoneWeight<PmxObject.Vertex.BoneWeightType.Sdef> = {
                    boneIndices: [indexReader.getBoneIndex(dataDeserializer), indexReader.getBoneIndex(dataDeserializer)],
                    boneWeights: {
                        boneWeight0: dataDeserializer.getFloat32(),
                        c: dataDeserializer.getFloat32Tuple(3),
                        r0: dataDeserializer.getFloat32Tuple(3),
                        r1: dataDeserializer.getFloat32Tuple(3)
                    }
                };
                boneWeight = sdefweight;
                break;
            }
            case PmxObject.Vertex.BoneWeightType.Qdef: {
                const qdefweight: PmxObject.Vertex.BoneWeight<PmxObject.Vertex.BoneWeightType.Qdef> = {
                    boneIndices: [
                        indexReader.getBoneIndex(dataDeserializer),
                        indexReader.getBoneIndex(dataDeserializer),
                        indexReader.getBoneIndex(dataDeserializer),
                        indexReader.getBoneIndex(dataDeserializer)
                    ],
                    boneWeights: [
                        dataDeserializer.getFloat32(),
                        dataDeserializer.getFloat32(),
                        dataDeserializer.getFloat32(),
                        dataDeserializer.getFloat32()
                    ]
                };
                boneWeight = qdefweight;
                break;
            }
            default:
                throw new Error(`Invalid weightType: ${weightType}`);
            }

            const edgeScale = dataDeserializer.getFloat32();

            vertices.push({
                position,
                normal,
                uv,
                additionalVec4,
                weightType,
                boneWeight,
                edgeScale
            });

            if (i % 10000 === 0 && 100 < performance.now() - time) {
                await new Promise(resolve => setTimeout(resolve, 0));
                time = performance.now();
            }
        }

        return vertices;
    }

    private static _ParseIndices(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader,
        header: PmxObject.Header
    ): Uint8Array | Uint16Array | Int32Array {
        const indicesCount = dataDeserializer.getInt32();

        const indexArrayBuffer = new ArrayBuffer(indicesCount * header.vertexIndexSize);

        let indices: Uint8Array | Uint16Array | Int32Array;
        switch (header.vertexIndexSize) {
        case 1:
            indices = new Uint8Array(indexArrayBuffer);
            break;
        case 2:
            indices = new Uint16Array(indexArrayBuffer);
            break;
        case 4:
            indices = new Int32Array(indexArrayBuffer);
            break;
        default:
            throw new Error(`Invalid vertexIndexSize: ${header.vertexIndexSize}`);
        }

        for (let i = 0; i < indicesCount; ++i) {
            indices[i] = indexReader.getVertexIndex(dataDeserializer);
        }

        return indices;
    }

    private static _ParseTextures(dataDeserializer: MmdDataDeserializer): PmxObject.Texture[] {
        const texturesCount = dataDeserializer.getInt32();

        const textures: PmxObject.Texture[] = [];
        for (let i = 0; i < texturesCount; ++i) {
            const textureName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            textures.push(textureName);
        }

        return textures;
    }

    private static _ParseMaterials(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader
    ): PmxObject.Material[] {
        const materialsCount = dataDeserializer.getInt32();

        const materials: PmxObject.Material[] = [];
        for (let i = 0; i < materialsCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const diffuse = dataDeserializer.getFloat32Tuple(4);
            const specular = dataDeserializer.getFloat32Tuple(3);
            const shininess = dataDeserializer.getFloat32();
            const ambient = dataDeserializer.getFloat32Tuple(3);

            const flag = dataDeserializer.getUint8();

            const edgeColor = dataDeserializer.getFloat32Tuple(4);
            const edgeSize = dataDeserializer.getFloat32();

            const textureIndex = indexReader.getTextureIndex(dataDeserializer);
            const sphereTextureIndex = indexReader.getTextureIndex(dataDeserializer);
            const sphereTextureMode = dataDeserializer.getUint8();

            const isSharedToonTexture = dataDeserializer.getUint8() === 1;
            const toonTextureIndex = isSharedToonTexture ? dataDeserializer.getUint8() : indexReader.getTextureIndex(dataDeserializer);

            const comment = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const indexCount = dataDeserializer.getInt32();

            const material: PmxObject.Material = {
                name,
                englishName,

                diffuse,
                specular,
                shininess,
                ambient,

                flag,

                edgeColor,
                edgeSize,

                textureIndex,
                sphereTextureIndex,
                sphereTextureMode,

                isSharedToonTexture,
                toonTextureIndex,

                comment,
                indexCount
            };
            materials.push(material);
        }

        return materials;
    }

    private static _ParseBones(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader
    ): PmxObject.Bone[] {
        const bonesCount = dataDeserializer.getInt32();

        const bones: PmxObject.Bone[] = [];
        for (let i = 0; i < bonesCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const position = dataDeserializer.getFloat32Tuple(3);
            const parentBoneIndex = indexReader.getBoneIndex(dataDeserializer);
            const transformOrder = dataDeserializer.getInt32();

            const flag = dataDeserializer.getUint16();

            let tailPosition: number | Vec3;

            if (flag & PmxObject.Bone.Flag.UseBoneIndexAsTailPosition) {
                tailPosition = indexReader.getBoneIndex(dataDeserializer);
            } else {
                tailPosition = dataDeserializer.getFloat32Tuple(3);
            }

            let appendTransform;

            if (flag & PmxObject.Bone.Flag.HasAppendMove || flag & PmxObject.Bone.Flag.HasAppendRotate) {
                appendTransform = {
                    parentIndex: indexReader.getBoneIndex(dataDeserializer),
                    ratio: dataDeserializer.getFloat32()
                };
            }

            let axisLimit: Vec3 | undefined;

            if (flag & PmxObject.Bone.Flag.HasAxisLimit) {
                axisLimit = dataDeserializer.getFloat32Tuple(3);
            }

            let localVector;

            if (flag & PmxObject.Bone.Flag.HasLocalVector) {
                localVector = {
                    x: dataDeserializer.getFloat32Tuple(3),
                    z: dataDeserializer.getFloat32Tuple(3)
                };
            }

            let externalParentTransform: number | undefined;

            if (flag & PmxObject.Bone.Flag.IsExternalParentTransformed) {
                externalParentTransform = dataDeserializer.getInt32();
            }

            let ik;

            if (flag & PmxObject.Bone.Flag.IsIkEnabled) {
                const target = indexReader.getBoneIndex(dataDeserializer);
                const iteration = dataDeserializer.getInt32();
                const rotationConstraint = dataDeserializer.getFloat32();

                const links: PmxObject.Bone.IKLink[] = [];

                const linksCount = dataDeserializer.getInt32();
                for (let i = 0; i < linksCount; ++i) {
                    const ikLinkTarget = indexReader.getBoneIndex(dataDeserializer);
                    const hasLimit = dataDeserializer.getUint8() === 1;

                    const link: PmxObject.Bone.IKLink = {
                        target: ikLinkTarget,
                        limitation: hasLimit ? {
                            minimumAngle: dataDeserializer.getFloat32Tuple(3),
                            maximumAngle: dataDeserializer.getFloat32Tuple(3)
                        } : undefined
                    };
                    links.push(link);
                }

                ik = {
                    target,
                    iteration,
                    rotationConstraint,
                    links
                };
            }


            const bone: PmxObject.Bone = {
                name,
                englishName,

                position,
                parentBoneIndex,
                transformOrder,

                flag,
                tailPosition,

                appendTransform,
                axisLimit,

                localVector,
                externalParentTransform,
                ik
            };
            bones.push(bone);
        }

        return bones;
    }

    private static _ParseMorphs(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader
    ): PmxObject.Morph[] {
        const morphsCount = dataDeserializer.getInt32();

        const morphs: PmxObject.Morph[] = [];
        for (let i = 0; i < morphsCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const category: PmxObject.Morph.Category = dataDeserializer.getInt8();
            const type: PmxObject.Morph.Type = dataDeserializer.getInt8();

            let morph: Partial<PmxObject.Morph> = {
                name,
                englishName,
                category,
                type
            };

            const morphOffsetCount = dataDeserializer.getInt32();

            switch (type) {
            case PmxObject.Morph.Type.GroupMorph:
                {
                    const indices = new Int32Array(morphOffsetCount);
                    const ratios = new Float32Array(morphOffsetCount);

                    for (let i = 0; i < morphOffsetCount; ++i) {
                        indices[i] = indexReader.getMorphIndex(dataDeserializer);
                        ratios[i] = dataDeserializer.getFloat32();
                    }

                    morph = <PmxObject.Morph.GroupMorph>{
                        ...morph,
                        indices,
                        ratios
                    };
                }
                break;
            case PmxObject.Morph.Type.VertexMorph:
                {
                    const indices = new Int32Array(morphOffsetCount);
                    const positions = new Float32Array(morphOffsetCount * 3);

                    for (let i = 0; i < morphOffsetCount; ++i) {
                        indices[i] = indexReader.getVertexIndex(dataDeserializer);

                        positions[i * 3 + 0] = dataDeserializer.getFloat32();
                        positions[i * 3 + 1] = dataDeserializer.getFloat32();
                        positions[i * 3 + 2] = dataDeserializer.getFloat32();
                    }

                    morph = <PmxObject.Morph.VertexMorph>{
                        ...morph,
                        indices,
                        positions
                    };
                }
                break;
            case PmxObject.Morph.Type.BoneMorph:
                {
                    const indices = new Int32Array(morphOffsetCount);
                    const positions = new Float32Array(morphOffsetCount * 3);
                    const rotations = new Float32Array(morphOffsetCount * 4);

                    for (let i = 0; i < morphOffsetCount; ++i) {
                        indices[i] = indexReader.getBoneIndex(dataDeserializer);

                        positions[i * 3 + 0] = dataDeserializer.getFloat32();
                        positions[i * 3 + 1] = dataDeserializer.getFloat32();
                        positions[i * 3 + 2] = dataDeserializer.getFloat32();

                        rotations[i * 4 + 0] = dataDeserializer.getFloat32();
                        rotations[i * 4 + 1] = dataDeserializer.getFloat32();
                        rotations[i * 4 + 2] = dataDeserializer.getFloat32();
                        rotations[i * 4 + 3] = dataDeserializer.getFloat32();
                    }

                    morph = <PmxObject.Morph.BoneMorph>{
                        ...morph,
                        indices,
                        positions,
                        rotations
                    };
                }
                break;
            case PmxObject.Morph.Type.UvMorph:
            case PmxObject.Morph.Type.AdditionalUvMorph1:
            case PmxObject.Morph.Type.AdditionalUvMorph2:
            case PmxObject.Morph.Type.AdditionalUvMorph3:
            case PmxObject.Morph.Type.AdditionalUvMorph4:
                {
                    const indices = new Int32Array(morphOffsetCount);
                    const offsets = new Float32Array(morphOffsetCount * 4);

                    for (let i = 0; i < morphOffsetCount; ++i) {
                        indices[i] = indexReader.getVertexIndex(dataDeserializer);

                        offsets[i * 4 + 0] = dataDeserializer.getFloat32();
                        offsets[i * 4 + 1] = dataDeserializer.getFloat32();
                        offsets[i * 4 + 2] = dataDeserializer.getFloat32();
                        offsets[i * 4 + 3] = dataDeserializer.getFloat32();
                    }

                    morph = <PmxObject.Morph.UvMorph>{
                        ...morph,
                        indices,
                        offsets
                    };
                }
                break;
            case PmxObject.Morph.Type.MaterialMorph:
                {
                    const elements: PmxObject.Morph.MaterialMorph["elements"] = [];
                    for (let i = 0; i < morphOffsetCount; ++i) {
                        const materialIndex = indexReader.getMaterialIndex(dataDeserializer);
                        const type = dataDeserializer.getUint8();
                        const diffuse = dataDeserializer.getFloat32Tuple(4);
                        const specular = dataDeserializer.getFloat32Tuple(3);
                        const shininess = dataDeserializer.getFloat32();
                        const ambient = dataDeserializer.getFloat32Tuple(3);
                        const edgeColor = dataDeserializer.getFloat32Tuple(4);
                        const edgeSize = dataDeserializer.getFloat32();
                        const textureColor = dataDeserializer.getFloat32Tuple(4);
                        const sphereTextureColor = dataDeserializer.getFloat32Tuple(4);
                        const toonTextureColor = dataDeserializer.getFloat32Tuple(4);

                        const element: PmxObject.Morph.MaterialMorph["elements"][number] = {
                            index: materialIndex,
                            type,
                            diffuse,
                            specular,
                            shininess,
                            ambient,
                            edgeColor,
                            edgeSize,
                            textureColor,
                            sphereTextureColor,
                            toonTextureColor
                        };
                        elements.push(element);
                    }

                    morph = <PmxObject.Morph.MaterialMorph>{
                        ...morph,
                        elements
                    };
                }
                break;
            case PmxObject.Morph.Type.FlipMorph:
                {
                    const indices = new Int32Array(morphOffsetCount);
                    const ratios = new Float32Array(morphOffsetCount);

                    for (let i = 0; i < morphOffsetCount; ++i) {
                        indices[i] = indexReader.getMorphIndex(dataDeserializer);
                        ratios[i] = dataDeserializer.getFloat32();
                    }

                    morph = <PmxObject.Morph.FlipMorph>{
                        ...morph,
                        indices,
                        ratios
                    };
                }
                break;
            case PmxObject.Morph.Type.ImpulseMorph:
                {
                    const indices = new Int32Array(morphOffsetCount);
                    const isLocals = new Array<boolean>(morphOffsetCount);
                    const velocities = new Float32Array(morphOffsetCount * 3);
                    const torques = new Float32Array(morphOffsetCount * 3);

                    for (let i = 0; i < morphOffsetCount; ++i) {
                        indices[i] = indexReader.getRigidBodyIndex(dataDeserializer);

                        isLocals[i] = dataDeserializer.getUint8() === 1;

                        velocities[i * 3 + 0] = dataDeserializer.getFloat32();
                        velocities[i * 3 + 1] = dataDeserializer.getFloat32();
                        velocities[i * 3 + 2] = dataDeserializer.getFloat32();

                        torques[i * 3 + 0] = dataDeserializer.getFloat32();
                        torques[i * 3 + 1] = dataDeserializer.getFloat32();
                        torques[i * 3 + 2] = dataDeserializer.getFloat32();
                    }

                    morph = <PmxObject.Morph.ImpulseMorph>{
                        ...morph,
                        indices,
                        isLocals,
                        velocities,
                        torques
                    };
                }
                break;
            default:
                throw new Error(`Unknown morph type: ${type}`);
            }

            morphs.push(morph as PmxObject.Morph);
        }

        return morphs;
    }

    private static _ParseDisplayFrames(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader
    ): PmxObject.DisplayFrame[] {
        const displayFramesCount = dataDeserializer.getInt32();

        const displayFrames: PmxObject.DisplayFrame[] = [];
        for (let i = 0; i < displayFramesCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const isSpecialFrame = dataDeserializer.getUint8() === 1;

            const elementsCount = dataDeserializer.getInt32();
            const frames: PmxObject.DisplayFrame.FrameData[] = [];
            for (let i = 0; i < elementsCount; ++i) {
                const frameType = dataDeserializer.getUint8();
                const frameIndex = frameType === PmxObject.DisplayFrame.FrameData.FrameType.Bone
                    ? indexReader.getBoneIndex(dataDeserializer)
                    : indexReader.getMorphIndex(dataDeserializer);

                const frame: PmxObject.DisplayFrame.FrameData = {
                    type: frameType,
                    index: frameIndex
                };
                frames.push(frame);
            }

            const displayFrame: PmxObject.DisplayFrame = {
                name,
                englishName,
                isSpecialFrame,
                frames
            };
            displayFrames.push(displayFrame);
        }

        return displayFrames;
    }

    private static _ParseRigidBodies(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader
    ): PmxObject.RigidBody[] {
        const rigidBodiesCount = dataDeserializer.getInt32();

        const rigidBodies: PmxObject.RigidBody[] = [];
        for (let i = 0; i < rigidBodiesCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const boneIndex = indexReader.getBoneIndex(dataDeserializer);

            const collisionGroup = dataDeserializer.getUint8();
            const collisionMask = dataDeserializer.getUint16();

            const shapeType: PmxObject.RigidBody.ShapeType = dataDeserializer.getUint8();
            const shapeSize = dataDeserializer.getFloat32Tuple(3);
            const shapePosition = dataDeserializer.getFloat32Tuple(3);
            const shapeRotation = dataDeserializer.getFloat32Tuple(3);

            const mass = dataDeserializer.getFloat32();
            const linearDamping = dataDeserializer.getFloat32();
            const angularDamping = dataDeserializer.getFloat32();
            const repulsion = dataDeserializer.getFloat32();
            const friction = dataDeserializer.getFloat32();

            const physicsMode: PmxObject.RigidBody.PhysicsMode = dataDeserializer.getUint8();

            const rigidBody: PmxObject.RigidBody = {
                name,
                englishName,
                boneIndex,
                collisionGroup,
                collisionMask,
                shapeType,
                shapeSize,
                shapePosition,
                shapeRotation,
                mass,
                linearDamping,
                angularDamping,
                repulsion,
                friction,
                physicsMode
            };
            rigidBodies.push(rigidBody);
        }

        return rigidBodies;
    }

    private static _ParseJoints(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader
    ): PmxObject.Joint[] {
        const jointsCount = dataDeserializer.getInt32();

        const joints: PmxObject.Joint[] = [];
        for (let i = 0; i < jointsCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const type: PmxObject.Joint.Type = dataDeserializer.getUint8();
            const rigidbodyIndexA = indexReader.getRigidBodyIndex(dataDeserializer);
            const rigidbodyIndexB = indexReader.getRigidBodyIndex(dataDeserializer);
            const position = dataDeserializer.getFloat32Tuple(3);
            const rotation = dataDeserializer.getFloat32Tuple(3);
            const positionMin = dataDeserializer.getFloat32Tuple(3);
            const positionMax = dataDeserializer.getFloat32Tuple(3);
            const rotationMin = dataDeserializer.getFloat32Tuple(3);
            const rotationMax = dataDeserializer.getFloat32Tuple(3);
            const springPosition = dataDeserializer.getFloat32Tuple(3);
            const springRotation = dataDeserializer.getFloat32Tuple(3);

            const joint: PmxObject.Joint = {
                name,
                englishName,

                type,
                rigidbodyIndexA,
                rigidbodyIndexB,
                position,
                rotation,
                positionMin,
                positionMax,
                rotationMin,
                rotationMax,
                springPosition,
                springRotation
            };
            joints.push(joint);
        }

        return joints;
    }

    private static _ParseSoftBodies(
        dataDeserializer: MmdDataDeserializer,
        indexReader: IndexReader,
        header: PmxObject.Header
    ): PmxObject.SoftBody[] {
        const softBodiesCount = dataDeserializer.getInt32();

        const softBodies: PmxObject.SoftBody[] = [];
        for (let i = 0; i < softBodiesCount; ++i) {
            const name = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);
            const englishName = dataDeserializer.getDecoderString(dataDeserializer.getInt32(), false);

            const type: PmxObject.SoftBody.Type = dataDeserializer.getUint8();
            const materialIndex = indexReader.getMaterialIndex(dataDeserializer);
            const collisionGroup = dataDeserializer.getUint8();
            const collisionMask = dataDeserializer.getUint16();
            const flags = dataDeserializer.getUint8();

            const bLinkDistance = dataDeserializer.getInt32();
            const clusterCount = dataDeserializer.getInt32();
            const totalMass = dataDeserializer.getFloat32();
            const collisionMargin = dataDeserializer.getFloat32();
            const aeroModel: PmxObject.SoftBody.AeroDynamicModel = dataDeserializer.getInt32();

            const config: PmxObject.SoftBody.Config = {
                vcf: dataDeserializer.getFloat32(),
                dp: dataDeserializer.getFloat32(),
                dg: dataDeserializer.getFloat32(),
                lf: dataDeserializer.getFloat32(),
                pr: dataDeserializer.getFloat32(),
                vc: dataDeserializer.getFloat32(),
                df: dataDeserializer.getFloat32(),
                mt: dataDeserializer.getFloat32(),
                chr: dataDeserializer.getFloat32(),
                khr: dataDeserializer.getFloat32(),
                shr: dataDeserializer.getFloat32(),
                ahr: dataDeserializer.getFloat32()
            };

            const cluster: PmxObject.SoftBody.Cluster = {
                srhrCl: dataDeserializer.getFloat32(),
                skhrCl: dataDeserializer.getFloat32(),
                sshrCl: dataDeserializer.getFloat32(),
                srSpltCl: dataDeserializer.getFloat32(),
                skSpltCl: dataDeserializer.getFloat32(),
                ssSpltCl: dataDeserializer.getFloat32()
            };

            const iteration: PmxObject.SoftBody.Iteration = {
                vIt: dataDeserializer.getInt32(),
                pIt: dataDeserializer.getInt32(),
                dIt: dataDeserializer.getInt32(),
                cIt: dataDeserializer.getInt32()
            };

            const material: PmxObject.SoftBody.Material = {
                lst: dataDeserializer.getInt32(),
                ast: dataDeserializer.getInt32(),
                vst: dataDeserializer.getInt32()
            };

            const anchorsCount = dataDeserializer.getInt32();
            const anchors: PmxObject.SoftBody.AnchorRigidBody[] = [];
            for (let j = 0; j < anchorsCount; ++j) {
                const rigidbodyIndex = indexReader.getRigidBodyIndex(dataDeserializer);
                const vertexIndex = indexReader.getVertexIndex(dataDeserializer);
                const isNearMode = dataDeserializer.getUint8() !== 0;

                const anchorRigidBody: PmxObject.SoftBody.AnchorRigidBody = {
                    rigidbodyIndex,
                    vertexIndex,
                    isNearMode
                };
                anchors.push(anchorRigidBody);
            }

            const vertexPinCount = dataDeserializer.getInt32();

            const vertexPinArrayBuffer = new ArrayBuffer(vertexPinCount * header.vertexIndexSize);
            let vertexPins: Uint8Array | Uint16Array | Int32Array;
            switch (header.vertexIndexSize) {
            case 1:
                vertexPins = new Uint8Array(vertexPinArrayBuffer);
                break;
            case 2:
                vertexPins = new Uint16Array(vertexPinArrayBuffer);
                break;
            case 4:
                vertexPins = new Int32Array(vertexPinArrayBuffer);
                break;
            default:
                throw new Error(`Invalid vertexIndexSize: ${header.vertexIndexSize}`);
            }

            for (let i = 0; i < vertexPinCount; ++i) {
                vertexPins[i] = indexReader.getVertexIndex(dataDeserializer);
            }

            const softBody: PmxObject.SoftBody = {
                name,
                englishName,

                type,
                materialIndex,
                collisionGroup,
                collisionMask,
                flags,
                bLinkDistance,
                clusterCount,
                totalMass,
                collisionMargin,
                aeroModel,

                config,
                cluster,
                iteration,
                material,

                anchors,
                vertexPins
            };

            softBodies.push(softBody);
        }

        return softBodies;
    }
}
