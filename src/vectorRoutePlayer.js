
import BaseRoutePlayer from './basePlayer'

export default class VectorRoutePlayer extends BaseRoutePlayer{

  drawRoutesFrame(routes, t) {
    routes.forEach(r => this.drawRoute(r, t))
  }

  drawRoute (route, t) {
    if (!this._map) {
      return;
    }
    
    const coordinates = route.getCoordinates(t, this._map);

    if (!coordinates) {
      if (route._painter && route._painter.line) {
        if (t <= route.getStart()) {
          route._painter.line.setCoordinates([])
        } else if(t >= route.getEnd()) {
          route._painter.line.setCoordinates(route.path)
        }
      }
      return;
    }
    if (!route._painter) {
      route._painter = {};
    }

    const path = route.path.slice(0, coordinates.index)
    path.push(coordinates.coordinate)

    if (!route._painter.line) {
      const line = new maptalks.LineString(path, {
        symbol: route.lineSymbol || this.options['lineSymbol']
      }).addTo(this.lineLayer);

      route._painter.line = line;
    } else {
      route._painter.line.setCoordinates(path);
    }
  }

  createLayers() {
    this.lineLayer = new maptalks.VectorLayer(
      maptalks.INTERNAL_LAYER_PREFIX + '_v_routeplay_l_' + this.id
    ).addTo(this._map)
  }
}