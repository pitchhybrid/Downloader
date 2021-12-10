import { Image } from '../model/image';
import { Abstract } from './view';

export class Asiansister extends Abstract {

    constructor(){
        super();
    }

    public name(): string {
        return document.querySelector<HTMLElement>('.second_contant>center').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        document.querySelectorAll<HTMLImageElement>('img.showMiniImage').forEach((item:HTMLImageElement,index:number) => {
            this.images.push(new Image(name,'https://asiansister.com/' + item.dataset.src.replace('_t.','.'),index));
        });
    }

}