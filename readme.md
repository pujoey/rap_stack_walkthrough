# The RAP Stack
### Or: Dragging Rails Kicking and Screaming Into the 2010s

![DOOM](https://impossiblecity.files.wordpress.com/2009/03/doom-753530.jpg)
> A lotta guys wondering where they stacks went.

Rails actually works incredibly well to serve up a headless API, but it requires a few changes from how we're used to doing things, and it's a good idea to slightly modify things. Additionally, if we want to authenticate with JWTs, there are a few other things that need to happen. This intro will be divided into two parts: first, a field guide to the changes you need to make to your app to turn it into a headless API, and second, the infrastructure you need to add for token-based authentication.

## Pt. 1: Derry Got Back(-end)
In the `client` folder, please find a very slightly adjusted version of the Uncle Derry Angular app from last hour. Note that the only things that have changed are the path of the URL– we're going to let Rails have its grammatically-correct pluralization– and `_id` in a few places is now Postgres-approved `id`. 

Now, let's check out `server/derry_backend`. Note just how *tiny* this app is compared to the Rails apps you're used to: the `app` folder is only `controllers` and `models`– no views, no assets. This app exists for one purpose and one purpose only: to serve up fish (?).

Besides taking things away (I took away a *lot* of cruft), there are a few things we need to add or change. I'm going to zoom in from application-level changes to controller-level changes. The models are practically unchanged.

### First: Cross-Origin Resource Sharing
It's a good idea, in general, to have your headless (i.e. not rendering views) API and your client-side app in different places. Since the domain from which you'll be serving the front end will be different from the domain where you serve the back-end, you need to enable cross-origin resource sharing on the back end. Even if you run everything locally, the front end will be using `server` to be served from `localhost:8000`, and the back end will be using `rails s` to serve from `localhost:3000`. Even though they're both serving from your computer, being on different ports means they're on different origins. 

Luckily, there's a similar solution to saying `require('cors')` in our MEAN apps. In this case, we can add `rack-cors` to our `Gemfile`, like so: 

```ruby
gem 'rack-cors'
```

Then, just like we use our CORS middleware to handle our requests, we can use the middleware we just included in the `Gemfile`. To `config/application.rb` we add:

```ruby
config.middleware.use Rack::Cors do
  allow do
    origins '*'
    resource '*', :headers => :any, :methods => [:get, :put, :post, :delete, :options]
  end
end
```
This is an extremely (dangerously, even) permissive CORS policy. It's saying that we can access any of our routes from anywhere on the Internet, at all of the interesting HTTP methods. Middleware is by now a pretty familiar, well-worn concept for us, and it behaves here quite similarly to how it does in MEAN apps. At this point, once you've installed the CORS gem and inserted it into your middleware, you're ready to start making cross-domain AJAX requests. 

### Second: Namespacing Our Routes 
Take a second to run `rake routes` from `server/derry_backend` and note what prints out– where'd all that `/api/[...]` come from? Open up `config/routes.rb` and check out what our calls to `resources` are wrapped in– by saying `namespace :api`, I told our Rails router to expect a few things:

* First, to expect these controllers' names to be prefixed with `Api::` (e.g. `Api::FishController`).
* Second, to expect these controllers to be in `app/controllers/api`.
* Third, to expect these routes to be accessible from `/api/[whatever route we would usually access it at]`. 

Why do this? 

Rails can actually serve two apps at once: as Phil said, your code is worthless; your data is what's valuable. With Rails, if you want a few controllers to render views, and other controllers to just serve JSON, they can both be backed up by the same models. In this case, it's extremely useful to us to have our routes namespaced, so that we know exactly what kind of data and functionality we're dealing with. 

> Side note: when I was at Everlane, our app had both a non-API half and an API half– one of the big ongoing tasks was gradually migrating functionality over to the API half.

### Third: Serving JSON
Now, check out `app/controllers/fish_controller`. We've seen that we don't even *have* an `app/views` folder, and yet we're not getting any errors. Why? The secret lies in `render json:`. In this case, Rails is smart enough to call `as_json` on the models you're sending back, and send it back as JSON. Since Angular is expecting JSON, this works seamlessly. If I were to have forgotten to explicitly send back JSON, it would have looked for a view to render, not found one, and returned an error. 

## Pt. 2: JWT Damn It
We're switching gears a little. Specifically, we're switching from the front end client app over to Postman, to see how to implement something like Token Slinger (which we saw yesterday) in Rails. Once again, this isn't even a codealong– this is an orientation. The code included in `server/derry_backend` is totally ready to go. 

### First: Requiring JWT
Ruby has a really nice implementation of a JWT encoder/decoder available as a gem. Once again, if we look in our `Gemfile`, we see:
```ruby
gem 'jwt'
```
This gives us access to a module that can encode and decode stuff for us. Still, it'd be a little clunky to do all of the encoding and decoding in our controllers. Let's abstract some of it out to a helper module. 

### Second: `module AuthToken`
Open up `lib/auth_token.rb`. Observe that it's a module– this is a _singleton_, similar to Angular services. It's included everywhere in our Rails app, so we can use its methods in our controller.

`AuthToken.encode` takes a hash to encode, sets an expiration date (called here `ttl_in_minutes` and set to 30 days), and uses JWT to encode it as a hashed string. It also uses Rails's built-in secret key to encrypt it– someone who intercepts a JWT token between the server and us would have a tricky time decoding it without the secret. Thanks, JWT!

`AuthToken.decode` is much the same– it takes a hashed string, feeds it through the inverse of JWT's hashing algorithm with the secret as a key, and gets out a Hash with Indifferent Access (so you can say `hash[:key]` or `hash["key"]` and they work the same. If we go over to `users_controller.rb`, we'll see how this is applied. 

### Third: `api/token` and `api/me`
If we look at `UsersController`, we see three methods– `create`, `token`, and `me`.

* `create` is our classic method to make a new user. It's not terribly interesting.
* `token` is interesting. Note that it finds and authenticates a user– if the user authenticates correctly, it sends back a token containing the user's email. This is all the data we need at this point! As long as you're using HTTPS (which Heroku does by default), the encrypted email address can be used to find and authenticate a user.
* `me` is also interesting– it has the same header parsing as in yesterday's Token Slinger exercise, and can be used as a template for token-based authentication in general. It shouldn't be a stretch of the imagination to think of wrapping the logic to decode the authorization token and find a user in a `before_filter` to make a route require authorization. 

You can interact with these methods using Postman (or Angular!) exactly how you interacted with Token Slinger yesterday– at this point, I encourage you to!