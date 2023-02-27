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

**UPDATE:** This article was updated to include information on CSURF Package Vulnerability. For those who have implemented a CSRF prevention method using CSURF, a popular Node.js CSRF protection middleware, please read on to understand this vulnerability and what to do to avoid it. 

## A little Introduction

For those of you who have been working with the Angular framework throughout the last few years, you DEFINITELY know how much it has changed since — dare I say it — the old "AngularJS" days. That was back when the term "framework" was barely a term when it came to the client-side of the web.

Back then the term "web frameworks" was used very little back in 2010, when the original iPhone was just released — heck, the thought of "responsive" websites was in its infant stage as well.

It has now been 12 years since that original release came out, from the halls of Google where AngularJS was born, and as of January 1st, 2022 Google no longer provides updates AngularJS to fix security, browser compatibility, or jQuery issues.

In 2007 XSS and CSRF (cross-site request forgery) entered the OWASP Top 10 at 5th place, which remained until 2010. In 2013, it dropped to 8th place, and finally, in 2017 it disappeared from the top 10 altogether due to an overall low incidence rate as well as many automated solutions built into modern web frameworks.

The reason I mention the history of Angular is that though the first version developed, \[trigger warning\] which rather sucked, taught us many things about how single-page website applications should be built so that they are secure for the users who use them.

The team at Google rebuilt Angular from that first iteration, eliminated numerous security vulnerabilities, and has made Angular what it is known to be today — to be one of the leading development frameworks we use.

## More Introductions... CSRF token

Today's article is about implementing CSRF protection on a backend for an Angular app. What the heck is CSRF anyway?

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

1) Every XHR request sent out has to include a custom HTTP header with a specific name and value; this can also be coupled with the user's session id token called "double submit cookie method". Be wary of this implementation however since it is known to have vulnerabilities when you don't control all the sub-domains of the origin. This Double Submit Cookie Method should also only be used by a stateless application where, for example, you might be hosting your server as a container on Google Cloud Run or Amazon AWS Elastic instances. (See below for stateful implementation of CSRF Protection)

2) The server checks for the presence of that header and makes sure the request header value matches what was sent on the client-side, otherwise we will know its a malicious request

3) All browsers implement the _same origin policy,_ so that only code from the website on which cookies are set can read the cookie named xsrf token.


{% img "CSRF-token-cookie-example.png" "CSRF protection implementation" "lazy" %}


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

For added security, you can set the token as a digest of your site's randomly generated authentication token with a salt. To prevent collisions in environments where multiple apps share the same origin you can give each application a unique cookie name. Be sure to store this password in an .ENV file and not in any repositories; you don't want those passwords publically available. 


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

To block the potential liability of Javascript accessing the cookie and user data there is a flag that can be implemented to prevent this type of attack. The “HttpOnly” flag is used to block Javascript from accessing cookies from the client-side so if an attacker was to succeed in injecting some javascript it wouldn't be able to read any of the cookies.

Regardless of any precautions made to harden the website security the attacker wouldn't be able to access any cookies, thus limiting the attack vectors.

##### Cookie Security; Secure flag

The second flag that should be set for the XSRF Token Cookie is "Secure"; a boolean value. Most session hacking occurs when the attacker uses a method called Man-In-The-Middle where they intercept data that are transferred via an HTTP request.

This means that if the cookies aren't encrypted and then sent over unsecured HTTP (not HTTPS) the attacker can gain access to session cookies or other user details.

The secure flag prevents this attack by the browser guaranteeing that the cookie remains encrypted and is only sent via HTTPS request.

##### Cookie Security: maxAge

Finally, the last security flag that should be set in the cookie is a maxAge. This ensures that the cookie is renewed with a new token so that the attacker is less likely to gain access to the cookie in other methods; like having physical access to the computer.

##### CSURF Package Vulnerability

For those who have implemented a CSRF prevention method using CSURF, a popular Node.js CSRF protection middleware, there has been a rediscovered vulnerability. The `cookie: true` flag set is the trouble, and in short, an attacker can use cookie tossing (setting a cookie from a subdomain) to use a valid (and signed) pair of cookies (_csrf + token) to bypass the anti-csrf mechanism. This vulnerability is not present when `cookie: false` is set; however in abundance of caution the package author has depricated this module. 

Instead of using the CSURF npm package, you should use the following implementation on the server. 

## Implementation of CSRF Protection

There is a big difference between the proper implementations of CSRF protection on stateful servers, where you have access to memory to store the state, and stateless services where you might use container instances or a serverless architecture. 

To prevent CSRF attacks, two popular methods are the Synchronized Token Pattern (STP) and the Double Submit Cookie Method (DSCM). Here's a brief comparison of the two approaches:

1. Synchronized Token Pattern (STP):
The STP is typically used on stateful servers, where the server maintains some session state for each user. The server generates a unique, unpredictable token for each session and embeds it in every HTML form that requires protection against CSRF. When a user submits a form, the token is included in the form data, and the server validates it against the token stored in the session. If the tokens match, the request is considered valid; otherwise, it is rejected.

   *Advantages of STP:*
   - Provides strong protection against CSRF attacks.
   - Token generation and validation is easy to implement.

   *Disadvantages of STP:*
   - Requires maintaining session state on the server, which can be difficult to scale in large, distributed systems.
   - Can be vulnerable to session fixation attacks if the token is not properly regenerated after a user logs in.

2. Double Submit Cookie Method (DSCM):
The DSCM is typically used on stateless servers, where there is no session state maintained. In this approach, the server sets a secure, http-only cookie with a random value on the user's browser when they log in. Then, the server includes the same value in a hidden form field on every protected form. When the user submits the form, the server validates that the value of the cookie matches the value of the form field.

   *Advantages of DSCM:*
   - Doesn't require maintaining session state on the server, making it easier to scale.
   - Can be implemented on any web server or programming language.

   *Disadvantages of DSCM:*
   - Slightly weaker protection than STP since an attacker could potentially steal the cookie value using a different attack, such as XSS (Cross-Site Scripting), however this is remedied by implementing a rotating secret for each request. 
   - Cookie values can be intercepted and modified in transit, potentially leading to CSRF attacks. 

Overall, both STP and DSCM are effective methods for preventing CSRF attacks, but the choice between the two largely depends on the architecture of your web application.

### Stateful Implementation of CSRF Protection

For implementation of CSRF Protection on a stateful system, you will need to use the Synchronizer Token Pattern. The CSRF Token is generated server-side for this pattern along with a session id. **For the Synchronized Token Pattern, CSRF tokens should not be transmitted using cookies.** 

When the client receives the CSRF token from the server, there are two options to use for the server to validate that the request is legitimate. 
1. Client passes the CSRF token as a hidden field through a form post request to the API endpoint. 
2. Client inserts the CSRF token in a custom request header

Inserting the CSRF token in the custom HTTP request header via JavaScript is considered more secure than adding the token in the hidden field form parameter because it uses custom request headers.

One resource you should have at your finger-tips is the OWASP Cheat Sheet covering in detail both options. 
(OWASP Cross-site Request Forgery Prevention Cheat Sheet)[https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html]

The following is an example of the implementation of these methods in NodeJS. The proper way to implement this protection is to use Synchronised Token Pattern. The user makes a GET request to the '/csrf-token' API endpoint and then when the user fills out the form, using angular form control and form builder, submits the data to the server via a POST request at the '/process' API endpoint.

You can view the full implementation on Github:
(CSRF Protection for Angular Tutorial)[https://github.com/geogramdotcom/csrf-angular-tutorial]

For the server-side code:
``` typescript
// Use Express
var express = require("express");
var session = require("express-session")
// Use body-parser
var bodyParser = require("body-parser");
// Use csrf-sync for CSRF Protection
var { csrfSync } = require("csrf-sync");
// Use dotenv to store cookie secret
require('dotenv').config()


// Create new instance of the express server
var app = express();

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Add csrf protection
app.use(session({
    secret: process.env.cookie_secret,
    resave: true,
    saveUninitialized: true
}));

// Setting up Csrf Protection
const { 
    generateToken, 
    csrfSynchronisedProtection, 
    storeTokenInState, 
    getTokenFromState 
} = csrfSync({
    getTokenFromState: (req) => { 
        // Used to retrieve the token from state.
        return req.session.csrfToken; 
    }, 
    getTokenFromRequest: (req) =>  { 
        // Used to retrieve the token submitted by the request from headers
        // Change the header name (default is 'x-csrf-token')
        return req.headers['app-csrf-token']; //  <-- uncomment to use

        // The following is an alternative approach using the token in a form (POST) request
        // Used to retrieve the token submitted by the user in a form 
        // return req.body['CSRFToken']; // <-- uncomment to use
    },
    storeTokenInState: (req, token) => { 
        // Used to store the token in state. 
        req.session.csrfToken = token; 
    }, 
    size: 256, // The size of the generated tokens in bits
});

// Create link to Angular build directory
// The `ng build` command will save the result
// under the `dist/angular-stateful` folder.
var distDir = __dirname + "/dist/angular-stateful";
app.use(express.static(distDir));

// Init the server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


// Settings for all requests
app.all('*', jsonParser, function(req, res, next){
    // getTokenFromState for all requests
    var syncedToken = getTokenFromState(req);

    // If token isn't present generate a new token
    if(syncedToken === undefined){
        var token = generateToken(req);
        storeTokenInState(req, token)
    } 

    console.log(
        "************ NEW REQUEST ************", '\n',
        'req.path:', req.path, '\n',
        'req.body:', req.body
    ); // For debugging

    next();
});

// In Angular app component OnInit a request is made to `/csrf-token` go generate new token
app.get("/csrf-token", (req, res) => {
    // send the token to the client
    var csrfToken = getTokenFromState(req)
    return res.json({csrfToken: csrfToken});
});

// Add the csrfSynchronisedProtection
// Any requests after this init will be csrf protected
app.use(csrfSynchronisedProtection);

// CSRF Protected POST endpoint
// Client POST request sent to CSRF Endpoint
app.post("/process", jsonParser, (req, res) => {
    res.status(200).json({ status: "success" });
});
```

Because of the vunerabilities in the ```csurf``` package, as well as it being depricated, a secure alternative to use for stateful implementation is ```csrf-sync```

Verify that the token is a valid token generated by the secret owned by the user. If the verification fails, it will throw a csrf error and  return a `403` error back to the client.

From this point, the server will deny any malicious requests the client sends which doesn't have the correct token.

Lastly, a good practice is to keep user logs for requests coming into your server. If there is a hole in your security, logs will at least give you a last line of protection if attackers were successful in obtaining the tokens and making requests on behalf of a user.

### Stateless Implementation of CSRF Protection

The following is an example of the implementation of these methods in NodeJS. Remember that the proper way to implement this protection for stateless is to use the "double submit cookie method". The user makes a GET request to the '/csrf-token' API endpoint and then when the user fills out the form, using angular form control and form builder, submits the data to the server via a POST request at the '/protected_endpoint' API endpoint.

You can view the full implementation on Github:
(CSRF Protection for Angular Tutorial)[https://github.com/geogramdotcom/csrf-angular-tutorial]

For the server-side code:
``` typescript
//Stateless Server Configuration

//Stateless Server Configuration

// Use Express
var express = require("express");
var session = require("express-session")
// Use body-parser and cookie-parser
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
// Use csrf-csrf for CSRF Protection using Double Submit Cookie Pattern)
const { doubleCsrf } = require("csrf-csrf");
// Use dotenv to store secrets
require('dotenv').config()

// Secrets and important params might be used with env files
// in this case you can set and change this values to test purposes
const CSRF_SECRET = process.env.csrf_secret;
const COOKIES_SECRET = process.env.cookie_secret;
const CSRF_COOKIE_NAME = "app-csrf-token";

// Create new instance of the express server
const app = express();
app.use(express.json());

// create application/json parser
var jsonParser = bodyParser.json()

// These settings are only for local development testing.
// Do not use these in production.
// In production, ensure you're using cors and helmet and have proper configuration.
const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
  doubleCsrf({
    getSecret: (req) => {
      req.secret; // A function that returns the secret for the request
    },
    secret: CSRF_SECRET,
    cookieName: CSRF_COOKIE_NAME,
    cookieOptions: { sameSite: true, secure: true, signed: true},
    size: 128,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromRequest: (req) => req.headers["app-csrf-token"], // A function that returns the token from the request
  });

app.use(cookieParser(COOKIES_SECRET));

// Settings for all requests
app.all('*', jsonParser, function(req, res, next){

    console.log(
        "************ NEW REQUEST ************", '\n',
        'req.path:', req.path, '\n',
        'req.headers:', req.headers, '\n',
        'req.body:', req.body
    ); // For debugging

    next();
});

// Error handling, validation error interception
const csrfErrorHandler = (error, req, res, next) => {
    // Handing CSRF mismatch errors
    // For production use: send to a logger
    console.log("ERROR:", error)
    if (error == invalidCsrfTokenError) {
      res.status(403).json({
        error: "csrf validation error",
      });
    } else {
      next();
    }
};

// Create link to Angular build directory
// The `ng build` command will save the result
// under the `dist/angular-stateless` folder.
var distDir = __dirname + "/dist/angular-stateless";
app.use(express.static(distDir));

// Init the server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

app.get("/csrf-token", (req, res) => {
    return res.json({
        token: generateToken(res, req),
    });
});
  
app.post(
    "/protected_endpoint",
    doubleCsrfProtection,
    csrfErrorHandler,
    (req, res) => {
      console.log("req.body:", req.body);
      res.json({
        protected_endpoint: "form processed successfully",
      });
    }
);
```

Because of the vunerabilities in the ```csurf``` package, as well as it being depricated, a secure alternative to use for stateful implementation is ```csrf-csrf``` for the Double Submit Cookie Method. 

### In Closing

Verify that the token is a valid token generated by the secret owned by the user. If the verification fails, it will throw a csrf error and  return a `403` error back to the client.

From this point, the server will deny any malicious requests the client sends which doesn't have the correct token.

Lastly, a good practice is to keep user logs for requests coming into your server. If there is a hole in your security, logs will at least give you a last line of protection if attackers were successful in obtaining the tokens and making requests on behalf of a user.
