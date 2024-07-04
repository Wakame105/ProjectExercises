'use stript';
let map;                                    //マップ
var center={lat:34.682754, lng:135.159659}; //使うことない中心の定数
var infoWindow;                             //情報ウインドウ
let data;                                   //csvの中のデータを取る用の変数                        
var TMarkerExpired=true;                    //トイレのマーカー存在フラグ
var TMarkers=[];                            //トイレのマーカーの配列
var OpenWindow;                             //情報ウインドウ
var openFlg=false;                          //
var m_position={};                          //自座標のワールド関数
var ToiletDistance_T=[];                    //トイレへの距離の集まり
var ToiletDistance=[];                      //トイレへの距離
var ResponseList=[];
var ToiletNameList=[];

//トグルスイッチ
const button = document.querySelector('#h-button');
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
  }
  else
  {
  MKtoiletMarker();
  }
}
//クリック処理をまとめたもの

if($('#search_tab').length > 0)
{
  var tab_toilet = $('#tab_toilet');
  var tab_ATC = $('#tab_ATC');
  var search_toilet = $('#search_toilet');
  var search_ATC = $('#search_ATC');
  tabSelect(tab_toilet,tab_ATC,search_toilet,search_ATC);
  tabSelect(tab_ATC,tab_toilet,search_ATC,search_toilet);
}

function tabSelect(tab,tab2,search,search2)
{
  tab.on('click',function(){
    if(search.hasClass('active'))
    {
      search.slideUp('fast');
      search.removeClass('active');
      $(this).removeClass('active');
    }
    else
    {
      search.slideDown('fast');
      search.addClass('active');
      $(this).addClass('active');
      if(search2.hasClass('active'))
      {
        search2.slideUp('fast');
        search2.removeClass('active');
        tab2.removeClass('active');
      }
    }
  });
}

//(制作中)検索ボタン
async function toggleSearch(){
  
  
}

//現在地からの距離格納する関数
async function SetDistance(latA ,lngA,BNo,BName){
  const { DistanceMatrixService } = await google.maps.importLibrary("routes");

  let origin1 = {lat: m_position.coords.latitude,lng: m_position.coords.longitude};
  const origin2 = 'Now Position';
  const destinationA = 'Where';
  let destinationB = {lat: latA, lng: lngA};

  var distanceService = new google.maps.DistanceMatrixService();
  const request=
  {
    origins:[origin1,origin2],
    destinations:[destinationA,destinationB],
    travelMode: 'WALKING',
  };
  distanceService.getDistanceMatrix(request).then((response)=>{
    //console.log(response);
    //console.log(response.rows[0].elements[1].distance.value);
    let distance =  response.rows[0].elements[1].distance.value;
    ResponseList.push({distance,BNo,BName});
    ToiletDistance.push(distance);
    ToiletNameList.push(BName);
  })

}

async function PostSetDistance()
{
  console.log(ResponseList);
  console.log(ToiletDistance);
  //=============================================================
  let into;
  let fl_struct;
  let fl_num=[];
  let fl_name=[];
  //一番大きいのを3回出す処理
  for(let i=0;i<3;i++)
    {
      for(let j=0;j<ResponseList.length;j++)
      { 
        //そもそも中身がnullだった場合。
        if(into==null){
          //仮変数に代入 のち 構造体用変数にも代入
          into=ToiletDistance[j];
          fl_struct=ResponseList[j];
        }
        //もし同じ場合はスキップする
        else if(fl_num[0]==ToiletDistance[j] || fl_num[1]==ToiletDistance[j]){
          continue;
        }
        else if(into>ToiletDistance[j])
        {
          into=ToiletDistance[j];
          fl_struct=ResponseList[j];
          fl_name[i]=ToiletNameList[j];
        }
      }
      ToiletDistance_T[i]=fl_struct;
      fl_num[i]=into;
      into=null;
    }
    console.log(ToiletDistance_T);
    $('#scrollbox_text').text(fl_name[0] + 'まで' + fl_num[0]+'m');
}

//トイレのマーカーを打つ関数
async function MKtoiletMarker(){
  if(TMarkerExpired)
  {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  //==CSVから読み取ったデータを一個ずつマーカーを打っていく==
  //csvデータ読み込みエラー時の処理
  if(data==null)
    {
      alert('オイスターソースの読み込みに失敗しました。\nページを再読み込みします。' );
      window.location.reload();
    }

  for(let i=1;i<data.length;i++)
    {
    const marker_lat = Number(data.slice(i,i+1).map(x=> `${x[2]}`).join(''));
    const marker_lng = Number(data.slice(i,i+1).map(x=> `${x[3]}`).join(''));
    const marker_all = { lat: marker_lat, lng: marker_lng }; 
    const BName = (data.slice(i,i+1).map(x=> `${x[1]}`).join(''));
    const BAdress = (data.slice(i,i+1).map(x=> `${x[4]}`).join(''));
    const BWhere = (data.slice(i,i+1).map(x=> `${x[6]}`).join(''));
    var BNo = (data.slice(i,i+1).map(x=> `${x[0]}`).join(''));
    const marker3 = new AdvancedMarkerElement(
      {
      map:map,
      position: marker_all,
      title: BName,
      
      //icon:'P_20240420_080129.jpg'
      });
      TMarkers.push(marker3);

      //情報ウィンド表示
      const info = new google.maps.InfoWindow({
        content: BName+'（'+BWhere+'）',
      });
      //マーカーをクリックして情報ウインドが出ていなければ表示し、
      //出ていればさっきまでのを閉じて新しく表示するか、閉じるか判別する処理
      marker3.addListener('gmp-click', function()
      {
        if(!openFlg){
          OpenWindow=info;
          openFlg=true;
          info.open(map,marker3);
          }
        else{
           if(OpenWindow!=info){
            OpenWindow.close();
            OpenWindow=info;
            openFlg=true;
            info.open(map,marker3);
            }
            else{
            openFlg=false;
            info.close();
            }
        }
      });
      info.addListener('visible',function()
      {
        map.panTo(marker_all);
      });
      //距離を出す関数にトイレの数分入れる。
      SetDistance(marker_all.lat,marker_all.lng,BNo,BName);
    }
    TMarkerExpired=false;
  }
  setTimeout(()=>{
    PostSetDistance();
  },1000);
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

async function SetPosition(po){
  m_position = po;
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
}

//ここから下がマップの処理
async function initMap() {
  
  loadCSVData();
 //ここで現在地の座標(緯度経度を取ってくる)
  const position = await getLocationPromise();
  if(position==null)
    {
      alert('データの読み込みに失敗' );
      window.location.reload();
    }
  let Current_Pos={ lat: 34.6996256, lng: 135.1913718};
  Current_Pos = { lat: position.coords.latitude, lng: position.coords.longitude };
  SetPosition(position);
  // ライブラリの要求
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerView } = await google.maps.importLibrary("marker");
  const { collisionBehavior } = await  google.maps.importLibrary("marker");

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
    //collisionBehavior: collisionBehavior.REQUIRED_AND_HIDES_OPTIONAL,
    //icon:'./Source/P_20240420_091034.jpg'  //ピンを画像にも置き換え可能
  });
  
  //トイレのマーカを作る
  MKtoiletMarker();
    //情報窓をクリックしたら出す
  let MInfoWindow = new google.maps.InfoWindow({
    content: '<div class="sample">TAM 三宮</div>'
  });
  m_m.addListener('gmp-click', function(){
    MInfoWindow.open(map,m_m);
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
        // console.group('Success');
        // console.log(results[0].geometry.location);
        // console.log(status);
        //マーカー
        const marker = new AdvancedMarkerView({
        map: map,
        position: results[0].geometry.location,
        title: "松本城",
  });
        } else 
        { // 失敗した場合
        // console.group('Error');
        // console.log(results);
        // console.log(status);
        }
    });
}


await initMap();
console.log(ToiletDistance)
//memo===================================
//右か左に最初からリストを出しておく。
//スマホからの利便性向上
