function fetchJSON(url, callback) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => callback(data))
    .catch(error => console.error(error));
}

function createCards(data, startIndex, endIndex) {
  var cardsContainer = document.getElementById("cardsContainer");
  var cardTemplate = document.getElementById("cardTemplate").content;

  for (var i = startIndex; i < endIndex; i++) {
    var item = data[i];
    var cardElement = cardTemplate.cloneNode(true).querySelector(".card");

    cardElement.querySelector("[data-name]").textContent = item["氏名"];
    cardElement.querySelector("[data-kana]").textContent = item["かな"];
    cardElement.querySelector("[data-house]").textContent = item["衆参"];
    cardElement.querySelector("[data-senkyoku]").textContent = item["選挙区"];
    cardElement.querySelector("[data-party]").textContent = item["政党"];
    cardElement.querySelector("[data-sanpi]").textContent = item["賛否"];
    cardElement.querySelector("[data-zipcode]").textContent = item["国会_郵便番号"];
    cardElement.querySelector("[data-address]").textContent = item["国会_住所"];
    cardElement.querySelector("[data-prefecture]").textContent = item["都道府県"];
    cardElement.querySelector("[data-area]").textContent = item["区"];
    cardElement.querySelector("[data-page]").setAttribute("href", item["個別ページ"]);
    cardElement.querySelector("[data-photo]").setAttribute("src", item["img"]);
   // もし値がnullの場合にdata-nullクラスを追加
    if (!item["WEBサイト"]) {
      cardElement.querySelector("[data-website]").classList.add("data-null");
    } else {
      cardElement.querySelector("[data-website]").setAttribute("href", item["WEBサイト"]);
    }

    if (!item["ブログ"]) {
      cardElement.querySelector("[data-blog]").classList.add("data-null");
    } else {
      cardElement.querySelector("[data-blog]").setAttribute("href", item["ブログ"]);
    }

    if (!item["Twitter"]) {
      cardElement.querySelector("[data-twitter]").classList.add("data-null");
    } else {
      cardElement.querySelector("[data-twitter]").setAttribute("href", item["Twitter"]);
    }

    if (!item["Facebook"]) {
      cardElement.querySelector("[data-facebook]").classList.add("data-null");
    } else {
      cardElement.querySelector("[data-facebook]").setAttribute("href", item["Facebook"]);
    }
    cardElement.querySelector("[data-letter]").textContent = item["手紙枚数"];

    var sanpiElement = cardElement.querySelector("[data-sanpi]");
    var sanpiValue = item["賛否"];
    sanpiElement.textContent = sanpiValue.replace(/^\d+\./, ''); // 数字部分を削除して表示

    // 賛否に応じてテキスト色を設定
    if (sanpiValue === "1.賛成") {
      sanpiElement.style.color = "red";
    } else if (sanpiValue === "2.どちらかと言えば賛成") {
      sanpiElement.style.color = "lightcoral";
    } else if (sanpiValue === "3.どちらとも言えない") {
      sanpiElement.style.color = "dimgray";
    } else if (sanpiValue === "4.どちらかと言えば反対") {
      sanpiElement.style.color = "royalblue";
    } else if (sanpiValue === "5.反対") {
      sanpiElement.style.color = "mediumblue";
    } else if (sanpiValue === "6.無回答") {
      sanpiElement.style.color = "grey";
    }

    cardsContainer.appendChild(cardElement);
  }
}

function clearCards() {
  var cardsContainer = document.getElementById("cardsContainer");
  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }
}

var jsonData; // JSONデータを保持する変数
var totalMemberCount = 0; // 全議員数を保持する変数
var maxItemsToShow = 4; // 一度に表示する最大項目数
var currentIndex = 0; // 現在のインデックス
var currentFilters = {
  name: "",
  house: [],
  prefecture: "",
  party: [],
  sanpi: []
};

function fetchFilteredData() {
  var url = "https://raw.githubusercontent.com/marriageforalljapan/letters-to-giin/main/giin.json";
  var filteredUrl = url + "?" + Date.now(); // リクエストをキャッシュしないためにクエリパラメータを追加

  fetchJSON(filteredUrl, function(data) {
    jsonData = data; // データをjsonData変数に代入
    totalMemberCount = countTotalMembers(jsonData); // 全議員数をカウント
    applyFilters();
  });
}

function countTotalMembers(data) {
  return data.length;
}



function showMoreItems() {
  var startIndex = currentIndex; // 現在のインデックスを保持
  var endIndex = currentIndex + maxItemsToShow; // endIndex を計算

  if (endIndex > jsonDataFiltered.length) {
    endIndex = jsonDataFiltered.length; // endIndex を調整
  }

  createCards(jsonDataFiltered, startIndex, endIndex);

  currentIndex = endIndex; // インデックスを更新

  var moreButtonContainer = document.getElementById("moreButtonContainer");
  if (currentIndex < jsonDataFiltered.length) {
    moreButtonContainer.style.display = "block"; // 「もっと見る」ボタンを表示
  } else {
    moreButtonContainer.style.display = "none"; // 「もっと見る」ボタンを非表示
  }

  var displayedItemCount = currentIndex; // 表示されたデータの件数
  document.getElementById("itemCount").textContent = "表示されたデータの件数: " + displayedItemCount;
}


var myChart4; // グローバルスコープで myChart4 変数を宣言

function createChart(filteredData) {
  var totalCount = filteredData.length;
  var agreeCount = 0;
  var somewhatAgreeCount = 0;
  var neitherAgreeNorDisagreeCount = 0;
  var somewhatOpposeCount = 0;
  var opposeCount = 0;
  var noResponseCount = 0;

  filteredData.forEach(function(item) {
    var sanpiValue = item["賛否"];
    if (sanpiValue === "1.賛成") {
      agreeCount++;
    } else if (sanpiValue === "2.どちらかと言えば賛成") {
      somewhatAgreeCount++;
    } else if (sanpiValue === "3.どちらとも言えない") {
      neitherAgreeNorDisagreeCount++;
    } else if (sanpiValue === "4.どちらかと言えば反対") {
      somewhatOpposeCount++;
    } else if (sanpiValue === "5.反対") {
      opposeCount++;
    } else if (sanpiValue === "6.無回答") {
      noResponseCount++;
    }
  });

  var ctx = document.getElementById("myChart4").getContext("2d");

  // チャートが既に存在する場合は破棄する
  if (myChart4) {
    myChart4.destroy();
  }

  myChart4 = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["賛成", "どちらかと言えば賛成", "どちらとも言えない", "どちらかと言えば反対", "反対", "無回答"],
      datasets: [
        {
          data: [agreeCount, somewhatAgreeCount, neitherAgreeNorDisagreeCount, somewhatOpposeCount, opposeCount, noResponseCount],
          backgroundColor: ["rgba(255, 0, 0, 0.8)", "rgba(238, 97, 130, 0.8)", "rgba(105, 105, 105, 0.8)", "rgba(65, 105, 225, 0.8)", "rgba(0, 0, 205, 0.8)", "rgba(192, 192, 192, 0.8)"],
          borderColor: "white",
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: false,
      cutoutPercentage: 50,
      rotation: -90,
      circumference: 180,
      title: {
        display: true,
        fontSize: 20,
        text: "ドーナツチャート(doughnut)"
      },
      legend: {
        position: "right"
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function sortByName(filteredData) {
  return filteredData.sort((a, b) => a["かな"].localeCompare(b["かな"]));
}

function sortByParty(filteredData) {
  return filteredData.sort((a, b) => a["政党"].localeCompare(b["政党"]));
}

function sortBySanpi(filteredData) {
  return filteredData.sort((a, b) => {
    const sanpiOrder = {
      "1.賛成": 1,
      "2.どちらかと言えば賛成": 2,
      "3.どちらとも言えない": 3,
      "4.どちらかと言えば反対": 4,
      "5.反対": 5,
      "6.無回答": 6,
    };
    return sanpiOrder[a["賛否"]] - sanpiOrder[b["賛否"]];
  });
}

function applyFilters() {
  currentIndex = maxItemsToShow;
  clearCards();

  var filteredData = jsonData.filter(function(item) {
    var nameMatch = currentFilters.name === "" || item["氏名"].toLowerCase().includes(currentFilters.name);
    var houseMatch = currentFilters.house.length === 0 || currentFilters.house.includes(item["衆参"]);
    var prefectureMatch = currentFilters.prefecture === "" || item["都道府県"] === currentFilters.prefecture;
    var partyMatch = currentFilters.party.length === 0 || currentFilters.party.includes(item["政党"]);
    var sanpiMatch = currentFilters.sanpi.length === 0 || currentFilters.sanpi.includes(item["賛否"]);
    return nameMatch && houseMatch && prefectureMatch && sanpiMatch && partyMatch;
  });

  // 選択したフィルターに基づいてデータをソート
  if (currentFilters.sort === "kana") {
    filteredData = sortByName(filteredData);
  } else if (currentFilters.sort === "party") {
    filteredData = sortByParty(filteredData);
  } else if (currentFilters.sort === "sanpi") {
    filteredData = sortBySanpi(filteredData);
  }

  var filteredItemCount = filteredData.length; // ヒット件数
  jsonDataFiltered = filteredData; // フィルター後のデータを保持

  createCards(filteredData, 0, Math.min(maxItemsToShow, filteredData.length));

  var moreButtonContainer = document.getElementById("moreButtonContainer");
  if (currentIndex < filteredData.length) {
    moreButtonContainer.style.display = "block"; // 「もっと見る」ボタンを表示
  } else {
    moreButtonContainer.style.display = "none"; // 「もっと見る」ボタンを非表示
  }

  // 議員数のカウント
  document.getElementById("filteredItemCount").textContent = filteredItemCount + "名";

  // グラフの作成
  createChart(filteredData);

  // 「氏名」でソートするボタンにイベントリスナーを追加
  document.getElementById("sortByName").addEventListener("click", function() {
    currentFilters.sort = "kana";
    applyFilters();
    setSortButtonActive("sortByName");
  });

  // 「政党」でソートするボタンにイベントリスナーを追加
  document.getElementById("sortByParty").addEventListener("click", function() {
    currentFilters.sort = "party";
    applyFilters();
    setSortButtonActive("sortByParty");
  });

  // 「賛否」でソートするボタンにイベントリスナーを追加
  document.getElementById("sortBySanpi").addEventListener("click", function() {
    currentFilters.sort = "sanpi";
    applyFilters();
    setSortButtonActive("sortBySanpi");
  });
}



// ボタンのクリック時にスタイルを設定する関数
function setButtonStyle(button) {
  var activeButtons = document.getElementsByClassName("active");
  for (var i = 0; i < activeButtons.length; i++) {
    activeButtons[i].classList.remove("active");
  }
  button.classList.add("active");
}

// 選択されたソートボタンにactiveクラスを付与
function setSortButtonActive(buttonId) {
  var sortButtons = document.querySelectorAll("#sortbyoptions button");
  sortButtons.forEach(function (button) {
    if (button.id === buttonId) {
      button.classList.add("active"); // 選択中のボタンにactiveクラスを追加
    } else {
      button.classList.remove("active"); // 選択されていないボタンからactiveクラスを削除
    }
  });
}


//議員名サジェスト機能
$(document).ready(function() {
  // 議員のJSONデータを取得
  const url = 'https://raw.githubusercontent.com/marriageforalljapan/letters-to-giin/main/giin.json';
  fetchJSON(url, function(data) {
    // 議員の名前の配列を作成
    const politicianDataArray = data.map(item => ({
      name: item["氏名"],
      kana: item["かな"]
    }));

    // オートコンプリートを議員の名前で初期化します
    $("#searchInput").autocomplete({
      source: function(request, response) {
        const term = request.term.toLowerCase();
        const matchedPoliticians = politicianDataArray.filter(item =>
          item.name.toLowerCase().startsWith(term) || item.kana.toLowerCase().startsWith(term)
        );

        const matchedNames = matchedPoliticians.map(item => item.name);
        response(matchedNames);
      }
    });
  });
});


function searchByName() {
  var searchInput = document.getElementById("searchInput");
  currentFilters.name = searchInput.value.trim().toLowerCase();
  applyFilters();
}


function filterByPrefecture() {
  var filterPrefecture = document.getElementById("filterPrefecture").value;
  currentFilters.prefecture = filterPrefecture; // 都道府県のフィルターを選択
  fetchFilteredData()

  if( hoge.value == 0 ){
    hoge.style.color = '';
  }else{
    hoge.style.color = 'blue';
  } 
}



function filterByHouse(house) {
  clearCards(); // 表示中のカードをクリア
  var index = currentFilters.house.indexOf(house);

  if (index !== -1) {
    currentFilters.house.splice(index, 1); // 同じボタンがクリックされた場合はフィルターを解除
  } else {
    currentFilters.house.push(house); // フィルターを選択
  }
  applyFilters();

  var houseButtons = document.querySelectorAll("#filterbyhouse button");
  houseButtons.forEach(function (button) {
    if (currentFilters.house.includes(button.textContent)) {
      button.classList.add("active-house"); // ボタンが選択されている場合にactive-houseクラスを追加
    } else {
      button.classList.remove("active-house"); // ボタンが選択されていない場合にactive-houseクラスを削除
    }
  });
}

function filterByParty(party) {
  clearCards(); // 表示中のカードをクリア
  var index = currentFilters.party.indexOf(party);

  if (index !== -1) {
    currentFilters.party.splice(index, 1); // 同じボタンがクリックされた場合はフィルターを解除
  } else {
    currentFilters.party.push(party); // フィルターを選択
  }
  applyFilters();

  var partyButtons = document.querySelectorAll("#filterbyparty button");
  partyButtons.forEach(function (button) {
    if (currentFilters.party.includes(button.textContent)) {
      button.classList.add("active-party"); // ボタンが選択されている場合にactive-partyクラスを追加
    } else {
      button.classList.remove("active-party"); // ボタンが選択されていない場合にactive-partyクラスを削除
    }
  });
}

function filterBySanpi(sanpi) {
  clearCards(); // 表示中のカードをクリア
  var index = currentFilters.sanpi.indexOf(sanpi);

  if (index !== -1) {
    currentFilters.sanpi.splice(index, 1); // 同じボタンがクリックされた場合はフィルターを解除
  } else {
    currentFilters.sanpi.push(sanpi); // フィルターを選択
  }
  applyFilters();

  var sanpiButtons = document.querySelectorAll("#filterbysanpi button");
  sanpiButtons.forEach(function (button) {
    if (currentFilters.sanpi.includes(button.textContent)) {
      button.classList.add("active-sanpi"); // ボタンが選択されている場合にactive-sanpiクラスを追加
    } else {
      button.classList.remove("active-sanpi"); // ボタンが選択されていない場合にactive-sanpiクラスを削除
    }
  });
}

function resetSearchAndFilter() {
  var searchInput = document.getElementById("searchInput");
  searchInput.value = ""; // 検索入力をクリア

  var filterPrefecture = document.getElementById("filterPrefecture");
  filterPrefecture.value = ""; // 都道府県の選択をリセット

  var houseButtons = document.querySelectorAll("#filterbyhouse button");
  houseButtons.forEach(function (button) {
      button.classList.remove("active-house"); // active-houseクラスを削除
  });

  var partyButtons = document.querySelectorAll("#filterbyparty button");
  partyButtons.forEach(function (button) {
      button.classList.remove("active-party"); // active-partyクラスを削除
  });

  var sanpiButtons = document.querySelectorAll("#filterbysanpi button");
  sanpiButtons.forEach(function (button) {
      button.classList.remove("active-sanpi"); // active-sanpiクラスを削除
  });

  var sortButtons = document.querySelectorAll("#sortbyoptions button");
  sortButtons.forEach(function (button) {
      button.classList.remove("active"); // active-sanpiクラスを削除
  });

  currentIndex = maxItemsToShow;
  currentFilters.name = "";
  currentFilters.house = [];
  currentFilters.prefecture = "";
  currentFilters.party = [];
  currentFilters.sanpi = [];
  currentFilters.sort = "",

  clearCards();
  jsonDataFiltered = jsonData; // データをリセット
  createCards(jsonDataFiltered, 0, maxItemsToShow);

  var moreButtonContainer = document.getElementById("moreButtonContainer");
  if (currentIndex < jsonDataFiltered.length) {
    moreButtonContainer.style.display = "block"; // 「もっと見る」ボタンを表示
  } else {
    moreButtonContainer.style.display = "none"; // 「もっと見る」ボタンを非表示
  }


  // 全議員数の表示を更新
  document.getElementById("filteredItemCount").textContent = totalMemberCount + "名";

  // グラフをリセットする
  createChart(jsonDataFiltered);
}

fetchFilteredData();




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
