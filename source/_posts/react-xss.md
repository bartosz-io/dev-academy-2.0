---
title: React XSS 🐛 Cross-site scripting prevention
author: Vlad Ataman
avatar: vlad-ataman.png
description: Learn React XSS modern best practices and methods to prevent cross-site scripting attacks in React (JavaScript) applications. 🔒
date: 2022-07-08
tags: [React, Security]
id: react-xss
relatedPost: angular-xss
---
{% image_fw 1.78 "banner.png" "Preventing XSS in React" %}

Cross-site scripting (XSS) attacks are a type of attack in which malicious code is injected into a web page and then executed. The malicious code can steal cookies, modify the content or take total control of the entire website.

<!-- toc -->

## Types of XSS attacks

* Reflected XSS attacks
* Stored XSS attacks
* DOM-based XSS attacks

For years, most people thought of these (Stored, Reflected, DOM) as three different types of XSS, but in reality, they overlap. You can have both Stored and Reflected DOM-Based XSS. You can also have Stored and Reflected Non-DOM Based XSS too, but that's confusing, so to help clarify things, starting about mid-2012, the research community proposed and started using two new terms to help organize the types of XSS that can occur:

* Server XSS
* Client XSS

{% img "xss-types.png" "Server XSS vs Client XSS" "lazy" %}

## DOM-Bassed XSS

In this article, we'll focus on the **DOM-Bassed XSS attack.**

I will demonstrate three XSS vulnerabilities that can occur in React: 1) `eval`, 2) `href`, and 3) `dangerouslySetHTML`.

### eval() vulnerability

The eval function evaluates strings as JavaScript. Therefore, if the attacker injects javascript code into `eval()`, your app would run the attacker's script.

{% img "eval.png" "eval XSS vulnerability" "lazy" %}

``` javascript Code snippet
import React, { useState } from 'react';const Eval = () => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
  });
  
  const handleType = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = () => {
    eval(data.firstName + data.lastName);
  };
  
  return (
    <div>
      <input
        type='text'
        name='firstName'
        value={data.firstName}
        onChange={(e) => handleType(e)}
      />
      <input
        type='text'
        name='lastName'
        value={data.lastName}
        onChange={(e) => handleType(e)}
      />
      <button onClick={() => handleSubmit()}>Submit</button>{' '}
    </div>
  );
};

export default Eval;
```

### href vulnerability

In the component below, we ask the user to embed user input. We set the href dynamically in the \<a\> tag to the user's provided link. See bold below. Instead of providing a link, the attacker inputs `javascript: alert('Hacked!')` so that when someone clicks on the link, the `alert()` will be executed.

{% img "href.png" "href XSS vulnerability" "lazy" %}

``` javascript Code snippet
import React, { useState } from 'react';
const Href = () => {
  const [data, setData] = useState({
    text: '',
  });
const handleType = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };
return (
    <div>
      <input
        type='text'
        name='text'
        value={data.text}
        onChange={(e) => handleType(e)}
      />
      <a href={data.text}>click Here</a>
    </div>
  );
};

export default Href;
```

### dangerouslySetHTML vulnerability

The name says it all. Each HTML element in JSX code has a dangerouslySetHTML property. You can pass HTML into this property as a string and the HTML will be rendered in the DOM.

{% img "dangerouslySetHTML.png" "dangerouslySetHTML XSS vulnerability" "lazy" %}

``` javascript Code snippet
import React from 'react';
const DangerouslySetInnerHTML = () => {
  const createMarkup = () => {
    return {
      __html: "<img onerror='alert(\"Hacked!\");' src='invalid-image' />",
    };
  };
return (
    <div>
      <div dangerouslySetInnerHTML={createMarkup()} />
    </div>
  );
};

export default DangerouslySetInnerHTML;
```

## How can we prevent these attacks

You can escape (replace) reserved characters (such as `<` and `>`) with their respective character entities (`&lt;` and `&gt;`). Therefore, when the code is rendered, no JavaScript can be executed. Instead, the character entities will be converted to their respective reserve characters.

Also, you can "sanitize" user inputs using a library called `dompurify`: [https://github.com/cure53/DOMPurify](https://github.com/cure53/DOMPurify)

**XSS Protection in React:** React is a JavaScript library for building user interfaces, and as such, it has some built-in security measures to prevent xss in react.

When we create new elements using the React API, React will automatically review data to auto-escape scripting code. Below is a code snippet of React's createElement() method.

``` javascript
return React.createElement("p", {}, review); 
```

As you can see before input is used very often for such attacks. That's why in React documentation we have articles about controlled and uncontrolled components.

In React, Controlled Components are those in which form's data is handled by the component's state. It takes its current value through props and makes changes through callbacks like onClick,onChange, etc. A parent component manages its own state and passes the new values as props to the controlled component.

Below you can read a blockquote from the React official documentation:

> In the form elements are either the typed ones like textarea. input or the selected one like radio buttons or checkboxes, whenever there is any change, made it is updated accordingly through some functions that update the state as well. We recommend using controlled components to implement forms. In a controlled component, form data is handled by a React component. In HTML, form elements such as \<input\>, \<textarea\>, and \<select\> typically maintain their own state and update it based on user input. In React, mutable state is typically kept in the state property of components, and only updated with setState(). The alternative is uncontrolled components, where form data is handled by the DOM itself. To write an uncontrolled component, instead of writing an event handler for every state update, you can use a ref (createRef) to get form values from the DOM.

Also, as you can see previously one of the XSS attacks works with DOM directly throw accessing its content.

We have an article about work in DOM in React code. We need to use Refs in React documentation and it says: Refs provide a way to access DOM nodes or React elements created in the render method. Something else about refs from React documentation:

## When to use Refs

There are a few good use cases for refs:

* Managing focus, text selection, or media playback.
* Triggering imperative animations.
* Integrating with third-party DOM libraries.

> Avoid using refs for anything that can be done declaratively.

Protecting your React application to prevent cross-site scripting is not a one-step process. The best way to safeguard your React application against XSS attacks is to anticipate them early in your codebase. You can then define a set of rules or coding guidelines for your application.

Here's how you can prevent XSS in your application:

1. Validate all data that flows into your application from the server or a third-party API. This cushions your application against an XSS attack, and at times, you may be able to prevent it, as well.
2. Don't mutate DOM directly. If you need to render different content, use `innerText` instead of `innerHTML`. Be extremely cautious when using escape hatches like `findDOMNode` or `createRef` in React.
3. Always try to render data through JSX and let React handle the security concerns for you.
4. Use `dangerouslySetInnerHTML` in only specific use cases. When using it, make sure you're sanitizing all your data before rendering it on the DOM.
5. Avoid writing your own sanitization techniques. It's a separate subject on its own that requires some expertise.
6. Use good libraries for sanitizing your data. There are a number of them, but you must compare the pros and cons of each specific to your use case before going forward with one.

You can use the above points as a coding guideline when building React applications.
