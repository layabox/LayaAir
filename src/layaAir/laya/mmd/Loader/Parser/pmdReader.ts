import type { ILogger } from "./ILogger";
import { ConsoleLogger } from "./ILogger";
import { MmdDataDeserializer } from "./mmdDataDeserializer";
import { PmdObject } from "./pmdObject";
import { PmxObject } from "./pmxObject";

type Writeable<T> = { -readonly [P in keyof T]: Writeable<T[P]> };

type PartialMaterial = Omit<Writeable<PmxObject.Material>,
    "textureIndex" |
    "sphereTextureIndex"
    > & {
    textureIndex: string;
    sphereTextureIndex: string;
};

/**
 * PmdReader is a static class that parses PMD data
 */
export class PmdReader {
    private constructor() { /* block constructor */ }

    /**
     * Parses PMD data asynchronously
     * @param data Arraybuffer of PMD data
     * @param logger Logger
     * @returns PMD data as a PmxObject
     * @throws {Error} If the parse fails
     */
    public static async ParseAsync(data: ArrayBufferLike, logger: ILogger = new ConsoleLogger()): Promise<PmxObject> {
        const dataDeserializer = new MmdDataDeserializer(data);
        dataDeserializer.initializeTextDecoder("shift-jis");

        const header = this._ParseHeader(dataDeserializer);
        const vertices = await this._ParseVerticesAsync(dataDeserializer);
        const indices = this._ParseIndices(dataDeserializer);
        const partialMaterials = this._ParseMaterials(dataDeserializer);
        const bones = this._ParseBones(dataDeserializer);
        const iks = this._ParseIks(dataDeserializer);
        const morphs = this._ParseMorphs(dataDeserializer);
        const [displayFrames, boneFrameStartIndex] = this._ParseDisplayFrames(dataDeserializer, morphs);

        if (dataDeserializer.bytesAvailable === 0) {
            const textures: string[] = [];
            const materials = this._ConvertMaterials(partialMaterials, textures);

            const finalBones = this._ConvertBones(bones, iks, vertices, displayFrames);

            const pmxObject: PmxObject = {
                header,
                vertices,
                indices,
                textures,
                materials,
                bones: finalBones,
                morphs: morphs as PmxObject.Morph.VertexMorph[],
                displayFrames,
                rigidBodies: [],
                joints: [],
                softBodies: [],
                iks
            };

            return pmxObject;
        }

        const hasEnglishNames = dataDeserializer.getUint8() !== 0;
        if (hasEnglishNames) {
            this._ParseEnglishNames(dataDeserializer, header, bones, morphs, displayFrames, boneFrameStartIndex);
        }

        const textures = this._ParseToonTextures(dataDeserializer);
        const materials = this._ConvertMaterials(partialMaterials, textures);


        if (dataDeserializer.bytesAvailable === 0) {
            const finalBones = this._ConvertBones(bones, iks, vertices, displayFrames);

            const pmxObject: PmxObject = {
                header,
                vertices,
                indices,
                textures,
                materials,
                bones: finalBones,
                morphs: morphs as PmxObject.Morph.VertexMorph[],
                displayFrames,
                rigidBodies: [],
                joints: [],
                softBodies: [],
                iks
            };

            return pmxObject;
        }

        const rigidBodies = this._ParseRigidBodies(dataDeserializer);
        const finalBones = this._ConvertBones(bones, iks, vertices, displayFrames, rigidBodies);
        this._NormalizeRigidBodyPositions(rigidBodies, finalBones);

        const joints = this._ParseJoints(dataDeserializer);

        if (dataDeserializer.bytesAvailable > 0) {
            logger.warn(`There are ${dataDeserializer.bytesAvailable} bytes left after parsing`);
        }

        const pmxObject: PmxObject = {
            header,
            vertices,
            indices,
            textures,
            materials,
            bones: finalBones,
            morphs: morphs as PmxObject.Morph.VertexMorph[],
            displayFrames,
            rigidBodies: rigidBodies as PmxObject.RigidBody[],
            joints,
            softBodies: [],
            iks
        };

        return pmxObject;
    }

    private static _ParseHeader(dataDeserializer: MmdDataDeserializer): Writeable<PmxObject.Header> {
        if (dataDeserializer.bytesAvailable < (
            3 // signature
            + 4 // version (float32)
        )) {
            throw new Error("is not pmd file");
        }
        const signature = dataDeserializer.getSignatureString(3);
        if (signature !== "Pmd") {
            throw new Error("is not pmd file");
        }

        const version = dataDeserializer.getFloat32();

        const modelName = dataDeserializer.getDecoderString(20, true);
        const comment = dataDeserializer.getDecoderString(256, true);

        const header: Writeable<PmxObject.Header> = {
            signature,
            version,

            encoding: PmxObject.Header.Encoding.ShiftJis,
            additionalVec4Count: 0,

            vertexIndexSize: 2,
            textureIndexSize: 4, // PMD does not use texture indices
            materialIndexSize: 4, // PMD does not use material indices
            boneIndexSize: 2,
            morphIndexSize: 2, // PMD does not use morph indices
            rigidBodyIndexSize: 4,

            modelName,
            englishModelName: "", // initialized later
            comment,
            englishComment: "" // initialized later
        };
        return header;
    }

    private static async _ParseVerticesAsync(dataDeserializer: MmdDataDeserializer): Promise<Writeable<PmxObject.Vertex>[]> {
        const verticesCount = dataDeserializer.getUint32();

        const vertices: Writeable<PmxObject.Vertex>[] = [];

        let time = performance.now();
        for (let i = 0; i < verticesCount; ++i) {
            const position = dataDeserializer.getFloat32Tuple(3);
            const normal = dataDeserializer.getFloat32Tuple(3);
            const uv = dataDeserializer.getFloat32Tuple(2);
            const weightType = PmxObject.Vertex.BoneWeightType.Bdef2;
            const boneWeight: PmxObject.Vertex.BoneWeight<PmxObject.Vertex.BoneWeightType.Bdef2> = {
                boneIndices: [dataDeserializer.getUint16(), dataDeserializer.getUint16()],
                boneWeights: dataDeserializer.getUint8() / 100
            };
            const edgeFlag = dataDeserializer.getUint8() !== 0;

            vertices.push({
                position,
                normal,
                uv,
                additionalVec4: [],
                weightType,
                boneWeight,
                edgeScale: edgeFlag ? 1.0 : 0.0
            });

            if (i % 10000 === 0 && 100 < performance.now() - time) {
                await new Promise(resolve => setTimeout(resolve, 0));
                time = performance.now();
            }
        }

        return vertices;
    }

    private static _ParseIndices(dataDeserializer: MmdDataDeserializer): Uint16Array {
        const indicesCount = dataDeserializer.getUint32();
        const indices = new Uint16Array(indicesCount);
        dataDeserializer.getUint16Array(indices);
        return indices;
    }

    private static _ParseMaterials(dataDeserializer: MmdDataDeserializer): PartialMaterial[] {
        const materialsCount = dataDeserializer.getUint32();

        const materials: PartialMaterial[] = [];
        for (let i = 0; i < materialsCount; ++i) {
            const diffuse = dataDeserializer.getFloat32Tuple(4);
            const shininess = dataDeserializer.getFloat32(); // order is different from PMX
            const specular = dataDeserializer.getFloat32Tuple(3);
            const ambient = dataDeserializer.getFloat32Tuple(3);

            const toonTextureIndex = dataDeserializer.getInt8();
            const edgeFlag = dataDeserializer.getUint8();
            const indexCount = dataDeserializer.getUint32();
            const texturePath = dataDeserializer.getDecoderString(20, true);

            let flag: PmxObject.Material.Flag = 0 as PmxObject.Material.Flag;

            if (edgeFlag !== 0) {
                flag |= PmxObject.Material.Flag.EnabledToonEdge
                    | PmxObject.Material.Flag.EnabledGroundShadow;
            }

            if (diffuse[3] !== 0.98) {
                flag |= PmxObject.Material.Flag.EnabledDrawShadow
                    | PmxObject.Material.Flag.EnabledReceiveShadow;
            }

            if (diffuse[3] < 1.0) {
                flag |= PmxObject.Material.Flag.IsDoubleSided;
            }

            let sphereTextureMode: PmxObject.Material.SphereTextureMode = PmxObject.Material.SphereTextureMode.Off;
            let diffuseTexturePath = "";
            let sphereTexturePath = "";
            {
                const paths = texturePath.split("*");
                for (let i = 0; i < paths.length; ++i) {
                    const path = paths[i];

                    let mode = PmxObject.Material.SphereTextureMode.Off;
                    if (path !== "") {
                        const extensionIndex = path.lastIndexOf(".");
                        const extension = extensionIndex !== -1 ? path.substring(extensionIndex).toLowerCase() : "";
                        if (extension === ".sph") {
                            mode = PmxObject.Material.SphereTextureMode.Multiply;
                        } else if (extension === ".spa") {
                            mode = PmxObject.Material.SphereTextureMode.Add;
                        }
                    }

                    if (mode !== PmxObject.Material.SphereTextureMode.Off) {
                        sphereTextureMode = mode;
                        sphereTexturePath = path;
                    } else {
                        diffuseTexturePath = path;
                    }
                }
            }

            const material: PartialMaterial = {
                name: texturePath,
                englishName: "",

                diffuse,
                specular,
                shininess,
                ambient,

                flag,

                edgeColor: [0, 0, 0, 1],
                edgeSize: 1.0,

                textureIndex: diffuseTexturePath, // mapped later
                sphereTextureIndex: sphereTexturePath, // mapped later
                sphereTextureMode,

                isSharedToonTexture: false,
                toonTextureIndex,

                comment: "",
                indexCount
            };
            materials.push(material);
        }

        return materials;
    }

    private static _ParseBones(dataDeserializer: MmdDataDeserializer): PmdObject.Bone[] {
        const bonesCount = dataDeserializer.getUint16();

        const bones: PmdObject.Bone[] = [];
        for (let i = 0; i < bonesCount; ++i) {
            const name = dataDeserializer.getDecoderString(20, true);

            const parentBoneIndex = dataDeserializer.getInt16();
            const tailIndex = dataDeserializer.getInt16();
            const type = dataDeserializer.getUint8();
            const ikIndex = dataDeserializer.getInt16();
            const position = dataDeserializer.getFloat32Tuple(3);


            const bone: PmdObject.Bone = {
                name,
                englishName: "",
                parentBoneIndex,
                tailIndex,
                type,
                ikIndex,
                position
            };
            bones.push(bone);
        }

        return bones;
    }

    private static _ParseIks(dataDeserializer: MmdDataDeserializer): PmdObject.Ik[] {
        const iksCount = dataDeserializer.getUint16();

        const iks: PmdObject.Ik[] = [];
        for (let i = 0; i < iksCount; ++i) {
            const boneIndex = dataDeserializer.getUint16();
            const targetIndex = dataDeserializer.getUint16();
            const ikLinkCount = dataDeserializer.getUint8();
            const iteration = dataDeserializer.getUint16();
            const rotationConstraint = dataDeserializer.getFloat32();

            const links: number[] = [];
            for (let j = 0; j < ikLinkCount; ++j) {
                links.push(dataDeserializer.getUint16());
            }

            const ik: PmdObject.Ik = {
                boneIndex,
                targetIndex,
                iteration,
                rotationConstraint,
                links
            };
            iks.push(ik);
        }

        return iks;
    }

    private static _ParseMorphs(dataDeserializer: MmdDataDeserializer): Writeable<PmxObject.Morph.VertexMorph>[] {
        const morphsCount = dataDeserializer.getUint16();

        if (morphsCount === 0) return [];

        const morphs: PmxObject.Morph.VertexMorph[] = [];
        for (let i = 0; i < morphsCount; ++i) {
            const name = dataDeserializer.getDecoderString(20, true);
            const morphOffsetCount = dataDeserializer.getUint32();
            const category: PmxObject.Morph.Category = dataDeserializer.getUint8();

            let morph: Partial<PmxObject.Morph.VertexMorph> = {
                name,
                englishName: "",
                category,
                type: PmxObject.Morph.Type.VertexMorph
            };


            const indices = new Int32Array(morphOffsetCount);
            const positions = new Float32Array(morphOffsetCount * 3);

            for (let i = 0; i < morphOffsetCount; ++i) {
                indices[i] = dataDeserializer.getUint32();

                positions[i * 3 + 0] = dataDeserializer.getFloat32();
                positions[i * 3 + 1] = dataDeserializer.getFloat32();
                positions[i * 3 + 2] = dataDeserializer.getFloat32();
            }

            morph = <PmxObject.Morph.VertexMorph>{
                ...morph,
                indices,
                positions
            };

            morphs.push(morph as PmxObject.Morph.VertexMorph);
        }

        const baseSkinIndices = morphs.shift()!.indices;
        for (let i = 0; i < morphs.length; ++i) {
            const morph = morphs[i];
            const indices = morph.indices;

            for (let j = 0; j < indices.length; ++j) {
                const indexKey = indices[j];
                if (0 <= indexKey && indexKey < baseSkinIndices.length) {
                    indices[j] = baseSkinIndices[indexKey];
                } else {
                    indices[j] = 0;
                }
            }
        }

        return morphs;
    }

    private static _ParseDisplayFrames(
        dataDeserializer: MmdDataDeserializer,
        morphs: Writeable<PmxObject.Morph.VertexMorph>[]
    ): [Writeable<PmxObject.DisplayFrame>[], number] {
        const displayFrames: Writeable<PmxObject.DisplayFrame>[] = [];

        const morphDisplayFramesCount = dataDeserializer.getUint8();
        for (let i = 0; i < morphDisplayFramesCount; ++i) {

            const frame: PmxObject.DisplayFrame.FrameData = {
                type: PmxObject.DisplayFrame.FrameData.FrameType.Morph,
                index: dataDeserializer.getUint16()
            };

            const displayFrame: Writeable<PmxObject.DisplayFrame> = {
                name: morphs[frame.index]?.name ?? "",
                englishName: "",
                isSpecialFrame: true,
                frames: [frame]
            };
            displayFrames.push(displayFrame);
        }

        const boneFrameStartIndex = displayFrames.length;

        const boneDisplayFramesCount = dataDeserializer.getUint8();
        for (let i = 0; i < boneDisplayFramesCount; ++i) {
            const boneDisplayFrame: Writeable<PmxObject.DisplayFrame> = {
                name: dataDeserializer.getDecoderString(50, true),
                englishName: "",
                isSpecialFrame: false,
                frames: undefined!
            };
            displayFrames.push(boneDisplayFrame);
        }

        const frameBoneIndicesCount = dataDeserializer.getUint32();
        for (let i = 0; i < frameBoneIndicesCount; ++i) {
            const boneIndex = dataDeserializer.getUint16();
            const frameIndex = dataDeserializer.getUint8();

            const displayFrame = displayFrames[boneFrameStartIndex + frameIndex - 1];
            if (displayFrame !== undefined) {
                const frame: PmxObject.DisplayFrame.FrameData = {
                    type: PmxObject.DisplayFrame.FrameData.FrameType.Bone,
                    index: boneIndex
                };

                if (displayFrame.frames === undefined) {
                    displayFrame.frames = [frame];
                } else {
                    displayFrame.frames.push(frame);
                }
            }
        }

        for (let i = boneFrameStartIndex; i < displayFrames.length; ++i) {
            const displayFrame = displayFrames[i];
            if (displayFrame.frames === undefined) {
                displayFrame.frames = [];
            }
        }

        return [displayFrames, boneFrameStartIndex];
    }

    private static _ParseEnglishNames(
        dataDeserializer: MmdDataDeserializer,
        header: Writeable<PmxObject.Header>,
        bones: PmdObject.Bone[],
        morphs: Writeable<PmxObject.Morph.VertexMorph>[],
        displayFrames: Writeable<PmxObject.DisplayFrame>[],
        boneFrameStartIndex: number
    ): void {
        header.englishModelName = dataDeserializer.getDecoderString(20, true);
        header.englishComment = dataDeserializer.getDecoderString(256, true);

        for (let i = 0; i < bones.length; ++i) {
            bones[i].englishName = dataDeserializer.getDecoderString(20, true);
        }

        for (let i = 0; i < morphs.length; ++i) {
            morphs[i].englishName = dataDeserializer.getDecoderString(20, true);
        }

        for (let i = boneFrameStartIndex; i < displayFrames.length; ++i) {
            displayFrames[i].englishName = dataDeserializer.getDecoderString(50, true);
        }
    }

    private static _ParseToonTextures(dataDeserializer: MmdDataDeserializer): string[] {
        const textures: string[] = [];
        for (let i = 0; i < 10; ++i) {
            textures.push(dataDeserializer.getDecoderString(100, true));
        }
        return textures;
    }

    private static _PathNormalize(path: string): string {
        path = path.replace(/\\/g, "/");
        const pathArray = path.split("/");
        const resultArray = [];
        for (let i = 0; i < pathArray.length; ++i) {
            const pathElement = pathArray[i];
            if (pathElement === ".") {
                continue;
            } else if (pathElement === "..") {
                resultArray.pop();
            } else {
                resultArray.push(pathElement);
            }
        }
        return resultArray.join("/").toLowerCase();
    }

    private static _ConvertMaterials(materials: PartialMaterial[], textures: string[]): PmxObject.Material[] {
        const normalizedTextures = new Array<string>(textures.length);
        for (let i = 0; i < textures.length; ++i) {
            normalizedTextures[i] = this._PathNormalize(textures[i]);
        }

        for (let i = 0; i < materials.length; ++i) {
            const material = materials[i];

            if (0 <= material.toonTextureIndex && material.toonTextureIndex < textures.length) {
                const normalizedToonTexturePath = normalizedTextures[material.toonTextureIndex];
                if (/toon(10|0[0-9])\.bmp/.test(normalizedToonTexturePath)) { // is default toon texture
                    material.isSharedToonTexture = true;
                    let toonTextureIndex = normalizedToonTexturePath.substring(normalizedToonTexturePath.length - 6, normalizedToonTexturePath.length - 4);
                    if (toonTextureIndex[0] === "n") {
                        toonTextureIndex = toonTextureIndex[1];
                    }
                    material.toonTextureIndex = parseInt(toonTextureIndex, 10) - 1; // remap 0..10 to -1..9
                }
            }
        }

        const textureIndexMap = new Map<string, number>();
        for (let i = 0; i < textures.length; ++i) {
            textureIndexMap.set(this._PathNormalize(textures[i]), i);
        }

        for (let i = 0; i < materials.length; ++i) {
            const material = materials[i];

            if (material.textureIndex !== "") {
                const normalizedDiffuseTexturePath = this._PathNormalize(material.textureIndex);
                let diffuseTextureIndex = textureIndexMap.get(normalizedDiffuseTexturePath);
                if (diffuseTextureIndex === undefined) {
                    diffuseTextureIndex = textureIndexMap.size;
                    textureIndexMap.set(normalizedDiffuseTexturePath, diffuseTextureIndex);
                    textures.push(material.textureIndex);
                }
                (material.textureIndex as unknown as number) = diffuseTextureIndex;
            } else {
                (material.textureIndex as unknown as number) = -1;
            }

            if (material.sphereTextureIndex !== "") {
                const normalizedSphereTexturePath = this._PathNormalize(material.sphereTextureIndex);
                let sphereTextureIndex = textureIndexMap.get(normalizedSphereTexturePath);
                if (sphereTextureIndex === undefined) {
                    sphereTextureIndex = textureIndexMap.size;
                    textureIndexMap.set(normalizedSphereTexturePath, sphereTextureIndex);
                    textures.push(material.sphereTextureIndex);
                }
                (material.sphereTextureIndex as unknown as number) = sphereTextureIndex;
            } else {
                (material.sphereTextureIndex as unknown as number) = -1;
            }
        }

        return materials as unknown as PmxObject.Material[];
    }

    /**
     * from pmx editor IK制限角.txt
     * format: minX, maxX, minY, maxY, minZ, maxZ
     *
     * 左ひざ,-180.0,-0.5,0.0,0.0,0.0,0.0
     * 右ひざ,-180.0,-0.5,0.0,0.0,0.0,0.0
     */
    private static readonly _IkAngleLimitTable: Map<string, [number, number, number, number, number, number]> = new Map(
        Object.entries({
            "左ひざ": [-180.0, -0.5, 0.0, 0.0, 0.0, 0.0],
            "右ひざ": [-180.0, -0.5, 0.0, 0.0, 0.0, 0.0]
        })
    );

    private static _ConvertBones(
        bones: PmdObject.Bone[],
        iks: PmdObject.Ik[],
        vertices: Writeable<PmxObject.Vertex>[],
        displayFrames: Writeable<PmxObject.DisplayFrame>[],
        rigidBodies?: Writeable<PmxObject.RigidBody>[]
    ): PmxObject.Bone[] {
        const ikMap = new Map<number, number>();
        for (let i = 0; i < iks.length; ++i) {
            const ikBoneIndex = iks[i].boneIndex;
            if (0 <= ikBoneIndex && ikBoneIndex < bones.length && !ikMap.has(ikBoneIndex)) {
                ikMap.set(ikBoneIndex, i);
            }
        }

        const finalBones: Writeable<PmxObject.Bone>[] = [];
        for (let i = 0; i < bones.length; ++i) {
            const bone = bones[i];

            const pmxBone: Writeable<PmxObject.Bone> = {
                name: bone.name,
                englishName: bone.englishName,
                position: bone.position,
                parentBoneIndex: bone.parentBoneIndex,
                transformOrder: 0,
                flag: PmxObject.Bone.Flag.UseBoneIndexAsTailPosition,
                tailPosition: bone.tailIndex <= 0 ? -1 : bone.tailIndex,

                appendTransform: undefined,
                axisLimit: undefined,
                localVector: undefined,

                externalParentTransform: undefined,
                ik: undefined
            };

            let isIkBone = ikMap.has(i);

            pmxBone.flag |= PmxObject.Bone.Flag.IsRotatable
                | PmxObject.Bone.Flag.IsVisible
                | PmxObject.Bone.Flag.IsControllable;

            pmxBone.flag &= ~PmxObject.Bone.Flag.IsMovable
                & ~PmxObject.Bone.Flag.IsIkEnabled
                & ~PmxObject.Bone.Flag.HasAppendRotate
                & ~PmxObject.Bone.Flag.HasAxisLimit;

            switch (bone.type) {
            case PmdObject.Bone.Type.RotateMove:
                pmxBone.flag |= PmxObject.Bone.Flag.IsMovable;
                break;

            case PmdObject.Bone.Type.Ik:
                isIkBone = true;
                break;

            case PmdObject.Bone.Type.RotateEffect:
                pmxBone.flag |= PmxObject.Bone.Flag.HasAppendRotate;
                pmxBone.flag &= ~PmxObject.Bone.Flag.UseBoneIndexAsTailPosition
                    & ~PmxObject.Bone.Flag.IsVisible;

                pmxBone.appendTransform = {
                    parentIndex: bone.tailIndex,
                    ratio: bone.ikIndex * 0.01
                };
                break;
            }

            if (isIkBone) {
                pmxBone.flag |= PmxObject.Bone.Flag.IsMovable
                    | PmxObject.Bone.Flag.IsIkEnabled;

                pmxBone.transformOrder = 1;
            }

            finalBones.push(pmxBone);
        }

        // normalize twist bones
        let boneCount = Math.min(finalBones.length, bones.length);
        for (let i = 0; i < boneCount; ++i) {
            const bone = bones[i];
            const pmxBone = finalBones[i];
            if (bone.type === PmdObject.Bone.Type.Twist) {
                let tailBone = bones[bone.tailIndex];
                if (tailBone === undefined) {
                    tailBone = bones[0];
                }

                const tailBonePosition = tailBone.position;
                const bonePosition = bone.position;
                pmxBone.axisLimit = [
                    tailBonePosition[0] - bonePosition[0],
                    tailBonePosition[1] - bonePosition[1],
                    tailBonePosition[2] - bonePosition[2]
                ];

                // normalize
                const axisLimit = pmxBone.axisLimit;
                const length = Math.sqrt(axisLimit[0] * axisLimit[0] + axisLimit[1] * axisLimit[1] + axisLimit[2] * axisLimit[2]);
                axisLimit[0] /= length;
                axisLimit[1] /= length;
                axisLimit[2] /= length;

                pmxBone.flag &= ~PmxObject.Bone.Flag.UseBoneIndexAsTailPosition;
            }
        }

        // normalize ik bones
        const ikChainBones: Writeable<PmxObject.Bone>[] = [];
        for (let boneIndex = 0; boneIndex < boneCount; ++boneIndex) {
            const pmxBone = finalBones[boneIndex];
            if ((pmxBone.flag & PmxObject.Bone.Flag.IsIkEnabled) === 0) continue;

            let ikCount = 0;
            for (let ikIndex = 0; ikIndex < iks.length; ++ikIndex) {
                const ik = iks[ikIndex];
                if (ik.boneIndex !== boneIndex) continue;

                let pmxChainBone: Writeable<PmxObject.Bone> | undefined;
                if (ikCount === 0) {
                    pmxChainBone = pmxBone;
                    ikCount += 1;
                } else {
                    pmxChainBone = {
                        name: pmxBone.name + "+",
                        englishName: pmxBone.englishName,

                        position: [...pmxBone.position],
                        parentBoneIndex: boneIndex,
                        transformOrder: pmxBone.transformOrder,
                        flag: pmxBone.flag
                            & ~PmxObject.Bone.Flag.IsVisible
                            & ~PmxObject.Bone.Flag.UseBoneIndexAsTailPosition,
                        tailPosition: [0, 0, 0],
                        appendTransform: pmxBone.appendTransform !== undefined ? { ...pmxBone.appendTransform } : undefined,
                        axisLimit: pmxBone.axisLimit !== undefined ? [...pmxBone.axisLimit] : undefined,
                        localVector: pmxBone.localVector !== undefined
                            ? {
                                x: [...pmxBone.localVector.x],
                                z: [...pmxBone.localVector.z]
                            }
                            : undefined,
                        externalParentTransform: pmxBone.externalParentTransform,
                        ik: undefined
                    };
                    ikChainBones.push(pmxChainBone);
                    ikCount += 1;
                }

                if (pmxChainBone.ik === undefined) {
                    pmxChainBone.ik = {
                        target: 0,
                        iteration: 0,
                        rotationConstraint: 0,
                        links: []
                    };
                }
                {
                    const pmxChainBoneIk = pmxChainBone.ik;
                    pmxChainBoneIk.target = ik.targetIndex;
                    pmxChainBoneIk.iteration = ik.iteration;
                    pmxChainBoneIk.rotationConstraint = ik.rotationConstraint * 4.0;

                    const ikLinks = ik.links;
                    for (let ikLinkIndex = 0; ikLinkIndex < ikLinks.length; ++ikLinkIndex) {
                        const ikLink = ikLinks[ikLinkIndex];
                        if (0 <= ikLink && ikLink < finalBones.length) {
                            const pmxIkLink: Writeable<PmxObject.Bone.IKLink> = {
                                target: ikLink,
                                limitation: undefined
                            };

                            if (0 <= ikLink && ikLink < bones.length) {
                                const chainName = bones[ikLink].name;
                                const limitation = this._IkAngleLimitTable.get(chainName);
                                if (limitation !== undefined) {
                                    pmxIkLink.limitation = {
                                        minimumAngle: [limitation[0], limitation[2], limitation[4]],
                                        maximumAngle: [limitation[1], limitation[3], limitation[5]]
                                    };
                                }
                            }

                            pmxChainBoneIk.links.push(pmxIkLink);
                        }
                    }
                }
            }
        }
        finalBones.push(...ikChainBones);

        // normalize ik order
        boneCount = Math.min(finalBones.length, bones.length);
        const ikIndexMap: [number, number][] = []; // [pmxBoneIndex, pmdIkIndex]
        for (let i = 0; i < boneCount; ++i) {
            const pmxBone = finalBones[i];
            if ((pmxBone.flag & PmxObject.Bone.Flag.IsIkEnabled) === 0) continue;

            for (let j = 0; j < iks.length; ++j) {
                const ik = iks[j];
                if (ik.boneIndex === i) {
                    ikIndexMap.push([i, j]);
                    break;
                }
            }
        }
        let isPmdAssendingOrder = true;
        for (let i = 0; i < ikIndexMap.length - 1; ++i) {
            if (ikIndexMap[i][1] > ikIndexMap[i + 1][1]) {
                isPmdAssendingOrder = false;
                break;
            }
        }
        if (!isPmdAssendingOrder) {
            ikIndexMap.sort((a, b) => a[1] - b[1]); // sort by pmd ik index

            const invalidOrderPmxBoneMap: (Writeable<PmxObject.Bone> | undefined)[] = new Array(ikIndexMap.length);
            for (let i = 1; i < ikIndexMap.length; ++i) {
                let isValid = true;
                if (ikIndexMap[i - 1][0] > ikIndexMap[i][0]) {
                    isValid = false;
                } else if (invalidOrderPmxBoneMap[i - 1] !== undefined) {
                    isValid = false;
                }

                if (!isValid) {
                    invalidOrderPmxBoneMap[i] = finalBones[ikIndexMap[i - 1][0]];
                }
            }

            const pmxBoneToInvalidMap = new Map<Writeable<PmxObject.Bone>, number>();
            for (let i = 0; i < invalidOrderPmxBoneMap.length; ++i) {
                const pmxBone = invalidOrderPmxBoneMap[i];
                if (pmxBone !== undefined && !pmxBoneToInvalidMap.has(pmxBone)) {
                    pmxBoneToInvalidMap.set(pmxBone, i);
                }
            }

            const pmdSortedPmxBones: (Writeable<PmxObject.Bone> | undefined)[] = new Array(ikIndexMap.length);
            for (let i = 0; i < ikIndexMap.length; ++i) {
                pmdSortedPmxBones[i] = finalBones[ikIndexMap[i][0]];
            }

            const oldFinalBones = finalBones.slice();
            // update bone indices
            for (let i = 0; 0 < pmxBoneToInvalidMap.size; ++i) {
                for (let j = 1; j < ikIndexMap.length; ++j) {
                    if (invalidOrderPmxBoneMap[j] !== undefined &&
                        pmdSortedPmxBones[j] !== undefined &&
                        !pmxBoneToInvalidMap.has(pmdSortedPmxBones[j]!)
                    ) {
                        const pmxBone = pmdSortedPmxBones[j]!;
                        const removeIndex = finalBones.indexOf(pmxBone);
                        finalBones.splice(removeIndex, 1);
                        const insertIndex = finalBones.indexOf(invalidOrderPmxBoneMap[j]!) + 1;
                        finalBones.splice(insertIndex, 0, pmxBone);
                        pmxBoneToInvalidMap.delete(pmxBone);
                    }
                }
                if (ikIndexMap.length < i) break;
            }
            // fix bone indices
            const boneToIndexTable = new Map<Writeable<PmxObject.Bone>, number>();
            for (let i = 0; i < finalBones.length; ++i) {
                const pmxBone = finalBones[i];
                boneToIndexTable.set(pmxBone, i);
            }
            for (let i = 0; i < vertices.length; ++i) {
                const vertex = vertices[i];
                const boneWeight = vertex.boneWeight;
                if (typeof boneWeight.boneIndices === "number") {
                    boneWeight.boneIndices = boneToIndexTable.get(oldFinalBones[boneWeight.boneIndices])!;
                } else {
                    const boneIndices = boneWeight.boneIndices;
                    for (let j = 0; j < boneIndices.length; ++j) {
                        boneIndices[j] = boneToIndexTable.get(oldFinalBones[boneIndices[j]])!;
                    }
                }
            }
            for (let i = 0; i < finalBones.length; ++i) {
                const pmxBone = finalBones[i];
                pmxBone.parentBoneIndex = boneToIndexTable.get(oldFinalBones[pmxBone.parentBoneIndex])!;
                if (typeof pmxBone.tailPosition === "number") {
                    pmxBone.tailPosition = boneToIndexTable.get(oldFinalBones[pmxBone.tailPosition])!;
                }
                if (pmxBone.appendTransform) {
                    pmxBone.appendTransform.parentIndex = boneToIndexTable.get(oldFinalBones[pmxBone.appendTransform.parentIndex])!;
                }
                if (pmxBone.ik) {
                    pmxBone.ik.target = boneToIndexTable.get(oldFinalBones[pmxBone.ik.target])!;
                    const ikLinks = pmxBone.ik.links;
                    for (let j = 0; j < ikLinks.length; ++j) {
                        ikLinks[j].target = boneToIndexTable.get(oldFinalBones[ikLinks[j].target])!;
                    }
                }
            }
            for (let i = 0; i < displayFrames.length; ++i) {
                const displayFrame = displayFrames[i];
                const frames = displayFrame.frames;
                if (frames === undefined) continue;

                for (let j = 0; j < frames.length; ++j) {
                    const frame = frames[j];
                    if (frame.type === PmxObject.DisplayFrame.FrameData.FrameType.Bone) {
                        frame.index = boneToIndexTable.get(oldFinalBones[frame.index])!;
                    }
                }
            }
            if (rigidBodies !== undefined) {
                for (let i = 0; i < rigidBodies.length; ++i) {
                    const rigidBody = rigidBodies[i];
                    rigidBody.boneIndex = boneToIndexTable.get(oldFinalBones[rigidBody.boneIndex])!;
                }
            }
        }

        // normalize bone transform order
        let hasLoop = false;
        for (let i = 0; i < finalBones.length; ++i) {
            let pmxBone = finalBones[i];
            for (let j = 0; j < finalBones.length; ++j) {
                const parentBoneIndex = finalBones[j].parentBoneIndex;
                if (parentBoneIndex === i) { // has loop
                    hasLoop = true;
                    break;
                }

                pmxBone = finalBones[parentBoneIndex];
                if (pmxBone === undefined) break; // handle out of range parent bone index
            }

            if (hasLoop) break;
        }
        if (hasLoop) {
            for (let i = 0; i < finalBones.length; ++i) {
                let orderUpdated = false;
                for (let j = 0; j < finalBones.length; ++j) {
                    const pmxBone = finalBones[j];
                    let ancestorPmxBone = pmxBone;
                    let transformOrder = pmxBone.transformOrder;
                    for (; ;) {
                        const parentPmxBone = finalBones[ancestorPmxBone.parentBoneIndex];
                        if (parentPmxBone === undefined) break;
                        if (transformOrder < parentPmxBone.transformOrder) {
                            transformOrder = parentPmxBone.transformOrder;
                            orderUpdated = true;
                        }
                        ancestorPmxBone = parentPmxBone;
                    }
                    pmxBone.transformOrder = transformOrder;
                }
                if (!orderUpdated) break;
            }
        }

        // fix tail position types
        for (let i = 0; i < finalBones.length; ++i) {
            const pmxBone = finalBones[i];
            if ((pmxBone.flag & PmxObject.Bone.Flag.UseBoneIndexAsTailPosition) !== 0) {
                if (!(typeof pmxBone.tailPosition === "number")) {
                    pmxBone.tailPosition = -1;
                }
            } else {
                if (typeof pmxBone.tailPosition === "number") {
                    pmxBone.tailPosition = [0, 0, 0];
                }
            }
        }

        return finalBones as PmxObject.Bone[];
    }

    private static _ParseRigidBodies(dataDeserializer: MmdDataDeserializer): Writeable<PmxObject.RigidBody>[] {
        const rigidBodiesCount = dataDeserializer.getUint32();

        const rigidBodies: PmxObject.RigidBody[] = [];
        for (let i = 0; i < rigidBodiesCount; ++i) {
            const name = dataDeserializer.getDecoderString(20, true);

            const boneIndex = dataDeserializer.getInt16();

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
                englishName: "",
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

    private static _NormalizeRigidBodyPositions(rigidBodies: Writeable<PmxObject.RigidBody>[], bones: PmxObject.Bone[]): void {
        for (let i = 0; i < rigidBodies.length; ++i) {
            const rigidBody = rigidBodies[i];
            const bone = bones[rigidBody.boneIndex < 0 ? 0 : rigidBody.boneIndex];

            const bonePosition = bone.position;
            const rigidBodyPosition = rigidBody.shapePosition;
            rigidBodyPosition[0] += bonePosition[0];
            rigidBodyPosition[1] += bonePosition[1];
            rigidBodyPosition[2] += bonePosition[2];
        }
    }

    private static _ParseJoints(dataDeserializer: MmdDataDeserializer): PmxObject.Joint[] {
        const jointsCount = dataDeserializer.getUint32();

        const joints: PmxObject.Joint[] = [];
        for (let i = 0; i < jointsCount; ++i) {
            const name = dataDeserializer.getDecoderString(20, true);

            const rigidbodyIndexA = dataDeserializer.getInt32();
            const rigidbodyIndexB = dataDeserializer.getInt32();
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
                englishName: "",

                type: PmxObject.Joint.Type.Spring6dof,
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
}
