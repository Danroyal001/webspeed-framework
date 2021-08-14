import express from 'express';

class RoutingController {

    slug: string = '/';
    private router: express.Router;

    constructor(slug: string, _options?: Record<string, any>) {

        this.slug = slug;
        this.router = express.Router();

        this.router.get(this.slug, (req, res) => this.get());
        this.router.post(this.slug, (req, res) => this.post());
        this.router.put(this.slug, (req, res) => this.put());
        this.router.delete(this.slug, (req, res) => this.delete());
        this.router.patch(this.slug, (req, res) => this.patch());
        this.router.options(this.slug, (req, res) => this.options());
        this.router.lock(this.slug, (req, res) => this.lock());
        this.router.unlock(this.slug, (req, res) => this.unlock());
        this.router.trace(this.slug, (req, res) => this.trace());
        this.router.purge(this.slug, (req, res) => this.purge());
        this.router.propfind(this.slug, (req, res) => this.propfind());
        this.router.proppatch(this.slug, (req, res) => this.proppatch());
        this.router.all(this.slug, (req, res) => this.all());
        this.router.move(this.slug, (req, res) => this.move());
        this.router.mkcol(this.slug, (req, res) => this.mkcol());
        this.router.mkactivity(this.slug, (req, res) => this.mkactivity());

        return this;

    }

    private parseFormData(formData: Buffer) {
        return RoutingController.parseFormData(formData);
    }

    static parseFormData(formData: Buffer) {
        // 
    }

    private get() {
        // 
    }

    private post() {
        // 
    }

    private put() {
        // 
    }

    private delete() {
        // 
    }


    private options() {
        // 
    }


    private patch() {
        // 
    }


    private head() {
        // 
    }


    private copy() {
        // 
    }

    private trace() {

        // 
    }

    // private link(){
    // 

    // }

    // private unlink(){
    // 
    // }

    private purge() {
        // 
    }

    private lock() {
        // 
    }

    private unlock() {
        // 
    }

    // private view(){
    // 
    // }

    private propfind() {
        // 
    }

    private proppatch() {
        // 
    }

    private all() {
        // 
    }

    private move() {
        // 
    }

    private mkcol() {
        // 
    }

    private mkactivity() {
        // 
    }
}

export default RoutingController;
