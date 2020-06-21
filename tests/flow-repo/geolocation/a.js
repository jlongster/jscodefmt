/* @flow */

var geolocation = new Geolocation();
var id = geolocation.watchPosition(
  position => {
    var coords: Coordinates = position.coords;
    var accuracy: number = coords.accuracy;
  },
  e => {
    var message: string = e.message;
    switch (e.code) {
      case e.PERMISSION_DENIED:
      case e.POSITION_UNAVAILABLE:
      case e.TIMEOUT:
      default:
        break;
    }
  }
);
geolocation.clearWatch(id);
