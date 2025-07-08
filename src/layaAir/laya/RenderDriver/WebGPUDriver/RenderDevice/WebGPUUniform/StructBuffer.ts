
/** use Doc
 * const { view, buffer, struct } = new wgsl.StructBuffer({
  ambient: 'vec3f', // vec{2,3,4}{f,h,u,i}
  lightCount: 'u32', // f32, f16, u32, i32
  lights: [
    {
      position: 'vec3f',
      range: 'f32',
      color: 'vec3f',
      intensity: 'f32',
    },
    4,
  ],
});
view.ambient.set([0, 0, 0]);
view.lightCount = 4;
view.lights.forEach(light => {
  light.position.set([1, 2, 3]);
  light.color.set([1, 1, 1]);
  light.range = 10;
  light.intensity = 0.8;
});
console.log(buffer);
console.log(wgsl.stringifyStruct('LightInfo', struct));
/** output
struct LightInfo_lights {
  position: vec3f,
  range: f32,
  color: vec3f,
  intensity: f32,
};
struct LightInfo {
  ambient: vec3f,
  lightCount: u32,
  lights: array<LightInfo_lights, 4>,
};
*/
//@ float16
//import type { Float16Array, Float16ArrayConstructor } from '@petamoriken/float16';

type NoEmptyRecord<T> = T & (keyof T extends never ? 'No empty object' : {});

//@ float16
// enum PrimitiveDataViewGet {
//   f16 = 'getFloat16',
//   f32 = 'getFloat32',
//   u32 = 'getUint32',
//   i32 = 'getInt32',
// }
enum PrimitiveDataViewGet {
  f32 = 'getFloat32',
  u32 = 'getUint32',
  i32 = 'getInt32',
}

//@ float16
// enum PrimitiveDataViewSet {
//   f16 = 'setFloat16',
//   f32 = 'setFloat32',
//   u32 = 'setUint32',
//   i32 = 'setInt32',
// }
enum PrimitiveDataViewSet {
  f32 = 'setFloat32',
  u32 = 'setUint32',
  i32 = 'setInt32',
}

export namespace wgsl {
  //@ float16
  // export enum PrimitiveToGPUVertexFormat {
  //   u32 = 'uint32',
  //   i32 = 'sint32',
  //   f32 = 'float32',
  //   vec2f = 'float32x2',
  //   vec3f = 'float32x3',
  //   vec4f = 'float32x4',
  //   vec2h = 'float16x2',
  //   vec4h = 'float16x4',
  //   vec2i = 'sint32x2',
  //   vec3i = 'sint32x3',
  //   vec4i = 'sint32x4',
  //   vec2u = 'uint32x2',
  //   vec3u = 'uint32x3',
  //   vec4u = 'uint32x4',
  // }
  export enum PrimitiveToGPUVertexFormat {
    u32 = 'uint32',
    i32 = 'sint32',
    f32 = 'float32',
    vec2f = 'float32x2',
    vec3f = 'float32x3',
    vec4f = 'float32x4',
    vec2i = 'sint32x2',
    vec3i = 'sint32x3',
    vec4i = 'sint32x4',
    vec2u = 'uint32x2',
    vec3u = 'uint32x3',
    vec4u = 'uint32x4',
  }


  const PrimitiveTypedArrayLenMap = Object.freeze({
    vec2: 2,
    vec3: 3,
    vec4: 4, // mat3x3 layout:  1 1 1 0
    mat3x3: 12, // = 48 / 4     1 1 1 0
    mat4x4: 16, //              1 1 1 0
  } as const);

  //@ float16
  // const PrimitiveAlignSize: { [K in Primitive]: { size: number; align: number } } = Object.freeze({
  //   f16: { size: 2, align: 2 },
  //   f32: { size: 4, align: 4 },
  //   u32: { size: 4, align: 4 },
  //   i32: { size: 4, align: 4 },

  //   vec2f: { size: 8, align: 8 },
  //   vec2u: { size: 8, align: 8 },
  //   vec2i: { size: 8, align: 8 },

  //   vec3f: { size: 12, align: 16 },
  //   vec3u: { size: 12, align: 16 },
  //   vec3i: { size: 12, align: 16 },

  //   vec4f: { size: 16, align: 16 },
  //   vec4u: { size: 16, align: 16 },
  //   vec4i: { size: 16, align: 16 },

  //   mat3x3f: { size: 48, align: 16 },
  //   mat4x4f: { size: 64, align: 16 },

  //   vec2h: { size: 4, align: 4 },
  //   vec3h: { size: 6, align: 8 },
  //   vec4h: { size: 8, align: 8 },
  //   mat3x3h: { size: 24, align: 8 },
  //   mat4x4h: { size: 32, align: 8 },
  // });

  const PrimitiveAlignSize: { [K in Primitive]: { size: number; align: number } } = Object.freeze({
    f32: { size: 4, align: 4 },
    u32: { size: 4, align: 4 },
    i32: { size: 4, align: 4 },

    vec2f: { size: 8, align: 8 },
    vec2u: { size: 8, align: 8 },
    vec2i: { size: 8, align: 8 },

    vec3f: { size: 12, align: 16 },
    vec3u: { size: 12, align: 16 },
    vec3i: { size: 12, align: 16 },

    vec4f: { size: 16, align: 16 },
    vec4u: { size: 16, align: 16 },
    vec4i: { size: 16, align: 16 },

    mat3x3f: { size: 48, align: 16 },
    mat4x4f: { size: 64, align: 16 },
  });

  //@ float16
  // export const SuffixTypedArrayMap = {
  //   h: undefined as unknown as Float16ArrayConstructor,
  //   f: Float32Array,
  //   u: Uint32Array,
  //   i: Int32Array,
  // } as const;
  export const SuffixTypedArrayMap = {
    f: Float32Array,
    u: Uint32Array,
    i: Int32Array,
  } as const;
  //@ float16
  // export type PrimitiveNumber = 'f16' | 'f32' | 'u32' | 'i32';
  // export type PrimitiveVector = `${'vec2' | 'vec3' | 'vec4'}${'f' | 'h' | 'u' | 'i'}`;
  // export type PrimitiveMatrix = `${'mat3x3' | 'mat4x4'}${'f' | 'h'}`;
  export type PrimitiveNumber = 'f32' | 'u32' | 'i32';
  export type PrimitiveVector = `${'vec2' | 'vec3' | 'vec4'}${'f' | 'u' | 'i'}`;
  export type PrimitiveMatrix = `${'mat3x3' | 'mat4x4'}${'f'}`;
  export type PrimitiveTypedArray = PrimitiveVector | PrimitiveMatrix;
  export type Primitive = PrimitiveNumber | PrimitiveTypedArray;
  // export type PrimitiveView = {
  //   f16: number;
  //   f32: number;
  //   u32: number;
  //   i32: number;
  //   vec2f: Float32Array;
  //   vec2u: Uint32Array;
  //   vec2i: Int32Array;
  //   vec3f: Float32Array;
  //   vec3u: Uint32Array;
  //   vec3i: Int32Array;
  //   vec4f: Float32Array;
  //   vec4u: Uint32Array;
  //   vec4i: Int32Array;
  //   mat4x4f: Float32Array;
  //   mat3x3f: Float32Array;
  //   vec2h: Float16Array;
  //   vec3h: Float16Array;
  //   vec4h: Float16Array;
  //   mat4x4h: Float16Array;
  //   mat3x3h: Float16Array;
  // };
  //@ float16
  export type PrimitiveView = {
    f32: number;
    u32: number;
    i32: number;
    vec2f: Float32Array;
    vec2u: Uint32Array;
    vec2i: Int32Array;
    vec3f: Float32Array;
    vec3u: Uint32Array;
    vec3i: Int32Array;
    vec4f: Float32Array;
    vec4u: Uint32Array;
    vec4i: Int32Array;
    mat4x4f: Float32Array;
    mat3x3f: Float32Array;
  };
  export type Array = [struct: Struct, length: number, runtimeSized?: boolean];
  export type Struct = { [k: string]: Primitive | Array | Struct };
  export type PlainStruct = { [k: string]: Exclude<Primitive, PrimitiveMatrix | 'f16' | 'vec3h'> };
  export type StructView<T extends Struct> = {
    [K in keyof T]: T[K] extends Struct
    ? StructView<T[K]>
    : T[K] extends Array
    ? StructView<T[K][0]>[]
    : T[K] extends Primitive
    ? PrimitiveView[T[K]]
    : never;
  };
  export type StructInfo<T extends Struct> = {
    [K in keyof T]: T[K] extends Struct
    ? StructInfo<T[K]>
    : T[K] extends Array
    ? StructInfo<T[K][0]>[]
    : T[K] extends Primitive
    ? { offset: number; size: number }
    : never;
  };

  export type PlainStructInfo<T extends PlainStruct> = {
    [K in keyof T]: { size: number; offset: number };
  };

  function nextAlign(current: number, align: number): number {
    let aligned = current - (current % align);
    if (current % align != 0) aligned += align;
    return aligned;
  }

  export function structSize<T extends Struct>(struct: T, ignoreAlign?: boolean): number {
    let stride = 0;
    for (const value of Object.values(struct)) {
      const { align, size } = structValueSizeAlign(value);
      stride = nextAlign(stride, ignoreAlign ? 1 : align) + size;
    }
    stride = nextAlign(stride, structAlign(struct, ignoreAlign));
    return stride;
  }

  function structValueSizeAlign(value: Primitive | Array | Struct) {
    let align: number, size: number, itemSize: number | undefined;
    if (Array.isArray(value)) {
      align = structAlign(value[0]);
      itemSize = structSize(value[0]);
      size = itemSize * value[1];
    } else if (typeof value === 'object') {
      align = structAlign(value);
      size = structSize(value);
    } else {
      ({ align, size } = PrimitiveAlignSize[value]);
    }
    return { align, size, itemSize: itemSize ?? size };
  }

  export function structAlign<T extends Struct>(struct: T, ignoreAlign?: boolean): number {
    if (ignoreAlign) return 1;
    return Math.max(
      ...Object.values(struct).map(value => {
        if (Array.isArray(value)) return structAlign(value[0]);
        else if (typeof value === 'object') return structAlign(value);
        else return PrimitiveAlignSize[value].align;
      }),
    );
  }

  export function structView<T extends Struct>(
    buffer: ArrayBuffer,
    struct: T,
    byteOffset = 0,
    ignoreAlign = false,
    info?: any,
  ): StructView<T> {
    const view: any = {};
    const dataView = new DataView(buffer);
    let stride = byteOffset;

    for (let [key, value] of Object.entries(struct)) {
      const { align, size, itemSize } = structValueSizeAlign(value);
      const offset = nextAlign(stride, ignoreAlign ? 1 : align);

      if (Array.isArray(value)) {
        const arrayView: any[] = new Array(value[1]);
        if (info) {
          const arrayInfo = [];
          for (let i = 0, il = value[1]; i < il; i++) {
            arrayInfo[i] = {};
            arrayView[i] = structView(
              buffer,
              value[0],
              offset + itemSize * i,
              ignoreAlign,
              arrayInfo[i],
            );
          }
          info[key] = arrayInfo;
        } else
          for (let i = 0, il = value[1]; i < il; i++) {
            arrayView[i] = structView(buffer, value[0], offset + itemSize * i, ignoreAlign);
          }
        Object.freeze(arrayView);
        view[key] = arrayView;
      } else if (typeof value === 'object') {
        if (info) info[key] = {};
        view[key] = structView(buffer, value, offset, ignoreAlign, info ? info[key] : undefined);
      } else {
        if (info) info[key] = { offset, size };
        if (value.startsWith('vec') || value.startsWith('mat')) {
          //@ float16
          //const suffixType = value[value.length - 1] as 'h' | 'f' | 'i' | 'u';
          const suffixType = value[value.length - 1] as 'f' | 'i' | 'u';
          const prefix = value.slice(0, -1) as `vec${'2' | '3' | '4'}` | `mat${'3x3' | '4x4'}`;
          const TypedArray = SuffixTypedArrayMap[suffixType];
          const length = PrimitiveTypedArrayLenMap[prefix];
          view[key] = new TypedArray(buffer, offset, length);
        } else {
          const numberValue = value as PrimitiveNumber;
          const get = PrimitiveDataViewGet[numberValue];
          const set = PrimitiveDataViewSet[numberValue];
          Object.defineProperty(view, key, {
            get(): number {
              return dataView[get](offset, true);
            },
            set(v: number) {
              dataView[set](offset, v, true);
            },
          });
        }
      }

      stride = offset + size;
    }
    Object.freeze(view);
    return view as StructView<T>;
  }

  export function plainStructInfo<T extends PlainStruct>(
    plainStruct: T,
    ignoreAlign?: boolean,
  ): PlainStructInfo<T> {
    const info: any = {};
    let stride = 0;
    for (let [key, value] of Object.entries(plainStruct)) {
      const { align, size } = structValueSizeAlign(value);
      const offset = nextAlign(stride, ignoreAlign ? 1 : align);
      info[key] = { offset, size };
      stride = offset + size;
    }
    return info;
  }

  // 更推荐使用 {} satisfies wgsl.Struct
  export function struct<T extends wgsl.Struct>(struct: T) {
    return struct;
  }

  export class StructBuffer<T extends wgsl.Struct> {
    buffer: Uint8Array;
    view: StructView<NoEmptyRecord<T>>;
    info?: StructInfo<NoEmptyRecord<T>>;
    constructor(public struct: NoEmptyRecord<T>, ignoreAlign?: boolean, genInfo?: boolean) {
      const byteLength = wgsl.structSize(struct, ignoreAlign);
      this.buffer = new Uint8Array(byteLength);
      if (genInfo) this.info = {} as StructInfo<NoEmptyRecord<T>>;
      this.view = wgsl.structView(this.buffer.buffer, struct, 0, ignoreAlign, this.info);
    }

    clone() {
      return new StructBuffer(this.struct);
    }
  }

  export function stringifyStruct<T extends wgsl.Struct>(
    name: string,
    struct: NoEmptyRecord<T>,
    structCache = new Map<string, { name: string; structStr: string }>(),
  ) {
    let structStr = `struct ${name} {
${Object.entries(struct)
        .map(([key, value]) => {
          let typeStr: string;
          if (Array.isArray(value)) {
            typeStr = `array<${name}_${key}${value[2] ? '' : `, ${value[1]}`}>`;
            if (!structCache.has(JSON.stringify(value[0]))) {
              stringifyStruct(`${name}_${key}`, value[0], structCache);
            }
          } else if (typeof value === 'object') {
            typeStr = `${name}_${key}`;
            if (!structCache.has(JSON.stringify(value))) {
              stringifyStruct(typeStr, value, structCache);
            }
          } else {
            typeStr = value;
          }
          return `  ${key}: ${typeStr},`;
        })
        .join('\n')}
};`;
    structCache.set(JSON.stringify(struct), { name, structStr });
    const subStruct = [...structCache.values()]
      .filter(i => i.name !== name)
      .map(i => i.structStr)
      .join('\n');
    return subStruct + '\n' + structStr;
  }
}
