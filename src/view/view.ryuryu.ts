import { Image } from '../model/image';
import { Abstract } from './view';

export class Ryuryu extends Abstract{
    
    public name(): string {
        return document.querySelector<HTMLElement>('h1.article-title').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name = this.name();
        document.querySelectorAll<HTMLImageElement>('section.gh-content.gh-canvas>figure>img').forEach((item:HTMLImageElement,index:number) =>{
            this.images.push(new Image(name,item.src,index));
        });
    }

}