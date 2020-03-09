import * as maptalks from 'maptalks'

import {asString} from 'date-format'

const { createEl, setClass, on, off, preventDefault, getEventContainerPoint } = maptalks.DomUtil

const options = {
  player: null,
  speedRange: [0.5, 60],
  position: {
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '20px'
  }
}

export default class Control extends maptalks.control.Control {
  buildOn(map) {
    let dom = createEl('div', 'tc-player')
    let content = `<div class="player-btn"></div>
      <div class="time-info">00:00</div>
      <div class="time-slider">
        <div class="ruler">
          <div class="palyed"></div>
          <div class="slider-dot"></div>
        </div>
      </div>
      <div class="speed">
        <div class="speed-info">1.0x</div>
        <div class="speed-slider">
          <div class="ruler">
            <div class="slider-dot"></div>
          </div>
        </div>
      </div>`
    dom.innerHTML = content

    this._initDomRefs(dom)

    this.playing = false
    this.speedCtlTop = true

    return dom
  }

  set playing(playing) {
    this._playing = playing
    setClass(this._domRefs.playBtn, 'player-btn ' + (playing ? 'pause' : ''))
  }

  get playing() {
    return this._playing
  }

  onAdd() {
    this._bindEvents()

    let top = maptalks.DomUtil.computeDomPosition(this._controlDom)[1]
    this.speedCtlTop = top > 120
    this._initSpeedDotPos()
    setClass(this._domRefs.speedSlider, 'speed-slider ' + (this.speedCtlTop ? '' : 'bottom'))
  }

  onRemove() {
    this._offEvents()
  }

  _bindEvents() {
    let refs = this._domRefs
    on(refs.playBtn, 'click', this._onPlayBtnClick, this)
    on(refs.progressRuler, 'click', this._onprogressRulerClick, this)
    on(refs.speedRuler, 'click', this._onSpeedRulerClick, this)

    this.progressDragger = new maptalks.DragHandler(refs.progressCtlDot, { 'ignoreMouseleave': true })
    this.progressDragger.on('dragging', this._onprogressDotDrag, this)
      .enable()

    this.speedDragger = new maptalks.DragHandler(refs.speedCtlDot, { 'ignoreMouseleave': true })
    this.speedDragger.on('dragging', this._onSpeedDotDrag, this)
      .enable()
    

    if (this.options.player) {
      this.options.player.on('progress', this._onProgress, this)
      this.options.player.on('playing', this._onPlaying, this)
      this.options.player.on('finished', this._onPlayFinish, this)
    }
  }

  _offEvents () {
    let refs = this._domRefs
    off(refs.playBtn, 'click', this._onPlayBtnClick, this)
    off(refs.progressRuler, 'click', this._onprogressRulerClick, this)
    off(refs.speedRuler, 'click', this._onSpeedRulerClick, this)

    this.progressDragger.disable()
    delete this.progressDragger

    this.speedDragger.disable()
    delete this.speedDragger

  }

  _onProgress (time) {
    // this.timeInfo.innerText = moment(Math.floor(time.t)).format("HH:mm:ss")
    this._domRefs.timeInfo.innerText = asString('hh:mm:ss', new Date(time.t))
    
    let w = this._domRefs.progressRuler.clientWidth
    this._domRefs.progressCtlDot.style.left = (w * time.d).toFixed(1) + 'px'
    this._domRefs.progress.style.width = (w * time.d).toFixed(1) + 'px'
  }

  _onPlaying (time) {
    // this.timeInfo.innerText = Math.floor(time.played)
    // this.playBtl.innerText = '||'
    if (!this.playing) {
      this.playing = true
    }
  }


  _onPlayFinish () {
    // this.playBtl.innerText = '>'
    this.playing = false
  }

  _onPlayBtnClick(e) {
    preventDefault(e)
    this.playing = !this._playing

    if (this.options.player ) {
      let player = this.options.player
      let playState = player.player.playState

      if ('finished' == playState) {
        player.cancel().play()
      } else if ('running' === playState) {
        player.pause()
      } else if ('idle' === playState || 'paused' == playState) {
        player.play()
      }
    }
  }

  _onprogressRulerClick(e) {
    preventDefault(e)
    let point = getEventContainerPoint(e, this._domRefs.progressRuler)
    let pWidth = this._domRefs.progressRuler.clientWidth
    let progress = point.x / pWidth

    this._updateprogressUI(progress)
  }

  _onSpeedRulerClick(e) {
    preventDefault(e)
    let point = getEventContainerPoint(e, this._domRefs.speedRuler)
    let total = this._domRefs.speedRuler.clientHeight
    let progress = point.y / total

    this._updateSpeedUI(progress)
  }

  _onprogressDotDrag(e) {
    preventDefault(e.domEvent)
    let point = getEventContainerPoint(e.domEvent, this._domRefs.progressRuler)
    let total = this._domRefs.progressRuler.clientWidth

    let progress = point.x / total
    this._updateprogressUI(progress)
  }

  _onSpeedDotDrag(e) {
    preventDefault(e.domEvent)
    let point = getEventContainerPoint(e.domEvent, this._domRefs.speedRuler)
    let total = this._domRefs.speedRuler.clientHeight
    let progress = point.y / total
    this._updateSpeedUI(progress)
  }

  _updateprogressUI(progress) {
    if (progress > 1) progress = 1
    if (progress < 0) progress = 0
    let per = (progress * 100).toFixed(1) + '%'
    this._domRefs.progress.style.width = per
    this._domRefs.progressCtlDot.style.left = per

    if (this.options.player) {
      this.options.player.setProgress(progress)
    }
  }

  _updateSpeedUI(progress) {
    if (progress > 1) progress = 1
    if (progress < 0) progress = 0

    let per = (progress * 100).toFixed(1)
    // if (!this.speedCtlTop) per = 100 - per

    let sp = (this.speedCtlTop ? 1 - progress : progress)
    sp = ((this.options.speedRange[1] - this.options.speedRange[0]) * sp + this.options.speedRange[0]).toFixed(1)


    this._domRefs.speedCtlDot.style.top = per + '%'
    this._domRefs.speedInfo.innerText = sp + 'x'

    if (this.options.player) {
      this.options.player.setSpeed(sp)
    }
  }

  _initSpeedDotPos () {
    let p = (1 - this.options.speedRange[0]) / (this.options.speedRange[1] - this.options.speedRange[0]).toFixed(1)
    p = (this.speedCtlTop ? 1 - p : p)
    p = 100 * p
    this._domRefs.speedCtlDot.style.top = p + '%'
  }

  _initDomRefs(dom) {
    let playBtn = dom.querySelector('.player-btn')

    let timeInfo = dom.querySelector('.time-info')

    let progressRuler = dom.querySelector('.time-slider .ruler')
    let progress = progressRuler.querySelector('.palyed')
    let progressCtlDot = progressRuler.querySelector('.slider-dot')

    let speed = dom.querySelector('.speed')
    let speedInfo = speed.querySelector('.speed-info')
    let speedSlider = speed.querySelector('.speed-slider')
    let speedRuler = speed.querySelector('.ruler')
    let speedCtlDot = speedRuler.querySelector('.slider-dot')

    this._domRefs = {
      playBtn, timeInfo,
      progressRuler, progress, progressCtlDot,
      speedInfo, speedRuler, speedCtlDot, speedSlider
    }
  }

  _updatePosition() {
    let position = this.getPosition();
    if (!position) {
      //default one
      position = {
        'top': 20,
        'left': 20
      };
    }
    for (const p in position) {
      if (position.hasOwnProperty(p)) {
        if (maptalks.Util.isNumber(position[p])) {
          this.__ctrlContainer.style[p] = position[p] + 'px';
        } else {
          this.__ctrlContainer.style[p] = position[p];
        }
      }
    }
    /**
     * Control's position update event.
     *
     * @event control.Control#positionchange
     * @type {Object}
     * @property {String} type - positionchange
     * @property {control.Control} target - the control instance
     * @property {Object} position - Position of the control, eg:{"top" : 100, "left" : 50}
     */
    this.fire('positionchange', {
      'position': maptalks.Util.extend({}, position)
    });
  }
}

Control.mergeOptions(options)