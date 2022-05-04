---
title: How to cache HTTP requests in Angular
author: Bartosz Pietrucha
avatar: bartosz-pietrucha.jpg
description: A better understanding of caching HTTP requests in Angular by using rxjs shareReplay.
date: 2019-09-14 16:28:16
tags: [Angular, RxJS, "Knowledge Pill"]
id: angular-cache
relatedPost: angular-bundle-analysis
---
This is **Angular Knowledge Pill** - short and concise article! 💊
It takes just 10 seconds to learn something new 🔥
Like taking your morning vitamins 😃

Below code presents how to cache HTTP requests in Angular!
First, we just need to execute a regular HTTP query (for ex. get) and pipe the stream through **shareReplay** operator! This transforms the initial stream to a ReplaySubject! In other words, new subscriptions will NOT execute other HTTP requests but a cached value will be used. If you want to get the fresh value just create another HTTP stream without shareReplay operator and subscribe to it.

{% asset_img "shareReplay.png" "ShareReplay" %}

If you would like to receive this kind of knowledge pills directly into your mailbox, subscribe at the bottom of the page. I will be sending them regularly! Remember, it just takes 10 seconds to learn something new!
