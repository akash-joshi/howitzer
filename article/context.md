You're in your terminal, frantically Googling "how to kill process on port 3000" for the fifth time this week. Or maybe you're trying to remember the exact syntax for that Docker command you use once a month. Your coffee's cold, your patience is thin, and you're wondering why your CLI can't just read your mind. Enter Howitzer: my AI-powered tool that turns your frustrated mumbles into precise commands. No more memorizing arcane syntax or scouring man pages. Just ask, and execute.

The Problem
When I set out to build a CLI tool this year, I noticed a significant gap in the available resources. Most articles on building CLI tools were outdated, dating back to the era of Node.js 0.4. This lack of up-to-date information inspired me to create both a talk and content around building cross-OS compatible CLIs using Node.js.
Enter Howitzer
Howitzer is a simple yet powerful CLI tool that leverages the GPT API to provide users with command-line instructions based on natural language queries. Here's a quick demo of how it works:$ how to get my system specs
To get your system specs, you can use the following command:

system_profiler SPHardwareDataType

Do you want to run this command? (Y/n)



The tool takes your query, sends it to the GPT API, and returns a relevant command. You can then choose to execute the command directly from the CLI. Check out the YT video below to see it in action.
Building the Tool: Challenges and Solutions
1. TypeScript Woes
One of the first challenges I faced was dealing with TypeScript. While TypeScript offers great type safety, it often requires a build step, which I wanted to avoid for simplicity. The solution? ES modules.
ES modules have been supported in Node.js since 2019 and offer a great alternative to TypeScript for simple projects. They allow you to use import statements and even provide some type safety through JSDoc comments.
2. Adding Terminal Functionality
To transform our simple Node.js script into a full-fledged CLI tool, we need to add some terminal functionality. This is where libraries like commander and inquirer come in handy.
Here's a simple example of how to use commander:import { Command } from 'commander';

const program = new Command();

program
  .version('1.0.0')
  .description('An AI-powered CLI tool')
  .argument('<query>', 'The query to process')
  .action((query) => {
    // Process the query
  });

program.parse();



3. Making It a Proper CLI Tool
To make our tool installable and executable as a CLI command, we need to add a bin property to our package.json:{
  "bin": {
    "how": "index.mjs"
  }
}



However, this leads us to our next challenge...
4. The Shebang Problem
When we try to run our newly installed CLI tool, we might encounter an error where the system tries to execute our JavaScript file as a bash script. The solution? Add a shebang at the top of our entry file:#!/usr/bin/env node

// Rest of your code



This tells the system to use Node.js to execute the file.
5. Cross-OS Compatibility
To make our tool work across different operating systems, we need to consider the user's environment. We can use process.env.SHELL and process.platform to get information about the user's shell and OS:import { platform } from 'os';

const userShell = process.env.SHELL;
const userOS = platform();

// Use this information in your GPT prompt



6. Relative Imports in Installed Packages
When our tool is installed globally, relative imports can break. To solve this, we can use import.meta.url along with the path module:import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));



This allows us to reliably read files relative to our script, regardless of where it's installed.
Conclusion
Building a CLI tool in 2024 comes with its own set of challenges, but with the right approach, it's entirely doable. By leveraging ES modules, modern Node.js features, and a bit of creativity, we can create powerful tools that enhance our development workflows.
The key is to keep things simple, avoid unnecessary build steps, and always consider all of the devices your users might try to run the CLI from.

0:01
so yeah hi everyone and uh thanks for
0:04
coming to Manchester nor JS user group
0:06
today I'm kidding of course it's El um
0:09
thanks to to um Adam and Thomas doing
0:12
most of the organizing because I've been
0:13
away for a while so let's give them a
0:16
clap and um of course thanks to you guys
0:19
because it was a really nice day outside
0:22
but you all nerds decided to come here
0:23
anyways so yeah here we are uh so yeah I
0:27
wanted to talk about building an a based
0:30
CLI tool in 2024 um the AI bit there is
0:34
mainly for the hype but I want to talk
0:37
about building a CLI tool in 2024 the
0:39
problem I saw while trying to build a
0:41
CLI tool this year was that there aren't
0:44
a really there aren't that many good
0:45
articles online uh about building CLI
0:48
tools most of them are from like several
0:50
eons ago when it was like nodejs 0.4 or
0:53
something I guess so I decided to create
0:56
a talk around this and also try to
0:58
create content around this so we can try
1:00
to understand how we can build cross
1:03
compatible OS like cross OS compatible
1:07
clis using nodejs now and it's really
1:09
great at that so yeah um I am the
1:11
writing Dev uh on the Internet or the
1:14
writing Dev in most places including
1:16
Twitter so yeah why so why do why did I
1:20
want to build this well firstly um I was
1:22
experimenting with AI just when the uh
1:24
GPT API came out so yeah this is just a
1:27
GPT rapper in essence but um yeah I
1:30
think it's uh really cool to build
1:32
products around LMS nowadays because of
1:34
generative AIS and stuff you can uh
1:37
build products which are which can do
1:40
more I mean it sort of leads to
1:41
non-deterministic Computing in a way and
1:44
secondly um there's more than one way of
1:46
building interfaces so this is Ryan H
1:49
the creator of product hunt who
1:50
commented on one of the products there
1:52
saying that he's be he's interested in
1:54
Voice driven experiences and um yeah so
1:58
you see a lot of hype around that so
1:59
just by incorporating a different kind
2:01
of interface into your product you start
2:02
generating sort of ideas and interest
2:05
around your
2:06
product and um this was uh this was a
2:10
post or a tweet by a VC so take it with
2:12
a grain of salt across of course who
2:14
said that um UI Engineers will lose
2:17
their jobs now because you can just ask
2:18
Siri to do something and then it hooks
2:21
up into your app using an API to
2:24
directly execute the task so of course I
2:26
wanted to sort of go go at the back end
2:30
of thing building applications and try
2:31
to build something which is just CLI
2:33
driven for the start so what is the
2:35
thing I'll give a quick demo of uh how
2:38
it works and um yeah parts of this uh
2:42
yeah just a Content warning some of the
2:44
slides that I'm showing are light themed
2:47
like I'm using a light themed with my
2:48
code editor so please don't
2:51
complain and yeah so how does that work
2:54
so yeah originally it was called how but
2:56
I changed the name to how it there
2:57
because if you search for how CLI co-
2:58
pilot it would just show GitHub Scope
3:00
Pilot instead and um yeah so you can
3:04
basically ask questions to it in natural
3:06
language so you can ask something like
3:07
how do I get my system
3:11
specs and it will then call the GPT API
3:15
of course and it will give you the
3:16
command then it you can choose to run
3:19
the command which then gives you the
3:20
output there directly so instead of
3:22
having to memorize all of these
3:23
different unix commands you can just ask
3:25
the ca tool directly um another simple
3:28
thing you might want to do is like how
3:29
do I get the uh DNS info of the writing.
3:33
dev so I've Auto completed this already
3:36
so if I run that then um yeah it says
3:40
dig the writing. dev if I choose to run
3:41
this command then it uh gives the output
3:44
of the command directly so of course as
3:46
you can see it's a very simple app
3:47
originally it was less than 100 lines of
3:49
code but then I added some nice uh ux ux
3:52
around it which increased the size a
3:53
little bit but I'll try to simplify it
3:55
as much as I can so yeah uh that is the
3:59
actual tool and now um I want to go a
4:02
little bit about the problems and
4:03
solutions so how did I end up at this
4:06
phase of course um as you can see it's
4:08
just a simple command I say how and then
4:10
it automatically automatically runs it
4:12
in the back end so it's a proper CLI
4:14
tool but um doing this in nodejs a
4:16
little is a little bit tough so the
4:18
first problem is that oh I think it's on
4:21
a timer probably but yeah so the first
4:22
problem is that that I faced was that
4:24
typescript sucks I didn't want to write
4:27
build tooling around typescript so for
4:29
example how many ways are there to build
4:32
a new typescript project like b b use B
4:38
yeah I mean apart from bu there's
4:40
several like for example TS up there's
4:43
TS node there's um wheat there's parcel
4:47
I mean there's n number of ways you can
4:48
build the typescript project but there's
4:50
one thing common with all of them you
4:52
you're adding a build step so you're
4:54
adding complexity into your whole
4:55
project so instead of that I wanted the
4:59
ability to types but I didn't want to
5:01
have a build step so what I did was use
5:03
es modules instead if it's good enough
5:05
for swelt it's good enough for your
5:07
project so please move to es modules
5:09
instead of typescript to help improve
5:11
the developer experience around
5:14
it um es modules uh have been supported
5:17
in nodejs since 2019 actually and I'm
5:20
going to give a demo of how they
5:21
actually look like so uh don't be afraid
5:23
of pushing uh publishing a library to
5:26
npm which is just es modules only
5:30
um and yeah uh basically to start a I
5:33
mean we saw what it took to start out
5:36
with a typescript project but for ES
5:37
module since it's node native you can
5:39
just run npm in it y of course um now to
5:43
give you a quick demo of what the
5:45
application the first version of the
5:47
application actually looks like so
5:49
basically I mean I'm using the open a
5:52
SDK of course it's actually really good
5:54
it's an autogenerated SDK based on their
5:56
API so it's mostly up to date but they
5:58
haven't added GP 40 mini to it yet uh on
6:01
the type side so it's also sometimes
6:04
behind unless they actually run the uh
6:06
SDK generation process so um yeah a
6:09
quick explanation of what's actually
6:11
happening here um it's actually quite
6:14
straightforward um I'm initializing a
6:16
new client based on the open AI Library
6:18
um in this case it's just picking up the
6:21
en the API key from my environment
6:23
variables instead of explicitly passing
6:25
it in I'm generating a list of messages
6:28
here to pass to the llm so uh a role in
6:31
a message is basically like what context
6:33
is that message being sent in is it the
6:35
user is it the chatbot or is it like a
6:38
system prompt basically you're telling
6:39
the llm what you want to do so in this
6:41
case um this is a prompt that I built
6:44
using another llm of course because um
6:47
yeah llms are notoriously notoriously
6:49
difficult to give the right prompts to
6:51
so this basically gives the users uh
6:54
command line to the llm it gives a
6:56
negative prompt saying that ignore any
6:58
pleasantries or comment stuff like that
7:00
and then it also gives the users
7:02
operating system to it so uh it tries to
7:05
make it as um operating system
7:07
independent as possible and we are going
7:08
to go towards that and next um I'm
7:12
passing in the user prompt manually for
7:14
now so how can I get my system specs
7:16
that's what the question we asked before
7:17
was and I'm just passing it in here and
7:20
then um we just getting a completion
7:22
from the LM and then logging it so let's
7:25
see how this works um I can simply do
7:27
node slide one index. MJS um yeah and
7:30
that it of course gives us the command
7:33
here in the content uh file uh content
7:36
property which we can use and um sorry I
7:39
miss the I missed the most important
7:40
part which is the es modules bit so um
7:43
basically in es modules you can import
7:45
any types from a typescript file so in
7:49
this case um you have to do I mean to
7:52
import a types typescript file as as an
7:55
allias you have to do something funky
7:57
you have to do a type def then use an
7:59
import so I'm using import open. open do
8:02
chat completion message but I'm alling
8:04
it to chat message and then using it to
8:06
add uh type safety to the messages array
8:08
here and um I mean I can quickly show
8:11
you how it autocompletes so it autoc
8:14
completes to basically all of the
8:15
parameters being imported from openi so
8:18
in this way you can add type safety to
8:20
your esm component without having to do
8:23
extra bits and since it's since we are
8:25
using Imports and not requires it also
8:27
automatically Imports the types here so
8:29
if you add an import uh if you are using
8:32
uh an esm import then it should
8:34
automatically import the types without
8:36
having to explicitly do that but in this
8:38
case of course I'm explicitly explicitly
8:40
typing this because I want to ensure
8:42
that the messages array here uh has the
8:44
type safety and of course if you try to
8:48
add new things then it tries to
8:49
autocomplete it for you so you can add a
8:51
new role with a specific uh yeah role
8:54
name and stuff like that so yeah that's
8:56
the main benefit of esm and why I chose
8:58
to go with that uh to a void a
9:00
step so uh the next problem is that uh
9:04
yeah oops I'm going this is going away
9:07
to PA so yeah uh how do I add the
9:10
terminal bits so you have your simple uh
9:12
application right now with just uh uh
9:15
you know it's it's a node script right
9:17
it's not doing anything special it's not
9:19
exactly a CLI tool so how do you add the
9:21
terminal bits like reading from the
9:22
command line or reading user input and
9:24
stuff like that so for doing that um you
9:27
use certain tools
9:30
uh certain libraries uh just like the
9:32
JavaScript ecosystem everything is a
9:34
library npm install away so there's
9:36
commander and Inquirer two tools which
9:38
you can use Commander is used for um
9:41
creating a nice uh C CLI experience
9:44
around your app so you can do things
9:46
like create new commands you
9:48
can um yeah you can basically add new
9:52
commands except certain parameters make
9:54
certain parameters optional stuff like
9:55
that and Inquirer allows you to build a
9:58
nice user interface like a prompt
9:59
interface and stuff like that uh uh
10:01
which I had done initially at the start
10:03
here uh with my own tool so um in this
10:08
case let's have a look at how it
10:09
actually works so uh we'll only look at
10:13
Commander for now uh to initialize a new
10:15
CLI uh using Commander you initialize a
10:18
program I mean you firstly import
10:20
command from command Commander which is
10:22
its Base Class you initialize it and
10:24
then you can pass it all of the
10:26
attributes that you need to pass in here
10:27
so in here I'm passing the version of
10:29
the CLI tool and its description um but
10:32
if you integrate it into your product so
10:34
it would look something like this where
10:37
you are using program. argument so uh
10:40
this is the Syntax for adding a new uh
10:43
sort of command to your tool so you you
10:46
can add an argument which is a query you
10:48
add a description to that query and then
10:50
you uh add in an action which happens
10:52
when that uh query gets passed in so uh
10:55
if if someone misses a query it
10:57
automatically also does input handling
10:59
for you so it's sort of like Zod but for
11:01
your CLI and um I'll give a quick demo
11:03
of how this works as well so uh we can
11:06
do something like uh no C2
11:10
SL final. MJS in this case I'm taking
11:14
the query from the CLI though so let's
11:17
uh see what happens if I don't pass in
11:18
the query I think it should not it will
11:21
still not fail in this case because an
11:23
empty string will be passed but there's
11:24
only one way to find out so okay yeah it
11:27
actually errors out so it does input
11:29
value ation for us mainly it allows us
11:31
to avoid passing in the wrong query and
11:33
I think the help command should work as
11:35
well yeah so if you run the help command
11:38
then it prints out all of the things
11:40
that you had passed in in the program so
11:41
commander allows I mean it just it's
11:44
just a nice experience to work with
11:45
while building a new
11:47
CLI and yeah so how would this actually
11:50
work if I manually pass in a command
11:51
here so I can ask something like list
11:53
files in current directory maybe I mean
11:56
of course we all know it's LS but we
11:58
want to make sure that or tool is
12:00
actually working so yeah in this case it
12:03
uh it returns LS I don't know what the
12:05
extra stuff being passed in there is but
12:07
it's mainly because our prompt is quite
12:09
simple right now uh but we can fix that
12:12
later so right now yeah we've got a CLI
12:14
tool it accepts a parameter and based on
12:16
that it's giving some form of output but
12:19
uh there's certain things missing here
12:21
of course
12:22
so um yeah let's try to deploy this uh
12:27
this is something this is just a node
12:28
script right now right we haven't yet
12:30
installed this to our computer using npm
12:33
yet so let's try to do that and see what
12:35
happens
12:37
so um what I can do is um yeah in this
12:41
case in index.js in slide three here
12:44
it's the same file that we were seeing
12:46
previously um I will try to install that
12:48
now so uh it's actually very simp it's
12:52
so to convert an npn package into um a
12:55
CLI is very simple you just add a bin
12:58
property to your package.json and then
13:02
you add the name of the command that you
13:04
want to use and then you add a entry
13:05
file for that so in this case the
13:07
command I want to use is how and the
13:09
entry I want to use is maybe slide three
13:11
do slide 3/ index. MJS and then um yeah
13:15
let's try to install this globally so if
13:17
I do npm in
13:18
IJ uh I think that goes
13:21
before um yeah I just need to pseudo
13:24
that and then add my password
13:27
in so so now if I try to run how uh do
13:32
I uh maybe list my files then okay we
13:38
are actually getting a really random
13:40
error which is the third problem that we
13:42
are facing that
13:45
uh yeah this is being treated as bash so
13:49
as you can see here um the CLI itself
13:52
while trying to run that binary is
13:53
trying to run the Javascript file as a
13:55
bash file uh or like a shell script file
13:58
and so it
14:00
returns a random image magic error in
14:02
this case so how do we make it treat
14:04
JavaScript files as JavaScript files
14:06
while running them from the CLI rather
14:08
than you know trying to pass it via bash
14:11
or zsh or
14:12
whatever so the solution is to add a
14:15
shabang uh so the the shabang that we
14:19
add here is um basically a shabang user
14:23
bin n node so it uses the users um uh
14:27
node environment to run that specific
14:29
file and this is a very simple solution
14:31
so it just adds a new line in there line
14:34
up there and now it should run for us so
14:37
to quickly test this out uh sorry do you
14:39
want me to go there okay cool so yeah uh
14:45
to quickly test this out we can npm
14:47
install that again and now if we run the
14:49
how command then this time it works
14:52
because um the your your command line uh
14:59
emulator I guess common line emulator
15:01
knows how to treat that file so it knows
15:03
to treat that file as a nodejs file and
15:06
uh that's why it's able to work fine
15:07
this time I'm sure that I use the wrong
15:09
terminology there and someone will
15:11
correct me
15:12
later um and problem four so how to make
15:15
this cross OS compatible so right now
15:18
you saw that we are injecting into the
15:19
prompt that it has to be uh like it has
15:22
to
15:23
return data uh in in zsh and for a Mac
15:27
OS device but we can for example use
15:30
something else like for example uh I
15:32
might want to use a Windows laptop and
15:34
Powershell or a Windows laptop and Bash
15:36
as well because that's possible right so
15:39
um the way you would do that is read the
15:42
users's
15:43
environment um in JavaScript it's super
15:46
simple to do that you can use process.
15:48
env. shell uh which allows you to import
15:52
uh the user's current execution
15:54
environment so would that might be
15:57
Powershell or bash batch scripts or
15:59
whatever and then uh you can get their
16:02
plat that get their operating system
16:04
from from platform here so if I
16:06
highlight on platform it shows a list of
16:08
all of the possible values here and if I
16:10
highlight on shell I think shell itself
16:12
is a string because there are a lot of
16:13
environments out there and um
16:16
interestingly enough um this is super
16:18
useful if you're trying to execute
16:20
custom code in a users's environment so
16:23
in my case since I'm executing commands
16:25
I want to use the right tool I want to
16:27
use zsh or bash or whatever the user is
16:28
executing the command from and not any
16:31
other random tool which might not be
16:32
present on the user's operating
16:35
system so if we modify the uh the
16:39
command using that then we simply inject
16:41
those variables here so after importing
16:43
shell we can just import shells so we
16:45
say you an a assistant that only
16:47
responds with shell command line
16:48
instructions for the OS platform and
16:51
then using that our prompt then is
16:54
automatically customized to whatever
16:56
operating system and uh shell
16:58
environment that the user is running the
17:00
prompt in so of course I'm not going to
17:02
run this one again because it's quite
17:05
straightforward and um yeah uh finally
17:10
uh so relative Imports are sort of bed
17:13
and um this is a problem which isn't
17:16
exactly unique to um CLI tools it's
17:19
Unique to anything which is installed in
17:21
your node modules but wants to access a
17:23
file which is which might be present in
17:25
a relative path uh as U in
17:29
relative I guess relative to the node
17:31
mod node module itself so um I'll
17:34
explain how so the ideal solution this
17:37
to this would be to use some path magic
17:39
so you would be able to use underscore
17:40
uncore Dame and stuff like that to get
17:42
the current directory that the file is
17:44
being currently called from and in this
17:47
case I'll show you why it might not work
17:49
in es modules so es for ES modu so
17:54
firstly let's try to use uh relative
17:56
Imports directly for example uh if I
17:58
want want to uh instead of having to
18:01
read the data twice so instead of having
18:04
to write what the users version was and
18:06
what the uh description of the packages
18:09
twice once in the index. MJS file here
18:11
and once in package.json I can D
18:13
duplicate it by reading it from
18:15
package.json directly so um you might
18:18
think that you can use import package
18:20
from package.json directly but es
18:22
modules kind of makes that difficult but
18:24
that's beyond the scope of this talk um
18:26
another solution you might think of is
18:27
using Json pars and then using read file
18:30
sync so that's what we're going to try
18:32
to do right now and then I'll explain
18:34
why that might not work so um once we do
18:37
that uh let's try to
18:39
install it first so um yeah I get I go
18:43
to package.json again and then I do
18:47
slide 5/ index.
18:50
MJS and then I can do pseudo npm install
18:53
dot globally and then if I try to run
18:56
how then it should throw me an error oh
18:59
it actually works I think that's because
19:01
I'm executing from the context uh of the
19:03
root directory which already has a
19:05
package.json here so relative to my
19:07
current path I do have a package.json
19:08
but if I was in a different file so if I
19:10
went a directory up and if I Tred to run
19:12
that command again I think it should
19:14
throw the error now so yes now in this
19:16
case it says that no such file or
19:18
directory open package.json because as
19:20
you can see here it's trying to read it
19:22
from relative to the current
19:24
path so again um if you've used if you
19:28
worked with node JS in the past you
19:29
would assume that something like
19:30
underscore uncore D name would work so
19:34
um let's try to do that so I would to
19:37
something like underscore Dame which
19:41
actually Returns the current directory
19:42
name when you are uh using proper nodejs
19:45
without es modules I guess and if I try
19:47
to install this now um I'll have to CD
19:50
into the directory again and then nbm
19:52
install this go up a directory again and
19:56
try to oops sorry run that command so in
20:00
this case yeah it says their name is not
20:03
defined in es module scope so we are
20:05
sort of shooting ourselves in the foot
20:06
here by using ES modules a little bit
20:08
because a lot of the things that you
20:09
just took for granted in nodejs are no
20:11
longer present so the solution for this
20:14
is
20:15
actually uh using import. met. URL
20:18
instead so uh I like to think that es
20:21
modules treats every file you're using
20:24
like a browser Javascript file so in
20:26
that case every file itself has a URL uh
20:29
in this case the URL for the file would
20:31
be the file path which points to that fi
20:34
particular file and you can use the uh
20:38
path uh path uh path library from nodejs
20:42
itself to convert that URL path into uh
20:45
file path so file URI to path and then
20:48
you can convert that into a directory
20:50
name instead and if you use that then it
20:52
works correctly this time and um I used
20:55
the double Dots here because we want to
20:57
go One Directory up from from the from
21:00
the from this directory so um because
21:04
the package.json file of course exists
21:06
in the root directory and not the slide
21:07
five directory so if I go back to uh
21:10
package.json change this to final. MJS
21:13
and then um npm
21:17
install uh yeah I need to go here npm
21:20
install and then if I try to run the how
21:24
command by going
21:25
up uh
21:28
yeah this time this time it works fine
21:31
even though it's in a different
21:32
directory because it can it can just
21:33
write uh it can just read from the
21:36
relative path which we have uh generated
21:39
there so um yeah um I think that was
21:44
pretty much my talk so thank you I
21:46
wanted to give a very simple
21:47
introduction to uh how to build CLI so
21:52
[Applause]
21:55
thanks yeah what are these definitions
21:59
in
22:01
comments yeah so uh sorry for not
22:04
explaining it well uh those are
22:06
basically JS docs type definitions so
22:08
instead of having to use typescript type
22:10
definitions which would you would use if
22:12
you were using typescript you can now
22:13
use JS do type definitions which are
22:16
which support all of typescripts uh type
22:19
definitions as well so instead of having
22:20
to use a build tool to convert
22:22
typescript files into JavaScript files
22:24
you can now use JavaScript files
22:26
directly with JS talk comments inside of
22:28
them which
22:29
Define the types of the variables that
22:31
you want to use yeah but this is just
22:33
the just
22:35
doation uh or does it actually check the
22:38
types yeah yeah it actually checks the
22:39
types so you can use TSC to type check
22:42
JS doc comments as well okay but then
22:44
you use TC so if you don't use TSC yeah
22:48
you don't get type checks but you don't
22:49
need to use a build tool so that's the
22:51
main advantage yes so you okay so you
22:54
don't use TSC so you didn't check the
22:56
types You just hav't defined but you
22:58
could check them see you want yeah yeah
23:01
exactly it's brilliant yeah thanks thank
23:05
you so much yeah no
23:08
worri question couple questions actually
23:10
yeah you know the um when you moved One
23:14
Directory outside of where the program
23:17
was installed right and you run the
23:19
command worked now if you move two
23:21
directories outside will work yeah of
23:24
course you can uh navigate every
23:25
anywhere and it will still work because
23:28
um I mean I'll explain the reason why it
23:30
will still work and then I'll show you
23:32
how it works so the reason why it would
23:34
work is that um we are
23:37
sorry G blame is picking up there so
23:40
yeah um a.a. URL points to this specific
23:43
file and whatever context this file is
23:45
running in U be it like an npm module or
23:48
locally via node jscript or whatever
23:51
this uh value will always point to
23:53
wherever this file is located and so we
23:56
are converting that U Pi file UI to um a
24:00
path instead which is then which is then
24:03
allowing us to do this which points to
24:05
the actual package.json file and um now
24:08
I can yeah so I can go anywhere and I'll
24:11
still if I run the how command it will
24:13
still point to the right file
24:16
there one question know yeah assum don't
24:21
have system yeah right how your I mean
24:26
how does Bank help you um yeah so in
24:29
that case it will definitely be a
24:30
problem so this package uh having a
24:33
package do package.json and installing a
24:35
library using npm install assumes that
24:38
you have got nodejs already installed in
24:40
your machine so that's a big assumption
24:42
that we're making here of course we
24:43
would use something like goang if we
24:46
wanted to you know make it independent
24:48
of having nodejs installed I
24:52
guess yeah seem if you are Comm what the
24:58
tool tips you might miss are what
25:01
commands you might not remember if you
25:04
wanted to actually
25:07
know one
25:08
ofes would you be able to ask to do that
25:13
would it just give
25:15
you
25:20
response um so it should be able to do
25:23
that so I can ask it for example um well
25:26
let's install my actual Tool uh uh so uh
25:30
yeah if I do that it should install it
25:33
globally and now I can do something like
25:35
if I go to the directory first um how do
25:39
I create a python
25:43
server file and save it locally maybe so
25:47
that it knows that I actually want to
25:48
save that as well then um I mean again
25:51
this isn't something that my tool is
25:53
doing some that this is something that
25:55
um uh the GPT API is returning of course
25:59
so if it it returns this command let's
26:02
try to execute it so it hasn't returned
26:04
anything yet but um yeah we see
26:07
server.py so it
26:09
created server.py
26:12
here somewhere yeah so it uh it created
26:17
some output and then pasted it to
26:19
server.py so if I do catch server.py
26:21
then yeah it still has that because you
26:24
can do it via unix commands right so as
26:25
long as you can do it VI unix commands
26:27
or power commands or whatever the CLI
26:30
tool should be able to help you with
26:32
that yeah any other
26:36
questions nope okay yeah oh sorry go on
26:39
how much does it cost uh it's actually
26:42
very cheap so GPT 4 o mini I think it's
26:45
the cheapest tool out there it costs
26:47
like
26:49
005 per token or something I mean of
26:51
course people can correct me if I'm
26:53
wrong but I think it's like super cheap
26:55
I've put in $10 in I would say like very
26:59
early this year maybe February or
27:01
something but I haven't still run out
27:03
just by building this tool and working
27:05
on other site projects
27:12
[Music]
27:21
ofs
27:23
okay yeah yeah so it's super cheap and
27:26
but I think the gp2 4 mini is performs
27:28
really bad as compared to GPD 4
27:30
especially if you're trying to do stuff
27:31
like run commands successfully on your
27:33
command line I
27:35
think I did some comparison they are
27:38
very comparable and it's like three to
27:42
five times faster yeah yeah it's
27:44
definitely faster outut price from GPT
27:47
for is
27:49
like
27:51
yeah usually you put more inside and
27:54
take
27:55
out makes sense yeah um so yeah uh
27:59
that's my website reach out to me if you
28:01
want to and I'm available for
28:03
independent Consulting on any AI
28:04
projects you might have so thank
28:08
[Applause]
28:17
you that cones
28:20
El
28:25
tonight I'm just waiting for you
28:29
here