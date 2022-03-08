---
title: Securing Angular apps with Trusted Types to prevent DOM XSS
author: Christoph Jürgens
avatar: christoph-juergens.jpg
description: Learn how to secure Angular applications with Trusted Types to put an end to DOM XSS vulnerabilities.
date: 2022-03-08
tags: [Angular, Security]
---

A Cross-Site Scripting (XSS) vulnerability in an Angular application can be a &quot;game over&quot; scenario. As soon as attackers discover an XSS vulnerability in the app, they often can control the entire application. Angular ships with advanced XSS protection out-of-the-box, but even the smallest bug or unaware code mistakes can become a serious XSS vulnerability.

This article is the third part of our &quot;Preventing XSS in Angular&quot; series; we will look at another security layer to add to our in-depth defence strategy: **Trusted Types**.

Trusted Types is a web platform defence mechanism that can help to stop XSS vulnerabilities in our Angular application. We will learn how Trusted Types can stop the emergence of DOM XSS vulnerabilities and discuss how to configure Trusted Types in Angular.

<!-- toc -->

## Types of XSS

Cross-Site Scripting is a very dangerous attack vector. If a web application is vulnerable to XSS, an attacker can execute malicious code in the context of the application. Cross-site scripting vulnerabilities often allow an attacker to act as the user, which means performing any action on behalf of the user or accessing their data. Suppose the user has privileged access within the app, the attacker might be able to gain full control over all app functionalities and possibly access even more sensitive data.

Based on where an attacker places an injection for execution, XSS attacks can be divided into three main types: reflected (non-persistent), stored (persistent), and DOM-based XSS attacks (non-persistent and persistent).

{% img "types-of-xss.jpg" "Types of XSS" "lazy" %}

### Reflected XSS

Reflected XSS (non-persistent XSS) is one of the most common types of XSS. To execute a reflected XSS attack, the perpetrator crafts a link using malicious query parameters and tricks the victim into clicking on it by sending phishing emails or other social engineering techniques.

Compared to stored XSS, non-persistent XSS only requires the malicious script to be added to a link and a user to click on it.

### Stored XSS

Stored XSS, also known as persistent XSS, occurs when malicious code is injected directly into the vulnerable web application. To successfully execute stored XSS, the attacker locates a vulnerability in the app and injects a malicious script into the persistent memory of the server (for example, a user comment saved in the website's database).

The most common targets for stores XSS are websites that allow users to share their self-created content, such as comments on blogs, social networks, or reviews on e-commerce platforms. Each time anyone views the infected page, the malicious script is transmitted to the victim's browser.

### DOM XSS

DOM-based XSS is often quite similar to reflected XSS, except the malicious input never leaves the user's browser. This type of attack occurs when the DOM environment changes, but the client-side code does not change.

DOM-based XSS vulnerabilities can occur when the application accepts data from a source controllable by the attacker and passes it to a sink that supports dynamic code execution.

### Common sources controllable by an attacker

Any property that the attacker can control is potentially a dangerous source. The most common source for DOM XSS is the URL, which is typically accessed using the `window.location` object. An attacker can craft a link to a vulnerable page with a malicious payload in the query parameters and send it to the victim. When clicking on it, the evil payload executes in one of the sinks of the victim's browser.

### Sinks that can lead to DOM-XSS vulnerabilities

The following list shows some of the most common sinks that can lead to DOM-XSS vulnerabilities:

- `element.innerHTML`
- `element.outerHTML`
- `document.write()`
- `document.writeln()`
- `document.domain`
- `element.insertAdjacentHTML`
- `element.onevent`
- `element.src`
- `window.location`
- `document.cookie`
- `eval()`

## Mitigating XSS vulnerabilities

The fundamental reason for XSS vulnerabilities is the lack of context between the code of the application and the data inputted by the user. That means the best defence against XSS attacks is to make sure that the browser never interprets data as code and executes it.

In the [first part of this series](https://dev-academy.com/preventing-xss-in-angular/), we have seen that Angular comes with excellent XSS prevention mechanisms out of the box. Angular's auto-escaping defence mechanism escapes and sanitises all untrusted values to transform inputted data into safe values before being inserted into the HTML document.

To render user-provided HTML in an Angular template, we can use Angular's `[innerHtml]` attribute, which sanitises the data before injecting it into the DOM.

But as discussed in the article &quot;Prevent XSS in Angular&quot;, even having this built-in defence mechanism, not all Angular developers follow these coding concepts all the time. Marking user input as trusted by using Angular's bypass security functions or leaving the Angular environment and accessing DOM elements directly can easily lead to XSS vulnerabilities.

Unfortunately, this shows that XSS vulnerabilities in Angular apps are not impossible. The framework offers fantastic security mechanisms out-of-the-box by following the **Angular way of dealing with values**. However, just a single mistake can still result in Cross-Site Scripting vulnerabilities within your Angular app.

Trusted Types can help you eliminate these mistakes and harden your in-depth application security.

## What are Trusted Types?

Trusted Types is a browser security mechanism created by the security team at Google. This new tool limits the attack surface of the application&#39;s codebase by ensuring that all risky parts of the DOM can only be used by data that has passed a Trusted Types policy. When this policy is in place, the browser refuses to pass arbitrary string values to potentially dangerous sinks like JavaScript&#39;s `innerHTML`. This helps the browser figure out the difference between code and data, eliminating the main source of XSS vulnerabilities.

Trusted Types not only can help you secure your app from XSS attacks but also enforce safer coding practices, which also helps simplify auditing the code of your Angular application.

### How to enable Trusted Types?

Trusted Types can be enabled by using the Content Security Policy directive `require-trusted-types-for`. In part two of this series, we looked closely at CSP to prevent untrusted code from being downloaded and executed in our Angular application. To enable Trusted Types, you need to configure the Content Security Policy of the application to send the following policy:

```
Content-Security-Policy: require-trusted-types-for 'script'
```

### Trusted Types put an end to DOM XSS

Trusted Types improve the security of web applications immensely and are a great addition to the in-depth security of an Angular app. Trusted Types make sure your app cannot introduce any DOM XSS vulnerabilities. The security team at Google states that they have not observed even a single DOM XSS in their web applications since migrating to Trusted Types.

{% img "put-end-to-xss-by-trusted-types.jpg" "Put an end to XSS by using Trusted Types with Angular" "lazy" %}

## Securing Angular with Trusted Types

Since version 11, Angular has built-in support for Trusted Types. To enable Trusted Types in Angular, add the `require-trusted-types-for` directive to the application's CSP like described above. Additionally, set the directive `trusted-types` to `angular` to enable the Angular specific policy for Trusted Types.

```
Content-Security-Policy: require-trusted-types-for 'script' trusted-types angular;
```

With this policy in place, we can ensure that no data will be passed to the browser&#39;s HTML parser without first going through the Trusted Types policy. If a developer team member makes a mistake, like bypassing Angular&#39;s security mechanisms, the browser will refuse to pass the untrusted data to a potentially dangerous sink like `innerHTML`.

{% img "trusted-types-error-console.png" "Trusted Types error in console" "lazy" %}

Every small bug or mistake that could lead to an XSS vulnerability will throw such an error in the console. This means that using already Trusted Types in the development phase only will stop and highlight every dangerous assignment to an unsafe sink.

### Trusted Types and bypassing Angular&#39;s DomSanitizer

Trusted Types do not tolerate unsafe DOM assignments, so if your application uses any of the methods in Angular's DomSanitizer that bypass security, such as bypassSecurityTrustHtml, Angular will not allow them by default if you have set the Trusted Types for Angular. You need to enable these functions explicitly by adding `angular#unsafe-bypass` to the CSP of the application.

```
Content-Security-Policy: require-trusted-types-for 'script' trusted-types angular angular#unsafe-bypass
```

Please note that by doing so, you re-enable the use of bypassing the DomSanitizer. This means that you or any other developer in your team can now use functions like `bypassSecurityTrustHtml` in an insecure way, creating possible XSS vulnerabilities. However, insecure DOM manipulations through native element references will be blocked.

Still, considering the potential danger, it is strongly recommended to avoid using `angular#unsafe-bypass` and `bypassSecurityTrustHtml` or bypass Angular's DomSanitizer in any way.

## Browser support of Trusted Types

Trusted Types is a fairly new browser security mechanism, which means when writing this article, the [browser support](https://caniuse.com/trusted-types) is still quite poor. They are supported by Chrome and all Chromium-based browsers like MS Edge, but currently not Firefox or Apple's Safari.

However, that does not mean configuring Trusted Types for your Angular app is not useful! The opposite is true:

### Chrome in development

When using Chrome while developing an Angular app, we can configure Trusted Types, and Chrome will enforce the desired security behaviour. That means the browser will refuse to accept insecure coding patterns and force the developer to stick to **Angular's secure way of dealing with user input** while developing.

This forces the developers to build secure apps that can be safely deployed and be used by Firefox users. In production, Firefox might ignore the Trusted Types policy but can still rely on greatly improved security against XSS attacks because of the enforcement of safe coding patterns. They highlighted unsafe assignments to the DOM in development, and this helps allocate and fix these issues in the application's code, benefitting all users independently which browser they use.

## Third-party code and dependencies

Trusted Types is a browser-level protection mechanism, so it also applies to all third-party components and libraries containing such insecure coding patterns.

Trusted Types changes the behaviour of the browser. With Trusted Types enabled, when third-party code tries to assign unsafe data to a potentially dangerous sink like `innerHTML`, the user's browser does accept the data and does not execute it in the sink.

This browser behaviour protects the application even if a vulnerability exists in third-party code. However, please keep in mind that your web application is secure, but the third-party code does not get executed to break the application. To use the third-party code securely, you can specify a default Trusted Types policy.

### Default Trusted Types policy

You can specify a default Trusted Types policy using JavaScript and its `trustedTypes.createPolicy()` function so that the browser automatically applies this policy on every dangerous assignment on one of the dangerous sinks.

```javascript
<script>
    trustedTypes.createPolicy('default', {
      createHTML: string => DOMPurify.sanitize(string);
    });
</script>
```

In the above code snippet, the default policy applies [DOMPurify's](https://www.npmjs.com/package/dompurify) powerful sanitisation function on every assignment on a dangerous sink. Before injecting the data into the DOM, the browser sends it to the `createHTML` function, taking unsafe data as input and returning safe data as output. Now the browser can safely assign the sanitised data to the DOM. It is applied on all assignments to the DOM of your own code and introduced by a third-party dependency.

### Default policy requires browser support

It is important to note that using a default policy requires browser support for Trusted Types. This means if this default policy is used in production applications, you either only rely on browsers supporting Trusted Types or need to load a polyfill.

## Summary

Trusted Types are very powerful and could be a game-changer for preventing DOM XSS vulnerabilities. Enabling Trusted Types in your Angular application modifies the default browser behaviour, refusing to accept untrusted text-based assignments to potentially dangerous sinks in the DOM. This new browser feature developed by security experts at Google can greatly improve the security of your web application against XSS attacks.

The Angular team are big supporters of Trusted Types, so Angular has a built-in Trusted Types policy, making it super easy to enable by using the application's Content Security Policy. TT should be a part of every Angular application's in-depth security strategy, even if only used during development. Trusted Types result in more secure applications because it forces developers to write explicit code when using DOM-injection browser APIs.
