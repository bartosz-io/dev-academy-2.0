---
title: How to analyze Angular bundle
author: Bartosz Pietrucha
avatar: bartosz-pietrucha.jpg
description: A thorough analysis of angular bundle with webpack analyzer to better understand what's the weight of specific parts in the application.
date: 2019-09-15 16:11:55
tags: [Angular, "Knowledge Pill"]
---
This is **Angular Knowledge Pill** - short and concise article! 💊
It takes just 10 seconds to learn something new 🔥
Like taking your morning vitamins 😃

Imagine you are building an application with three modules:
- **main** module,
- **records** module (lazy loaded feature module),
- **settings** module (lazy loaded feature module).

Now, you would like to know how much do those modules contribute to the whole application size! Using a webpack-bundle-analyzer it is more than easy! Take a look at how to analyze your application bundles below.

{% asset_img "analyzer.png" "Analyzer" %}

This will give you a very detailed overview of your application. You can see how much do the final JavaScript bundles weight and how their sizes refer to each other! The colored diagram below is constructed this way that the bigger the given rectangle the heavier the particular bundle!

{% asset_img "files.png" "Files" %}

{% asset_img "bundle.png" "Bundle" %}

If you would like to receive this kind of knowledge pills directly into your mailbox, subscribe at the bottom of the page. I will be sending them regularly! Remember, it just takes 10 seconds to learn something new!
