import { KeyFrameValueType } from "../KeyframeNodeOwner";

/** Position / Rotation / Scale / RotationEuler 视为 Transform 类。PathPoint 不算（目标是 LineRenderer 等非 Transform 字段）。 */
export function isTransformType(type: KeyFrameValueType): boolean {
    return type === KeyFrameValueType.Position
        || type === KeyFrameValueType.Rotation
        || type === KeyFrameValueType.Scale
        || type === KeyFrameValueType.RotationEuler;
}
