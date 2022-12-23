---
title: Angular OTP (one-time password) Verification 🔢
contributor: A M Sanjeev
avatar: a-m-sanjeev.jpg
description: Learn how to request and verify one-time passwords in Angular application improving the security of your authentication system.
date: 2022-07-25
tags: [angular, security]
id: angular-otp
relatedPost: user-login-and-registration
bannerHeader: 'Is your OTP implementation secure? 🧐'
bannerSubheader: 'Learn the secrets of bullet-proof Web apps!'
---
{% image_fw 1.78 banner.png "Angular OTP Verification" %}

You may find new articles every week regarding well-known data breaches and password leaks. You could believe that only people with antiquated systems or lax security are susceptible to this. What about your users, though? To put it another way, it is more crucial than ever to create strong passwords.

But using only secure passwords is insufficient nowadays as phishing attacks are on the rise. So, is there a way for users to authenticate using two factors on your website? By employing the second factor you will make your system much more secure than merely using a password for authentication, that much is true.

In this article we will reverse-engineer and describe how we manage to request and verify one-time passwords in [Web Security Academy](https://websecurity-academy.com/?utm_source=blog&utm_medium=link&utm_campaign=angular-otp-post) training application [budget-angular](https://github.com/bartosz-io/budget-angular). We will discuss 2FA, time-based one-time passwords as well as how to use Angular to request OTP verification.

## Table of Contents
<!-- toc -->

## Introduction to 2-Factor Authentication

An extra security measure called 2-Factor Authentication (2FA), commonly referred to as two-step verification, is used to make sure that only users who have been verified can access an online account. The standard username and password are first entered by the user. Afterward, they will be asked to submit further information before being granted access.

The following groups of variables could make up this second factor:

- A code that is sent to your phone by SMS or an Authenticator app.
- A biometric identifier such as your fingerprint (Touch ID) or facial recognition (Face ID).

## Time-based One-Time Password

The Time-based One-Time Password (TOTP) is a one-time passcode that is widely used for user authentication. A TOPT generator is given to the user and is delivered as a hardware key fob or software token. The time-based one-time password is created by the generator using an algorithm that computes a one-time passcode using a secret supplied with the authentication server and the current time. The user is shown the passcode, which is only valid for a short time. The passcode expires after a certain amount of time. The user normally includes his username and standard password in the login form, along with a valid passcode.

## Requesting OTP

The login process typically consists of two steps. The first stage involves entering our email address and password; the second stage involves OTP input; and finally, we are logged in.

However, since we used the RxJS `retryWhen()` operator in this particular case of Angular OTP verification, we would reject the login request with the error message `OTP REQUIRED` when the user tries to log in with their email address and password. Since we already know the user's email and password, when the error message appears and the user provides a valid OTP input, RxJS `retryWhen()` will attempt to log the user in again using their email, password, and OTP.

{% review_screen "review_1.png" "https://websecurity-academy.com" %}

``` typescript Angular/src/app/auth/containers/login/login.component.ts
login() {
  const loginRequest: LoginRequest = {
    email: this.f.email.value,
    password: this.f.password.value,
  };

  this.authService
    .login(loginRequest)
    .pipe(retryWhen(this.invalidOtp(loginRequest)))
    .subscribe((user) =>
      this.router.navigate([
        this.authService.getInitialPathForRole(user.role),
      ])
    );
}

getIdToken() {
  this.oauthService.requestIdToken();
}

private invalidOtp(loginRequest: LoginRequest) {
  return (errors: Observable<HttpErrorResponse>) =>
    errors.pipe(
      filter((err) => err.error.msg === "OTP_REQUIRED"),
```

In the above code we have employed the RxJS `retryWhen()` operator.

## Employing RxJS operators

### retryWhen()

It is an error-handling operator that gives back an observable with the exception of an error that replicates the source observable. This method emits to the observable returned from the notifier the Throwable that triggered the error if the source observable calls an error. This method will make the child's subscription complete or error depending on whether the observable call was successful or encountered an error. The source observable will be resubscribed to in any other case.

In other words, the `retryWhen()` operator in RxJS allows us to retry the request rather than giving up after the first failure. It makes it easier for us to try again after an apparent series of errors using our own criteria.

The operator's function receives a continuous stream of failures; thus, we need to supply an observable that will cause the necessary retry after each value emission.

### switchMap()

``` typescript Angular/src/app/auth/containers/login/login.component.ts
      switchMap(() => this.requestOtp()),
      tap((otp) => (loginRequest.otp = otp))
    );
}
```

Each value from the source observable is converted by `switchMap` into an inner observable `requestOtp()`, which it then subscribes to and begins emitting values from. For each value it receives from the source, it produces a new inner observable. It unsubscribes from all previously established inner observables whenever it generates a new one. In essence, it ignores all other observables and switches to the most recent one.

``` typescript Angular/src/app/auth/containers/login/login.component.ts
private requestOtp() {
  const config = {
    width: "400px",
    disableClose: true,
  };
  return this.dialog.open(OtpComponent, config).afterClosed();
}
```

Here, we open a Mat-Dialog, wait for the user's OTP input, and then close the dialogue. The `afterClosed()` function of the dialogue is returning an observable, and as soon as the OTP input is received, the value will be emitted.

``` typescript Angular/src/app/auth/containers/login/login.component.ts
tap((otp) => (loginRequest.otp = otp))
```

Now that the OTP has been entered, RxJS `tap` performs side effects for the value emitted by the source Observable and returns an Observable identical to the source Observable until there is no error, which means it will attach the OTP input value to the `loginRequest` and try again with the email, password, and OTP.

> The RxJS `do` operator has been renamed to `tap` (as _pipeable_ operator).

## The OtpComponent Dialog

Let's now study the `OtpComponent` Dialog.

``` typescript Angular/src/app/auth/containers/login/login.component.ts
return this.dialog.open(OtpComponent, config).afterClosed();
```

It appears as an Angular NgModel.

## Angular ngModel

It is a built-in directive for Angular that produces a FormControl object from the domain model and attaches it to a form control element. The ngModel directive links the value of HTML controls (such as input, select, and textarea) to application data.

We can only accomplish that using the HTML element and the component element together. The syntax `[()]` is used for two-way binding. It combines the one-way event binding `()` and one-way property binding `[]` syntaxes together.

Setting and getting values are both possible with two-way binding. The two-way binding employs a particular name pattern.

``` html Angular/src/app/auth/components/otp-dialog/otp.component.html
  <mat-form-field>
    <mat-label>Code</mat-label>
    <input
      matInput
      [(ngModel)]="otpValue"
      #otp="ngModel"
      Pattern="[0-9]{6}"
      required
      maxlength="6"
      autocomplete="off"
    /> 
  </mat-form-field>
</div>
<div mat-dialog-actions>
  <button
    type="submit"
    mat-button
    color="primary"
    (click)="verify(otpValue)"
    [disabled]="otp.invalid"
  >Verify</button>
</div>
```

This will bind the required six digits to the OTP input value which will then be confirmed by the:

``` typescript
(click)="verify(otpValue)"
```

Finally, the dialogue will be closed using

``` typescript Angular/src/app/auth/components/otp-dialog/otp.component.ts
verify(result: number) {
  this.dialogRef.close(result);
}
```

which will then execute the `afterClosed()` observable

``` typescript Angular/src/app/auth/containers/login/login.component.ts
return this.dialog.open(OtpComponent, config).afterClosed();
```

and send the OTP value to the tap method

``` typescript Angular/src/app/auth/containers/login/login.component.ts
tap((otp) => (loginRequest.otp = otp))
```
The budget-angular training application's otpcomponent dialog's complete source code can be found here: [OtpComponent Source Code](https://github.com/bartosz-io/budget-angular/tree/master/src/app/auth/components/otp-dialog)
## The next steps

The next thing we will learn is how everything is put into practice and how the Node.js backend validates the OTP. To learn more about OAuth/OIDC, construct a secure role-based enterprise-grade authorization, and implement other topics related to full-stack web security, visit our flagship program [Web Security Academy](https://websecurity-academy.com/?utm_source=blog&utm_medium=link&utm_campaign=angular-otp-post). You can also check our article covering [secure coding training](/secure-coding-training) with actionable guidelines to build secure Web applications.

{% review_screen "review_2.png" "https://websecurity-academy.com" %}
