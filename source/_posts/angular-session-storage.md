---
title: Session Storage in Angular
contributor: A M Sanjeev
avatar: a-m-sanjeev.jpg
description: Learn how to create and validate Angular Forms.
date: 2023-03-17
tags: [angular]
id: angular-session-storage
relatedPost: 
bannerHeader: ''
---

## Table of Contents
<!-- toc -->

## Introduction

Local Storage, Session Storage, and Cookies are all terms that most of us are familiar with. But what are they exactly, what problems do they solve, and how do they differ? This article will explain what problems they solve, how they differ, as well as how to use sessionStorage in a simple Angular Project.

## What is Local Storage, Session Storage, or Cookies?

Session storage and local storage in browsers allow us to store data alongside stateless HTTP requests. They are an alternative to cookie-based storage and have several applications in web development. Cookies are the most well-known and oldest mechanism.

They all function similarly, but there are some key differences between them.

Local and session storage is storage mechanisms provided by Web Storage API that you can use to store data on the client's computer. They allow a website to keep data on the browser and instruct the browser to access it later.

Depending on your needs, you can store data either locally or temporarily in session storage. Even though these storage techniques are comparable to cookies, they do not give rise to the same privacy issues.

### Local storage

Most web applications now require user input, whether for a username, address, browser cache, or even a preference setting. This input is then typically routed to a server somewhere for processing and storage. What if your application needs to keep data locally on the user's computer? This is where Local Storage enters the picture. It is the most recent mechanism. Local storage is useful for storing data that a user will need later, such as offline data.

Local Storage stores data in key/value pairs. The key is analogous to the data's name, and the value is analogous to the data itself. To keep data in Local Storage, you must first generate a key. After that, you can store whatever data you want under that key.

### Session storage

Session storage is similar to cookies in that data is only stored for the duration of the current session. When a user closes their browser or a tab, the web app clears the data and deletes any previously stored information. Session storage is useful for storing sensitive data, such as login credentials.

Session Storage is an excellent way to improve the performance of your web applications by reducing the amount of data transferred between the client and server. It can also be used to store data more securely because the data is not stored in cookies where third-party sites can access it.

### Cookies

Cookies are the most ancient and well-known mechanism. They are easy to use and are widely supported by browsers. They are, however, limited to 4KB of data and are frequently used to keep non-sensitive data, such as user preferences.
## Angular session storage
Let's look at how to store, get, delete specific data, or remove all data in Angular's sessionStorage.

API methods for working with key/value pair data are incorporated into session storage.

It should be noted that both key and value are string types, and if you want to keep a different data type, you must convert it to a string first.

### Saving Data using sessionStorage

Create a dataSave() function in the `app.component.ts` file to store data in sessionStorage.

    dataSave(){
    }
    
Use `setItem` within the `dataSave()` function to keep the name in the sessionStorage.

Syntax:

    sessionStorage.setItem('key', 'value');

Thus, this is how our `app.component.ts` will appear:

    import { Component } from '@angular/core';
    
    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'new_project';
    
      dataSave(){
        sessionStorage.setItem('name', 'Sanjeev');
      }
    }

Now, open the `app.component.html` file and add a button to the `dataSave()` function with a click event. As a result, the `app.component.html` file will look something like this.

        &lt;h1&gt;Angular sessionStorage&lt;/h1&gt;
        &lt;button (click)="dataSave()" &gt; Save data to sessionStorage&lt;/button&gt;
![](https://images.surferseo.art/b826c09b-4a3f-4603-aff5-7a5e4df827e6.png)

When you click the "Save data to sessionStorage" button, the key "name" and the value "Sanjeev" will be saved.

This can be verified by inspecting the page and going to `application &gt; session storage`.

![](https://images.surferseo.art/3d7364f6-de1d-43ac-9155-140e20d98e81.png)

If we close the browser or this tab, the session data stored will be automatically cleared.

### Retrieve data from session storage

We will add a `get()` function to our `app.component.ts` file to retrieve and display the data stored in session storage.

    get(){
    }
Within the `get()` function, we will use `getItem` to retrieve data from the sessionStorage based on the key.

Syntax:

    sessionStorage.getItem('key');
Thus, this is how our code in the `app.component.ts` will appear:

    import { Component } from '@angular/core';
    
    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'new_project';
    
      dataSave(){
        sessionStorage.setItem('name', 'Sanjeev');
      }
    
      get(){
        return sessionStorage.getItem('name');
      }
    }
To display the data stored in session storage, add a `p` tag to the `app.component.html` file and call the `get` method within that `p` tag.

    &lt;h1&gt;Angular sessionStorage&lt;/h1&gt;
    &lt;button (click)="dataSave()"&gt;Save data to sessionStorage&lt;/button&gt;
    &lt;p&gt;{{ get() }}&lt;/p&gt;
![](https://images.surferseo.art/9a2abcdb-a4b0-41da-8ab1-22dfb7879e6f.png)

### Deleting data based on key

For deleting the data saved in session storage based on the key, first, we will create a `dataRemove()` function in the `app.component.ts` file.

    dataRemove(){
    }
Inside the `dataRemove()` function add `removeItem` to remove specific data from the sessionStorage based on key.

Syntax:

    localStorage.removeItem("key");
Thus, this is how `app.component.ts` will appear:

      dataRemove(){
        sessionStorage.removeItem('name');
      }
After this, add a button in `app.component.html` file that'll help us remove the stored data.

    &lt;button (click)="dataRemove()"&gt;Remove data from sessionStorage&lt;/button&gt;
![](https://images.surferseo.art/fbec3866-a2e1-424c-9429-7d0c4f945c0a.png)

Note: To clarify things, you can store multiple data in session storage and then use this method to remove specific data.

For example, I've added a few additional data to our session storage, and I'll specifically remove the data with key value as Name.

    dataSave(){
        sessionStorage.setItem('Name', 'Sanjeev');
        sessionStorage.setItem('Country', 'India');
        sessionStorage.setItem('Age', '22');
      }
      dataRemove(){
        sessionStorage.removeItem('Name');

### Delete all data from session storage

For deleting all data from session storage first we'll create a `deleteAll()` function in the app.component.ts file.

    deleteAll(){
    }
Now in this function, we will use clear to delete all data from session storage.

Syntax:

      deleteAll(){
        sessionStorage.clear();
      }
Now, add a button to clear all data in the app.component.html file with a click event.

    &lt;button (click)="deleteAll()" &gt;Clear sessionStorage&lt;/button&gt;
![](https://images.surferseo.art/4246c03f-bb4f-46ad-b31a-de6d9605ec67.png)

In the end, our files will look like this:

`app.component.ts` file

    import { Component } from '@angular/core';
    
    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'new_project';
    
      dataSave(){
        sessionStorage.setItem('name', 'Sanjeev');
      }
    
      get(){
        return sessionStorage.getItem('name');
      }
    
      dataRemove(){
        sessionStorage.removeItem('name');
      }
    
      deleteAll(){
        sessionStorage.clear();
      }
    }
    
`app.component.html` file

    &lt;h1&gt;Angular sessionStorage&lt;/h1&gt;
    &lt;button (click)="dataSave()"&gt;Save data to sessionStorage&lt;/button&gt;
    &lt;p&gt;{{ get() }}&lt;/p&gt;
    &lt;button (click)="dataRemove()"&gt;Remove data from sessionStorage&lt;/button&gt;
    &lt;button (click)="deleteAll()" &gt;Clear sessionStorage&lt;/button&gt;

## Angular Local storage

A localstorage object can be set, accessed, removed, or cleared with a single line of code, just like session storage.

### Save data in localstorage

A localstorage object can be set with a single line of javascript code, just like session storage.

    localStorage.setItem("key", "value");

### Retrieve data from localstorage

    localStorage.getItem("key");

### Remove specific data from localstorage based on key

    localStorage.getItem("key");

### Remove all data from localstorage

    localStorage.getItem("key");

## Conclusion

We learned about local storage and session storage, and we built a simple application with session storage. We saved data, viewed data, deleted some data, and deleted everything. The task for you in deleting specific data is to add more data to session storage and then try deleting one specific data.

## The next steps

Learn more about Angular and about 2FA, time-based one-time passwords, and [how to request OTP](https://dev-academy.com/angular-otp-verification/) verification using Angular. Discover how to use Angular Guard, AuthService, AuthGuard Implementation, and [Routing Module Implementation](https://dev-academy.com/angular-router-guard-rbac/) and how to serve your [Angular application via HTTPS locally](https://dev-academy.com/running-angular-cli-over-https/).