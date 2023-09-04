# service-gallery

A service where users of backbone can upload images (in posts) which are viewable in a gallery.

With a full implementation of the outline users would be able to make posts that would be viewable seperate from the gallery (and text only posts). Posts / Galery just seemed to work together well so thats why i planned it like this

These are the exports in this module:
- service-example/Config
  - config file
- service-example/React
  - react based frontend component for the service
- service-example/Redux
  - redux sate manager that gets integrated into backbone's redux
- service-example/Admin
  - Admin panel components that backbone admins will be able to interact with
- service-example/Express
  - Express api routes that will be integrated into the server
- service-example/Database
  - Sequelize Postgress database that the backend will connect to



## Development outline

This outline is a guide for how one could implement the gallery service. I like the idea of things being arranged as posts with pictures and comments, as its easier to make things look nice this way. However the general outline can be used if you just want to post pictures. Either way the gallery component in the front end could be made to just show pictures. Its really whatever you want to do.

Another reason I have posts here is that initially intended for users to be able to make text only posts as well. For shitpost reasons mostly. Kinda two services in one, as they integrate well together.

### Backend (src/server)

There are two parts to the backend scripts, the api and the db.

#### DB
Allows storage of data in a postgresql database by using sqeuelize. Sequelize is an ORM that parses js objects into SQL. This way we dont have to touch actual SQL. It's also good to use an ORM as they can support multiple types of databases without any changes on our end

Things needed
- Define models which will store the data
  - probably a post model, picture model, and a comment model (frotator has a comment model you could inspect)
- Define the relation between posts, pictures and comments ie a post has many comments, and many pictures, but a comment only pretains to one post
  - src/server/db/models/index.js is where model relations should be defined (see frotator in same spot for comments and frosh)
- Decide how you want to link to the main backbone user database, again you can look to see vaguely how frotator does it
  - frotator was kinda in a rush though so it may be messy, u can just ask me abt this when u get here
  - ie picture was posted by a user, comment was posted by a user

As for the issue of choosing what to show on the front page of the website you could have a bool in the picture model that decides this or another model like mainpicture which would just have a refrence to a picture. either works, its just a matter of style.

##### API
Allows access to the database from the front end

for all of these you should use middleware so people logged in cant see everything (posts / pictures shuold have a public bool)

Routes (posts):

- POST /api/posts:
  - use database post model to create a new post, and set the info
  - for when somoeone submits a form to post images (you can look at how the user pfps are dealt with in backbone)
  - accept title and desctiption for post, as well as an image (or mutiple if you want multiple pics per post)
  - id do multiple pictures per post (darbs would probably be too lazy to upload one by one), but just one would be easier
- PUT /api/posts/:id
  - update post information, ie title / description
  - use middleware so only the owner or an admin can change this
  - allow updating public status, but only for admins (may make this its own subroute like PUT /api/posts/:id/admin or /api/posts/:id/public etc)
  - could also allow updating if a picture belongs to a post here, but id put it as a subroute
- GET /api/posts/:id
  - get a single post by id
  - probably lazy load in comments and related pictures (like how frotator loads comments on the frosh)
- GET /api/posts/
  - get list of all posts, probaby paginate this (see frotator)
  - probably lazy load in the pictures related to the posts
- GET /api/posts/:id/comments
  - get all the comments for a post (used to reload the comments when user posts)
- DELETE /api/posts/:id
  - remove post from database

Routes (pictures):

- POST /api/pictures
  - use database picture model to create a new picture, and set the info
  - For the initial upload of a picture (may just want a post POST route though)
  - this will interact with the filesystem on lenin/obama (dont save the picture to the database)
- PUT /api/pictures/:id
  - update picture informaton, ie title and description
  - use middleware so only the owner or an admin can change this
- GET /api/pictures
  - get all pictures, probably paginate this
- GET /api/pictures/:id
  - return the picture for the client to show (could just be url to something hosted on lenin/obama, but then it gets a little tricky to enforce visibility of someone is not logged in)
  - id probably serve it through static middleware that checks your login status first

- DELETE /api/pictures/:id
  - remove a picture from the database

Routes (comments):

(frotator will have all of these routes u can look at if you decide u want comments)
- POST /api/comments:
  - for posting a comment
- GET /api/comments/:id
  - get a single comment
- PUT /api/comments/:id
  - edit comment (use middleware)
- DELETE /api/comments/:id
  - delete a comment

### Frontend (client shit)
React components are rendered into html and are what the user sees in the end, and redux helps manage the frontend state (like storing a list of posts).

Most of the react components work directly with redux as they all have a state. For example when you look at SinglePost page it would probably tell redux to fetch the post from the api (GET /api/post/:id) and then save it in its local state.


You can see this general flow in the example service.
 - client/index.js fetches the examples from GET /api/examples using the redux method fetchExamples
 - server responds to GET request with the list
 - redux recieves this and updates its state in /src/client/store/example
 - react then sees the change to the redux state and re-renders itself (or rather it *reacts* to the changes)

#### Components

A vague list of react components youd probably want if you implement the full posts/pictures/commments layout

- Gallery
  - show this at /gallery
  - Get all of the pictures with GET /api/pictures and display them, will probably look more organized through posts though
  - Show pictures using PictureList
- PictureList
  - given a list of pictures show them in a small gallery style (use Picture components)
- PictureCard
  - picture to display in a PictureList
  - on clicking this make the picture big and show its title and description
    - could use a secondary component for this part
- PostList
  - show this at /gallery/posts (or /posts, backbbone could be specially configured to give two frontend routes)
  - show a list of PostCard components
- PostCard
  - small view of a post, show some of the pictures (PictureList) and title
- SinglePost (/gallery/post/:id)
  - A view of only the post, show its pictures (PictureList) and the related comments
  - later allow the fields to be editable by admins / the uploader
- UploadForm (/gallery/upload)
  - form for uploading posts (userprofile in backbone may be helpful refrence)
  - this will probably have state management within the component itself that isnt linked to the redux (again probably take a look at userProfile)

If you want to make comments youd need some layout like this:
- CommentList
- Comment
- CommentFrom

Note that frotator has comment stuff you could just steal

#### Redux
Many of the react components above will have a corresponding redux state which they will render

- gallery
  - init-state: ```{
    page: 0,
    pictureCount:0,
    pictures: []
  }```
  - actions
    - fetchPictures: request pictures from server with GET /api/pictures (pagination will add page number to the get request), but also make sure to keep track of the total amouont of pictures (or total amount of pages) so you know how many pages to show at the bottom in your react Gallery component
    - gotPictures: given a list of pictures, set the state to the list
    - add Picture(s): given a picture or a list of pictures add it to the state (for infinite scrolling if you dont do pagination)

- postlist
  - nearly identical to the gallery state, except posts this time

- single post
  - init state:```{
    title:"",
    description:"",
    pictures:[],
    comments:[]
  }```
  - all the information about the single post
  - fetchPost: ask server for post info
  - gotPost: like gotPictures
  - updatePost: call PUT route for editing post info (dont need this early on)
  - postComment: call POST api/comments with new comment and wait for response, dispatch the new comment to the posts comment list on success (this may be a bit annoying, but frotator has this exacct process if you want to make it)
  - fetchComments (could use this to update all the comments together instead of updating just one like the above)

- upload form
  - postForm

General note, react tostify is built into backbone already, so you can use the` toast.success("message")` methods to display a notfication without really any effort. A simple example would be in the blueMechanical component in backbone.

