---
title: Web Application Security Checklist ✅ (for developers)
contributor: Bartosz Pietrucha
avatar: bartosz-pietrucha.jpg
description: Comprehensive list of practices and activities helping to build more secure Web applications.
date: 2023-09-15
tags: [security, architecture]
id: web-application-security-checklist
relatedPost: user-login-and-registration

popup:
   trigger: scroll
   header: 'Learn how to PROTECT web applications!'
   subheader: 'Proven methods to build ultra-secure systems'
   #image: https://dev-academy.com/img/optins/web-security-checklist.jpg
   # background: '#ff00ff'
   closeText: 'No, thanks. I can be hacked... ❌'
   cta:
      url: https://dev-academy.com/web-security#checklist
      text: Join with 40% OFF 🔥
---
In this list, we will cover a comprehensive (but not exhaustive!) list of practices and activities helping to build more secure Web applications. These techniques are mostly independent of programming language because they refer to general mechanics of how Web applications work. The model of Web security and common browser behaviour is what makes this checklist universal for all Web developers.

Why this is important? Development teams too often focus on implementing business logic (as they believe this is what they are paid for), not paying enough attention to security (until it's too late). Application security is something very often taken for granted, but this is far away from the reality in the wild trenches of public internet.

If you follow these security controls, you will not only build more secure Web applications, with multiple layers of security, but also make yourself a more competent developer. You will gain a powerful ability to identify security vulnerabilities and create proven mitigation steps.

{% checklist "https://checklist.dev-academy.com#checklist-blogpost" %}

## Table of Contents
<!-- toc -->

## Use HttpOnly and Secure cookies

HttpOnly cookies help to mitigate the risk of a [Cross-site scripting (XSS) attack](/preventing-xss-in-angular/). By setting the `HttpOnly` flag on a cookie, you can ensure that the cookie is not accessible by client-side scripts. This helps to prevent attackers from being able to steal the contents of the cookie and use it to impersonate the use.

Secure cookies can be used to help protect against man-in-the-middle attacks. When the **secure** attribute is set, a cookie will only be sent over an encrypted connection, helping to ensure that its contents cannot be intercepted and read by unauthorised parties.

## Sign the cookies with strong secret

Cookies are often used to authenticate users and maintain the state between sessions. However, cookies can be hijacked by third-party attackers and used for their own purposes. One way to help protect against this is to sign the cookies with a strong secret. Think of signature as a stamp that proves the issuer. The server setting the cookie generates a secret and store it for the further use. The secret is used to generate the hash that is added to the cookie. When the client sends the request back, the server verifies the signature regenerating it from the secret. If the values don't match, server should reject it. Any modifications to the cookie data will result in the signature becoming invalid. This can help to prevent attackers from injecting malicious data into the cookie or from impersonating a legitimate user by forging it.
> Most of the web frameworks support cookie signature out of the box. It the matter of proper configuration to provide this security feature. A secret should be strong enough to make it more difficult for an attacker to guess it and forge a cookie.

## Transport all data over HTTPS

An HTTPS connection encrypts all of the data (but not the URL address that is visited) that is sent between client computer and the website server that you are visiting. This helps to ensure that no one can spy on or intercept your traffic, helping to keep your information secure and confidential.

Encryption is especially critical when sensitive data is transported (credentials, credit card numbers, medical data). Using `Strict-Transport-Security` [header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) forces browser to use encrypted connections in certain situations.

## Use Content Security Policy

Content Security Policy (CSP) is a security measure that helps to protect Web applications from cross-site scripting and mitigate other types of injection vulnerabilities. By setting a CSP policy, you can help to ensure that only trusted sources are allowed to load content into the application. This can help to protect your visitors from malicious code execution that could be used to harm their computer or steal their data.

Implementing a Content Security Policy is like setting up a allow-list of trusted sources for your application. You can specify which domains (origins) are allowed to serve images, scripts, stylesheets, and other resources. This level of granularity allows you to control not just where your content comes from, but also what kinds of content are acceptable. For example, you can disallow inline scripts entirely (that we cover in the following point), which are a common vector for XSS attacks. You can also enforce that all content must be loaded over HTTPS, adding another layer of security.

The process of implementing CSP involves adding specific HTTP headers that dictate the policy. Modern web browsers interpret these headers and enforce the rules set by the web application. Violations can either be blocked or reported back to the server, depending on how you configure your policy. This makes CSP a powerful tool for monitoring and mitigating potential security breaches, as it provides real-time feedback that can be used to fine-tune the security settings.

## Do not allow inline scripts (unsafe-inline)

Inline scripts are scripts that are embedded directly in HTML pages, rather than being referenced through a separate script file.

One of the main reasons why you should not allow inline scripts (unsafe-inline) in the content security policy (CSP) is **security**.

Inline scripts can be a security vulnerability because they allow attackers to inject arbitrary code directly into a page. This can happen when the attacker "tricks" the application sending the input content that is actually a malicious code that is later mistakenly executed. By allowing inline scripts, developers are essentially enabling a way to execute arbitrary code on the page, which can lead to serious security issues.

## Use integrity property for external scripts

The `integrity` property is an attribute that can be used when including external scripts in an HTML page. It allows you to specify a cryptographic hash of the script, which the browser can use to verify the integrity of the script before executing it.

This technique ensures that the script being executed is exactly the same as the one that you intended to. If the script has been tampered with or modified in any way, the hash will not match and the browser will refuse to execute the script. Note that any single character (even a single bit) change in the content causes the hash to be different from the original one.

To use the `integrity` property, you can include it in the script tag as follows:

```html
<script src="https://example.com/script.js" integrity="sha256-flksdjlfkjczxcxm4dfsz32dsazx">
```

## Validate and sanitize all the user inputs

Validating and sanitizing inputs is an important security practice that helps to prevent a range of common attacks, such as cross-site scripting , SQL injection, and command injection. All that that comes from user input should be considered untrusted data.

There are a few reasons why you should follow this practice in the application:

1.  Protect against injection attacks: only properly formatted and safe data is accepted by the application. 
2.  Enhance security: you ensure that their application is not vulnerable to common attacks.    
3.  Improve user experience: user experience is improved by ensuring that users are only able to submit properly formatted and structured data. This can help to prevent errors and ensure that the application functions as intended.

> Remember that it is critical to implement these mechanisms on the server-side. Frontend validation can be improving the overall experience but can be easily bypassed (by using different client than browser, for example Postman).

## Throttle failed login attempts

In order to protect your web application from brute force attacks, you can use throttling to limit the number of failed login attempts that a user can make in a given period of time. This will help to prevent attackers from being able to guess your users' passwords by trying different combinations over and over again.

Brute force attacks involve attempting to find out a user's login credentials by repeatedly trying different combinations of username and password. These attacks can potentially be successful if the user has a weak or commonly used password, or if the system allows unlimited login attempts.

Throttling can mitigate the risk of this malicious behaviour by limiting the number of failed attempts that can occur within a certain time period. Implementing such mechanism is not trivial and requires an appropriate designs to not harm legitimate users.

## Check permission and role on every endpoint

Role-based access control (RBAC) is a common approach to managing access to resources in an application. It involves assigning users to specific roles and granting permissions to those roles to access certain resources.

Every endpoint in the application should be validated against the user's assigned role and its corresponding permissions. From the software design perspective, validation mechanisms should be detached from the application core logic (for example on the routing level).  Role-based access control provides:

1.  Simplified maintenance: RBAC can simplify maintenance by allowing developers to manage access to resources at a higher level, rather than having to manage access for each individual user.
    
2.  Improved scalability: As an application grows and the number of users increases, it can become difficult to manage access to resources on a user-by-user basis. Using RBAC can help to scale access control as the number of users increases, as roles can be easily added or removed as needed.

## Log application events and HTTP requests

There are several reasons why it is important for a web application to log application events and HTTP requests:

1.  Debugging: Logging can help you identify and troubleshoot problems with the application. For example, if there is an error in the application, the log may contain information about the error that can help you understand what caused the problem and how to fix it.
2.  Performance monitoring: Logging can provide valuable insights into the performance of the application. By analyzing the logs, you can spot bottlenecks and optimize the performance.
3.  Security: Logging can help with security by providing a record of activity on the application. This can help identify suspicious activity or potential security breaches, and can also be useful for compliance purposes.
    
Overall, logging is an important tool for understanding and improving the performance and security of a Web application.

## Consider Two-factor authentication w/ OTP

Two-factor authentication (2FA) with one-time passwords (OTP) is a security measure that requires users to provide two forms of authentication when logging into an account. The first form of authentication is typically a username and password, and the second form is a one-time code that is sent to the user's phone or email. This code must be entered in order to complete the login process. Sometimes the OTP is valid only for a short period of time that rises the level of security even more.

Multi-factor authentication with OTP can help to protect against unauthorized access to an account because even if an attacker has obtained a user's login credentials, they will still need the one-time code in order to log in. This can help to prevent account takeovers and other forms of cybercrime.

## Use Referrer-Policy HTTP header

The Referrer-Policy HTTP header is used to control the behaviour of the `Referer` header, which is sent by the browser to the server with each HTTP request. The header indicates the URL of the page that linked to the current page, which can be useful for tracking the source of traffic or for identifying referral links.

There are several reasons why you should use the Referrer-Policy HTTP header:

1.  Privacy: The `Referer` header can reveal the user's browsing history to the server, which may be a concern for privacy. By using the Referrer-Policy HTTP header, you limit or eliminate the information that is sent in the `Referer` header, which can help to protect user privacy.
2.  Security: The `Referer` header can potentially be exploited by attackers to gather information about a user's browsing history or to launch phishing attacks. By using the Referrer-Policy HTTP header, you can reduce the risk of these types of attacks.

## Sign JWT with a strong secret

JSON Web Tokens (JWTs) are a popular way to authenticate users and transmit information between parties. They consist of a header, a payload, and a signature, and they can be signed using a secret key.
It is important to sign JWTs with a strong secret because the secret is used to verify the authenticity of the token. If the secret is weak or is compromised, an attacker could potentially forge a JWT and gain unauthorized access to the system.
A strong secret helps to protect against this type of attack by making it more difficult for an attacker to guess or brute force the secret. A strong secret should be long, random, and unique, and it should be kept secure and protected from unauthorized access.
If you don't encrypt JWT tokens, which is usually the case, avoid putting sensitive data inside the payload as it can be easily decrypted with the `base64` algorithm.

## Ensure JWT lib does not accept alg: none

It is important to ensure that the JSON Web Token (JWT) library does not accept the **alg** value of **none** because this value indicates that the JWT is not signed. This means that the JWT can be easily forged or tampered with, as there is no way to verify its authenticity.

Accepting unsigned JWTs can potentially compromise the security of the system, as an attacker could forge or modify a JWT and gain unsolicited access.

To ensure the security of the system, it is important to ensure that the JWT library only accepts signed JWTs, and then it verifies the signature using a strong secret key.

## Avoid bypassing framework sanitization

Most of web frameworks offer build-in sanitisation of user input. Sanitization is the process of cleaning or filtering input data to remove or neutralize any potentially malicious content. This is an important security measure that helps to protect against injection attacks, when content from user input is treated by application as executable code.
Common best practice is to use the framework's built-in sanitization features for handling user input. Try to avoid bypassing these mechanisms when implementing a sophisticated feature that could motivate you to do so. It might be very tempting but can potentially lead to serious security vulnerabilities.

## Avoid Access-Control-Allow-Origin: *

It is generally recommended to avoid using the `Access-Control-Allow-Origin` header with `*` value, which allows any domain to access resources on the server. This header is used in Cross-Origin Resource Sharing (CORS), which is a mechanism that allows web pages to make requests to a server from a different domain. By default, browsers block these types of requests to prevent cross-site scripting (XSS) attacks, but the `Access-Control-Allow-Origin` header can be used to allow specific domains to access the resources.

While the `*` value allows any origin to access the resources, it can potentially leave the server open to abuse. An attacker could potentially use this header to access sensitive information or to launch an XSS attack. The best way is to specify a well-defined origin or list of origins that are allowed to access the resources, rather than using the wildcard `*` value.

## Use CSRF protection with anti-CSRF tokens

[Cross-site request forgery](/angular-csrf-protection-implementation/) (CSRF) is a type of attack that involves tricking a user into performing an unintended action on a website. This can be done by sending a malicious request to the website while the user is authenticated, and can potentially lead to serious consequences.

To protect against CSRF attacks, you can use anti-CSRF tokens: unique, random values that are generated by the server and sent to the client with each request. The client is then required to include the token in subsequent requests, which helps to verify that the request is legitimate. This adds an additional layer of security to the application and helps to protect against unauthorized actions.

## Regularly update dependencies

Open-source vulnerabilities can be really hard to identify. Keep all your `npm` (or any other package manager you use) dependencies up-to-date to ensure you are protected against known vulnerabilities. Adding `npm audit` to your CI/CD pipelines may be a feasible solution to automate the check on a constant basis. It not only identifies known vulnerabilities located in the current project's dependencies but also suggests fixes and alternative packages. This automated check can be a lifesaver, especially when managing large projects with numerous dependencies.

Additionally, consider using tools like Dependabot or [Snyk.io](https://snyk.io), which automatically create pull requests to update dependencies as soon as new versions are available. This proactive approach ensures that you're always running the most secure versions of your dependencies, minimizing the attack surface.

## Harden Web server

One of the foundational steps in securing a web application is to harden the web server on which it runs. This involves minimizing the attack surface by disabling unnecessary services, features, and ports. Use security modules and configurations specific to the web server software (like Apache's mod_security or Nginx's security directives) to filter and process incoming requests. Regularly update the server software to patch known vulnerabilities and employ intrusion detection systems to monitor and alert on suspicious activities. Proper server hardening acts as an additional layer of defence, making it more challenging for attackers to exploit the web application.
> WARNING: Database servers require hardening as well.

## Consider a strong password policy

A robust password policy is a cornerstone of web application security, serving as the first line of defence against unauthorized access. A weak password can easily be cracked, giving attackers the keys to your application. Therefore, it's crucial to enforce strong password requirements, such as a minimum length, and the inclusion of uppercase letters, numbers, and special characters.

Additionally, passwords should be hashed using strong cryptographic algorithms like `bcrypt` before storing them in the database, making it computationally difficult for attackers to reverse-engineer them.
> WARNING: Hashing is not the only thing you can do with the password before storing it. Adding a random piece of content, called salt, can be appended to the password before hashing making so-called **rainbow tables** useless. Rainbow tables are pre-computed dictionaries of common passwords and their corresponding hashed values. It is computationally cheaper to find the hash (and its source value) in the table than to calculate it before each comparison.

## Use state parameter in OAuth flows

The state parameter is an optional parameter that can be used in OAuth flows to protect against cross-site request forgery (CSRF) attacks. OAuth is a protocol that allows users to authorize third-party applications to access their accounts or resources on other websites. When a user initiates an OAuth flow, the application generates a unique, random value and includes it in the authorization request as the state parameter. The server then includes this value in the response and redirects the user back to the application.
The application can then verify that the value of the state parameter in the response matches the value that was originally sent in the request. If the values do not match, this may indicate that the request was tampered with or forged, and the application can reject the request. This adds an additional layer of safety to the OAuth flow and helps to ensure the integrity and security of the system you are developing.

## Use `nonce` parameter in OIDC flows

The `nonce` parameter (nonce = *n*-umber used only *once*) is an optional parameter that can be used in OpenID Connect (OIDC) flows to protect against replay attacks. OIDC is a protocol that allows users to authenticate with a third-party application using their account on another website, such as a social media platform or identity provider.
When a user initiates an OIDC flow, the application generates a unique, random value and includes it in the authentication request as the nonce parameter. The server then includes this value in the response and redirects the user back to the application.
The application can then verify that the value of the nonce parameter in the response matches the value that was originally sent in the request. If the values do not match, this may indicate that the request was tampered with or forged, and the application can block the request.

## Use Proof Key for Code Exchange in OAuth

The Proof Key for Code Exchange (PKCE) is an extension to the OAuth 2.0 authorization flow that is designed to protect against authorization code interception attacks.

In a traditional OAuth flow, the user is redirected to the authorization server, where they are prompted to grant access to their account. The authorization server then sends an authorization code to the application, which the application can exchange for an access token. However, this process is vulnerable to authorization code interception attacks, in which an attacker intercepts the authorization code and uses it to obtain an access token. This can potentially lead to unauthorized access to the user's account.

To protect against this type of attack, PKCE adds an additional step to the OAuth flow in which the application generates a random value called a "code verifier" and a hashed version of this value called a "code challenge". The code verifier is sent to the authorization server along with the authorization request, and the code challenge is sent to the user's device. The server includes the code challenge in the response and redirects the user back to the application. The application can then verify that the code challenge in the response matches the code challenge that was originally sent, which helps to ensure that the request is legitimate.

## Don't expose information in error messages

Displaying detailed error messages in production applications can pose a significant security risk. These messages often contain sensitive information such as stack traces, database queries, or internal workings of the application, which could provide attackers with valuable insights into the system. An attacker can use this information to understand the architecture and vulnerabilities of the application, making it easier to craft targeted attacks such as SQL injection. Therefore, verbose error messages can inadvertently serve as a roadmap for malicious users, helping them navigate through the system's weaknesses.

To mitigate this risk, it's advisable to implement custom error pages that show generic messages to the end-users while logging the detailed error information on the server side for internal review. This approach maintains a balance between user experience and security. Users are informed that an error has occurred, but they are not exposed to any sensitive information that could compromise the system.

## Conclusion

I hope this explanatory web application security checklist opens many eyes to the problem of web application security. It is vital for the development teams to establish security standards inside the company to maximize the ROI of these activities. Implementing these points will improve the security of the web (and potentially mobile applications) that you or your company delivers to the market. These skills should be a part of every web developer toolkit, not only security professionals.

Don't fall into the illusion that your job as a software engineer is just to provide business logic. Application security is something that real professionals have always in the back of their heads.

We have covered many points on the secure SDLC management process that is by no means complete. The goal was to raise the awareness of the problem space for Web developers. If you want to learn more about security consider checking out my program: [Web Application Dev Academy](/web-security), a 12-week learning program that will make you a real Security Ninja!

Let's build secure Web applications!


