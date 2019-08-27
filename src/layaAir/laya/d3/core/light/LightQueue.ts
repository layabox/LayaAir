import { DirectionLight } from "./DirectionLight";
import { LightSprite } from "./LightSprite";


/**
 * @internal
 */
export class LightQueue<T extends LightSprite> {
    _length: number = 0;
    _elements: T[] = [];

    add(light: T): void {
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

    shift(): T {
        this._length--;
        return this._elements.shift();
    }
}


/**
 * @internal
 */
export class DirectionLightQueue extends LightQueue<DirectionLight>{
    
    update(sunLight: DirectionLight): void {
        var maxIntIndex;
        if (sunLight) {
            maxIntIndex = this._elements.indexOf(sunLight);
        }
        else {
            var maxIntensity: number = -1;
            var elements: DirectionLight[] = this._elements;
            for (var i: number = 0; i < this._length; i++) {
                var intensity: number = elements[i]._intensity;
                if (maxIntensity < intensity) {
                    maxIntensity = intensity;
                    maxIntIndex = i;
                }
            }
        }
        var temp: DirectionLight = elements[0];
        elements[0] = elements[maxIntIndex];
        elements[maxIntIndex] = temp;
    }
}