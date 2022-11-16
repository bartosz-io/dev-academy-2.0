---
title: Server-side request forgery (SSRF) Protect app from spies
contributor: Gerome Grignon
avatar: gerome-grignon.png
description: Learn how a simple URL can attack your back-end and bypass your server-side security
date: 2022-10-09
tags: [security]
id: server-side-request-forgery
relatedPost: xxe-attacks
---
{% image_fw 1.78 "banner.png" "Server-side request forgery" %}

## Table of Contents
<!-- toc -->

## Definition

In 2021, the **Server-Side Request Forgery** joined the TOP 10 OWASP listing about widespread web security vulnerabilities.

This ssrf attack aims to trick your server into acting upon it. The attacker targets web applications communicating through URLs by sending a direct URL or hiding it in some metadata content.

This supplied URL can **perform malicious actions**, allowing the attacker to access internal services, perform post requests, or read server configuration. The ssrf attack will be processed by the vulnerable server directly. Internal resources are exposed by bypassing the authentication keys of your web server security control.

By sending such a third-party URL to the frontend side, it can send requests to track the user or import untrusted data.

Discover a long list of web-server or internal systems URLs targetable by this server-side request forgery [here](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Request%20Forgery).

{% image 600px "web-unlock.jpeg" "Introduction" %}

Photo by [FLY:D](https://unsplash.com/@flyd2069) on [Unsplash](https://unsplash.com/s/photos/hacking)

## Use case: Images

An everyday use case for web applications is to render images provided by users: avatar profiles, e-commerce items, and chats. It implies submitting images to the database and exposing them to other users.

Among accepted image formats, some are **easily vulnerable** to ssrf attacks:

*   URL
*   HTML
*   SVG

## SSRF vulnerability scope

To understand how to prevent ssrf attacks, you need to know how it affects your web application security. Suffering from it means your frontend and backend applications are vulnerable and must be protected.

Your front-end application is responsible for providing weak content to your backend and consuming them by querying URLs while your back-end application is processing these attacks, **exposing your protected resources**.

Our situation has two solutions: to limit the accepted formats with a safelist or add validations.

### Solution 1: Restrict image source

HTML and SVGs content is very tricky to validate and sanitize, and you can't guarantee safe submitted data. Such formats are now forbidden from many web applications, so I encourage you to **exclude them from the safelist** by proposing alternative formats to the user.

### Solution 2: URLs validation

While your first thought might be not to rely anymore on URL references for image content for your application, there are solutions to keep such a feature without exposing it to ssrf attacks. It requires defining a limited list of URLs allowed to provide image content. Websites commonly use it with partner hosting images, using only these URL schemas.

Not limited to the resolution of the server-side request forgery, you need to include a [Content Security Policy](/content-security-policy-in-angular/). Such a policy will limit communication with external resources by selecting target URLs.

You must also protect your server from importing data and saving vulnerable content.

It starts with user input, you need to circumvent input validation and block unused URL schemas. It won't protect your application from all ssrf attacks but will act as the first protection to prevent internal networks from being exposed.

It implies acting on your server-side code as well by tracking incoming links and adding another layer of input validation.

## Conclusion

{% image 600px "web-lock.jpeg" "Conclusion" %}
Photo by [FLY:D](https://unsplash.com/@flyd2069) on [Unsplash](https://unsplash.com/s/photos/hacking)

Without solid web security, server-side request forgery can be tricky to identify. It explains why it joined the top 10 OWASP listing about widespread web security vulnerabilities.

Join the [Web Security Academy](https://websecurity-academy.com) to learn how to protect your apps!
