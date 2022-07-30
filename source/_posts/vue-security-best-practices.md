---
title: Vue Security Best Practices
author: Mauricio Matias C.
avatar: mauricio-matias.jpeg
description: Learn Vue modern best practices and methods to keep your Vue application (JavaScript) secure. 🔒
date: 2022-07-25
tags: [Vue, Security]
id: vue-security-best-practices
relatedPost: vue-xss
---

{% image_fw 1.78 banner.png "Vue Security Best Practices" %}

Hi, #VueFriend! In this post, we cover security best practices around the Vue ecosystem (in a nutshell). Security issues are always related to the development process, putting at risk the most valuable asset, the end user information. To avoid this kind of scenario, we have some best practices to improve the security in your single-page applications, web pages, web apps, or other builds with Vue. Let's get started!.

<!-- toc -->

## `v-if` vs `v-show`, they don't have the same logic
Sometimes beginner Vue developers confuse the v-if and v-show directives or use them indifferently. The `v-if` lets you render or not some HTML portion through some logic condition. Otherwise, the v-show always renders the HTML portion through some logic condition too, but it displays or hides the content using the `display: none` CSS property. The HTML portion is always reflected on the HTML template. In summary `v-if` renders or not, and `v-show` always renders, but hides or displays the content.

In that sense, `v-if` and `v-show` are useful in accomplishing the task to show information according to specific logical criteria. Let's make a case, there is a user interface with buttons according to roles (admin, normal, and guest). If you are an admin, the button should be green, the normal should be gray, and the guest doesn't have any button. Take a look at the next case if you use the `v-show` directive.

#### BAD
``` html
<template>
    <button
    v-show="userType === 'admin'"
    class="button-class-admin"
    @click="someAdminAction()"
    >
    Admin Button
    </button>
    <button
    v-show="userType === 'admin'"
    class="button-class-normal"
    @click="someNormalAction()"
    >
    Normal Button
    </button>
</template>
<script>
import { ref } from "vue";
export default {
    setup() {
    const userType = ref("guest");

    const someAdminAction = () => {
        console.log("some admin user logic");
    };
    const someNormalAction = () => {
        console.log("some normal user logic");
    };
    return {
        userType,
        someAdminAction,
        someNormalAction,
    };
    },
};
</script>
```

Open the browser's developer tools and inspect the HTML code around the button. Can you see?.

{% img "v-show.png" "v-show use's result, parent component html view" "lazy" %}

Other buttons are there but are not displayed. If you remove the `display: none` CSS property from each one, the buttons turn to show.

{% img "v-show-buttons.png" "removing 'display:none' reveals top-level user buttons, parent component html view" "lazy" %}

It will depend on how well the logic behind the buttons is developed so that when the "guest" user presses it. Nothing serious happens.

#### CORRECT
To fix this security issue you can replace `v-show` with `v-if` as the following code shows.

``` html
<template>
    <button
    v-if="userType === 'admin'"
    class="button-class-admin"
    @click="someAdminAction()"
    >
    Admin Button
    </button>
    <button
    v-if="userType === 'admin'"
    class="button-class-normal"
    @click="someNormalAction()"
    >
    Normal Button
    </button>
</template>
```

Replacing `v-show` for `v-if` solves the issue? Not really. It depends on how many levels/layers of security are in your Vue app. The `v-show` and `v-if` Vue directives have their specific use cases, check this [link](https://vuejs.org/api/built-in-directives.html#v-show). Use them wisely.

## Complex formatting shouldn't be welcome on template expressions (Keep it simple)
Sometimes we don't have lots of time to spend formatting information. Especially, it's a common practice to see how beginner developers always start formatting and using `map`, `filter`, and other JavaScript ways of sorting, filtering, or data formatting as template expressions.

We have the following code example for you. The bad, and the correct approach.

#### BAD
The next code has a complex filtering logic inside the template part of this vue file.
``` html
<template>
    <div
    v-for="(user, index) in userList.filter(
        (user) =>
        user.skills.map((i) => i.toLowerCase()).includes('python') &&
        user.age >= 30
    )"
    :key="index"
    >
    <div class="user-card">
        <div class="user-card__name">
        {{ user.name }}
        </div>
        <div class="user-card__picture">
        <img :src="user.picture" :alt="user.name" />
        </div>
        <div class="user-card__age">
        {{ user.age }}
        </div>
    </div>
    </div>
</template>

<script>
export default {
    data: () => ({
    userList: [
        {
        name: "Elliot Alderson",
        age: 30,
        skills: ["Bash", "Python", "Ethical hacking"],
        },
        {
        name: "Tyler Wellick",
        age: 33,
        skills: ["Python", "Management", "Economy"],
        },
        { name: "Angela Moss", age: 31, skills: ["Management", "Social media"] },
    ],
    }),
};
</script>
```
This practice can compromise the extensibility of your Vue page and introduce certain unexpected behaviors if its use is frequent. Also, don't forget to use `:key` whenever `v-for` is present. `:key` is used as an ID or hint for Vue to understand what exactly it is you’re trying to achieve in case the list will be changed some moment.

If you need filtering, sorting, or data formatting. The best practice is to take advantage of the "computed properties" as follows.

#### CORRECT
Maybe it is almost the same filter function, but you should have more control, taking advantage of the Vue features and language suggestions.

``` html
<template>
    <div v-for="(user, index) in filteredList" :key="index">
    <div class="user-card">
        <div class="user-card__name">
        {{ user.name }}
        </div>
        <div class="user-card__picture">
        <img :src="user.picture" :alt="user.name" />
        </div>
        <div class="user-card__age">
        {{ user.age }}
        </div>
    </div>
    </div>
</template>

<script>
export default {
    data: () => ({
    userList: [
        {
        name: "Elliot Alderson",
        age: 30,
        skills: ["Bash", "Python", "Ethical hacking"],
        },
        {
        name: "Tyler Wellick",
        age: 33,
        skills: ["Python", "Management", "Economy"],
        },
        { name: "Angela Moss", age: 31, skills: ["Management", "Social media"] },
    ],
    skillPreference: "python",
    }),
    computed: {
    filteredList() {
        return (
        this.userList.filter((user) => {
            return (
            user.skills
                .map((i) => i.toLowerCase())
                .includes(this.skillPreference) && user.age >= 30
            );
        }) || []
        );
    },
    },
};
</script>
```

Many times. When the data structure is not defined correctly, formatting or sorting can introduce inconsistency problems. When you delegate this task to the Vue template part in the Vue file, it doesn't have many options to handle inconsistency problems throwing errors and adopting unexpected behaviors at undefined moments. To mitigate this problem, keep your template Vue part free of complex formatting, and handle them in the script part, having a nice way to deal with strange cases. Complex JavaScript logic at templating can easily turn into security holes.

## Keep your npm packages updated
The Vue and node ecosystem has a lot of packages and your project has several of them inside as background dependencies (dependencies of dependencies), some of them could be had security issues at a certain time, but these issues are fixed and put in another package version.

As long as you do not update the compromised dependency, it will continue to have security problems, putting your Vue app at risk.

To check if some of your dependencies are compromised you can run:

```
npm audit
```

This command helps you know if some dependency has related low, moderate, high, or critical issues.

In a practical example try to install the `parse-url@5.0.8` package version (here is the [link](https://snyk.io/vuln/npm%3Aparse-url) to the package vulnerability report). This package has 1 high and 1 critical vulnerability related to Cross-Site Scripting and Server-Side Request Forgery (It's not dangerous if you don't use this dependency in production 😆), then run the audit command.

{% img "npm-audit.png" "one practical example of npm audit command" "lazy" %}

As you can see. The npm report is detailed, and you can correct the issue by running the following command:

```
npm audit fix --force
```

And automatically the dependency will be updated to a fixed version. Check your dependencies regularly and get always the latest version (if don't break your Vue application). [Snyk.io](https://security.snyk.io/) it's a good page to check more details about vulnerabilities on npm and other package ecosystems.

## The source code never lies, see what dependencies you're adding
It is interesting to see how packages and their creators behave over time.

This year the creator of the packages `colors.js` and `faker.js` self-sabotage their code in a peaceful protest symbol (follow this [link](http://web.archive.org/web/20210704022108/https://github.com/Marak/faker.js/issues/1046) to see the thread from GitHub). The bad thing is in those packages whose creators' credentials are compromised and end up in the hands of cyber criminals who alter their functionality (code injection). Some actions that malicious packages can achieve are:

*   Theft of environment variables with valuable keys, credentials, ssh keys, digital wallets, and critical information.
    
*   Installation of malware, crypto miners, ransomware, and more.
    

Then, what can I do?. Well, check out the source code. Maybe take a little or more time than you have to implement functionality, but this practice is a nicer way to improve your skills and keep secure your web page. A usual path for cybercriminals to take advantage of the npm ecosystem is when the dependency installation is underway. More precisely the preinstall stage, some malicious code will reside around this stage, check this conceptual example of a malware package ([actual-malware](https://github.com/qpwo/actual-malware) package), and don't forget to take a little moment to review unofficial or third-party source code.

## Manage and keep secret your "environment" files
Another bad practice is to push the .env or environment files to a GitHub repository or copy and pasting to WhatsApp, Telegram, or another app that is not oriented to keep secret your content. The worst, Vue projects with critical keys and URLs inside the source code as text-plain (hardcoded sensitive information). Avoid any one of these examples. Keep your environment keys in files ignored by any VCS (version control system) like Git, and don't publish them publicly. You don't know what are environment files? check this pseudo-default package for environment files management ([dotenv](https://www.npmjs.com/package/dotenv) package).

## Use production version (Vue through CDN script)
One of many ways to use Vue is via CDN script (in versions less than 2.7.4) as the old JQuery ecosystem style 😎. It's easy to use as copying the CDN script tag in the HTML static web page. Here is when the problem comes the CDN installation has two versions of Vue (the development and production version). Both work well in the development process, but if you go to production you should use the production version. Is it insecure to use at production?. Yeah, the development version has enabled the [Vue Devtools](https://devtools.vuejs.org/) by default, and these Devtools let you know a bunch of details about how works your Vue application. See the following example.

``` html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Vue as CDN Script</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <!-- Development Vue Script tag -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.4/dist/vue.js"></script>
</head>
<body>
    <div id="app">
        <!-- Vue template  -->
        {{ message }}
    </div>
</body>
<script>
    // main app component
    new Vue({
        el:'#app',
        data:()=>({
            message:'A simple message'
        })
    })
</script>
</html>
```

When you have the Vue Devtools extension installed properly in your browser, this simple Vue demo HTML will let you open the Devtools, in more complex applications Vue Devtools are the top-notch tool for a Vue Developer (you can see components, storage, events, and more).

{% img "vue-devtools.png" "Vue devtools are enabled" "lazy" %}

If you take this demo to production as it is. The Devtools will remain open for anyone who can view your Vue application via the internet. To mitigate this problem, you can simply replace the CDN development script tag with the CDN production script tag.

``` html
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.4"></script>
```
Immediately the Devtools will be disabled (take a look at the next Devtools extension message). Take this advice as ready-to-production best practice.

{% img "devtools-disabled.png" "Vue devtools disabled in the end user's browser" "lazy" %}

## DOM is not an option
Avoid the use of DOM manipulation with vanilla JavasScript. If you require to use it, test the cornerstone cases (expect critical scenarios will keep you a step ahead of your attackers). Direct DOM manipulation can introduce some unexpected vulnerabilities to your Vue application. Some of them are cookie manipulation, javascript injection, WebSocket-URL poisoning, Ajax request-header manipulation, Denial of service, and the most dangerous. Cross-Site Scripting or most knowledge as XSS vulnerability. What is XSS? the next section covers this vulnerability.

## Avoid "Cross-Site Scripting" scenarios (Don't trust)
XSS (Cross-Site Scripting) is a dangerous vector attack, it has many ways to achieve it, so it has been categorized in several ways (in general is a malicious code injection vulnerability). XSS attacks are related to code injection altering the behavior of our Vue application. Where and how is it possible?. The short answer is "user input" when we talk about users we forget that it could be anyone (attackers and cybercriminals included). So, we should adopt a "no trust" policy. What does it mean?.

As we mentioned XSS can be achieved in many ways, but generally, bad user input manipulation is the reason number one in how this attack can be successful. Where user input means input fields, forms, URLs params, API endpoints, and other sources in which users can introduce data. This topic is quite extensive, so we prepared this practical and detailed post about [Cross-Site Scripting on Vue and how you can avoid it](https://dev-academy.com/vue-xss/) (check it now 😃).

Some of the best practices around are:

*   Avoid using DOM directly or use it wisely.
    
*   Sanitize html tags, if you need to reflect some string with HTML content inside, you can use libraries like [vue-3-sanitize](https://www.npmjs.com/package/vue-3-sanitize), [vue-sanitize](https://www.npmjs.com/package/vue-sanitize), or [sanitize-html](https://github.com/apostrophecms/sanitize-html) to sanitize it.
    
*   Forms, URLs, and every input data, in general, must be validated before its use (the validation must be carried out both in the frontend and in the backend). A nice library that can help you to fulfill this task is [Yup](https://www.npmjs.com/package/yup).
    

> Inputs are the best door

## Your user doesn't need tons of response details, but your attacker will thank you
Vue apps often work in conjunction with a backend, when you submit some form, you're making a POST or some HTTP method to a web server (API calls), this is responsible to handle this information properly and send a response. The response could be anything, information, some flags, statuses, and so on. But something common in web servers turns around the error responses. When they send extra information about themselves and are reflected on the client side (Vue applications) we talk about an "Information disclosure" vulnerability. They don't have to be so detailed, the classic example is when your web server (in a login page context) reveals which field is wrong and which is good by an elimination logic. See the next HTTP request example.

```
# Request
    Method: POST
    Url: https://example.com/login
    Body: {"username":"demo@demo.com","password":"fatestfastfatrat"}
# Response
    Code: 401
    Body: {
        "error":"'password' field is incorrect"
    }
```

Now the attacker knows if the user `demo@demo.com` has an active account on the `https://example.com` web page. This is an example of how attackers map user accounts on a lot of popular websites. If you are not convinced the best way to be done is to check your application/user logs in which you find how malicious attackers are trying to map URLs, and users as an initial phase of information recollection.

To stay out of this case decreases your error message details or handles error codes as a protocol between your web server and your Vue Application. This advice applies to API calls, HTTP requests, and similar ones.

## Enable security headers
Security headers are a kind of mechanism that the server side has to fight against cyber criminals, attackers, and others, keeping top the web security.

In this section, we've selected the most significant security headers recommended by the OWASP Foundation. OWASP is a non-profit foundation that works to improve the security of software. Most of the best practices around web security have been introduced by this foundation. To know more about OWASP follows this [link](https://owasp.org).

### HTTP Strict Transport Security

HTTP Strict Transport Security (also named HSTS) is a web security policy mechanism that helps to protect websites against protocol downgrade attacks and cookie hijacking. It allows web servers to declare that web browsers (or other complying user agents) should only interact with it using secure HTTPS connections, and never via the insecure HTTP protocol.

Here is an example of how to use enable it.

```
Strict-Transport-Security: max-age=31536000 ; includeSubDomains
```

`max-age` defines how much time (in seconds, 1 year in the example) the browser or others should remember that this site can only be accessed using HTTPS. `includeSubDomains` is an optional parameter that means this rule applies to all of the site’s subdomains.

### X-Frame-Options

The X-Frame-Options response header (also named XFO) improves the protection of web applications against clickjacking. It instructs the browser whether the content can be displayed within frames. Here is the way how you can use it.

```
X-Frame-Options: deny
```

This header tells the browser that it should block any frame-embedded content inside your website.

### X-Content-Type-Options

Setting this header will prevent the browser from interpreting files as a different MIME type than what is specified in the Content-Type HTTP header (e.g. treating `text/plain` as `text/CSS`). To enable it you can use the following way.

```
X-Content-Type-Options: nosniff
```

### Content-Security-Policy

A Content Security Policy (also named CSP) requires careful tuning and a precise definition of policies. If enabled, CSP has a significant impact on the way browsers render pages (e.g., inline JavaScript is disabled by default and must be explicitly allowed in the policy). CSP prevents a wide range of attacks, including cross-site scripting and other cross-site injections. This security policy is widely complex and no exists general recipe or way to add this security header. Each web app, website, or other needs a serious evaluation to put some CSP policies. To understand more about CSP you can consult this [official MDN link](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and our blog post about CSP for [Angular Apps](https://dev-academy.com/content-security-policy-in-angular/).

### Referrer-Policy

The Referrer-Policy HTTP header controls which referrer information (sent with the [Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header) should be included with requests. Setting the Referer-Policy as non-referer you are avoiding footprinting and tracking of your website.

```
Referrer-Policy: no-referrer
```

Sometimes the `Referer` header is used for analytics reasons in this case you can use `same-origin` instead of `no-referrer`. Exists more ways to use it (check your case) we encourage you to inspect this [link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy).

### Clear-Site-Data

The Clear-Site-Data header clears browsing data (cookies, storage, cache) associated with the requesting website. Clear-Site-Data header is often used as part of the logout process, to ensure that all stored content on the client side like cookies, storage, and the cache is removed. To accomplish this job you can use this header as follows.

```
Clear-Site-Data: "cache","cookies","storage"
```

### Test your security headers

Once you have some security headers configured properly check them with the [SecurityHeaders](https://securityheaders.com) web application, here is a [good example](https://securityheaders.com/?q=https%3A%2F%2Fdeveloper.mozilla.org&followRedirects=on).

### Summary
To begin with, Vue is a beautiful frontend framework. Its ecosystem and community are pretty good. The official documentation is your best source to deal with doubts, questions, and problems don't think too much to consult it. Before using any directive or feature of Vue check it the documentation (it offers functionality explanations, examples, and use cases). As we saw previously, `v-if` and `v-show` shouldn't used indistinctly.

Avoid using complex data formatting in the Vue templating part. Vue offers several ways how can you organize and deal with data formatting, sorting, or filtering.

Don't forget to audit your npm packages frequently, get updated to the latest versions, and check before the source code inside if it is not part of official or trust dependencies.

Avoid the direct manipulation of DOM if exists a better way to achieve your requirements. DOM manipulation often ends in XSS scenarios.

Also, we mentioned some security headers to add to your Vue app. Well configured, they prevent XSS vulnerabilities, Clickjacking attacks, and others, making your app more secure. To understand these concepts in detail you can check this [link](https://owasp.org/www-project-secure-headers/) to the "OWASP Secure Headers Project" complementary look at the [MDN Web Docs](https://developer.mozilla.org/en-US/) to consult the functionality of each security header.

Maybe this post doesn't expose some quite specific cases but keeping in mind these practices keeps your applications far away from malicious attacks.

> Remember: There’s no silver bullet!