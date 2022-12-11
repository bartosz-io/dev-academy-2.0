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

Web trust is now necessary to meet all of these objectives because the Web has evolved into a platform for a large portion of global communication, whether it is information sharing, community building, commerce, education, social networking, or supporting applications. If a person can't be certain they're communicating with the right person online, they can't shop safely, and they can't trust the news as much if they're not certain it wasn't tampered with while in transit. If someone is unsure if they are only interacting with the intended recipients, they might avoid social networking. Until recently, HTTPS was only employed by a small number of websites, and usually only during times when money was exchanged. However, because all online activity can now be regarded as sensitive, it has become so essential to daily life.

Web security has also shown to be highly deceptive. The strength of the Web platform we are designing can easily be utilised against the user if an attacker can change content as it is being transmitted (or the site they are using).
A hacker may also be able to obtain data that a website may have saved from earlier visits. If this also contains a persistent grant of access to privileged APIs like geolocation or media capture, the attacker will have unrestricted access to those resources.

Notably, both "simple" website users and those who utilise more complex, interactive sites are subject to these risks.
Furthermore, even if the content being accessed seems harmless, if confidentiality is compromised, something as simple as an image request made "in the clear" (i.e., unencrypted) might give an attacker information about what the user is doing and pave the way for other attacks.

This leads us to the conclusion that server integrity and authentication are fundamental conditions for the continued success of the Web.

Furthermore, even though it's not always technically necessary, maintaining confidentiality is often necessary. We should also think of privacy as being crucial to the continued success of the Web because its significance may only be understood in hindsight.

Web security has evolved into one of the main objectives for browser developers throughout time. The provision of a private and secure communication channel is at the forefront of this effort. Confidentiality, integrity, and authenticity must all be guaranteed by a secure channel, and this can only be done by encrypting the message.
The foundation of a secure web is HTTPS. To ensure a secure connection for your users and your website, it encrypts practically all data transmitted between a client and a web service. Many new browser features, including geolocation and service workers, are only accessible in a secure setting since HTTPS has grown to be so crucial. [Check this out for the full list.](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts#:~:text=Current%20features%20available%20only%20in%20secure%20contexts%201,Media%20Extensions%208%20Generic%20Sensor%20API%20More%20items)

When using localhost applications over HTTPS, maintaining self-signed certificates can be difficult. a challenge that needs to be overcome when a secure connection is necessary in some circumstances.

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
