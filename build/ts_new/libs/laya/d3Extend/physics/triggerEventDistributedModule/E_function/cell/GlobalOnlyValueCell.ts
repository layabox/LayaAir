export class GlobalOnlyValueCell {

    private static currentID:number=0;

     static getOnlyID():number
    {
        GlobalOnlyValueCell.currentID +=1;
        return GlobalOnlyValueCell.currentID;
    }
}


