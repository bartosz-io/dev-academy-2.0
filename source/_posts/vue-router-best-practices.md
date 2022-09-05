---
title: Vue Router Best Practices
author: Mauricio Matias C.
avatar: mauricio-matias.jpeg
description: Learn modern Vue best practices with vue-router to build reliable and well-designed route navigation.
date: 2022-09-02
tags: [Vue, Routing]
id: vue-router-best-practices
relatedPost: vue-xss, vue-security-best-practices
---


{% image_fw 1.78 banner.png "vue-router best practices" %}


Hi #VueFriend, in this article we cover best practices around routing in Vue, are you ready?

When your Vue app grows is inevitable to make crucial routing decisions. We have prepared some examples for you and a lot of suggestions, remember, not exists the best choice. It is about balance and tradeoffs. Well, let's play our cards.

<!-- toc -->

Routing is all about flows and information. Think of some streets and avenues in your country. When urban planning politics does not exist, the traffic is horrible, and the accessibility is not the best. In consequence, life is hard. The same could happen on our Vue Apps and lead to dangerous scenarios and bad user experiences. To avoid "dangerous scenarios" check out our related [security article with Vue](https://dev-academy.com/vue-security-best-practices/).

## "vue-router" library

This article covers the vue-router version 4 and officially supported features introduced alongside Vue 3 (the latest version). To learn about breaking changes and more details, check out this [link](https://router.vuejs.org/guide/migration/index.html).

vue-router is the official library for routing in the Vue ecosystem. It has many features that you probably don't know yet 😉.

So, the paragraphs below expose the most relevant features (to review the library and its usage, follow this [link](https://router.vuejs.org/guide/)).

Let's start with the most basic concepts: router-link, router-view, and the router file. RouterLink and RouterView are Vue components that can be used on the template side of another Vue component. On the other hand, the router file defines the details about the routes, which component will be rendered on which one, query params, dynamic routes, nested routes, and more. In other words, the router file defines the behavior and rules for routing your Vue application.

This article assumes that you have a Vue app and you want to improve it, but if you don't have one. You can create a new project and take advantage of the initial setup with the following command.

```sh
npm init vue@latest
```

Select these options (On the Vue Router option, check with `Yes`) as we can see in the following screenshot.

{% img "install.png" "Simple vue 3 initialization with vue-router 4" "lazy" %}

Then, you can explore the `router/index.js` (the by-default routes file) file and the root component `App.vue` to check the code structure.

### Dynamic Routes

This feature allows you to handle routes that are not statically defined and need to change the content by some keys in the URL structure.

Examples:

*   migrami.com/profile/martx12
    
*   migrami.com/profile/naomilip
    
*   shoplatam.com/product/9123983/comments
    
*   shoplatam.com/product/3246013/comments
    

What do you think about the URLs in the example? Do they look familiar to you? There are many ways to achieve the same goal and show different profiles and product comments in the same context and style (in some cases). So, What is the way with Vue?

vue-router has a nice feature for this situation: Dynamic Routes. The following code example shows this situation in code, where the ProfileView and ProductView are components that fetch data from the API to render beautiful views (profile and product) for every example and its keys (username and id).

```js
/* router/index.js */

import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/profile/:username",
            name: "profile",
            component: ProfileView,
        },
        {
            path: "/product/:id",
            name: "product",
            component: ProductView,
            children: [
                {
                    // complete path: /product/:id/comments
                    path: "comments",
                    component: ProductCommentsView,
                },
            ],
        },
    ],
});

export default router;
```

Well, this code works well if one `<RouterView/>` or `<router-view/>` component is included inside the `ProductView` component because it is the parent of the comments route (which renders the `ProductCommentsView` component). But this practice increases the coupling of components in the application, which will be dangerous in the future. Ideally, `ProductView` component could be an independent component that renders general descriptions of one concrete product. So, in the next section (Nested Routes), we solve the problem 😄.

### Nested Routes

You can express relationships using nested route configurations. It implies the usage of the `children` property inside our routes array. The code above contains one child, but it can have more, like this:

```js
const routes = [
    {
        path: "/product/:id",
        name: "product",
        component: ProductView,
        children: [
            {
                // complete path: /product/:id/comments
                path: "comments",
                component: ProductCommentsView,
            },
            {
                // complete path: /product/:id/images
                path: "images",
                component: ProductImagesView,
            },
        ],
    },
];
```

But this example still has the same problem mentioned previously (the `ProductView` component needs the <router-view> to render the children, which introduces more complexity to `ProductView`). To solve this conflict exists one elegant approach. So, this consists of the use of a Void Component (a simple vue file). What does it mean? Well, let's see it in code.

```js
/* EmptyView.vue */

<template>
    <router-view></router-view>
</template>
```

The EmptyView only has the task of being a Joker to render as a parent component. So the routes array on the router file changes a little bit.

```js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/profile/:username",
            name: "profile",
            component: ProfileView,
        },
        {
            path: "/product/:id",
            component: EmptyView,
            children: [
            {
                path: "",
                name: "product",
                component: ProductView,
            },
            {
                // complete path: /product/:id/comments
                path: "comments",
                name: "product-comments",
                component: ProductCommentsView,
            },
            ],
        },
    ],
});

export default router;
```

Note that the first child has the path set as a void string, which means that the `/product/:id` will be handled by this specific route and not by the parent. This process will be repeated as many times as you want.

### Programmatic Navigation

Aside from using `<router-link>` component on the template side (declarative form), we can do this programmatically using the router's instance methods. Remember: Inside a Vue instance, you can use the router instance as `$router`. And you call it as `this.$router.push`.

We have some examples that trigger the same result.

```js
// literal string path
router.push('/profile/amber')

// object with path
router.push({ path: '/profile/amber' })

// named route with params
router.push({ name: 'profile', params: { username: 'amber' } })

// the above examples have the same result: /profile/amber
```

And others use cases.

```js
// with hash: /home#about
router.push({ path: '/home', hash: '#about' })

// with query: /search?q=another+example
router.push({ path: '/search', query: { q: 'another example' } })
```

You can take advantage of string interpolation in JavaScript and add variables inside the URLs.

### History Modes

The new vue router (version 4) has two principal modes to accomplish the task of managing the routes on a client-side Vue app.

#### Hash Mode

It uses a hash character (#) before the URLs defined in the router object. Naturally, `#` is used to go towards HTML elements by Id criteria on the same URL path of the current page. This feature works well because any text introduced after the URL is ignored by the browser. Internally vue-router generates a virtual-navigation logic. But its implementation harms the SEO (Search Engine Optimization) of the Vue app and is not recommended for Blogs or Web Pages that the SEO is crucial. Here is an example of use:

```js
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
    // ...
    ],
})
```

#### HTML5 Mode

Vue-router documentation says that is the recommended mode. But it comes with some fixable issues. First, with this approach, the routes look normal, but if we access the routes that are not the main directly, we get an incontrollable 404 error. We need to add a simple catch-all fallback route to your server to fix it. If the URL path doesn't match any static assets, it should serve the same index.html page that your app lives in, taking back control of your application.

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
    //...
    ],
})
```

## Navigation Architecture


As we mentioned starting this article, cities with streets and avenues created on the fly only mean inefficiency, a lot of work, and chaos in the future. In that sense, it's a good practice to take some time to plan the workflow that your Vue app will have and think about which route design fits.

There does not exist a complete guide to making the perfect vue-routing. Every page application, web app, webpage, single page application, or other has its workflow, features, style, and more. So, this section offers only suggestions that can be taken with care.

The route definition depends on which amount of content you want to show, but this depends too on the functional requirements.

So, think about a simple web application for shopping and some general functional requirements:

*   Profile management
    
*   Shopping cart management
    
*   Shopping feed
    
*   Product management
    
*   Ad service
    
*   Search bar
    
*   more
    

These, as a general draft to think deep on that web application, but first, on the Vue ecosystem, even other frameworks handle these important concepts: components, views, middlewares, and layouts.

The **Component** concept refers to a piece of vue code that can be reused or not on another component, usually the tiniest piece (like a brick to build vast walls) to build complex apps.

**Views** are an abstract concept because they are one component more, with the difference that they could be composed of many components to be used as a page.

**Middlewares** were removed on the new version of the vue-router library. Because Navigation guards are improved to stay, the following code example shows how a per-route guard looks.

```js
const routes = [
    {
        path: "/profile/:username",
        name: "profile",
        component: ProfileView,
        beforeEnter: (to, from) => {
            // reject the navigation
            return false;
        },
    },
];
```

We cover Navigation Guards in detail in the next section. **Middlewares** are not related to vue-router, but this concept is used extensively in Nuxt.

And the concept of **Layouts** uses a nice feature of vue-router "Named Views" layout is like a template with slots that can be replaced with components as needed (as was defined on the router object).

The following code snippet shows how components are passed by the `components` property inside the home route, where the Navbar and Footer are replaceable by any component.

```js
<!-- App.vue -->
<template>
    <div>
        <RouterView name="NavBar" class="navbar"></RouterView>
        <RouterView class="content"></RouterView>
        <RouterView name="Footer" class="footer"></RouterView>
    </div>
</template>
```

This is what the route object looks like.

```js
const routes = {
    path: '/home',
    components: {
        default: () => import('@/pages/Home.vue'),
        NavBar: () => import('@/components/NavBar.vue'),
        Footer: () => import('@/components/Footer.vue'),
    },
},
```

We have one spoiler inside this example, but we will talk about it later (wait for it). 😛

So, we have the necessary knowledge to create a functional route architecture. Take a look our requirements again.

Well, the first step is to identify what requirement needs dedicated routes and what of those are simply components:

*   Profile management, **needs a dedicated route**
    
*   Shopping cart management, **needs a dedicated route**
    
*   Shopping feed, **needs a dedicated route**
    
*   Product management, **needs a dedicated route**
    
*   Ad service, **will be a component**
    
*   Search bar, **will be a component**
    

The second step is answer: How many routes will each requirement really need?

*   Profile management: **/profile**, **/profile/edit** and **/profile/:username**
    
*   Shopping cart management: **/shopping-cart**
    
*   Shopping feed: **/feed**
    
*   Product management: **/product/create**, **/product/:id** and **/product/:id/review**
    

The router array could be implemented like this

```js
const routes = [
    {
        path: "/profile",
        name: "profile",
        component: EmptyView,
        children: [
            {
                path: "",
                component: ProfileView,
            },
            {
                path: "edit",
                name: "profile-edit",
                component: ProfileEditView,
            },
            {
                path: ":username",
                name: "profile-username",
                component: ProfileEditView,
            },
        ],
    },
    {
        path: "/shopping-cart",
        name: "shopping-cart",
        component: ShoppingCartView,
    },
    {
        path: "/feed",
        name: "feed",
        component: FeedView,
    },
    {
        path: "/product",
        name: "product",
        component: EmptyView,
        children: [
            {
                path: ":id",
                component: EmptyView,
                children: [
                    {
                        path: "",
                        component: ProductView,
                    },
                    {
                        path: "review",
                        component: ProductReviewView,
                    },
                ],
            },
            {
                path: "create",
                name: "product-create",
                component: ProductCreateView,
            },
        ],
    },
];
```

You will be wondering, Where are the components? The search bar is a component, but it will be related to a search results page, and now it needs a dedicated page with an URL like this **/search?q=...** But was not mentioned in the visible part of the requirements.

So, it's crucial to denote what is a pure component and what is a view that needs a dedicated route.

## Navigation Guards

To begin, we have Global Guards, Per-route Guards, and In-Component Guards, with massive modes to apply every concept of Guards with vue-router, but we think it is better to review the [official documentation](https://router.vuejs.org/guide/advanced/navigation-guards.html) of Guards with vue-router.

Instead, we have some use cases when it is wise to choose Navigation Guards. As the name says, route guards intercept the flow of navigation to add verifications, validations, or some logic of authorization and authentication.

The next code snippet below covers the three modes mentioned above to ejemplify its implementation.

```js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/profile",
            name: "profile",
            component: EmptyView,
            children: [
            {
                path: "",
                component: ProfileView,
            },
            // -> Implementation of Per-route Guard
            {
                path: "edit",
                name: "profile-edit",
                component: ProfileEditView,
                // Checking write permission before
                beforeEnter: (to, from, next) => {
                if (ProfilePermissions({ write: true })) {
                    next();
                } else {
                    next('/404');
                }
                },
            },
            {
                path: ":username",
                name: "profile-username",
                component: ProfileEditView,
            },
            ],
        },
        {
            path: "/login",
            name: "login",
            component: LoginView,
        },
    ],
});

// -> Implementation of Global Guard
router.beforeEach(async (to, from) => {
    // Verifying if the user is not authenticated
    if (!isAuthenticated && to.name !== "login") {
        return {
            name: "login",
        };
    }
});


// ProfileView.vue
<template>
    <div>Profile View</div>
</template>
<script>
import { sendAnalytics } from "@/analytics/core";

// -> Implementation of In-Component Guard
export default {
    ...
    // Before the route change: send analytics
    beforeRouteLeave(to, from) {
        sendAnalytics({
            to: to.fullPath,
            from: from.fullPath,
        });
    },
    ...
};
</script>
```

First, we have a **Global Guard** to check if the user is authenticated. If not is redirected to the login page.

Second, we have a **Per-route Guard** to verify if the user has permission as a writer.

And the **In-component Guard** is used at the `ProfileView.vue` as an analytics service to track the user moves.

## Lazy load, speed up your app

When we use a bundler to build apps, the JavaScript bundle can become quite extense because all is centralized in one JavaScript file, on consequense, the page load time is affected. It would be more efficient if we have the option to split each route's components into separate chunks, and only load them when the route is visited and required. And thats why the lazy load approach exists.

Do you remember we put a spoiler before? Check it out in the function that returns an import. There is the magic.

```js
const routes = [
    {
        path: "/profile/:username",
        name: "profile",
        component: () => import("@/views/ProfileView.vue")
    }
]
```

When we execute the build command, the dist folder should have a file like this:

```sh
    ProfileView.{SHORT\_HASH}.js ----> dist/assets/ProfileView.8ab749c4.js
```

So, this JavaScript file and component will be loaded on demand.

## Doing it wrong is not hard with vue, keep your app secure

As we exposed in the last Vue article ([Vue Security Best Practices](https://dev-academy.com/vue-security-best-practices/)), every input is a possible door to an unexpected problem. Dynamic routes are indeed a kind of input, thus we have some practices to avoid problems. Check the next dynamic route.

```sh
    /product/:id/review
```

The `id` parameter could be everything. But it's not a good practice to use it as any value and pass it to an API as it is. Of course, the API should have a process to filter this kind of input, but if it is not the correct, the better way is intercept it to in the client side and on the API side as the last resource.

Fortunately, vue-router has its mechanism to validate params with Regex. Try the next code snippet, when the `id` param only should be an integer number.

```js
const routes = [
        ...
    {
        // match only integer numbers
        path: "/product/:id(\\d+)/review",
        name: "product-review",
        component: () => import("@/views/ProductReviewView.vue")
    },
    { 
        path: "/:catch(.*)",
        component: () => import("@/views/ErrorView.vue")
    }
        ...
]
```

You could use the parentheses to put your regular expressions, but if it does not match, the route for error-catching will handle the route flow (path: `/:catch(.\*)`).

Another kind of input is an URL with query params like this:

```sh
    /search?q=la+vaca+lola
```

vue-router has a concept called `props` used to pass it to the target component and delegate its use and validation.

```js
const routes = [
    ...
    {
        path: "/search",
        name: "search",
        component: () => import("@/views/SearchView.vue"),
        props: route => ({ query: route.query.q })
    }
    ...
]

// And now, SearchView.vue has a prop called "query"
<script>
export default {
// Don't forget to define the props properly
    props: {
        query: {
            default: "",
            required: true,
            type: String,
        },
    },
};
</script>
```

Don't use the user input to generate HTML content accessing directly to the DOM. You can be a victim of an XSS attack (visit this [link](https://dev-academy.com/vue-xss/) to prevent XSS attacks on Vue).

## Friendly Remember

We reach the bottom of this large article. We hope that you have enjoyed reading it.

Your route design will be the way that users move. What kind of streets and avenues do you want to build for them? So, as always we say.

> There’s no silver bullet!