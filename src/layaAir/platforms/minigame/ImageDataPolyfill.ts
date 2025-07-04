import { Browser } from "../../laya/utils/Browser";

/** @internal */
function ImageDataPolyfill() {
    let width, height, data: Uint8ClampedArray;
    if (arguments.length == 3) {
        if (arguments[0] instanceof Uint8ClampedArray) {
            if (arguments[0].length % 4 !== 0) {
                throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of 4.");
            }
            if (arguments[0].length !== arguments[1] * arguments[2] * 4) {
                throw new Error("Failed to construct 'ImageData': The input data length is not equal to (4 * width * height).");
            } else {
                data = arguments[0];
                width = arguments[1];
                height = arguments[2];
            }
        } else {
            throw new Error("Failed to construct 'ImageData': parameter 1 is not of type 'Uint8ClampedArray'.");
        }
    } else if (arguments.length == 2) {
        width = arguments[0];
        height = arguments[1];
        data = new Uint8ClampedArray(arguments[0] * arguments[1] * 4);
    } else if (arguments.length < 2) {
        throw new Error("Failed to construct 'ImageData': 2 arguments required, but only " + arguments.length + " present.");
    }

    let imgdata = Browser.canvas.context.getImageData(0, 0, width, height);
    let arr = imgdata.data;
    for (let i = 0, n = data.length; i < n; i++)
        arr[i] = data[i];
    return imgdata;
}

if (!window.ImageData) {
    //@ts-ignore
    window.ImageData = ImageDataPolyfill;
}