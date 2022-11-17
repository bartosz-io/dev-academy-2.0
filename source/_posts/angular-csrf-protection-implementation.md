---
title: CSRF protection in an Angular application 🔐 - How to implement?
contributor: Peter D. Mobley
link: https://geogram.com
avatar: peter-mobley.jpg
description: Learn how to implement Cross-site Request Forgery (CSRF) Protection in Angular.
date: 2022-02-23
tags: [angular, security]
id: csrf-protection
relatedPost: angular-xss
---
<!-- BANNER NEEDED -->
{% image_fw 1.78 "banner.png" "How to implement CSRF protection in an Angular application" %}

## Table of Contents
<!-- toc -->

## A little Introduction

For those of you who have been working with the Angular framework throughout the last few years, you DEFINITELY know how much it has changed since — dare I say it — the old "AngularJS" days. That was back when the term "framework" was barely a term when it came to the client-side of the web.

Back then the term "web frameworks" was used very little back in 2010, when the original iPhone was just released — heck, the thought of "responsive" websites was in its infant stage as well.

It has now been 12 years since that original release came out, from the halls of Google where AngularJS was born, and as of January 1st, 2022 Google no longer updates AngularJS to fix security, browser compatibility, or jQuery issues.

In 2007 XSS and CSRF (cross-site request forgery) entered the OWASP Top 10 at 5th place, which remained until 2010. In 2013, it dropped to 8th place, and finally, in 2017 it disappeared from the top 10 altogether due to an overall low incidence rate as well as many automated solutions built into modern web frameworks.

The reason I mention the history of Angular is that though the first version developed, \[trigger warning\] which rather sucked, taught us many things about how single-page website applications should be built so that they are secure for the users who use them.

The team at Google rebuilt that first iteration, eliminated numerous security vulnerabilities, and has made Angular what it is known to be today — to be one of the leading development frameworks we use.

## More Introductions... CSRF token

Today's blog post will be about implementing CSRF protection on a backend for an Angular app. What the heck is CSRF anyway?

CSRF or Cross-Site Request Forgery is a way to perform malicious activities on a web platform without the victim knowing about it. There are various methods where an attacker might implement this, but one example works by simply using a fake image tag that points to a URL controlled by the attacker.

The idea behind CSRF is that, because you're not entering the URL manually (or your browser isn't), there's no way for you to distinguish it from an actual link with a website.

### Cross-site Request Forgery Attack example

In a cross-site request forgery, an attacker is out to trick the user into going to another website, (such as _evilwebsite.com_) with malicious code which secretly sends requests to other application servers (like _internet-bank.com_) on behalf of the user.

When the user is signed into the _internet-bank.com_ website, for example by using a login form, and then the user opens an email and clicks a link to _evilwebsite.com_, the malicious website could immediately send a request to _internet-bank.com_ servers.

It might be a request to transfer money from the user's account to the attacker's account. The browser will automatically send the authentication cookie (and any other cookies) with the malicious request header.

If the servers for _internet-back.com_ don't have CSRF protection implemented, the servers can't tell the difference between legitimate post requests from their website and forged post requests from _evilwebsite.com_.

{% img "CSRF-hacking-example.png" "CSRF Attack Example" "lazy" %}

These CSRF attacks are very easy to be accomplished if the website is not protected against them. Unfortunately, because of this, many websites are vulnerable to CSRF attacks since it has been known by hackers for a long time now.

### How can you prevent a CSRF attack in an Angular Application?

The best way to stop CSRF attacks for Angular apps is using the default synchronicity of XHR requests. Yes, you heard right. The very same technology used to send data from the client-side to be processed on a server can also be used to prevent CSRF attacks.

To enable Angular CSRF protection in an application three things need to happen:

1) Every XHR request sent out has to include a custom HTTP header with a specific name and value; this can also be coupled with the user's session id token called "double submit cookie method". Be wary of this implementation however since it is known to have vulnerabilities when you don't control all the sub-domains of the origin.

2) The server checks for the presence of that header and makes sure the request header value matches what was sent on the client-side, otherwise we will know its a malicious request

3) All browsers implement the _same origin policy,_ so that only code from the website on which cookies are set can read the cookie named xsrf token.


{% img "CSRF-token-cookie-example.png" "CSRF protection implimentation" "lazy" %}


The entire process of sending HTML forms over HTTP requests (for example; sending a POST request to the application server) has always been insecure; this is nothing new. This is why we have CSRF (Cross-Site Request Forgery) protection. And it's really easy to implement, too!

{% banner_ad "wsf_bundle.gif" "https://dev-academy.teachable.com/p/web-security-fundamentals" %}

Let's Implement CSRF Protection in Angular using CSRF tokens
------------------------------------------------------------

To begin the process of implementing CSRF Protection (also known as XSRF protection; or "sea surf," session riding, cross-site reference forgery, and hostile linking) we need to begin to understand the steps from the very first request:

### Steps to Protect your web application

#### Set a secure cookie

When the initial request is made to the legitimate site, the server sends a response to your client browser that contains a randomly generated authentication token and sets a user session cookie with a CSRF token cookie.

#### Send CSRF Token Cookie with each request header

With every request made from the client, the CSRF token is used to check subsequent requests and the server compares this token cookie to make sure it is coming from the legitimate origin.

#### Handle Server side error response

If the server compares the CSRF token and determines that it doesn't match, the server should reject that request. It's also a good idea to log user data.

The only thing you need is a secret token that will be sent with each client request. This way the server can check if the incoming transaction was initiated by your app or not and provides proof that it is a legitimate request. If it wasn't, then reject it straight away. Sounds simple right? So let's take a look at how it works!

### Starting with the initial GET request

The server needs to set a token in the Javascript readable session cookie called XSRF-TOKEN (csrf cookie) or X-XSRF-TOKEN on the first GET request from the client code. For subsequent requests, the server-side code can verify that the cookie matches the X-XSRF-TOKEN HTTP header. If it's a match the server knows that the request came from the same domain.

Here is the important part: the token must be a random value for each user, otherwise the attacker could query the token in a separate session. The token is saved on the server and is compared for each request.

For added security, you can set the token as a digest of your site's randomly generated authentication token with a salt. To prevent collisions in environments where multiple apps share the same origin you can give each application a unique cookie name.


{% img "CSRF-Custom-cookie-header.png" "Custom request header example" "lazy" %}

It is good practice to write a custom header for the x-xsrf-header and cookie. This way, if a hacker can access the cookies, they will have a greater challenge without the standard cookie header name.

If your backend server-side code uses different names or a custom request header, for the XSRF token cookie or header you can use the following in Angular:

``` typescript
imports: [
 HttpClientModule,
 HttpClientXsrfModule.withOptions({
 cookieName: 'app-Xsrf-Cookie',
 headerName: 'app-Xsrf-Header',
 }),
],
```

If no names are supplied, the default value for the cookie is XSRF-TOKEN and the default value for the request header is X-XSRF-TOKEN. The module has a built-in interceptor HttpXsrfInterceptor which is a service that transforms outgoing request headers and includes the xsrf token in the X-XSRF-TOKEN header name.

Under the hood, this HttpClientXsrfModule, working closing with the Angular HTTP Module, contains a class that extracts the xsrf token called HttpXsrfTokenExtractor. This extractor has a single method appropriately named: getToken() which returns a string or null.

### Server-side handling of the CSRF tokens

A cookie can be set and used over HTTP (communication between a web server and a web browser), but also directly on the web browser via JavaScript code.

The issue here, when leaving it open to Javascript to make the change, an attacker could inject malicious Javascript code on the page and COULD gain access to the cookies that, as a reminder, often contain sensitive information.

#### How to make secure cookies and store the XSRF Token cookie

Nothing is worse than going through all the effort to secure your website with a Content Security Policy, using HTTPS requests, hardening your server-side code, and an attacker still gains access to the XSRF Token via an HTTP request. The following steps should be used to ensure that the authenticated user stays protected from attacks.

##### Cookie Security; HttpOnly flag

To block the potential liability of Javascript accessing the cookie and user data there is a flag that can be implemented to prevent this type of attack. The “HttpOnly” flag is used to block Javascript from accessing cookies from the client-side so if an attacker was to succeed in injecting some javascript.

Regardless of any precautions made to harden the website security the attacker wouldn't be able to access any cookies, thus limiting the attack vectors.

##### Cookie Security; Secure flag

The second flag that should be set for the XSRF Token Cookie is "Secure"; a boolean value. Most session hacking occurs when the attacker uses a method called Man-In-The-Middle where they intercept data that are transferred via an HTTP request.

This means that if the cookies aren't encrypted and then sent over unsecured HTTP (not HTTPS) the attacker can gain access to session cookies or other user details.

The secure flag prevents this attack by the browser guaranteeing that the cookie remains encrypted and is only sent via HTTPS request.

##### Cookie Security: maxAge

Finally, the last security flag that should be set in the cookie is a maxAge. This ensures that the cookie is renewed with a new token so that the attacker is less likely to gain access to the cookie in other methods; like having physical access to the computer.

##### CSURF Package Vulnerability

For those who have implimented a CSRF prevention method using CSURF, a popular Node.js CSRF protection middleware, there has been a rediscovered vulnerability. The `cookie: true` flag set is the trouble, and in short, an attacker can use cookie tossing (setting a cookie from a subdomain) to use a valid (and signed) pair of cookies (_csrf + token) to bypass the anti-csrf mechanism. This vulnerability is not present when `cookie: false` is set; however in abundance of caution the package author has depricated this module. 

Luckly for us, Angular has a built in mechanism to handle CSRF automatically. In the case with Angular, you can set a `XSRF-TOKEN`cookie to allow for protection to take place.  

The following is an example of the implementation of these methods in NodeJS. The user makes a GET request to the '/form' API endpoint and then when the user fills out the form, using angular form control and form builder, submits the data to the server via a POST request at the '/process' API endpoint.

``` typescript
var cookieParser = require('cookie-parser')
// var csrf = require('csurf') <-- DO NOT USE (See above 'CSURF Package Vulnerability')
var bodyParser = require('body-parser')
var express = require('express')


 var parseForm = bodyParser.urlencoded({ extended: false })
 
 // create express app
 var app = express()
 
 // parse cookies
 app.use(cookieParser())

 app.all('*', function(res, req){
    res.cookie('XSRF-TOKEN', req.csrfToken()) // <-- remember to change the cookie name to match what was used in the HttpClientXsrfModule settings
    res.render('index')
 })
 
 app.get('/form', function (req, res) {
    res.render('send')
 })
 
 app.post('/process', parseForm, function (req, res) {
    // validate your cookie and header token match
    res.send('data is being processed')
 })
```

The next step is to validate this token on the server. Of course, you have to send it along with every request being sent to your server, so why not just validate it there?

Verify that the token is a valid token generated by the secret owned by the user. If the verification fails, it should throw a csrf error and should return a `403` error back to the visitor.

From this point, the server will deny any malicious requests the client sends which doesn't have the correct token.

Lastly, a good practice is to keep user logs for requests coming into your server. If there is a hole in your security, logs will at least give you a last line of protection if attackers were successful in obtaining the tokens and making requests on behalf of a user.