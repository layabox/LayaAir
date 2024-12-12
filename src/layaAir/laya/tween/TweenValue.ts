import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";

export enum TweenValueType {
    None,
    Vec2,
    Vec3,
    Vec4,
    Color,
    HexColor,
}

export class TweenValue extends Array<number> {
    /** @internal */
    _props: Array<{ name: string, type: TweenValueType, i: number }>;

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

    get hexColor(): number {
        return (this[0] << 16) + (this[1] << 8) + this[2];
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
        if (!prop) return null;
        return this.read(prop.type, prop.i);
    }

    /**
     * @en Read value by position and type.
     * @param type The value type.
     * @param offset The value offset.
     * @returns Value.
     * @zh 通过位置和类型读取值。
     * @param type 值类型。
     * @param offset 值位置。
     * @returns 值。 
     */
    read(type: TweenValueType, offset: number): Vector2 | Vector3 | Vector4 | Color | number {
        switch (type) {
            case TweenValueType.None:
                return this[offset];
            case TweenValueType.Vec2:
                return vec2.setValue(this[offset], this[offset + 1]);
            case TweenValueType.Vec3:
                return vec3.setValue(this[offset], this[offset + 1], this[offset + 2]);
            case TweenValueType.Vec4:
                return vec4.setValue(this[offset], this[offset + 1], this[offset + 2], this[offset + 3]);
            case TweenValueType.Color:
                return color.setValue(this[offset], this[offset + 1], this[offset + 2], this[offset + 3]);
            case TweenValueType.HexColor:
                return (this[offset] << 16) + (this[offset + 1] << 8) + this[offset + 2];
            default:
                return this[offset];
        }
    }
}

const vec2 = new Vector2();
const vec3 = new Vector3();
const vec4 = new Vector4();
const color = new Color();
