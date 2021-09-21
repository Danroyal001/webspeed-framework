import express from 'express';


/**
 * Operational context for a route
 */
export class RouteContext {

    private methods = [
        'get',
        'post',
        'put',
        'delete',
        'patch',
        'options',
        'lock',
        'unlock',
        'trace',
        'purge'
    ];

    private responsePayload: any = null;

    private headers: Record<string, string> = {};

    private method: string = 'get';

    /**
     * Operational context for a route
     * @param request The express.js request object
     * @param response The express.js response object
     */
    constructor(private request: express.Request, private response: express.Response) {

        this.method = request.method.toLocaleLowerCase();

    }

    setHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    getHeader(key: string) { }

    getBody() {
        return this.request.body;
    }

    getBodyParam(key: string) {
        return this.request.body[key];
    }

    /**
     * Retrives the query string
     * @returns The url query string, *without the leading question mark `?`*
     */
    getQueryString() {
        const query = this.request.query;
        const keys = Object.keys(query);
        const values = Object.values(query);
        const length = keys.length;
        let str = '';
        keys.forEach((key, index) => {
            str += `${index == 0 ? '' : '&'}${key}=${values[index]}`;
        });

        return str;
    }

    getQueryParam(key: string) {
        return this.request.query[key];
    }

    gerUrlParam(key: string) {
        return this.request.params[key];
    }

    getUrl() {
        return this.request.url;
    }

    getOriginalUrl() {
        return this.request.originalUrl;
    }

    getMethod() {
        return this.method;
    }

    setResponsePayload(payload: any) {
        this.responsePayload = payload;
    }

    finish(_payload = void 0) {
        const headerKeys = Object.keys(this.headers);
        const headerValues = Object.values(this.headers);
        headerKeys.forEach((key, index) => this.response.setHeader(key, headerValues[index]));

        if (_payload) {
            this.responsePayload = _payload;
        }

        this.responsePayload != null ? this.response.send(this.responsePayload) : this.response.end();
    }
}


export interface RoutingControllerOptions {
    use?: RoutingController[];
}


class RoutingController {

    slug: string = '/';
    router: express.Router = express.Router();

    constructor(slug: string, _options?: RoutingControllerOptions) {

        this.slug = slug;

        if (_options) {
            this.applyOptions(_options);
        }

        this.router.get(this.slug, (req, res) => this.get(new RouteContext(req, res)));
        this.router.post(this.slug, (req, res) => this.post(new RouteContext(req, res)));
        this.router.put(this.slug, (req, res) => this.put(new RouteContext(req, res)));
        this.router.delete(this.slug, (req, res) => this.delete(new RouteContext(req, res)));
        this.router.patch(this.slug, (req, res) => this.patch(new RouteContext(req, res)));
        this.router.options(this.slug, (req, res) => this.options(new RouteContext(req, res)));
        this.router.lock(this.slug, (req, res) => this.lock(new RouteContext(req, res)));
        this.router.unlock(this.slug, (req, res) => this.unlock(new RouteContext(req, res)));
        this.router.trace(this.slug, (req, res) => this.trace(new RouteContext(req, res)));
        this.router.purge(this.slug, (req, res) => this.purge(new RouteContext(req, res)));
        this.router.propfind(this.slug, (req, res) => this.propfind(new RouteContext(req, res)));
        this.router.proppatch(this.slug, (req, res) => this.proppatch(new RouteContext(req, res)));
        this.router.all(this.slug, (req, res) => this.all(new RouteContext(req, res)));
        this.router.move(this.slug, (req, res) => this.move(new RouteContext(req, res)));
        this.router.mkcol(this.slug, (req, res) => this.mkcol(new RouteContext(req, res)));
        this.router.mkactivity(this.slug, (req, res) => this.mkactivity(new RouteContext(req, res)));


        return this;

    }

    private applyOptions(options: RoutingControllerOptions) {
        const { use } = options;
        if (use) {
            use.forEach(controller => {
                this.router.use(controller.slug, controller.router);
            });
        }
    }

    private async parseFormData(formData: Buffer) {
        return await RoutingController.parseFormData(formData);
    }

    static parseFormData(formData: Buffer) {
        return new Promise((resolve, reject) => {
            resolve(formData);
        })
    }

    private get(context: RouteContext) {
        context.setResponsePayload(Buffer.from('<strong>Hello there!</strong>'));
        return context.finish();
    }

    private post(context: RouteContext) {
        // 
    }

    private put(context: RouteContext) {
        // 
    }

    private delete(context: RouteContext) {
        // 
    }


    private options(context: RouteContext) {
        // 
    }


    private patch(context: RouteContext) {
        // 
    }


    private head(context: RouteContext) {
        // 
    }


    private copy(context: RouteContext) {
        // 
    }

    private trace(context: RouteContext) {

        // 
    }

    // private link(context: RouteContext){
    // 

    // }

    // private unlink(context: RouteContext){
    // 
    // }

    private purge(context: RouteContext) {
        // 
    }

    private lock(context: RouteContext) {
        // 
    }

    private unlock(context: RouteContext) {
        // 
    }

    // private view(context: RouteContext){
    // 
    // }

    private propfind(context: RouteContext) {
        // 
    }

    private proppatch(context: RouteContext) {
        // 
    }

    private all(context: RouteContext) {
        // 
    }

    private move(context: RouteContext) {
        // 
    }

    private mkcol(context: RouteContext) {
        // 
    }

    private mkactivity(context: RouteContext) {
        // 
    }
}

export default RoutingController;
