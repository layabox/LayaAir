import { Color } from "../../maths/Color";
import { Vector3 } from "../../maths/Vector3";
import { TextureCubeFace } from "../../resource/TextureCube";

/**
 * @en Second-order spherical harmonics function.
 * @zh 二阶球谐函数。
 */
export class SphericalHarmonicsL2 {
    /** @internal */
    static _default: SphericalHarmonicsL2 = new SphericalHarmonicsL2();

    /** @internal */
    private _coefficients: Float32Array = new Float32Array(27);

    /**
     * @en Gets the coefficient for a specific color channel.
     * @param i The channel index, ranging from 0 to 2.
     * @param j The coefficient index, ranging from 0 to 8.
     * @returns The coefficient value.
     * @zh 获取特定颜色通道的系数。
     * @param i 通道索引，范围0到2。
     * @param j 系数索引，范围0到8。
     * @returns 系数值。
     */
    getCoefficient(i: number, j: number): number {
        return this._coefficients[i * 9 + j];
    }

    /**
     * @en Sets the coefficient for a specific color channel.
     * @param i The channel index, ranging from 0 to 2.
     * @param j The coefficient index, ranging from 0 to 8.
     * @param coefficient The coefficient value to set.
     * @zh 设置特定颜色通道的系数。
     * @param i 通道索引，范围0到2。
     * @param j 系数索引，范围0到8。
     * @param coefficient 要设置的系数值。
     */
    setCoefficient(i: number, j: number, coefficient: number): void {
        this._coefficients[i * 9 + j] = coefficient;
    }

    /**
     * @en Sets the coefficients for a specific color channel.
     * @param i The channel index, ranging from 0 to 2.
     * @param coefficient0 Coefficient 0
     * @param coefficient1 Coefficient 1
     * @param coefficient2 Coefficient 2
     * @param coefficient3 Coefficient 3
     * @param coefficient4 Coefficient 4
     * @param coefficient5 Coefficient 5
     * @param coefficient6 Coefficient 6
     * @param coefficient7 Coefficient 7
     * @param coefficient8 Coefficient 8
     * @zh 设置颜色通道的系数。
     * @param i 通道索引，范围0到2。
     * @param coefficient0 系数0
     * @param coefficient1 系数1
     * @param coefficient2 系数2
     * @param coefficient3 系数3
     * @param coefficient4 系数4
     * @param coefficient5 系数5
     * @param coefficient6 系数6
     * @param coefficient7 系数7
     * @param coefficient8 系数8
     */
    setCoefficients(i: number, coefficient0: number, coefficient1: number, coefficient2: number, coefficient3: number, coefficient4: number, coefficient5: number, coefficient6: number, coefficient7: number, coefficient8: number): void {
        var offset: number = i * 9;
        this._coefficients[offset] = coefficient0;
        this._coefficients[++offset] = coefficient1;
        this._coefficients[++offset] = coefficient2;
        this._coefficients[++offset] = coefficient3;
        this._coefficients[++offset] = coefficient4;
        this._coefficients[++offset] = coefficient5;
        this._coefficients[++offset] = coefficient6;
        this._coefficients[++offset] = coefficient7;
        this._coefficients[++offset] = coefficient8;
    }

    /**
     * @en Clones the spherical harmonics data to another instance.
     * @param dest The destination instance to which the data is cloned.
     * @zh 克隆球谐函数数据到另一个实例。
     * @param dest 克隆数据的目标实例。
     */
    cloneTo(dest: SphericalHarmonicsL2): void {
        if (this === dest)
            return;
        var coes: Float32Array = this._coefficients;
        var destCoes: Float32Array = dest._coefficients;
        for (var i: number = 0; i < 27; i++)
            destCoes[i] = coes[i];
    }
}

/**
 * @internal
 * @en The `SphericalHarmonicsL2Generater` class is used for generating second-order spherical harmonics coefficients.
 * @zh `SphericalHarmonicsL2Generater` 类用于生成二阶球谐系数。
 */
export class SphericalHarmonicsL2Generater {

    private static _tempSHR: Float32Array = new Float32Array(9);
    private static _tempSHG: Float32Array = new Float32Array(9);
    private static _tempSHB: Float32Array = new Float32Array(9);

    /**
     * k0: 1/2  * sqrt(1/Pi)
     * k1: 1/3  * sqrt(3/Pi)
     * k2: 1/8  * sqrt(15/Pi)
     * k3: 1/16 * sqrt(5/Pi)
     * k4: 1/16 * sqrt(15/Pi)
     * [
     *  k0,
     * -k1, k1, k1
     * k2, -k2, k3, -k2, k4
     * ]
     */
    private static readonly k = [
        0.28209479177387814347,
        -0.32573500793527994772, 0.32573500793527994772, -0.32573500793527994772,
        0.27313710764801976764, -0.27313710764801976764, 0.07884789131313000151, -0.27313710764801976764, 0.13656855382400988382
    ]

    /** @internal */
    static readonly GradientSimulateSize: number = 3;
    /** @internal */
    static readonly SH_Count: number = 9;

    private static _tempSkyPixels: Float32Array = new Float32Array(SphericalHarmonicsL2Generater.GradientSimulateSize * SphericalHarmonicsL2Generater.GradientSimulateSize * 3);
    private static _tempEquatorPixels: Float32Array = new Float32Array(SphericalHarmonicsL2Generater.GradientSimulateSize * SphericalHarmonicsL2Generater.GradientSimulateSize * 3);
    private static _tempGroundPixels: Float32Array = new Float32Array(SphericalHarmonicsL2Generater.GradientSimulateSize * SphericalHarmonicsL2Generater.GradientSimulateSize * 3);

    /**
     * @internal
     * @en Calculates the surface area corresponding to the uv coordinates on a sphere.
     * @param u The u coordinate.
     * @param v The v coordinate.
     * @returns The surface area.
     * @zh 计算球面上uv坐标对应的立体角。
     * @param u u坐标。
     * @param v v坐标。
     * @returns 立体角。
     */
    static surfaceArea(u: number, v: number) {
        return Math.atan2(u * v, Math.sqrt(u * u + v * v + 1.0));
    }

    /**
     * @en Converts uv coordinates to a direction vector based on the cube face.
     * @param u The u coordinate.
     * @param v The v coordinate.
     * @param face The cube map face.
     * @param out_dir The resulting direction vector.
     * @zh 根据立方体贴图面将uv坐标转换为方向向量。
     * @param u u坐标。
     * @param v v坐标。
     * @param face 立方体贴图面。
     * @param out_dir 输出的方向向量。
     */
    static uv2Dir(u: number, v: number, face: TextureCubeFace, out_dir: Vector3) {
        switch (face) {
            case TextureCubeFace.PositiveX:
                out_dir.x = 1.0;
                out_dir.y = -v;
                out_dir.z = -u;
                break;
            case TextureCubeFace.NegativeX:
                out_dir.x = -1.0;
                out_dir.y = -v;
                out_dir.z = u;
                break;
            case TextureCubeFace.PositiveY:
                out_dir.x = u;
                out_dir.y = 1.0;
                out_dir.z = v;
                break;
            case TextureCubeFace.NegativeY:
                out_dir.x = u;
                out_dir.y = -1.0;
                out_dir.z = -v;
                break;
            case TextureCubeFace.PositiveZ:
                out_dir.x = u;
                out_dir.y = -v;
                out_dir.z = 1.0;
                break;
            case TextureCubeFace.NegativeZ:
                out_dir.x = -u;
                out_dir.y = -v;
                out_dir.z = -1.0;
                break;
            default:
                break;
        }
    }

    /**
     * @internal
     * @en Evaluates the spherical harmonics function for given coefficients.
     * @param i The coefficient index.
     * @param x The x component of the direction vector.
     * @param y The y component of the direction vector.
     * @param z The z component of the direction vector.
     * @returns The evaluated value.
     * @zh 根据给定的系数评估球谐函数。
     * @param i 系数索引。
     * @param x 方向向量的x分量。
     * @param y 方向向量的y分量。
     * @param z 方向向量的z分量。
     * @returns 评估值。
     */
    static sh_eval_9(i: number, x: number, y: number, z: number) {
        const sqrt = Math.sqrt;
        const M_PI = Math.PI;
        switch (i) {
            case 0:
                return 0.5 * sqrt(1.0 / M_PI);
            case 1:
                return -y * 0.5 * sqrt(3.0 / M_PI);
            case 2:
                return z * 0.5 * sqrt(3.0 / M_PI);
            case 3:
                return -x * 0.5 * sqrt(3.0 / M_PI);
            case 4:
                return x * y * 0.5 * sqrt(15.0 / M_PI);
            case 5:
                return -y * z * 0.5 * sqrt(15.0 / M_PI);
            case 6:
                return (3.0 * z * z - 1.0) * 0.25 * sqrt(5.0 / M_PI);
            case 7:
                return -x * z * 0.5 * sqrt(15.0 / M_PI);
            case 8:
                return (x * x - y * y) * 0.25 * sqrt(15.0 / M_PI);
            default:
                return 0;
        }
    }

    /**
     * @internal
     * @en Calculates the ambient light coefficients from cubemap pixel values.
     * @param cubemapPixels The cubemap pixel data for each face.
     * @param pixelComponentSize The number of components per pixel.
     * @param cubemapSize The size of the cubemap.
     * @param isGamma Whether the pixel data is in gamma color space.
     * @zh 从立方体贴图像素值计算环境光照系数。
     * @param cubemapPixels 立方体贴图的每个面的像素数据。
     * @param pixelComponentSize 每像素数据量。
     * @param cubemapSize 立方体贴图的大小。
     * @param isGamma 像素数据是否为伽马颜色空间。
     */
    static CalCubemapSH(cubemapPixels: Float32Array[], pixelComponentSize: number, cubemapSize: number, isGamma: boolean = true): SphericalHarmonicsL2 {

        let width = cubemapSize;
        let height = cubemapSize;

        let shr = this._tempSHR.fill(0);
        let shg = this._tempSHG.fill(0);
        let shb = this._tempSHB.fill(0);

        let dir = new Vector3();
        for (let face = 0; face < 6; face++) {

            let facePixels = cubemapPixels[face];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {

                    let px = x + 0.5;
                    let py = y + 0.5;

                    let u = 2.0 * (px / width) - 1.0;
                    let v = 2.0 * (py / height) - 1.0;

                    let dx = 1.0 / width;
                    let dy = 1.0 / height;
                    // 4个点 uv 分布
                    let x0 = u - dx;
                    let y0 = v - dy;
                    let x1 = u + dx;
                    let y1 = v + dy;

                    // 当前纹素立体角
                    let da = this.surfaceArea(x0, y0) - this.surfaceArea(x0, y1) - this.surfaceArea(x1, y0) + this.surfaceArea(x1, y1);

                    this.uv2Dir(u, v, face, dir);
                    Vector3.normalize(dir, dir);

                    let pixelOffset = (x + y * width) * pixelComponentSize;
                    let r = facePixels[pixelOffset];
                    let g = facePixels[pixelOffset + 1];
                    let b = facePixels[pixelOffset + 2];
                    if (isGamma) {
                        r = Color.gammaToLinearSpace(r);
                        g = Color.gammaToLinearSpace(g);
                        b = Color.gammaToLinearSpace(b);
                    }

                    for (let s = 0; s < this.SH_Count; s++) {
                        let sh_val = this.sh_eval_9(s, dir.x, dir.y, dir.z);
                        shr[s] += r * sh_val * da;
                        shg[s] += g * sh_val * da;
                        shb[s] += b * sh_val * da;
                    }
                }
            }
        }

        let sh = new SphericalHarmonicsL2();

        for (let index = 0; index < this.SH_Count; index++) {
            let scale = this.k[index];

            let r = shr[index];
            sh.setCoefficient(0, index, r * scale);

            let g = shg[index];
            sh.setCoefficient(1, index, g * scale);

            let b = shb[index];
            sh.setCoefficient(2, index, b * scale);
        }

        return sh;
    }

    /**
     * @internal
     * @en Calculate the ambient lighting coefficient based on sky color, horizon color, and ground color
     * @param skyColor The color of the sky.
     * @param equatorColor The color of the equator.
     * @param groundColor The color of the ground.
     * @param isGamma Whether the colors are in gamma color space.
     * @zh 通过 天空颜色, 地平线颜色, 地面颜色计算环境光照系数
     * @param skyColor 天空颜色。
     * @param equatorColor 地平线颜色。
     * @param groundColor 地面颜色。
     * @param isGamma 颜色是否为伽马空间。
     */
    static CalGradientSH(skyColor: Vector3, equatorColor: Vector3, groundColor: Vector3, isGamma: boolean = true): SphericalHarmonicsL2 {

        console.time("Gradient SH");

        let skyPixels = this._tempSkyPixels;
        let equatorPixels = this._tempEquatorPixels;
        let groundPixels = this._tempGroundPixels;

        const fillPixelBuffer = (float32: Float32Array, color: Vector3, isGamma: boolean) => {
            let fillColor = new Color(color.x, color.y, color.z, 1.0);
            if (isGamma) {
                fillColor.toLinear(fillColor);
            }
            let r = Math.min(fillColor.r, 1.0);
            let g = Math.min(fillColor.g, 1.0);
            let b = Math.min(fillColor.b, 1.0);
            for (let index = 0; index < float32.length; index += 3) {
                float32[index] = r;
                float32[index + 1] = g;
                float32[index + 2] = b;
            }
        }

        fillPixelBuffer(skyPixels, skyColor, isGamma);
        fillPixelBuffer(equatorPixels, equatorColor, isGamma);
        fillPixelBuffer(groundPixels, groundColor, isGamma);

        let gradientPixles = [];
        gradientPixles[TextureCubeFace.PositiveY] = skyPixels;
        gradientPixles[TextureCubeFace.NegativeY] = groundPixels;
        gradientPixles[TextureCubeFace.PositiveX] = equatorPixels;
        gradientPixles[TextureCubeFace.NegativeX] = equatorPixels;
        gradientPixles[TextureCubeFace.PositiveZ] = equatorPixels;
        gradientPixles[TextureCubeFace.NegativeZ] = equatorPixels;

        let sh = SphericalHarmonicsL2Generater.CalCubemapSH(gradientPixles, 3, this.GradientSimulateSize, false);

        console.timeEnd("Gradient SH");
        return sh;
    }
}