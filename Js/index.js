'use stript';
let map;                                    //マップ
var center={lat:34.682754, lng:135.159659}; //使うことない中心
var infoWindow;                             //今は使っていない情報ウインドウ
let data;                                   //csvの中のデータ

//現在位置を取ってくる
var options = {
  enableHighAccuracy: true,
  timeout: 1000,
  maximumAge: 0
};

function getLocationPromise () {
  return new Promise((resolve, reject) => {
      navigator.geolocation.watchPosition(resolve, reject, options);
  });
}

async function loadCSVData(){
  const response = await fetch('Source/wcdata_UTF8.csv');
  const text = await response.text();
  data = text.trim().split('\n')
    .map(line => line.split(',').map(x => x.trim()));
  // const articles = data.slice(1)
  //   .map(x => `
  //     <article>
  //       <h3>${x[0]}</h3>
  //       <p>${x[1]}</p>
  //       <p>${x[3]}</p>
  //     </article>
  //   `)
  //   .join('');
  //for(let i=0;i<data.length-1;i++)
  // document.getElementById('js-csv').innerHTML = articles;
  initMap();
}

//ここから下がマップの処理
async function initMap() {
  
 

  const position = await getLocationPromise();

  //ここで現在地の座標(緯度経度を取ってくる)
  let Current_Lcn={ lat: 34.6996256, lng: 135.1913718};
  Current_Lcn = { lat: position.coords.latitude, lng: position.coords.longitude };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: Current_Lcn,
    mapId: "DEMO_MAP_ID",
  });
  const m_m = new AdvancedMarkerView({
    map:map,
    position: Current_Lcn,
    title: "current_Lcn"
    //icon:'P_20240420_080129.jpg'
  });
  // マーカー
  // const marker2 = new AdvancedMarkerView({
  //   map:map,
  //   position: marker_all
  //   //icon:'P_20240420_080129.jpg'
  // });

  //=========================================================================
  for(let i=1;i<data.length;i++)
    {
    const marker_lat = Number(data.slice(i,i+1).map(x=> `${x[2]}`).join(''));
    const marker_lng = Number(data.slice(i,i+1).map(x=> `${x[3]}`).join(''));
    const marker_all = { lat: marker_lat, lng: marker_lng }; 
    console.log(marker_lat);
    console.log(marker_lng);
    console.log(marker_all);
    const marker3 = new AdvancedMarkerView(
      {
      map:map,
      position: marker_all
      //icon:'P_20240420_080129.jpg'
      });
    }

  infoWindow = new google.maps.InfoWindow({
    content: '<div class="sample">TAM 三宮</div>'
  });
  // marker2.addListener('gmp-click', function(){
  //   infoWindow.open(map,marker2);
  // });

  //緯度経度を調べる
  var geocoder;
  geocoder = new google.maps.Geocoder();

  geocoder.geocode(
    {
      'address': '愛媛県松山市丸之内１' // TAM 東京
    }, function(results, status) 
    { // 結果
        if (status === google.maps.GeocoderStatus.OK) 
        { // ステータスがOKの場合
        console.group('Success');
        console.log(results[0].geometry.location);
        console.log(status);
        //マーカー, positioned at Uluru
        const marker = new AdvancedMarkerView({
        map: map,
        position: results[0].geometry.location
  });
          } else 
          { // 失敗した場合
          console.group('Error');
           console.log(results);
           console.log(status);
          }
    });
  // infoWindow = new google.maps.InfoWindow({ // 吹き出しの追加
  //   content: '<div class="sample">TAM 大阪</div>' // 吹き出しに表示する内容
  // });
  // marker2.addListener('click', function() { // マーカーをクリックしたとき
  //   infoWindow.open(map, marker2); // 吹き出しの表示
  // });
}




loadCSVData();
