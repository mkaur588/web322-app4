const fs = require("fs"); // required at the top of your module
const path = require("path");

let posts = [];
let categories = [];

module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getCategories
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