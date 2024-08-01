(function () {const gcd = (a, b)=>{
    let r = Math.min(a, b);
    while(r > 0){
        if (a % r === 0 && b % r === 0) {
            break;
        }
        r -= 1;
    }
    return r;
};
const all_multiple_numbers_map = new Map();
const all_multiple_numbers = (n)=>{
    if (all_multiple_numbers_map.has(n)) return all_multiple_numbers_map.get(n);
    const r = [];
    const max_div = Math.floor(Math.sqrt(n));
    for(let i = 1; i <= max_div; ++i){
        if (gcd(i, n) === i) {
            r.push([
                i,
                n / i
            ]);
            if (i < n / i) r.push([
                n / i,
                i
            ]);
        }
    }
    all_multiple_numbers_map.set(n, r);
    return r;
};
const repeat = (n, times)=>{
    const arr = [];
    for(let i = 0; i < times; ++i)arr.push(n());
    return arr;
};
const same_loc = (a, b)=>{
    return a.x === b.x && a.y === b.y;
};
let t = 0;
let max_status = [];
class QuestionMaze {
    question;
    debug = false;
    size;
    maze;
    maze_status = [];
    status = [];
    constructor(question){
        this.question = question;
        this.size = question.size;
        this.maze = repeat(()=>repeat(()=>0, this.size), this.size);
        question.maze.forEach((loc)=>{
            const [x, y, n] = loc;
            this.maze[x][y] = n;
        });
    }
    clone() {
        const copy = new QuestionMaze(this.question);
        copy.maze_status = this.maze_status.map((i)=>[
                ...i
            ]);
        copy.status = this.status.map((i)=>({
                ...i
            }));
        return copy;
    }
    print() {
        this.maze.forEach((line)=>{
            console.log([
                `${line.map((i)=>i === 0 ? '0' : i).join(' ')}`
            ]);
        });
    }
    print_status() {
        this.maze_status.forEach((line)=>{
            console.log([
                `${line.map((i)=>i === 0 ? '0' : i).join(' ')}`
            ]);
        });
    }
    answered(i, j) {
        return this.status.some((rect)=>same_loc({
                x: i,
                y: j
            }, rect.np));
    }
    is_valid(point) {
        const { x, y } = point;
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
    is_area_valid(ls, re, np) {
        for(let i = ls.x; i <= re.x; ++i){
            for(let j = ls.y; j <= re.y; ++j){
                if (i === np.x && j === np.y) continue;
                if (!this.is_valid({
                    x: i,
                    y: j
                })) return false;
                if (this.maze_status[i][j] && this.maze_status[i][j] !== this.maze[np.x][np.y]) return false;
            }
        }
        return true;
    }
    walk(np, choice) {
        const rects = [];
        for(let i = np.x; i >= np.x - choice[0] + 1; --i){
            for(let j = np.y; j >= np.y - choice[1] + 1; --j){
                const ls = {
                    x: i,
                    y: j
                };
                const re = {
                    x: i + choice[0] - 1,
                    y: j + choice[1] - 1
                };
                if (!this.is_valid(ls) || !this.is_valid(re)) continue;
                if (!this.is_area_valid(ls, re, np)) continue;
                rects.push({
                    np,
                    ls,
                    re
                });
            }
        }
        return rects;
    }
    flip(rect) {
        for(let x = rect.ls.x; x <= rect.re.x; ++x){
            for(let y = rect.ls.y; y <= rect.re.y; ++y){
                if (!this.maze_status[x][y]) this.maze_status[x][y] = -1;
            }
        }
    }
    flip_reverse(rect) {
        for(let x = rect.ls.x; x <= rect.re.x; ++x){
            for(let y = rect.ls.y; y <= rect.re.y; ++y){
                if (this.maze_status[x][y] === -1) this.maze_status[x][y] = 0;
            }
        }
    }
    has_block_dead() {
        for(let i = 0; i < this.size; ++i){
            for(let j = 0; j < this.size; ++j){
                if (this.maze_status[i][j] === 0) {
                    if (this.is_block_dead({
                        x: i,
                        y: j
                    })) return true;
                }
            }
        }
        return false;
    }
    is_area_empty(point, ls, re) {
        const [px, py] = point;
        for(let i = ls.x; i <= re.x; ++i){
            for(let j = ls.y; j <= re.y; ++j){
                if (i === px && j === py) continue;
                if (this.maze_status[i][j] !== 0) return false;
            }
        }
        return true;
    }
    is_last_line(i) {
        return i === this.question.maze[this.question.maze.length - 1][0];
    }
    is_block_dead(loc) {
        const active_points = this.question.maze.slice(this.status.length);
        for (const point of active_points){
            const [px, py, n] = point;
            const { x, y } = loc;
            const x_dis = Math.abs(x - px + 1);
            const y_dis = Math.abs(y - py + 1);
            if (x_dis * y_dis > n) continue;
            if (this.is_area_empty(point, {
                x: Math.min(x, px),
                y: Math.min(y, py)
            }, {
                x: Math.max(x, px),
                y: Math.max(y, py)
            })) return false;
        }
        return true;
    }
    is_full() {
        let is_full = true;
        for(let i = 0; i < this.size; ++i){
            for(let j = 0; j < this.size; ++j){
                if (this.debug) {
                    if (this.maze_status[i][j] === 0) console.log(i, j);
                }
                is_full = is_full && this.maze_status[i][j] !== 0;
            }
        }
        return is_full;
    }
    solve(i = -1) {
        t += 1;
        if (i === -1) {
            this.maze_status = JSON.parse(JSON.stringify(this.maze));
            i = 0;
        }
        let j = -1;
        while(i < this.size){
            j = this.maze[i].findIndex((n, idx)=>{
                return n && !this.answered(i, idx);
            });
            if (j === -1) {
                i += 1;
            } else {
                break;
            }
        }
        if (j === -1) return null;
        const n = this.maze[i][j];
        const all_choices = all_multiple_numbers(n);
        for (const choice of all_choices){
            const cursor = this.status.length;
            const np = {
                x: i,
                y: j
            };
            const rects = this.walk(np, choice);
            for (const rect of rects){
                this.status.push(rect);
                this.flip(rect);
                if (this.is_last_line(i) && this.is_full()) {
                    return this.status;
                }
                const isRightAnswer = this.has_block_dead() ? null : this.clone().solve(i);
                if (!isRightAnswer) {
                    this.status.splice(cursor, 1);
                    this.flip_reverse(rect);
                } else return isRightAnswer;
            }
        }
        if (this.status.length > max_status.length) {
            max_status = this.status;
        }
        return null;
    }
}
const getMazeElement = ()=>document.getElementsByClassName('overlay')[0];
const questionParser = (el)=>{
    if (!el) el = getMazeElement();
    const blocks = Array.from(el.children);
    const size = Math.sqrt(blocks.length);
    const level = size === 5 ? 1 : size === 10 ? 2 : size === 20 ? 3 : size === 30 ? 4 : size === 40 ? 5 : 6;
    const question = {
        level,
        size,
        maze: []
    };
    for(const blockIdx in blocks){
        const innerNumber = Number(blocks[blockIdx].innerHTML);
        if (isNaN(innerNumber) || !innerNumber) continue;
        const i = Math.floor(Number(blockIdx) / size);
        const j = Number(blockIdx) % size;
        question.maze.push([
            i,
            j,
            innerNumber
        ]);
    }
    return question;
};
const loc2Idx = (loc, size)=>{
    const { x, y } = loc;
    return x * size + y;
};
const answerDispatch = (question, answers)=>{
    const mazeEl = getMazeElement();
    if (!answers) {
        console.warn('failed');
        return;
    }
    answers.forEach(({ ls, re }, i)=>{
        const leftIndex = loc2Idx(ls, question.size);
        const rightIndex = loc2Idx(re, question.size);
        const leftEl = mazeEl.children[leftIndex];
        const rightEl = mazeEl.children[rightIndex];
        setTimeout(()=>{
            leftEl.dispatchEvent(new MouseEvent('mousedown'));
            rightEl.dispatchEvent(new MouseEvent('mousemove'));
            rightEl.dispatchEvent(new MouseEvent('mouseup'));
        }, 100 * i);
    });
};
const clickStart = (only_parse = false)=>{
    try {
        const startBtn = document.getElementsByClassName('start-game-container')[0].getElementsByTagName('button')[0];
        startBtn.click();
    } catch (e) {
        console.log('game started');
    }
    setTimeout(()=>{
        window.currentQuestion = questionParser();
        if (only_parse) return;
        const startT = Date.now();
        console.log('solving');
        window.answer = new QuestionMaze(window.currentQuestion).solve();
        console.log('solved in', Date.now() - startT, 'ms');
        console.log('start writing answer!');
        answerDispatch(window.currentQuestion, window.answer);
    }, 100);
};
const addButton = ()=>{
    if (typeof window === 'undefined') {
        console.log('no browser');
        return;
    }
    if (window.location.hostname.includes('shikakuofthe')) {
        const actionContainer = document.getElementsByClassName('actions')[0];
        const btn = document.createElement('button');
        btn.className = 'button';
        btn.style.background = '#ff6633';
        btn.style.width = '100%';
        btn.innerText = 'Answer';
        btn.addEventListener('click', ()=>{
            clickStart();
        });
        actionContainer.appendChild(btn);
    } else {
        console.log('no support website');
    }
};
const prepare = ()=>{
    window.start = clickStart;
    window.onload = ()=>{
        setTimeout(()=>{
            addButton();
        }, 500);
    };
    console.log("loaded, use `window.start()` and the question solved");
};
if (typeof window !== 'undefined') {
    prepare();
}
})()