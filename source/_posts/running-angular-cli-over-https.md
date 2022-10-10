---
title: Running Angular CLI over HTTPS
contributor: A M Sanjeev
avatar: a-m-sanjeev.jpg
description: Learn how to have a trusted self-signed certificate and serve your Angular application via HTTPS locally.
date: 2022-10-10
tags: [Angular, Security]
id: angular-cli-https
relatedPost: angular-cors
---
{% image_fw 1.78 banner.png "Running Angular CLI over HTTPS" %}


<!-- toc -->

## Introduction

The Web has evolved into a platform for much of the world's communication over the last 25 years, whether it's information sharing, community building, commerce, education, social networking, or underpinning applications. The Web's trustworthiness has become critical to its success in meeting these needs. If a person can't trust that they're communicating with the intended party, they can't use the Web to shop safely; if they can't trust that Web-delivered news hasn't been tampered with in transit, they won't trust it as much. If a person is unsure that they are only communicating with the intended recipients, they may avoid social networking.

Previously, HTTPS was only used on a few websites, and usually only when financial transactions occurred. However, it has recently become clear that nearly all Web activity can be considered sensitive, as it now plays such a central role in everyday life.

At the same time, Web security has proven to be quite subtle. If an attacker can modify content while it is in transit, the power of the Web platform we are defining can easily be used against the user (or the site they are using).

An attacker can also gain access to information that a site may have saved from previous visits. If this includes a persistent grant of access to privileged APIs such as geolocation or media capture, the attacker will be able to access those resources without any prior authorization.

Notably, these risks exist for "plain" Web site users and those who use more sophisticated, interactive sites.

Furthermore, if confidentiality is lost, something as simple as an image request "in the clear" (i.e., unencrypted) can provide an attacker with information about what the user is doing, opening the door to further attacks – even if the content being accessed appears innocuous.

This leads us to the conclusion that server authentication and integrity are fundamental requirements for the Web's continued success.

Furthermore, while not always strictly necessary, confidentiality is frequently required. Because the importance of privacy may only be realized in retrospect, we should also consider it critical to the Web's continued success.

Over time, one of the primary goals for browser developers has become web security. At the forefront of this endeavor is the provision of a private and secure channel of communication. A secure channel must ensure confidentiality, integrity, and authenticity, which can only be achieved by encrypting the communication.

HTTPS is a critical component of a secure web. It encrypts nearly all information sent between a client and a web service, ensuring a secure connection for both your users and your website. HTTPS has become so important that many new browser features (for example, geolocation and service workers) are only available in a secure context. [Check this out for the full list.](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts#:~:text=Current%20features%20available%20only%20in%20secure%20contexts%201,Media%20Extensions%208%20Generic%20Sensor%20API%20More%20items)

Maintaining self-signed certificates when running [localhost](http://localhost) applications over HTTPS can be a pain. A stumbling block that must be overcome in certain situations where a secure connection is required.

Here are a few examples of such situations:

1.  Integrating with services that require the client to use HTTPS (e.g., Facebook Login API or Okta)
    
2.  Using getUserMedia, obtain a stream from a user device (it can only be used in secure contexts)
    

The procedure for configuring a local webserver to serve content over HTTPS varies by the server. However, using the Angular CLI is a simple task.

## ng Serve

ng serve is a dedicated development server that comes preinstalled with the Angular CLI. The ng serve command is used to build and serve the application. If there are changes, it rebuilds the application.

## Steps to run your local application over HTTPS

1.  ### Create a Certificate
    
    Initially and mainly You must first create and trust self-signed certificates on your local workstation before using HTTPS with your application.
    
2.  ### Angular CLI
    
    The Angular CLI must be informed after your certificate has been created and trusted. This can be done using either config file settings or command-line options.
    

## Command Line Options

To support SSL, ng serve accepts three built-in flags:

*   \--ssl: boolean indicating whether SSL is enabled or disabled; defaults to false.
    
*   \--ssl-cert: (for SSL certificate) relative path to the certificates
    
*   \--ssl-key: relative path to the private key
    

So, the command to enable SSL would look like the following:

    ng serve --ssl \
      --ssl-cert "ssl/localhost.crt" \
      --ssl-key "ssl/localhost.key"

## Since Angular 6

1.      ng serve —-ssl true
    

*   SSL is enabled
    
*   Examine the default SSL folder for a certificate and private key.
    
*   If no certificates or private keys are found, the CLI will generate his own.
    

1.      ng serve \
            --ssl true \
            --ssl-cert "/home/sanjeev/ssl/example2.crt" \
            --ssl-key "/home/s/anjeev/ssl/example2.key"
    

*   SSL is enabled
    
*   Check to see if the given path contains a certificate and a private key.
    
*   If no certificates or private key paths are found, the CLI will generate its own.
    

## Issues

The two most common issues are as follows:

1.  Because the browser does not trust our certificate, we receive a warning.
    
2.  Loop disconnect and restart
    

3.  ### Not Trusted certificate authority
    
    This issue is relatively simple to solve. We can simply disregard the warning and continue to use our application.
    
    If you don't encounter the second issue and can live with the fact that you have an untrusted certificate, you can stop right here and continue developing your fantastic application.
    
4.  ### Loop disconnect and restart
    
    This is an intermittent problem. When a piece of code changes, the application can disconnect from the socket that listens for the event that restarts the application. In addition to the disconnect, the application restarts several times.
    
    This is a problem that several people have/had. An issue has been reported in the Angular [repository](https://github.com/angular/angular-cli/issues/5826) on Github.
    

## Solution

All we need is for our browser to trust our certificate to solve all of our problems. When we use a trusted certificate, the Angular CLI does not have any issues. As a result, using a trusted certificate solves both problems.

## Conclusion

Now as you have a trusted self-signed certificate, you must be able to serve your Angular application via HTTPS locally.

It's crucial to remember that this setup is only meant for local development. Use certificates signed by a reputable Certificate Authority for apps that are accessible to the general public. Today, a great resource for this is Let's Encrypt.

## The next steps

The next step will be to learn how to generate and install the certificate, as well as how to use config files to inform angular CLI about our certificate.

Learn about 2FA, time-based one-time passwords, and how to use Angular to request [OTP verification](https://dev-academy.com/angular-otp-verification/). Learn about Angular Guard, AuthService, AuthGuard Implementation, and [Routing Module Implementation](https://dev-academy.com/angular-router-guard-rbac/).
