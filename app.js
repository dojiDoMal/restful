var express = require("express"),
	app = express(),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose");
	
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());

mongoose.connect("mongodb://localhost:27017/restful_blog", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
})

app.set("view engine", "ejs");

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
	res.redirect("/blogs");
})

app.get("/blogs", (req, res) => {
	Blog.find({}, (err, blogs) => {
		if(err){
			console.log("Error!")
		} else {
			res.render("index", {blogs: blogs})
		}
	})
})

//New
app.get("/blogs/new", (req, res) => {
	res.render("new")
})

//Create
app.post("/blogs", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.create(req.body.blog, (err, newBlog) => {
		if(err){
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	})
})

//Show
app.get("/blogs/:id", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog})
		}
	})
})

//Edit
app.get("/blogs/:id/edit", (req, res) => {
	Blog.findById(req.params.id, (err, foundBlog) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog})
		}
	})
})

//Update
app.put("/blogs/:id", (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	})
})

//Delete
app.delete("/blogs/:id", (req, res) => {
	Blog.findByIdAndRemove(req.params.id, (err) => {
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
})

app.listen(4000, () => {
	console.log("server is running");
})