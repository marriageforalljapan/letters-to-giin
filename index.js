function initAutocomplete() {
    //マップの初期設定
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 38.682839, lng: 139.759455 },
      zoom: 5,
      gestureHandling: "greedy",
      disableDefaultUI: true,
      restriction: {
        latLngBounds: {
          north: 50.0,
          south: 20.0,
          west: 100.0,
          east: 180.0
        },
        strictBounds: false
      },
      styles: [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "administrative.neighborhood",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ffffff"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dadada"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "road.local",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#c9c9c9"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        }
      ]
    });

   // searchboxの実装（参考：https://qiita.com/tkhshiq/items/723d2a993feb712f021e）
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

  // 古いマーカーを消す
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];

  const bounds = new google.maps.LatLngBounds();
  places.forEach((place) => {
    if (!place.geometry) {
      console.log("Returned place contains no geometry");
      return;
    }

    const icon = {
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25),
    };

    // 検索した位置にマーカーを立てる
    markers.push(
      new google.maps.Marker({
        map,
        icon,
        title: place.name,
        position: place.geometry.location,
      })
    );

    bounds.extend(place.geometry.location);
  });

  // 新しいズームレベルで地図を表示
  if (places.length > 0) {
    map.fitBounds(bounds);
    map.setZoom(8);
  }
});
     
   
   
     // GeoJSONファイルの読み込み
     // Add the feature layer.
     map.data.loadGeoJson('https://raw.githubusercontent.com/marriageforalljapan-int/search_senkyoku/main/Regions.1683816979476.geojson');
     
     // infoWindowを定義
     var infowindow = new google.maps.InfoWindow();
   
     // ポリゴンに色を塗る
     map.data.setStyle(function(feature) {
       let color = feature.getProperty('color');
       return {
         fillColor: color,
         fillOpacity: 0.7,
         strokeColor: 'black',
         strokeWeight: 2,
         strokeOpacity: 1,
       };
     });
     
   
     // クリックしたらポリゴンの色を変え、ポップアップを表示させる
     map.data.addListener('click', function(event) {
         map.data.revertStyle();
         map.data.overrideStyle(event.feature, {fillColor: 'yellow',fillOpacity: 0.9});
         var feat = event.feature;
         var html = "<b>" + feat.getProperty('kuname') ;
         infowindow.setContent(html);
         infowindow.setPosition(event.latLng);
         infowindow.setOptions({pixelOffset: new google.maps.Size(0,-34)});
         infowindow.open(map);
     });
     
     window.addEventListener('resize', function() {
       map.panTo(latlng);
     });
  }
