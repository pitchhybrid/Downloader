
import { Image } from './../model/image';
import { saveAs } from 'file-saver';
import JSZip = require('jszip');
import {sizeOf} from './../utils/utils';

export abstract class Abstract {
    private errors:any[] = [];
    private div: HTMLDivElement = document.createElement('div');
    private sidebar: HTMLElement;
    private mainBTNEl: HTMLElement;
    private title: HTMLElement;
    public list: HTMLElement;

    public images: Image[] = [];
    public zip: JSZip = new JSZip();
    public folder:JSZip;

    public progress:number[] = [];

    constructor() {
        this.div.innerHTML = require('./template/index.html').default;
        document.body.appendChild(this.div);
        this.sidebar = document.getElementById('templateSideBar');
        this.list = document.getElementById('sidebarList');
        this.mainBTNEl = document.getElementById('mainBTN');
        this.title = document.getElementById('headerDownloader');
        document.getElementById('zipProgress').style.padding = '0';
        document.getElementById('sidebarBTN').onclick = () => {
            if(this.sidebar.style.left == '-500px'){
                this.sidebar.style.left = '0.5px';
            }else{
                this.sidebar.style.left = '-500px';
            }
        };
    }

    public addList(image: Image, progress: Tampermonkey.ProgressResponseBase): void {
        const cell: HTMLElement = image.getCell() // li;
        cell.title = image.src;
        cell.onclick = () => this.debug(image.index);
        var { percent,speed,downloaded } = this.info(progress);
        cell.innerHTML = `
            <p style="text-align: left;">${image.name}</p>           
            <p class="progress-k" style="width: ${percent}"></p>
            <p style="text-align: center;"><small>${downloaded} (${percent}) ${speed}</small></p>`;
        this.list.appendChild(cell);
    }

    private info(progress: Tampermonkey.ProgressResponseBase):Info{
        var data:Info = {
            percent: `${((progress.loaded / progress.totalSize) * 100).toFixed(2)}%`,
            downloaded: `${sizeOf(progress.loaded)} of ${sizeOf(progress.totalSize)}`,
        };
       
        if(this.progress.length > 2){
            data.speed = `${sizeOf(progress.loaded - this.progress[this.progress.length-2])}/s`;
        }else{
            data.speed = `${sizeOf(progress.loaded)}/s`
        }
        return data;
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
            document.getElementById('zipPercent').innerHTML = `<small>${document.getElementById('zipList').childElementCount - 1} of ${this.images.length} (${progress.percent.toFixed(2)}%)</small>`;
            (this.list.parentNode as HTMLElement).scrollTop = (this.list.parentNode as HTMLElement).scrollHeight;
        }
    }

    public debug(index:number){
        console.log(this.images[index]);
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
            try {
                vm.clear();
                const stream:Blob = await vm.processar(vm.images,( progress:Metadata ): void => {
                    vm.addZipProgress(progress);
                });
                var toggle:boolean = (document.getElementById('btnZipCbz') as HTMLInputElement).checked;
                saveAs(stream, name + (toggle ? '.cbz':'.zip'));
            } catch (error) {
                this.errors.push(error);
                console.error(this.errors);
            }
        });
    }

    public async processar(images:Image[],progress?:(progress:Metadata) => void): Promise<Blob> {
        try {
            for (const image of images) {
                this.progress = [];
                if(image.done == false){
                    const b:Blob = await this.download<Blob>(image.src, {
                        onprogress: (event: Tampermonkey.ProgressResponseBase) => {
                            this.progress.push(event.loaded);
                            this.addList(image, event);
                            this.title.innerHTML = `<small>${this.list.childElementCount} of ${this.images.length}</small>`;
                            const parent:HTMLElement = this.list.parentNode as HTMLElement;
                            parent.scrollTop = parent.scrollHeight;
                        },
                        onerror:(error:Tampermonkey.ErrorResponse) => {
                            console.log(error)
                        }
                    });
                    this.folder.file(image.file(b), b);
                    image.done = true;
                }
            }
            return this.zip.generateAsync({ type: 'blob', comment: window.location.href }, progress);
        } catch (e) {
            this.errors.push(e);
            throw e;
        }
    }

    public download<T extends Blob | string | ArrayBuffer>(url: string, 
        { onprogress,ontimeout,onerror,
            method = 'GET',
            prop = 'response', 
            responseType = 'blob',
            timeout = 120000
        }: Download): Promise<T> {
        
        return new Promise((resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void): void => {
            try {
                GM_xmlhttpRequest({ method, url, responseType, timeout,
                    onprogress, ontimeout, onerror,
                    onload: (xml: Tampermonkey.ResponseBase) => {
                        if (xml.status == 200)
                            resolve(xml[prop]);
                        else
                            reject(xml.statusText);
                    },
                });
            } catch (error) {
                this.errors.push(error);
            }
        });
    }
}

type Download = {
    method?: 'GET' | 'POST';
    responseType?: 'blob' | 'json' | 'arraybuffer';
    onprogress?: (event: Tampermonkey.ProgressResponseBase) => void;
    ontimeout?: () => void;
    onerror?: (error:Tampermonkey.ErrorResponse) => void;
    timeout?:number;
    prop?: 'response' | 'responseText' | 'responseHeaders' | 'responseXML';
}

type Metadata = { 
    percent: number; 
    currentFile: string; 
}

type Info = {
    percent:string; 
    downloaded:string;
    speed?:string;
}