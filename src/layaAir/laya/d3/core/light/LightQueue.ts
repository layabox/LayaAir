import { LightSprite } from "./LightSprite";

/**
 * @internal
 */
export class LightQueue<T extends LightSprite> {
    _length: number = 0;
    _elements: T[] = [];

    private _partitionObject(left: number, right: number): number {
        var elements: T[] = this._elements;
        var pivot: T = elements[Math.floor((right + left) / 2)];
        while (left <= right) {
            while (elements[left]._intensity - pivot._intensity < 0)
                left++;
            while (elements[right]._intensity - pivot._intensity > 0)
                right--;
            if (left < right) {
                var temp: T = elements[left];
                elements[left] = elements[right];
                elements[right] = temp;
                left++;
                right--;
            } else if (left === right) {
                left++;
                break;
            }
        }
        return left;
    }

    private _quickSort(left: number, right: number): void {
        if (this._elements.length > 1) {
            var index: number = this._partitionObject(left, right);
            var leftIndex: number = index - 1;
            if (left < leftIndex)
                this._quickSort(left, leftIndex);

            if (index < right)
                this._quickSort(index, right);
        }
    }

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

    update(): void {
        this._quickSort(0, this._length - 1);
    }
}