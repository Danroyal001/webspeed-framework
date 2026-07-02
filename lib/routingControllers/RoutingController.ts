import express from 'express';
import * as fs from 'fs';
import * as path from 'path';


export type ResponsePayload = Buffer | JSON | Record<any, any> | string | number | Object | null;


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

    private responsePayload: ResponsePayload = null;

    private headers: Record<string, string> = {};

    private readonly method: string = 'get';

    next: Function = () => { }

    /**
     * Operational context for a route
     * @param request The express.js request object
     * @param response The express.js response object
     */
    constructor(private request: express.Request, private response: express.Response, _next?: Function) {
        this.method = request.method.toLocaleLowerCase();
        console.time('response-time');

        if (_next && typeof _next == 'function') {
            this.next = _next;
        }
    }

    setHeader(key: string, value: any) {
        this.headers[key] = String(value);
    }

    getHeader(key: string) {
        return this.request.headers[key] || this.headers[key];
    }

    getBody() {
        return this.request.body;
    }

    getBodyParam(key: string) {
        return this.request.body ? this.request.body[key] : undefined;
    }

    /**
     * Retrives the query string
     * @returns The url query string, *without the leading question mark `?`*
     */
    getQueryString() {
        const query = this.request.query;
        const keys = Object.keys(query);
        const values = Object.values(query);
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

    getUrlParam(key: string) {
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

    setResponsePayload(payload: ResponsePayload) {
        this.responsePayload = payload;
    }

    /**
     * Render a lightweight template HTML file and replace {{key}} placeholders
     */
    render(templatePath: string, data: Record<string, any> = {}): void {
        const fullPath = path.resolve(process.cwd(), templatePath);
        try {
            let html = fs.readFileSync(fullPath, 'utf-8');
            Object.keys(data).forEach(key => {
                const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                html = html.replace(placeholder, data[key]);
            });
            this.setHeader('Content-Type', 'text/html');
            this.finish(html);
        } catch (error: any) {
            console.error(`Error rendering template ${templatePath}:`, error);
            this.setHeader('Status-Code', 500);
            this.setHeader('Content-Type', 'text/plain');
            this.finish(`Template rendering error: ${error.message}`);
        }
    }

    /**
     * Send JSON response helper
     */
    json(data: any, statusCode: number = 200): void {
        this.setHeader('Content-Type', 'application/json');
        this.setHeader('Status-Code', statusCode);
        this.finish(JSON.stringify(data));
    }


    /**
     * Default action for inexistent routes
     */
    noRoute() {
        this.setHeader('Content-Type', 'text/html');
        this.setHeader('Status-Code', 404);
        this.setResponsePayload('404 - Resource not found');

        return this.response.redirect(302, '/404');
    }


    /**
     * 
     * @param {ResponsePayload} _payload The response body
     */
    finish(_payload?: ResponsePayload) {
        const headerKeys = Object.keys(this.headers);
        headerKeys.forEach((key, index) => this.response.setHeader(key, this.headers[key]));

        if (_payload !== undefined) {
            this.responsePayload = _payload;
        }

        try {
            console.timeEnd('response-time');
        } catch (e) {
            // Ignore timer errors
        }

        if (this.responsePayload !== null && this.responsePayload !== undefined) {
            const status = this.headers['Status-Code'] ? Number(this.headers['Status-Code']) : 200;
            this.response.status(status).send(this.responsePayload);
        } else {
            this.response.end();
        }
    }
}


export interface RoutingControllerOptions {
    subControllers?: RoutingController[];
}


class RoutingController {

    public slug: string = '/';

    public router: express.Router = express.Router();

    constructor(slug: string, _options?: RoutingControllerOptions) {

        this.slug = slug;

        if (_options) {
            this.applyOptions(_options);
        }

        this.router.get('/', (req, res, next) => {
            this.get(new RouteContext(req, res, next));
        });
        this.router.post('/', (req, res, next) => {
            this.post(new RouteContext(req, res, next));
        });
        this.router.put('/', (req, res, next) => {
            this.put(new RouteContext(req, res, next));
        });
        this.router.delete('/', (req, res, next) => {
            this.delete(new RouteContext(req, res, next));
        });
        this.router.patch('/', (req, res, next) => {
            this.patch(new RouteContext(req, res, next));
        });
        this.router.options('/', (req, res, next) => {
            this.options(new RouteContext(req, res, next));
        });
        this.router.lock('/', (req, res, next) => {
            this.lock(new RouteContext(req, res, next));
        });
        this.router.unlock('/', (req, res, next) => {
            this.unlock(new RouteContext(req, res, next));
        });
        this.router.trace('/', (req, res, next) => {
            this.trace(new RouteContext(req, res, next));
        });
        this.router.purge('/', (req, res, next) => {
            this.purge(new RouteContext(req, res, next));
        });
        this.router.propfind('/', (req, res, next) => {
            this.propfind(new RouteContext(req, res, next));
        });
        this.router.proppatch('/', (req, res, next) => {
            this.proppatch(new RouteContext(req, res, next));
        });
        this.router.all('/', (req, res, next) => {
            this.all(new RouteContext(req, res, next));
        });
        this.router.move('/', (req, res, next) => {
            this.move(new RouteContext(req, res, next));
        });
        this.router.mkcol('/', (req, res, next) => {
            this.mkcol(new RouteContext(req, res, next));
        });
        this.router.mkactivity('/', (req, res, next) => {
            this.mkactivity(new RouteContext(req, res, next));
        });


        return this;

    }

    private applyOptions(options: RoutingControllerOptions) {
        const { subControllers } = options;
        if (subControllers) {
            subControllers.forEach(controller => {
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

    // begin request methods

    get(context: RouteContext) {
        context.setHeader('Content-Type', 'text/html');
        context.setResponsePayload('<strong>Hello world!</strong>');

        return context.finish();
    }

    post(context: RouteContext) {
        return context.noRoute();
    }

    put(context: RouteContext) {
        // return context.noRoute();return context.noRoute();
    }

    delete(context: RouteContext) {
        return context.noRoute();
    }


    options(context: RouteContext) {
        return context.noRoute();
    }


    patch(context: RouteContext) {
        return context.noRoute();
    }


    head(context: RouteContext) {
        return context.noRoute();
    }


    copy(context: RouteContext) {
        return context.noRoute();
    }

    trace(context: RouteContext) {

        return context.noRoute();
    }

    // link(context: RouteContext){
    // 

    // }

    // unlink(context: RouteContext){
    // 
    // }

    purge(context: RouteContext) {
        return context.noRoute();
    }

    lock(context: RouteContext) {
        return context.noRoute();
    }

    unlock(context: RouteContext) {
        return context.noRoute();
    }

    // view(context: RouteContext){
    // 
    // }

    propfind(context: RouteContext) {
        return context.noRoute();
    }

    proppatch(context: RouteContext) {
        return context.noRoute();
    }

    all(context: RouteContext) {
        return context.noRoute();
    }

    move(context: RouteContext) {
        return context.noRoute();
    }

    mkcol(context: RouteContext) {
        return context.noRoute();
    }

    mkactivity(context: RouteContext) {
        return context.noRoute();
    }
}

export default RoutingController;
