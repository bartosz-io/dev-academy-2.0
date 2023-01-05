<!-- omit in toc -->
# Contributing to dev-academy.com

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read this document before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents

- [I Want To Contribute](#i-want-to-contribute)
- [Article Contribution](#article-contribution)

## I Want To Contribute

> ### Legal Notice <!-- omit in toc -->
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

The only requirement is to have any experience with the technology you will write, and like us, a lot of love for the things we do ❤️.

### Article Contribution

You are at the right place to start or increase your passion for technical writing. 

To contribute with some article, follow the next steps:

1. Check if your article is [here](insert-your-topic-list-link-here). If not, all suggestions are welcome.
2. **@Bartosz, write a way to contact you and Konrad (Maybe a link to your inbox in discord).**
3. Clone this repository and create a new branch with a name like `new-article/name-of-the-article` (locally).
4. Once you have an article and his body in mind, we will give you access to a "Surfer SEO" text editor. "Surfer SEO" will helps you to write crazy articles with a terrific SEO impact.
4. Meanwhile, add you as a new author, go to `_config.yml` and add a new contributor entry at `contributors` (respecting the YAML format), something like this:

```yml
  "John Doe": # Your name as a key or id
    slug: john-done 
    desc: Here goes your great description. # Write a good description
    specs: [javascript, vue, nodejs, python, react] # More or less if you want
    image: /img/contributors/john-doe.jpeg # Choose your best pic and add it at this path
    motto: Here goes your motto. # A motivational phrase, your mantra
    joined: 01 Jan 2023 # Your join date 
    academies:          # If you are in some academy at dev-academy.com change it to true
      wsa: false        # Web Security Academy
      fta: false        # Full Testing Academy
    socials:  # URLs from Social Networks, Blogs, Personal Websites...
      site: https://john-done.github.io/
      github: https://github.com/john-done
      twitter: https://twitter.com/john-done
      linkedin: https://www.linkedin.com/in/john-done
```

5. Commit the changes with a message like `feat: new author`
6. Write your article in "Surfer SEO" which is a friendly text editor like Word or Google Docs, but you will receive constant feedback on the SEO impact on a scale of 0 to 100 (that is the nice thing), try to reach 72 points at least if you want good results.
7. Once you have done the article, go to tools and choose `Download content as HTML`.
8. This project needs articles written in Markdown. So, you have to convert HTML to Markdown, go to this [page](https://codebeautify.org/html-to-markdown), and convert it.
9. Go to the `source/_posts` directory path, create a readme file called as your article in the `kebab case format` (e.g. `source/_posts/csurf-vulnerability.md`), and copy the content of your converted article.
10. If you have images, you need to create a directory called `source/_posts/csurf-vulnerability` (as your article readme file), and add them here, @bartosz-io will give you a `banner.png` file to paste into this directory.
11. The markdown file that you already paste needs some treatments. First of all, we need to change the `h2` heading style.

from:
```md
Vanilla JavaScript Style
------------------------
```
to 
```md
## Vanilla JavaScript Style
```

After that, add a table of contents (only copy this  code at some good nice on your article):

```md
## Table of Contents
<!-- toc -->
```

Replace the markdown image way to get images from an external URL to 
a format that needs this blog system (download the image and paste it at 
your images directory, remember, you've created at step number 10).

from:

```md
![simple react component, single logic example](https://images.surferseo.art/5b6d9719-266f-4f93-a999-44d81fc570cf.png)
```

To this format (the large message will be the `alt` property of the `<img >` HTML tag when the blog will be at production):

```md
{% img "simple_example.png" "simple react component, single logic example" "lazy" %}
```

Finally, add your author, article, and banner metadata at the start of the file.

```
---
title: What’s the problem with the CSURF package?
contributor: John Doe
avatar: john-doe.jpeg
description: Your amazing description
date: 2023-12-31
tags: [node, security]
id: csurf-vulnerability
relatedPost: vue-security-best-practices
---
{% image_fw 1.78 banner.png "csurf vulnerability" %}
```

12. 🥳 Save, commit and congratulations! You are ready to open a PR and appear in the first results of the search engines.


> This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!