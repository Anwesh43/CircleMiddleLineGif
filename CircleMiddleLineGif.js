const w = 500, h = 500
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

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
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
