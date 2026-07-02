import http from 'http';
import server from './lib/httpServerExporter';
import init from './lib/index';
import dbConnection from './database/connection';
import Task from './database/databaseModels/Task';
import Post from './database/databaseModels/Post';
import Product from './database/databaseModels/Product';
import Message from './database/databaseModels/Message';
import PORT from './PORT';

// Helper to make HTTP requests
function makeRequest(
    method: string,
    path: string,
    headers: Record<string, string> = {},
    body?: any
): Promise<{ statusCode?: number; headers: http.IncomingHttpHeaders; body: string }> {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : undefined;
        const options: http.RequestOptions = {
            hostname: '127.0.0.1',
            port: PORT,
            path: path,
            method: method,
            headers: {
                ...headers,
                ...(payload ? {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                } : {})
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

// Visual Assertion Logger
const stats = { passed: 0, failed: 0 };
function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(` ✅ PASS: ${message}`);
        stats.passed++;
    } else {
        console.error(` ❌ FAIL: ${message}`);
        stats.failed++;
    }
}

async function runTests() {
    console.log('\n==================================================');
    console.log('🚀 Starting WebSpeed CMS Framework E2E Test Suite');
    console.log('==================================================\n');

    // 1. Start Server
    console.log('Initializing WebSpeed framework server...');
    await init();
    // Wait a brief moment to ensure startup completes
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        // 2. Database Cleanup & Seeding
        console.log('\n--- Database Cleanup & Seeding ---');
        
        console.log('Clearing existing Tasks, Posts, Products, and Messages...');
        await Task.query().delete();
        await Post.query().delete();
        await Product.query().delete();
        await Message.query().delete();

        console.log('Seeding products...');
        const prod = new Product({
            name: 'Test Gadget',
            description: 'A test product for E2E validation.',
            price: 19.99,
            category: 'Electronics'
        });
        await prod.__saveToDatabase();

        console.log('Seeding blog posts...');
        const p1 = new Post({
            title: 'Introducing WebSpeed CMS',
            content: 'WebSpeed is a modern high-performance CMS framework built on Node.js.',
            slug: 'intro-webspeed'
        });
        await p1.__saveToDatabase();

        const p2 = new Post({
            title: 'ActiveRecord in Node',
            content: 'ActiveRecord pattern makes database interactions elegant and simple.',
            slug: 'active-record-node'
        });
        await p2.__saveToDatabase();

        const seedPosts = await Post.query().get();
        assert(seedPosts.length === 2, 'Should have exactly 2 blog posts seeded in the database.');

        // 3. E2E API Tests (CRUD Tasks)
        console.log('\n--- Testing E2E Task REST API (CRUD) ---');

        // Test GET Empty
        let res = await makeRequest('GET', '/api/tasks');
        assert(res.statusCode === 200, 'GET /api/tasks returns status 200');
        let tasks = JSON.parse(res.body);
        assert(Array.isArray(tasks) && tasks.length === 0, 'GET /api/tasks returns empty array initially');

        // Test POST (Create Task)
        const newTaskPayload = { title: 'Finish WebSpeed CMS', description: 'Write examples and tests', completed: false };
        res = await makeRequest('POST', '/api/tasks', {}, newTaskPayload);
        assert(res.statusCode === 201, 'POST /api/tasks returns status 201');
        let createdTask = JSON.parse(res.body);
        assert(createdTask.id !== undefined, 'Created task should have a database ID');
        assert(createdTask.title === newTaskPayload.title, 'Created task has correct title');

        const taskId = createdTask.id;

        // Test GET Single
        res = await makeRequest('GET', `/api/tasks/${taskId}`);
        assert(res.statusCode === 200, 'GET /api/tasks/:id returns status 200');
        let fetchedTask = JSON.parse(res.body);
        assert(fetchedTask.id === taskId, 'Fetched task matches the created task ID');

        // Test PUT (Update Task)
        const updatePayload = { completed: true };
        res = await makeRequest('PUT', `/api/tasks/${taskId}`, {}, updatePayload);
        assert(res.statusCode === 200, 'PUT /api/tasks/:id returns status 200');
        let updatedTask = JSON.parse(res.body);
        assert(updatedTask.completed === true, 'Updated task completed property is true');

        // Test DELETE (Delete Task)
        res = await makeRequest('DELETE', `/api/tasks/${taskId}`);
        assert(res.statusCode === 200, 'DELETE /api/tasks/:id returns status 200');
        let deleteResult = JSON.parse(res.body);
        assert(deleteResult.success === true, 'DELETE call returned success confirmation');

        // Verify Task is gone from database
        const dbTasks = await Task.query().where('id', taskId).get();
        assert(dbTasks.length === 0, 'Task is no longer present in the database');

        // 4. CMS Blog Page & Template Rendering Tests
        console.log('\n--- Testing CMS HTML Blog Rendering & Assets ---');

        // Test GET Blog Index
        res = await makeRequest('GET', '/blog');
        assert(res.statusCode === 200, 'GET /blog returns status 200');
        assert(!!(res.headers['content-type']?.includes('text/html')), 'GET /blog response Content-Type is text/html');
        assert(res.body.includes('WebSpeed CMS Blog'), 'Blog index rendered with correct title');
        assert(res.body.includes('Introducing WebSpeed CMS'), 'Blog index rendered seeded post 1 title');
        assert(res.body.includes('ActiveRecord in Node'), 'Blog index rendered seeded post 2 title');

        // Test GET Blog Post Detail (Seeded Post 1)
        res = await makeRequest('GET', '/blog/intro-webspeed');
        assert(res.statusCode === 200, 'GET /blog/intro-webspeed returns status 200');
        assert(res.body.includes('Introducing WebSpeed CMS'), 'Post detail page rendered title');
        assert(res.body.includes('WebSpeed is a modern high-performance CMS'), 'Post detail page rendered content body');

        // Test GET Non-Existent Blog Post
        res = await makeRequest('GET', '/blog/invalid-slug');
        assert(res.statusCode === 404, 'GET /blog/invalid-slug returns 404 status');

        // Test Static CSS File serving
        res = await makeRequest('GET', '/style.css');
        assert(res.statusCode === 200, 'GET /style.css returns status 200');
        assert(!!(res.headers['content-type']?.includes('text/css')), 'GET /style.css response Content-Type is text/css');
        assert(res.body.includes('--bg-color: #0b0f19'), 'CSS content verified');

        // Test 404 redirection
        res = await makeRequest('GET', '/non-existent-route-random');
        assert(res.statusCode === 302, 'Non-existent route redirected to /404 with 302 status');

        // Test GET Real-Time Collab Board page
        res = await makeRequest('GET', '/collab');
        assert(res.statusCode === 200, 'GET /collab returns status 200');
        assert(res.body.includes('WebSpeed Real-Time Collaboration'), 'Collab page rendered with correct title');

        // Test GET E-Commerce Store page
        res = await makeRequest('GET', '/store');
        assert(res.statusCode === 200, 'GET /store returns status 200');
        assert(res.body.includes('WebSpeed E-Commerce'), 'Store page rendered with correct title');

        // Test GET E-Commerce Store Products JSON API
        res = await makeRequest('GET', '/store/api/products');
        assert(res.statusCode === 200, 'GET /store/api/products returns status 200');
        assert(!!(res.headers['content-type']?.includes('application/json')), 'GET /store/api/products Content-Type is application/json');
        let products = JSON.parse(res.body);
        assert(Array.isArray(products) && products.length === 1, 'GET /store/api/products returns exactly 1 seeded product');
        assert(products[0].name === 'Test Gadget', 'Seeded product has correct name');

    } catch (error) {
        console.error('Test Execution Error:', error);
        stats.failed++;
    } finally {
        // 5. Cleanup and Shutdown
        console.log('\n--- Shutting Down Server ---');
        server.close(async () => {
            console.log('HTTP Server closed.');
            await dbConnection.disconnect();
            console.log('Database disconnected.');

            console.log('\n==================================================');
            console.log('📊 Test Execution Summary');
            console.log(` Passed: ${stats.passed}`);
            console.log(` Failed: ${stats.failed}`);
            console.log('==================================================\n');

            if (stats.failed > 0) {
                process.exit(1);
            } else {
                process.exit(0);
            }
        });
    }
}

runTests();
