import type { Vec2, Vec3, Vec4 } from "./mmdTypes";
import { PmdObject } from "./pmdObject";

/**
 * PmxObject is a type that represents the data of a model in the PMX format (PMX 2.1)
 */
export type PmxObject = Readonly<{
    /**
     * Header of the PMX file
     */
    header: PmxObject.Header;

    /**
     * Vertex data of the model
     */
    vertices: readonly PmxObject.Vertex[];

    /**
     * Indices of the model
     */
    indices: Uint8Array | Uint16Array | Int32Array;

    /**
     * Texture data of the model
     */
    textures: readonly PmxObject.Texture[];

    /**
     * Material information of the model
     */
    materials: readonly PmxObject.Material[];

    /**
     * Bone information of the model
     */
    bones: readonly PmxObject.Bone[];

    /**
     * Morph information of the model
     */
    morphs: readonly PmxObject.Morph[];

    /**
     * Display frames of the model
     */
    displayFrames: readonly PmxObject.DisplayFrame[];

    /**
     * Rigid body information of the model
     */
    rigidBodies: readonly PmxObject.RigidBody[];

    /**
     * Joint information of the model
     */
    joints: readonly PmxObject.Joint[];

    /**
     * Soft body information of the model
     */
    softBodies: readonly PmxObject.SoftBody[]; // pmx 2.1 spec (which is not supported by mmd)

    iks?:readonly PmdObject.Ik[];
}>;

export namespace PmxObject {
    /**
     * Header of the PMX file
     */
    export type Header = Readonly<{
        /**
         * Signature of the PMX file (always "PMX" and there's one byte garbage after it)
         */
        signature: string;

        /**
         * Version of the PMX file
         */
        version: number;

        /**
         * Encoding of the PMX file
         */
        encoding: Header.Encoding;

        /**
         * Additional vector 4 count
         */
        additionalVec4Count: number; // 0 | 1 | 2 | 3 | 4;

        /**
         * Vertex index size (in bytes)
         */
        vertexIndexSize: number; // 1 | 2 | 4;

        /**
         * Texture index size (in bytes)
         */
        textureIndexSize: number; // 1 | 2 | 4;

        /**
         * Material index size (in bytes)
         */
        materialIndexSize: number; // 1 | 2 | 4;

        /**
         * Bone index size (in bytes)
         */
        boneIndexSize: number; // 1 | 2 | 4;

        /**
         * Morph index size (in bytes)
         */
        morphIndexSize: number; // 1 | 2 | 4;

        /**
         * Rigid body index size (in bytes)
         */
        rigidBodyIndexSize: number; // 1 | 2 | 4;

        /**
         * Model name
         */
        modelName: string;

        /**
         * Model name in English
         */
        englishModelName: string;

        /**
         * Comment
         */
        comment: string;

        /**
         * Comment in English
         */
        englishComment: string;
    }>;

    export namespace Header {
        /**
         * Encoding of the PMX file
         */
        export enum Encoding {
            Utf16le = 0,
            Utf8 = 1,
            ShiftJis = 2 // for pmd compatibility
        }
    }

    /**
     * Vertex data of the model
     */
    export type Vertex = Readonly<{
        /**
         * Position of the vertex
         */
        position: Vec3;

        /**
         * Normal vector of the vertex
         */
        normal: Vec3;

        /**
         * UV coordinate of the vertex
         */
        uv: Vec2;

        /**
         * Additional Vector4 of the vertex
         *
         * Can be used for:
         * - Additional texture UV
         * - Specular map UV
         * - Normal map UV
         * - Vertex color - pmx 2.1 spec (which is not supported by mmd)
         *
         * This value is usually rarely used
         */
        additionalVec4: readonly Vec4[];

        /**
         * Weight type of the vertex
         */
        weightType: Vertex.BoneWeightType;

        /**
         * Weight of the vertex
         */
        boneWeight: Vertex.BoneWeight;

        /**
         * Edge scale of the vertex
         *
         * Pencil-outline scale (1.0 should be around 1 pixel)
         *
         * Value to vary the degree of outline offset for each vertex
         *
         * But we need one more attribute to do this. Therefore, we put the implementation on hold for now.
         */
        edgeScale: number;
    }>;

    export namespace Vertex {
        /**
         * Weight type of the vertex
         */
        export enum BoneWeightType {
            Bdef1 = 0,
            Bdef2 = 1,
            Bdef4 = 2,
            Sdef = 3,
            Qdef = 4 // pmx 2.1 spec (which is not supported by mmd)
        }

        /**
         * SDEF (Spherical Deform) bone weight
         */
        export type BoneWeightSDEF = Readonly<{
            boneWeight0: number;
            c: Vec3;
            r0: Vec3;
            r1: Vec3;
        }>;

        /**
         * Weight of the vertex
         */
        export type BoneWeight<T extends BoneWeightType = Vertex.BoneWeightType> = Readonly<{
            /**
             * Bone indices
             */
            boneIndices: T extends BoneWeightType.Bdef1 ? number
                : T extends BoneWeightType.Bdef2 ? Vec2
                : T extends BoneWeightType.Bdef4 ? Vec4
                : T extends BoneWeightType.Sdef ? Vec2
                : T extends BoneWeightType.Qdef ? Vec4
                : never;

            /**
             * Bone weights
             */
            boneWeights: T extends BoneWeightType.Bdef1 ? null
                : T extends BoneWeightType.Bdef2 ? number
                : T extends BoneWeightType.Bdef4 ? Vec4
                : T extends BoneWeightType.Sdef ? BoneWeightSDEF
                : T extends BoneWeightType.Qdef ? Vec4
                : never;
        }>;
    }

    // export type Face = Readonly<Vec3>; // indices replaced to RelativeIndexable<number>

    /**
     * Relative path to the texture
     */
    export type Texture = string;

    /**
     * Material information of the model
     */
    export type Material = Readonly<{
        /**
         * Name of the material
         */
        name: string;

        /**
         * Name of the material in English
         */
        englishName: string;

        /**
         * Diffuse color (RGBA)
         */
        diffuse: Vec4;

        /**
         * Specular color (RGB)
         */
        specular: Vec3;

        /**
         * Shininess
         */
        shininess: number;

        /**
         * Ambient color (RGB)
         */
        ambient: Vec3;

        /**
         * Flag of the material
         *
         * @see Material.Flag
         */
        flag: number;

        /**
         * Edge color (RGBA)
         */
        edgeColor: Vec4;

        /**
         * Edge size
         *
         * Final edge size is calculated by multiplying this value by the vertex edge scale
         */
        edgeSize: number;

        /**
         * Texture index
         */
        textureIndex: number;

        /**
         * Sphere texture index
         */
        sphereTextureIndex: number;

        /**
         * Sphere texture blend mode
         */
        sphereTextureMode: Material.SphereTextureMode;

        /**
         * Flag whether the material is shared toon texture
         *
         * If true, toonTextureIndex is the index of the shared toon texture
         */
        isSharedToonTexture: boolean;

        /**
         * Toon texture index
         *
         * If isSharedToonTexture is true, this value is the index of the shared toon texture
         *
         * for shared toon texture, this value is -1 to 9 and should be mapped to SharedToonTextures.Data index by adding 1
         * for non-shared toon texture, -1 means no toon texture
         */
        toonTextureIndex: number;

        /**
         * Comment
         */
        comment: string;

        /**
         * Number of indices to read from the index buffer
         *
         * This value is used for calculating the number of indices to read from the index buffer
         */
        indexCount: number;
    }>;

    export namespace Material {
        /**
         * Flag of the material
         */
        export enum Flag {
            IsDoubleSided = 1 << 0,
            EnabledGroundShadow = 1 << 1,
            EnabledDrawShadow = 1 << 2,
            EnabledReceiveShadow = 1 << 3,
            EnabledToonEdge = 1 << 4,
            EnabledVertexColor = 1 << 5, // pmx 2.1 spec (which is not supported by mmd)
            EnabledPointDraw = 1 << 6, // pmx 2.1 spec (which is not supported by mmd)
            EnabledLineDraw = 1 << 7 // pmx 2.1 spec (which is not supported by mmd)
        }

        /**
         * Sphere texture blend mode
         */
        export enum SphereTextureMode {
            Off = 0,
            Multiply = 1,
            Add = 2,
            SubTexture = 3
        }
    }

    /**
     * Bone information of the model
     */
    export type Bone = Readonly<{
        /**
         * Name of the bone
         *
         * This value is uaually used for bind the animation
         */
        name: string;

        /**
         * Name of the bone in English
         */
        englishName: string;

        /**
         * Position of the bone
         */
        position: Vec3;

        /**
         * Parent bone index
         */
        parentBoneIndex: number;

        /**
         * Transform order (a.k.a. Deform order)
         *
         * In MMD specification, matrix multiplication order must be:
         * 1. Bones order
         * 2. Stable sorted by transform order
         */
        transformOrder: number;

        /**
         * Flag of the bone
         *
         * @see Bone.Flag
         */
        flag: number;

        /**
         * Tail position of the bone (a.k.a. Link to)
         *
         * Used in the editor to visualize the tail of the bone
         *
         * It's virtually unnecessary information to implement the runtime
         */
        tailPosition: number | Vec3;

        /**
         * Append transform (a.k.a. Additional transform) (optional)
         *
         * Append transform is a transform that is applied after the bone transform
         *
         * The AppendTransformed two bones ignore the actual bone hierarchy and are acting as if they were connected
         */
        appendTransform: Readonly<{
            /**
             * Parent bone index of the Append transform
             */
            parentIndex: number;

            /**
             * Append Transform ratio
             *
             * The ratio to which the append transform is applied
             *
             *  Allow negative numbers
             */
            ratio: number;
        }> | undefined;

        /**
         * Axis limit (optional)
         *
         * Axis limit is a constraint that limits the rotation of the bone
         *
         * It's virtually unnecessary information to implement the runtime
         */
        axisLimit: Vec3 | undefined;

        /**
         * Local vector (optional)
         *
         * Local vector is a vector that is used to calculate the rotation of the bone
         *
         * Information on this specification is still insufficient and it has been determined that it is not necessary for runtime implementation
         */
        localVector: Readonly<{
            x: Vec3;
            z: Vec3;
        }> | undefined;

        /**
         * External parent transform (optional)
         *
         * Information on this specification is still insufficient and it has been determined that it is not necessary for runtime implementation
         */
        externalParentTransform: number | undefined;

        /**
         * IK (Inverse Kinematics) (optional)
         */
        ik: Readonly<{
            /**
             * Target bone index
             */
            target: number;

            /**
             * Number of iterations (a.k.a. Loop)
             *
             * The number of times the IK calculation is performed
             */
            iteration: number;

            /**
             * Rotation constraint in radians (a.k.a. Angle)
             */
            rotationConstraint: number;

            /**
             * IK links
             */
            links: readonly Bone.IKLink[];
        }> | undefined;
    }>;

    export namespace Bone {
        /**
         * Flag of the bone
         */
        export enum Flag {
            UseBoneIndexAsTailPosition = 0x0001,

            IsRotatable = 0x0002,
            IsMovable = 0x0004,
            IsVisible = 0x0008,
            IsControllable = 0x0010,
            IsIkEnabled = 0x0020,

            /**
             * Whether to apply Append transform in a chain
             *
             * If this bit is 0, then in a bone structure with chain-append transform applied
             *
             * the append transform works by adding itself to each other's calculation results
             */
            LocalAppendTransform = 0x0080,
            /**
             * Whether to apply Append transform to rotation
             */
            HasAppendRotate = 0x0100,
            /**
             * Whether to apply Append transform to position
             */
            HasAppendMove = 0x0200,
            HasAxisLimit = 0x0400,
            HasLocalVector = 0x0800,
            /**
             * Whether to apply transform after physics
             *
             * If this bit is 1, the bone transform is applied after physics
             */
            TransformAfterPhysics = 0x1000,
            IsExternalParentTransformed = 0x2000,
        }

        /**
         * IK link (a.k.a. IK chain)
         */
        export type IKLink = Readonly<{
            /**
             * Bone index
             */
            target: number;

            /**
             * Constraint angles
             */
            limitation: Readonly<{
                /**
                 * Minimum angle
                 */
                minimumAngle: Vec3;

                /**
                 * Maximum angle
                 */
                maximumAngle: Vec3;
            }> | undefined;
        }>;
    }

    /**
     * Morph information of the model
     */
    export type Morph = Morph.GroupMorph
        | Morph.VertexMorph
        | Morph.BoneMorph
        | Morph.UvMorph
        | Morph.MaterialMorph
        | Morph.FlipMorph
        | Morph.ImpulseMorph;

    export namespace Morph {
        /**
         * Category of the morph
         *
         * It's virtually unnecessary information to implement the runtime
         */
        export enum Category {
            System = 0,
            Eyebrow = 1,
            Eye = 2,
            Lip = 3,
            Other = 4
        }

        /**
         * Type of the morph
         */
        export enum Type {
            GroupMorph = 0,
            VertexMorph = 1,
            BoneMorph = 2,
            UvMorph = 3,
            AdditionalUvMorph1 = 4,
            AdditionalUvMorph2 = 5,
            AdditionalUvMorph3 = 6,
            AdditionalUvMorph4 = 7,
            MaterialMorph = 8,
            FlipMorph = 9, // pmx 2.1 spec (which is not supported by mmd)
            ImpulseMorph = 10 // pmx 2.1 spec (which is not supported by mmd)
        }

        /**
         * Base morph data
         */
        export type BaseMorph = Readonly<{
            /**
             * Name of the morph
             *
             * This value is uaually used for bind the animation
             */
            name: string;

            /**
             * Name of the morph in English
             */
            englishName: string;

            /**
             * Category of the morph
             */
            category: Morph.Category;

            /**
             * Type of the morph
             */
            type: Morph.Type;
        }>;

        /**
         * Group morph is a morph that combines multiple morphs
         *
         * nstead of affecting other morph instances themselves
         *
         * it acts as if it would collect other morph data and create a new morph
         */
        export type GroupMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.GroupMorph;

            /**
             * Other morph indices
             */
            indices: Int32Array;

            /**
             * Morph application ratios
             */
            ratios: Float32Array;
        }>;

        /**
         * Vertex morph is a morph that moves the vertex
         */
        export type VertexMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.VertexMorph;

            /**
             * Vertex indices
             */
            indices: Int32Array;

            /**
             * Vertex position offsets
             *
             * Repr: [..., x, y, z, ...]
             */
            positions: Float32Array;
        }>;

        /**
         * Bone morph is a morph that moves the bone
         */
        export type BoneMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.BoneMorph;

            /**
             * Bone indices
             */
            indices: Int32Array;

            /**
             * Bone position offsets
             *
             * Repr: [..., x, y, z, ...]
             */
            positions: Float32Array;

            /**
             * Bone rotation offsets
             *
             * Repr: [..., x, y, z, w, ...]
             */
            rotations: Float32Array;
        }>;

        /**
         * UV morph is a morph that moves the UV coordinate
         */
        export type UvMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.UvMorph
                | Morph.Type.AdditionalUvMorph1
                | Morph.Type.AdditionalUvMorph2
                | Morph.Type.AdditionalUvMorph3
                | Morph.Type.AdditionalUvMorph4;

            /**
             * Vertex indices
             */
            indices: Int32Array;

            /**
             * UV coordinate offsets
             *
             * Repr: [..., x, y, z, w, ...]
             */
            offsets: Float32Array;
        }>;

        /**
         * Material morph is a morph that changes the material parameters
         */
        export type MaterialMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.MaterialMorph;

            /**
             * Material morph elements
             */
            elements: Readonly<{
                /**
                 * Material index
                 */
                index: number;

                /**
                 * Morph operation type
                 */
                type: MaterialMorph.Type;

                /**
                 * Diffuse color offset (RGBA)
                 */
                diffuse: Vec4;

                /**
                 * Specular color offset (RGB)
                 */
                specular: Vec3;

                /**
                 * Shininess offset
                 */
                shininess: number;

                /**
                 * Ambient color offset (RGB)
                 */
                ambient: Vec3;

                /**
                 * Edge color offset (RGBA)
                 */
                edgeColor: Vec4;

                /**
                 * Edge size offset
                 */
                edgeSize: number;

                /**
                 * Texture color offset (RGBA)
                 */
                textureColor: Vec4;

                /**
                 * Sphere texture color offset (RGBA)
                 */
                sphereTextureColor: Vec4;

                /**
                 * Toon texture color offset (RGBA)
                 */
                toonTextureColor: Vec4;
            }>[];
        }>;

        export namespace MaterialMorph {
            /**
             * Morph operation type
             *
             * Multiply: linear interpolation between the original value and the (original value * morph value) by morph ratio
             *
             * Add: original value + (morph value * ratio)
             */
            export enum Type {
                Multiply = 0,
                Add = 1
            }
        }

        /**
         * Flip morph is a morph that inverts the morph value of another morph
         */
        export type FlipMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.FlipMorph;

            /**
             * Morph indices
             */
            indices: Int32Array;

            /**
             * Morph application ratios
             */
            ratios: Float32Array;
        }>;

        /**
         * Impulse morph is a morph that applies a force to the rigid body
         */
        export type ImpulseMorph = BaseMorph & Readonly<{
            /**
             * Type of the morph
             */
            type: Morph.Type.ImpulseMorph;

            /**
             * Rigid body indices
             */
            indices: Int32Array;

            /**
             * Whether to apply the force to the local coordinate system
             */
            isLocals: boolean[];

            /**
             * Velocity of the rigid body
             *
             * Repr: [..., x, y, z, ...]
             */
            velocities: Float32Array;

            /**
             * Angular velocity of the rigid body
             *
             * Repr: [..., x, y, z, ...]
             */
            torques: Float32Array;
        }>;
    }

    /**
     * Display frame is a user interface element that allows the user to select and manipulate bones and morphs
     *
     * It's virtually unnecessary information to implement the runtime
     *
     * However, you need to emulate the Display Frame to achieve completely the same binding results as MMD
     *
     * This is a matter to be considered if there is an issue in the future
     */
    export type DisplayFrame = Readonly<{
        /**
         * Name of the display frame
         */
        name: string;

        /**
         * Name of the display frame in English
         */
        englishName: string;

        /**
         * Whether the display frame is special
         */
        isSpecialFrame: boolean;

        /**
         * Display frame elements
         */
        frames: readonly DisplayFrame.FrameData[];
    }>;

    export namespace DisplayFrame {
        /**
         * Display frame element
         */
        export type FrameData = Readonly<{
            /**
             * Type of the frame element
             */
            type: FrameData.FrameType;

            /**
             * Index of the bone or morph
             */
            index: number;
        }>;

        export namespace FrameData {
            /**
             * Type of the frame element
             */
            export enum FrameType {
                Bone = 0,
                Morph = 1
            }
        }
    }

    /**
     * Rigid body information of the model
     */
    export type RigidBody = Readonly<{
        /**
         * Name of the rigid body
         */
        name: string;

        /**
         * Name of the rigid body in English
         */
        englishName: string;

        /**
         * Bone index
         */
        boneIndex: number;

        /**
         * Collision group (uint16)
         */
        collisionGroup: number;

        /**
         * Collision mask (uint16)
         */
        collisionMask: number;

        /**
         * Shape type
         */
        shapeType: RigidBody.ShapeType;

        /**
         * Shape size
         */
        shapeSize: Vec3;

        /**
         * World position of the shape
         */
        shapePosition: Vec3;

        /**
         * World rotation of the shape
         */
        shapeRotation: Vec3;

        /**
         * Mass
         */
        mass: number;

        /**
         * Linear damping
         */
        linearDamping: number;

        /**
         * Angular damping
         */
        angularDamping: number;

        /**
         * Restitution
         */
        repulsion: number;

        /**
         * Friction
         */
        friction: number;

        /**
         * Physics mode
         */
        physicsMode: RigidBody.PhysicsMode;
    }>;

    export namespace RigidBody {
        /**
         * Shape type
         */
        export enum ShapeType {
            Sphere = 0,
            Box = 1,
            Capsule = 2
        }

        /**
         * Physics mode
         */
        export enum PhysicsMode {
            FollowBone = 0,
            Physics = 1,
            PhysicsWithBone = 2
        }
    }

    /**
     * Joint information of the model
     *
     * Typically, it has parameters for creating a 6DOF spring constraint
     */
    export type Joint = Readonly<{
        /**
         * Name of the joint
         */
        name: string;

        /**
         * Name of the joint in English
         */
        englishName: string;

        /**
         * Type of the joint
         */
        type: Joint.Type;

        /**
         * Rigid body index A
         */
        rigidbodyIndexA: number;

        /**
         * Rigid body index B
         */
        rigidbodyIndexB: number;

        /**
         * World position of the joint
         */
        position: Vec3;

        /**
         * World rotation of the joint
         */
        rotation: Vec3;

        /**
         * Translation limit min
         */
        positionMin: Vec3;

        /**
         * Translation limit max
         */
        positionMax: Vec3;

        /**
         * Rotation limit min
         */
        rotationMin: Vec3;

        /**
         * Rotation limit max
         */
        rotationMax: Vec3;

        /**
         * Spring translation
         */
        springPosition: Vec3;

        /**
         * Spring rotation
         */
        springRotation: Vec3;
    }>;

    export namespace Joint {
        /**
         * Type of the joint
         */
        export enum Type {
            Spring6dof = 0,
            Sixdof = 1, // pmx 2.1 spec (which is not supported by mmd)
            P2p = 2, // pmx 2.1 spec (which is not supported by mmd)
            ConeTwist = 3, // pmx 2.1 spec (which is not supported by mmd)
            Slider = 4, // pmx 2.1 spec (which is not supported by mmd)
            Hinge = 5 // pmx 2.1 spec (which is not supported by mmd)
        }
    }

    /**
     * Soft body information of the model
     */
    export type SoftBody = Readonly<{
        /**
         * Name of the soft body
         */
        name: string;

        /**
         * Name of the soft body in English
         */
        englishName: string;

        /**
         * Type of the soft body
         */
        type: SoftBody.Type;

        /**
         * Material index
         */
        materialIndex: number;

        /**
         * Collision group (uint16)
         */
        collisionGroup: number;

        /**
         * Collision mask (uint16)
         */
        collisionMask: number;

        /**
         * Flag of the soft body
         */
        flags: SoftBody.Flag;

        /**
         * B link distance
         */
        bLinkDistance: number;

        /**
         * Number of clusters
         */
        clusterCount: number;

        /**
         * Total mass
         */
        totalMass: number;

        /**
         * Collision margin
         */
        collisionMargin: number;

        /**
         * Aero dynamic model
         */
        aeroModel: SoftBody.AeroDynamicModel;

        /**
         * Config settings
         */
        config: SoftBody.Config;

        /**
         * Cluster settings
         */
        cluster: SoftBody.Cluster;

        /**
         * Iteration settings
         */
        iteration: SoftBody.Iteration;

        /**
         * Material settings
         */
        material: SoftBody.Material;

        /**
         * Anchor rigid bodies
         */
        anchors: readonly SoftBody.AnchorRigidBody[];

        /**
         * Vertex pin indices
         */
        vertexPins: Uint8Array | Uint16Array | Int32Array;
    }>;

    export namespace SoftBody {
        /**
         * Type of the soft body
         */
        export enum Type {
            TriMesh = 0,
            Rope = 1
        }

        /**
         * Flag of the soft body
         */
        export enum Flag {
            Blink = 0x0001,
            ClusterCreation = 0x0002,
            LinkCrossing = 0x0004
        }

        /**
         * Aero dynamic model
         */
        export enum AeroDynamicModel {
            VertexPoint = 0,
            VertexTwoSided = 1,
            VertexOneSided = 2,
            FaceTwoSided = 3,
            FaceOneSided = 4
        }

        /**
         * Anchor rigid body
         */
        export type AnchorRigidBody = Readonly<{
            rigidbodyIndex: number;
            vertexIndex: number;
            isNearMode: boolean;
        }>;

        /**
         * Config settings
         */
        export type Config = Readonly<{
            /**
             * Velocities correction factor (Baumgarte)
             */
            vcf: number;

            /**
             * Damping coefficient
             */
            dp: number;

            /**
             * Drag coefficient
             */
            dg: number;

            /**
             * Lift coefficient
             */
            lf: number;

            /**
             * Pressure coefficient
             */
            pr: number;

            /**
             * Volume conversation coefficient
             */
            vc: number;

            /**
             * Dynamic friction coefficient
             */
            df: number;

            /**
             * Pose matching coefficient
             */
            mt: number;

            /**
             * Rigid contacts hardness
             */
            chr: number;

            /**
             * Kinetic contacts hardness
             */
            khr: number;

            /**
             * Soft contacts hardness
             */
            shr: number;

            /**
             * Anchors hardness
             */
            ahr: number;
        }>;

        /**
         * Cluster settings
         */
        export type Cluster = Readonly<{
            /**
             * Soft vs rigid hardness
             */
            srhrCl: number;

            /**
             * Soft vs kinetic hardness
             */
            skhrCl: number;

            /**
             * Soft vs soft hardness
             */
            sshrCl: number;

            /**
             * Soft vs rigid impulse split
             */
            srSpltCl: number;

            /**
             * Soft vs kinetic impulse split
             */
            skSpltCl: number;

            /**
             * Soft vs soft impulse split
             */
            ssSpltCl: number;
        }>;

        /**
         * Iteration settings
         */
        export type Iteration = Readonly<{
            /**
             * Velocities iteration
             */
            vIt: number;

            /**
             * Positions iteration
             */
            pIt: number;

            /**
             * Drift iteration
             */
            dIt: number;

            /**
             * Cluster iteration
             */
            cIt: number;
        }>;

        export type Material = Readonly<{
            /**
             * Linear stiffness coefficient
             */
            lst: number;

            /**
             * Area/Angular stiffness coefficient
             */
            ast: number;

            /**
             * Volume stiffness coefficient
             */
            vst: number;
        }>;
    }
}
