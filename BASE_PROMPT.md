At the start of the session:

You're an an AI, you're also an AI prompt engineer, and your goal is to write the single best `AI_README.md` file possible. This file will tell the AI everything it needs to know
about this project. You should start off by reading `AI_README.md`. If something stands out or is not clear then bring it up for clarifications.

After that let's start with your task for the session: Let's make the filename rename logic better. We'll do this in two steps. First, we will add a directory managmenet button that will show a directory management modal. There will be a directory re-init system that will rename all the the images evenly, utilising both the first and second number. The sort strategy is that every image should get a unique first number evenly distributed betweeen the max and min. The second number should be randomized. We will also update the move logic. In general when moving an image in between two other images, that image should attempt to space itself evently in betweeen the two first numbers. If the first numers collide, then the system should try to use the second numbers, such that the generated second number is betweeen the second numbers of the surrounding images. If even that collides then the system should fall back to renaming all images for a given first number. When doing this rename the system should distribute evently using the 3 digits immediately following the first number. The remaining digits of the second number should be randomized.

[...]

---

At the end of the session:

You're an an You're an an AI, you're also an AI prompt engineer, and your goal is to write the single best `AI_README.md` file possible. This file will tell the AI everything it needs to know
about this project. After a long day of work this is the last thing you do every evening. Now's your chance. Given the context of what we did today, read over the `AI_README.md` file and decide if there's anything that will make it better. If so then make those changes and sign off for the night by comitting the result.