---
title: Routing in React 🚀
contributor: Saurabh Ghatnekar
avatar:saurabh-ghatnekar.png
description: Learn how to use React Router to create a single-page application with multiple routes.
date: 2023-02-17
tags: [react, routing]
id: routing-in-react
relatedPost:
---
{% image_fw 1.78 banner.png "Routing in React" %}

# Routing in React

## Introduction


Routing in React JS is a way for a computer program to help you move between different pages or sections in a reactjs
web application. Imagine that you have a special book that has many stories inside. Each story has its own page, and the
book has a table of contents at the beginning that lists all the stories.

When you want to read a different story, you can use the table of contents to find the page number for that story. Then
you can turn to that page and start reading. This is similar to how routing works in a React app.

The different stories in the book are like the different pages or components in a React app, and the table of contents
is like a special tool that helps you move between them. When you click on a link in the table of contents, it takes you
to the right page so you can see the story you want to read.

### React Router


React Router enables "client-side routing". This module provides components to handle routing by defining the routes in
your application and transitioning between them.

Use create react app to quickly create a react app up and running.

   ```bash
npx create-react-app my-app
   ```

To get started with React Router, you will first need to install the react router package. You can **install React
Router** from the public npm registry with either npm or yarn in your react application. You can use the following
command to install react router using npm.

```bash
npm install react-router-dom
```

Once the library is installed, you can import the components you want to use in your application. For example, to use
the **BrowserRouter**, **Route**, **Link,** and other components, you can add the following statement to your code to
import them from the **React router library**

```bash
import { BrowserRouter, Route, Link } from 'react-router-dom';
```

Then, you can use these components to define the routes in your application and specify which components should be
rendered for each route. Here is a simple example of how this might look:

```javascript
//import react first
import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';

function App() {
    return (
        <Router>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                </ul>
            </nav>

            <Switch>
                <Route exact path="/">
                    <Home/>
                </Route>
                <Route path="/about">
                    <About/>
                </Route>
            </Switch>
        </Router>
    );
}

function Home() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}
  ```  

In this example, we are using the **BrowserRouter** component provided by React Router to create a router for our
application. The **Link** component is used to create links between different routes in the app, and the **Switch** and
**Route** components are used to define the individual routes and specify which components should be rendered when the
app is at a particular route.

When the user clicks on one of the links in the navigation, the router will update the URL and render the appropriate
component for that route. This allows the user to navigate between different parts of the app and see the different
components that make up the application.

## React Router Components


### BrowserRouter

BrowserRouter is a component in the react-router-dom library that is used to provide routing functionality to a React
app. It uses the HTML5 history API to keep the UI in sync with the URL, allowing the user to use the back and forward
buttons in the browser and to bookmark a particular page.

Here is an example of how you might use the **BrowserRouter** component in a app:

```javascript
import {BrowserRouter, Route} from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div>
                <Route exact path="/" component={Home}/>
                <Route path="/about" component={About}/>
            </div>
        </BrowserRouter>
    );
}
```

In this example, the **BrowserRouter** component wraps up the entire app and provides the routing functionality to all
of its child components. The **Route** components inside the **BrowserRouter** define specific paths that the app should
render when the URL matches the given path.

### Route

The **Route** component in React Router is a way to define a specific route in your application that a user can navigate
to. It is typically used within a **BrowserRouter** component to define the different routes that are available in your
application. The **BrowserRouter**, sometimes imported as a Router component is a parent component while the Route is a
child component.

The **Route** component takes several props, including **exact**, which you can use to specify that a route should only
match if the path is an exact match. This can be useful if you have multiple routes that have similar paths, and you
want to ensure that the correct route is rendered based on the exact path that the user is trying to access.

Here's an example of how you might use the Route component with the exact prop:

```javascript
//src components
////import react first
import React, {Component} from 'react';

import logo from './logo.svg';
import './App.css';

import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./components/home.component";
import About from "./components/about.component";
import Contact from "./components/contact.component";
import Navigation from "./components/navigation.component";

//App component
const App = () => {
    return (
        <BrowserRouter>
            <Navigation/>
            <Routes>//parent component for Route
                <Route exact path="/" element={<Home/>}>//child component
                    <Route path=":id" element={<Home/>}/>
                </Route>

                <Route path="/about" element={<About/>}/>
                <Route path="/contact" element={<Contact/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
//import app in index or main file

///about.component.jsx
//import react first
import React from "react";

const About = () => {
    console.log("About");
    return (
        <div>
            <h1>About</h1>
        </div>
    );
};

export default About;
//similarly you can create a react component for contact and use export default as follows
//export default Contact;

///home.component.jsx
import React, {Component, useEffect} from 'react';

import {Link} from 'react-router-dom';
import {Card, Grid, Paper} from "@mui/material";
import {useParams} from "react-router-dom";
import axios from "axios";

export const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

//Home component
const Home = ({props}) => {
    const params = useParams();
    console.log("params", params);
    const [userId, setUserId] = React.useState();

    useEffect(() => {
        setUserId(params.id);
    }, [params]);


    return (
        <Grid container flexWrap={"nowrap"} spacing={2}>
            <Grid item xs={3}>
                <Paper>
                    <h2>Users</h2>
                    {userIds.map(userId => (
                        <Card key={userId}>
                            <img src={`https://robohash.org/${userId}`} width={"100"} alt="user"/>
                            <Link to={`/${userId}`}>User {userId}</Link>
                        </Card>
                    ))}
                </Paper>

            </Grid>
            <Grid item xs={9}>
                {userId ? <h1>User Id: {userId}</h1> : <h1>Select user</h1>
                }
            </Grid>
        </Grid>
    );
};

export default Home
```

In this example, we have three routes defined: a home route, an about route, and a contact route. The home route uses a
wildcard **path** prop (**/**) to match any path that starts with a **/**, while the about and contact routes use the *
*exact** prop to specify that the path must be an exact match.

If a user navigates to the **/**path, the home route will be rendered, typically with a home component. If the user
navigates to the **/about** path, the about route will be rendered. And if the user navigates to the **/contact** path,
the contact route will be rendered.

What do you do if a user tries to access a route and none of the path matches with routes defined in the Routes
component?  
We use default route!

```javascript
<Route path="*" element={<Navigate to="/pathA" ... />} />
```

#### Note

React Router v6 introduces a Routes component that is kind of like the Switch component, but a lot more powerful. The
main advantages of Routes over Switch are:

1. Within a <Routes>, every <Route> and <Link> is relative. This results in "Route path" and "Link to" code that is more
   predictable and lighter.

2. Routes are chosen based on the best match instead of being traversed in order. This avoids bugs due to unreachable
   routes because they were defined later in your Switch component.

3. Routes may be nested in one place instead of being spread out in different react components.

### Link and NavLink

The **Link** and **NavLink** components in React Router Dom are used to create links between different routes in your
application. They work similarly to the element in HTML, but they use the **to** prop to specify the target route
instead of the **href** attribute.

Here's an example of how you might use the **Link** component:

```javascript
import {Link} from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            {/* This link will navigate to the "/" route when clicked */}
            <Link to="/">Home</Link>

            {/* This link will navigate to the "/about" route when clicked */}
            <Link to="/about">About</Link>

            {/* This link will navigate to the "/contact" route when clicked */}
            <Link to="/contact">Contact</Link>
        </nav>
    );
}
  ```  

The **NavLink** component is similar to the **Link** component but has additional props that you can use to style the
active link differently. For example, you can use the **activeClassName** prop to specify a class name that will be
applied to the **NavLink** element when the route is active. Here's an example of how you might use the **NavLink**
component:

```javascript
    import {NavLink} from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            {/* This link will navigate to the "/" route when clicked, and the "active" class will be applied when the route is active */}
            <NavLink to="/" activeClassName="active">Home</NavLink>

            {/* This link will navigate to the "/about" route when clicked, and the "active" class will be applied when the route is active */}
            <NavLink to="/about" activeClassName="active">About</NavLink>

            {/* This link will navigate to the "/contact" route when clicked, and the "active" class will be applied when the route is active */}
            <NavLink to="/contact" activeClassName="active">Contact</NavLink>
        </nav>
    );
}
 ```   

### Nested Routing

### Hooks in React Router Dom

**React router component library** provides a set of Hooks that allow functional components to access routing-related
information and perform routing actions.

Here is a list of the hooks that are available in react-router-dom version 6:

**useHistory**: This hook returns an object containing methods for navigating to different routes in the application,
such as push, replace, and goBack.

**useLocation**: This hook returns a location object containing information about the current location, such as the
pathname and search query.

**useParams**: This hook returns an object containing the dynamic parameters in the current URL.

**useRouteMatch**: This hook returns an object containing information about the current route match, such as the path
and the URL.

**useNavigate**: This hook returns a function that can be used to navigate to different routes in the application.

React router and Redux
----------------------

While React Router is used for handling routing in a React application, it can be used with Redux, a state management
library, to manage the application's state.

To use React Router with Redux, you will need to use the **react-router-redux** library, which allows you to bind the
router's state to the Redux store.

To get started, you will need to install both React Router and **react-router-redux**:

```bash
npm install react-router react-router-dom react-router-redux --save
```

Next, you will need to set up your Redux store and configure the react-router-redux middleware:

```javascript
    import {createStore, combineReducers, applyMiddleware} from 'redux';
import {routerReducer, routerMiddleware} from 'react-router-redux';

// Create a history of your choosing (we're using a browser history in this case)
import {createBrowserHistory} from 'history';

const history = createBrowserHistory();

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
    combineReducers({
        router: routerReducer,
        // Other reducers go here
    }),
    applyMiddleware(middleware)
);
```

Then, you can use the ConnectedRouter component from react-router-redux to bind the router to your Redux store:

```javascript
import {ConnectedRouter} from 'react-router-redux';

<Provider store={store}>
    <ConnectedRouter history={history}>
        <App/>
    </ConnectedRouter>
</Provider>
```

With these changes, the router's state will now be managed by the Redux store, and you can access the router's state and
dispatch navigation actions using the Redux dispatch function.

## Frequently Encountered Issues

--------------------------------

There are a few common issues that you may encounter when using React Router:

1. **Route matching issues**: Make sure that your routes are correctly defined and nested. The router will only render
   the first route that matches the current URL, so if you have multiple routes defined with the same path, only the
   first one will be rendered.

2. **404 errors**: If you are using dynamic routes and the URL does not match any of your defined routes, the router
   will render a "404" page. Make sure that you have a catch-all route defined that will match any URL that does not
   match any of your other routes.

3. **TypeScript errors**: If you are using TypeScript, you may encounter errors due to the types of the **history**
   object not being correctly inferred. To fix this, you can use the **@types/react-router** package to provide the
   correct types for React Router.

4. **Server-side rendering issues**: If you are using server-side rendering with React Router, you may encounter issues
   with the router's state not being properly hydrated on the client. To fix this, you can use the *
   *react-router-dom/server** module to render the app on the server and pass the rendered HTML and the router's state
   to the client.

## Summary  
React Router is a popular library for adding routing to a React application. It allows you to define routes and link to
them, and it will handle rendering the correct components when the URL changes.

To use React Router, you will need to install the **react-router-dom** library and wrap your application in a **Router**
component. You can then define your routes using the **Route** component, and use the **Link** component to create links
between your routes.

React Router also provides a number of other components and features, such as route-level code splitting, server-side
rendering, and support for location state and query parameters.

You can use React Router with other libraries such as Redux to manage the application's state, or with TypeScript to add
static type checking to your application.