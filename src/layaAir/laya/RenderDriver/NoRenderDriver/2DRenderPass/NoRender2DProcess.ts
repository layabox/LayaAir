import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { SingletonList } from "../../../utils/SingletonList";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderCMD, SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { NoRenderSetRenderData, NoRenderSetShaderDefine } from "../DriverDevice/NoRenderDeviceFactory";
import { IRender2DDataHandle, I2DPrimitiveDataHandle, I2DBaseRenderDataHandle, IMesh2DRenderDataHandle, IGlobalRenderData, ISpineRenderDataHandle} from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRender2DPass } from "../../RenderModuleData/Design/2D/IRender2DPass";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";


export class NoRender2DProcess implements I2DRenderPassFactory {
    create2DGlobalRenderDataHandle(): IGlobalRenderData {
        return null;
    }
    createSpineRenderDataHandle(): ISpineRenderDataHandle {
        throw new Error("Method not implemented.");
    }
    createRender2DPass(): IRender2DPass {
        return null;
    }
    createRenderStruct2D(): IRenderStruct2D {
        return null;
    }
    createRender2DDataHandle(): IRender2DDataHandle {
        return null;
    }
    create2D2DPrimitiveDataHandle(): I2DPrimitiveDataHandle {
        return null;
    }
    create2DBaseRenderDataHandle(): I2DBaseRenderDataHandle {
        return null;
    }
    createMesh2DRenderDataHandle(): IMesh2DRenderDataHandle {
        return null;
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new NoRenderSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new NoRenderSetShaderDefine();
    }
    createBlit2DQuadCMDData(): Blit2DQuadCMD {
        return new NoRenderBlit2DquadCMD();
    }
    createDraw2DElementCMDData(): Draw2DElementCMD {
        return new NoRenderDraw2DElementCMD();
    }
    createSetRendertarget2DCMD(): SetRendertarget2DCMD {
        return new NoRenderSetRendertarget2DCMD();
    }
    createRenderElement2D(): IRenderElement2D {
        return new NoRenderElement2D()
    }
    createRenderContext2D(): IRenderContext2D {
        return new NoRenderContext2D();
    }

}

export class NoRenderElement2D implements IRenderElement2D {
    owner: IRenderStruct2D;
    nodeCommonMap: string[];
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;
    destroy(): void {

    }

}

export class NoRenderContext2D implements IRenderContext2D {
    passData: ShaderData;
    getRenderTarget(): InternalRenderTarget {
        return null;
    }

    sceneData: ShaderData;
    invertY: boolean;
    pipelineMode: string;
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void {

    }
    setOffscreenView(width: number, height: number): void {

    }
    drawRenderElementOne(node: IRenderElement2D): void {

    }
    drawRenderElementList(list: SingletonList<IRenderElement2D>): number {
        return 0;
    }
    runOneCMD(cmd: IRenderCMD): void {
    }
    runCMDList(cmds: IRenderCMD[]): void {
    }
}

export class NoRenderBlit2DquadCMD extends Blit2DQuadCMD {
    apply(context: IRenderContext2D): void {
    }
}

export class NoRenderDraw2DElementCMD extends Draw2DElementCMD {
    setRenderelements(value: IRenderElement2D[]): void {
    }
    apply(context: IRenderContext2D): void {
    }
}

export class NoRenderSetRendertarget2DCMD extends SetRendertarget2DCMD {
    apply(context: IRenderContext2D): void {
    }
}


