const w = 500, h = 500, nodes = 5
const Canvas = require('canvas')
const GifEncoder = require('gifencoder')
const k = 3
class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += (0.1 / k) * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
        }
    }
}


const drawFns = (context, i, scale, gap) => {
    context.lineWidth = Math.min(w, h) / 60
    context.lineCap = 'round'
    context.strokeStyle = '#283593'
    const r = gap / 3
    const sc = Math.min(1/k, Math.max(0, scale - (1/k) * i)) * k
    if (i == 0) {
        context.beginPath()
        for (var k = -90; k <=-90 + 360 * sc; k++) {
            const x = r * Math.cos(k * Math.PI/180), y = r * Math.sin(k * Math.PI/180)
            if (k == -90) {
                context.moveTo(x, y)
            } else {
                context.lineTo(x, y)
            }
        }
        context.stroke()
    } else {
        const f = (i + 1) % 2
        context.save()
        context.rotate((Math.PI/2) * f)
        context.beginPath()
        context.moveTo(-r * sc, 0)
        context.lineTo(r * sc, 0)
        context.stroke()
        context.restore()
    }
}

class CMLNode {
    constructor(i) {
        this.i = i
        this.state = new State()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new CMLNode(this.i + 1)
            this.next.prev = this
        }
    }


    draw(context) {
        const gap = w / (nodes + 1)
        context.save()
        context.translate(gap * this.i + gap, h/2)
        for (var i = 0; i < 3 ; i++) {
            drawFns(context, i, this.state.scale, gap)
        }
        context.restore()

        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.next
        if (dir == -1) {
            curr = this.prev
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class CircleMiddleLine {
    constructor() {
        this.curr = new CMLNode(0)
        this.dir = 1
        this.curr.startUpdating()
    }

    draw(context) {
        this.curr.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.curr.i == 0 && this.dir == 1) {
                cb()
            } else {
                this.curr.startUpdating()
            }
        })
    }

}

class Renderer {
    constructor() {
        this.running = true
        this.cml = new CircleMiddleLine()
    }

    render(context, cb, endcb) {
        while(this.running) {
            context.fillStyle = '#212121'
            context.fillRect(0, 0, w, h)
            this.cml.draw(context)
            cb(context)
            this.cml.update(() => {
                endcb()
                this.running = false
            })
        }
    }
}

class CircleMiddleLineGif {
    constructor() {
        this.renderer = new Renderer()
        this.encoder = new GifEncoder(w, h)
        this.canvas = new Canvas(w, h)
        this.context = this.canvas.getContext('2d')
    }

    initEncoder(fn) {
        this.encoder.setQuality(100)
        this.encoder.setRepeat(0)
        this.encoder.setDelay(50)
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
    }

    render() {
        this.encoder.start()
        this.renderer.render(this.context, (ctx) => {
            this.encoder.addFrame(ctx)
        }, () => {
            this.encoder.end()
        })
    }

    static init(fn) {
        const gif = new CircleMiddleLineGif()
        gif.initEncoder(fn)
        gif.render()
    }
}

module.exports = CircleMiddleLineGif.init
