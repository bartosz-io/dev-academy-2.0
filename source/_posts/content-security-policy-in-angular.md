---
title: Protect Angular apps with ⚔️ Content Security Policy
author: Christoph Jürgens
avatar: christoph-juergens.jpg
description: Protect Angular apps with Content Security Policy (CSP) against security vulnerabilities in Angular (JavaScript) applications. ⚔️
date: 2022-01-21
tags: [Angular, Security]
id: angular-csp
relatedPost: trusted-types
---
{% image_fw 1.78 banner.png "Content Security Policy Angular" %}

This article is the second part of our "Preventing XSS in Angular" series. In the last article, [Angular XSS prevention](https://dev-academy.com/preventing-xss-in-angular/), we have seen that Angular ships with fantastic security mechanisms to protect our application against XSS (Cross-Site Scripting) vulnerabilities. However, even small bugs or mistakes could lead to severe security risks, so it's recommended to integrate an **in-depth** **defence strategy** into our Angular application.

This article teaches you how to use Content Security Policy to prevent untrusted code from being loaded and executed in your Angular application.

<!-- toc -->

{% img "cyber-risks-everywhere.png" "Security risks everywhere" "lazy" %}

## What is Content Security Policy (CSP)?

Content Security Policy is a security standard for websites and single-page applications to help prevent XSS attacks and other forms of attacks like clickjacking. It is a valuable security layer to add to your defence-in-depth concept.

The main idea behind CSP is to limit the download of resources to trusted origins only. Therefore, the developer can define allowlists of origins to tell the browser which resources can be loaded and executed in the web application context.

But it's important to note that only modern browsers support CSP, no legacy or older browsers, e.g., MS Internet Explorer before Edge. So CSP should only be considered as an **additional layer of protection**, not a complete security solution by itself.

{% img "good-security-policy.jpg" "A good security policy has layers" "lazy" %}

## How does CSP work?

CSP is a built-in browser mechanism, which uses an HTTP response header to reduce security risks by declaring which resources the browser can safely load. The Content-Security-Policy header allows you to restrict how resources such as JavaScript, CSS, or pretty much anything that the browser loads.

If an Angular app or any other web app contains an XSS vulnerability, the browser may understand arbitrary code injected by a malicious user as valid code and execute it. CSP aims to prevent the execution of each of these attack vectors.

By design, it is implemented via HTTP response headers, but you can also use meta elements in the head of the HTML page. The browser follows this policy and actively blocks violations from untrusted sources as they are detected.

### CSP Directives

CSP uses standardised directives to tell the user's browser which resources are safe to load; it rejects undeclared origins to prevent potential harm. To archive this, you need to add the Content-Security-Policy HTTP header to every response from the server.

```
Content-Security-Policy: <directive> <origin>; <directive> <origin>;
```

The CSP header value uses one or more directives to define several content restrictions. If you want to set multiple directives, you must separate them with a semicolon.

#### _default-src_

The _default-src_ sets the default the following CSP directives. It is used as a fallback if directives are not declared, which means that if a directive is missing in the CSP header, the browser uses the _default-src_'s value.

The following example uses `'self'` to indicate the web app's origin and _dev-academy.com_ as an external trusted origin.

```
default-src 'self' dev-academy.com;
```

#### _script-src_

The _script-src_ directive is probably one of the most important directives; it defines trusted sources of JavaScript code to be loaded and executed.

```
script-src 'self' code.jquery.com;
```

#### _style-src_

The _style-src_ directive defines or restricts origins for CSS files. It allows you to avoid data exfiltration via CSS.

```
style-src 'self' styles.dev-academy.com;
```

#### _img-src_

The _img-src_ directive defines locations to load images safely.

```
img-src 'self' img.dev-academy.com;
```

#### _font-src_

The _font-src_ directive specifies sources for fonts that you trust.

```
font-src 'self' fonts.dev-academy.com;
```

#### _media-src_

The _media-src_ directive states trusted origins of audio and video, for example resources used in HTML5 _\<video\>_ or _\<audio\>_ elements.

```
media-src videos.dev-academy.com;
```

{% banner_ad "wsf_bundle.gif" "https://courses.dev-academy.com/p/web-security-fundamentals" %}

#### More CSP directives

The above list is just a few examples. Please follow this [link](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) to find a complete list of CSP directives maintained by Mozilla.

### Source values

Next to the origins, the CSP directives also support predefined values. One of them is the already mentioned `'self'` value, which only allows resources to be loaded from the current origin, and the `'none'` value does not allow loading any resources.

Additionally, CSP also supports unsafe values, which you should avoid using if possible. `'unsafe-inline'` allows the execution of inline scripts or styles. However, as the name applies, using `'unsafe-inline'` is generally unsafe as it withdraws most of the security benefits that our CSP provides.

If you require to allow inline scripts or styles on your application or website, you should consider using hashes or nonces if possible, which we will discuss later in this article.

### Example for CSP with Google fonts

Typically, Google fonts are injected via a link tag in the head of the HTML document to load the specific stylesheet. To allow the download within our policy, we need to add _font.googleapis.com_ to our _style-src_ directive.

Additionally, we need to allow the actual font-face file, so we need to add _fonts.gstatic.com_ to our CSP using the _font-src_ directive. The result of our Content-Security-Policy header to allow Google Fonts would be the following:

```
Content-Security-Policy: default-src 'self'; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com;
```

### CSP script hashes

These days many web applications require inline scripts to run trusted JavaScript code. The following code shows a simple example:

```javascript
<button id="world">Click me</button>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('world');
    btn.addEventListener('click', () => {
      alert('Hello World');
    });
  });
</script>
```

As already mentioned, the Content Security Policy would stop the execution if we do not set it to _script-src `'unsafe-inline'`_. However, this would not only allow the code snippet above, but it would also allow all inline code, which should be considered a security risk.

One solution could be to use a hash, which validates the integrity of the script block and is supported since CSP Level 2. The following snippet shows an example of a CSP that allows only this specific inline code to be executed.

```
Content-Security-Policy: script-src 'self' 'sha256-cUN0iCe95mZM+mPih5Szx44P95WiP83dlW8+qPvZXgQ=';
```

When the browser loads the web page and finds the code block, it calculates the hash of the inline script and checks if it is listed in the CSP as trusted.

Make sure not to change your inline script after creating the hash. The smallest adjustment changes the hash function's output, even adding or removing a single space. Also, note that hashes only allow a single code block to be executed.

If you don't want to create hashes manually, you can use Google's Chrome (or any Chromium-based browser) to calculate them for you. It displays the expected hash as an error message in the DevTools console, and you can copy it from there to use it in your CSP.

{% img "csp-hash.png" "CSP error in developer tools console" "lazy" %}

### CSP script nonces

Another mechanism to allow trusted inline JavaScript code to run is a _nonce_, which stands for "number only used once" or "number once". It is a pseudo-random number/string that you should only use for a single purpose and needs to be refreshed on every page load.

```javascript
<button id="world">Click me</button>
<script nonce="ur5Il6lUIneZXou">
  document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('world');
    btn.addEventListener('click', () => {
      alert('Hello World');
    });
  });
</script>
```

We use the nonce attribute within the script tag in the above snippet. The same nonce needs to be added to the CSP header, as shown here:

```
Content-Security-Policy: script-src 'nonce-ur5Il6lUIneZXou';
```

When loading the page, the browser compares the nonce of the script tag attribute with the nonce in the Content Security Policy. If they match, the browser considers the code block as trusted and executes it.

It is important to remember that nonces need to be recreated on every page load. A cryptographic function should create them, and they should only be used once, as the name applies! This prevents an attacker from guessing our nonce and injecting malicious code tagged with a valid nonce value.

### CSP Reporting and Testing

Another interesting feature of CSP is reporting policy violations using a special URL. To allow reporting, we need to add the _report-uri_ directive to the policy and provide at least one URI to specify where the browser can send the reports.

```
Content-Security-Policy: default-src 'self'; report-uri https://dev-academy.com/report-violations;
```

The use of the _report-uri_ directive can be useful to monitor the Angular production application regarding potential Cross-Site Scripting attacks or log any misconfiguration of your policy.

If you only want to test the configuration of your CSP, you can use the _Content-Security-Policy-Report-Only_ header. This header generates reports and shows errors in the browser's developer tools but does not enforce the policy.

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri https://dev-academy.com/report-violations;
```

## How to implement CSP in an Angular app?

Now that we have had a detailed look at what Content Security Policy is and why it is so important as an additional layer of security let's talk about how to enable it in an Angular application.

Angular uses View Encapsulation, which encapsulates a component's styles within the host element so that these styles do not affect the rest of the application. This behaviour results in inline styling created by the framework, which requires `'unsafe-inline'` for the _style-src_ CSP directive when using Angular. Therefore the minimal Content Security Policy required for an Angular application is:

```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline';
```

Setting the `style-src` directive to `'self' 'unsafe-inline'` allows the application to load its global styles from its origin (`'self'`) and its components to load their inline styles (`'unsafe-inline'`).

The use of `'unsafe-inline'` for styles does not seem ideal, but the security team at Google is not concerned about it; they claim its risk is very low. But it is important to make sure to follow all recommendations and best practices from my last article, [Angular XSS prevention - Best practices](https://dev-academy.com/preventing-xss-in-angular/).

It's also important to ensure **only allow `'unsafe-inline'` for your styles**, but not for _default-src_ or _script-src_. Allowing inline scripts decreases your Content Security Policy's effectiveness immensely!

Unfortunately, including remote code files is not very easy either. CSP hashes do not work for external resources, and also nonces are not an option because they need to be refreshed on every page load, which conflicts with the static design of our Angular application. The only solution is to allow the origin from where the code gets loaded.

### CSP using HTTP header (server-side)

There are multiple ways to enable Content Security Policy within your Angular app; one sends the configuration with every HTTP response header from the server, as shown in the examples above. Any server-side programming environment or webserver should allow you to send a custom HTTP response header.

For example, if you use NodeJS with Express and serve your Angular application as static files, you can use the popular [helmet-csp package](https://www.npmjs.com/package/helmet-csp). This middleware helps to set your Content Security Policies.

```javascript
const contentSecurityPolicy = require("helmet-csp");
app.use(
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: \["'self'"\],
      styleSrc: \["'self'", "'unsafe-inline'"\],
    },
    reportOnly: false,
  })
);
```

If you don't want to use a server-side programming language to add the HTTP header and use Apache, for instance, you can set the server configuration within the .htaccess file:

```
Header add Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'"
```

### CSP using a meta tag (client-side)

Supposing you do not have access to the server configuration, you can also set the Content-Security-Policy using a meta tag in the head of the index.html of your Angular app.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'">
```

Please note that the _report-uri_ directive only works with HTTP headers, not when using the _http-equiv_ attribute of the meta tag.

## Conclusion

This article has explained how CSP works and how to add it to your Angular applications. Content-Security-Policy is an excellent mechanism for adding an extra layer of security to the **in-depth** **defence strategy** of your web app. We answered the most asked questions when it comes to Angular CSP:

**Is Content Security Policy a stand-alone security solution to protect against XSS attacks?**

No, Content Security Policy is not a stand-alone security solution; it should only be considered a second defence layer against XSS vulnerabilities.

**Does Content Security Policy work in every browser?**

All the major modern browsers support Content Security Policy, but it is not supported in Internet Explorer before MS Edge.

**How can I debug my Angular Content Security Policy?**

The easiest way to debug your policy is to use Content-Security-Policy-Report-Only and view the results in your browser's developer tools. The console will list each CSP error without enforcing the policy.

**Can I completely avoid unsafe-inline in CSP for an Angular application?**

No, currently Angular requires using unsafe-inline, but only style-src.

### More Angular CSP

In the next article of our "Preventing XSS in Angular" series, we will take a deep dive into a fairly new but powerful CSP directive: Trusted Types with Angular.