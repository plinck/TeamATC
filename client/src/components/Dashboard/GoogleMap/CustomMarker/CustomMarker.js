export default function createCustomMarkers(data, map) {
  function CustomMarker(latlng, map, imageSrc) {
    this.latlng_ = latlng;
    this.imageSrc = imageSrc;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
  }

  CustomMarker.prototype = new window.google.maps.OverlayView();

  CustomMarker.prototype.draw = function () {
    // Check if the div has been created.
    var div = this.div_;
    if (!div) {
      // Create a overlay text DIV
      div = this.div_ = document.createElement("div");
      // Create the DIV representing our CustomMarker
      div.className = "customMarker";

      var img = document.createElement("img");
      img.src = this.imageSrc;
      div.appendChild(img);
      var me = this;
      window.google.maps.event.addDomListener(div, "click", function (event) {
        console.log(data);
      });

      // Then add the overlay to the DOM
      var panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    }

    // Position the overlay
    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      div.style.left = point.x + "px";
      div.style.top = point.y + "px";
    }
  };

  CustomMarker.prototype.remove = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  };

  CustomMarker.prototype.getPosition = function () {
    return this.latlng_;
  };

  //   var data = [
  //     {
  //       profileImage:
  //         "http://www.gravatar.com/avatar/d735414fa8687e8874783702f6c96fa6?s=90&d=identicon&r=PG",
  //       pos: [37.77085, -122.41356],
  //     },
  //     {
  //       profileImage: "http://placekitten.com/90/90",
  //       pos: [37.7722, -122.41555],
  //     },
  //   ];

  new CustomMarker(
    data.latlng,
    map,
    data.photo
  );
}
