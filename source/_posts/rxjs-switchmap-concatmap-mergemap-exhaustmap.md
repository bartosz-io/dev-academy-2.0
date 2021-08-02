---
title: 'RxJS switchMap, concatMap, mergeMap, exhaustMap'
author: Bartosz Pietrucha
avatar: bartosz-pietrucha.jpg
date: 2019-06-01
tags: [Angular, RxJS]
---
{% image_fw 1.78 "banner.png" "RxJS switchMap, concatMap, mergeMap, exhaustMap" %}

Before RxJS become fairly popular in front-end development we all were dealing with AJAX requests with Promises. Promises are easy to use and understand but in some more complex scenarios, not enough. In this article, I will explain how to efficiently use higher-order observable streams in four different scenarios with four different flattening strategies - `mergeMap`, `concatMap` `switchMap` and `exhaustMap`.

## Table of contents

<!-- toc -->

## Introduction

Executing HTTP request in the browser is by its nature asynchronous. It means that we can model it with RxJS Observables. In Angular, we have a `HttpClient` service with methods corresponding to HTTP operations (get, post, put, etc). These methods return Observables to which we can subscribe to. But executing HTTP operation usually happens **after** another event happens, for example, *click* event. We can also model such browser *click* events as an observable stream, because these events may appear at any time in the future, multiple times. So now we have two streams that we want to use sequentially - *click* event should trigger HTTP call (in the example I use `save()` method). The trivial approach would be to subscribe to *click* events and inside of the subscription function subscribe to `save()` method.

``` TypeScript
fromEvent(saveBtn, 'click')
  .subscribe(click => {
    save().subscribe(result => {
      // handle result
    })
   });
```

Above code works, but first of all, it contains nested subscriptions, which reminds us of **callback hell** and doesn't look very clean. Secondly, it does not allow us to use flattening strategies, which are useful when we want to handle the situation when a subsequent *click* event happens **before** `save()` operation stream emits its final result. Imagine the scenario when the user clicks the button the second time when the HTTP request hasn't returned the result yet. What should happen? Should we wait for the first HTTP request to finish and then start the second one? Or should we abandon the first HTTP query and immediately execute the second one? Or maybe we do not allow subsequent HTTP calls at all when there is still pending one? As you see there are different approaches to handle this tricky case. With the use of proper flattening operations, which we will examine in the next chapters, we can easily implement a solution that is suitable for us.

## Higher-order observables

We can rewrite our first code snippet to the following one below. Here, instead of immediately subscribing to *click* stream, we ``map`` it into the invocation of `save()` method. Because of the fact, that `save()` method returns Observable itself, we have created a **higher-order observable**. This kind of observables are usually composed of two streams. In our case, there is an outer stream, emitting click events, and inner stream, emitting the result of `save()` method.

``` TypeScript
fromEvent(saveBtn, 'click')
  .pipe(map(click => save()))
  .subscribe(result => {
    // result is a stream!
  });
```

> **Higher-order observable** is an Observable which emits events that are Observables themselves; in other words, it is an Observable of Observables.

The interesting part of the above code snippet is subscription. Since we mapped *click* event into yet another stream, the result of the subscription will be also a stream! We can consume the final result of HTTP query by subscribing to the `result` inside of the first subscription function, but we will end up with nested subscriptions again. And now is the time for the cool stuff! RxJS comes with the special operators that convert higher-order observables into first-order observables, that we can subscribe to only ones, and receive the event from the inner stream (not the subscription of the inner stream).

## Flattening the higher-order observables

The operation of converting the higer-order stream into the first-order stream is called **flattening**. When we do **flatten** the stream it no longer emits its inner streams, but the events from that inner streams. With RxJS flattening is very easy. All we have to do is to apply a proper operator to your higher-order stream. The code snippet below uses `concatAll()` operator to flatten the stream. Thanks to that, the `result` in the subscription is the event from the inner observable returned by the `save()` method.

``` TypeScript
fromEvent(saveBtn, 'click')
  .pipe(map(click => save()), concatAll())
  .subscribe(result => {
    // result is the result of save()
  });
```

Because of the fact that `map()` and `concatAll()` are very often used together, there is an equivalent operator `concatMap()` that allows us to achieve exactly the same result. The code snippet below presents the usage of `concatMap()` operator:

``` TypeScript
fromEvent(saveBtn, 'click')
  .pipe(concatMap(click => save()))
  .subscribe(result => {
    // result is the result of save()
  });
```

`concatMap()` is not the only way to flatten the higher-order stream in RxJS. In the following chapters we will understand the differences between `concatMap()`, `mergeMap()`, `switchMap()` and `exhaustMap()`. All of these operators are flattening operators, but they are applicable in very different scenarios.

### ConcatMap

We have already asked a question about the scenario when outer stream emits an event (i.e. user clicks the button) **before** the inner stream finishes its execution. One of the strategies to handle this case is to wait until that inner stream completes before subscribing to the next one. This is exactly what we `concatMap()` will do for us. Take a look at the recorded demo below.

{% img "concatMap.gif" "ConcatMap example" "lazy" %}

In this example, **Save** button is clicked a second time, during the execution of simulated HTTP query. The counting numbers represent the execution of that query. Because that second click event happened before the save query finished, the second query was *queued* to be executed later. This way we *concatenated* inner stream execution.

`concatMap()` is the first presented higher-order stream flattening strategy. It can be used when our use case requires *sequentiality*. It is important to note that the order of HTTP queries at the browser end may not be the same as the order in which the server receives them. We can imagine a situation when there are two HTTP queries, let's say query **A** and query **B** and the browser sends query **A** first, and query **B** immediately after. There is no guarantee that the server will receive those queries in the same order. Because of the network conditions the server may receive query **B** first and query **A** later. That's why having a proper strategy on the browser end is so important.

{% banner_ad "secure_banner.gif" "https://courses.dev-academy.com/p/web-security-fundamentals" %}

### MergeMap

Another way to handle the situation when outer stream emits events during the execution of the inner stream is to merge the executions with `mergeMap()` operator. In this case, we would not care about any order and just execute inner streams *concurrently*. The recorded demo below illustrates this scenario. We can see that the second time the save button is clicked, the simulated HTTP query starts instantly after and is executed *concurrently* with the first query.

{% img "mergeMap.gif" "MergeMap example" "lazy" %}

The source code snippet below presents how to apply `mergeMap()` operator to achieve this result.

``` TypeScript
fromEvent(saveBtn, 'click')
  .pipe(mergeMap(click => save()))
  .subscribe(result => {
    // result is the result of save()
  });
```

### SwitchMap

We have learned two strategies for converting higher-order streams into first-order ones. Both of them are applicable in different use cases, but the next one will probably be the one you would like the most - `switchMap()`. When we apply this kind of flattening, the occurrence of the outer stream event (i.e. user click) causes **unsubscription** from the ongoing execution of the current inner stream. This strategy is useful when we care only about the most recent execution of the HTTP query. Image the type-ahead search implementation. The user types the first letters of the search query, HTTP call starts and user types next letters of the query. In this case, we do not care about the results of any previous HTTP requests, so `switchMap()` is a perfect fit. Below animation presents the behavior this flattening operator. You can also check out my video on this topic: [RxJS Type Ahead search with Angular Material](https://www.youtube.com/watch?v=HfVTp4yo12A).

{% img "switchMap.gif" "SwitchMap example" "lazy" %}

The source code snippet below presents how to apply `switchMap()` operator.

``` TypeScript
fromEvent(saveBtn, 'click')
  .pipe(switchMap(click => save()))
  .subscribe(result => {
    // result is the result of save()
  });
```

### ExhaustMap

The last operator we are going to explore in this article is `exhaustMap()`. When we want to simply **ignore** the events in the from the outer stream, during the execution of the inner stream, `exhaustMap()` is the correct choice. So when using this mapping strategy we simply do not execute mapping at all, it the outer event appears before the completion of the inner stream. This could be useful when we want to minimize the number of HTTP calls going out from the browser. You can notice in the below animation, that subsequent button clicks do not cause any effect when clicked before first simulated query finishes.

{% img "exhaustMap.gif" "ExhaustMap example" "lazy" %}

The source code snippet below presents how to apply `exhaustMap()` operator.

``` TypeScript
fromEvent(saveBtn, 'click')
  .pipe(exhaustMap(click => save()))
  .subscribe(result => {
    // result is the result of save()
  });
```

## Summary

Using Observables for HTTP requests may look strange for the first sight, compared to simply using Promises. In this article, we have learned that there are situations where using Observables with proper flattening strategies is useful, if not necessary, to achieve the desired result and avoid nasty bugs.

**Stackblitz** demo: <https://stackblitz.com/edit/rxjs-higher-order-streams>
**GitHub** source code: <https://github.com/bartosz-io/rxjs-higher-order-streams>

I hope that you learned something new and will be very grateful if you share this article with your friends on social media :) If you have any questions, do not hesitate to ask them in the comments section - I will reply to all of them. Take care!