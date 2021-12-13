import { Image } from '../model/image';
import { Abstract} from './view';

export class _8hko extends Abstract{

    constructor(){
        super();
    }

    public name(): string {
        var a:HTMLElement = document.querySelector<HTMLElement>('.f-22.mb5');
        if(a == null){
            a  = document.querySelector('title');
        }
        return a.innerText;
    }
    public queryLinksImages(): void {
        var name:string = this.name();
        document.querySelectorAll<HTMLElement>('.tx-text.mb15>p>img').forEach((item:HTMLElement,index:number )=> {
            this.images.push(new Image(name, (item as HTMLImageElement).src, index));
        });
    }

}