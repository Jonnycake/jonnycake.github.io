---
title: "Security Reviews of Vibe Coded Apps"
categories: [Reflections]
tags: [ai, appsec]
---
# Background

With the rise of AI-assisted development, the need has shifted from developing
to securing.  As part of my practice, I took some time to perform a security
review on various vibe coded applications. Throughout the reviews, I landed on
a methodology that seems to be fairly effective.  

# The Methodology

The review progresses through 4 main phases, each of which helps to discover and
validate issues.

## Phase 1 - Initial Source Review

It starts with an initial source review for familiarization and to search for
immediate red flags.  The first questions I'm looking to answer are:

- What is the stack that's in use? (e.g. NodeJS vs Flask)
- What types of users are there? (i.e. permission schemes)
- What endpoints are available?
- How is authentication / authorization done?
- Where does the application accept / use user input?

Finding the answer to those questions helps me to define the actual attack
surface.  From there, I begin checking each area for:

- What type of user should have access?  Is it limited to them?
- What does it do with the user input?  Any injection opportunities?
- What information is returned?  Is any of it sensitive?

Throughout this process, I keep notes on any issues / questions that arise so
that I can validate them in the next phase.

## Phase 2 - Live Testing

After my initial review is complete, I get the application set up locally.  This
tends to be a bit messy, as the AIs directions never seem to fully line up.

Once it's set up, though, I begin poking around areas of the application that
were highlighted in my earlier review.  Typically, what I do in this phase is
work my way upward in trust levels.  In other words, my first checks come from
the perspective of an external, unauthenticated user and I progressively give
myself higher permissions until I'm an admin.

Throughout the process, my goal is simple: identify all the ways that I can get
from the current level of trust, to the next one.  As I come across new trust
boundaries, I cross-reference what I'm seeing in the application with what I
see in the code.  This allows me to quickly determine if an attack will work or
if it's a waste of time without a ton of fuzzing.

Any issue that I flagged in the initial review gets tested and either confirmed
or rejected, once again going back and forth between the live view and code to
find the "why".

Any confirmed vulnerabilities also trigger a check in the code to find locations
where the same pattern is seen.  For example: if one endpoint only checks if
the user is logged in, not if they are a specific role, I look to see where else
that happens.

## Phase 3 - Automated Scans

The last actual check of my security reviews is to run three types of automated
scans:

- Static Application Security Test (SAST) - Typically, I'll use the Semgrep
  community edition for this
- Software Composition Analysis (SCA) - What I use depends on the tech stack,
  but just about every one provides some type of dependency audit tool
- Secret Scanning - I use Trufflehog for this

During SAST, I'm looking for any issues or entire areas of the application that
I may have missed.  Any issues raised here get validated with more live testing.

SCA answers the question: what known vulnerabilities exist in the application's
dependencies.  If there's anything returned, I then go back to the code to see
how the specific component is used to determine whether the vulnerability
applies and test it live if possible.

Secret scanning helps to determine whether any sensitive credentials (e.g. API
keys) have been accidentally committed to the repository.  This is particularly
important to check when vibe coding as the developer typically pays less
attention to exactly what's being written.

## Phase 4 - Write Up

Finally, once my review is complete, I take my list of issues and attempt to
make them as actionable as possible.  To do so, I look at each issue both in
isolation and when used as part of an attack chain.  This helps me to determine
the true impact of each and guides my prioritization.

I then put the items in order of priority with:

- A technical description
- A description of the practical impact
- A reference to the code that caused it (e.g. filename and line number)
- A working proof of concept (where possible)
- A proposed fix (whether as code or written in English)

In my write-up I also note down anything that I was unable to test, like
interactions with an API that I don't have access to, or things that might
change depending on how it's deployed.

I also do my best to raise design concerns that may not be a vulnerability now,
but have the potential to lead to a vulnerability later on.  For example, one
application I reviewed had a "Settings" endpoint, meant to be used for colors /
branding, but the name could lead to misuse with sensitive credentials being
added by AI.

The goal is to get as much information written down as possible so that the AI
or an author of the application would be able to fix, validate, and prevent
recurrence of the issue.

# The Result

Across all the applications I've reviewed so far, I notice a pattern in the
issues that I continue finding.  They all come down to business logic type bugs.
The reason for this, I believe, is simply that AI isn't as good at finding /
preventing those as it is for things where the fix is just "sanitize user input".

The most common issues I've seen are authorization-based.  Either an endpoint is
missing authorization checks or the permissions are misaligned (i.e. a user is
allowed to do something they shouldn't be).  This leads to issues like insecure
direct object references and privilege escalation bugs.

The use of outdated dependencies is also rampant.  That's much easier to find
with automated scans, but it does still require some manual validation to
determine the true impact.

# Reflection

AI has changed the shape of modern software development.  The barrier to entry
has been lowered and, in reading peoples reactions to the experience online, it
has afforded people the joy in creation that some traditional developers take
for granted.

However, while vibe coding can help you get to a product quickly, it can't tell
you if you're building the right thing, in the right way.  It's important for
any production system to keep a human in the loop to review closely for any
unintended behavior.

Additionally, with the deeper integration of AI into modern development
practices, it's important to be aware of the risks.  Between prompt injection
and supply chain attacks, I think we're going to face a bigger need for secure
development practices.  Those standards will also need to be written with a
broader audience in mind, as more people from non-traditional backgrounds create
applications.
