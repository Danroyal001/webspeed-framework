import RoutingController, { RouteContext } from './RoutingController';
import Post from '../../database/databaseModels/Post';

class BlogController extends RoutingController {
    constructor() {
        super('/blog');

        // Detail route: GET /blog/:slug
        this.router.get('/:slug', (req, res, next) => {
            this.show(new RouteContext(req, res, next));
        });
    }

    // Handles GET /blog
    async get(context: RouteContext) {
        try {
            const posts = await Post.query().get();
            
            // Build dynamic HTML list of posts
            let listHtml = '';
            if (posts.length === 0) {
                listHtml = '<p>No posts published yet.</p>';
            } else {
                listHtml = '<ul>' + posts.map(p => `
                    <li class="post-item">
                        <a href="/blog/${p.slug}"><h3>${p.title}</h3></a>
                        <p>${p.content?.substring(0, 100)}...</p>
                    </li>
                `).join('') + '</ul>';
            }

            return context.render('views/blog.html', {
                title: 'WebSpeed CMS Blog',
                postsList: listHtml
            });
        } catch (error: any) {
            return context.finish(`Error rendering blog index: ${error.message}`);
        }
    }

    async show(context: RouteContext) {
        try {
            const slug = context.getUrlParam('slug');
            const post = await Post.query().where('slug', slug).first();
            if (!post) {
                context.setHeader('Status-Code', 404);
                return context.finish('404 - BlogPost not found');
            }

            return context.render('views/post.html', {
                title: post.title,
                content: post.content
            });
        } catch (error: any) {
            return context.finish(`Error rendering post: ${error.message}`);
        }
    }
}

export default new BlogController();
