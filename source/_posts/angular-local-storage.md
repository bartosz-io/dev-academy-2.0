---
title: Managing Local Storage in Angular 📦
contributor: Hugo Noro
avatar: hugo-noro.png
description: Learn how to use local storage the right way in Angular applications.
date: 2022-02-09
tags: [Angular, Security]
id: angular-local-storage
relatedPost: angular-rxjs
---
{% image_fw 1.78 "banner.png" "Managing Local Storage in Angular" %}

<!-- toc -->

## Local Storage, a brief introduction

Web Storage API provides local storage and session storage mechanisms for the browsers to store details in a key-value pair format. This feature is convenient when an app intends to improve the user experience by keeping some previously selected options, themes, table columns visibility, and many other common scenarios. Although, with great power comes great responsibility. The ability to store data should be used carefully and with the mindset that potential risks are at stake. In this article, I will briefly address some of these possible risks, and then we will focus on some of the ways to use local storage with Angular. Session storage is quite similar to local storage. The main difference is that the data is only preserved while a browser tab session is open and discarded when the tab, or browser, is closed. In contrast, local storage data is kept until explicitly cleared by the application code or by removing browser cache storage data manually. Local storage also has the bigger storage capacity of the two options.

## Pros, Cons, and Concerns

A rule of thumb that I have when building an app is a clear split of responsibilities. The client-side of any application is constantly exposed and extremely easy to tamper with and steal unprotected information. Let's repeat this: the client-side of any application is **continuously exposed**. It doesn't matter how many mechanisms or strategies one comes up with; this is always the ultimate reality. Now that we have that mindset crystal clear in our heads, let's talk about some of the pros and cons and some of the concerns of using local storage.

### Pros

The most obvious advantage of keeping the state of anything, being in memory, in a disk, or any other mechanism, is reducing the need to do something again from scratch. Local storage plays a significant part in this kind of use case. An app can easily store data for some website settings preferences or a configuration where only some areas or blocks are displayed. Set up a specific font size that makes the visualisation more comfortable, etc.

Another everyday use case is to use it as a browser cache for frequently used data. Storing the data on the client-side will avoid the need to hit the server with requests constantly. We are talking about considerably small data sets that don't change frequently.

The real advantage of using a local storage service is that all this data is **preserved even when the browser is closed**.

### Cons and Concerns

As mentioned above, the ability to quickly store data that can be reused to improve the experience is, without doubt, a powerful tool. But, with great power comes greater responsibility. For the naive developer, it could be too easy to fall into the trap of trying to store too much information. It's not just a problem with storage capacity but more related to what is stored. The storage of sensitive data that can be extracted to obtain access to private areas of a website or user stored data, etc., should be avoided entirely. There is no scenario where any potential experience improvement would justify the risk of sensitive data being exposed. Any end-user suffering an attack where some evil intentioned attacker could have access to its browser or data stored on a publicly accessed computer could easily be extracted to be exploited.

It's essential to understand that the server should handle any sensitive or security-related information and only be provided against fully authenticated requests. A predictable question after this statement is: what about authentication tokens? Well, there are a lot of existing articles already regarding this long-running discussion, with solid arguments on both sides. Some people defend that they should never be stored. After reading a good amount of information, I'm more on the side of following best practices, and having other security mechanisms in place would dramatically reduce the potential dangers of storing a read-only encrypted token. I won't expand on this discussion since it's entirely out of the article's scope, but it was worth mentioning.

## Local Storage in Angular

Using the local web storage API with Angular is not any different from using it with vanilla javascript. There are many ways to take advantage of the local storage service functions, by calling the available local storage API or creating a service layer that abstracts the usage of the storage mechanism or even by using a third-party library that brings additional features to the table. For the scope of this article, we will be focusing on the first two: calling the API directly on a component (not greatly recommended) and creating a service layer to abstract the calls to the web storage API.

### The quick way

The most immediate way of using the browser storage features is by calling the native localStorage API functions. The code for this example can be found [here](https://stackblitz.com/edit/angular-ivy-7ipsdz?file=src/app/simple-storage/simple-storage.component.ts).

We start by creating a component called SingleStorageComponent, where we will define our interaction through a simple form. The creation of the component and the form is outside of the scope of this article. Since using local storage is not a beginner-level feature, it's assumed the user would know how to create a component with a simple form.

``` typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-simple-storage',
  templateUrl: './simple-storage.component.html',
  styleUrls: ['./simple-storage.component.css'],
})
export class SimpleStorageComponent {
  formGroup: FormGroup;
  storedData: string;

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      storageKey: '',
      storageData: '',
    });
  }

  public setItem(key: string, data: string): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public getItem(key: string): string {
    return JSON.parse(localStorage.getItem(key));
  }

  public removeItem(key): void {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }

  onSetData() {
    this.setItem(
      this.formGroup.get('storageKey').value,
      this.formGroup.get('storageData').value
    );
  }

  onGetData() {
    this.storedData = this.getItem(this.formGroup.get('storageKey').value);
  }

  onRemoveData() {
    this.removeItem(this.formGroup.get('storageKey').value);
  }

  onClearData() {
    this.clear();
  }
}
```

When we break down the component, we can see that we start by creating a form with properties for the key and the data.

``` typescript
this.formGroup = this.formBuilder.group({
  storageKey: '',
  storageData: '',
});
```

For simplicity, the API methods are wrapped within functions of similar names. These should be pretty straightforward to understand what they are doing. Nevertheless, it's essential to mention one small detail on two of them: `setItem` and `getItem`.

The setItem function is responsible for storing the user data using a key-value pair approach. However, it's critical to understand that you can only hold items in the local storage using strings. These can be pure strings or data converted to a string, such as objects. When saving the data, it's essential not to forget to use `JSON.stringify()` to avoid surprises at a later stage.

``` typescript
public setItem(key: string, data: string): void {
  localStorage.setItem(key, JSON.stringify(data));
}
```

The consequence of storing an object without converting it to a string would be the good old [object Object] when trying to read it back. For demo purposes, if we remove the `JSON.stringify()` from the storeItem function and we temporarily change the `onSetData` function to

``` typescript
// FOR DEMO OF WHAT NOT TO DO. DO NOT DO THIS
onSetData() {
  this.setItem(
    this.formGroup.get('storageKey').value,
    {a:123}
  );
}
```

The result would be the following:

{% img "local-storage-in-dev-tools.png" "Local storage object not string" "lazy" %}

In the same way, needed to convert an object to a string, it's essential to parse it back to a JSON object when reading it. Otherwise, the value would be loaded as a string, which could cause issues (e.g. loading dates). For this reason, the function used to retrieve data from the local storage uses `JSON.parse()`.

``` typescript
public getItem(key: string): any {
  return JSON.parse(localStorage.getItem(key));
}
```

As mentioned before, the remaining functions are pretty straightforward; removeItem allows the removal of a specific item from the local storage using a key and clear empties all the objects created.

The other components' other functions are handlers for the events triggered by the template in the code demo.

{% banner_ad "wsf_bundle.gif" "https://dev-academy.teachable.com/p/web-security-fundamentals" %}

### The robust way

The simple approach to persist data illustrated above might be helpful for primary use cases and a tiny Angular app. That approach brings some potential issues when scaling up to a more significant application, such as being directly dependent on using the localStorage object, making it more difficult to be tested, or even switching to a different storage mechanism seamlessly. We can tackle these potential issues by creating an abstraction layer. We will create a service that will expose the methods for handling the localStorage API. This way, we can easily make changes in one single point, and all the components using this service will have access to the same features by dependency injection. Testing will also be easier since we can then mock this dependency to avoid directly working with the localStorage values.

Let's start by creating the local storage service provider. To generate the service, we run the following angular CLI command:

``` bash
ng g s localStorage
```

this will create the scaffolded service:

``` typescript
import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  constructor() { }
}
```

We now need to add the functions from the localStorage API to be exposed by our service. The localStorage service will now be the following:

``` typescript
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class LocalStorageService {

  constructor() { }

  public setItem(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public getItem(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }
}
```

Since we now have the localStorage provider, let's create the component that will make use of this provider. Let's run the following command:

``` bash
ng g c localStorageWithProvider
```

We can at this point reuse part of the component created on the earlier example, with the necessary adjustments to use the localStorage provider, instead of using the localStorage API directly.

``` typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-local-storage-with-provider',
  templateUrl: './local-storage-with-provider.component.html',
  styleUrls: ['./local-storage-with-provider.component.css']
})
export class LocalStorageWithProviderComponent implements OnInit {
  formGroup: FormGroup;
  storedData: string;

  constructor(private formBuilder: FormBuilder, private localStorageService: LocalStorageService) {
    this.formGroup = this.formBuilder.group({
      storageKey: '',
      storageData: '',
    });
  }

  ngOnInit() {
  }

  onSetData() {
    this.localStorageService.setItem(
      this.formGroup.get('storageKey').value,
      this.formGroup.get('storageData').value
    );
  }

  onGetData() {
    this.storedData = this.localStorageService.getItem(this.formGroup.get('storageKey').value);
  }

  onRemoveData() {
    this.localStorageService.removeItem(this.formGroup.get('storageKey').value);
  }

  onClearData() {
    this.localStorageService.clear();
  }
}
```

Although the components don't seem too different, the abstraction layer that we created will make our life a lot easier in the long run when we want to bring along testing and whenever we want to extend the service functionality without the need to do dramatic changes on the component. For example, one interesting exercise would be to expand the service to use observables, changing the interaction with the local storage from synchronous (default behaviour) to asynchronous. I will leave that challenge to the reader by providing the [starting point.](https://stackblitz.com/edit/angular-ivy-h3hbhy?file=src/app/auth.service.ts)

### Unit Testing and Local Storage

No production-ready app would be complete without a meaningful coverage of unit tests. For the sake of this article, we will create 5 unit tests, one that tests each of the available features. To enable the unit testing as the main being run, the only slight change needed [here](https://stackblitz.com/edit/angular-ivy-7ipsdz?file=angular.json) is to change line 18 from

``` json
"main": "src/main.ts",
```

to

``` json
"main": "src/main-testing.ts",
```

This will make the app run jasmine with Karma instead of the main app module.

The full implementation of the tests can be found [here](https://stackblitz.com/edit/angular-ivy-7ipsdz?file=src/app/local-storage-with-provider/local-storage-with-provider.component.spec.ts).

Let's do a focused breakdown of the setup and some of the tests created.

``` typescript
let component: LocalStorageWithProviderComponent;
let fixture: ComponentFixture<LocalStorageWithProviderComponent>;
let localStorageServiceSpy;

beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [LocalStorageWithProviderComponent],
    imports: [ReactiveFormsModule],
  });
});

beforeEach(() => {
  fixture = TestBed.createComponent(LocalStorageWithProviderComponent);
  component = fixture.componentInstance;

  localStorageServiceSpy =
    fixture.debugElement.injector.get(LocalStorageService);

  fixture.detectChanges();
});
```

We start by defining the component we are testing, the `LocalStorageWithProvider` component. We then create the fixture that will allow us to access the inside of the component instance, and we setup also the localStorageServiceSpy. This is where all the magic happens and that will enable us to create mocked behaviour and monitor if the component is calling a specific service function.

``` typescript
localStorageServiceSpy =
      fixture.debugElement.injector.get(LocalStorageService);
```

This line here is essential to get the reference of the actual service that is injected into the component. The attentive reader will notice that the setup of the tests is not injecting the `LocalStorageService` in the provider's property. This is because the service is defined as injected at the app root, hence not needing to be declared here. It is critical to understand that if the service were indeed imported in the provider's config of the test setup, it would be a different instance of the one injected on the component. This small detail could lead to unexpected behaviour like a spy not detecting that has a function called when it had been called on a different instance of the same service.

For this reason, it is always better to get the actual instance injected on the component to be entirely sure the tests are working with the same instance.

To test that the component stores data we have the following unit test:

``` typescript
it('should call storeItem with key and value', () => {
  component.formGroup = new FormGroup({
    storageKey: new FormControl('aKey'),
    storageData: new FormControl('aValue'),
  });

  spyOn(localStorageServiceSpy, 'setItem').and.callThrough();

  component.onSetData();

  expect(localStorageServiceSpy.setItem).toHaveBeenCalledWith(
    'aKey',
    'aValue'
  );
});
```

We start by creating the form and setting the expected key-value pair. We then set up the spy on the setItem function to monitor that it will be called with the expected parameters. After acting on the component by calling `component.onSetData()`, we verify that the setItem function of the service is called with the same key and value that was set up in the form.  

When testing that the store returns a value for a provided key we need a little bit more setup on our test.

``` typescript
it('should return stored data by key', () => {
  let store = { aKey: 'aValue' };
  const mockLocalStorage = {
    getItem: (key: string): string => {
      return key in store ? store[key] : null;
    },
  };

  component.formGroup = new FormGroup({
    storageKey: new FormControl('aKey'),
  });

  spyOn(localStorageServiceSpy, 'getItem').and.callFake(
    mockLocalStorage.getItem
  );

  component.onGetData();

  expect(component.storedData).toEqual('aValue');
});
```

Here we start by creating a mock store and mock local storage. We will only need to define the key of the data we want to return in the form. We need to ensure it matches the same key defined in the mocked store. Then we set up our spy to intercept the requests and call the fake method created on the mocked local storage. When calling the component method to retrieve the data, the expected value should then be set on the 'storedData' property of the component.

The remaining two methods use a similar approach, so there's no need for a detailed breakdown.

## Conclusion

Using browser storage to store different types of data can be beneficial. These are user data, app settings, colour themes, etc. It's essential always to remember that local storage (or even session storage) should never be used for holding sensitive data that can be used to exploit and steal client information. As long as the mindset that anything on the client-side can be tampered with is always present, there's no reason for not taking advantage of this and other beneficial tools.

In this article, I have presented two options to integrate local storage with Angular. There are, of course, many other options like using a third-party library. Although, unless those libraries bring a significant number of features on top, I don't see the need for additional dependencies for such a simple use case.
