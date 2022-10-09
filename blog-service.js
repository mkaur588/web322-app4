const fs = require("fs"); // required at the top of your module
const path = require("path");

let posts = [];
let categories = [];

module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getCategories,
    addPost,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById
}

function initialize () {
    return new Promise((resolve, reject) => {
        let message = "";
        fs.readFile(path.join(__dirname, "data/posts.json"), 'utf8', (err, data) => {
            if (err) {
                message = "Error occurred while loading Posts data";
            };
            posts = JSON.parse(data);
        });
        fs.readFile(path.join(__dirname, "data/categories.json"), 'utf8', (err, data) => {
            if (err) {
                message = "Error occurred while loading Categories data";
            }
            categories = JSON.parse(data);
        });

        if(message.length) {
            reject(message);
        } else {
            resolve("Initialized successfully");
        }
    });
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if(posts.length) resolve(posts)
        else reject("No results returned");
    })
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        let publishedPosts = posts.filter(post => post.published === true);
        if(publishedPosts.length) resolve(publishedPosts)
        else reject("No results returned");
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if(categories.length) resolve(categories)
        else reject("No results returned");
    })
}

// Add post function
function addPost(postData){
    return new Promise((resolve, reject) => {
        if(postData.published === undefined) {
            postData.published = false;
        } else postData.published = true;

        postData.id = posts.length + 1;

        posts.push(postData);

        resolve(postData);
    })
}



function getPostsByCategory (category){
    return new Promise((resolve, reject) => {
        const categoryPosts = posts.filter((post) => {
            return post.category == category;
        })

        categoryPosts.length > 0 ? resolve(categoryPosts) : reject("no results returned");
    })
}

function getPostsByMinDate (minDateStr){
    return new Promise((resolve, reject) => {
        const minDatePosts = posts.filter((post) => {
            return new Date(post.postDate) >= new Date(minDateStr);
        })

        minDatePosts.length > 0 ? resolve(minDatePosts) : reject("no results returned");
    })
}

function getPostById (id){
    return new Promise((resolve, reject) => {
        const idPosts = posts.filter((post) => {
            return post.id == id;
        })

        idPosts.length > 0 ? resolve(idPosts) : reject("no results returned");
    })
}