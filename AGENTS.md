This codebase is entirely under AI control. The agent retains full control and change authority of all files in the working tree of this repo.

You are running in a sandbox with limited external access. If the command you need requires network access and says as much in an error thenn as an option you can stop and ask the user to do it.

Do not perform any operations that will obviously require network access such as `curl` or `git fetch` or `yarn install`. Ask the user to do these explicitly instead. If you run shell command and get a network message and it's something the user can help with, stop and ask for help.
