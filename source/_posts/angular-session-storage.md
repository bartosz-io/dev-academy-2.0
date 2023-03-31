---
title: Session Storage in Angular
contributor: A M Sanjeev
avatar: a-m-sanjeev.jpg
description: Learn how to use Session Storage in Angular.
date: 2023-03-17
tags: [angular]
id: angular-session-storage
---
{% image_fw 1.78 banner.png "Session Storage in Angular" %}

## Table of Contents
<!-- toc -->

## Introduction

Local storage, session storage, and cookies are all terms that most of us are familiar with. But what are they exactly, what problems do they solve, and how do they differ? This article will explain what problems they solve, how they differ, as well as how to use `sessionStorage` in a simple Angular project.

## What is Local Storage, Session Storage, and Cookies

In web development, session storage and local storage are useful alternatives to cookie-based storage for storing data alongside stateless HTTP requests. Although cookies have been around for a long time and are well-known, developers can reap several benefits by using session storage and local storage.

Session storage and local storage are two storage mechanisms that allow developers to store data on the client-side, which implies that the data is saved locally in the user's browser. Compared to cookies, these two storage methods offer numerous advantages. However, there are some key differences between the two.

Session storage is intended for retaining information within a particular browsing session. In essence, any information stored in session storage is erased once the user terminates the browser window or tab. On the other hand, local storage stores data permanently, until it is manually deleted by the user or cleared by the developer.

Because of these differences, session storage is more suitable for storing temporary data that is only needed for the duration of a single browsing session. Local storage, on the other hand, is more appropriate for storing data that needs to persist between multiple browsing sessions.

Overall, session storage and local storage are both useful tools for web developers, providing an efficient and secure way to store data on the client-side without relying on cookies.

### Local Storage

In the current era of web applications, user input plays an integral role in achieving various objectives such as registration, buffering, and personalization. This information is generally sent to a server for further processing and storage. However, there are certain scenarios where it becomes essential to store data locally on the user's device, especially when offline access is desired. This is where local storage comes in handy, offering a means to store data on the client-side rather than on a remote server, and providing several advantages over traditional server-based storage.

Local storage is a relatively recent technology that enables developers to store data on the user's device itself. This approach offers several benefits, such as faster access to data, improved privacy, and reduced server load. Local storage operates on the principle of a key-value pair, where the key represents the name of the data and the value represents the data itself. Developers can use programming languages such as JavaScript, which supports the Web Storage API, to create and store the key-value pairs in local storage.

Storing data on the user's device using local storage is particularly advantageous when it comes to preserving data that may be useful later on, such as customized settings, offline data, personal preferences, etc. This technique allows developers to design applications that are highly responsive and resilient, working seamlessly both online and offline, leading to an improved user experience and satisfaction. By leveraging local storage, web applications can continue to function effectively, even when users have no internet connection.

### Session Storage

Session storage is a popular mechanism for storing data on the client-side in web applications. It works similarly to cookies, but with some notable differences.

Cookies and session storage both serve as storage options for data used during a user's session. However, session storage is designed to automatically clear stored data when the user closes their browser or tab. This ensures that any sensitive information, such as login details, aren't at risk of being exposed long-term.

Session storage stands out from cookies in that it directly stores data on the user's device without constantly communicating with the server. As a result, it reduces server load and improves performance by providing faster and more efficient data access. Additionally, since the data is stored on the user's device, it can offer more stable and reliable performance over time. This long-term exposure to the stored data enhances its reliability when compared to data that is frequently exchanged between the server and client. Therefore, session storage is a vital tool for developers who prioritize both performance and reliability in their web applications.

Overall, session storage is an essential tool for web developers who require temporary and secure data storage. By using session storage, developers can create more user-friendly and resilient applications that safeguard user privacy and enhance their experience. Session storage is an excellent way to optimize web application performance by reducing the amount of data transferred between the client and server. Furthermore, session storage is a more secure option for storing data because it is not stored in cookies, which third-party sites can access.

In summary, session storage provides a reliable, efficient, and secure way to store data temporarily on the user's device, making it an indispensable tool for web developers looking to enhance their web applications' performance, reliability, and security.

### Cookies

When a user visits a website, a user's browser receives little data packets called cookies. On the user's device, these data packets are normally saved as text files. Cookies have the ability to retain a variety of data about a user's interactions with a website, including login information, browsing history, and user preferences.

Temporary cookies known as session cookies are only active while a user is on a website. In order to save the user from continually entering their login information, they are used to save information about the user's current session, such as their login status. On the other hand, persistent cookies are those that stay on the user's computer even after they leave a website. These cookies can be used to remember user preferences across different website visits, such as the preferred language or theme.

Although cookies can improve a user's experience on a website, their use raises several privacy issues. One problem is the potential privacy hazards linked with cookies. Cookies can be used to follow a user's activity across numerous websites, which some users may find intrusive because they can store information about the user. The possibility for cookies to be used maliciously, such as to steal login passwords or personal data, is another issue.

## Angular Session Storage

Let's look at how to store, get, delete specific data, or remove all data in Angular's `sessionStorage`.

API methods for working with key-value pair data are incorporated into session storage.

It should be noted that both key and value are string types, and if you want to keep a different data type, you must convert it to a string first.

### Saving data using sessionStorage

Create a `dataSave()` function in the `app.component.ts` file to store data in `sessionStorage`.

```typescript
dataSave(){
}
```
    
Use `setItem` within the `dataSave()` function to keep the name in the `sessionStorage`.

Syntax:

```typescript
sessionStorage.setItem('key', 'value');
```

Thus, this is how our `app.component.ts` will appear:

```typescript
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
```

Now, open the `app.component.html` file and add a button to the `dataSave()` function with a click event. As a result, the `app.component.html` file will look something like this.

```html
<h1>Angular sessionStorage</h1>
<button (click)="dataSave()">Save data to sessionStorage</button>
```

{% img "save-data.jpg" "Save data in angular session storage" "lazy" %}

When you click the "Save data to sessionStorage" button, the key "name" and the value "Sanjeev" will be saved.

This can be verified by inspecting the page and going to `application > session storage`.

{% img "session-storage.jpg" "Verify saved data in angular session storage" "lazy" %}

If we close the browser or this tab, the session data stored will be automatically cleared.

### Retrieve data from Session Storage

We will add a `get()` function to our `app.component.ts` file to retrieve and display the data stored in session storage.

```typescript
get(){
}
```
Within the `get()` function, we will use `getItem` to retrieve data from the `sessionStorage` based on the key.

Syntax:

```typescript
sessionStorage.getItem('key');
```

Thus, this is how our code in the `app.component.ts` will appear:

```typescript
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
```

To display the data stored in session storage, add a `p` tag to the `app.component.html` file and call the `get` method within that `p` tag.

```html
<h1>Angular sessionStorage</h1>
<button (click)="dataSave()">Save data to sessionStorage</button>
<p>{{ get() }}</p>
```

{% img "view-data.jpg" "View Data in angular session storage" "lazy" %}

### Deleting data based on key

For deleting the data saved in session storage based on the key, first, we will create a `dataRemove()` function in the `app.component.ts` file.

```typescript
dataRemove(){
}
```

Inside the `dataRemove()` function add `removeItem` to remove specific data from the `sessionStorage` based on key.

Syntax:

```typescript
localStorage.removeItem("key");
```

Thus, this is how `app.component.ts` will appear:

```typescript
dataRemove(){
  sessionStorage.removeItem('name');
}
```

After this, add a button in `app.component.html` file that'll help us remove the stored data.

```html
<button (click)="dataRemove()">Remove data from sessionStorage</button>
```

{% img "remove-data.jpg" "Remove data in angular session storage" "lazy" %}

> Note: To clarify things, you can store multiple data in session storage and then use this method to remove specific data.

For example, I've added a few additional data to our session storage, and I'll specifically remove the data with key value as Name.

```typescript
dataSave(){
    sessionStorage.setItem('Name', 'Sanjeev');
    sessionStorage.setItem('Country', 'India');
    sessionStorage.setItem('Age', '22');
  }
dataRemove(){
    sessionStorage.removeItem('Name');
```

### Delete all data from Session Storage

For deleting all data from session storage first we'll create a `deleteAll()` function in the `app.component.ts` file.

```typescript
deleteAll(){
}
```
Now in this function, we will use clear to delete all data from session storage.

Syntax:

```typescript
deleteAll(){
  sessionStorage.clear();
}
```
Now, add a button to clear all data in the `app.component.html` file with a click event.

```html
<button (click)="deleteAll()">Clear sessionStorage</button>
```

{% img "clear-data.jpg" "Clear all data in angular session storage" "lazy" %}

In the end, our files will look like this:
```typescript app.component.ts
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
```
    
```html app.component.html
<h1>Angular sessionStorage</h1>
<button (click)="dataSave()">Save data to sessionStorage</button>
<p>{{ get() }}</p>
<button (click)="dataRemove()">Remove data from sessionStorage</button>
<button (click)="deleteAll()">Clear sessionStorage</button>
```

## Angular Local Storage

A `localStorage` object can be set, accessed, removed, or cleared with a single line of code, just like session storage.

### Save data in localStorage

A `localStorage` object can be set with a single line of javascript code, just like session storage.

```typescript
localStorage.setItem("key", "value");
```

### Retrieve data from localStorage

```typescript
localStorage.getItem("key");
```

### Remove specific data from localStorage based on key

```typescript
localStorage.removeItem("key");
```

### Remove all data from localStorage

```typescript
localStorage.clear();
```

## Conclusion

We learned about local storage and session storage, and we built a simple application with session storage. We saved data, viewed data, deleted some data, and deleted everything. The task for you in deleting specific data is to add more data to session storage and then try deleting one specific data.

## The next steps

Learn more about Angular and about 2FA, time-based one-time passwords, and [how to request OTP](https://dev-academy.com/angular-otp-verification/) verification using Angular. Discover how to use Angular Guard, AuthService, AuthGuard Implementation, and [Routing Module Implementation](https://dev-academy.com/angular-router-guard-rbac/) and how to serve your [Angular application via HTTPS locally](https://dev-academy.com/running-angular-cli-over-https/).
