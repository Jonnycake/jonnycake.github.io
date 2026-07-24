---
title: "Lab Write-Up: TryHackMe / Profiles"
categories: [Labs]
tags: [tryhackme, ctf, dfir, linux]
order: 1
description: |
  My walkthrough of the Profiles room on TryHackMe.  Examining a memory dump
  using volatility to uncover indicators of compromise.
---
# Volatility Setup

- The challenge officially recommends Volatility 2.6.1, but it's officially
  deprecated now that 3 has reached feature parity
- I set up volatility 3
- Identify banner with `banner.Banners`
- Attempted pre-built symbol table - didn't work (fully)
- Build my own symbols
    - Download debug symbols for that release
    - Download linux-modules for that release
    - Extract both, use `/boot/Symbol...` and `/usr/lib/boot/vmlinu**x**`

# Answering the Questions

- Initially look at bash history (`linux.bash.Bash`)
- Exposed root password from typing it where it wasn't meant to be
- users.db acess logged
- Find the malicious file (`pkexecc`)
- Dump the file `linux.pagecache.Pagecache --inode 0xaddr --dump
- `md5sum`
- Find the open connections - `linux.sockstat.Sockstat`
- Find the cronfile - `linux.pagecache.Files`
- Dump the file `linux.pagecache.Pagecache --inode 0xaddr --dump`

# Reflection

- We can probably talk about deprecated tooling
