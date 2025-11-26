import { ComputeShaderProcessInfo, IComputeShader } from "../../../DriverDesign/RenderDevice/ComputeShader/IComputeShader";
import { IDefineDatas } from "../../../RenderModuleData/Design/IDefineDatas";
import { GLESCommandUniformMap } from "../GLESCommandUniformMap";

/**
 * OpenGL ES计算着色器实现
 * 管理计算着色器的编译、内核函数和uniform映射
 */
export class GLESComputeShader implements IComputeShader {
    /** ID计数器 */
    static idCounter: number = 0;

    /** 着色器唯一ID */
    private _id: number = GLESComputeShader.idCounter++;

    /** 原生着色器对象 */
    private _nativeObj: any;

    /** 着色器名称 */
    name: string;

    /** 是否编译完成 */
    compilete: boolean = false;

    /** 内核函数集合 */
    private _kernels: Set<string> = new Set();

    /** uniform命令映射 */
    uniformCommandMap: GLESCommandUniformMap[] = [];

    /** uniform绑定信息映射 */
    uniformBindingMap: Map<number, any> = new Map();

    constructor(name: string) {
        this.name = name;
        // 创建原生OpenGL ES计算着色器对象
        this._nativeObj = new (window as any).conchGLESComputeShader(this.name);
    }

    /**
     * 移除内核函数
     * @param kernel 内核函数名称
     */
    removeKernel(kernel: string): void {
        this._kernels.delete(kernel);
    }

    /**
     * 获取所有内核函数
     * @returns 内核函数数组
     */
    getKernels(): string[] {
        return Array.from(this._kernels);
    }

    /**
     * 编译计算着色器
     * @param info 着色器编译信息
     */
    compile(info: ComputeShaderProcessInfo): void {
        try {
            // 获取着色器代码和其他信息
            const node = info.node;
            const defineData = info.defineData;
            const other = info.uniformMaps;

            // 处理uniform映射信息
            if (other && Array.isArray(other)) {
                this.uniformCommandMap = other as GLESCommandUniformMap[];

                // 创建uniform绑定映射
                for (let i = 0, n = this.uniformCommandMap.length; i < n; i++) {
                    const commandMap = this.uniformCommandMap[i];
                    this.uniformBindingMap.set(i, {
                        stateName: commandMap.constructor.name,
                        hasUniformBuffer: true,
                        bindingPoint: i
                    });
                }
            }

            // todo
            const code = "";

            // 调用原生方法编译着色器
            const success = this._nativeObj.compile(code, defineData);

            if (success) {
                this.compilete = true;
            } else {
                throw new Error(`Failed to compile compute shader: ${this.name}`);
            }

        } catch (error) {
            console.error(`GLESComputeShader compile error:`, error);
            this.compilete = false;
            throw error;
        }
    }

    /**
     * 获取计算着色器程序对象
     * @param kernel 内核函数名称
     * @returns 着色器程序对象
     */
    getProgram(kernel: string): any {
        return this._nativeObj.getProgram(kernel);
    }

    /**
     * 绑定计算着色器到OpenGL上下文
     * @param kernel 使用的内核函数名称
     */
    bind(kernel: string = 'main'): void {
        if (!this.compilete) {
            throw new Error(`Compute shader '${this.name}' is not compiled`);
        }
        this._nativeObj.bind(kernel);
    }

    /**
     * 解绑计算着色器
     */
    unbind(): void {
        this._nativeObj.unbind();
    }

    /**
     * 设置uniform值
     * @param location uniform位置
     * @param value 值
     */
    setUniform(location: number, value: any): void {
        this._nativeObj.setUniform(location, value);
    }

    /**
     * 获取uniform位置
     * @param name uniform名称
     * @returns uniform位置
     */
    getUniformLocation(name: string): number {
        return this._nativeObj.getUniformLocation(name);
    }

    /**
     * 获取着色器ID
     */
    get id(): number {
        return this._id;
    }

    /**
     * 获取原生着色器对象
     */
    get nativeObj(): any {
        return this._nativeObj;
    }

    /**
     * 销毁计算着色器
     */
    destroy(): void {
        if (this._nativeObj) {
            this._nativeObj.release();
            //this._nativeObj = null;
        }

        this._kernels.clear();
        this.uniformCommandMap = [];
        this.uniformBindingMap.clear();
        this.compilete = false;
    }
} 