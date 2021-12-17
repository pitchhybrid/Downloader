
import { Image } from './../model/image';
import { saveAs } from 'file-saver';
import JSZip = require('jszip');
import {sizeOf,file} from './../utils/utils';

export abstract class Abstract {
    private div: HTMLDivElement = document.createElement('div');
    private sidebar: HTMLElement;
    private mainBTNEl: HTMLElement;
    private title: HTMLElement;
    public list: HTMLElement;

    public images: Image[] = [];
    public zip: JSZip = new JSZip();
    public folder:JSZip;

    public speed:number[] = [];

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
            <p><small style="float:left">${downloaded} (${percent})</small><small style="float:right">${speed}</small></p>`;
        this.list.appendChild(cell);
    }

    private info(progress: Tampermonkey.ProgressResponseBase):Progress{
        const data:Progress = {
            percent: `${((progress.loaded / progress.totalSize) * 100).toFixed(2)}%`,
            downloaded: `${sizeOf(progress.loaded)} of ${sizeOf(progress.totalSize)}`,
        };
       
        if(this.speed.length > 10){
            data.speed = `${sizeOf(progress.loaded - this.speed[this.speed.length - 10])}/s`;
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
            const [_folder,_file] = progress.currentFile.split('/');
            li.innerHTML = `<p>${_file || _folder}</p>`;
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
        var name: string = this.name();
        this.folder = this.zip.folder(name);
        this.button(async (e: PointerEvent) => {
            try {
                this.clear();
                const stream:Blob = await this.processar(this.images,( progress:Metadata ): void => {
                    this.addZipProgress(progress);
                });
                var toggle:boolean = (document.getElementById('btnZipCbz') as HTMLInputElement).checked;
                saveAs(stream, name + (toggle ? '.cbz':'.zip'));
            } catch (error) {
                console.log(error)
            }
        });
    }

    public async processar(images:Image[],progress?:(progress:Metadata) => void): Promise<Blob> {
        for (const image of images) {
            do {
                try {
                    this.speed = [];
                    if(image.done == false){
                        image.blob = await this.download<Blob>(image.src, {
                            onprogress: (event: Tampermonkey.ProgressResponseBase) => {
                                this.speed.push(event.loaded);
                                this.addList(image, event);
                                this.title.innerHTML = `<small>${this.list.childElementCount} of ${this.images.length}</small>`;
                                const parent:HTMLElement = this.list.parentNode as HTMLElement;
                                parent.scrollTop = parent.scrollHeight;
                            }
                        });
                        this.folder.file(file(image), image.blob);
                        image.done = true;
                    }
                } catch (error) {
                    console.error(error);
                    image.done = false;
                }
            } while (!image.done);
        }
        return this.zip.generateAsync({ type: 'blob', comment: window.location.href }, progress);
    }

    public download<T extends Blob | string | ArrayBuffer>(url: string, 
        { onprogress,
            method = 'GET',
            prop = 'response', 
            responseType = 'blob',
            timeout = 0
        }: Download): Promise<T> {
        
        return new Promise((resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void): void => {
            GM_xmlhttpRequest<T>({ method, url, responseType, timeout,
                onprogress,
                onload: (xml: Tampermonkey.ResponseBase) => {
                    if (xml.status == 200)
                        resolve(xml[prop]);
                    else
                        reject(xml.statusText);
                },
                revalidate:true,
                onerror:(error:Tampermonkey.ErrorResponse) =>{
                    reject(error);
                },
                ontimeout:()=>{
                    reject('timeout')
                }
            });
            
        });
    }
}

type Download = {
    method?: 'GET' | 'POST';
    responseType?: 'blob' | 'json' | 'arraybuffer';
    onprogress?: (event: Tampermonkey.ProgressResponseBase) => void;
    timeout?:number;
    prop?: 'response' | 'responseText' | 'responseHeaders' | 'responseXML';
}

type Metadata = { 
    percent: number; 
    currentFile: string; 
}

type Progress = {
    percent:string; 
    downloaded:string;
    speed?:string;
    interval?:NodeJS.Timer;
}