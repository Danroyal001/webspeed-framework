import express from 'express';


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

        if (_next && typeof _next == 'function') {
            this.next = _next;
        }
    }

    setHeader(key: string, value: any) {
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

    setResponsePayload(payload: ResponsePayload) {
        this.responsePayload = payload;
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

        if (_payload) {
            this.responsePayload = _payload;
        }

        console.timeEnd
        ('response-time');

        if (this.responsePayload) {
            this.response.status(this.headers['Status-Code'] ? Number(this.headers['Status-Code']) : 200).send(this.responsePayload);
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

        this.router.get(this.slug, (req, res, next) => {
            this.get(new RouteContext(req, res, next));
        });
        this.router.post(this.slug, (req, res, next) => {
            this.post(new RouteContext(req, res, next));
        });
        this.router.put(this.slug, (req, res, next) => {
            this.put(new RouteContext(req, res, next));
        });
        this.router.delete(this.slug, (req, res, next) => {
            this.delete(new RouteContext(req, res, next));
        });
        this.router.patch(this.slug, (req, res, next) => {
            this.patch(new RouteContext(req, res, next));
        });
        this.router.options(this.slug, (req, res, next) => {
            this.options(new RouteContext(req, res, next));
        });
        this.router.lock(this.slug, (req, res, next) => {
            this.lock(new RouteContext(req, res, next));
        });
        this.router.unlock(this.slug, (req, res, next) => {
            this.unlock(new RouteContext(req, res, next));
        });
        this.router.trace(this.slug, (req, res, next) => {
            this.trace(new RouteContext(req, res, next));
        });
        this.router.purge(this.slug, (req, res, next) => {
            this.purge(new RouteContext(req, res, next));
        });
        this.router.propfind(this.slug, (req, res, next) => {
            this.propfind(new RouteContext(req, res, next));
        });
        this.router.proppatch(this.slug, (req, res, next) => {
            this.proppatch(new RouteContext(req, res, next));
        });
        this.router.all(this.slug, (req, res, next) => {
            this.all(new RouteContext(req, res, next));
        });
        this.router.move(this.slug, (req, res, next) => {
            this.move(new RouteContext(req, res, next));
        });
        this.router.mkcol(this.slug, (req, res, next) => {
            this.mkcol(new RouteContext(req, res, next));
        });
        this.router.mkactivity(this.slug, (req, res, next) => {
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
