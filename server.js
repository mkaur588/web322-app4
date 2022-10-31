/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Manreet kaur
 *  Student ID: 153851217  
 *  Date: 25/09/2022
 *
 *  Online (Cyclic) Link: https://dizzy-fish-spacesuit.cyclic.app/about
 *
 ********************************************************************************/

const express = require('express');
const path = require('path');
const service = require('./blog-service');
let exphbs = require('express-handlebars');
const stripJs = require('strip-js');

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
    cloud_name: 'dga12xwb2',
    api_key: '694932861513843',
    api_secret: '8kE3Cp8pA7PAe4RzWO4ICj9jO1Y',
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage


const app = express();


app.engine('.hbs', exphbs.engine({
    extname: '.hbs', 
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
    }
}));
app.set('view engine', '.hbs');


const port = process.env.port || 8080;

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});



app.get('/', (req, res) => {
    res.redirect('/blog');
})

app.get('/about', (req, res) => {
    res.render('about');
})



// app.get('/blog', (req, res) => {
//     service.getPublishedPosts().then(data => res.json(data)).catch(err => res.json(err));
// })



app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await service.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get('/post/:value', (req, res) => {
    service.getPostById(req.params.value).then(data => res.send(data)).catch(err => res.json(`message: ${err}`));
})

app.get('/posts', (req, res) => {
    if (req.query.category) {
        service.getPostsByCategory(req.query.category).then(data => res.render("posts", {posts: data})).catch(err => res.render("posts", {message: "no results"}));
    } else if (req.query.minDate) {
        service.getPostsByMinDate(req.query.minDate).then(data => res.render("posts", {posts: data})).catch(err => res.render("posts", {message: "no results"}));
    } else {
        service.getAllPosts.then(data => res.render("posts", {posts: data})).catch(err => res.render("posts", {message: "no results"}));
    }
})



app.get('/categories', (req, res) => {
    service.getCategories().then(data => res.render('categories', {categories: data})).catch(err => res.render("categories", {message: "no results"}));

})

app.get('/posts/add', (req, res) => {
    res.render('addPost')
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
    service.initialize().then((data) => console.log(data)).catch((err) => console.log(err));
})



// Adding POST routes
app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl){
        req.body.featureImage = imageUrl;

        const postData = {
            "body": req.body.body,
            "title": req.body.title,
            "postDate": new Date().toISOString().split('T')[0],
            "category": req.body.category,
            "featureImage": imageUrl,
            "published": req.body.published,
        }

        service.addPost(postData).then(data => res.redirect('/posts')).catch(err => res.json(`message: ${err}`));
    }

})

