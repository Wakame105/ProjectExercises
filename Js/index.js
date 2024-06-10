'use stript';
let map;                                    //マップ
var center={lat:34.682754, lng:135.159659}; //使うことない中心の定数
var infoWindow;                             //今は使っていない情報ウインドウ
let data;                                   //csvの中のデータを取る用の変数                        
var TMarkerExpired=true;                    //トイレのマーカー存在フラグ
var TMarkers=[];                            //トイレのマーカーの配列

//トグルスイッチ
const button = document.querySelector('button');
button.addEventListener('click',toggleDisplay);
function toggleDisplay(){
  if(!TMarkerExpired)
  {
    for(let i=0;i<TMarkers.length;i++)
    {
    TMarkers[i].setMap(null);
    }
    TMarkerExpired=true;
    TMarkers=[];
    console.log(TMarkers);
  }
  else
  {
  MKtoiletMarker();  
  }
}

//トイレのマーカーを打つ関数
async function MKtoiletMarker(){
  if(TMarkerExpired)
  {
  const { AdvancedMarkerView } = await google.maps.importLibrary("marker");
  //==CSVから読み取ったデータを一個ずつマーカーを打っていく==
  if(data.length<1)
    {
      alert('warmingnet');
    }
  for(let i=1;i<data.length;i++)
    {
    const marker_lat = Number(data.slice(i,i+1).map(x=> `${x[2]}`).join(''));
    const marker_lng = Number(data.slice(i,i+1).map(x=> `${x[3]}`).join(''));
    const marker_all = { lat: marker_lat, lng: marker_lng }; 
    // console.log(marker_lat);
    // console.log(marker_lng);
    // console.log(marker_all);
    const marker3 = new AdvancedMarkerView(
      {
      map:map,
      position: marker_all,
      //collisionBehavior: REQUIRED,
      //icon:'P_20240420_080129.jpg'
      });
      TMarkers.push(marker3);
    }
    TMarkerExpired=false;
  }
}
//ジオロケーションのオプション
var options = {
  enableHighAccuracy: true,
  timeout: 1000,
  maximumAge: 0
};

//現在位置を取ってくる関数
function getLocationPromise ()
{
  return new Promise((resolve, reject) => {
      navigator.geolocation.watchPosition(resolve, reject, options);
  });
}

//マーカーの背景色を変更する関数
function changebackgroundColor(){
  const pinViewBackground = new google.maps.marker.PinView({
    background: "#FBBC04",
  });
  return pinViewBackground.element;
}


//CSVデータを読み取る関数
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
  //検証用にサイトに直接表示していた跡
}

//ここから下がマップの処理
async function initMap() {
  
  loadCSVData();
 //ここで現在地の座標(緯度経度を取ってくる)
  const position = await getLocationPromise();
  let Current_Pos={ lat: 34.6996256, lng: 135.1913718};
  Current_Pos = { lat: position.coords.latitude, lng: position.coords.longitude };
  // ライブラリの要求
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

  //マーカーの優先度
  //let collisionBehavior = new google.maps.CollisionBehavior.REQUIRED;

  // マップの中心地を指定
  map = new Map(document.getElementById("map"), {
    zoom: 17,
    center: Current_Pos,
    mapId: "DEMO_MAP_ID",
  });
  //現在地のマーカー
  let m_m = new AdvancedMarkerView({
    map:map,
    position: Current_Pos,
    title: "現在地",
    content: changebackgroundColor(),
    //collisionBehavior: REQUIRED_AND_HIDES_OPTIONAL,
    //icon:'./Source/P_20240420_091034.jpg'  //ピンを画像にも置き換え可能
  });
  
  MKtoiletMarker();
    //情報窓をクリックしたら出す
  infoWindow = new google.maps.InfoWindow({
    content: '<div class="sample">TAM 三宮</div>'
  });
  m_m.addListener('gmp-click', function(){
    infoWindow.open(map,m_m);
  });

  
  //緯度経度を調べる
  var geocoder;
  geocoder = new google.maps.Geocoder();

  geocoder.geocode(
    {
      'address': '愛媛県松山市丸之内１' // ここに住所を入れると...?
    }
    , function(results, status) 
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

initMap();
//memo===================================

