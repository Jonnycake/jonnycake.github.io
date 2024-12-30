---
layout: post
title: "Problem: /etc/resolv.conf Gets Overwritten"
---
## Background

I recently ran into a problem at work where one of our servers lost DNS
capabilities. This led to failures with payment processing, email sends, etc.
Our initial solution was to update `/etc/resolv.conf` to add the google DNS
servers (`8.8.8.8` and `8.8.4.4`) to the list of nameservers that it would use.
This worked, but as we had ran into this problem with a different (non-critical)
server, I knew that it would be overwritten at some point and we had to
determine how to prevent that from happening.

## TL;DR

Both `ifcfg` scripts and
[NetworkManager](https://en.wikipedia.org/wiki/NetworkManager) attempt to update
`/etc/resolv.conf`.  If `NetworkManager` is not actually managing the interfaces,
then you must disable it's control over the file.  Then, you can either use the
ifcfg files to add nameservers or disable its control of DNS and manage
`/etc/resolv.conf` manually.

[Skip to Solution](#solution)

## When is it overwritten?

Initially, my understanding was that it would be overwritten whenever
NetworkManager restarted, however, when I restarted NetworkManger using the
following command, I determined that was not the case (for a reason that becomes
apparent later...):

```bash
systemctl restart NetworkManager
```

As it turns out, it gets overwritten when the network interfaces (e.g. eth0) get
turned up.  There are a couple of ways to go about making that happen -

**Option 1 - Manually Bring Interface Down and Up**
```bash
ifdown -a
ifup -a
```

**Option 2 - Restart Networking Entirely**
```bash
/etc/init.d/networking restart # or systemctl networking restart
```

**Option 3 - Just restart the box**
```bash
shutdown -r now
```

Option 1 was a no-go as I was connected to the server through SSH.  I did see in
a couple of comments that you didn't need to bring them down, just bringing an
interface up (i.e. ifup -a) even if it already was would work, but when I tried
it that didn't work either.

Option 2 is probably preferable as it's quicker than a reboot and wouldn't
disconnect me, but it should still trigger the overwrite (I did not test that).

Option 3, however, was simulating a scenario where I knew for a fact that it
would be overwritten and we happened to need to add more resources anyway, so I
took advantage of that.

Before the restart, though, I needed to put in a potential solution.

## First Try

I used a bit of Google-fu and came across [this
post](https://serverfault.com/questions/810636/how-to-manage-dns-in-networkmanager-via-console-nmcli).
There's a utility called nmcli that you can use to configure NetworkManager and
it can add nameservers that will be applied in resolv.conf - this is exactly
what I was looking for.

The first step was to determine the connection name so I ran this command:

```bash
nmcli con show
```

Unfortunately, that returned nothing so obviously I was going down the wrong path.

## Revelation #1

I did a little bit more googling, specifically regarding how CentOS handles
networking because, at this point, I didn't believe it used NetworkManager and
found [this
page](https://www.tecmint.com/manage-networking-with-networkmanager-in-rhel-centos/).
I wasn't really looking for a solution here, although, in hindsight, I could've
saved myself an additional hop by reading a bit closer.

What I did get out of this was a new search term (woohoo) - ifcfg.  The article
references the file: `/etc/sysconfig/network-scripts/ifcfg-enp0s3`.  I recognized
the enp0s3 part of that as likely being an interface name, so figured that I
would be looking for ifcfg-eth0 as that was the interface name I was working
with.

I checked the server and, sure enough, there was a file called
`/etc/sysconfig/network-scripts/ifcfg-eth0`.  I noted the line:
`NM_CONTROLLED="no"`.  Logic said (and I subsequently confirmed) that that meant
it was not being controlled by NetworkManager.

So I was on the right track; I did another quick search to get more information
specifically for my task and found [this
page](https://www.xmodulo.com/configure-static-dns-centos-fedora.html).

I went with method 2  here because I wanted to be sure that the DNS servers I
wanted would be set up so I added the following lines to the file:

```bash
DNS1="8.8.8.8"
DNS2="8.8.4.4"
```

I restarted the server and....`resolv.conf` was overwritten again.  I re-added the
two nameservers to resolv.conf so it would function properly and continued my
search.

## Revelation #2

After some time, I finally found the holy grail - [a random wiki that some
amazing person
maintains](https://kb.novaordis.com/index.php//etc/resolv.conf#Configure_DNS_via_.2Fetc.2Fsysconfig.2Fnetwork-scripts).

This really explained what I was seeing - although the ifcfg scripts had the
name servers added, NetworkManager was still trying to manage `resolv.conf` and
would clobber it.  Luckily for me, they also had a [wiki
article](https://kb.novaordis.com/index.php/NetworkManager_Configuration#.2Fetc.2Fresolv.conf_Processing_Mode)
on how to configure NetworkManager to not modify `/etc/resolv.conf`.

## Solution

In the end, it was a matter of two config changes

```bash
# /etc/sysconfig/network-scripts/ifcfg-eth0
DNS1="8.8.8.8"
DNS2="8.8.4.4"
```

```bash
# /etc/NetworkManager/NetworkManager.conf
[main]
...
dns=none
rc-manager=unmanaged
```

After restarting the server, I confirmed the resolv.conf maintained the two
nameservers and all was right in the world again.

I definitely owe Ovidiu (unsure their real name) one for saving me more of a
headache!
