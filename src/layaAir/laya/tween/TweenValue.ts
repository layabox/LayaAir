import { Color } from "../maths/Color";
import { Point } from "../maths/Point";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { OutOfRangeError } from "../utils/Error";
import { ITweenValue, TweenValueAdapter } from "./ITween";
import type { TweenPropInfo } from "./Tweener";

export class TweenValue implements ITweenValue {
    readonly nums: Array<number>;
    private _props: Array<TweenPropInfo>;

    /**
     * @internal
     */
    constructor(props: Array<TweenPropInfo>) {
        this._props = props;
        this.nums = [];
    }

    get(name: string): any {
        let prop = this._props.find(e => e.name == name);
        if (!prop)
            throw new Error(`Property '${name}' is not in tween.`);

        return this.read(prop.type, prop.offset);
    }

    set(name: string, value: any): void {
        let prop = this._props.find(e => e.name == name);
        if (!prop)
            throw new Error(`Property '${name}' is not in tween.`);

        this.write(prop.type, prop.offset, value);
    }

    getAt(index: number): any {
        let prop = this._props[index];
        if (!prop)
            throw new OutOfRangeError(index);
        return this.read(prop.type, prop.offset);
    }

    setAt(index: number, value: any): void {
        let prop = this._props[index];
        if (!prop)
            throw new OutOfRangeError(index);
        this.write(prop.type, prop.offset, value);
    }

    get count() {
        return this._props.length;
    }

    copy(source: ITweenValue): this {
        this.nums.length = 0;
        this.nums.push(...source.nums);
        return this;
    }

    /**
     * @internal
     */
    read(type: TweenPropInfo["type"], offset: number): any {
        switch (type) {
            case 0:
                return this.nums[offset];
            case 1:
                return !!this.nums[offset];
            case 2:
                return Color.hexToString(this.nums[offset]);
            default:
                return type.read(this.nums, offset);
        }
    }

    /**
     * @internal
     */
    write(type: TweenPropInfo["type"], offset: number, value: any): void {
        switch (type) {
            case 0:
                this.nums[offset] = value;
                break;
            case 1:
                this.nums[offset] = value ? 1 : 0;
                break;
            case 2:
                this.nums[offset] = Color.stringToHex(value);
                break;
            default: {
                if (offset === this.nums.length)
                    type.write(this.nums, value);
                else {
                    tmpArr.length = 0;
                    type.write(tmpArr, value);
                    tmpArr.forEach((v, i) => this.nums[offset + i] = v);
                }
            }
        }
    }
}

const tmpArr: Array<number> = [];

function write(array: Array<number>, value: Vector2 | Vector3 | Vector4 | Color) {
    value.writeTo(array, array.length);
}

export const TweenValueAdapterKey = Symbol();

const vec2 = new Vector2();
(<any>Vector2.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: Array<number>, offset: number) => {
        return vec2.setValue(array[offset], array[offset + 1]);
    },
};

const vec3 = new Vector3();
(<any>Vector3.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: Array<number>, offset: number) => {
        return vec3.setValue(array[offset], array[offset + 1], array[offset + 2]);
    },
};

const vec4 = new Vector4();
(<any>Vector4.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: Array<number>, offset: number) => {
        return vec4.setValue(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
    },
};

const color = new Color();
(<any>Color.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write,
    read: (array: Array<number>, offset: number) => {
        return color.setValue(array[offset], array[offset + 1], array[offset + 2], array[offset + 3]);
    },
};

const pt = new Point();
(<any>Point.prototype)[TweenValueAdapterKey] = <TweenValueAdapter>{
    write: (array: Array<number>, value: Point) => {
        array.push(value.x, value.y);
    },
    read: (array: Array<number>, offset: number) => {
        return pt.setTo(array[offset], array[offset + 1]);
    },
};