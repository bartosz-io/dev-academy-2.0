---
title: Angular User Login and Registration Guide (Cookies and JWT)
contributor: Bartosz Pietrucha
avatar: bartosz-pietrucha.jpg
date: 2021-02-18
tags: [Angular, Security]
description: A complete guide to user login and registration with using JWT. A hands-on, detailed and secure implementation in the application.
id: user-login-and-registration
relatedPost: angular-xss
---
{% image_fw 1.78 "banner.png" "Angular User Login and Registration Guide (Cookies and JWT)" %}

In this guide, we will design and implement **a complete solution for user authentication** including user login, registration, and account confirmation with the Angular framework. We will learn how to structure the application with a separate module responsible for the visual and logical parts of user authentication. The proposed approach will be robust and flexible to address the most demanding requirements in modern Web applications.

Apart from the frontend implementation of our use cases, we will compare **different approaches for performing user authentication** used in today's Web. We will discuss distinct scenarios for application deployment and find an appropriate and most secure approach for our needs. By the end of this tutorial you will have a simple yet adaptable Angular login example, that you could tweak to your specific needs. The code will be written for Angular 2+ and relevant to all newer versions (including Angular 11), but the discussed concepts also apply for AngularJS authentication.

## Table of Contents
<!-- toc -->

## Application structure and solution design

To find a proper place in the application for implementing authentication features, we need to take a step back and think about Angular [application architecture and modular design](/angular-architecture-best-practices/). Our application is going to be divided into feature modules, each composed of presentational and logical parts. Most of the code we will have for this tutorial will belong to `AuthModule`. This module will contain:

* routable container components for login, signup and confirmation page,
* two router guards,
* a couple of fine-grained services
* routing configuration
* http interceptor

{% image 800px "application_structure.png" "Application structure" %}

The next application-wide consideration is top-level routing. We want to divide the application into *authentication* and *application* parts. This will simplify the routes tree and later on allow us to create two distinct router guards to apply proper route activation policies.

``` typescript
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'app',
    canActivate: [AppGuard],
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'settings', component: SettingsComponent) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

Before jumping into implementation we need to answer the last very important question. Since HTTP protocol is a stateless request-response protocol, we need to have a way of maintaining the user's context after successful login. In this article, I will describe the two most used approaches: **cookie-based sessions** and **self-contained tokens**.

A cookie-based session is based on the **user's context maintained on the server-side**. Each context can be identified by a session identifier, which is randomly generated for each browser and placed in a cookie. When we use the `HttpOnly` flag on that cookie, we are preventing our system from [cross-site scripting attacks](https://www.youtube.com/watch?v=fIaJDU-jGrA&t=470s&ab_channel=DevAcademy) but still, we need to think about cross-site request forgery attacks. The cookie-based approach is very handy when our frontend application and backend API are hosted **on the same origin** (the same domain and port). This is because of the fundamental rule of the Web Security model, Same-origin policy, that would not allow us to share the same cookies across multiple backends. In other words, cookies are scoped per single domain.

The second approach may be useful when our system is deployed on separate origins: the frontend application is hosted **on a different domain** than backend API. In this case, the requests from the frontend to the backend would be considered cross-origin requests, and the cookies set on the backend origin called **third-party cookies**. A third-party cookie is the same mechanism that is used by analytical and tracking systems and can be easily turned off in modern browsers. A lot of users opt-out of third-party cookies as they are concerned about their privacy on the Internet. Also, some [browser vendors](https://webkit.org/tracking-prevention-policy/) are putting major efforts into eradicating third-party cookies completely.

So what should we do in such a case? We can use another way of providing the user's context between requests - HTTP Authorization Header. This requires programmatic reading, storing, and attaching an authorization token transported via header (as opposed to cookies). Just to put us on the same page, remember that session-id used in cookies is also a token, but an opaque one - it does not convey any information and is just a key to retrieve the session on the server. Another type of token is called **a self-contained token**, which we can put the user's context inside of. In 2015 Internet Engineering Task Force [standardized JSON Web Token](https://tools.ietf.org/html/rfc7519) (JWT) that can securely transport information between the parties. Thanks to a cryptographic signature we can assume that the content of the JWT is authentic and integral. A self-contained nature of JWT allows us to retrieve user context, like permissions and credentials, without a need to maintain the session on the server (think of serverless and Function-as-a-Service). We can also integrate with third-party services without the restrictions of the same-origin policy (for example Firebase or AWS Amplify). I covered a more detailed explanation of [JSON Web Tokens here](/angular-jwt/).

> If you are interested in learning more about **building secure Web applications** consider joining our flagship program [WebSecurity Academy](https://websecurity-academy.com/?utm_source=blog&utm_medium=link&utm_campaign=angular-login-post). It will teach you everything you need to know in that area. ⭐

{% image 800px "session_cookie_vs_token.png" "Session cookie vs JSON Web Token" %}

I believe that it is very important to understand the fundamental differences between these two mechanisms, before implementing user authentication in the application. You can also check out my YouTube videos exploring [the differences between these two approaches](https://www.youtube.com/watch?v=98qu0k1KPLs&ab_channel=DevAcademy) and the ways [JWT can be hacked](https://www.youtube.com/watch?v=MeTz8AWDoiw&ab_channel=DevAcademy). We will build our frontend able to utilize both session cookies and token authentication with JSON Web Tokens. I told you it would be flexible! 🤓

> **WARNING:** Whenever you are using any kind of authorization token that you store in `LocalStorage` or `IndexedDB` (so it's accessible by JavaScript code) you are exposing the token to be hijacked via cross-site scripting attack. However, there are valid mitigation techniques, like [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), [Subresource integrity](https://developer.mozilla.org/pl/docs/Web/Security/Subresource_Integrity), and built-in frameworks' sanitization mechanisms, that (when applied properly!) reduce that risk to a negligible degree. That being said that risk is real, so you should pay enough attention to those security issues.

{% banner_ad "wsf_bundle.gif" "https://dev-academy.teachable.com/p/web-security-fundamentals" %}

## Detailed implementation

### Login feature

Let's start with the UI part - login component template. Our approach for user authentication is based on the pair of email and password, so we need two input items in the template. Note that the second input has an attribute `type="password"`, which instructs the browser to render a masked input element. We also make use of Angular Material to provide a nice look-and-feel to the user interface. Below you can find our login form example.

``` html
<form [formGroup]="loginForm">

  <div class="header">Login to your account</div>

  <mat-form-field>
    <input matInput type="email" id="email" placeholder="Email" autocomplete="off" formControlName="email" required>
  </mat-form-field>

  <mat-form-field>
    <input matInput type="password" id="password" placeholder="Password" autocomplete="off" formControlName="password" required>
  </mat-form-field>

  <div class="actions">
    <button mat-flat-button color="primary" type="submit" (click)="login()" [disabled]="!loginForm.valid">Login</button>
    <div class="separator">
      <span>OR</span>
    </div>
    <button mat-stroked-button type="button" routerLink="/signup">Sign up</button>
  </div>

</form>
```

Now the question is: how to take input values from the user to execute the login? To link the HTML form and input elements in the view with the component code we can utilize some directives from the Reactive Forms module. By using [FormGroupDirective](https://angular.io/api/forms/FormGroupDirective) in this way `[formGroup]="loginForm"`, we are telling Angular that there is a property `loginForm` in the component that should hold an instance of that form. We are using `FormBuilder` to create email and password instances of `FormControl`. Email control is also equipped with a built-in email validator.

``` typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.email],
      password: ['']
    });
  }

  get f() { return this.loginForm.controls; }

  login() {
    const loginRequest: LoginRequest = {
      email: this.f.email.value,
      password: this.f.password.value
    };

    this.authService.login(loginRequest)
      .subscribe((user) => this.router.navigate([this.authService.INITIAL_PATH]));
  }

}
```

The next step is to execute the underlying requests to perform the actual login once the button is clicked. Since we want to handle both cookie-based sessions and JWT tokens, we are decoupling HTTP requests from handling logic with the `AuthStrategy` interface. Depending on the chosen mechanism the actual implementation of `AuthStrategy` is injected in `AuthService`. This is possible thanks to the config setting that dictates which implementation of `AuthStrategy` is used. Below you can find that interface with actual implementations for cookies and JWT. Note that the `authStrategyProvider` factory method is used to register the provider in `AuthModule`.

`auth.strategy.ts`

``` typescript
export interface AuthStrategy<T> {

  doLoginUser(data: T): void;

  doLogoutUser(): void;

  getCurrentUser(): Observable<User>;

}

export const AUTH_STRATEGY = new InjectionToken<AuthStrategy<any>>('AuthStrategy');

export const authStrategyProvider = {
  provide: AUTH_STRATEGY,
  deps: [HttpClient],
  useFactory: (http: HttpClient) => {
    switch (config.auth) {
        case 'session':
          return new SessionAuthStrategy(http);
        case 'token':
          return new JwtAuthStrategy();
      }
  }
};
```

`session-auth.strategy.ts`

``` typescript
export class SessionAuthStrategy implements AuthStrategy<User> {

  private loggedUser: User;

  constructor(private http: HttpClient) {}

  doLoginUser(user: User): void {
    this.loggedUser = user;
  }

  doLogoutUser(): void {
    this.loggedUser = undefined;
  }

  getCurrentUser(): Observable<User> {
    if (this.loggedUser) {
      return of(this.loggedUser);
    } else {
      return this.http.get<User>(`${config.authUrl}/user`)
        .pipe(tap(user => this.loggedUser = user));
    }
  }
}
```

`jwt-auth.strategy.ts`

``` typescript
export class JwtAuthStrategy implements AuthStrategy<Token> {

  private readonly JWT_TOKEN = 'JWT_TOKEN';

  doLoginUser(token: Token): void {
    localStorage.setItem(this.JWT_TOKEN, token.jwt);
  }

  doLogoutUser(): void {
    localStorage.removeItem(this.JWT_TOKEN);
  }

  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    if (token) {
      const encodedPayload = token.split('.')[1];
      const payload = window.atob(encodedPayload);
      return of(JSON.parse(payload));
    } else {
      return of(undefined);
    }
  }

  getToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }
}
```

As you can see above when using cookies, we don't need to handle the session-id as it is automatically put into the cookie by the browser. In the case of a JWT token authentication, we need to store it somewhere. Our implementation is putting it into LocalStorage.

Finally, to glue things together, `AuthService` is calling `doLoginMethod` on `AuthStrategy` after the HTTP request is executed. Note, that the final subscription to the observable stream is attached in LoginComponent and handles the last step to redirect to the initial page after login.

``` typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  public readonly LOGIN_PATH = '/login';
  public readonly CONFIRM_PATH = '/confirm';
  public readonly INITIAL_PATH = '/app/dashboard';

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(AUTH_STRATEGY) private auth: AuthStrategy<any>
  ) { }

  signup(user: User): Observable<void> {
    return this.http.post<any>(`${config.authUrl}/signup`, user);
  }

  confirm(email: string, code: string): Observable<void> {
    return this.http.post<any>(`${config.authUrl}/confirm?`, {email, code});
  }

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<any>(`${config.authUrl}/login`, loginRequest)
      .pipe(tap(data => this.auth.doLoginUser(data)));
  }

  logout() {
    return this.http.get<any>(`${config.authUrl}/logout`)
      .pipe(tap(() => this.doLogoutUser()));
  }

  isLoggedIn$(): Observable<boolean> {
    return this.auth.getCurrentUser().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  getCurrentUser$(): Observable<User> {
    return this.auth.getCurrentUser();
  }

  private doLogoutUser() {
    this.auth.doLogoutUser();
  }

}
```

The approach with `AuthStrategy` is making the `AuthService` implementation very flexible, but if you don't need it, it's totally fine to go without it. The image below illustrates the composition of the presented elements.

{% image 600px "auth_strategy.png" "Auth Strategy" %}

### Sign-up feature

The signup component is very alike to the login component. We have a similar template code with form and inputs. The main difference is in what happens after a successful HTTP request. Here we are just redirecting to the confirmation page from `ConfirmComponent`.

`signup.component.html`

``` html
<form [formGroup]="signupForm">

  <div class="header">Create your account</div>

  <mat-form-field>
    <input matInput type="email" id="signup_email" placeholder="Email" autocomplete="new-password" formControlName="email" required>
  </mat-form-field>

  <mat-form-field>
    <input matInput type="password" id="signup_password" placeholder="Password" autocomplete="new-password" formControlName="password" required>
  </mat-form-field>

  <div class="actions">
    <button mat-flat-button color="accent" type="submit" (click)="signup()" [disabled]="!signupForm.valid">Sign up</button>
    <div class="separator">
      <span>OR</span>
    </div>
    <button mat-stroked-button routerLink="/login">Login</button>
  </div>

</form>
```

`signup.component.ts`

``` typescript
@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./../auth.scss']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      email: ['', Validators.email],
      password: ['']
    });
  }

  get f() { return this.signupForm.controls; }

  signup() {
    this.authService.signup(
      {
        email: this.f.email.value,
        password: this.f.password.value
      }
    ).subscribe(() => this.router.navigate([this.authService.CONFIRM_PATH]));
  }

}
```

Also, notice that we are not using `AuthStrategy` here. Signup is just sending a new pair of login and password to the backend and informing about the need for account confirmation.

{% image 400px "confirmation_screen.png" "Confirmation screen" %}

### Account confirmation feature

After successful signup, the user is informed about an email sent to the email address. The email contains a special link with a confirmation code. This link points to the confirmation component page in the frontend application. The `ConfirmComponent` is designed to work in 2 modes: before confirmation and after successful confirmation. Look at the template below and notice the `isConfirmed` flag in the conditional statement.

`confirm.component.html`

``` html
<ng-container *ngIf="!isConfirmed; else confirmed">
  <div class="header">We've sent you a confirmation link via email!</div>
  <div>Please confirm your profile.</div>
</ng-container>

<ng-template #confirmed>
  <div class="header">Your profile is confirmed!</div>
  <button mat-flat-button color="primary" routerLink="/login">Login</button>
</ng-template>
```

What dictates the displayed content of the component is the boolean value set in `ngOnInit`.

`confirm.component.ts`

``` typescript
@Component({
  selector: 'confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  isConfirmed = false;

  constructor(private activeRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    const email = this.activeRoute.snapshot.queryParams.email;
    const code = this.activeRoute.snapshot.queryParams.code;

    if (email && code) {
      this.authService.confirm(email, code)
        .subscribe(() => this.isConfirmed = true);
    }
  }

}
```

The last missing piece is just an HTTP request to send a pair of email and corresponding confirmation code to the backend in `AuthService`.

`Auth.service.ts` - confirm()

``` typescript
  confirm(email: string, code: string): Observable<void> {
    return this.http.post<any>(`${config.authUrl}/confirm?`, {email, code});
  }
```

After successful confirmation, the page displays an incentive to log in.

{% image 350px "confirmed.png" "Confirmation success" %}

> **WARNING:** Whenever you are using some parameters passed via a link (like confirmation code or password recovery code), you need to remember about `Referer` headers. Only in 2020 [Chrome changed the default settings](https://developers.google.com/web/updates/2020/07/referrer-policy-new-chrome-default) of `Referrer-Policy` to *strict-origin-when-cross-origin*. Without that setting (which you can adjust to your needs) all the requests for additional resources (like analytics, widgets, images, etc.) sent from that page were containing the full URL in the Referer header. For example, when you open the confirmation link and the page contains some third-party resources, the requests to fetch them are sent with the header with the full URL including the email and code. So as a means of prevention it's always important to set a proper `Referrer-Policy` in your application.

### User object

We came to the point where our login and registration with confirmation features are ready. Now we need to add some missing pieces to our system. The question is: how does the frontend client know who is logged in or what role does that user have? Depending on the authentication mechanism (cookie-based or token-based) the way to retrieve that information is different. Since we already have a proper abstraction over these mechanisms we can make use of the `AuthStrategy` interface. The method `getCurrentUser` will provide us with an `Observable` of a User object.

`user.ts`

``` typescript
import { Account } from './account';
import { Role } from './types';

export class User {
  id?: string;
  accountId?: string;
  account?: Account;
  email?: string;
  password?: string;
  role?: Role;
  confirmed?: boolean;
  tfa?: boolean;
}
```

Look at the implementations in both approaches. In the case of server-side sessions, if there is no local copy of a logged user, we need to ask the backend and store it locally. In the case of a JWT token-based authentication, we just need to unwrap the information from inside the token. Since we just want the payload we need to split the string with `token.split('.')[1]` and `window.atob` function decodes the base64 format of the token.

`session-auth.strategy.ts` - getCurrentUser()

``` typescript
  getCurrentUser(): Observable<User> {
    if (this.loggedUser) {
      return of(this.loggedUser);
    } else {
      return this.http.get<User>(`${config.authUrl}/user`)
        .pipe(tap(user => this.loggedUser = user));
    }
  }
```

`jwt-auth.strategy.ts` - getCurrentUser()

``` typescript
  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    if (token) {
      const encodedPayload = token.split('.')[1];
      const payload = window.atob(encodedPayload);
      return of(JSON.parse(payload));
    } else {
      return of(undefined);
    }
  }

  getToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }
```

### Adapting UI

Since the logged user may have some specific role assigned we need to adapt the UI accordingly. Not only the specific routes are available or unavailable, but some elements should be displayed or not. We might manually ask for the user role every time we need to know if the element should be rendered with `ngIf`, but there is a smarter way. What I propose is to create a custom structural directive that needs a list of roles, for which a given element should be displayed. This would provide us with an elegant way of template composition. Look at the example below. The button will be displayed only in the currently logged user has a role 'owner'.

``` html
  <div class="add">
    <button mat-fab color="primary" (click)="openExpenseDialog()" *forRoles="['owner']">+</button>
  </div>
```

This is possible thanks to the `forRoles` structural directive implementation presented below.

``` typescript
import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[forRoles]'
})
export class ForRolesDirective {

  roles: string[];

  @Input()
  set forRoles(roles: string[]|string) {
    if (roles != null) {
      this.roles = Array.isArray(roles) ? roles : [roles];
      this.roles = this.roles.map(r => r.toUpperCase());
    } else {
      this.roles = [];
    }

    this.authService.getUserRole$().subscribe(
      role => {
        if (role && !this.roles.includes(role.toUpperCase())) {
          this.viewContainer.clear();
        } else {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      }
    );
  }

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: AuthService) { }

}
```

Remember that the directive needs to be declared in an Angular module. In our case, we are declaring it in `AuthModule` and exporting it to be available to the outside world.

{% banner_ad "wsf_bundle.gif" "https://dev-academy.teachable.com/p/web-security-fundamentals" %}

### Protecting routes

Users' authorization and roles dictate not only UI elements' visibility. On the higher level, we need to restrict access to the application's routes. Thanks to our top-level routing and separation into authentication and application this task is very easy. We need Router Guards that govern the access to these 2 parts.

``` typescript
@Injectable({
  providedIn: 'root'
})
export class AppGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn$().pipe(
      tap(isLoggedIn => {
        if (!isLoggedIn) { this.router.navigate(['/login']); }
      })
    );
  }
}
```

The logic in the `AppGuard` says: IF the user is not logged THEN redirect to the login page and do not allow access to the application part.

``` typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn$().pipe(
      tap(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate([this.authService.INITIAL_PATH]);
        }
      }),
      map(isLoggedIn => !isLoggedIn)
    );
  }
}
```

On the other hand, the instruction in `AuthGuard` is just oposite: IF the user is logged in THEN do not allow to show the login page and redirect to the default page. We have seen how to register `AppGuard` already in main routing. Now, the next step is to register `AuthGuard` in `AuthRoutingModule`.

``` typescript
const routes: Routes = [
  {
    path: 'login', component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'signup', component: SignupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'confirm', component: ConfirmComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
```

### API requests authentication

The last element in our system is outgoing requests' authentication. When using cookies we don't need to do anything - session-id is attached in every HTTP query.

{% image 500px "cookie.png" "Request with session-id in cookie" %}

In the case of JSON Web Token, we need to have a dedicated code to add an `Authentication` header with a token to the requests. The handiest way is to use `HttpInterceptor`. Pay attention to the conditional check of the authentication mode - we want to attach the token only if this is necessary.

``` typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, @Inject(AUTH_STRATEGY) private jwt: JwtAuthStrategy) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (config.auth === 'token' && this.jwt && this.jwt.getToken()) {
      request = this.addToken(request, this.jwt.getToken());
    }

    return next.handle(request).pipe(catchError(error => {
      if (error.status === 401) {
        this.authService.doLogoutAndRedirectToLogin();
      }
      return throwError(error);
    }));

  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: { 'Authorization': `Bearer ${token}` }
    });
  }

}
```

Lastly, the interceptor needs to be registered in the `providers` list in `AuthModule` as presented below.

``` typescript
@NgModule({
  declarations: [ ... ],
  exports: [ ... ],
  imports: [ ... ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ...
  ]
})
export class AuthModule { }
```

## Summary and next steps

Even though we have a complete and robust solution, there are plenty of enhancements we could implement in your system to improve its security.

First of all two-factor authentication (2FA) is becoming more and more relevant these days. Attackers are using different strategies to get unauthorized access to accounts like brute-force attacks, dictionary attacks, credential stuffing, session hijacking, and many more. One of the easiest ways to implement 2FA is with Google Authenticator, but this is out of this article's scope. Another way to increase the security of the login system is to throttle failed login attempts. This can be very tricky to implement because if we blindly block some user's login, attackers could be easily executing [Denial-of-Service](https://en.wikipedia.org/wiki/Denial-of-service_attack) (DoS) for particular users (for example constantly using the wrong password in an automated way). There are smart solutions to prevent this to happen, like Device cookies and trusted clients.

Finally, our implementation does not have the very important feature of account recovery (password reset). The feature may be covered in future tutorials.

### Is that solution secure?

Yes and no. To make things realistic we need to remember that there are plenty of security risks in Web applications. There are vulnerabilities like cross-site request forgery when using cookies, cross-site scripting when storing tokens in local storage, not to mention that JSON Web Tokens implementation on the backend is crucial to the system's security.

To build secure Web systems you need to understand the fundamentals of the Web Security model, common security vulnerabilities, and prevention methods. There is a lot to take care of on the frontend side of the application, but the most crucial work from the security perspective is done on the backend of the system. This will be covered in upcoming articles.

### Final words

We learnt how to add a login system to an Angular application and create a fully-functional login and registration page. We analyzed the differences between cookie-based and stateless authentication with JSON Web Tokens and provided valid scenarios for both. You can find a full source code of the presented mechanisms in my [Budget training application on GitHub](https://github.com/bartosz-io/budget-angular/).

If you like this content and want to learn more, **I highly recommend you join the waiting list** for [WebSecurity Academy program](https://websecurity-academy.com) or take my concise [WebSecurity Fundamentals course](https://courses.dev-academy.com/p/web-security-fundamentals). Let me know in the comments if you have any questions. Thanks for reading! 😎
