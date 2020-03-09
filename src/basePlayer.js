import * as maptalks from 'maptalks';
import Route from './route'

import Control from './control'

import _max from 'lodash/max'
import _min from 'lodash/min'


const options = {
  unitTime: 1,
  showControl: true,
  controlOptions: {
    position: 'bottom-left'
  },
  markerSymbol: null,
  lineSymbol: {
    lineWidth: 1,
    lineColor: 'steelblue'
  }
}

export default class BaseRoutePlayer extends maptalks.Eventable(maptalks.Class) {

  constructor(routes, map, opts) {
    super(opts)
    if (!Array.isArray(routes)) {
      routes = [routes]
    }
    this.id = maptalks.Util.UID()

    this._map = map
    this._setup(routes)

    this._speed = 1

    this._createPlayer()
    this._createControl()
    if (this.createLayers) {
      this.createLayers()
    }
  }

  drawRoutesFrame(routes, t) {
    routes.forEach(r => {
      let coo = r.getCoordinates(t, this._map)
      console.log('playing', t, coo)
    });
  }

  play() {
    if (this.player.playState === 'running') {
      return this
    }
    this.player.play()
    this.fire('playstart')
    return this
  }

  pause() {
    if (this.player.playState === 'paused') {
      return this;
    }
    this.player.pause()
    this.fire('playpause')
    return this
  }

  cancel() {
    this.player.cancel()
    this.played = 0
    this._createPlayer()
    this._step({ styles: { t: 0 } })
    this.fire('playcancel')
    return this
  }


  finish() {
    if (this.player.playState === 'finished') {
      return this
    }
    this.player.finish()
    this._step({ styles: { t: 1 } })
    this.fire('playfinish')
    return this
  }

  getCurrentTime() {
    if (!this.played) {
      return this.startTime
    }
    return this.startTime + this.played
  }

  getStartTime() {
    return this.startTime || 0
  }

  getEndTime() {
    return this.endTime || 0
  }

  setTime(t) {
    this.played = t - this.startTime
    if (this.played < 0) {
      this.played = 0
    }
    if (this.played >= this.endTime - this.startTime) {
      this.played = this.endTime - this.startTime - 1
    }
    this._resetPlayer()
    return this
  }

  setProgress(progress) {
    if (progress < 0) progress = 0
    if (progress > 1) progress = 1
    
    const t = this.startTime + (this.endTime - this.startTime) * progress
    this.setTime(t)
  }

  setSpeed (speed) {
    this._speed = speed
    this._resetPlayer()

    // fix bug, fire player finish event
    if (this.played == this.duration) {
      this.finish()
    }
    return this
  }

  getSpeed () {
    return this._speed
  }

  remove() {
    if (!this.markerLayer) {
      return this;
    }
    this.cancel();
    this.markerLayer.remove();
    delete this.markerLayer;
    delete this.lineLayer;
    delete this._map;
    return this;
  }

  _step(frame, silence) {
    const played = this.duration * frame.styles.t;
    const curt = this.startTime + played
    
    let isLastFrame = false

    if (frame.state && frame.state.playState !== 'running') {
      if (frame.state.playState === 'finished') {
        isLastFrame = true
      } else {
        return
      }
    }

    if (isNaN(curt)) {
      return
    }

    this.played = played
    this.drawRoutesFrame(this.routes, curt)

    this.fire('progress', {
      played: played,
      d: frame.styles.t,
      t: this.startTime + played
    });

    !silence && this.fire('playing', {
      played: played,
      d: frame.styles.t,
      t: this.startTime + played
    });

    if (isLastFrame) {
      console.log('finished')
      this.fire('finished');
    }
  }

  _createPlayer() {
    const duration = (this.duration - this.played) / (this.options.unitTime * this._speed)

    let framer
    const renderer = this._map._getRenderer();
    if (renderer.callInFrameLoop) {
      framer = function (fn) {
        renderer.callInFrameLoop(fn)
      }
    }

    this.player = maptalks.animation.Animation.animate({
      t: [this.played / this.duration, 1]
    }, {
      framer,
      speed: duration,
      easing: 'linear'
    }, this._step.bind(this))
  }

  _resetPlayer() {
    const playing = this.player && this.player.playState === 'running'
    const played = this.played
    if (playing) {
      this.player.pause()
    }
    if (playing) {
      this.played = played
      this._createPlayer()
      this.player.play()
    } else {
      this._createPlayer()
      this._step({ styles: { t: this.played / this.duration } }, true)
    }
  }


  _setup(rs) {
    const routes = rs.map(r => new Route(r))
    const start = _min(routes.map(r => r.getStart()))
    const end = _max(routes.map(r => r.getEnd()))

    this.routes = routes
    this.startTime = start
    this.endTime = end
    this.played = 0
    this.duration = end - start
  }

  _createControl () {
    if (this.options.showControl) {
      console.log('create route player control')
      this.options.controlOptions.player = this
      this.ctl = new Control(this.options.controlOptions).addTo(this._map)
    }
  }
}

BaseRoutePlayer.mergeOptions(options);