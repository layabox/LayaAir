import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { ParticleInfo } from "../common/ParticlePool";

export enum Particle2DVertex {
    PositionAndUV = 0,

    /**
     * vec4;
     * x: texture sheet start frame index
     * y: texture sheet frame count
     * z: texture sheet Row index
     */
    SheetFrameData = 7,
    /**
     * vec4;
     * x: direction x,
     * y: direction y,
     * z: position x,
     * w: position y
     */
    DirectionAndPosition = 8,

    /**
     * vec4;
     * x: size x,
     * y: size y,
     * z: emit time,
     * w: lifetime
     */
    SizeAndTimes = 9,

    /**
     * vec4;
     * x: direction speed,
     * y: space,
     * z: mesh rot cos,
     * w: mesh rot sin
     */
    SpeedSpaceAndRot = 10,

    /**
     * vec4 
     * start color
     */
    StartColor = 11,

    /**
     * vec4;
     * x: sprite rotation cos,
     * y: sprite rotation sin,
     * z: sprite scale x,
     * w: sprite scale y
     */
    RotationAndScale = 12,

    /**
     * vec4 
     * x: sprite translate x,
     * y: sprite translate y,
     * z: gravity X,
     * w: gravity Y
     */
    TransAndGravity = 13,

    /**
     * vec4
     * x: color random,
     * y: velocity x random,
     * z: velocity y random,
     * w: rotation random
     */
    Random0 = 14,

    /**
     * vec4
     * x: SizeOverLifetime x random,
     * y: SizeOverLifetime y random,
     * z: texture sheet animation frame random,
     */
    Random1 = 15,
}

class Particle2D {

    readonly data: Float32Array;

    constructor() {
        let particleStride = Particle2DVertexMesh.Particle2DDeclaration.vertexStride;
        let buffer = new ArrayBuffer(particleStride);
        this.data = new Float32Array(buffer);
    }

    setDirection(x: number, y: number) {
        this.data[0] = x;
        this.data[1] = y;
    }

    setPosition(x: number, y: number) {
        this.data[2] = x;
        this.data[3] = y;
    }

    setSize(x: number, y: number) {
        this.data[4] = x;
        this.data[5] = y;
    }

    setEmitTime(emitTime: number) {
        this.data[6] = emitTime;
    }

    setLifetime(lifetime: number) {
        this.data[7] = lifetime;
    }

    setSpeed(speed: number) {
        this.data[8] = speed;
    }


    setSimulationSpace(space: number) {
        this.data[9] = space;
    }

    setRot(cos: number, sin: number) {
        this.data[10] = cos;
        this.data[11] = sin;
    }

    setColor(r: number, g: number, b: number, a: number) {
        this.data[12] = r;
        this.data[13] = g;
        this.data[14] = b;
        this.data[15] = a;
    }

    setSpriteRotAndScale(x: number, y: number, z: number, w: number) {
        this.data[16] = x;
        this.data[17] = y;
        this.data[18] = z;
        this.data[19] = w;
    }

    setSpriteTrans(x: number, y: number) {
        this.data[20] = x;
        this.data[21] = y;
    }

    setGravity(gravityX: number, gravityY: number) {
        this.data[22] = gravityX;
        this.data[23] = gravityY;
    }

    setRandom(x: number, y: number, z: number, w: number) {
        this.data[24] = x;
        this.data[25] = y;
        this.data[26] = z;
        this.data[27] = w;
    }

    setRandom1(x: number, y: number, z: number, w: number) {
        this.data[28] = x;
        this.data[29] = y;
        this.data[30] = z;
        this.data[31] = w;
    }

    setSheetFrameData(x: number, y: number, z: number, w: number) {
        this.data[32] = x;
        this.data[33] = y;
        this.data[34] = z;
        this.data[35] = w;
    }
}

export class Particle2DVertexMesh {

    static Particle2DDeclaration: VertexDeclaration;

    static Particle2DMeshDeclaration: VertexDeclaration;

    static Particle2DInfo: ParticleInfo;

    static TempParticle2D: Particle2D;

    static init() {

        let particle2DElements = [
            {
                usage: Particle2DVertex.DirectionAndPosition,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.SizeAndTimes,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.SpeedSpaceAndRot,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.StartColor,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.RotationAndScale,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.TransAndGravity,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.Random0,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.Random1,
                format: VertexElementFormat.Vector4
            },
            {
                usage: Particle2DVertex.SheetFrameData,
                format: VertexElementFormat.Vector4
            }
        ];

        Particle2DVertexMesh.Particle2DDeclaration = createVertexVertexDeclaration(particle2DElements);

        let particle2DMeshElements = [
            {
                usage: Particle2DVertex.PositionAndUV,
                format: VertexElementFormat.Vector4
            },
        ]
        Particle2DVertexMesh.Particle2DMeshDeclaration = createVertexVertexDeclaration(particle2DMeshElements);

        Particle2DVertexMesh.TempParticle2D = new Particle2D();

        let particleInfo = Particle2DVertexMesh.Particle2DInfo = new ParticleInfo();
        let declaration = Particle2DVertexMesh.Particle2DDeclaration;
        particleInfo.timeIndex = declaration.getVertexElementByUsage(Particle2DVertex.SizeAndTimes).offset / 4 + 2;
        particleInfo.lifetimeIndex = declaration.getVertexElementByUsage(Particle2DVertex.SizeAndTimes).offset / 4 + 3;
    }

}

function getVertexFormatStride(format: string) {

    switch (format) {
        case VertexElementFormat.Vector4:
            return 16;
        case VertexElementFormat.Vector3:
            return 12;
        case VertexElementFormat.Vector2:
            return 8;
        default:
            throw new Error("Unkonw vertex format.");
    }

}

function createVertexVertexDeclaration(vertexElements: { usage: number, format: string }[]) {
    let stride = 0;
    let elements = [];
    for (let i = 0; i < vertexElements.length; i++) {
        let element = vertexElements[i];
        let offset = stride;

        let elementStride = getVertexFormatStride(element.format);
        if (elementStride > 0) {
            elements.push(new VertexElement(offset, element.format, element.usage));
            stride += elementStride;
        }
    }
    return new VertexDeclaration(stride, elements);
}