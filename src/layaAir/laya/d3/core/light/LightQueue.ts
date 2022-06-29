import { Light } from "./Light";



/**
 * @internal
 */
export class LightQueue<T extends Light> {
    _length: number = 0;
    _elements: T[] = [];

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

    remove(light: T): void {
        var index: number = this._elements.indexOf(light);
        this._length--;
        if (index !== this._length) {
            var end: T = this._elements[this._length];
            this._elements[index] = end;
        }
    }

    shift(): T | undefined {
        this._length--;
        return this._elements.shift();
    }

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
    normalLightOrdering(brightestIndex: number) {
        var firstLight: T = this._elements[0];
        this._elements[0] = this._elements[brightestIndex];
        this._elements[brightestIndex] = firstLight;
    }
}




/**
 * @internal
 */
export class AlternateLightQueue extends LightQueue<Light>{

    remove(light: Light): void {
        //sort must base added time
        var index: number = this._elements.indexOf(light);
        this._elements.splice(index, 1);
        this._length--;
    }
}
