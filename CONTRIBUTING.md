<!-- omit in toc -->
# Contributing to dev-academy.com

First off, thanks for taking the time to contribute! ❤️

> And if you like the project, but just don't have time to contribute, that's fine. We would also be very happy about:
> - ⭐️ Star the project
> - 🐥 Tweet about it
> - 📖 Refer this project in your project's readme
> - @ Mention the project at local meetups and tell your friends/colleagues

## I Want To Contribute

> ### Legal Notice ⚖️ <!-- omit in toc -->
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

The only requirement is to have any experience with the technology you will write about and a lot of passion for topic ❤️.

## Article Contribution

To contribute with some article, follow the next steps:

1. Find a topic (in your preferable tech stack - Java, Node, Python, PHP, etc.) related to:
    - web application security for developers
    - testing and automation (unit tests, DevOps, etc)
2. Join Dev Academy [Discord](https://discord.com/invite/tXrGY7ca43) to become a contributor
3. Clone this repository and create a new branch with a name like `new-article/name-of-the-article` (locally).
4. Once you have an article and his body in mind, we will give you access to a `Surfer SEO` text editor. `Surfer SEO` will helps you to write crazy articles with a terrific SEO impact 🚀
5. Meanwhile, add you as a new author, go to `_config.yml` and add a new contributor entry at `contributors` (respecting the YAML format), something like this:

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

6. Commit the changes with a message like `feat: new author`
7. Write your article in `Surfer SEO` which is a friendly text editor like Word or Google Docs, but you will receive constant feedback on the SEO impact on a scale of 0 to 100 (that is the nice thing), try to reach 72 points at least if you want good results.
8. Use a FREE version of [Grammarly](https://www.grammarly.com/browser/chrome) for fix all the grammar issues while the content is still in `Surfer SEO`.
9. Once you have done the article, go to tools and choose `Download content as HTML`.
10. This project needs articles written in Markdown. So, you have to convert HTML to Markdown, go to this [page](https://codebeautify.org/html-to-markdown), and convert it.
11. Go to the `source/_posts` directory path, create a readme file called as your article in the `kebab case format` (e.g. `source/_posts/csurf-vulnerability.md`), and copy the content of your converted article.
12. If you have images, you need to create a directory called `source/_posts/csurf-vulnerability` (as your article Markdown .md file), and add them here, @bartosz-io will give you a `banner.png` file to paste into this directory.
13. The markdown file that you already paste needs some treatments.
    - Run [Markdown lint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) in your preferable IDE
    - Apply the changes described below: 👇

- Change the `h2` heading style from:

```md
Vanilla JavaScript Style
------------------------
```
to:
```md
## Vanilla JavaScript Style
```

- After that, add a table of contents (only copy this  code at some good nice on your article):

```md
## Table of Contents
<!-- toc -->
```

- Replace the markdown image way to get images from an external URL to a format that needs this blog system (download the image and paste it at your images directory, remember, you've created at step number 10) from:

```md
![simple react component, single logic example](https://images.surferseo.art/5b6d9719-266f-4f93-a999-44d81fc570cf.png)
```

to this format (the large message will be the `alt` property of the `<img>` HTML tag when the blog will be at production):

```md
{% img "simple_example.png" "simple react component, single logic example" "lazy" %}
```

- Finally, add your author, article, and banner metadata at the start of the file.

```yaml
---
title: What’s the problem with the CSURF package?
contributor: John Doe
avatar: john-doe.jpeg
description: Your amazing description with relevant keywords
date: 2023-12-31
tags: [node, security] # lower case!
id: csurf-vulnerability
relatedPost: vue-security-best-practices
---
{% image_fw 1.78 banner.png "csurf vulnerability" %}
```


14. Save, commit and congratulations! 🥳 You are ready to open a PR and appear in the first results of the search engines.
    - open the GitHub PR conversation end examine the deploy preview
    - send the PR via Discord

## Thank you! 🔥