import { Component } from "../../../components/Component";
import { ClassUtils } from "../../../utils/ClassUtils";
import { SimpleSkinnedMeshRenderer } from "../../core/SimpleSkinnedMeshRenderer";
import { Sprite3D } from "../../core/Sprite3D";

/**
 * @en Animator resource class for handling animation-related resources.
 * @zh 动画资源类，用于处理与动画相关的资源。
 */
export class AnimatorResource {
    /**
     * @en Get the animator resource component from a Sprite3D object.
     * @param sprite The Sprite3D object to get the component from.
     * @param propertyKey The key of the property to get the component for.
     * @zh 从Sprite3D对象获取动画资源组件。
     * @param sprite 要获取组件的Sprite3D对象。
     * @param propertyKey 要获取组件的属性键。
     */
    static getAnimatorResource(sprite: Sprite3D, propertyKey: string): Component {
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