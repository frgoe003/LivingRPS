window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000 / 30);
        };
})();
// DOM References
canvas = document.getElementById('canvas');
attraction = document.getElementById("attraction");
repulsion = document.getElementById("repulsion");
friction = document.getElementById("friction");
attLabel = document.getElementById("attLabel");
repLabel = document.getElementById("repLabel");
fricLabel = document.getElementById("fricLabel");

// Assets
scissor_img = new Image();
scissor_img.src = 'assets/scissor.png';
rock_img = new Image();
rock_img.src = 'assets/rock.png';
paper_img = new Image();
paper_img.src = 'assets/paper.png';
paper_aud = new Audio('assets/paper_aud.mp3');
scissor_aud = new Audio('assets/scissor_aud.mp3');
rock_aud = new Audio('assets/rock_aud.mp3');


console.log(document.getElementById("test").offsetWidth);
// vars
canvas.width = document.getElementById("canvasWrapper").offsetWidth*0.8;
canvas.height = canvas.width*(16/9)*0.8;
var ctx = canvas.getContext('2d');
W = canvas.width;
H = canvas.height;
colorTheme = ["#ffe82a","#22c4f2",'#f44336'] //yellow, blue, red
objs = [];

// RPS object def. 
class RPS {
    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.vx = Math.random()-0.5;
      this.vy = Math.random()-0.5;
      this.r = r;
      if (getSelectedRadio()){
        this.type = getSelectedRadio();
      }
      else{
        this.type = Math.floor(Math.random() * 3 + 1);
      }
      this.updated = false;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.hypot(dx, dy);
    }
    draw = function() {
        ctx.beginPath();
        if (this.type==1){
            ctx.drawImage(rock_img, this.x-25/2, this.y-25/2,25,25);
        }
        else if (this.type==2) {
            ctx.drawImage(scissor_img, this.x-25/2, this.y-25/2,25,25);
        }
        else {
            ctx.drawImage(paper_img, this.x-25/2, this.y-25/2,25,25);
        }
        ctx.stroke();
    }
}

// startup 
function init(){
    animloop();
}

// Main loop
function animloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    requestAnimFrame(animloop);
}

//update canvas
function update(){
    for (var i = 0; i < objs.length; i++) {
        p = objs[i];
        p.x += p.vx;
        p.y += p.vy;
    if (p.x + p.r > W) {
        p.vx *=-0.2; 
        p.x = W-p.r;
    }
    else if (p.x - p.r < 0) {
        p.vx *=-0.2;
        p.x = p.r;
    }
    if (p.y + p.r > H) {
        p.vy *=-.2; 
        p.y = H-p.r;
    }
    else if (p.y - p.r < 0) {
        p.vy *=-.2;
        p.y = p.r;
    }

    for (var j = 0; j < objs.length; j++) {
        p2 = objs[j];
        if (i==j){continue}
        collision(p, p2);
    }
    p.x += (Math.random()-0.5) * 2;
    p.y += (Math.random()-0.5) * 2;
    attract(p);
}
}

// draw function
function draw() {
    for (var i = 0; i < objs.length; i++) {
        p = objs[i];
        p.draw();
    }
}

// Mouse click inside canvas
canvas.onmouseup = function(e) {
    var pos = getMousePos(canvas, e);
    newRPS = new RPS(pos.x,pos.y,12);
    newRPS.draw();
    objs.push(newRPS);

    console.log(pos,newRPS.type); //debugging
    getSelectedRadio()
    update()
}	
// Mouse move inside canvas
canvas.addEventListener('mousemove', function(e) {
    var pos = getMousePos(canvas, e);
}, false);

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

// Collision detection between to RPS objects
function collision(p1,p2) {
    dX = p1.x - p2.x;
    dY = p1.y - p2.y;
    dist = Math.sqrt(dX**2+dY**2)
    minDist = p1.r*2
    if (dist<=minDist && p1.type!=p2.type){
        switch (p1.type){
            case 1: 
                if (p2.type==2){
                    p2.type = 1;
                    playAudio(1);
                }
                else{
                    p1.type = 3;
                    playAudio(3);
                }
                break;
            case 2:
                if (p2.type==1){
                    p1.type = 1;
                    playAudio(1);
                }
                else{
                    p2.type = 2;
                    playAudio(2);
                }
                break;
            case 3: 
                if (p2.type==2){
                    p1.type = 2;
                    playAudio(2);
                }
                else{
                    p2.type = 3;
                    playAudio(3);
                }
                break;
        }
        p1.vx = (Math.random()-0.5)/2;
        p1.vy = (Math.random()-0.5)/2;
        p2.vx = (Math.random()-0.5)/2;
        p2.vy = (Math.random()-0.5)/2;
    }
}

// vx and vy update using repulsion and attraction mechanic
function attract(p1){
    arr = findNearest(p1);
    lk = arr[0]; uk = arr[1];
    dX_lk = 0;
    dY_lk = 0;
    dX_uk = 0;
    dY_uk = 0;
    if (lk){
        dX_lk = p1.x - lk.x;
        dY_lk = p1.y - lk.y;
    }
    if (uk){
        dX_uk = p1.x - uk.x;
        dY_uk = p1.y - uk.y;
    }
    att = attraction.value;
    rep = repulsion.value;
    fric = friction.value;
    attLabel.innerHTML = "Attraction: " + att.toString();
    repLabel.innerHTML = "Repulsion: " + rep.toString();
    fricLabel.innerHTML = "Vmax: " + fric.toString();

    ax = (att*dX_lk-rep*dX_uk)/4000;
    ay = (att*dY_lk-rep*dY_uk)/4000;
    p1.vx -= ax/(Math.random()/2);
    p1.vy -= ay/(Math.random()/2);
    
    if (p1.vx<0){
        p1.vx = Math.max(-fric,p1.vx)
    }
    else {
        p1.vx = Math.min(fric,p1.vx)
    }
    if (p1.vy<0){
        p1.vy = Math.max(-fric,p1.vy)
    }
    else {
        p1.vy = Math.min(fric,p1.vy)
    }
}

// loop to find nearest prey/predator
function findNearest(p1){
    nearest_lk = false;
    nearest_uk = false;
    lk = 0;
    min_lk = 10**20;
    min_uk = 10**20;
    if (p1.type==1){
        lk = 2;
        uk = 3
    }
    else if (p1.type==2){
        lk = 3;
        uk = 1
    }
    else {
        lk = 1;
        uk = 2
    }
    for (i=0; i<objs.length;i++){
        p2 = objs[i];
        if(p2.type == lk){
            dX = p1.x - p2.x;
            dY = p1.y - p2.y;
            dist = Math.sqrt(dX**2+dY**2)
            if (dist < min_lk){
                min_lk = dist;
                nearest_lk = p2
            }
        }
        else if(p2.type == uk){
            dX = p1.x - p2.x;
            dY = p1.y - p2.y;
            dist = Math.sqrt(dX**2+dY**2)
            if (dist < min_uk){
                min_uk = dist;
                nearest_uk = p2
            }
        }
    }
    return [nearest_lk,nearest_uk]
}  

// play DOM sound
function playAudio(type){
    if (type==1){
        const origAudio = document.getElementById("rock-audio");
        const newAudio = origAudio.cloneNode()
        newAudio.play()
    }
    else if (type==2){
        const origAudio = document.getElementById("scissor-audio");
        const newAudio = origAudio.cloneNode()
        newAudio.play()
    }
    else {
        const origAudio = document.getElementById("paper-audio");
        const newAudio = origAudio.cloneNode()
        newAudio.play()
    }
}

// get selected option for placing RPS objects
function getSelectedRadio() {
    var ele = document.getElementsByName('radio');
      
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked){
            switch (ele[i].id){
                case "opt1":
                    return 1
                case "opt2":
                    return 2
                case "opt3":
                    return 3
                default: 
                    return 0
            }
        }
    }
}