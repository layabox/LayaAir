import type { ILogger } from "./ILogger";
import { ConsoleLogger } from "./ILogger";
import { MmdDataDeserializer } from "./mmdDataDeserializer";
import type { Vec3, Vec4 } from "./mmdTypes";

/**
 * VMD data
 *
 * The creation of this object means that the validation and indexing of the Vmd data are finished
 *
 * Therefore, there is no parsing error when reading data from VmdData
 */
export class VmdData {
    private static readonly _Signature = "Vocaloid Motion Data 0002";
    /**
     * Signature bytes
     *
     * The first 30 bytes of the VMD file must be "Vocaloid Motion Data 0002"
     * @internal
     */
    public static readonly SignatureBytes = 30;

    /**
     * Model name bytes
     *
     * The next 20 bytes of the VMD file must be the model name
     *
     * MMD assuming that motion is usually valid for one model
     *
     * so when binding target model name is different from the model name in VMD file, MMD warns the user
     * @internal
     */
    public static readonly ModelNameBytes = 20;

    /**
     * Bone key frame bytes
     * @internal
     */
    public static readonly BoneKeyFrameBytes =
        15 + // bone name (uint8[15])
        4 + // frame number (uint32)
        4 * 3 + // position (float32[3])
        4 * 4 + // rotation (float32[4])
        64; // interpolation (int8[64])

    /**
     * Morph key frame bytes
     * @internal
     */
    public static readonly MorphKeyFrameBytes =
        15 + // morph name (uint8[15])
        4 + // frame number (uint32)
        4; // weight (float32)

    /**
     * Camera key frame bytes
     * @internal
     */
    public static readonly CameraKeyFrameBytes =
        4 + // frame number (uint32)
        4 + // distance (float32)
        4 * 3 + // position (float32[3])
        4 * 3 + // rotation (float32[3])
        24 + // interpolation (int8[24])
        4 + // angle of view (uint32)
        1; // perspective (uint8)

    /**
     * Light key frame bytes
     * @internal
     */
    public static readonly LightKeyFrameBytes =
        4 + // frame number (uint32)
        4 * 3 + // color (float32[3])
        4 * 3; // direction (float32[3])

    /**
     * Self shadow key frame bytes
     * @internal
     */
    public static readonly SelfShadowKeyFrameBytes =
        4 + // frame number (uint32)
        1 + // mode (uint8)
        4; // distance (float32)

    /**
     * Property key frame bytes
     * @internal
     */
    public static readonly PropertyKeyFrameBytes =
        4 + // frame number (uint32)
        1; // visibility (uint8)

    /**
     * Property key frame IK state bytes
     * @internal
     */
    public static readonly PropertyKeyFrameIkStateBytes =
        20 + // bone name (uint8[20])
        1; // ik enabled (uint8)

    /**
     * Data deserializer for reading VMD data
     * @internal
     */
    public readonly dataDeserializer: MmdDataDeserializer;

    /**
     * Bone key frame count
     */
    public readonly boneKeyFrameCount: number;

    /**
     * Morph key frame count
     */
    public readonly morphKeyFrameCount: number;

    /**
     * Camera key frame count
     */
    public readonly cameraKeyFrameCount: number;

    /**
     * Light key frame count
     */
    public readonly lightKeyFrameCount: number;

    /**
     * Self shadow key frame count
     */
    public readonly selfShadowKeyFrameCount: number;

    /**
     * Property key frame count
     */
    public readonly propertyKeyFrameCount: number;

    private constructor(
        dataDeserializer: MmdDataDeserializer,
        boneKeyFrameCount: number,
        morphKeyFrameCount: number,
        cameraKeyFrameCount: number,
        lightKeyFrameCount: number,
        selfShadowKeyFrameCount: number,
        propertyKeyFrameCount: number
    ) {
        this.dataDeserializer = dataDeserializer;
        this.boneKeyFrameCount = boneKeyFrameCount;
        this.morphKeyFrameCount = morphKeyFrameCount;
        this.cameraKeyFrameCount = cameraKeyFrameCount;
        this.lightKeyFrameCount = lightKeyFrameCount;
        this.selfShadowKeyFrameCount = selfShadowKeyFrameCount;
        this.propertyKeyFrameCount = propertyKeyFrameCount;
    }

    /**
     * Create a new `VmdData` instance from the given buffer
     * @param buffer ArrayBuffer
     * @param logger Logger
     * @returns `VmdData` instance if the given buffer is a valid VMD data, otherwise `null`
     */
    public static CheckedCreate(buffer: ArrayBufferLike, logger: ILogger = new ConsoleLogger()): VmdData | null {
        const dataDeserializer = new MmdDataDeserializer(buffer);
        dataDeserializer.initializeTextDecoder("shift-jis");

        if (dataDeserializer.bytesAvailable < VmdData.SignatureBytes + VmdData.ModelNameBytes) {
            return null;
        }

        const signature = dataDeserializer.getSignatureString(this.SignatureBytes);
        if (signature.substring(0, this._Signature.length) !== this._Signature) {
            return null;
        }
        dataDeserializer.offset += VmdData.ModelNameBytes;

        let boneKeyFrameCount = 0;
        let morphKeyFrameCount = 0;
        let cameraKeyFrameCount = 0;
        let lightKeyFrameCount = 0;
        let selfShadowKeyFrameCount = 0;
        let propertyKeyFrameCount = 0;

        if (dataDeserializer.bytesAvailable < 4) return null;
        boneKeyFrameCount = dataDeserializer.getUint32();
        if (dataDeserializer.bytesAvailable < boneKeyFrameCount * VmdData.BoneKeyFrameBytes) return null;
        dataDeserializer.offset += boneKeyFrameCount * VmdData.BoneKeyFrameBytes;

        if (dataDeserializer.bytesAvailable < 4) return null;
        morphKeyFrameCount = dataDeserializer.getUint32();
        if (dataDeserializer.bytesAvailable < morphKeyFrameCount * VmdData.MorphKeyFrameBytes) return null;
        dataDeserializer.offset += morphKeyFrameCount * VmdData.MorphKeyFrameBytes;

        // some VMD files don't have camera, light key frames
        if (dataDeserializer.bytesAvailable !== 0) {
            if (dataDeserializer.bytesAvailable < 4) return null;
            cameraKeyFrameCount = dataDeserializer.getUint32();
            if (dataDeserializer.bytesAvailable < cameraKeyFrameCount * VmdData.CameraKeyFrameBytes) return null;
            dataDeserializer.offset += cameraKeyFrameCount * VmdData.CameraKeyFrameBytes;

            if (dataDeserializer.bytesAvailable < 4) return null;
            lightKeyFrameCount = dataDeserializer.getUint32();
            if (dataDeserializer.bytesAvailable < lightKeyFrameCount * VmdData.LightKeyFrameBytes) return null;
            dataDeserializer.offset += lightKeyFrameCount * VmdData.LightKeyFrameBytes;
        }

        // some VMD files don't have self shadow key frames
        if (dataDeserializer.bytesAvailable !== 0) {
            if (dataDeserializer.bytesAvailable < 4) return null;
            selfShadowKeyFrameCount = dataDeserializer.getUint32();
            if (dataDeserializer.bytesAvailable < selfShadowKeyFrameCount * VmdData.SelfShadowKeyFrameBytes) return null;
            dataDeserializer.offset += selfShadowKeyFrameCount * VmdData.SelfShadowKeyFrameBytes;
        }

        // some VMD files don't have property key frames
        if (dataDeserializer.bytesAvailable !== 0) {
            if (dataDeserializer.bytesAvailable < 4) return null;
            propertyKeyFrameCount = dataDeserializer.getUint32();
            for (let i = 0; i < propertyKeyFrameCount; ++i) {
                if (dataDeserializer.bytesAvailable < VmdData.PropertyKeyFrameBytes) return null;
                dataDeserializer.offset += VmdData.PropertyKeyFrameBytes;

                if (dataDeserializer.bytesAvailable < 4) return null;
                const propertyKeyFrameIkStateCount = dataDeserializer.getUint32();
                if (dataDeserializer.bytesAvailable < propertyKeyFrameIkStateCount * VmdData.PropertyKeyFrameIkStateBytes) return null;
                dataDeserializer.offset += propertyKeyFrameIkStateCount * VmdData.PropertyKeyFrameIkStateBytes;
            }
        }

        if (dataDeserializer.bytesAvailable > 0) {
            logger.warn(`There are ${dataDeserializer.bytesAvailable} bytes left after parsing`);
        }

        dataDeserializer.offset = 0;

        const vmdData = new VmdData(
            dataDeserializer,
            boneKeyFrameCount,
            morphKeyFrameCount,
            cameraKeyFrameCount,
            lightKeyFrameCount,
            selfShadowKeyFrameCount,
            propertyKeyFrameCount
        );

        return vmdData;
    }
}

/**
 * VMD object
 *
 * Lazy parsed VMD data object
 *
 * The total amount of memory used is more than parsing at once
 *
 * but you can adjust the instantaneous memory usage to a smaller extent
 */
export class VmdObject {
    /**
     * Property key frames
     *
     * Property key frames are only preparsed because they size is not fixed
     */
    public readonly propertyKeyFrames: readonly VmdObject.PropertyKeyFrame[];

    private readonly _vmdData: VmdData;

    private constructor(vmdData: VmdData, propertyKeyFrames: readonly VmdObject.PropertyKeyFrame[]) {
        this._vmdData = vmdData;
        this.propertyKeyFrames = propertyKeyFrames;
    }

    /**
     * Parse VMD data
     * @param vmdData VMD data
     * @returns `VmdObject` instance
     */
    public static Parse(vmdData: VmdData): VmdObject {
        const dataDeserializer = vmdData.dataDeserializer;

        const propertyKeyFrames: VmdObject.PropertyKeyFrame[] = [];
        dataDeserializer.offset =
            VmdData.SignatureBytes +
            VmdData.ModelNameBytes +
            4 + vmdData.boneKeyFrameCount * VmdData.BoneKeyFrameBytes +
            4 + vmdData.morphKeyFrameCount * VmdData.MorphKeyFrameBytes +
            4 + vmdData.cameraKeyFrameCount * VmdData.CameraKeyFrameBytes +
            4 + vmdData.lightKeyFrameCount * VmdData.LightKeyFrameBytes +
            4 + vmdData.selfShadowKeyFrameCount * VmdData.SelfShadowKeyFrameBytes +
            4;

        const propertyKeyFrameCount = vmdData.propertyKeyFrameCount;
        for (let i = 0; i < propertyKeyFrameCount; ++i) {
            const frameNumber = dataDeserializer.getUint32();
            const visible = dataDeserializer.getUint8() !== 0;

            const ikStateCount = dataDeserializer.getUint32();
            const ikStates: VmdObject.PropertyKeyFrame.IKState[] = [];
            for (let j = 0; j < ikStateCount; ++j) {
                const ikName = dataDeserializer.getDecoderString(20, true);
                const ikEnabled = dataDeserializer.getUint8() !== 0;
                ikStates.push([ikName, ikEnabled]);
            }

            const propertyKeyFrame: VmdObject.PropertyKeyFrame = {
                frameNumber,
                visible,
                ikStates
            };
            propertyKeyFrames.push(propertyKeyFrame);
        }

        return new VmdObject(vmdData, propertyKeyFrames);
    }

    /**
     * Parse VMD data from the given buffer
     * @param buffer ArrayBuffer
     * @returns `VmdObject` instance
     * @throws {Error} if the given buffer is not a valid VMD data
     */
    public static ParseFromBuffer(buffer: ArrayBufferLike): VmdObject {
        const vmdData = VmdData.CheckedCreate(buffer);
        if (vmdData === null) {
            throw new Error("Invalid VMD data");
        }

        return VmdObject.Parse(vmdData);
    }

    /**
     * Get bone key frame reader
     */
    public get boneKeyFrames(): VmdObject.BoneKeyFrames {
        const offset =
            VmdData.SignatureBytes +
            VmdData.ModelNameBytes +
            4;

        return new VmdObject.BoneKeyFrames(
            this._vmdData.dataDeserializer,
            offset,
            this._vmdData.boneKeyFrameCount
        );
    }

    /**
     * Get morph key frame reader
     */
    public get morphKeyFrames(): VmdObject.MorphKeyFrames {
        const offset =
            VmdData.SignatureBytes +
            VmdData.ModelNameBytes +
            4 +
            this._vmdData.boneKeyFrameCount * VmdData.BoneKeyFrameBytes +
            4;

        return new VmdObject.MorphKeyFrames(
            this._vmdData.dataDeserializer,
            offset,
            this._vmdData.morphKeyFrameCount
        );
    }

    /**
     * Get camera key frame reader
     */
    public get cameraKeyFrames(): VmdObject.CameraKeyFrames {
        const offset =
            VmdData.SignatureBytes +
            VmdData.ModelNameBytes +
            4 +
            this._vmdData.boneKeyFrameCount * VmdData.BoneKeyFrameBytes +
            4 +
            this._vmdData.morphKeyFrameCount * VmdData.MorphKeyFrameBytes +
            4;

        return new VmdObject.CameraKeyFrames(
            this._vmdData.dataDeserializer,
            offset,
            this._vmdData.cameraKeyFrameCount
        );
    }

    /**
     * Get light key frame reader
     */
    public get lightKeyFrames(): VmdObject.LightKeyFrames {
        const offset =
            VmdData.SignatureBytes +
            VmdData.ModelNameBytes +
            4 +
            this._vmdData.boneKeyFrameCount * VmdData.BoneKeyFrameBytes +
            4 +
            this._vmdData.morphKeyFrameCount * VmdData.MorphKeyFrameBytes +
            4 +
            this._vmdData.cameraKeyFrameCount * VmdData.CameraKeyFrameBytes +
            4;

        return new VmdObject.LightKeyFrames(
            this._vmdData.dataDeserializer,
            offset,
            this._vmdData.lightKeyFrameCount
        );
    }

    /**
     * Get self shadow key frame reader
     */
    public get selfShadowKeyFrames(): VmdObject.SelfShadowKeyFrames {
        const offset =
            VmdData.SignatureBytes +
            VmdData.ModelNameBytes +
            4 +
            this._vmdData.boneKeyFrameCount * VmdData.BoneKeyFrameBytes +
            4 +
            this._vmdData.morphKeyFrameCount * VmdData.MorphKeyFrameBytes +
            4 +
            this._vmdData.cameraKeyFrameCount * VmdData.CameraKeyFrameBytes +
            4 +
            this._vmdData.lightKeyFrameCount * VmdData.LightKeyFrameBytes +
            4;

        return new VmdObject.SelfShadowKeyFrames(
            this._vmdData.dataDeserializer,
            offset,
            this._vmdData.selfShadowKeyFrameCount
        );
    }
}

export namespace VmdObject {
    /**
     * key frame reader base class
     */
    export abstract class BufferArrayReader<T> {
        protected readonly _dataDeserializer: MmdDataDeserializer;
        protected readonly _startOffset: number;
        private readonly _length: number;

        /**
         * Create a new `BufferArrayReader` instance
         * @param dataDeserializer Data deserializer
         * @param startOffset Data start offset
         * @param length Data length
         */
        public constructor(
            dataDeserializer: MmdDataDeserializer,
            startOffset: number,
            length: number
        ) {
            this._dataDeserializer = dataDeserializer;
            this._startOffset = startOffset;
            this._length = length;
        }

        /**
         * Length of the data
         */
        public get length(): number {
            return this._length;
        }

        /**
         * Get the data at the given index
         * @param index Index
         */
        public abstract get(index: number): T;
    }

    /**
     * Bone key frame reader
     */
    export class BoneKeyFrames extends BufferArrayReader<BoneKeyFrame> {
        /**
         * Create a new `BoneKeyFrames` instance
         * @param dataDeserializer Data deserializer
         * @param startOffset Data start offset
         * @param length Data length
         */
        public constructor(
            dataDeserializer: MmdDataDeserializer,
            startOffset: number,
            length: number
        ) {
            super(dataDeserializer, startOffset, length);
        }

        /**
         * Get the data at the given index
         * @param index Index
         * @returns `BoneKeyFrame` instance
         */
        public get(index: number): BoneKeyFrame {
            const offset = this._startOffset + index * VmdData.BoneKeyFrameBytes;
            return new BoneKeyFrame(this._dataDeserializer, offset);
        }
    }

    /**
     * Bone key frame
     */
    export class BoneKeyFrame {
        /**
         * Bone name
         */
        public readonly boneName: string;

        /**
         * Frame number
         */
        public readonly frameNumber: number;

        /**
         * Position
         */
        public readonly position: Vec3;

        /**
         * Rotation quaternion
         */
        public readonly rotation: Vec4;

        /**
         * Interpolation
         *
         * https://hariganep.seesaa.net/article/201103article_1.html
         *
         * The interpolation parameters are four Bezier curves (0,0), (x1,y1), (x2,y2), and (127,127)
         *
         * It represents the parameters of each axis
         *
         * - X-axis interpolation parameters (X_x1, X_y1), (X_x2, X_y2)
         * - Y-axis interpolation parameters (Y_x1, Y_y1), (Y_x2, Y_y2)
         * - Z-axis interpolation parameters (Z_x1, Z_y1), (Z_x2, Z_y2)
         * - Rotation interpolation parameters (R_x1, R_y1), (R_x2, R_y2)
         *
         * Then, the interpolation parameters are as follows
         *
         * X_x1,Y_x1,Z_x1,R_x1,
         * X_y1,Y_y1,Z_y1,R_y1,
         * X_x2,Y_x2,Z_x2,R_x2,
         * X_y2,Y_y2,Z_y2,R_y2,
         *
         * Y_x1,Z_x1,R_x1,X_y1,
         * Y_y1,Z_y1,R_y1,X_x2,
         * Y_x2,Z_x2,R_x2,X_y2,
         * Y_y2,Z_y2,R_y2, 01,
         *
         * Z_x1,R_x1,X_y1,Y_y1,
         * Z_y1,R_y1,X_x2,Y_x2,
         * Z_x2,R_x2,X_y2,Y_y2,
         * Z_y2,R_y2, 01, 00,
         *
         * R_x1,X_y1,Y_y1,Z_y1,
         * R_y1,X_x2,Y_x2,Z_x2,
         * R_x2,X_y2,Y_y2,Z_y2,
         * R_y2, 01, 00, 00
         *
         * [4][4][4] = [64]
         */
        public readonly interpolation: Uint8Array;

        /**
         * Create a new `BoneKeyFrame` instance
         * @param dataDeserializer Data deserializer
         * @param offset Data offset
         */
        public constructor(dataDeserializer: MmdDataDeserializer, offset: number) {
            dataDeserializer.offset = offset;

            this.boneName = dataDeserializer.getDecoderString(15, true);
            this.frameNumber = dataDeserializer.getUint32();
            this.position = dataDeserializer.getFloat32Tuple(3);
            this.rotation = dataDeserializer.getFloat32Tuple(4);

            this.interpolation = new Uint8Array(64);
            for (let i = 0; i < 64; ++i) {
                this.interpolation[i] = dataDeserializer.getUint8();
            }
        }
    }

    /**
     * Morph key frame reader
     */
    export class MorphKeyFrames extends BufferArrayReader<MorphKeyFrame> {
        /**
         * Create a new `MorphKeyFrames` instance
         * @param dataDeserializer Data deserializer
         * @param startOffset Data start offset
         * @param length Data length
         */
        public constructor(
            dataDeserializer: MmdDataDeserializer,
            startOffset: number,
            length: number
        ) {
            super(dataDeserializer, startOffset, length);
        }

        /**
         * Get the data at the given index
         * @param index Index
         * @returns `MorphKeyFrame` instance
         */
        public get(index: number): MorphKeyFrame {
            const offset = this._startOffset + index * VmdData.MorphKeyFrameBytes;
            return new MorphKeyFrame(this._dataDeserializer, offset);
        }
    }

    /**
     * Morph key frame
     */
    export class MorphKeyFrame {
        /**
         * Morph name
         */
        public readonly morphName: string;

        /**
         * Frame number
         */
        public readonly frameNumber: number;

        /**
         * Weight
         */
        public readonly weight: number;

        /**
         * Create a new `MorphKeyFrame` instance
         * @param dataDeserializer Data deserializer
         * @param offset Data offset
         */
        public constructor(dataDeserializer: MmdDataDeserializer, offset: number) {
            dataDeserializer.offset = offset;

            this.morphName = dataDeserializer.getDecoderString(15, true);
            this.frameNumber = dataDeserializer.getUint32();
            this.weight = dataDeserializer.getFloat32();
        }
    }

    /**
     * Camera key frame reader
     */
    export class CameraKeyFrames extends BufferArrayReader<CameraKeyFrame> {
        /**
         * Create a new `CameraKeyFrames` instance
         * @param dataDeserializer Data deserializer
         * @param startOffset Data start offset
         * @param length Data length
         */
        public constructor(
            dataDeserializer: MmdDataDeserializer,
            startOffset: number,
            length: number
        ) {
            super(dataDeserializer, startOffset, length);
        }

        /**
         * Get the data at the given index
         * @param index Index
         * @returns `CameraKeyFrame` instance
         */
        public get(index: number): CameraKeyFrame {
            const offset = this._startOffset + index * VmdData.CameraKeyFrameBytes;
            return new CameraKeyFrame(this._dataDeserializer, offset);
        }
    }

    /**
     * Camera key frame
     */
    export class CameraKeyFrame {
        /**
         * Frame number
         */
        public readonly frameNumber: number;

        /**
         * Distance from the camera center
         */
        public readonly distance: number;

        /**
         * Camera center position
         */
        public readonly position: Vec3;

        /**
         * Camera rotation in yaw, pitch, roll order
         */
        public readonly rotation: Vec3;

        /**
         * Interpolation
         *
         * range: 0..=127
         *
         * default linear interpolation is 20, 107, 20, 107
         *
         * Repr:
         *
         * x_ax, x_bx, x_ay, x_by,
         * y_ax, y_bx, y_ay, y_by,
         * z_ax, z_bx, z_ay, z_by,
         * rot_ax, rot_bx, rot_ay, rot_by,
         * distance_ax, distance_bx, distance_ay, distance_by,
         * angle_ax, angle_bx, angle_ay, angle_by
         */
        public readonly interpolation: Uint8Array;

        /**
         * Angle of view (in degrees)
         */
        public readonly fov: number;

        /**
         * Whether the camera is perspective or orthographic
         */
        public readonly perspective: boolean;

        /**
         * Create a new `CameraKeyFrame` instance
         * @param dataDeserializer Data deserializer
         * @param offset Data offset
         */
        public constructor(dataDeserializer: MmdDataDeserializer, offset: number) {
            dataDeserializer.offset = offset;

            this.frameNumber = dataDeserializer.getUint32();
            this.distance = dataDeserializer.getFloat32();
            this.position = dataDeserializer.getFloat32Tuple(3);
            this.rotation = dataDeserializer.getFloat32Tuple(3);

            this.interpolation = new Uint8Array(24);
            for (let i = 0; i < 24; ++i) {
                this.interpolation[i] = dataDeserializer.getUint8();
            }

            this.fov = dataDeserializer.getUint32();
            this.perspective = dataDeserializer.getUint8() !== 0;
        }
    }

    /**
     * Light key frame reader
     */
    export class LightKeyFrames extends BufferArrayReader<LightKeyFrame> {
        /**
         * Create a new `LightKeyFrames` instance
         * @param dataDeserializer Data deserializer
         * @param startOffset Data start offset
         * @param length Data length
         */
        public constructor(
            dataDeserializer: MmdDataDeserializer,
            startOffset: number,
            length: number
        ) {
            super(dataDeserializer, startOffset, length);
        }

        /**
         * Get the data at the given index
         * @param index Index
         * @returns `LightKeyFrame` instance
         */
        public get(index: number): LightKeyFrame {
            const offset = this._startOffset + index * VmdData.LightKeyFrameBytes;
            return new LightKeyFrame(this._dataDeserializer, offset);
        }
    }

    /**
     * Light key frame
     */
    export class LightKeyFrame {
        /**
         * Frame number
         */
        public readonly frameNumber: number;

        /**
         * Light color
         */
        public readonly color: Vec3;

        /**
         * Light direction
         */
        public readonly direction: Vec3;

        /**
         * Create a new `LightKeyFrame` instance
         * @param dataDeserializer Data deserializer
         * @param offset Data offset
         */
        public constructor(dataDeserializer: MmdDataDeserializer, offset: number) {
            dataDeserializer.offset = offset;

            this.frameNumber = dataDeserializer.getUint32();
            this.color = dataDeserializer.getFloat32Tuple(3);
            this.direction = dataDeserializer.getFloat32Tuple(3);
        }
    }

    /**
     * Self shadow key frame reader
     */
    export class SelfShadowKeyFrames extends BufferArrayReader<SelfShadowKeyFrame> {
        /**
         * Create a new `SelfShadowKeyFrames` instance
         * @param dataDeserializer Data deserializer
         * @param startOffset Data start offset
         * @param length Data length
         */
        public constructor(
            dataDeserializer: MmdDataDeserializer,
            startOffset: number,
            length: number
        ) {
            super(dataDeserializer, startOffset, length);
        }

        /**
         * Get the data at the given index
         * @param index Index
         * @returns `SelfShadowKeyFrame` instance
         */
        public get(index: number): SelfShadowKeyFrame {
            const offset = this._startOffset + index * VmdData.SelfShadowKeyFrameBytes;
            return new SelfShadowKeyFrame(this._dataDeserializer, offset);
        }
    }

    /**
     * Self shadow key frame
     */
    export class SelfShadowKeyFrame {
        /**
         * Frame number
         */
        public readonly frameNumber: number;

        /**
         * Shadow mode
         */
        public readonly mode: number;

        /**
         * Distance
         */
        public readonly distance: number;

        /**
         * Create a new `SelfShadowKeyFrame` instance
         * @param dataDeserializer Data deserializer
         * @param offset Data offset
         */
        public constructor(dataDeserializer: MmdDataDeserializer, offset: number) {
            dataDeserializer.offset = offset;

            this.frameNumber = dataDeserializer.getUint32();
            this.mode = dataDeserializer.getUint8();
            this.distance = dataDeserializer.getFloat32();
        }
    }

    /**
     * Property key frame
     */
    export type PropertyKeyFrame = Readonly<{
        /**
         * Frame number
         */
        frameNumber: number;

        /**
         * Visibility
         */
        visible: boolean;

        /**
         * IK states
         */
        ikStates: readonly PropertyKeyFrame.IKState[];
    }>;

    export namespace PropertyKeyFrame {
        /**
         * IK state [bone name, ik enabled]
         */
        export type IKState = Readonly<[string, boolean]>;
    }
}
