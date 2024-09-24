import { Light } from "./Light";



/**
 * @internal
 * @en The `LightQueue` class manages a queue of lights.
 * @zh `LightQueue` 类管理一个灯光队列
 */
export class LightQueue<T extends Light> {
    _length: number = 0;
    _elements: T[] = [];


    /**
     * @en Adds a light to the queue.
     * @zh 向队列中添加一个灯光。
     */
    add(light: T): void {
        let index = this._elements.indexOf(light);
        if (index !=-1 && index < this._length) {
            return;
        }
        if (this._length === this._elements.length)
            this._elements.push(light);
        else
            this._elements[this._length] = light;
        this._length++;
    }

    /**
     * @en Removes a light from the queue.
     * @zh 从队列中移除一个灯光。
     */
    remove(light: T): void {
        var index: number = this._elements.indexOf(light);
        if(index == -1)
            return;
        this._length--;
        if (index !== this._length) {
            var end: T = this._elements[this._length];
            this._elements[index] = end;
        }
    }

    /**
     * @en Removes and returns the first light in the queue.
     * @zh 移除并返回队列中的第一个灯光。
     */
    shift(): T | undefined {
        this._length--;
        return this._elements.shift();
    }

    /**
     * @en Gets the index of the brightest light in the queue.
     * @zh 获取队列中最亮的灯光的索引。
     */
    getBrightestLight(): number | undefined {
        var maxIntIndex;
        var maxIntensity: number = -1;
        var elements: T[] = this._elements;
        for (var i: number = 0; i < this._length; i++) {
            var intensity: number = elements[i]._intensity;
            if (maxIntensity < intensity) {
                maxIntensity = intensity;
                maxIntIndex = i;
            }
        }
        return maxIntIndex;
    }
    /**
     * @en Rearranges the lights in the queue to ensure the brightest light is first.
     * @zh 重新排列队列中的灯光，确保最亮的灯光在最前面。
     */
    normalLightOrdering(brightestIndex: number) {
        var firstLight: T = this._elements[0];
        this._elements[0] = this._elements[brightestIndex];
        this._elements[brightestIndex] = firstLight;
    }
}



/**
 * @internal
 * @en The `AlternateLightQueue` class extends the `LightQueue` class, and overrides the remove method.
 * @zh `AlternateLightQueue` 类继承自 `LightQueue` 类，重写了移除灯光的方法
 */
export class AlternateLightQueue extends LightQueue<Light>{

    /**
     * @en Removes a light from the queue.
     * @zh 从队列中移除灯光。
     */
    remove(light: Light): void {
        //sort must base added time
        var index: number = this._elements.indexOf(light);
        this._elements.splice(index, 1);
        this._length--;
    }
}
