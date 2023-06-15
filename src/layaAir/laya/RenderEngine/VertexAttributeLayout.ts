import { VertexBuffer } from "./VertexBuffer";
//vertex Layout cache pool
export interface VAElement { format: string, stride: number, shaderLocation: number };
export class VertexAttributeLayout {
    static IPoint: number = 0;
    static _pool: { [key: number]: VertexAttributeLayout } = {};

    static getVertexLayoutByPool(vertexs: VertexBuffer[]) {
        let pool =VertexAttributeLayout._pool;
        for(var i in pool){
            let layout = pool[i];
            if(layout.deepthEqaul(vertexs)){
                return layout
            }
        }
        return new VertexAttributeLayout(vertexs);
    }

    /**
     * vertex attribute byte size Array
     */
    attributeByteSize:Array<number>;

    /**
     * vertex Layout des
     */
    VAElements: Array<VAElement[]>;

    instanceMode:Array<boolean>;
    /**
     * pool index
     */
    id: number;

    

    /**
     * instance one VertexAttributeLayout
     * @param vertexs 
     */
    constructor(vertexs: VertexBuffer[]) {
        this.VAElements = new Array();
        this.attributeByteSize = new Array();
        this.instanceMode = new Array();
        //this.VAElements.length = vertexs.length;
        for (let i = 0; i < vertexs.length; i++) {
            let vaelements: VAElement[] = [];
            let oneAttributeSize = vertexs[i].vertexDeclaration.vertexStride;
            let vdec = vertexs[i].vertexDeclaration._VAElements;

            for (let j = 0; j < vdec.length; j++) {
                vaelements.push({ format: vdec[j].format, stride: vdec[j].stride, shaderLocation: vdec[j].shaderLocation });
            }
            this.attributeByteSize.push(oneAttributeSize);
            this.VAElements.push(vaelements);
            this.instanceMode.push(vertexs[i].instanceBuffer);
        }
        this.id = VertexAttributeLayout.IPoint;
        VertexAttributeLayout._pool[VertexAttributeLayout.IPoint++] = this;
    }

    /**
     * @internal
     * @param vertexs 
     * @returns 
     */
    deepthEqaul(vertexs: VertexBuffer[]): boolean {
        if (vertexs.length != this.VAElements.length) {
            return false;
        }
        for (var i = 0; i < vertexs.length; i++) {
            let vaelemets = vertexs[i]._vertexDeclaration._VAElements;
            let thisVaeEs = this.VAElements[i];
            if (vaelemets.length != thisVaeEs.length) {
                return false;
            } else {
                for (var ii = 0, nn = vaelemets.length; ii < nn; ii++) {
                    let v0 = vaelemets[ii];
                    let v1 = thisVaeEs[ii];
                    if (v0.format != v1.format || v0.stride != v1.stride || v0.shaderLocation != v1.shaderLocation)
                        return false;
                }
            }
        }
        return true;
    }
}