/**
 * Created by luozc on 2017/5/17.
 */
namespace testTSC {

    export class TestTSC extends lolo.Image {

        private _aaa: number = 123;
        public bbb: boolean = true;


        public constructor() {
            this.funBBB("ssss");
        }

        public funAAA(): void {
            for(let i:number =0;i<100;i++){}

        }

        private funBBB(arg1: string): void {

        }


    }
}