import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { TweenPropInfo, TweenValueType } from "./ITweener";

export class TweenValue extends Array<number> {
    /** @internal */
    _props: Array<TweenPropInfo>;

    get x(): number {
        return this[0];
    }

    get y(): number {
        return this[1];
    }

    get z(): number {
        return this[2];
    }

    get vec2(): Readonly<Vector2> {
        return this.read(TweenValueType.Vec2, 0) as Vector2;
    }

    get vec3(): Readonly<Vector3> {
        return this.read(TweenValueType.Vec3, 0) as Vector3;
    }

    get vec4(): Readonly<Vector4> {
        return this.read(TweenValueType.Vec4, 0) as Vector4;
    }

    get color(): Readonly<Color> {
        return this.read(TweenValueType.Color, 0) as Color;
    }

    /**
     * @en Get value by property name.
     * @param name Property name. 
     * @returns Value.
     * @zh 通过属性名称获取值。
     * @param name 属性名称。
     * @returns 值。
     */
    get(name: string): any {
        let prop = this._props.find(e => e.name == name);
        if (!prop)
            throw new Error(`Property '${name}' is not in tween.`);

        return this.read(prop.type, prop.offset);
    }

    /**
     * @internal
     */
    read(type: TweenValueType, offset: number): any {
        switch (type) {
            case TweenValueType.Number:
                return this[offset];
            case TweenValueType.Boolean:
                return !!this[offset];
            case TweenValueType.Vec2:
                return vec2.setValue(this[offset], this[offset + 1]);
            case TweenValueType.Vec3:
                return vec3.setValue(this[offset], this[offset + 1], this[offset + 2]);
            case TweenValueType.Vec4:
                return vec4.setValue(this[offset], this[offset + 1], this[offset + 2], this[offset + 3]);
            case TweenValueType.Color:
                return color.setValue(this[offset], this[offset + 1], this[offset + 2], this[offset + 3]);
            case TweenValueType.StringColor:
                return Color.hexToString(this[offset]);
            default:
                return this[offset];
        }
    }
}

const vec2 = new Vector2();
const vec3 = new Vector3();
const vec4 = new Vector4();
const color = new Color();
