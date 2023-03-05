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

1. Find a topic (in your preferable tech stack - Angular, React, Vue, Node.js,  etc.) related to:
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
11. Now you have two ways to create an article. First one is recommended.
    - In the root of the project run npm task `npm run article --slug csurf-vulnerability`. Adjust the slug to the URL of your article after `--slug` argument. This is mandatory. Once done, a new article will be created with its contents together with a folder in `source/_posts`. Now you can copy your content inside auto-generated article.
    - Or go to the `source/_posts` directory path, create a readme file called as your article in the `kebab case format` (e.g. `source/_posts/csurf-vulnerability.md`), and copy the content of your converted article. But you will be also forced to add a new folder for the assets of the article and front matter inside the article.
12. You need to create a directory called `source/_posts/csurf-vulnerability` (as your article Markdown .md file). If you used `npm run article --slug csurf-vulnerability` you don't have to be worried about it. Add article images there. @bartosz-io will give you a main image of the post `banner.png` file to paste into this directory.
13. Now it's the time to complete **front matter** inside the article. If you run `npm run article --slug csurf-vulnerability`, all the props are already there. You will only need to modify them. Otherwise, you will need to copy the front matter yourself, e.g. from below.
```yml
---
title: What’s the problem with the CSURF package? # Title of the post, and also as a meta title
contributor: Mauricio Matias C. # Your full name. This value must be same as in the `_config.yml`
avatar: mauricio-matias.jpeg # Name of your profile picture (it comes from img/contributors)
description: The csurf library has insecure design issues. What can we do? # Meta description
date: 2022-11-24 # Date (YYYY-MM-DD)
tags: [node, security] # Post tags, must be lowercase
id: csurf-vulnerability # ID of the post, this is needed later for related posts (make sure this value is unique)
relatedPost: vue-security-best-practices # Optional, but if you see a relation with other post you can add its id here
---
{% image_fw 1.78 banner.png "csurf vulnerability" %}
```
14. After you pasted and added your content into article, the markdown file that you already paste needs some treatments.
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

- After that, add a table of contents at the top of your article. If you run npm script before `npm run article`, then you can skip this step.

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

15. Highlight your code by using only two ways:
- inline with markdown ticks `let a = 20`
- or as a block code by using three ticks and language name after (html, css, typescript, js, jsx, bash etc.). `\``typescript <<my-content>> ```

16. Before committing, ensure that the post meets these requirements:
    > ### Technical requirements
    > - Validate your metadata in `_config.yml` and article front matter if everything is correct.
    > - Make sure you added your profile image in `themes/my-theme/source/img/contributors`.
    > - Avatar and your full name must match with _config.yml.
    > - Add one tag name at least in metadata of the post.
    > - Add `relatedPost` id to another post if you see some relation.
    > - Do not forget about unique ID of your post.
    > - Do not add these props to article metadata: `bannerHeader`, `bannerSubheader`.
    > ### Article content requirements
    > - The first element of the article's content is always the main image e.g. `{% image_fw 1.78 "banner.png" "The csurf vulnerability" %}`, provided by @bartosz-io to you.
    > - Never add `lazy` attribute to the main first image.
    > - Add always `lazy` attribute to every image in your post beside first one.
    > - Never add `<h1>` header. You can only add `<h2>, <h3>, <h4>..` Add them neatly and in the correct order.
    > - Add always introduction of the post (few sentences).
    > - Article's content should contain at least **3 images**. They can be any presentational images like: infographics, illustration of a thesis, text cut out in a nice frame, quote, graphs, memes, screenshots. Be creative!
    > - Make sure your images are readable and looks good on mobile.
    > - Do not add too much external links.
    > - If you add some items then use lists. Make also use of blockquotes, code formatters. More your can find [here](https://www.markdownguide.org/basic-syntax/). See also how other contributors write their posts.
    > - Emphasize only keywords or something your really want to stress. Do not abuse it.
    > - If you see possibility then link to other content and posts inside *dev-academy.com*
    > - Try to fascinate others during reading, share your experiences in the posts.
    > - Don't create long paragraphs.
    > - Please use only `[A-Za-z0-9]`characters in headers.
    > - You should never create the same article headers in page content.
    > - Optimize your images. You can use online tools for that.
    > - **Don't plagiarise or copy & paste** because we check the credibility of the articles in online tools.
    > - Article should always end with conclusion or summary (few sentences).
    > - Texts are not written, texts are designed. Design your post to be proud of what you have created!

17. Save, commit and congratulations! 🥳 You are ready to open a PR and appear in the first results of the search engines.
    - open the GitHub PR conversation end examine the deploy preview
    - send the PR via Discord

## Thank you! 🔥