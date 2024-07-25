'use stript';
var map;                                    //変わることないワールドマップ変数
var center={lat:34.682754, lng:135.159659}; //使うことない中心の定数
var infoWindow;                             //情報ウインドウ、ワールド変数
let data;                                   //csvの中身がすべて入ったワールド変数                        
var TMarkerExpired=true;                    //トイレのマーカー存在フラグ
var TMarkers=[];                            //トイレのマーカーのワールド配列
var OpenWindow;                             //現在の情報ウインドウ変数
var openFlg=false;                          //情報ウインドウが開いているかのフラグ
var m_position={};                          //自座標のワールド関数
var ToiletLatLngList=[];                    //トイレの緯度経度だけの配列
var ResponseList=[];                        //トイレへの距離・名称・緯度経度等が纏めて入っている
//トグルスイッチ  トイレの表示非表示ボタンを押したら(クリック)情報ウインドウの生存フラグを確認し、有れば消す。無ければ生成する。
const button = document.querySelector('#h-button');
button.addEventListener('click',toggleDisplay);
function toggleDisplay(){
  if(!TMarkerExpired)
  {
    for(let i=0;i<TMarkers.length;i++)
    {
    TMarkers[i].setMap(null);               //情報ウインドウをこの世から消す。
    }
    TMarkerExpired=true;
    TMarkers=[];
  }
  else
  {
  MKtoiletMarker();                         //情報ウインドウ作成。
  }
}
//クリック処理をまとめたもの
//検索ボタンを押すと(クリック)テキストの内容を取り、ジオコーディング(と夜)に掛ける
const button3 = document.querySelector('#k-button');
button3.addEventListener('click',clickbutton);
function clickbutton(){
  const text_area = $('#k-text').val();
 
  let geocoder1;
  loader.style.display = 'flex';
  setTimeout(function() {
    loader.style.display = 'none';
  }, 500);

  geocoder1 = new google.maps.Geocoder();             //ジオコーディング型を読んで

  geocoder1.geocode( {'address': text_area }          //テキストエリアにある文字列で検索した結果があったらOKなかったらアラートを設定
    , function(results, status) 
    { // 結果
        if (status === google.maps.GeocoderStatus.OK) 
        { // ステータスがOKの場合
          const latlng=results[0].geometry.location;
          const ConvertLatLng = ConvertLatLngToObject(latlng);
          map.panTo(latlng);
          SetPosition(ConvertLatLng);
          ReSetDistance();
        }
         else 
        { // 失敗した場合
         console.group('Error');
         alert('検索結果なし。');
        }
    });
}
function ConvertLatLngToObject(latlng){
  return {lat: latlng.lat(),lng:latlng.lng()};
}

const Stext_form = document.getElementById("k-text");//入力フォームをエンターキーで検索するための関数
Stext_form.addEventListener("keydown",(e) =>{
  if(e.key === "Enter"){
    const btn_search = document.getElementById("k-button");
    btn_search.dispatchEvent(new PointerEvent('click'));// clickイベントを発生させて、送り込む
    e.preventDefault(); // Enterキー入力を他に伝搬させないために
  }
  return false;
});


if($('#search_tab').length > 0)//「トイレ」と「はんばいき」の押したら下がってくる処理群
{
  var tab_toilet = $('#tab_toilet');
  var tab_ATC = $('#tab_ATC');
  var tab_tS = $('.T_scrollbox_text');
  var search_toilet = $('#search_toilet');
  var search_ATC = $('#search_ATC');
  tabSelect(tab_toilet,tab_ATC,search_toilet,search_ATC,tab_tS);
  tabSelect(tab_ATC,tab_toilet,search_ATC,search_toilet);
}

document.addEventListener("DOMContentLoaded", function() {
  // ページの読み込みが完了したら、ローダーを非表示にする
  //const loader = document.getElementById('loader');
  //loader.style.display = 'none';
  
  // デモとして3秒後にローダーを非表示にする
  setTimeout(function() {
      loader.style.display = 'none';
  }, 300); 
});

function Geocoding(address,flg) //返り値がうまくいかないため使えない関数
{
  var geocoder1;
  geocoder1 = new google.maps.Geocoder();

  geocoder1.geocode( {'address': address }
    , function(results, status) 
    { // 結果
        if (status === google.maps.GeocoderStatus.OK) 
        { // ステータスがOKの場合
          const latlng=results[0].geometry.location;
          if(flg){map.panTo(latlng);}
          return new Promise((resolve)=> {
            setTimeout(() => {
              resolve(latlng);
            }, 10);
          });
        }
  
         else 
        { // 失敗した場合
         console.group('Error');
         alert('検索結果なし。');
        }
    });

  
}

function tabSelect(tab,tab2,search,search2,tab3) //タブセレクト(名前通り)
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

  if(tab3!=null)
  {
    tab3.on('click',function(){
      search.slideUp('slow');
      search.removeClass('active');
      $(this).removeClass('active');
  })
  }
}

function haversine_distance(mk1, mk2) {
  var R = 6371.0710; // Radius of the Earth in miles
  var rlat1 = mk1.lat * (Math.PI/180);
   // Convert degrees to radians
  var rlat2 = mk2.lat * (Math.PI/180);
   // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (mk2.lng-mk1.lng) 
              * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R 
  * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)
  +Math.cos(rlat1)*Math.cos(rlat2)
  *Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}

//現在地からの距離格納する関数
async function SetDistance(lat ,lng,BNo,BName){
  // const { DistanceMatrixService } = await google.maps.importLibrary("routes");

   let origin1 = {lat: m_position.lat,lng: m_position.lng};
  //DistanceMatrixAPIを使用していた名残。ものすごくお金がかかっていたので使用停止2024/7/9。  
  /*
  const origin2 = 'Now Position';
  const destinationA = 'Where';
  let destinationB = {lat: lat, lng: lng};

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
    ToiletLatLngList.push({lat,lng});
  })*/
  let distance = haversine_distance(origin1,{lat:lat,lng:lng});
  distance = distance * 1000;
  distance = Math.round(distance);

  ResponseList.push({distance,BNo,BName});
  ToiletLatLngList.push({lat:lat,lng:lng});
}
//再計算用関数
async function ReSetDistance(){
  // ResponseList=null;
  console.log(ToiletLatLngList);
  for(let i=0;i<data.length-1;i++)
  {
    const origin1 = {lat: m_position.lat,lng: m_position.lng};
    let distance = haversine_distance(origin1,{lat:ToiletLatLngList[i].lat,lng:ToiletLatLngList[i].lng});
    distance = distance * 1000;
    distance = Math.round(distance);
    ResponseList[i].distance=distance;
  }
  console.log(ResponseList);
  setTimeout(()=>{
    PostSetDistance();
  },100);
}

async function PostSetDistance()
{
  //=============================================================
  let into;
  let fl_num=[];
  let fl_name=[];
  let fl_LatLng=[];
  //一番大きいのを3回出す処理
  for(let i=0;i<3;i++)
    {
      for(let j=0;j<ResponseList.length;j++)
      { 
        let distance = ResponseList[j].distance;
        //そもそも中身がnullだった場合。
        if(into==null){
          //仮変数 into に代入 
          into = distance;
        }
        //もし同じ場合はスキップする
        else if(fl_num[0]==distance || fl_num[1]==distance){
          continue;
        }
        //そして、仮変数に入っているよりも近かった(小さい)場合入れ替える
        else if(into>distance)
        {
          into=distance;
          fl_name[i]=ResponseList[j].BName;
          fl_LatLng[i] = ToiletLatLngList[j]; 
        }
      }
      fl_num[i]=into;
      into=null;
    }
    //トイレを近い順に並べたところを表示する
    $('#TF_scrollbox_text').text(fl_name[0] + 'まで' + fl_num[0]+'m');
    $('#TS_scrollbox_text').text(fl_name[1] + 'まで' + fl_num[1]+'m');
    $('#TT_scrollbox_text').text(fl_name[2] + 'まで' + fl_num[2]+'m');
    //トイレを近い順に並べた所をクリックするとそこに飛ぶ
    $("#TF_scrollbox_text").on("click",function(){
      map.panTo(fl_LatLng[0]);
    });
    $("#TS_scrollbox_text").on("click",function(){
      map.panTo(fl_LatLng[1]);
    });
    $("#TT_scrollbox_text").on("click",function(){
      map.panTo(fl_LatLng[2]);
    });
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
      const marker3 = new AdvancedMarkerElement({
        map:map,
        position: marker_all,
        title: BName,
        //icon:'P_20240420_080129.jpg'
        });
      TMarkers.push(marker3);

      //情報ウィンド表示
      var offset = new google.maps.Size(-10,6);
      const info = new google.maps.InfoWindow({
        content: BName+'（'+BWhere+'）',
        pixelOffset: offset,
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
          //  今開いているウインドウかどうか確認して、違がければ今のを閉じて、他のを開く
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
      SetDistance(marker_all.lat,marker_all.lng,BNo,BName+'（'+BWhere+'）');
    }
    TMarkerExpired=false;
  }
  console.log(ResponseList);
  setTimeout(()=>{
    PostSetDistance();
  },500);
}
//ジオロケーションのオプション
var options = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

//現在位置を取ってくる関数とそのエラー関数
function getLocationPromise ()
{
  return new Promise((resolve, reject) => {
      navigator.geolocation.watchPosition(resolve, GetPositionError, options);
  });
}
function GetPositionError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  alert("現在地の取得に失敗しました。\nそのまましばらくお待ち頂くか、再度時間をおいてお試しください。");
}
async function SetPosition(po){
  m_position = {
    lat: po.lat,
    lng: po.lng
  };
  console.log(m_position);
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
    let a;
}

//ここから下がマップの処理
async function initMap() {
 //ここで現在地の座標(緯度経度を取ってくる)
  let position = await getLocationPromise();
  if(position==null)
    {
      alert('データの読み込みに失敗' );
      window.location.reload();
    }
  let Current_Pos={ lat: 34.6996256, lng: 135.1913718};
  Current_Pos = { lat: position.coords.latitude, lng: position.coords.longitude };
  SetPosition(Current_Pos);
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
    content: '<div class="sample">現在地</div>'
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

loadCSVData();
setTimeout(()=>{
  initMap();
},100);
//memo===================================
//スマホからの利便性向上
