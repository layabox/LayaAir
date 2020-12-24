import { Sprite3D } from "../d3/core/Sprite3D";



/**@internal */
export interface URLItem {
    url: string,
    type?: string
}

/**@internal */
export interface GLTF {
    /** Names of glTF extensions used somewhere in this asset. */
    extensionsUsed?: string[];
    /** Names of glTF extensions required to properly load this asset. */
    extensionsRequired?: string[];
    /** An array of accessors. */
    accessors?: GLTFAccessor[];
    /** An array of keyframe animations. */
    animations?: GLTFAnimation[];
    /** Metadata about the glTF asset. */
    asset: GLTFAsset;
    /** An array of buffers. */
    buffers?: GLTFBuffer[];
    /** An array of bufferViews. */
    bufferViews?: GLTFBufferView[];
    /** An array of cameras. */
    cameras?: any[];
    /** An array of images. */
    images?: GLTFImage[];
    /** An array of materials. */
    materials?: GLTFMaterial[];
    /** An array of meshes. */
    meshes?: GLTFMesh[];
    /** An array of nodes. */
    nodes?: GLTFNode[];
    /** An array of samplers. */
    samplers?: GLTFSampler[];
    /** The index of the default scene. */
    scene?: number;
    /** An array of scenes. */
    scenes?: GLTFScene[];
    /** An array of skins. */
    skins?: GLTFSkin[];
    /** An array of textures. */
    textures?: any[];
    /** Dictionary object with extension-specific objects. */
    extensions?: any;
    /** Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFNode {
    /** The index of the camera referenced by this node. */
    camera?: number;
    /** The indices of this node's children. */
    children?: number[];
    /** The index of the skin referenced by this node. */
    skin?: number;
    /** A floating-point 4x4 transformation matrix stored in column-major order. */
    matrix?: number[];
    /** The index of the mesh in this node. */
    mesh?: number;
    /** The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar. */
    rotation?: number[];
    /** The node's non-uniform scale, given as the scaling factors along the x, y, and z axes. */
    scale?: number[];
    /** The node's translation along the x, y, and z axes. */
    translation?: number[];
    /** The weights of the instantiated Morph Target. Number of elements must match number of Morph Targets of used mesh. */
    weights?: number[];
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: any;
    /** Application-specific data. */
    extras?: any;

    //--------------------
    /**
     * 表示场景层次深度
     */
    hierarchyDepth?: number;
}
/**@internal */
export interface GLTFAsset {
    /** A copyright message suitable for display to credit the content creator. */
    copyright?: string;
    /** Tool that generated this glTF model. Useful for debugging. */
    generator?: string;
    /** The glTF version that this asset targets. */
    version: string;
    /** The minimum glTF version that this asset targets. */
    minVersion?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: Object;
    /** Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFBuffer {
    /** The uri of the buffer. */
    uri?: string;
    /** The total byte length of the buffer view. */
    byteLength: number;
    /** The user-defined name of this object. */
    name?: string;
    /**	Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFScene {
    /** The indices of each root node. */
    nodes?: number[];
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: any;
    /** Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFMesh {
    /** An array of primitives, each defining geometry to be rendered with a material.	 */
    primitives: GLTFPrimitive[];
    /** Array of weights to be applied to the Morph Targets. */
    weights?: number[];
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFPrimitive {
    /** A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data. */
    attributes: GLTFAttributes;
    /** The index of the accessor that contains the indices. */
    indices?: number;
    /** The index of the material to apply to this primitive when rendering. */
    material?: number;
    /** The type of primitives to render. */
    mode?: GLTFRenderMode;
    /** An array of Morph Targets, each Morph Target is a dictionary mapping attributes (only POSITION, NORMAL, and TANGENT supported) to their deviations in the Morph Target. */
    targets?: GLTFMorphTarget[];
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFMorphTarget {
    POSITION?: number;
    NORMAL?: number;
    TANGENT?: number;
}
/**@internal */
export interface GLTFAccessor {
    /** The index of the bufferView. */
    bufferView?: number;
    /** The offset relative to the start of the bufferView in bytes. */
    byteOffset?: number;
    /** The datatype of components in the attribute. */
    componentType: GLTFComponentType;
    /** Specifies whether integer data values should be normalized. */
    normalized?: boolean;
    /** The number of attributes referenced by this accessor. */
    count: number;
    /** Specifies if the attribute is a scalar, vector, or matrix. */
    type: GLTFAccessorType;
    /** Maximum value of each component in this attribute. */
    max?: number[];
    /** Minimum value of each component in this attribute. */
    min?: number[];
    /** Sparse storage of attributes that deviate from their initialization value. */
    sparse?: object;
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFBufferView {
    /** The index of the buffer. */
    buffer: number;
    /** The offset into the buffer in bytes. */
    byteOffset?: number;
    /** The length of the bufferView in bytes. */
    byteLength: number;
    /** The stride, in bytes. */
    byteStride?: number;
    /** The target that the GPU buffer should be bound to. */
    target?: number;
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFMaterial {
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
    /** A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. When not specified, all the default values of pbrMetallicRoughness apply. */
    pbrMetallicRoughness?: GLTFPbrMetallicRoughness;
    /** The normal map texture. */
    normalTexture?: GLTFTextureInfo;
    /** The occlusion map texture. */
    occlusionTexture?: GLTFTextureInfo;
    /** The emissive map texture. */
    emissiveTexture?: GLTFTextureInfo;
    /** The emissive color of the material. number[3]*/
    emissiveFactor?: number[];
    /** The alpha rendering mode of the material. */
    alphaMode?: string;
    /** The alpha cutoff value of the material. */
    alphaCutoff?: number;
    /** Specifies whether the material is double sided. */
    doubleSided?: boolean;
}
/**@internal */
export interface GLTFPbrMetallicRoughness {
    /** The material's base color factor. number[4]*/
    baseColorFactor?: number[];
    /** The base color texture. */
    baseColorTexture?: GLTFTextureInfo;
    /** The metalness of the material.  default: 1*/
    metallicFactor?: number;
    /** The roughness of the material. default: 1*/
    roughnessFactor?: number;
    /** The metallic-roughness texture. */
    metallicRoughnessTexture?: GLTFTextureInfo;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFImage {
    /** The uri of the image. */
    uri?: string;
    /** The image's MIME type. */
    mimeType?: string;
    /** The index of the bufferView that contains the image. Use this instead of the image's uri property. */
    bufferView?: number;
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFTexture {
    /** The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering should be used. */
    sampler?: number;
    /** The index of the image used by this texture. When undefined, it is expected that an extension or other mechanism will supply an alternate texture source, otherwise behavior is undefined. */
    source?: number;
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFTextureInfo {
    /** The index of the texture. */
    index: number;
    /** The set index of texture's TEXCOORD attribute used for texture coordinate mapping.	default: 0 */
    texCoord?: number;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;

    /**
     * normalTextureInfo
     * The scalar multiplier applied to each normal vector of the normal texture.
     */
    scale?: number;

    /**
     * occlusionTextureInfo
     * A scalar multiplier controlling the amount of occlusion applied.
     */
    strength?: number;

}
/**@internal */
export interface GLTFSampler {
    /** Magnification filter. */
    magFilter?: number;
    /** Minification filter. */
    minFilter?: number;
    /** s wrapping mode. */
    wrapS?: number;
    /** t wrapping mode. */
    wrapT?: number;
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFSkin {
    /** The index of the accessor containing the floating-point 4x4 inverse-bind matrices. The default is that each matrix is a 4x4 identity matrix, which implies that inverse-bind matrices were pre-applied. */
    inverseBindMatrices?: number;
    /** The index of the node used as a skeleton root. */
    skeleton?: number;
    /** Indices of skeleton nodes, used as joints in this skin. */
    joints: number[];
    /** The user-defined name of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFAnimation {
    /** An array of channels, each of which targets an animation's sampler at a node's property. Different channels of the same animation can't have equal targets. */
    channels: GLTFChannel[];
    /** An array of samplers that combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target). */
    samplers: GLTFAnimationSampler[];
    /** The user-defined nam e of this object. */
    name?: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFChannel {
    /** The index of a sampler in this animation used to compute the value for the target. */
    sampler: number;
    /** The index of the node and TRS property to target. */
    target: GLTFTarget;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFTarget {
    /** The index of the node to target. */
    node?: number;
    /** The name of the node's TRS property to modify, or the "weights" of the Morph Targets it instantiates. For the "translation" property, the values that are provided by the sampler are the translation along the x, y, and z axes. For the "rotation" property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the "scale" property, the values are the scaling factors along the x, y, and z axes. */
    path: string;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}
/**@internal */
export interface GLTFAnimationSampler {
    /** The index of an accessor containing keyframe input values, e.g., time. */
    input: number;
    /** Interpolation algorithm. default: "LINEAR" */
    interpolation?: string;
    /** The index of an accessor, containing keyframe output values. */
    output: number;
    /** Dictionary object with extension-specific objects. */
    extensions?: object;
    /**	Application-specific data. */
    extras?: any;
}


/**@internal */
export interface GLTFAttributes {
    POSITION?: number;
    NORMAL?: number;
    TANGENT?: number;
    TEXCOORD_0?: number;
    TEXCOORD_1?: number;
    JOINTS_0?: number;
    WEIGHTS_0?: number;
    JOINTS_1?: number;
    WEIGHTS_1?: number;
    COLOR_0?: number;
}
/**@internal */
export enum GLTFComponentType {
    /**
     * Byte
     */
    BYTE = 5120,
    /**
     * Unsigned Byte
     */
    UNSIGNED_BYTE = 5121,
    /**
     * Short
     */
    SHORT = 5122,
    /**
     * Unsigned Short
     */
    UNSIGNED_SHORT = 5123,
    /**
     * Unsigned Int
     */
    UNSIGNED_INT = 5125,
    /**
     * Float
     */
    FLOAT = 5126,
}
/**@internal */
export enum GLTFAccessorType {
    /**
     * Scalar
     */
    SCALAR = "SCALAR",
    /**
     * Vector2
     */
    VEC2 = "VEC2",
    /**
     * Vector3
     */
    VEC3 = "VEC3",
    /**
     * Vector4
     */
    VEC4 = "VEC4",
    /**
     * Matrix2x2
     */
    MAT2 = "MAT2",
    /**
     * Matrix3x3
     */
    MAT3 = "MAT3",
    /**
     * Matrix4x4
     */
    MAT4 = "MAT4",
}
/**@internal */
export enum GLTFRenderMode {
    /**
     * Points
     */
    POINTS = 0,
    /**
     * Lines
     */
    LINES = 1,
    /**
     * Line Loop
     */
    LINE_LOOP = 2,
    /**
     * Line Strip
     */
    LINE_STRIP = 3,
    /**
     * Triangles
     */
    TRIANGLES = 4,
    /**
     * Triangle Strip
     */
    TRIANGLE_STRIP = 5,
    /**
     * Triangle Fan
     */
    TRIANGLE_FAN = 6,
}

/**
 * @internal
 * submesh 相关信息
 */
export interface GLTFSubMesh {
    /** indexbuffer */
    indexArray: Uint32Array;
    /** vertexbuffer */
    vertexArray: Float32Array;
    /** rendermode */
    renderMode: GLTFRenderMode;
    /** vertex count */
    vertexCount: number;
    /** vertex declaration */
    vertexDeclarationStr: string;
    /** material */
    gltfMaterial: GLTFMaterial;
    /** bone index list*/
    boneIndicesList: Uint16Array[];
    /** sub bone start array */
    subIndexStartArray: number[];
    /** sub bone length array */
    subIndexCountArray: number[];
}
/**@internal */
export interface GLTFClipNode {
    paths: string[];
    propertyOwner: string;
    propertyLength: number;
    propertise: string[];
    timeArray: Float32Array;
    valueArray: Float32Array;

    // 
    duration: number;
    type: number;
}
/**@internal */
export interface GLTFSkinData {
    boneNames: string[];
    bones: Sprite3D[];
    boneCount: number;
    rootBone: Sprite3D;
    inverseBindMatricesArray: Float32Array;
}