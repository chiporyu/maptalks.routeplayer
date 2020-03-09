import sortedIndexBy from 'lodash/sortedIndexBy'
import _nth from 'lodash/nth'


// 待绘制的一条轨迹
export default class Route {
  constructor(r) {
    this.route = r
    this._setPath(r.path)
  }

  getCoordinates(t, map) {
    if (t > this.getEnd()) {
      return null
    }

    let idx = sortedIndexBy(this.path, [0, 0, t], c => c[2])

    var p1, p2, span, r
    if (idx === 0) {
      p1 = p2 = this.path[idx]
      span = r = 0
    } else {
      p1 = this.path[idx - 1]
      p2 = this.path[idx]
      span = t - p1[2]
      r = span / (p2[2] - p1[2])
    }
    const x = p1[0] + (p2[0] - p1[0]) * r,
      y = p1[1] + (p2[1] - p1[1]) * r,
      coord = new maptalks.Coordinate(x, y),
      vp = map.coordinateToViewPoint(coord),
      vp1 = map.coordinateToViewPoint(new maptalks.Coordinate(p1)),
      degree = maptalks.Util.computeDegree(vp1.x, vp1.y, vp.x, vp.y)

    return {
      coordinate: coord,
      viewPoint: vp,
      degree: degree,
      index: idx,
      calc: span !== 0
    }
  }

  getStart() {
    return _nth(this.path, 0)[2]
  }

  getEnd() {
    return _nth(this.path, -1)[2]
  }

  getCount() {
    return this.path.length
  }

  get markerSymbol() {
    return this.route.markerSymbol
  }

  set markerSymbol(symbol) {
    this.route.markerSymbol = symbol
    if (this._painter && this._painter.marker) {
      this._painter.marker.setSymbol(symbol);
    }
  }

  get lineSymbol() {
    return this.route.lineSymbol;
  }

  set lineSymbol(symbol) {
    this.route.lineSymbol = symbol;
    if (this._painter && this._painter.marker) {
      this._painter.line.setSymbol(symbol);
    }
  }

  _setPath(path) {
    if (!path || path.length <= 0) {
      console.warn('path of route is empty:', path)
    }
    this.path = path || []
  }
}