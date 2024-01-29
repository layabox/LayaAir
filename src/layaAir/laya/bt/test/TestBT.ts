import { BlackboardComponent } from "../blackborad/BlackboardComponent";
import { BlackboardData } from "../blackborad/BlackboardData";
import { EBBType } from "../blackborad/EBlackBoard";
import { BTCompositeSelector } from "../composites/BTCompositeSelector";
import { BTCompositeSequence } from "../composites/BTCompositeSequence";
import { BehaviorTree } from "../core/BehaviorTree";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { EBTExecutionMode } from "../core/EBTExecutionMode";
import { EBTNodeResult } from "../core/EBTNodeResult";
import { BTLoop } from "../decorators/BTLoop";
import { TestService } from "../services/TestService";
import { BTTaskFinishWithResult } from "../tasks/BTTaskFinishWithResult";
import { BTTaskRunBehavior } from "../tasks/BTTaskRunBehavior";
import { BTTaskTest } from "../tasks/BTTaskTest";
import { BTTaskWait } from "../tasks/BTTaskWait";
import { TestBPTask } from "./TestBPTask";


export class TestBT {

    constructor() {
        // let btsequece = new BTCompositeSequence();
        // btsequece.name = "root";

        // let wait = new BTTaskWait();

        // wait.name = "wait";
        // let test = new TestBPTask();

        // //new BTTaskTest();
        // test.name = "test";

        // let simpleParallel = new BTSimpleParallel();
        // simpleParallel.name = "simpleParallel";


        // let mainTask = new BTTaskWait();
        // mainTask.name = "mainTask";
        // mainTask.waitTime = 2;

        // simpleParallel.addChild(mainTask);


        // let otherTask = new BTCompositeSequence();
        // otherTask.name = "otherTask";

        // let waitOther = new BTTaskWait();
        // waitOther.waitTime = 0.5;
        // waitOther.name = "waitOther";

        // let testOther = new BTTaskTest();
        // testOther.name = "testOther";

        // otherTask.addChild(waitOther);
        // otherTask.addChild(testOther);

        // simpleParallel.addChild(otherTask);

        // let btsequece2 = new BTCompositeSequence();
        // btsequece2.name = "btsequece2";
        // btsequece.addChild(wait);
        // // test simpleParallel
        // // btsequece.addChild(simpleParallel);
        // let subTree = this.createSubTree();
        // let runBehavior = new BTTaskRunBehavior();
        // runBehavior.btTree = subTree;
        // btsequece.addChild(runBehavior);


        // let btsequece3 = new BTCompositeSequence();
        // btsequece3.name = "btsequece3";


        // let test3 = new BTTaskTest();
        // test3.name = "test3";

        // let test4 = new BTTaskTest();
        // test4.name = "test4";

        // btsequece3.addChild(test3);

        // btsequece3.addChild(test4);

        // let xxyy = new BTBlackBorad();
        // xxyy.keyName = "a";
        // xxyy.value = 5;
        // xxyy.op = EBBNumberOperation.greater;
        // //test3.addDecorator(xxyy);


        // let dd = new BTBlackBorad();
        // dd.keyName = "a";
        // dd.value = 5;
        // dd.op = EBBNumberOperation.less;
        // //test4.addDecorator(dd);

        // btsequece.addChild(btsequece2);
        // btsequece.addChild(test);

        // let wait1 = new BTTaskWait();
        // let test1 = new BTTaskTest();

        // let wait5 = new BTTaskWait();
        // wait5.name = "wait5";

        // btsequece2.addChild(wait5)
        // btsequece2.addChild(btsequece3);
        // let loop4 = new BTLoop();
        // loop4.loopCount = 4;

        // let loop2 = new BTLoop();
        // loop2.loopCount = 2;

        // // test4.addDecorator(loop4);

        // btsequece3.addDecorator(loop4);
        // btsequece3.addDecorator(loop2);

        // btsequece2.addChild(wait1);
        // btsequece2.addChild(test1);
        // wait1.name = "wait1";
        // test1.name = "test1";
        // let wait3 = new BTTaskWait();
        // wait3.name = "wait3";


        // btsequece2.addChild(wait3);


        let btComp = new BehaviorTreeComponent();

        // let btTree = new BehaviorTree();
        // btTree.rootNode = btsequece;

        // btTree.blackboardAsset = this.createBlackBoard();

        let bb = this.createBlackBoard();
        // let btTree = this.createSimpleTree(bb);
        let btTree = this.createSimpleCompose(bb);

        let bbc = new BlackboardComponent();
        bbc.init(btTree.blackboardAsset);
        bbc.setData("a", 123);
        btComp.blackBoradComp = bbc;
        btComp.startTree(btTree, EBTExecutionMode.Looped);
        // debugger;
    }

    createBlackBoard() {
        let bb = new BlackboardData();
        bb.addKey({
            name: "a",
            type: EBBType.Number
        })
        bb.addKey({
            name: "b",
            type: EBBType.Other
        })

        let parent = new BlackboardData();
        parent.addKey({
            name: "c",
            type: EBBType.String
        })
        bb.parent = parent;
        bb.init();
        return bb;
    }

    createSubTree(bb: BlackboardData): BehaviorTree {
        // let loop3=new BTLoop();
        // loop3.name="loop3";
        // loop3.loopCount=3;
        let root = new BTCompositeSequence();
        root.name = "subtree";


        let task = new BTTaskTest();
        task.name = "taskTest1";



        let wait2sub = new BTTaskWait();
        wait2sub.name = "wait2sub";
        wait2sub.waitTime = 1;

        //root.addChild(wait2sub);
        root.addChild(task);
        let service = new TestService();
        task.addService(service);
        //task.addDecorator(loop3);

        let btTree = new BehaviorTree();
        btTree.rootNode = root;
        btTree.blackboardAsset = bb;
        return btTree;
    }
    /**
     *                             Sequence
     *                            /    |   \            \       
     *                           /     |    \              \
     *                          /      |     \               \  
     *                       (loop)
     *                       selector wait2 bpreturnfalse    bpreturntrue    
     *                      (service)       
     *                     /    |   \
     *                    /     |    \
     *                   /      |     \                 
     *        bpreturnfalse1   (loop)   wait1 
     *                       bpreturntrue1    
     *                        (service)                                                                                           
     * @param bb 
     * @returns 
     */
    createSimpleCompose(bb: BlackboardData): BehaviorTree {

        let sq = new BTCompositeSequence();
        sq.name = "Sequence";

        let selector = new BTCompositeSelector();
        selector.name = "selector";

        let wait2 = new BTTaskWait();
        wait2.waitTime = 2;
        wait2.name = "wait2";

        let bpReturnFalse = new BTTaskFinishWithResult();
        bpReturnFalse.name = "bpReturnFalse";
        bpReturnFalse.result = EBTNodeResult.Succeeded;

        let bpReturnTrue = new BTTaskFinishWithResult();
        bpReturnTrue.name = "bpReturnTrue";
        bpReturnTrue.result = EBTNodeResult.Succeeded;

        sq.addChild(selector);
        sq.addChild(wait2);
        sq.addChild(bpReturnFalse);
        sq.addChild(bpReturnTrue);

        let loop1 = new BTLoop();
        loop1.loopCount = 3;

        let service1 = new TestService();
        service1.name = "service1";

        selector.addService(loop1);
        selector.addService(service1);


        let bpReturnFalse1 = new BTTaskFinishWithResult();
        bpReturnFalse1.name = "bpReturnFalse1";
        bpReturnFalse1.result = EBTNodeResult.Failed;


        let bpReturnTrue1 = new BTTaskFinishWithResult();
        bpReturnTrue1.name = "bpReturnTrue1";
        bpReturnTrue1.result = EBTNodeResult.Succeeded;


        let wait1 = new BTTaskWait();
        wait1.waitTime = 1;
        wait1.name = "wait1";

        selector.addChild(bpReturnFalse1);
        selector.addChild(bpReturnTrue1);
        selector.addChild(wait1);

        let btTree = new BehaviorTree();
        btTree.rootNode = sq;
        btTree.blackboardAsset = bb;
        return btTree;
    }

    /**
     *               Sequence
     *            /     |        \          \   
     *          wait1 runBehaior runBPTask  runTest
     * @returns 
     */
    createSimpleTree(bb: BlackboardData): BehaviorTree {
        let sq = new BTCompositeSequence();
        sq.name = "Sequence";

        let wait1 = new BTTaskWait();
        wait1.waitTime = 1;
        wait1.name = "wait1"

        let runBehavior = new BTTaskRunBehavior();
        runBehavior.name = "runBehavior";
        runBehavior.btTree = this.createSubTree(bb);
        let loop = new BTLoop();
        loop.name = "loop";
        loop.loopCount = 3;

        let runBPTask = new TestBPTask();
        runBPTask.name = "runBPTask";

        let runTest = new BTTaskTest();
        runTest.name = "runTest";

        sq.addChild(wait1);
        sq.addChild(runBehavior);
        let loop3 = new BTLoop();
        loop3.name = "loop3";
        loop3.loopCount = 3;
        runBehavior.addDecorator(loop3);

        let service = new TestService();
        runBehavior.addService(service);
        sq.addChild(runBPTask);
        runBPTask.addDecorator(loop);

        sq.addChild(runTest);

        let btTree = new BehaviorTree();
        btTree.rootNode = sq;
        btTree.blackboardAsset = bb;
        return btTree;


    }
}