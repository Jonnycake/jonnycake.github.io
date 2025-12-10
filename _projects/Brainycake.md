---
title: Brainycake
date: 2015-11-13

end_date: 2018-04-07

github_link: https://github.com/Jonnycake/Brainycake
#demo_link: 

categories: [C, Interpreter, Transpiler]
---
### Background

I went to college for a couple of semesters and one of my classes was an
Algorithms class.  The professor assigned us to write a command-line application
that would print out a diamond with a user-specified height.  He said we could
write it in any language that we wanted.

I had just written the exact same program in my C++ class so I considered using
that, but decided to have some fun and write it in
[Brainfuck](https://esolangs.org/wiki/Brainfuck).  The core logic wasn't too
bad, but outputting long strings (for prompts) sucks so I made this language to
make that less painful.

_Note: You can check out the actual diamond implementation here:
[diamond.bc](https://github.com/Jonnycake/Brainycake/blob/master/tests/diamond.bc)_

### Language Design

As I got more into the project, one of the things that kept me interested was
coming up with new functionality and intuitive ways to represent it.  In doing so,
it definitely strayed from the heart of Brainfuck, but it was fun to experiment
none-the-less.

### Transpiling

I also experimented with the idea of a compiler that would translate the raw
Brainycake code into C, then compile it using GCC.  I didn't quite finish the
implementation for some of the more advanced operators, but it works for
standard Brainfuck.

### Final Thoughts

There's not much more I can really say about this project - it was just a fun toy
project.  If I get the chance, I may revisit it in the future to make some more
expansions.
