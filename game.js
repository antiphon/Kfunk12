
var aspect = 2;// galaxy A8 horizontal
var config = {
    type: Phaser.AUTO,
    height: 600,
    width: 600 * aspect,
    scene: {
        preload: preload,
        create: create
    },
    scale: {
        mode: Phaser.Scale.FIT
    }
};

var game = new Phaser.Game(config);
/* draw region area */
var graphics;
var graphics2;
var leftbar = 30; // for stuff
var rightbar = 230; // for stuff
var scenewidth = config.width - leftbar - rightbar;
var sceneheight = config.height;
var Kdrawareaheight = sceneheight;
var Kdrawareawidth = rightbar;

/* for the function */
var function_post_pars = { std: true, clamp: true}; //
var univariate = true; // K or K12? 
var Rmax = sceneheight;
var rstep = 10;
var nR = Math.trunc(Rmax / rstep);
var whose_turn = 0;
var points = { x: [], y: [], m: [] };
var pir2 = [];
var paircount = [];
var edgeterm = [];
var counts = [0, 0];
var windowarea = scenewidth * sceneheight;
// settings
var pointsize = 10; // px
var pointcolors = [0xffaf00, 0x00afff];
var draw_K = draw_K11;
var update_K = update_K11;





function preload() {
    // scale constants for num stab
    //    var C = 100000;
    edgeterm = K11const;
    edgeterm12 = K12const;
    for (let i = 0; i < nR; i++) {
        paircount[i] = 0;
        let r = i * rstep;
        pir2[i] = Math.PI * r * r;
    }
}




function draw_points() {
    graphics.clear();
    for (let i = 0; i < points.x.length; i++) draw_point(i);
}

function draw_point(idx) {
    if (idx >= points.x.length || idx < 0) return;
    graphics.fillStyle(pointcolors[points.m[idx]], 1);
    graphics.fillCircle(points.x[idx], points.y[idx], pointsize / 2);
}






/* Compute K11 incrementally */
/* just the counts of pairs */
function update_K11() {
    if (counts[0] < 1) return;
    // assuming last point is the new point
    var i0 = points.x.length - 1;
    for (let i = 0; i < i0; i++) {
        {
            /* toroidal?*/
            let dx = points.x[i0] - points.x[i];
            let dy = points.y[i0] - points.y[i];
            let d = Math.sqrt(dx * dx  +  dy * dy);
            var idk = Math.floor(d / rstep) + 1;
            for (let j = idk; j < nR; j++) paircount[j]++;
        }
    }
}

/* Compute K12 incrementally */
/* just the counts of pairs */
function update_K12() {
    if (counts[0] < 1 || counts[1] < 1) return;
    // assuming last point is the new point
    var i0 = points.x.length - 1;
    var m0 = points.m[i0];
    for (let i = 0; i < i0; i++) {
        if (points.m[i] != m0) {
            let dx = points.x[i0] - points.x[i];
            let dy = points.y[i0] - points.y[i];
            let d = Math.sqrt(dx * dx  +  dy * dy);
            var idk = Math.floor(d / rstep) + 1;
            for (let j = idk; j < nR; j++) paircount[j]++;
        }
    }
}



/* Draw K11 */

function draw_K11() {
    var w = scenewidth;
    var h = sceneheight;
    // global correction
    //
    var n = counts[0];
    var nn = n*n;
    var n4 = nn*nn;
    Kest = [];
    Ksd  = []; // Poisson-marginals -approximation 
    var smax = 0; 
    var outs = [0,0]; // low upp
    for (var i = 1; i < nR; i++) {
        Kest[i] = 2 * paircount[i] * edgeterm[i] / nn - pir2[i];
        let vi = n*(n-1)*( (n-2)*(n-3)*aa1[i] + 4*(n-2)*aa2[i] + 2*aa3[i] - n*(n-1)*aa3[i]*aa3[i] )/n4;
        Ksd[i] = Math.sqrt(vi) * edgeterm[i];
        smax = Ksd[i] > smax ? Ksd[i] : smax;
        if(Kest[i] < -Ksd[i]*2) outs[0]++;
        if(Kest[i] > Ksd[i]*2) outs[1]++;
    }
    /* what to actually draw etc */
    var mean = [];
    var upp = [];
    var low = [];
    var zero = [];
    var curvemaxy = Kdrawareawidth; // vertical curves
    if(function_post_pars.std) {
        for(let i=1; i  <nR; i++){
            mean[i] = Kest[i] / Ksd[i];
            upp[i] = 2 ;
            low[i] = -2 ;
            zero[i] = 0;
        }
        scaler1 = (curvemaxy / 8);
    }
    else{
        for(let i = 1; i < nR; i++) {
            mean[i] = Kest[i];
            upp[i] = 2 * Ksd[i];
            low[i] = -2 * Ksd[i];
            zero[i] = 0;
        }
        scaler1 = (curvemaxy / 2) / (smax*2);
    }
    
    /* Line style */
    graphics2.lineStyle(1, 0xFF00FF, 1.0);
    /* go */
    var xoff = leftbar + scenewidth + rightbar/2;
    var yoff = 0;
    
    drawit = function(y) {
        graphics2.beginPath();
        // graphics2.moveTo(xoff, y0 - yoff * scaler1);
        // for (let i = 1; i < nR; i++) {
        //     var r = i * rstep;
        //     graphics2.lineTo(xoff + r, yoff - y[i] * scaler1); // negative fto flip y-coord
        // }
        graphics2.moveTo(xoff + y[0] * scaler1, yoff);
        for (let i = 1; i < nR; i++) {
            var r = i * rstep * Kdrawareaheight/Rmax;
            graphics2.lineTo(xoff + y[i] * scaler1, yoff + r); // negative fto flip y-coord
        }
        graphics2.strokePath();
    }


    graphics2.clear();
    /* point area */
    graphics2.lineStyle(1, 0x222222, 2.0);
    graphics2.strokeRect(leftbar+1, 1, w + leftbar-2, h-2);
    //    graphics2.strokeRect(leftbar, 0,  w, h);
    // sidebars, to frame the game region.
    /* left bar*/
    graphics2.fillStyle(0x001200, 1.0);
    graphics2.fillRect(0, 0, leftbar, h);
    graphics2.lineStyle(1, 0x11ff2f, 1.0);
    graphics2.strokeRect(0, 0, leftbar, h);
    /* right draw area */
    graphics2.fillStyle(0x001200, 1.0);
    graphics2.fillRect(leftbar + w, 0, rightbar, h);
    graphics2.strokeRect(leftbar+w, 0, rightbar, h);

    /* 0 line */
    graphics2.lineStyle(1, 0xbbbbbb, 1.0);
    drawit(zero);
    /* estimated L-r */
    graphics2.lineStyle(2, 0xFF00FF, 1.0);
    drawit(mean);
    // /* CI */
    graphics2.lineStyle(2, 0x550000, 1.0);
    if(outs[0]) graphics2.lineStyle(2, 0xFF0000, 1.0);
    drawit(low);
    graphics2.lineStyle(2, 0x005500, 1.0);
    if(outs[1])graphics2.lineStyle(2, 0x00FF00, 1.0);
    drawit(upp);
}


/* Draw K12 */

function draw_K12() {
    var w = scenewidth;
    var h = sceneheight;

    var n = points.length;
    var std = [];
    // global correction
    var const1 = 1;
    //
    var nn = counts[0]*counts[1];
    K12est = [];
    K12sd  = []; // Poisson-marginals -approximation 
    var sn = counts[0]+counts[1];
    var smax = 0; 
    var outs = [0,0];
    for (var i = 1; i < nR; i++) {
        K12est[i] = paircount[i] * edgeterm12[i] / nn - pir2[i];
        let vi = (sn * c2[i] + c3[i]) / nn;
        K12sd[i] = Math.sqrt(vi) * edgeterm12[i];
        smax = K12sd[i] > smax ? K12sd[i] : smax;
        if(K12est[i] < -K12sd[i]*2) outs[0]++;
        if(K12est[i] > +K12sd[i]*2) outs[1]++;
    }
    
    /* what to actually draw etc */
    var mean = [];
    var upp = [];
    var low = [];
    var zero = [];
    var curvemaxy = Kdrawareawidth; // vertical curves
    if(function_post_pars.std) {
        for(let i=1; i  <nR; i++){
            mean[i] = K12est[i] / K12sd[i];
            upp[i] = 2 ;
            low[i] = -2 ;
            zero[i] = 0;
        }
        scaler1 = (curvemaxy / 8);
    }
    else{
        for(let i = 1; i < nR; i++) {
            mean[i] = K12est[i];
            upp[i] = 2 * K12sd[i];
            low[i] = -2 * K12sd[i];
            zero[i] = 0;
        }
        scaler1 = (curvemaxy / 2) / (smax*2);
    }
    
    /* Line style */
    graphics2.lineStyle(1, 0xFF00FF, 1.0);
    /* go */
    var xoff = leftbar + scenewidth + rightbar/2;
    var yoff = 0;
    
    drawit = function(y) {
        graphics2.beginPath();
        // graphics2.moveTo(xoff, y0 - yoff * scaler1);
        // for (let i = 1; i < nR; i++) {
        //     var r = i * rstep;
        //     graphics2.lineTo(xoff + r, yoff - y[i] * scaler1); // negative fto flip y-coord
        // }
        graphics2.moveTo(xoff + y[0] * scaler1, yoff);
        for (let i = 1; i < nR; i++) {
            var r = i * rstep * Kdrawareaheight/Rmax;
            graphics2.lineTo(xoff + y[i] * scaler1, yoff + r); // negative fto flip y-coord
        }
        graphics2.strokePath();
    }


    graphics2.clear();
    /* point area */
    graphics2.lineStyle(1, 0x222222, 2.0);
    graphics2.strokeRect(leftbar+1, 1, w + leftbar-2, h-2);
    //    graphics2.strokeRect(leftbar, 0,  w, h);
    // sidebars, to frame the game region.
    /* left bar*/
    graphics2.fillStyle(0x001200, 1.0);
    graphics2.fillRect(0, 0, leftbar, h);
    graphics2.lineStyle(1, 0x11ff2f, 1.0);
    graphics2.strokeRect(0, 0, leftbar, h);
    /* right draw area */
    graphics2.fillStyle(0x001200, 1.0);
    graphics2.fillRect(leftbar + w, 0, rightbar, h);
    graphics2.strokeRect(leftbar+w, 0, rightbar, h);

    /* 0 line */
    graphics2.lineStyle(1, 0xbbbbbb, 1.0);
    drawit(zero);
    /* estimated L-r */
    graphics2.lineStyle(2, 0xFF00FF, 1.0);
    drawit(mean);
    // /* CI */
    graphics2.lineStyle(2, 0x550000, 1.0);
    if(outs[0]) graphics2.lineStyle(2, 0xFF0000, 1.0);
    drawit(low);
    graphics2.lineStyle(2, 0x005500, 1.0);
    if(outs[1])graphics2.lineStyle(2, 0x00FF00, 1.0);
    drawit(upp);
}


// handle a click
function got_click(x, y, m) {
    // integer resolution
    //x = Math.round(x);
    //y = Math.round(y);
    // check is it new
    var isnew = true;
    for (let xint = 0; xint < points.x.length; xint++) {
        if (points.x[xint] == x && points.y[xint] == y) {
            isnew = false;
            break;
        }
    }
    if (isnew) {
        console.log("new: " + x + "," + y);
        counts[m]++;
        addpoint(x, y, m);
        draw_point(points.x.length - 1);
        update_K();
        draw_K();
        
        if(!univariate){
            whose_turn = 1 - whose_turn;
            draw_state_indicator();
        }
    }
}

function draw_state_indicator() {
    graphics2.fillStyle(pointcolors[whose_turn], 1.0);
    graphics2.fillCircle(leftbar/2, sceneheight/2, leftbar/3);
}

function update_info(){

}

function addpoint(x, y, m) {
    // assuming is new == True is checked already.
    points.x.push(x);
    points.y.push(y);
    points.m.push(m);
}
function simpoints(n) {
    for (let i = 0; i < n; i++) {
        let x = (scenewidth-2) * Math.random() + 1+leftbar;
        let y = (sceneheight-2) * Math.random() + 1;
        var m = whose_turn;
        got_click(x, y, m);
        //m = 1 - m;
    }
}




function restart() {
    // clear points
    points = { x: [], y: [], m: [] };
    counts = [0, 0];
    draw_points();
    paircount = [];
    for (let i = 0; i < nR; i++) {
        paircount[i] = 0;
    }
    draw_K();
    if(!univariate) draw_state_indicator();
}

function toggleMultiPlayer() {
    univariate = !univariate;
    if(!univariate) {
        draw_state_indicator();
        draw_K = draw_K12;
        update_K = update_K12;
    }
    else{
        draw_K = draw_K11;
        update_K = update_K11;
    }
}
/* Some helpers here */
function toggleFunNormalise() {
    function_post_pars.std = !function_post_pars.std;
}






function create() {
    var w = config.width;
    var h = config.height;

    graphics = this.add.graphics({ fillStyle: { color: 0x2266aa } });
    graphics2 = this.add.graphics({ fillStyle: { color: 0xaa2266 } });
    this.input.keyboard.on('keydown', function (event) {
        if (event.key == "r") {
            simpoints(1);
        } else if (event.key == "s") {
            toggleFunNormalise();
            draw_K();
        } else if (event.key == "f") {
            game.scale.toggleFullscreen();
        } else if (event.key == "R") {
            simpoints(10);
        } else if (event.key == "c") {
            restart();
        }else if (event.key == "m") {
            toggleMultiPlayer();
            restart();
        }        
    });

    this.input.on('pointerdown', function (pointer, gameObjects) {
        // check withing!
        if(pointer.x > leftbar+1 && pointer.x < leftbar + scenewidth-1 &&
            pointer.y > 1 && pointer.y < sceneheight - 1)
            got_click(pointer.x, pointer.y, whose_turn);
    }, this);

    // touch buttons

    var buttonfs = this.add.text(2, 10, 'FS', 0).setInteractive().on('pointerup', function () { game.scale.toggleFullscreen(); });
    var buttonno = this.add.text(2, 50, 'NO', 0).setInteractive().on('pointerup', function () { toggleFunNormalise(); draw_K(); });
    var buttoncl = this.add.text(2, sceneheight - 30, 'CL', 0).setInteractive().on('pointerup', function () { restart(); });
    //
    var buttonr10 = this.add.text(1, 130,  'R10', 0).setInteractive().on('pointerup', function () { simpoints(10); });
    var buttonMultiP = this.add.text(1, 160, 'Mu', 0).setInteractive().on('pointerup', function () { toggleMultiPlayer(); restart(); });

    draw_points();
    draw_K();
    if(!univariate) draw_state_indicator();
}
