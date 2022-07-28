---
title: React XSS 🐛 Cross-site scripting prevention
author: Vlad Ataman
avatar: vlad-ataman.png
description: Learn React XSS modern best practices and methods to prevent cross-site scripting attacks in React (JavaScript) applications. 🔒
date: 2022-07-08
tags: [React, Security]
id: react-xss
relatedPost: angular-xss
published: true
---
{% image_fw 1.78 "banner.png" "Preventing XSS in React" %}

XSS attacks or cross-site scripting is a type of attack in which malicious code is injected into a web page and then executed. This malicious code can steal your cookies, modify the content or take control of an entire webpage.

<!-- toc -->

## Attacks

Starting about mid-2012, the research community started using two new terms to help organize the types of XSS. Types of XSS attacks since mid-2012:

{% img "xss-division.png" "XSS division" "lazy" %}

## DOM-based XSS attacks in React

These attacks belong to the subset of client cross-site scripting as the data source is from the client side only.

{% img "client-division.png" "Client division" "lazy" %}

I will show you three examples of DOM-based XSS attacks in this article. We will look at `eval`, `href` and `dangerouslySetHTML` vulnerabilities.

### eval

The `eval()` function evaluates a string and returns its completion value. The issue with the eval function is that you can paste malicious javascript code inside and execute it. Let's make an example, here is a code snippet in JSX code snippet

``` javascript Code snippet
import React, { useState } from 'react';

const Eval = () => {
    const [data, setData] = useState();

    const handleType = (e) => {
        setData(e.target.value);
    };

    const handleSubmit = () => {
        eval(data);
    };

    return (
        <div>
            <p>Place this code inside input: <code>alert('Hacked')</code></p>
            <input
                type='text'
                name='firstName'
                value={data}
                onChange={(e) => handleType(e)}
            />
            <button onClick={() => handleSubmit()} className="button">Submit</button>{' '}
        </div>
    );
};

export default Eval;
```

And below is a result of the code snippet

{% img "eval.png" "eval XSS vulnerability" "lazy" %}

We use the user's browser and user input to execute a simple alert function and in real life, the attacker can use another JavaScript malicious code to make something terrible with your webpage, cookies.

### href

`href` is an attribute of an element. The `<a>` element defines a hyperlink, which is used to link from one page to another.

As an example, we can embed user input inside a href and this is an issue. You can see in the code snippet below, we use a data variable to fill href attribute and data fills with an input element.

``` javascript Code snippet
import React, { useState } from 'react';

const Href = () => {
    const [data, setData] = useState();
    const handleType = (e) => {
        setData(e.target.value);
    };

    return (
        <div>
            <p>Place this code inside input: <code>javascript: alert('Hacked');</code></p>
            <input
                type='text'
                name='text'
                value={data}
                onChange={(e) => handleType(e)}
            />
            <a href={data} className="button">Click Here</a>
        </div>
    );
};

export default Href;
```

Execution of code:

{% img "href.png" "href XSS vulnerability" "lazy" %}

### dangerouslySetHTML

This is a property in HTML code that you can use HTML elements in React code instead of innerHTML function. The content of `dangerouslySetHTML` is dynamic and skips the comparison against the virtual DOM. As you can understand it is the third XSS vulnerability. Below is a code and result of execution:

``` javascript Code snippet
import React from 'react';

const DangerouslySetInnerHTML = () => {
    const placeHtml = () => {
        return {
             __html: "<img onerror='alert(\"Hacked!\");' src='invalid-image' />",
        };
    };

    return (
        <div>
            <p>We inserted img inside div using dangerouslySetInnerHTML property and add js code in onerror attribute</p>
            <div dangerouslySetInnerHTML={placeHtml()} /></div>
    );
};

export default DangerouslySetInnerHTML;
```

Result of render:

{% img "dangerouslySetHTML.png" "dangerouslySetHTML XSS vulnerability" "lazy" %}

## Simple protection from XSS attacks

You can replace reserved characters (such as `<` and `>`) with their respective character entities (`&lt;` and `&gt;`). As a result, the code is rendered, no JavaScript code can be executed, and character entities will be converted to their respective reserve characters. Also, you can use "sanitize" user inputs using a library called [dompurify](https://github.com/cure53/DOMPurify).

## React XSS protection

As you can see the most vulnerable place is input and we have an article about controlled and uncontrolled components in React documentation.
Below you can read a blockquote from the React official documentation:

> In the form elements are either the typed ones like textarea. input or the selected one like radio buttons or checkboxes, whenever there is any change, made it is updated accordingly through some functions that update the state as well.
We recommend using controlled components to implement forms. In a controlled component, form data is handled by a React component.
In HTML, form elements such as \<input\>, \<textarea\>, and \<select\> typically maintain their own state and update it based on user input. In React, mutable state is typically kept in the state property of components, and only updated with setState().
The alternative is uncontrolled components, where form data is handled by the DOM itself.
To write an uncontrolled component, instead of writing an event handler for every state update, you can use a ref (createRef) to get form values from the DOM.

## Summary

Protecting your React application to prevent cross-site scripting is not a one-step process. The best way to protect React applications from XSS attacks is to prevent them earlier in your codebase. You can create a list of recommendations for your teammates.

Here is my list:

1. Use `dangerouslySetHTML` and `createRef` in very specific use cases.
2. Don't mutate DOM directly as we can make it with React.
3. Use React functionality instead of writing personal techniques. READ documentation.
4. Validate all data that you have and income data (from a user and from API)
5. Don't create your personal sanitization libraries, select the best among other libraries from trusted developers.
