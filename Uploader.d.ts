export = Uploader;
declare class Uploader {
    constructor(client: any, forceReady?: boolean);
    client: any;
    ready: boolean;
    url: any;
    uploadFile(filePath: any, name?: any, tag?: string): Promise<any>;
    uploadUrl(url: any, fileName: any, tag?: string): Promise<any>;
    upload(file: any, fileName: any, tag?: string): Promise<any>;
    #private;
}
