---
title: Using localStorage with React Hooks
contributor: Mauricio Matias C.
avatar: mauricio-matias.jpeg
description: Learn how to use localStorage and React with examples and make your own implementation decisions. 
date: 2022-12-22
tags: [react]
id: react-localstorage
relatedPost: react-security-best-practices
---
{% image_fw 1.78 banner.png "React localStorage" %}

Hi, React developers! Today, we will learn how to store data using `localStorage`, and some uses of it to mix up in your React App. So, when do we need to use local storage? The short and simple answer is for data persistence, but it doesn't mean that all your app's data should persist. We need some criteria to store portions of information.

## Table of Contents
<!-- toc -->

## localStorage

The `localStorage` is the read-only property of the `window` interface for storing data across browser sessions (in other words, browser storage). The `localStorage` API is compatible with many modern browsers, is one of two ways to store data locally (client side), and the maximum volume of information that `localStorage` stores are 5 MB. The other one is `sessionStorage`. It only stores data while the session is active. Otherwise, `localStorage` doesn't have an expiration date even if the browser is closed or the OS reboots. That is the magic power of `localStorage`, and that's what we talk about today.

Another way to store some portions of information only to mention is the cookies. It works otherwise, stores less data, and could introduce a bunch of vulnerabilities in your app if you use it without security practices (for that, we have the [Web Security Academy](https://websecurity-academy.com/) to learn all about it).

The most frontend developer's common uses of `localStorage` are:
* Dark mode feature.
* User's form input (those that don't contain critical information).
* Caching the retrieved data from some API (is not recommended if the architecture is not defined very well, there are best approaches).
* Persisting data in general.


## Vanilla JavaScript Style

As we mentioned earlier, `localStorage` is an API that allows you to access a `Storage` object of the document. It stores key-value pairs when the unique type of value admitted is in UTF-16 string format (later, we will see it with a clear example).

`localStorage` allows you to set, erase and retrieve data. In case you need it, this is the [official documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

### Set data to localStorage

To set some data (persist data) in the `localStorage`, we have two ways:

```js
// Set key-value (both are equivalent, the second could be use to set
// keys programmatically), allows you to save data
localStorage.counter = 100;
// or
localStorage.setItem('counter', 100);
```

Try to set a number. Even if it's an object, it will be converted to a string and will be treated as such. To see that case, we have an example:

```js
// ❌ Set key-value (Wrong way, json object)
localStorage.user = {
    name: 'Jonas',
    age: 12,
    description: 'a lot of confusing references'
}

// The result will be "[object Object]" because set method infers the 
// .toString() value, so try it
console.log(localStorage.user);
```

To set objects properly see the next example:

```js
// If you need to save a JSON object (encode before and decode after)
localStorage.setItem('user', JSON.stringify({
    name: 'Jonas',
    age: 12,
    description: 'a lot of confusing references'
}))
const user = JSON.parse(localStorage.getItem('user'))
// the output will be a JSON string
console.log(user);
```

### Get data from localStorage

To get data we have two ways too.

```js
// Get key-value (both are equivalent, the second could be use to get
// keys programmatically), allows you to get the saved data
let counter = localStorage.counter;
// or
counter = localStorage.getItem('counter');
console.log(counter);
```
remember getItem only returns a string value.

### Removing data stored in localStorage

If `localStorage` doesn't expire the unique way to remove its data is using two methods: `removeItem` and `clear`, see it with an example:

```js
// Remove key-value, allows you to remove data
localStorage.removeItem('counter');
// Alternativelly 'delete' works but it happens thanks 
// to the language and not of the localStorage implementation
// so be careful, we don't recommend its use
delete localStorage.counter;

// Cleaning all data from localStorage 
localStorage.clear();
```

`removeItem()` and `clear()` are different. `removeItem()` removes a key-value pair, and `clear()` removes all the data inside `localStorage`.

In the next section, we will learn the step-by-step use of `localStorage` in a React application.


## React hooks Style

So, we have a notion of how to interact with `localStorage`. Now, we will use it as the React Hook Style 😎. The following code examples are available in the [react-localstorage-example](https://github.com/cr0wg4n/react-localstorage-example) repository.

The react example app that we've built for you is a counter app, in which you have four steps from the simple to the secure or encrypted implementation, we will discuss everyone below, and the user interface looks like this:

{% img "menu.png" "menu of examples, development server screenshot" "lazy" %}

### Using the useState hook

The first example works only with the `useState` hook and renders a button with a counter state inside. Every you press the button, then the counter increases one by one. Let's see in the following code.

```js
import { useState } from "react"

export default function SimpleMode(){
  const [count, setCount] = useState(0)

  return (
    <div className="card">
      <h3>Simple Example</h3>
      <p>Click the button many times and try to refresh the page</p>
      <br />
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}
```

{% img "simple_example.png" "simple react component, single logic example" "lazy" %}

Try to refresh the page, and the counter state be lost because `useState` only keeps the state for a while (until a browser refreshes).

### Adding persistence

Well, it's time to add some persistence to this example. We introduce the `localStorage` API to store the counter state as `counter` (`localStorage` key). Every you refresh the page, useState charges the value state from the `localStorage` or the default value. Done, we have persistence, and the data survives!

```js
import { useEffect, useState } from "react"

export default function MediumMode(){
  const [count, setCount] = useState(
    Number(localStorage.getItem('counter')) || 0
  )

  const handleCounter = () => {
    setCount(count + 1)
  }

  useEffect(()=>{
    localStorage.setItem('counter', count)
  }, [count])

  return (
    <div className="card">
      <h3>Medium Example</h3>
      <p>Click the button many times and try to refresh the page</p>
      <br />
      <button onClick={handleCounter}>
        count is {count}
      </button>
    </div>
  ) 
}
```

{% img "medium_example.png" "Medium react component, web storage" "lazy" %}

Now, try to refresh the page, and the counter state will be the same. But imagine if you should do the same in multiple components, that is terrible! But don't worry. We have a solution, React Hooks.

### Implementing a local storage hook

React Hooks allows to reuse of the code and extends the `localStorage` functionality to other components. Let's see the implementation after we need a dedicated folder to abstract the hook, something like this.

{% img "folder_structure.png" "react project structure, src folder" "lazy" %}

To create a custom hook, we only need a function that returns a state and its set function, as we see in the following code (`localstorage.js`, our custom hook).

```js
import { useEffect, useState } from "react"

const decode = (value) => {
  return JSON.stringify(value)
}

const encode = (value) => {
  return JSON.parse(value)
}

// useLocalStorage hook
const useLocalStorage = (key, defaultState) => {
  const [value, setValue] = useState(
    encode(localStorage.getItem(key)||null) || defaultState
  )

  useEffect(() => {
    localStorage.setItem(key, decode(value))
  },  [value])

  return [value, setValue]
}

export {
  useLocalStorage
}
```

Now, every component only needs to use a unique name key to avoid colliding with key-value pairs of the others and a default state as a second parameter. It is a simple and helpful implementation, but if you need something mature and complete, we recommend finding open-source libraries like [use-local-storage-state](https://github.com/astoilkov/use-local-storage-state).

So, we have a new custom React hook called `useLocalStorage` to replace the previous implementation.

```js
import { useLocalStorage } from "../hooks/localstorage"

export default function HookMode(){
  const [counter, setCounter] = useLocalStorage('counter', 0);
  const [secondCounter, setSecondCounter] = useLocalStorage('secondCounter', 0);
  
  return (
    <div className="card">
      <h3>Hook Example</h3>
      <p>Click the button many times and try to refresh the page</p>
      <br />

      <button onClick={() => setCounter(counter + 1)}>
        Button 1: count is {counter}
      </button>
      <br /><br />
      <button onClick={() => setSecondCounter(secondCounter + 1)}>
        Button 2: count is {secondCounter}
      </button>
    </div>
  )
}
```

{% img "hook_example.png" "Hook react component, react localstorage, hook style" "lazy" %}

The amount of code was reduced significantly, and we can reuse the hook (many times as we need).

### Miscellaneous Usages

To finish this implementation section. We have a miscellaneous use of `localStorage`. Usually, the data from `localStorage` is accessible, and every user can see it as plain text (because it is string-based), but if we need to hide it from users, there is a way to encrypt it. We need to use the [encrypt-storage](https://github.com/michelonsouza/encrypt-storage) library.

Before, we need to configure that encrypted storage, for that create a new `.js` file like this:

```js
import { EncryptStorage } from 'encrypt-storage'

const encryptedLocalStorage = new EncryptStorage(
  'SET_YOUR_SECRET_KEY',
  {
    // Keys used by this library will have this prefix
    // e.g.: 'enc' + ':' + 'input-data' = 'enc:input-data' as key name
    prefix:'enc',
    // Encryption algorithm type
    encAlgorithm: 'AES',
    // Storage type (localStorage and sessionStorage are supported)
    storageType: 'localStorage'
  }
);

export {
  encryptedLocalStorage
}
```

The `encryptedLocalStorage` is essentially equal to `localStorage`, but it has additional implementations to encrypt the store and be used as `localStorage` object.

We already know how to create a React custom hook with `localStorage`. We need to create another similar using the `encryptedLocalStorage` store object. Let's update the `localstorage.js` file (created earlier).

```js
import { useEffect, useState } from "react"
import { encryptedLocalStorage } from "../utils/secureLocalStorage"


const decode = (value) => {
  return JSON.stringify(value)
}

const encode = (value) => {
  return JSON.parse(value)
}

// useLocalStorage hook
const useLocalStorage = (key, defaultState) => {
  const [value, setValue] = useState(
    encode(localStorage.getItem(key)||null) || defaultState
  )

  useEffect(() => {
    localStorage.setItem(key, decode(value))
  },  [value])

  return [value, setValue]
}

// New encrypted localStorage
const useSecureLocalStorage = (key, defaultState) => {
  const [value, setValue] = useState(
    encode(encryptedLocalStorage.getItem(key)||null) || defaultState
  )

  useEffect(() => {
    encryptedLocalStorage.setItem(key, decode(value))
  },  [value])

  return [value, setValue]
}

export {
  useLocalStorage,
  useSecureLocalStorage
}
```

So, it's time to use the `useSecureLocalStorage` hook.

```js
import { useSecureLocalStorage } from "../hooks/localstorage";

export default function SecureHookMode(){
  const [counter, setCounter] = useSecureLocalStorage('counter', 0);
  const [secondCounter, setSecondCounter] = useSecureLocalStorage('secondCounter', 0);
  
  return (
    <div className="card">
      <h3>Secure Hook Example</h3>
      <p>Click the button many times and try to refresh the page</p>
      <br />

      <button onClick={() => setCounter(counter + 1)}>
        Button 1: encrypted count is {counter}
      </button>
      <br /><br />
      <button onClick={() => setSecondCounter(secondCounter + 1)}>
        Button 2: encrypted count is {secondCounter}
      </button>
    </div>
  )
}
```

Use the developer tools of your browser (Brave in this case), go to "Application > Local Storage" tool, and check the `localStorage` The stored data is currently encrypted 😎 and is prefixed with our selected prefix (`enc` in this case).

{% img "devtools_localstorage.png" "Secure hook example, react secure localstorage, hook style" "lazy" %}

Use it only for exceptional cases. Even if the data is encrypted, the key is inside the `.js` bundle files in plain text (generated at the build time). So, it is not secure and only works to hide data from the user.

As a bonus, go to this page [https://vuejs.org/](https://vuejs.org/) and inspect its `localStorage`. Do you see the same? Try to change the theme of that page with its button theme, and see how the stored value with the key `vitepress-theme-appearance` changes.

{% img "example_of_usage.png" "dark mode feature, key value pairs" "lazy" %}


## Use localStorage wisely

We saw how to use `localStorage` with React components, React hooks, and vanilla js, but its use is controversial. We found this [article](https://dev.to/rdegges/please-stop-using-local-storage-1i04) from [Randall Degges](https://dev.to/rdegges), who has a security researcher profile, in which he mainly says, "Please Stop Using Local Storage" a phrase and arguments that made us think a lot.

The design and functionality of `localStorage` are so simple, and it's accessible by JavaScript, which is dangerous if we think of attacks related to code execution like XSS (we have a related [article](https://dev-academy.com/react-xss/), check it out). If your React app has sensitive and personal information in `localStorage`, it will be sent to malicious servers. Many Frontend developers use `localStorage` to store JWTs (JSON Web Token), but they don't realize the meaning of JWT (equivalent to username and password) accessible through JavaScript. Critical and sensitive information always will be handled on the server side.

For that, we don't recommend the usage of `localStorage` if:
* Have sensitive data inside.
* The store space you need exceeds 5MB.

If you are starting with the secure mindset, we encourage you to read the [React security best practices](https://dev-academy.com/react-security-best-practices/) that a React developer might have to know. And that's all for today, folks.

Say goodbye, your #ReactFriend [cr0wg4n](https://twitter.com/cr0wg4n).