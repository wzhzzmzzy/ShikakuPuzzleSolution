# ShikakuPuzzleSolution

A noob solution for [Daily Shikaku Puzzle](https://shikakuofthe.day/master) writen by Deno.

## Usage

```
deno run -A ./build.ts
```

- Copy `./dist/bundle.js` to your TemperMonkey plugin
- Open Puzzle website
- Wait for a few seconds, *Answer* Button will be attached in the `Clear All / Undo` actions line
- Click *Answer* to get the Answer (if at Master level, Your website may be stucked for a while)

### Cannot see *Answer* Button?

- F12 to open web console
- use `window.start()` to start the game

## Performance

![image](https://github.com/user-attachments/assets/e507549f-e57b-4b3f-bb7c-592fd6e88062)

- Master: about 1-5 min
- Expert / Hard / Medium: less than 10 s
- Eazy: about 1 s
