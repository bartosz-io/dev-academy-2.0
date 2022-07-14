---
title: Avoid XSS Attacks 🗡️ in Vue
author: Mauricio Matias C.
avatar: mauricio-matias.jpeg
description: Learn Vue XSS modern best practices and methods to prevent cross-site scripting attacks in Vue (JavaScript) applications. 🔒
date: 2022-07-13
tags: [Vue, Security]
id: vue-xss
relatedPost: angular-xss
---
{% image_fw 1.78 banner.png "Preventing XSS in Vue" %}

Something usual in software development is to give a high priority to the implementation of functionalities over other aspects such as security. Mainly when the development team, company, or others do not have an active culture of secure development, they are putting at risk the most valuable asset for companies and their users... the information. Of course not information is created equal, but when confidencial information is revealed, this most often creates a huge demage, both financially and reputationally.

Today we will learn how to prevent, mitigate, and secure our web applications from the cross-site scripting (XSS) attack vector, one of the most trivial, usual, and dangerous in the world of web applications.

<!-- toc -->

When a cross-site scripting vulnerability is exploited, basically anything is possible. To give you an idea of how dangerous can be this attack, you can check the following malicious actions an attacker can perform in a result of XSS exploitation:

* taking complete control of the web application,
* modification of the website HTML and DOM manipulation,
* session cookie stealing,
* freeway to access sensitive data (passwords, bank accounts, and credit card details) stored in local/session storage,
* identity theft,
* web request spoofing.

## Cross-Site-Scripting

XSS is a dangerous vector attack but is not only one way to achieve it, so it has been categorized in several ways. The most recurrent are Stored and Reflected XSS attacks.

### Stored XSS or Persistent XSS

Stored attacks are those in which the injected script is stored on the target servers, such as in databases, forums, visitor logs, comment fields, and others. In this attack, the victim retrieves the bad intended script from the server each time it requests such stored information, so the browser executes the malicious script under the principle of trust that exists with the web app.

### Reflected XSS Attacks

Reflected XSS attacks are those in which the injected script is reflected from a web application direct inputs inside a victim's browser. For example: In a search result, an error message or any other response that includes some or all of the information sent to the server as part of the request (commonly in the URL). The input data does not even need to be sent to the server in case of single-page applications that can process data directly in the browser. Reflected attacks are delivered to the victims via another way, such as in an email or another website (usually with malicious link).

### OWASP Top Ten

The Open Web Application Security Project® (OWASP) is a nonprofit foundation that works to improve the security of software. OWASP has a Top 10, which is a standard awareness document for developers and web application security. It represents a broad consensus about the critical security risks of web applications.

Currently, the XSS attack is part of a new category named "Injection" in the OWASP Top Ten. This category is up to the third place. Since 94% of web applications tested by OWASP were positive for various types of injection. For more information, check this [link](https://owasp.org/Top10/A03_2021-Injection/).

## Vue XSS: Let's Exploit

It's time to exploit cross-site scripting in a Vue application 😎. You can explore the source code at this [link](https://github.com/cr0wg4n/vuejs-xss-example). Vue is a powerful front-end framework. Check out this [link](https://vuejs.org/guide/introduction.html) if you don't know about it to begin this front-end framework in a practical way.

For the following examples, we will assume that the web app is complete, both frontend and backend (database persistence), and that it also contains active session cookies.

Clone the project, install the dependencies and run the project. All details are in the README file. Once you have covered the above steps, we are ready to start. At the "/reflected" route, we can view this page.

{% img "search.png" "xss reflected example page, client side website" "lazy" %}

Write this XSS line and perform your search.

``` html
<img src="simple xss" onerror="alert(document.cookie.split(';'))">
```

The result is presented in the image below. The is how XSS injection works. It is a common way to test XSS vulnerabilities, but **why** does it work this way? 🤔

{% img "exploiting.png" "exploiting xss via <img> tag, xss performed, malicious code" "lazy" %}

Look at the following application code ("[SearchView.vue](https://github.com/cr0wg4n/vuejs-xss-example/blob/main/src/views/SearchView.vue)" file). You will notice that the incoming manipulation of the URL query is processed by `innerHTML` to be reflected in the DOM. That appends the incoming URL query (malicious XSS script) at the element with the "result" id, executing the malicious script embedded in the `<img>` tag.

``` html
<template>
  <div class="about">
    <h2 class="result">Result for " <b id="result"></b> "</h2>
    <br>
    <br>
    Nothing was found ...
  </div>
</template>

<script>
export default {
  mounted() {
    const { query } = this.$route.query
    document.getElementById('result').innerHTML = query
  }
}
</script>
```

Can you guess what kind of XSS vulnerability we exploit? Exactly, Reflected XSS. The victim opens this link, so their browser does the rest. However, the URL is somewhat long and gives you tons of information to infer what it will perform. Attackers do not use this URL directly. Attackers commonly find a way to mask it under a shortener or insert it behind a `<a>` tag on someone else's web page.

### Preventing XSS 🛡️

Vue mitigates this type of XSS through a feature named "escaping". Where any information entered can be taken as a text string. To take advantage of it is necessary to replace the use of `innerHTML` and the not recommended direct use of the JavaScript DOM with the native Vue functionality called "Text Interpolation" (you can check the "[SearchViewMitigated.vue](https://github.com/cr0wg4n/vuejs-xss-example/blob/main/src/views/SearchViewMitigated.vue)" file to solve the XSS scenario).

``` html
<template>
  <div class="about">
    <h2 class="result">
      result for " <b id="result">{{ querySearch }}</b> "
    </h2>
    <br>
    <br>
    Nothing was found ...
  </div>
</template>

<script>
export default {
  data: () => ({
    querySearch: ''
  }),
  mounted() {
    const { query } = this.$route.query
    this.querySearch = query
  }
}
</script>
```

As a curious fact, the page [Slides](https://slides.com). A web app to make beautiful slides. It is a pretty good example of how a simple cookie can fully compromise your account if the session cookie with the name "\_slides\_app\_session" is stolen, copied, pasted, and saved in some cookie editor in a browser without an active [slides.com](http://slides.com) session. The attacker can impersonate your session without any problem, steal valuable data such as payment details, also modify or delete your information. Go to the login page sign up and verify it on your own.

Well, now we will see an example with Stored XSS (a simple Blog that renders user-generated content). Go to the path "/stored"; you will see a simple text editor and several preloaded posts. We will assume that it is a rich text editor such as tip-tap, quilljs, and TinyMCE (the most popular ones for Vue). These rich text editors are as flexible and secure as we can configure them. A rich text editor can introduce HTML content to be reflected at a certain point. The HTML content written by the user can be malicious and rendered as non-harmful content, leading to the following scenario.

{% img "stored_xss.png" "XSS stored example page, malicious code inside, client side scripts" "lazy" %}

Press "publish" and wait for the result (you can try other ways to perform an XSS injection and test your hacker skills).

{% img "exploiting_stored_xss.png" "exploiting stored xss, xss performed, malicious code, injecting html, user input" "lazy" %}

This form of XSS is dangerous since it could affect many users en masse. Its scope is more harmful and it is not necessary that the user performs many actions or that the attacker has to prepare an elaborate way to deceive the user. This problem is due to the use of the native `v-html` directive of Vue, which works in a similar way to innerHTML. In principle, this directive is not intended to be secure as mentioned by the creator of Vue (Evan You) in one of the [GitHub threads](https://github.com/vuejs/vue/issues/6333#issuecomment-321457721). Vue doesn't have a way to sanitize inputs through `v-html`. This problem can be solved trivially by developers using libraries such as sanitize-html.

In that sense, sanitizing HTML content is a great technique to prevent XSS injections from being attached to the HTML content we wish to persist.

I recommend you to use libraries such as sanitize-html, vue-sanitize, or vue-3-sanitize, to sanitize the HTML content. Translating it to code, go to the "[XSSStoredView.vue](https://github.com/cr0wg4n/vuejs-xss-example/blob/main/src/views/XSSStoredView.vue)" file where you will see this content.

``` html
<template>
  <div class="posts">
    <div v-for="post in posts" :key="post.name">
      <div v-html="post.content"></div>
    </div>
  </div>
</template>
```

As you can see, the content of the posts enters without a previous preprocessing or sanitization to the `v-html` directive. To fix this problem you just need to use the functions injected to Vue through some of the mentioned libraries (vue-3-sanitize library in this case).

``` html
<div v-html="$sanitize(post.content)"></div>
```

These sanitization libraries have a system of rules such as allow lists and deny lists. You can configure them to allow or ignore some HTML tags, properties, CSS, JavaScript, and others. It is up to you to test and examine your case 😉.

## If it is not Vue, is it you?

Vue is only as secure as you let it be. Vue ignores `<script>` tags introduced at runtime by default. However, it does not guarantee to cover other forms of JavaScript code injection or evaluation. Features such as "Text Interpolation" and different ways of sanitizing HTML tags, attributes, CSS, or JavaScript help to cover possible cross-site scripting scenarios in Vue. Avoid `v-html` if possible.

If you want to know more Vue content and how to manage the security around the Vue ecosystem. Take a look at this official [link](https://vuejs.org/guide/best-practices/security.html). Additionally, you can consider the use of the [content security policy](/content-security-policy-in-angular/).

## Don't trust ❌

Every year new frameworks appear, and it is not uncommon to find some XSS holes. Angular, React, and some other newer frameworks. All of them have their internal security policies. In the end, you make the most crucial security decisions. In Dev Academy, we have more posts related to the top frameworks and XSS. Check out these links.

* [Angular XSS prevention 🔐 Modern best practices](https://dev-academy.com/preventing-xss-in-angular/)

XSS attack can be very harmful and materializes when security policies are not considered correctly in the development process of our web app. Do not trust the data that the user can enter through web requests, forms, URLs, and others. Each user-provided content or input could mean a security hole and take full control of your website.

> There's no silver bullet!
