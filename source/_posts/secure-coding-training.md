---
title: Secure coding training 🛡️ 7 steps to secure Web apps
contributor: Bartosz Pietrucha
avatar: bartosz-pietrucha.jpg
date: 2022-12-16
tags: [security, architecture]
description: Make your Web applications ultra-secure with 7 secure coding steps
id: secure-coding-training
relatedPost: user-login-and-registration
---
{% image_fw 1.78 banner.png "Secure coding training 🛡️ 7 steps to secure Web apps" %}

The importance of secure coding training is often underestimated. While most developers are aware of the need to keep their code secure, they may not be aware of the specific steps that need to be taken to achieve this. In this blog post, we'll outline 7 steps that all web developers should take in order to ensure their applications are as secure as possible. By following these simple steps, you can help protect your users and your business from potential security threats. So let's get started!

<!-- toc -->

> At Dev Academy, we teach developers **the art of secure coding** via [Web Security Academy](https://websecurity-academy.com), which is one of our flagship courses! 🔥 Participants receive **video-based lessons along with assignments** about web application security from a software developers' perspective. They participate in **live Q&A sessions** and take an active part in the online community of our students.

## What is secure coding and why is it important

Secure coding is an integral part of software development that ensures applications are built to reduce the risk of potential security vulnerabilities. Companies regularly invest in secure coding practices as a way to guard against application security threats and protect their software from malicious attacks. The process involves implementing various cryptographic techniques, like encryption and hashing algorithms, to communicate and store data securely. In this way, secure coding can help improve software usability by protecting the customers’ data while also shielding businesses from cyber-criminals. Investing in secure coding practices is essential for companies hoping to keep their software safe and reliable for users – now more than ever given the recent surge of cyberattacks due to digitalization.

## The 7 steps to secure coding

Let's try to understand how to make the applications we build secure with 7 secure coding guidelines.

### Step 1: Understand the Web security model

If you want to ensure that your website is secure and that no unauthorized users can gain access to it, understanding the basic web security model is step one. In order to keep your site safe and secure, you will need to have an in-depth knowledge of how **browsers, servers, and networking protocols** all play a part. Knowing the different types of threats to look out for, developing defensive strategies, and recognizing potential weak points are all key elements of this model.

We need to understand how the **Same-origin Policy**, [Content Security Policy](/content-security-policy-in-angular/), **Cross-origin Resource Sharing**, subresource integrity, hashes, nonces, signatures, and so on. This step would be our foundation in order to progress in our journey.

{% img "model.png" "Web security model" "lazy" %}

### Step 2: Prevent common security vulnerabilities

The second step is to understand common yet still very serious security vulnerabilities. There are proven strategies and ways to prevent these well-known vulnerabilities. **OWASP Top 10** is a project by a non-profit organization, [OWASP](https://owasp.org), that is trying to gather common security risks in one place.

OWASP Top 10 lists the **10 most important security issues** regarding web applications. For example, one of those common issues may be [cross-site scripting](/preventing-xss-in-angular/), which is deadly when it comes to its consequences and how it actually makes it possible to break the application. Imagine that you have an attacker, a hacker, and a vulnerable website. It can be any website that has something more than just plain text like an online shop, some social network platform, or something that makes some actual business. If an attacker is able to inject (through many different ways) **some malicious code** into the secure context of the website that code may steal cookies or even execute queries on behalf of the logged user. Think of an online shop and a script that can make some purchases. Generally speaking, if an application is vulnerable to cross-site scripting it allows the execution of an arbitrary code that the user may not be aware of that.

Other common vulnerabilities are **cross-site request forgery** or [server-side request forgery](/server-side-forgery-request/). Another issue is using misconfigured or vulnerable components that create many attack vectors. Let's not forget about SQL injection or local file inclusion.

### Step 3: Choose a proper authentication architecture

During the development process software architects and the team need to decide about **authentication architecture**. When deciding on the right authentication architecture for your application, cookie-session and JWT token are two popular options. Cookie-session is used to identify an individual user's request, making it possible to differentiate amongst a pool of users. JWT tokens utilize cryptography to provide a secure way of transferring data between two systems in a stateless fashion.

Both cookie sessions and JWT tokens have their own advantages and drawbacks that you should consider before choosing a proper authentication architecture for your application. Depending on factors such as scalability and security requirements, one of these architectures might be more suitable than the other. The decision about proper session management in the application is usually a trade-off between security, technical feasibility, business requirements, and user experience.

{% img "tradeoffs.png" "Trade-offs of authentication architectures" "lazy" %}

### Step 4: Secure role-based authorization implementation

The fourth step is to implement a secure role-based, permission-based authorization. In this case, we may think of the **shared account** and different users with different roles interacting with the UI. There may be a single-page application with an API behind it. And in this step, we have a couple of relevant substeps:

*   model the domain for a multi-user account system,
*   efficiently manage the permissions,
*   design a secure API,
*   convey this session information to the user-auth object,
*   use interceptors and middlewares,
*   show and hide particular components conditionally based on the user's role.

{% img "roles.png" "Role-based access control" "lazy" %}

### Step 5: Add additional layers of security

To make our systems ultra-secure we need **additional layers of security**, like two-factor authentication. In order for a user to authenticate providing just the password is not enough. There must be something on top of the username and password pair, which is called the second factor. It might be an additional [time-based one-time password](/angular-otp-verification/), iris scan, fingerprint scan, or other unique property.

Login throttling can prevent *brute force attacks*, *dictionary attacks*, and *credential stuffing attacks*. If the system does not prevent excessive password trials to impersonate the user, this creates a serious attack vector. Storing users' passwords securely with hashing and salting is also extremely crucial in case of a data breach.

Hackers are smart, they use different techniques in order to break the system. Having **user input validation and sanitization** is absolutely necessary not only on the front-end side but on the server side especially. We need to make sure that whatever the backend receives is always considered unsafe before further processing.

Secure code is not just about programming. We also need to remember about the surrounding infrastructure not to mention using a secure connection via HTTPS.

{% review_screen "review_1.png" "https://websecurity-academy.com" %}

### Step 6: Use different levels of logging

We need to know what is happening in the system. We want our system to be accountable, which means we know what happens so that we have an insight if something wrong happens. We need different levels of logging.

The first level of logging is **access-level logging** so we log every single HTTP request with the corresponding timestamp, URL, and IP. On a second level, we would need to have **application events logging**. We want to have a system with mechanisms that log every meaningful application-level event for its accountability. We want to know *who*, *when* and *what* did in the system, like registration, password reset, transaction, or purchase.  

### Step 7: Test application security

The last step is to test your security. Doing a comprehensive code review is not enough to ship secure applications. We need to adopt the culture of **DevSecOps** which involves a so-called **shift-left mindset**. It moves the security testing activities to the left side of the software development process baking it inside actual development. There are different tools allowing to perform static code analysis and static application security testing (SAST). One of the leading providers of such tools is [Snyk.io](https://snyk.io) with Snyk Open Source and Snyk Code.

## Why you should consider investing in secure coding

In these seven steps explained we just scratched the surface of the best practices of modern web application security. [Web Security Academy](https://websecurity-academy.com) provides **a complete training program** in form of an online course with Q&A meetings and trainer's support. It provides the knowledge and skills required by development teams to design and implement secure web applications. Included programming tasks and challenges help to learn the concepts in practice. Students finish the program **familiar with different security risks** and know how to implement secure solutions to mitigate security threats. The entire training experience rises security awareness in the software development process.

The implementation examples in the program use Angular and Node (with TypeScript), but the underlying **concepts are applicable to any web stack**. Java, Python, or C# teams can easily participate in the training as secure programming tactics are general. Secure coding training educates teams on how to design and write code in such a way that it is not vulnerable to malicious attacks.
