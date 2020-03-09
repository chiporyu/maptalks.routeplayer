# maptalks-routeplayer

The route player plugin for maptalks.js. Inspired by [maptalks.routeplayer](https://github.com/maptalks/maptalks.routeplayer) and [OL-RouteAnimate](https://github.com/Liquid-Zhangliquan/OL-RouteAnimate)


## Examples

* [Live demo]()

## Install

* Install with npm: ```npm install @chiporyu/maptalks.routeplayer```
* Use unpkg CDN: 
  * ```https://unpkg.com/@chiporyu/dist/maptalks.routeplayer.js```,
  * ```https://unpkg.com/@chiporyu/dist/maptalks.routeplayer.css```

## Usage
```html
<head>
  <link rel="stylesheet" href="https://unpkg.com/@chiporyu/dist/maptalks.routeplayer.css">
</head>
<body>
  <script type="text/javascript" src="https://unpkg.com/maptalks/dist/maptalks.min.js"></script>
  <script type="text/javascript" src="https://unpkg.com/@chiporyu/dist/maptalks.routeplayer.js"></script>
  <script>
    var player = new maptalks.VectorRoutePlayer(routes, map, options);
    player.play()
  </script>
</body>
```

## Create new player for yourself

It is easy to create a new RoutePlayer class. Only thing you need to do is extend `maptalks.BaseRoutePlayer` and necessary metheds:
* ```createLayers```: required, to create layers you need to draw frame data
* ```drawRoutesFrame(routes, time)```: required, you need to implement drawer for yourself.

## API Refrence

### `Constrator`
```javascript
new maptalks.VectorRoutePlayer(routes, map, options)
```
* `routes` **Object|Array** route or route array
* `map` **Object** map instance
* `options` **Object** options
  ```javascript
  // options demo
  {
    unitTime: 1, // Double, 1 for real time speed,
    showControl: true, // Boolean, show control fo player
    controlOptions: {
      position: 'bottom-left' // String or Object, display in buttom-center of screen if nothing set
    },
    lineSymbol: { // show a car image at the newest cooridinate and a route path behind the car
      lineWidth: 2,
      lineColor: 'steelblue',
      markerFile: './car.png',
      markerPlacement: 'vertex-last', //vertex, point, vertex-first, vertex-last, center
      markerVerticalAlignment: 'middle',
      markerWidth: 75,
      markerHeight: 50
    }
  }

  // route demo 
  [{
    path: [[121.475031060928, 31.2611187865471, 301000],
      [121.47940842604, 31.263466566376, 541000],
      [121.481768769973, 31.2649338991092, 781000],
      [121.483871621841, 31.2638700851521, 901000]],
    lineSymbol: {
      // .etc  line lineSymbol option to overide global lineSymbol
    }
  }]
  ```

### Metheds
#### `play()`
#### `pause()`
#### `cancel()`
#### `finish()`
#### `getCurrentTime()`
#### `getStartTime()` 
#### `getEndTime()`
#### `setTime(time)` 
* `time` **Number** Skip time to `time`
#### `setProgress(progress)` 
* `progress` **Number** 0-1 Number value
#### `setSpeed(speed)`
* `speed` **Number**
#### `remove()` remove player from map, clear every thing if necessary
