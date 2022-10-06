---
title: React Security – Best Practices
author: Gert J. Oberholzer
avatar: kobus-oberholzer.png
description: A brief overview of some of the security risks associated with working on a React JS project and how to avoid them.
date: 2022-09-22
tags: [React, Security]
id: react-Security-best-practices
relatedPost: react-xss
---

{% image_fw 1.78 banner.png "React Security Best Practices" %}

In this article, we'll discuss some of the best practices for security when using React in your web applications. We'll cover topics such as how to avoid malicious code injections, avoid memory leaks, and more. By following these best practices, you can help keep your React-based web application safe and secure.

## Table of Contents

<!-- toc -->

## React and Security Vulnerabilities

When it comes to building web applications, security should always be one of the leading priorities. React is no exception. React's popularity has made it a target for attackers.

Most vulnerabilities can be avoided by following a few rules general to almost all frameworks such as

- keeping sensitive data encrypted as a rule, unless explicitly required otherwise
- not uploading your .env files to your git repository
- following the rule of least privilege where applicable
- keeping libraries up to date and checked
- don't make using libraries the first resort for everything

I recommend taking a look at this article about [Vue Security Best Practices](https://dev-academy.com/vue-security-best-practices/). Many of the concepts are relevant irrespective of your preferred framework.

Generally, front-end developers tend to not deal with many security concerns, since most modern frameworks inherently do most of the heavy lifting, you need (mostly) only concern yourself with the few rules stated above.

That being said, there are always edge cases and nuances. Security is never an issue until it is a disaster. Here are a few React-specific scenarios and best practices to keep in mind.

## HTML Injection attacks

One can't mention React Security without mentioning the aptly named dangerouslySetInnerHTML property.

### dangerouslySetInnerHTML

Let's say you would like the user to leave comments below your articles, but you would also prefer them to express themselves with common font managing options. The simple answer is to allow directly inserting HTML:

```jsx
return <p dangerouslySetInnerHTML={{ __html: input }}></p>;
```

As the name suggests, the use of this property is discouraged, and for good reason. The user could very well provide a seemingly suitable input that triggers adverse effects intended to hijack your web app.

```jsx
    <h1>Dear Blog Owner</h1>
    <p>I have been reading your blog for A <b>Very</b> long time and hope you don't take it personally when I inject my Alert into your website.</p>
    <img src="null.png" onerror="alert('I support this blogger');" />
```

The above input will produce an alert commonly used to demonstrate XSS (Cross-site scripting) as a possibility. Learn [more about XSS](https://dev-academy.com/react-xss/#dangerouslysethtml).

### How to negate it

These types of scenarios can easily be avoided by limiting direct interaction with the DOM. Fortunately using React, you don't directly interact with the DOM. Instead, you are interacting with a virtual DOM created by React, which is a memory-based copy of the real DOM. This is a side effect of how React works using components, as explained in React's tutorial [here](https://reactjs.org/tutorial/tutorial.html).

Most XSS-related attacks can be completely and easily avoided by opting to only use **JSX (data binding syntax)** or **TSX** for TypeScript users. React will automatically escape values to defend against XSS attacks.

```jsx
let someData = 'I am safe from XSS';
return <div>{someData}</div>;
```

You can still use dangerouslySetInnerHTML, but you will need to make use of a library that can scrub the user input of any potentially malicious code. One such library is **DOMpurify**, which can be installed using:

```jsx
    npm install dompurify
```

and used:

```jsx
import purify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: purify.sanitize(input) }} />;
```

> Output encoding is the process of ensuring that data returned by your application is properly encoded so that it cannot be misinterpreted by browsers or other applications. This helps to prevent cross-site scripting (XSS) attacks.

## Arbitrary Code Execution

ACE Vulnerabilities are flaws in systems that allow bad agents to execute their malicious script on a victim's computer. One such flaw is the infamous Zip Slip.

### Zip Slip

A Zip Slips Vulnerabilities happen when trying to unpack archive files such as tar, jar, war, cpio, apk, rar, and 7z. When this code is executed, it will attempt to traverse outside the file directory of the project and inject arbitrary code somewhere to be later executed by the user, unaware of the security vulnerability.

This malicious code was found in a lot of popular library codes intended for react apps. This again shows the importance of due diligence and reviewing library code before using it.

### How to negate it

Fortunately, a few services exist that review and detect security issues within libraries and some even detect unsafe usage within your code during and after development. One such service is Snyk which offers many services and tools that automatically detect security issues.

## XML External Entity Attack (XXE)

XML attacks are when a malicious agent injects XML code into a vulnerable program and makes a request for potentially privileged data from a server.

```html
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xml[ <!ENTITY file SYSTEM "file:///etc/paswrd" ]>
<div>
  <title>&file</title>
</div>
```

A simple explanation is, that a hacker sends an XML query containing the payload to the server, and the server sends the input values to the database which then responds with the requested data which the hacker now has access.

{% img "xml-attack.png" "Simple XML attack" "lazy" %}

This attack can happen when a weakly configured XML parser is used. However, can easily be negated by using XXE detecting tools and ensuring all XML processing code is up to date. Vulnerabilities like these tend not to be present in most cases due to modern frameworks handling most safety concerns like these.

## Memory Leaks

A memory leak refers to any scenario where memory is occupied but its usage is no longer needed or valid leading to potential security issues. This can be leveraged in a DDOS attack by occupying system memory until it crashes or instigates unsought behavior in the program.

An example in react would be failing to unsubscribe to a component before it gets unmounted.

### Referencing unmounted components

When working with classes in react, it is important to understand the component lifecycle and how to use life-cycle methods. This is explained well in the React JS [Documentation](https://reactjs.org/docs/react-component.html#reference).

{% img "component-lifecycle.png" "Component lifecycle" "lazy" %}

In functional programming, these memory leaks are generally encountered when calling an asynchronous function inside a useEffect hook.

```javascript
    useEffect(() => {
      (async () => {
        const result = await fetch('example.com');
        .then// do something with result
      })();
    }, []);
```

Under certain conditions, this code will produce a warning indicating a memory leak because the results might be used before the API fetch has been completed.

{% img "memory-leak-error.png" "Can't perform a React state update on an unmounted component" "lazy" %}

### How to negate memory leaks

This can be avoided by **unsubscribing** from async functions after use. The preferred method of doing this, when doing an API request, is by using an AbortController.

```javascript
useEffect(() => {
  const abortController = new AbortController();

  (async () => {
    const result = await fetch('example.com', {
      signal: abortController.signal,
    });
    // do something with result
  })();

  return () => abortController.abort();
}, []);
```

It is necessary to note that although it is always a good idea to avoid all coding practices that invoke unintended side effects, in most modern frameworks and software, issues like these can be detected early and generally won't have much of an impact or use case on its own.

## Handling Sensitive Data

This part will be more generalized but it is just as relevant. A major security component is simply how your site interacts with a user and what information is revealed and when.

Handling user data is much more than just serializing sensitive data and ensuring each user has secure access to the app. Most privacy violations can come from what you reveal before the user even logs in.

> Authentication is the process of verifying that a user is who they say they are. This is usually done by having the user log in with a username and password. Once the user is authenticated, they can access the resources they are allowed to.

No matter how well designed and functional your web application is, broken authentication can lead to serious harm, not only to your user but to both the employee and the business.

### Account verification

Let's imagine a use case. You are a malicious agent gathering information about another person. Your first step would be information gathering. You have the user's email address. To determine what services this person is subscribed to you move from site to site, enter the email address, and judging from responses like 'there are no accounts associated with this email' you can start to create a profile on an individual with their list of active accounts.

{% img "sign-in-vulnerability.png" "Don't reveal user account status" "lazy" %}

A user's subscription status should be deemed confidential data. A simple way to ensure no more is revealed than is necessary is by providing ambiguous dialog that guides the user but does not reveal anything more than what is required to act. Understand security policies are for both the business and its users.

> Input validation is the process of ensuring that data supplied by a user is valid before it is processed by your application. This is important because it helps to prevent malicious users from injecting malicious code into your application.

### Proper state management

Once a user gains access to their account the next big question becomes, what are their user privileges?

> Authorization is the process of determining what a user is allowed to do once they are authenticated. This usually involves checking to see if the user has the proper permissions to access a certain resource. If they do not have the proper permissions, they will be denied access.

In This step, it is key to not only ensure that data is not just limited in terms of what the user can view but completely removed from the state unless it is necessary to the functioning of the visible components. State management libraries like redux can help in these scenarios to track and manage states in a controlled predictable manner but should also be used with the same caution. Always program with the idea that most of your code will be visible to the end user and therefore your use of data should ideally be clear and precise.

## Conclusion

When it comes to React security, there are a few key things to keep in mind. First and foremost, it's important to never trust user input. Always assume that users may try to inject malicious code into your app, and take steps to prevent this. Secondly, make sure to keep your dependencies up-to-date. Outdated dependencies can often introduce vulnerabilities into your app. Finally, be sure to monitor your app for any potential security issues. Thirdly, it is important to recognize sensitive data, they might not always be prevalent, but any data viewed by enough people can become valuable and even dangerous, make sure to use the principle of least privilege in these scenarios. By following these best practices, you can help ensure that your React app is secure.

If any of these topics have triggered your interest, I would highly recommend checking out our courses at [Web Security Academy](https://websecurity-academy.com/). They offer a lot of great content that will fit right in with your career as a web developer.
