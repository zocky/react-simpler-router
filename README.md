# A Simpler Router for React

Straightforward dynamic routing for React with well-behaved nested routes. 

Inspired by `react-router`, but simpler, smaller, exclusively web-oriented, and both friendlier and faster for nested routes. See **Differences from `react-router`** below for details.

* [Synopsis](#synopsis)
* [Installation](#installation)
* [Components](#components)
  + [Route](#route)
  + [IndexRoute](#indexroute)
  + [NavLink](#navlink)
  + [Link](#link)
  + [Redirect](#redirect)
  + [IndexRedirect](#indexredirect)
* [Differences from `react-router`](#differences-from--react-router-)
* [Caveats](#caveats)
* [License](#license)

## Synopsis

To display a list of posts at `/posts` and a a particular post at `/posts/...`, use the following:

````html
<Route path="/posts"> 
  <IndexRoute> <ListOfPosts/> </IndexRoute> 
  <Route path=":postId"> <Post/> </Route>
</Route>
````
`<Post postId="my-post">` will be rendered at `/posts/my-post`. What could be simpler?

## Installation
`npm install react-simpler-router --save` or `yarn add react-simpler-router`.

## Components

### Route
````js
import {Route} from "react-simpler-router";
````

The `<Route>` is the main component. It displays its content if the current url matches its path pattern. If the pattern includes arguments (prefixed with `:`), they will be made available to the route's content. 

Routes that are nested within other routes can use relative paths, i.e. paths that don't start with `/`. Their paths will be concatenated to the enclosing route's path. An absolute path in a nested route that doesn't match the containing route will never be rendered.

A route can contain any kind of children. Everything that is within the `<Route>` will be rendered if the route's path matches the current URL. (See **Route Props** for details.)

Nested routes don't have to be nested in parent routes. They can be anywhere on in your code, in any component. With relative paths you can reuse the same multi-routed components in different places in your page hierarchy.

#### Route Props

* `path` - The path pattern for this route. Can include param names prefixed with `:`. Paths can be relative to the containing route.
* `exact` - Should this route match only its own path, or also all subpaths?
* `merge` - Should this route's children receive the params from parent routes? Can be very handy, but make sure that you know which parameters the parent routes accept, so that you don't give the route's children undesired props.
* `render` - An optional function to render the route's contents. It will receive an object of params as its only parameter. This has precedence over `component` and the route's children.
* `component` - An optional react component class or function, which will be created and supplied with route's params as props. This has precedence over the route's children.
* `children` - If neither `render` nor `component` is supplied (the most common scenario), the route's children will be rendered. Any direct descendents of the `<Route>` component will be given the route's params as props.

#### Examples

##### Basic routing

````html
<Route path="/" exact>
  Displayed only on the home page
</Route>
<Route path="/">
  Displayed on all pages
</Route>
<Route path="/foo">
  Displayed at /foo and all subpages
  <Route path="bar" exact>
    Displayed only at /foo/bar
  </Route>
</Route>
````

##### Routes with params

````html
<Route path="/posts" exact>
  <ListOfPosts/>
</Route>
<Route path="/posts/:postId">
  <PostMenu/>
  <Post/>
</Route>
````
Will render 
* `<ListOfPosts/>` at /posts
* `<PostMenu postId="my-post"/>` and `<Post postId="my-post"/>` at /posts/my-post

##### Merged params

````html
<Route path="/blogs">
  <Route path="" exact>
    <h1>List of Blogs</h1>
    These are the blogs on this website:
    <ListOfBlogs/>
  </Route>
  <Route path=":blogId">
    <BlogHeader/>
    <Route path="" exact merge>
      <ListOfPosts/>  	        
    </Route>
    <Route path=":postId" merge >
      <Post/> 
    </Route>
  </Route>
</Route>
````
Will render:
* `<ListOfBlogs/>` at /blogs
* `<BlogHeader blogId="my-blog"/>` at /blogs/my-blog and subpages
* `<ListOfPosts blogId="my-blog"/>` at /blogs/my-blog
* `<Posts blogId="my-blog" postId="my-post"/>` at /blogs/my-blog/my-post

### IndexRoute
````js
import {IndexRoute} from "react-simpler-router";
````

Works exactly as `<Route path="" exact>`. Useful for content that should appear only on the home page or only on a given level in your nested routes. Accepts the same props as `<Route>` except `path` and `exact`.

### NavLink
````js
import {NavLink} from "react-simpler-router";
````

Create a router-aware link. Use for internal links instead of `<a>`. If the link is active (i.e. it points to the current URL), it will have the class `active` or any class of your choice. Relative links (i.e. those not beginning with `/`) will have their `to` property concatenated with the containing route's URL, i.e. `<NavLink to="bar">` inside `<Route path="/foo">` will point to /foo/bar.

#### NavLink Props

* `to` - The target URL.
* `exact` - Should this link be active only at its own path, or also all subpaths?
* `text` - You can optionally provide the text for the link. Otherwise the children of `<NavLink>` will be used.
* `children` - If `text` is not supplied, the NavLink's children will be rendered.
* `className` - Will be *always* passed down to the rendered `<a>` element.
* `activeClassName` - Will be added to the `className` only when the link is active.
* `style` - Will be passed to the rendered `<a>`. 
* `role` - Will be passed to the rendered `<a>`.

### Link
````js
import {Link} from "react-simpler-router";
````
Poor man's `<Navlink>`. Works the same, but does not track its active state, and does not accept the `activeClassName` prop.

### Redirect
````js
import {Redirect} from "react-simpler-router";
````
Whenever a `<Redirect>` is mounted, it will redirect to the supplied target.

#### Redirect Props

* `to` - The target URL.

### IndexRedirect
````js
import {IndexRedirect} from "react-simpler-router";
````
Works exactly as `<IndexRoute><Redirect to="..."></IndexRoute>`. Useful e.g. for redirecting to default subpages at pages
where you have nothing to display.

## Differences from `react-router`

* There is no `<Router>` component. Simply use `<Route>` wherever you want to display content only at certain URLs.
* Links and routes inside other routes can be relative to the parent route. `<Route path="foo"><Link path="bar"></Route>` will display at `/foo` and link to `/foo/bar`.
* In nested routes, only the route or link that was changed will be re-rendered. `react-router` re-renders everything inside a top-level route.
* A `<Route>` can contain anything, text, html, other routes, or any child components. Components that are placed directly inside `<Route>` will receive route path params as props.
* If you use the `render` property on route, the supplied function receives the params object as its only argument.
* There are no `precise` and `sensitive` props for routes or links. All ending slashes are ignored, all paths are case-sensitive.
* `react-simple-router` is intended only for use in the browser, making it simpler. If you need `react-native` or other environmenst, `react-router` might be a better bet.

## Caveats

* Like `react-router`, `react-simpler-router` depends on React context. This is the only way to have nested routes that are not direct children of their containg routes. Read https://reactjs.org/docs/context.html for more details on this.
* `react-simper-router` is a new piece of software. It is not known or thought to contain any fatal bugs, but it has not been extensively tested in production, so test your apps well before publishing. Please report any bugs on github.

## License
Published under ISC license. Developed for [ZanyAnts.com](http://www.zanyants.com/).