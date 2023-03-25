---
title: Angular Signals: Understanding a new Reactive Primitive
contributor: Łukasz Fajger
avatar: lukasz-fajger.jpg
description: Angular Signal is an observed trackable value that can change over time. When signal changes, all related dependencies are automatically updated. The reactive primitive contains the value, and get and set functions that are responsible for intercepting changes.
tags: [angular, performance]
id: angular-signals
date: 2023-03-13
---
{% image_fw 1.78 "banner.png" "Angular Signals" %}

## Table of Contents
<!-- toc -->

What if we could write even more performant applications in Angular without worrying about change detection? And what if we didn't want to render everything, but only the exact places that have changed?

We all know that the unskillful use of change detection in Angular can lead to many consequences, primarily in terms of performance. I checked and tested how **Angular signals** work and these granular updates are simply brilliant! 

The best news? It’s not that complicated, and I can teach you them in the next few minutes!

## Angular Reactivity with Signals

The Angular team has been working for some time now to introduce signals as a **reactive primitive in Angular**. The signal primitive contains the value, and get and set functions that are responsible for intercepting changes in reading and writing the value.

{% img "signal-reactive-primitive.png" "Signal reactive primitive" "lazy" %}

They announced that their goal is:

> to embrace fine-grained reactivity in the core of the framework.

This means that a lot of changes are coming to the core framework and change detection. These will be fundamental changes that will make Zone.js optional.

{% img "optional-zonejs.jpg" "Optional Zone.js" "lazy" %}

> We want to change the underlying change detection system for Angular.

Yes, that's right. You won't need Zone.js if you use signals. I dare say it looks like Angular wants to get rid of Zone.js in the future. But we don't have to fear anything, because for the moment we will have backward compatibility with Zone.js.

### When will the Signals arrive in Angular

Probably at the end of the year. Who knows, it can appear in Angular 16. It all depends on how the work on them is managed. More information you can be found [here](https://github.com/angular/angular/discussions/49090).

> We strongly believe that adding built-in reactivity to Angular is in the long term best interest of the framework and its users, and look forward to sharing more information about this project in the upcoming RFC.

### How to start using Signals

To get started and see how the signal works, you have to install the minimum version of the next pre-release which is `16.0.0-next.0`. In this version, Angular signals have been added to the public API. As this is a prototype, it is not recommended to use it in production for the time being.

1. If you already have an existing project, with the latest version of Angular then you can do an upgrade.
   ```
   ng update @angular/cli @angular/core --next
   ```

2. Or simply create a new project.
   ```
   npx @angular/cli@next new angular-signals
   ```

Once we have the latest pre-release version installed, it's time to find out what signals are. You can also find an example of fully working code in this [section](#example-of-angular-signals). Let's get started!

## The concept

The main concept of signals in Angular is the ability to **granularly update parts of the component**. We don't want to render the whole component or its tree, but the exact small part of the component that has been changed. And this is why signals were introduced.

### What is the Signal

A signal is not something new in Angular. The concept already exists in SolidJS, Preact, or Vue.js. The inspiration was taken from SolidJS creator Ryan Carniato.

The signal is a **trackable value**. If the value of the signal changes, all related dependencies are automatically updated.

```ts
const counter = signal(0);
```

It is an object consisting of a getter, setters, and a value that changes over time. This "reactive" value can notify all interested consumers.
### No side effects

A signal is an argument-free function `() => T` that does not create side effects when we read its value. Why doesn't it create side effects? 

First, let's quickly understand what a side effect is. Side effect occurs when a function uses or relies on code from outside. This means that if you use external code in your function, you create a side effect. The example below is an impure function with one side effect.

```ts
let counter = 0;

function increment() {
    return counter++;
}
```

* Impure function - function with one or more side effects.
* Pure function - function without side effects.

Perhaps more than once you have found yourself creating side effects using RxJS streams. I have to admit that it has happened to me e.g. in `tap` or `map` operators. Therefore, it is worth emphasizing that signal is not a stream, but only a pure function. It does not create side effects, and its value is always available synchronously. However, it can lazily recalculate intermediate values.

### How to change the Signal value

Let's say we want to change our value in a signal. We do this via a setter interface `SettableSignal<T>`, which has 3 methods.

```ts
set(value: T): void;
update(updateFn: (value: T) => T): void;
mutate(mutatorFn: (value: T) => void): void;
```

1. `set()` will completely replace our value.
```ts
const counter = signal(0);
counter.set(1);
```

2. `update()` will update the value of the signal based on its current (old) value.
```ts
const counter = signal(0);
counter.update(value => value + 1);
```

3. `mutate()` will mutate the current value internally and it is a sugar for `update()`. If we didn't want to do this: `users.update(users => [...users, newUser])`, then we can mutate if we want. It's great for objects.
```ts
const users = signal<User[])([]);

users.mutate(user => {
  user.push({name: 'Lucas', age: 33});
});
```

Keep in mind that each of the above methods will also notify each dependency and its value where the signal was used.

### Equality function

It is possible to optionally add an equality comparator function to the signal. This is to check newly supplied values and whether they are the same, or different, compared to the current value.

```ts
const counter = signal(0, myEqualityFunction);
```

`myEqualityFunction` is type of: `ValueEqualityFn<T> = (a: T, b: T) => boolean`

If the function detects that 2 values are the same, the signal value is not updated and the propagation of all changes in the dependencies of this signal is blocked. This gives you more control over updates in your signal.

### What is computed()

It is a function that creates a memoizing computed signal, which **returns a reactive value from an expression**.

```ts
const counter = signal(0);
const isEqual = computed(() => counter() === 5);
```

`isEqual` calculates its value by using `computed()` from signal value. It automatically updates the result every time the value of the `counter` signal changes.

The important thing to remember is that each signal reading within `computed()` is *treated as a dependency*, and it will be tracked in the dependency graph.

```ts
const counter = signal(0);
const isEqual = computed(() => counter() === 5); // counter() first dependency
const isOdd = computed(() => counter() % 2); // counter() second dependency
```

And if we now change the signal value e.g. with `.set()`, the changes will be propagated in all `computed` functions, where the signal reading `counter()` is located. These locations are dependencies.

{% img "ohh-yea.jpg" " " "lazy" %}

It is worth mentioning that `computed()` values are cached. They are updated only when it’s needed.

### Signal Effects

`effect()` is a tree-shakable side effect function that **triggers when a signal value changes**. All signal dependencies are captured inside the function. Then, if there is a change in the signal, the side effect function is re-executed.

```ts
const counter = signal(0);

effect(() => {
   console.log('Counter value ', this.counter());
   
   if (this.counter() === 5) {
      console.log('Counter value is equal 5!');
   }
});

counter.set(1);
counter.set(2);
counter.set(5);

// Counter value 0
// Counter value 1
// Counter value 2
// Counter value 5
// Counter value is equal 5!
```

As you noticed, we were given the value `0` at the beginning. This is an initial value, given in the same way as `BehaviorSubject` in RxJS. Then we set the value 3 times and got the final message that the value is equal to `5`. 

The signal effect behaves like a "listener" that needs changing dependencies (signals). Then this function is called. This is the perfect place to perform other operations, calling methods, etc.

## Example of Angular Signals
If you already have the minimal version of `16.0.0-next.0` installed, go ahead and copy the example and test how Angular signals work.

```ts
import { Component, OnInit, computed, effect, signal } from '@angular/core';

@Component({
   selector: 'app-root',
   template: `
    <div>Count: {{ counter() }}</div>
    <div>Odd: {{ isOdd() }}</div>
    <div>Is equal to 5: {{ isEqual() }}</div>

    <button (click)="increment()">Increment</button>
    <button (click)="reset()">Reset</button>
    <button (click)="decrement()">Decrement</button>
  `,
})
export class AppComponent implements OnInit {
   counter = signal(0);
   isEqual = computed(() => this.counter() === 5);
   isOdd = computed(() => this.counter() % 2);

   ngOnInit() {
      effect(() => {
         console.log('Counter value', this.counter());

         if (this.counter() === 5) {
            console.log('Counter value is equal 5!');
         }
      });
   }

   increment() {
      this.counter.update((value) => value + 1);
   }

   decrement() {
      this.counter.update((value) => value - 1);
   }

   reset() {
      this.counter.set(0);
   }
}
```

## Zoneless Angular

By default, Angular change detection is run globally, where the entire component tree is checked from top to bottom. This is made possible by the Zone.js library, which captures all async events such as:

* setTimeout,
* event listeners,
* requests,
* and other. 

How does this look in practice?

```ts
@Component({
   selector: 'app-root',
   template: 'Welcome {{name}}!'
})
export class AppComponent implements OnInit {
   name!: string;

   ngOnInit() {
      setTimeout(() => {
         this.name = 'Lucas';
      }, 2000);
   }
}
```

1. Zone.js detects `setTimeout`.
2. It gives a signal to run change detection automatically.
3. Lastly, after two seconds we receive the result `Welcome Lucas!`.

{% p_add_classes "Default change detection strategy" "center bold"%}

{% img "change-detection-strategy-default.png" "Default change detection" "lazy" %}

Automatic change detection can lead to many problems if we write our application the wrong way, including impact on the performance. Certain strategies and methodologies are usually used for this to create more performant and responsive applications. What if we wanted Angular to be able to run without Zone.js so that it would not automatically update the application for us?

### Angular without Zone.js

We can completely remove Zone.js from our application. To do this, simply deactivate Zone.js and set `ngZone` to `noop` when bootstrapping the app.

```ts main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
   .bootstrapModule(AppModule, { ngZone: 'noop' })
   .catch((err) => console.error(err));
```

At this point you must trigger change detection on your own. This requires comprehensive knowledge of change detection. If we would like to render our `name` now, we can trigger the change detection manually with `detectChanges()`.

```ts
constructor(private cdr: ChangeDetectorRef) {}

ngOnInit() {
   setTimeout(() => {
      this.name = 'Lucas';
      // runs change detection for the underlying component
      this.cdr.detectChanges();
   })
}
```
You can also use `tick()` instead of `detectChanges()`. It will run application-wide change detection. If you use `tick()` in development mode, then remember that it also performs a second change detection cycle to ensure that no further changes are detected.

We did it! We have now a fully working **Angular Zoneless application** that is super performant. It runs change detection only where we need it.

Unfortunately, the main disadvantage of this solution is that we have to manually use change detection in our application to see the changed state of the application. For this, we need to have some knowledge of when to trigger it.

What if we did not have to manually trigger the change detection and Angular did it for us automatically, in addition to not re-rendering the entire template, only the exact places that were changed? This is why **Angular signals** appeared.

### Granular updates with Angular Signals

With Angular signals, there is no need to check the entire component tree and run change detection. Change detection will only be used on affected components and exactly where they have been changed.

{% p_add_classes "Granular updates" "center bold" %}
{% img "granular-update.png" "Granular update with Angular Signal" "lazy" %}

Simply put, when the model changes, Angular will know exactly where and in which component to sync the UI without having to re-render the entire component or its tree.

```ts counter.ts
counter.set(1);	
```

```html counter.html
<div>Count: {{ counter() }}</div> 
// ‘Count: 1’, without re-rendering whole component
```

This seems like a great solution. So why didn't we have this in Angular before?

{% img "tell-me-why.jpg" " " "lazy" %}

Now we can write fully zoneless applications using **granular&nbsp;updates** of elements in the UI without re-rendering components. This opens the door to removing Zone.js from Angular altogether.

What about `ChangeDetectionStrategy.OnPush`, which serves as a "smart change detection checker" that improves our application performance? Won't it be redundant when using signals?

{% p_add_classes "OnPush change detection strategy" "center bold" %}
{% img "change-detection-strategy-onpush.png" "OnPush change detection" "lazy" %}

It seems that `OnPush` can be unnecessary. Why? Let's imagine that we don't have Zone.js and everywhere in the application we only have scattered signals and their dependencies that update themselves in a granular way. At this point, we don't need to disable any components from dirty checking in the tree anymore as we did in the `OnPush` strategy. We use signals inside and outside the components. And that's it. Everything updates automatically.

## Will Angular Signals replace RxJS

As we know Angular married RxJS from the very beginning. Rxjs is the core library that is responsible for reactivity in Angular. It is a great library with which you can overcome many challenges easily and quickly. On top of that, it is very pleasant to write Angular code using:

* streams,
* [cold & hot observables](https://courses.dev-academy.com/p/advanced-rxjs),
* subjects,
* async pipes,
* operators,
* [caching](/angular-cache-http-requests),
* and many more.

We know Angular mainly uses RxJS, so we can easily deal with asynchronicity and data passing between components. By the way, if you need to learn about the advanced techniques of RxJS then I encourage you to take a look here at this course: *[Master advanced RxJS ☄️ techniques](https://courses.dev-academy.com/p/advanced-rxjs)*.

{% p_add_classes "Will signals replace Rxjs in some way?" "bold" %}

It seems so, but only on certain things. For example, let's consider the Subjects in RxJS. If we compare Angular signals with Subjects, we can observe some key differences.
1. **Much simpler than streams**
   Simpler and more understandable code. It means it is easier to get into Angular and learn it. No need to learn RxJS at the start, just start using signals.

2. **No need to handle subscription/unsubscription**
   Just like the `async` pipe in the template. You don't have to manually `unsubscribe`. This is what the Angular team said:
   
> Implicit, low-overhead subscriptions

3. **Automatic propagation of changes in each dependency**
   No need to trigger any updates in the code. That *reactive primitive* has a dependency tree that automatically synchronizes itself.

Overall, I don't think there is much to fear about signals being able to displace RxJS. There is no basis for this. The main power of RxJS is the operators. Moreover, the Angular team has stated that they are going to *integrate signals into RxJS*.

I think RxJS with signals will be a great combination from which we will be able to benefit even more!

## Benefits of using Angular Signals

- **granular updates**,
- a new reactive primitive,
- simplify the framework,
- does not trigger side effects,
- no need to handle `subscribe` and `unsubscribe`,
- automatic and dynamic tracking of dependencies,
- signal reads can't show inconsistent state,
- advantage of using built-in `async` and `await` syntax,
- integration with RxJS,
- improved runtime performance,
- improved debugging,
- reducing application bundle size,
- no need to learn RxJS for newcomers if they use only signals,
- and you can use them everywhere even outside the component class.

Of course, there are also downsides. I noticed there are not so many, but they are worth mentioning. For example:
- calling methods in the template,
- and a big learning curve for newcomers if they want to use signals and RxJS together.

Regarding the calling methods in the template, I suppose they will manage that in the future. And it will not be a performance issue if change detection is reworked.

## Conclusion

We’re finally getting meaningful changes to the framework. Honestly, I’m looking forward to it, and I’m very excited. 🤩

I think signals will enhance Angular and its performance. Signals will become the primary way we indicate that a value should trigger change detection, so we'll use them for every value in our application that changes. And they will also just be generally useful for reactive and declarative coding.

But will Angular signals be **a game changer**? Feel free to comment on this post below.