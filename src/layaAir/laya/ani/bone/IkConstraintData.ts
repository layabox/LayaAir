/**
 * @internal
 */
export class IkConstraintData {

	name: string;
	targetBoneName: string;
	boneNames: string[] = [];
	bendDirection: number = 1;
	mix: number = 1;
	isSpine: boolean = true;
	targetBoneIndex: number = -1;
	boneIndexs: number[] = [];

	//TODO:coverage
	constructor() {

	}

}


