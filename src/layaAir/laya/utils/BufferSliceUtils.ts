
function arrayBufferSlice(this: ArrayBuffer, start: number, end: number): ArrayBuffer {
    var arrU8List: Uint8Array = new Uint8Array(this, start, end - start);
    var newU8List: Uint8Array = new Uint8Array(arrU8List.length);
    newU8List.set(arrU8List);
    return newU8List.buffer;
}

function uint8ArraySlice(this: Uint8Array): Uint8Array {
    var sz: number = this.length;
    var dec: Uint8Array = new Uint8Array(this.length);
    for (var i: number = 0; i < sz; i++) dec[i] = this[i];
    return dec;
}

function float32ArraySlice(this: Float32Array): Float32Array {
    var sz: number = this.length;
    var dec: Float32Array = new Float32Array(this.length);
    for (var i: number = 0; i < sz; i++) dec[i] = this[i];
    return dec;
}

function uint16ArraySlice(this: Uint16Array, ...arg: any[]): Uint16Array {
    var sz: number;
    var dec: Uint16Array;
    var i: number;
    if (arg.length === 0) {
        sz = this.length;
        dec = new Uint16Array(sz);
        for (i = 0; i < sz; i++)
            dec[i] = this[i];

    } else if (arg.length === 2) {
        var start: number = arg[0];
        var end: number = arg[1];

        if (end > start) {
            sz = end - start;
            dec = new Uint16Array(sz);
            for (i = start; i < end; i++)
                dec[i - start] = this[i];
        } else {
            dec = new Uint16Array(0);
        }
    }
    return dec;
}

ArrayBuffer.prototype.slice || (ArrayBuffer.prototype.slice = arrayBufferSlice);
Float32Array.prototype.slice || (Float32Array.prototype.slice = float32ArraySlice);
Uint16Array.prototype.slice || (Uint16Array.prototype.slice = uint16ArraySlice);
Uint8Array.prototype.slice || (Uint8Array.prototype.slice = uint8ArraySlice);