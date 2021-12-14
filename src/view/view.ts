
import { Image } from './../model/image';
import { saveAs } from 'file-saver';
import JSZip = require('jszip');

export abstract class Abstract {

    private div: HTMLDivElement = document.createElement('div');
    private sidebar: HTMLElement;
    private mainBTNEl: HTMLElement;
    private title: HTMLElement;
    public list: HTMLElement;

    private state: boolean = false;

    public images: Image[] = [];
    public zip: JSZip = new JSZip();
    public folder:JSZip;

    constructor() {
        this.div.innerHTML = require('./template/index.html').default;
        document.body.appendChild(this.div);
        this.sidebar = document.getElementById('templateSideBar');
        this.list = document.getElementById('sidebarList');
        this.mainBTNEl = document.getElementById('mainBTN');
        this.title = document.getElementById('headerDownloader');
        document.getElementById('zipProgress').style.padding = '0';
        document.getElementById('sidebarBTN').onclick = () => {
            if (this.state) {
                this.sidebar.style.left = '-500px';
                this.state = false;
            } else {
                this.sidebar.style.left = '0.5px';
                this.state = true;
            }
        };
    }

    public addList(image: Image, progress: Tampermonkey.ProgressResponseBase): void {
        var cell: HTMLElement = image.getCell() // li;
        cell.title = image.src;
        cell.onclick = () => this.debug(image.index);
        cell.innerHTML = `<p>${image.name} - <small>(${((progress.loaded / progress.totalSize) * 100).toFixed(2)}%)</small></p>
                       
                            <p class="progress-k" style="width: ${((progress.loaded / progress.totalSize) * 100).toFixed(0)}%"></p>
                         <p><small>${progress.loaded} bytes of ${progress.totalSize} bytes</small></p>`;
        this.list.appendChild(cell);
        this.title.innerHTML = `<small>${this.list.childElementCount} of ${this.images.length}</small>`;
        (this.list.parentNode as HTMLElement).scrollTop = (this.list.parentNode as HTMLElement).scrollHeight;
    }

    private getLi(title:string):HTMLLIElement{
       var itens:HTMLLIElement[] = Array.from(document.querySelectorAll<HTMLLIElement>('#zipList>li'));
       for(const item of itens){
            if(item.title === title){
                return item;
            }
       }
       return document.createElement('li');
    }

    public addZipProgress(progress:Metadata){
        if(progress.currentFile){
            var li:HTMLLIElement = this.getLi(progress.currentFile);
            li.title = progress.currentFile;
            var titles:string[] = progress.currentFile.split('/');
            li.innerHTML = `<p>${titles[1] || titles[0]}</p>`;
            document.getElementById('zipList').appendChild(li);
            var style:CSSStyleDeclaration = document.getElementById('zipProgress').style;
            style.padding = '3px';
            style.width = progress.percent + '%';
            document.getElementById('zipPercent').innerHTML = `<small>${document.getElementById('zipList').childElementCount - 1} of ${this.images.length} ${progress.percent.toFixed(2)}%</small>`;
            (this.list.parentNode as HTMLElement).scrollTop = (this.list.parentNode as HTMLElement).scrollHeight;
        }
    }

    public debug(index:number){
        console.log({image:this.images[index],li:this.list.childNodes.item(index)})
    }

    public button(f: (e: PointerEvent) => void): void {
        this.mainBTNEl.onclick = f;
    }

    public abstract name(): string;

    public abstract queryLinksImages(): [Image] | void;

    private clear(): void {
        var done:boolean = true;
        if(this.images){
            for(const image of this.images){
                if(image.done == false){
                    done = false;
                    break;
                }
            }
        }
        if(done){
            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
        }
    }

    public render(): void {
        var vm = this;
        var name: string = this.name();
        this.folder = this.zip.folder(name);
        this.queryLinksImages();
        this.button(async function (e: PointerEvent) {
            vm.clear();
            const stream:Blob = await vm.processar(vm.images,( progress:Metadata ): void => {
                vm.addZipProgress(progress);
            });
            var toggle:boolean = (document.getElementById('btnZipCbz') as HTMLInputElement).checked;
            saveAs(stream, name + (toggle ? '.cbz':'.zip'));
        });
    }

    public async processar(images:Image[],progress?:(progress:Metadata) => void): Promise<Blob> {
        try {
            for (const image of images) {
                if(image.done == false){
                    const b:Blob = await this.download<Blob>(image.src, {
                        event: event => {
                            this.addList(image, event);
                        }
                    });
                    this.folder.file(image.file(b), b);
                    image.done = true;
                }
            }
            return this.zip.generateAsync({ type: 'blob', comment: window.location.href },progress);
        } catch (e) {
            throw e;
        }
    }

    public download<T extends Blob | string | ArrayBuffer>(url: string, { event, prop = 'response', responseType = 'blob' }: Download): Promise<T> {
        return new Promise((resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void): void => {
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                responseType,
                timeout: 120000,
                onprogress: event,
                onload: (xml: Tampermonkey.ResponseBase) => {
                    if (xml.status == 200)
                        resolve(xml[prop]);
                    else
                        reject(xml.statusText);
                },
                ontimeout: () => {
                    reject('timeout');
                }
            });
        });
    }
}

type Download = {
    responseType?: 'blob' | 'json' | 'arraybuffer';
    event?: (event: Tampermonkey.ProgressResponseBase) => void;
    prop?: 'response' | 'responseText' | 'responseHeaders' | 'responseXML';
}

type Metadata = { 
    percent: number; 
    currentFile: string; 
}