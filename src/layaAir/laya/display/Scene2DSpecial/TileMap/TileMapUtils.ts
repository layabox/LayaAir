import { Matrix } from "../../../maths/Matrix";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { TileShape } from "./TileMapEnum";

const flipHByte = 1 << 30;
const flipVByte = 1 << 29;
const transposeByte = 1 << 28;
const rotateByte = 7 << 24;
const indexByte = 0xff << 16;
const nativeIdByte = 0xffff;

const flipByte = 0xff << 24;

//gid 存储数据 30位flip_h 29位flip_v 28位transpose 24-27位rotate 16-23位index 0-15位nativeId

// gid  16-23位index 0-15位nativeId

export class TileMapUtils {

    private static indexByteOffset: number = 16;


    // 或者旋转次数
    public static getRotateCount(gid: number): number { return (gid & rotateByte) >> 26; }

    //是否垂直翻转
    public static getFlipH(gid: number): boolean { return (gid & flipHByte) != 0; }

    // 是否水平翻转
    public static getFlipV(gid: number): boolean { return (gid & flipVByte) != 0; }

    // 是否转置
    public static getTranspose(gid: number): boolean { return (gid & transposeByte) != 0; }

    //获得翻转id
    public static getFlip(gid: number): number { return (gid & flipByte) >> 24; }


    //获得Gid
    // public static getGid = function(cellindex: number, nativeId: number,flip_h: boolean =false, flip_v: boolean =false, transpose: boolean = false, rotateCount: number = 0): number {
    //     let id = 0;
    //     if (flip_h) {
    //         id += flipHByte;
    //     }
    //     if (flip_v) {
    //         id += flipVByte;
    //     }
    //     if (transpose) {
    //         id += transposeByte;
    //     }
    //     id += rotateCount*rotateByte;

    //     id += cellindex*indexByte;

    //     return  id + nativeId;
    // }


    //获得原始NativeId
    public static getNativeId(gid: number): number { return gid & 0xFFFF; }

    //获得CellIndex
    public static getCellIndex(gid: number): number { return (gid >> TileMapUtils.indexByteOffset) & 0xFF; }

    //获得Gid 16-23位index 0-15位nativeId
    public static getGid(cellindex: number, nativeId: number): number {
        return (cellindex << TileMapUtils.indexByteOffset) + nativeId;
    }

    //二分查找队列中所在值的位置
    public static quickFoundIndex(array: number[], value: number): number {
        let mid = 0;
        let startindex = 0;
        let endindex = array.length - 1;
        if (value < array[startindex] || value >= array[endindex]) { return -1; }
        while (startindex + 1 < endindex) {
            mid = Math.floor((startindex + endindex) / 2);
            if (array[mid] == value) {
                return mid;
            } else if (array[mid] > value) {
                endindex = mid;
            } else {
                startindex = mid;
            }
        }
        return startindex;
    }

    // 旋转弧度 六边形旋转每次旋转60度，四边形旋转每次旋转90度
    public static getRotateAngle(rotateCount: number, tileShape: TileShape): number {
        let maxCount = tileShape == TileShape.TILE_SHAPE_HEXAGON ? 6 : 4;
        rotateCount = Math.floor(rotateCount) % maxCount;
        if (rotateCount < 0) {
            rotateCount += maxCount;
        }
        return Math.PI * 2 * rotateCount / maxCount;
    }

    /**
    * 对格子进行uv翻转
    * 先做45度斜角翻转，然后再做水平或者垂直翻转,最后再旋转 (六边形旋转每次旋转60度，四边形旋转每次旋转90度)
    * @param flip_v 水平翻转
    * @param flip_h 垂直翻转
    * @param transpose 斜角翻转
    * @param rountCount 旋转次数
    */
    public static getUvRotate( tileshape: TileShape, flip_v: boolean = false, flip_h: boolean = false, transpose: boolean = false, rountCount: number = 0): Vector4 {
        let vx = 1;
        let vy = transpose ? -1 : 1;
        const dx = (vx + vy) * 0.5;
        const dy = (vx - vy) * 0.5;
        vx = flip_v ? -1 : 1;
        vy = flip_h ? -1 : 1;
        let rotate = -this.getRotateAngle(rountCount, tileshape);
        const cos = Math.cos(rotate);
        const sin = Math.sin(rotate);
        let out = Vector4.tempVec4;
        out.x = cos * vx * dx - sin * vx * dy;
        out.y = cos * vy * dy - sin * vy * dx;
        out.z = sin * vx * dx + cos * vx * dy;
        out.w = sin * vy * dy + cos * vy * dx;
        return out;
    }

    public static transfromPointByValue(matrix: Matrix, x: number, y: number, point: Vector2) {
        point.x = matrix.a * x + matrix.c * y + matrix.tx;
        point.y = matrix.b * x + matrix.d * y + matrix.ty;
    }

    public static  transfromPointNByValue(matrix: Matrix, x: number, y: number, point: Vector2) {
        point.x = matrix.a * x + matrix.c * y ;
        point.y = matrix.b * x + matrix.d * y ;
    }

}