/**
	 * ...
	 * @author xie
	 */
export class SubmitKey {
    blendShader: number;
    submitType: number;
    other: number;

    constructor() {
        this.clear();
    }

    clear(): void {
        this.submitType = -1;
        this.blendShader = this.other = 0;
        //alpha = 1;
    }

    //TODO:coverage
    copyFrom(src: SubmitKey): void {
        this.other = src.other;
        this.blendShader = src.blendShader;
        this.submitType = src.submitType;
        //alpha = src.alpha;
    }

    copyFrom2(src: SubmitKey, submitType: number, other: number): void {
        //this.blendShader = src.blendShader;
        //this.alpha = src.alpha;			
        this.other = other;
        this.submitType = submitType;
    }

    //�Ƚ�3�����ⲿ�ṩ2��
    //TODO:coverage
    equal3_2(next: SubmitKey, submitType: number, other: number): boolean {
        return this.submitType === submitType && this.other === other && this.blendShader === next.blendShader;// && this.alpha === alpha;
    }

    //ȫ�Ƚϡ��ⲿ�ṩ2��
    //TODO:coverage
    equal4_2(next: SubmitKey, submitType: number, other: number): boolean {
        return this.submitType === submitType && this.other === other && this.blendShader === next.blendShader;// && alpha === next.alpha;
    }

    //�Ƚ�3��
    //TODO:coverage
    equal_3(next: SubmitKey): boolean {
        return this.submitType === next.submitType && this.blendShader === next.blendShader;// && alpha === next.alpha;
    }
    //ȫ�Ƚϡ�4��
    //TODO:coverage
    equal(next: SubmitKey): boolean {
        return this.other === next.other && this.submitType === next.submitType && this.blendShader === next.blendShader;// && alpha === next.alpha;
    }

}


