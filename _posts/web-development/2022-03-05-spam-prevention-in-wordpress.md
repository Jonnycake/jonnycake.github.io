---
title: "Spam Prevention in Wordpress"
categories: [Web Development]
---

## Overview

As a website grows in notoriety, so does the number of bots that go to the
site. If you allow your users to communicate with you through your website,
those bots can make it that much harder to manage by filling your forms with
spam. To solve this, I typically recommend a multi-pronged solution as it tends
to be effective even against the most pervasive spam.

## General Strategy

Though there are a variety of techniques that can be used, the most common are
CAPTCHAs, content-based detection, honeypot fields, and IP address blocking.

## CAPTCHAs

### What are they?

CAPTCHAs are challenges that can automatically evaluate if a user is a bot or a
human. Historically this took the form of obscured text that you would type in.
With improvements in OCR (Optical Character Recognition) technology, that form
quickly became less useful.

### Pros

- "Set it and forget it" - there really is no maintenance involved once you set
  it up

### Cons

- They can be bypassed so they aren't reliable
- They interrupt the flow of real users navigating your site
- Depending on how they're implemented, they can create some accessibility
  challenges

## Content-Based Detection

### What is it?

I use content-based detection to refer to mechanisms that attempt to determine
if a particular message is spam based on it's content. This is typically done
through the use of a blacklist, but there are some more technical methods
that involve machine learning and/or statistical analysis.

### Pros

- Depending on how it's implemented, it can be somewhat reliable
- No friction for a normal user

### Cons

- If you're not using a service or some kind of aggregate blacklist, it's hard
  to maintain and keep up to date with trends
- They can easily produce false positives - especially if using a service that
  isn't targeted at your audience
- Submissions aren't necessarily blocked because they have to account for false
  positives
    - They typically involve a review process whereby you can confirm whether
      it's spam
- Depending on the size of the content (as well as the blacklist), it could be
  resource intensive unless offloaded to a third party

## Honeypot Fields

### What are they?

Honeypot fields are input fields that are hidden from the user, but are meant
to trick bots into filling them in so that, if it has content, you can classify
the request as spam.

### Pros

- Doesn't require maintenance
- No friction for a normal user

### Cons

- They can be easily bypassed/detected, so they're not entirely reliable

## IP Address Blocking

### What is it?

IP address blocking is when you disallow requests coming from specific, known
bad, IP addresses.

### Pros

- Depending on what layer you block connections at, it could save you on
  resources/bandwidth as well
- No friction for a normal user (typically)

### Cons

- Requires a lot of maintenance unless you use a third-party service
- Since IP addresses change, you may end up blocking out legitimate traffic

## Implementing in Wordpress

### Built-in Protection

Wordpress has quite a few protections against spam (specifically spam within
comments) built-in.  These include the ability to limit who can comment, the
number of links comments, change whether comments require moderation, and even
a blacklist to set words/phrases that can't be used.  Also, since it comes with
Wordpress itself, it's entirely free!  You can find a full guide to using these
protections here.

### Akismet

Akismet is a plugin that provides content-based detection of spam.  Despite
being a plugin, though, it comes included with Wordpress.  The cool thing with
this plugin is that it lets you, essentially, crowd-source your filters.  For
every comment/form entry that gets posted - it reaches out to the Akismet API
to determine whether it believes it's spam.  This determination is made based
on what your site and other sites have sent it in the past.  You can find more
information here.

### Google reCAPTCHA

Google reCAPTCHA is Google's implementation of a CAPTCHA solution.  It is super
easy to set up and free for most use-cases.  The easiest way to implement it
into Wordpresf is is by using a plugin - there are a ton of options depending
on your needs.  Most form creation plugins also provide some support for
reCAPTCHA out of the box so I definitely recommend looking into any you use
first before adding another plugin to your site.  Feel free read my post on
reCAPTCHA, as well, here if you want to get a more in depth understanding of
how it works and a tiny bit of it's history.

### Wordfence

While Wordfence isn't specifically geared toward spam prevention - it does have
some useful features in it's firewall that lend themselves to that purpose -
namely IP blocking. On top of giving you the ability to manually block IP
addresses from your site, you also get the benefit of their centralized block
list - this contains IPs that were detected as attacking other sites (whether
through spam or otherwise). This is on top of their other security capabilities
like malware detection and 2fa (two-factor authentication) controls so, even if
you don't use it for spam prevention, I definitely recommend checking it out
here to keep your site as secure as possible.
