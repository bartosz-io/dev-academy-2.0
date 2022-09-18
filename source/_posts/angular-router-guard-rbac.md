---
title: Angular Guard for Role-Based Access Control
author: A M Sanjeev
avatar: a-m-sanjeev.jpg
description: Learn about Angular Guard, AuthService, AuthGuard Implementation, and Routing Module Implementations and create a simple Angular app with user and admin roles and role-based authorization.
date: 2022-09-11
tags: [Angular, Security, Routing]
id: angular-router-guard-rbac
relatedPost: vue-router-best-practices
---
{% image_fw 1.78 banner.png "Angular Guard for Role-Based Access Control (RBAC)" %}

We learned how to use the [Web Security Academy](https://websecurity-academy.com/?utm_source=blog&utm_medium=link&utm_campaign=angular-router-guard-rbac-post) training program [budget-angular](https://github.com/bartosz-io/budget-angular) to request and verify one-time passwords in the preceding post [**Angular OTP (one-time password) Verification 🔢**](https://dev-academy.com/angular-otp-verification/). We talked about two-factor authentication (2FA), time-based one-time passwords, and using Angular to request OTP verification.

In this article, we will discuss Angular Guard, AuthService, AuthGuard Implementation, and Routing Module Implementations.

In this article, we'll create a simple Angular app with user and admin roles and role-based authorization.

The **_/admin_** route is accessible to only admins. The user can access the application's **_/user_** route if they log in as a user from the login page. As a guest, he can only view the **_/home_** page; he cannot use the **_/admin_** page or **_/user_** routes. We can restrict access to **_/admin_** or **_/user_** routes. The authentication service will be used by the login component to log in to the application. If the user is already logged in as an admin or user, he will be taken to the **_/home_** page.

### **Let's Begin**

<!-- toc -->

## Introduction

A fantastic web application may be developed with ease using the many features and ready-to-use services offered by Angular. And one of those practical characteristics is routing. However, there are situations when you want users to browse based on a specific requirement, such as preventing inadvertent data loss by requiring authorized users (e.g., logged in) to access the dashboard.

Using certain conditional statements on individual pages and navigating users if that condition is met is one method to accomplish this. The drawback of this strategy is that it makes the program more complex, necessitates writing more code, and will make the code more difficult to maintain as the size of the application will expand.

The use of route guards is another solution to this issue. This has built-in interfaces that can be used to control the navigation of routes.

## What is an Angular Guard?

Angular Route guards are Angular interfaces that, when used, enable us to control a route's accessibility based on conditions specified in the class implementation of that interface. Or in other words, Guards are the interfaces that provide information about whether a requested route is permitted. The guards observe the methods' return values from the implemented interfaces while carrying out these tasks.

There are now five different types of Angular route guards provided by angular:

1.  **_CanActivate_**
    
2.  **_CanActivateChild_**
    
3.  **_CanDeactivate_**
    
4.  **_CanLoad_**
    
5.  **_Resolve_**
    

Let's explore each route individually:

1.  **_CanActivate interface_**
    
Controls the activation of a route. A class's implementation of an interface that a guard can use to determine whether a route can be activated. All guards must return true for navigation to proceed. Navigation will be halted if any guard returns false.

_method signature:_
    
```typescript
interface CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
}
```
Learn more about Angular CanActivate [here](https://angular.io/api/router/CanActivate#description)

2.  **_CanActivateChild_**
    
    The only difference between **_CanActivate_** and **_CanActivateChild_** is that **_CanActivate_** controls the accessibility of the current route, whereas **_CanActivateChild_** controls the accessibility of a given route's child routes. As a result, using this eliminates the need to add **_canActive_** to each child route; instead, you only need to add **_canActiveChild_** to the parent route, and it will function for child routes as well.
    
    _method signature:_
    
```typescript
interface CanActivateChild {
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
}
```

Learn more about Angular CanActivateChild [here](https://angular.io/api/router/CanActivateChild)
    
3.  **_CanDeactivate_**

The purpose of this route guard is to prevent the user from deviating from a predetermined route. When you wish to stop a user from mistakenly moving away without saving or performing other undone activities, this guard can be helpful.

An interface can be implemented by a class to act as a guard, determining whether or not a route can be deleted. All guards must return true for navigation to proceed. The navigation will be halted if any of the guards return false.

The implementation of this route guard differs slightly from the aforementioned routes in that it calls a function defined in the component class whenever the user tries to deviate from the route.

_method signature:_

```typescript
interface CanDeactivate<T> {
  canDeactivate(component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
}
```

Learn more about Angular CanDeactivate [here](https://angular.io/api/router/CanDeactivate)

4.  **_CanLoad_**

In angular, modules can be loaded in stages or instantly. Angular loads every module eagerly by default. In the route definition, we utilize loadChildren to implement lazy loading. The key benefit of lazy loading is that it speeds up program loading by just downloading necessary components. Now, if we want to stop unauthenticated or unauthorized users and provide access to authenticated users from navigating this page, we may utilize CanActivate Guard, which will accomplish both goals while also downloading the module. **_CanLoad_** Guard can now be used to restrict navigation and stop that module from downloading.

_method signature:_

```typescript
interface CanLoad {
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
}
```

Learn more about Angular CanLoad [here](https://angular.io/api/router/CanLoad)

5.  **_Resolve Guard_**

Classes can become data providers by implementing an interface. The router can be utilized with a data provider class to resolve data while navigating.

Data transmission between components is necessary for complex angular applications; occasionally, the data is too large to pass through query parameters. Resolve Guard has been supplied by angular to address this scenario.

Now that the code has been implemented, the Resolve guard resolves data and passes it to the component.

_method signature:_

```typescript
interface Resolve<T> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T> | Promise<T> | T
}
```

After resolving the data, resolve will pass the component a datatype T. Learn more about Angular Resolve [here](https://angular.io/api/router/Resolve)

The **_CanActivate_** guard will now be used in this article to safeguard the router's link. We could utilize **_CanActivateChild_**, in the same way, to simply add role-based protection for our router.

## What Is AuthService?

To offer details about the user's login status and roles, we will develop an Auth service. It's just a straightforward simulation for logging in and receiving jobs. Although we will learn more about Angular Guard for RBAC Driven by JWT in the following article. So, here we have:

The **_function login()_** accepts a string parameter and stores the login state and role of the user. The value supplied to the role as an argument.

The user's information about login is deleted from local storage by the **_logout()_** procedure.

The **_isLoggedIn()_** function lets us know if a user is currently logged in to the system.

From local storage, the **_getRole()_** function returns the user's role.

## What is an Angular Injector?

The dependency is created and injected into the component or service by the Angular Injector. Using the injection token, the injector searches the Angular Providers for the dependency. The Angular Providers array returns the Provider, which includes instructions on how to create an instance of the dependency. The injector creates the instance, which is then injected into the component or service.

### @Injectable

The Injectable is a decorator that must be added to the dependency's consumer. This decorator instructs Angular that the arguments must be injected using the Angular DI system. Learn more about @injectible [here](https://angular.io/api/core/Injectable)

### providedIn: ‘root’

providedIn: 'root' is an additional option you can pass in the @Injectable decorator to tell Angular that you want to provide this Injectable in the root injector. You can have lazy-loaded singleton services by using providedIn: 'root.'

### AuthService

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLogin = false;
  roleAs: string;
  constructor() { }
  login(value: string) {
    this.isLogin = true;
    this.roleAs = value;
    localStorage.setItem('STATE', 'true');
    localStorage.setItem('ROLE', this.roleAs);
    return of({ success: this.isLogin, role: this.roleAs });
  }

  logout() {
    this.isLogin = false;
    this.roleAs = '';
    localStorage.setItem('STATE', 'false');
    localStorage.setItem('ROLE', '');
    return of({ success: this.isLogin, role: '' });
  }

  isLoggedIn() {
    const loggedIn = localStorage.getItem('STATE');
    if (loggedIn == 'true')
      this.isLogin = true;
    else
      this.isLogin = false;
    return this.isLogin;
  }

  getRole() {
    this.roleAs = localStorage.getItem('ROLE');
    return this.roleAs;
  }
}
```

## Auth Guard Implementation

Use the Angular-CLI command to create a guard.

**Create auth-guard:**

```
ng generate guard auth
```

The **_CanActivate_** method will be called before each request to the router. In this method, we'll see if the user is logged in and has the correct role.

The **_checkUserLogin()_** method takes two parameters. These are **_ActivatedRouteSnapshot_** and the **URL**. We have control over the role stored in the value of the data object passed to the router. If it has the correct role, the method will return true; otherwise, it will return false and navigate to the **_/home_** route.

**AuthGuard.ts**

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;
    return this.checkUserLogin(next, url);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }

  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
    if (this.authService.isLoggedIn()) {
      const userRole = this.authService.getRole();
      if (route.data.role && route.data.role.indexOf(userRole) === -1) {
        this.router.navigate(['/home']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
```

## Routing Module Implementation

We will inform the Routes object about the role. This is a straightforward procedure. All we have to do is add a guard and our data to the role.

**Add Guard:**

```typescript
canActivate: [AuthGuard]
```

**Providing the role information that will allow access to that page:**

```typescript
data: {
        role: 'ROLE_ADMIN'
      }
```

**routing-module.ts**

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'admin', component: AdminDashBComponent,
    canActivate: [AuthGuard],
    data: {
      role: 'ADMIN'
    }
  },
  { path: 'user', component: UserDashBComponent,
    canActivate: [AuthGuard],
    data: {
      role: 'USER'
    }
  },
  { path: '**', component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## Summary

We can protect our routes based on our role using the scenario above. This article explains how to use role claims to support RBAC. We reviewed Angular Guards, Angular Injector, Auth Service, AuthGuard Implementation, and Routing Module Implementation.

## The next steps

This was a straightforward angular application to put into action. Although we will learn more about Angular Guard for Role-Based Access Control (RBAC) Driven by JWT in the following article. Visit our flagship program [Web Security Academy](https://websecurity-academy.com/?utm_source=blog&utm_medium=link&utm_campaign=angular-router-guard-rbac-post).
