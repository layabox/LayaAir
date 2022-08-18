import { ClassUtils } from "../../utils/ClassUtils";
import { SimpleSkinnedMeshRenderer } from "../core/SimpleSkinnedMeshRenderer";
import { Sprite3D } from "../core/Sprite3D";

export class AnimatorResource {
    static getAnimatorResource(sprite: Sprite3D, propertyKey: string) {
        switch (propertyKey) {
            case "simpleSkinnedMeshRenderer":
                return sprite.getComponent(SimpleSkinnedMeshRenderer);
            default:
                return sprite.getComponent(ClassUtils.getClass(propertyKey));
                break;
        }
        return null;
    }
}