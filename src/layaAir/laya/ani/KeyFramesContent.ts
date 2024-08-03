/**
 * @en Keyframes
 * @zh 关键帧
 */
export class KeyFramesContent {
    /**
     * @en The start time of the keyframe in milliseconds.
     * @zh 关键帧的开始时间（毫秒）。
     */
    startTime: number;
    /**
     * @en The duration of the keyframe in milliseconds.
     * @zh 关键帧的持续时间（毫秒）。
     */
    duration: number;
    /**
     * @en Private interpolation data.
     * An array containing the interpolation types and their associated data in the format [type0, Data0, type1, Data1, ...].
     * Type represents the interpolation method, and Data is the associated interpolation data which can be null.
     * Note: The value 254 indicates linear interpolation throughout, and 255 indicates no interpolation.
     * @zh 私有插值数据。
     * 数组内包含插值类型和相关数据，格式为 [type0, Data0, type1, Data1, ...]。
     * Type 表示插值方法，Data 是相关的插值数据，可以为空。
     * 注意：值 254 表示全线性插值，255 表示不进行插值。
     */
    interpolationData: any[];
    /**
     * @en The keyframe data.
     * @zh 关键帧的数据。
     */
    data: Float32Array;
    /**
     * @en The change in keyframe data.
     * @zh 关键帧数据的变化量。
     */
    dData: Float32Array;
    /**
     * @en The data for the next keyframe.
     * @zh 下一个关键帧的数据。
     */
    nextData: Float32Array;//= new Float32Array();

}


