import { Color } from "../maths/Color";
import { Point } from "../maths/Point";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { OutOfRangeError } from "../utils/Error";
import { ITweenValue, TweenValueAdapter } from "./ITween";
import type { TweenPropInfo } from "./Tweener";

export class TweenValue extends Array<number> implements ITweenValue {
    /** @internal */
    _props: Array<TweenPropInfo>;

    get(name: string): any {
        let prop = this._props.find(e => e.name == name);
        if (!prop)
            throw new Error(`Property '${name}' is not in tween.`);

        return this.read(prop.type, prop.offset);
    }

    getAt(index: number): any {
        let prop = this._props[index];
        if (!prop)
            throw new OutOfRangeError(index);
        return this.read(prop.type, prop.offset);
    }

    copy(source: ITweenValue): this {
        this.length = 0;
        this.push(...source);
        return this;
    }

    /**
     * @internal
     */
    read(type: TweenPropInfo["type"], offset: number): any {
        switch (type) {
            case 0:
                return this[offset];
            case 1:
                return !!this[offset];
            case 2:
                return Color.hexToString(this[offset]);
            default:
                return type.read(this, offset);
        }
    }
}

function write(value: Vector2 | Vector3 | Vector4 | Color, array: TweenValue) {
    value.writeTo(array, array.length);
}

export const TweenValueAdapterKey = Symbol();

const vec2 = new Vector2();
(<any>Vector2.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: TweenValue, offset: number) => {
        return vec2.setValue(array[offset], array[offset + 1]);
    },
};

const vec3 = new Vector3();
(<any>Vector3.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: TweenValue, offset: number) => {
        return vec3.setValue(array[offset], array[offset + 1], array[offset + 2]);
    },
};

const vec4 = new Vector4();
(<any>Vector4.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: TweenValue, offset: number) => {
        return vec4.setValue(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
    },
};

const color = new Color();
(<any>Color.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: TweenValue, offset: number) => {
        return color.setValue(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
    },
};

const pt = new Point();
(<any>Point.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write: (value: Point, array: TweenValue) => {
        array.push(value.x, value.y);
    },
    read: (array: TweenValue, offset: number) => {
        return pt.setTo(array[offset], array[offset + 1]);
    },
};