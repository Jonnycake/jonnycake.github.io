---
title: Repo Explorer
date: 2018-12-22

end_date: 2019-03-21

github_link: https://github.com/Jonnycake/RepoExplorer
#demo_link: 

categories: [Python, Git, Static Analysis]
---
### Background

At a previous job, we frequently ran into issues when hotfixes were deployed
because they didn't include all of the relevant dependencies.  The patching
team also had no way of rolling back the changes.  This led to after-hours calls
that I helped field.  To reduce those issues, I created a series of scripts to
identify dependencies based on Git commit history and generate the patch tarball
with pre-install validations and rollback capabilities.

The dependency inference capability is broadly useful, though, as part of an
introduction to a Git repo so I rebuilt it.  I also added some additional
functionality that I thought would be useful (eg. identifying documentation,
etc.).

### Theory

The core theory behind it is that the more two files appear together in commits,
the more likely they are to be coupled.  Understanding those relationships is
useful for a couple of reasons:

1. You know that if you change the public interface of one, then you likely
   need to update the other
2. If there are too many interdependencies, then that indicates the system
   itself is fairly brittle and may need to be refactored

### Final Thoughts

This is a project that I think had a lot of promise, but I didn't invest enough
time in it.  Nowadays, though LLMs like Copilot may now do a better job of
finding dependencies than a hard-coded script.
