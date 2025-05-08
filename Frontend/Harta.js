var map;
var marker;
let markerLat;
let markerLong;
let photoList = [];
function getclickname(e) {
  sessionStorage.setItem("marker_type", JSON.stringify(e.id));
}

function initMap() {
  var markersObjArray = [];
  var infoBoxDiv = document.createElement("div");
  var infoBox = new makeInfoBox(infoBoxDiv, map);
  makeInfoBox(infoBoxDiv, map);

  var map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 3,
    styles: [
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }], // Turn off POI.
      },
      {
        featureType: "transit.station",
        stylers: [{ visibility: "off" }], // Turn off bus, train stations etc.
      },
    ],
    disableDoubleClickZoom: true,
    streetViewControl: true,
  });

  var infoBoxDiv = document.createElement("div");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

  let contentString = [
    '<form id="mapForm" class="w3-center" style="background-color: #c9e8c9;padding:1% ;width:500px;">',
    '<div class="form first w3-center" style="background-color: #c9e8c9;" >',
    '<div class="details personal w3-center" >',
    '<h5 class="w3-center title" style=font-size:28px;>Add incident</h5>',
    '<div class=" fields">',
    '<div class=" input-field" >',
    "<label style=font-size:19px;padding-left:38%;margin-top:3%;margin-bottom:1%;>Incident title</label>",
    '<input type="text" style="margin-left:38%; margin-bottom:4%;" name= "incident_title" placeholder="Add the incident title" required>',
    "</div>",
    '<div input-field" >',
    "<label style=font-size:19px; style='margin-top:2%;margin-bottom:%;'>Add incident description</label>",
    "<br/>",
     "<br/>",
    '<textarea style =  "  box-sizing: border-box; border: 2px solid #ccc; border-radius: 4px; background-color: #f8f8f8;font-size: 16px; resize: vertical ";id="message" name="incident_description" rows="3" cols="33"></textarea>',
    " </div>",
    "<br/>",
    '<button id ="addIncidentButton" style =  " background-color: # #add8e6!important;border-radius: 5px; font-size: 16px; font-family: Source Sans Pro, sans-serif; class="nextBtn" type="submit">',
    '<span class="btnMapMenu" style=font-size:16px;>Add incident</span>',
    '<i class="uil uil-navigator"></i>',
    "  </button>",
    "</div>",
    "</div>",
    "</div>",
    "</form>",
  ].join("");

  const infowindow = new google.maps.InfoWindow({
    content: contentString,
  });

  document.addEventListener("DOMContentLoaded", updateMarkers());

  document
    .getElementById("addIncidentButton")
    .addEventListener("click", function () {
      console.log("test");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        alert("location not supported");
      }

      //callbacks
      function error(msg) {
        alert("error in geolocation");
      }

      function success(position) {
        var lats = position.coords.latitude;
        var lngs = position.coords.longitude;
        markerLat = lats;
        markerLong = lngs;
        console.log(markerLat);
        console.log(markerLong);
        sessionStorage.setItem("marker_lat", JSON.stringify(markerLat));
        sessionStorage.setItem("marker_long", JSON.stringify(markerLong));
        var myLatlng = new google.maps.LatLng(lats, lngs);
        const markerObj = placeMarker(
          myLatlng,
          JSON.parse(sessionStorage.getItem("marker_type"))
        );
        markersArray.push(markerObj)
        markerObj.addListener("click", () => {
          infowindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
          });
        });

        google.maps.event.addListener(infowindow, "domready", function () {
        const form = document.getElementById("mapForm");

        //   document
        //     .querySelector("#fileUpload")
        //     .addEventListener("change", (event) => {
        //       handleImageUpload(event);
        //     });

        //   const handleImageUpload = (event) => {
        //     event.preventDefault();
        //     files = event.target.files;
        //     let fileList = {};

        //     const formData = new FormData();
        //     for (const file of files) {
        //       formData.append("files", file, file.name);
        //     }
        //     console.log(files);
        //     fetch("http://localhost:8080/images/incidents/pics", {
        //       method: "POST",
        //       body: formData,
        //       header: {
        //         "Access-Control-Allow-Origin": "*",
        //       },
        //     })
        //       .then((response) => response.json())
        //       .then((data) => console.log(data))
        //       .then((data) => (res = data))
        //       .then(() =>
        //         sessionStorage.setItem(
        //           "incidents_photo_paths",
        //           JSON.stringify(res)
        //         )
        //       )
        //       .catch((error) => {
        //         console.error("Error:", error);
        //       });
        //   };

          form.addEventListener("submit", function (e) {
            e.preventDefault();
    
            const payload = new FormData(form);
            let data = {};
            for (let [key, prop] of payload) {
              data[key] = prop;
            }
            data["username"] = JSON.parse(sessionStorage.getItem("user_data")).data.username;
            console.log( JSON.parse(sessionStorage.getItem("user_data")).data.username)
            data["latitude"] = sessionStorage.getItem("marker_lat");
            data["longitude"] = sessionStorage.getItem("marker_long");
            data["marker_type"] = JSON.parse(sessionStorage.getItem("marker_type"));
           // data["photo_path"]= sessionStorage.getItem("incidentsImageList")
            let dataForm = JSON.stringify(data, null, 2);
            console.log(data);
    
            fetch("http://localhost:8080/incidents/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: dataForm,
            })
              .then((res) => res.json())
              .then((data) => (res = data))
              // .then(() => sessionStorage.setItem("user_data", JSON.stringify(res)))
              .then(() => console.log(res)).then(alertify.alert('Status','Incident added!'));;
          });
        });
      }
    });

  var markersArray = [];
  var markersObject = {};

  google.maps.event.addListener(map, "click", function (event) {});

  function placeMarker(location, marker_type) {
    let icon_name;
    console.log(marker_type);
    switch (marker_type) {
      case "garbage":
        icon_name = "Markers/gunoi3.jpg";
        break;
      case "animals":
        icon_name = "Markers/animal1.jpg";
        break;
      case "flood":
        icon_name = "Markers/inundatie.jpg";
        break;
      case "biological_hazard":
        icon_name = "Markers/pericolbiologic.png";
        break;
      case "fishing":
        icon_name = "Markers/pescuit.png";
        break;
      case "air_polution":
        icon_name = "Markers/poluareaer.jpg";
        break;
      case "deforesting":
        icon_name = "Markers/defrisare.jpg";
        break;
      case "radioactivity":
        icon_name = "Markers/radioactive.jpg";
        break;
      case "pandemic":
        icon_name = "Markers/pandemie2.jpg";
        break;
      case "fire":
        icon_name = "Markers/incendiu2.png";
        break;
      default:
        console.log("Couldn't find a valid marker type");
    }
    marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        url: icon_name,
        size: new google.maps.Size(36, 50),
        scaledSize: new google.maps.Size(36, 50),
        anchor: new google.maps.Point(0, 50),
      },
    });
    return marker;
  }

  function placeMarkerByType(location, marker_type) {
    let icon_name;
    console.log(marker_type.replace(/^"(.*)"$/, '$1'))
    switch (marker_type.replace(/^"(.*)"$/, '$1')) {
      case "garbage":
        icon_name = "Markers/gunoi3.jpg";
        break;
      case "animals":
        icon_name = "Markers/animal1.jpg";
        break;
      case "flood":
        icon_name = "Markers/inundatie.jpg";
        break;
      case "biological_hazard":
        icon_name = "Markers/pericolbiologic.png";
        break;
      case "fishing":
        icon_name = "Markers/pescuit.png";
        break;
      case "air_polution":
        icon_name = "Markers/poluareaer.jpg";
        break;
      case "deforesting":
        icon_name = "Markers/defrisare.jpg";
        break;
      case "radioactivity":
        icon_name = "Markers/radioactive.jpg";
        break;
      case "pandemic":
        icon_name = "Markers/pandemie2.jpg";
        break;
      case "fire":
        icon_name = "Markers/incendiu2.png";
        break;
      default:
        console.log("Couldn't find a valid marker type");
    }
    marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        url: icon_name,
        size: new google.maps.Size(36, 50),
        scaledSize: new google.maps.Size(36, 50),
        anchor: new google.maps.Point(0, 50),
      },
    });
    markersObjArray.push(marker);
    return marker;
  }

  async function displayAllMarkers(res) {
    for (var i = 0; i < JSON.parse(res).data.length; i++) {
      var myLatlng = new google.maps.LatLng(
        JSON.parse(res).data[i].incident.latitude,
        JSON.parse(res).data[i].incident.longitude
      );
      markersObject["latitude"] = JSON.parse(res).data[i].incident.latitude;
      markersObject["longitude"] = JSON.parse(res).data[i].incident.longitude;
      markersArray.push(JSON.parse(JSON.stringify(markersObject)));
    }

    latLngList = {};
    markerTypeList = {};
    markerList = [];
    markerObject = {};
 
    for (let i = 0; i < markersArray.length; i++) {
      latLngList[i] = new google.maps.LatLng(
        markersArray[i].latitude,
        markersArray[i].longitude
      );
    }

    for (let j = 0; j < JSON.parse(res).data.length; j++) {
      markerTypeList[j] = JSON.parse(res).data[j].incident.marker_type;
    }

    for (let k = 0; k < JSON.parse(res).data.length; k++) {
      let markerObject = {
        latLong: latLngList[k],
        markerType: markerTypeList[k],
      };
      markerList[k] = markerObject;
    }

    let displayedMarkerList = [];

    for (let l = 0; l < markerList.length; l++) {
      let markerDisplayObj = placeMarkerByType(
        // here I create the markers and place them on the map
        markerList[l].latLong,
        markerList[l].markerType
      );
      displayedMarkerList.push(markerDisplayObj); //here I store the marker objects on a list
    }

    for (
      let markerListItem = 0;
      markerListItem < displayedMarkerList.length;
      markerListItem++
    ) {
      inc_title = JSON.parse(res).data[markerListItem].incident.incident_title;
      inc_user = JSON.parse(res).data[markerListItem].incident.username;
      inc_id = JSON.parse(res).data[markerListItem].documentId;
    //  inc_first_name = JSON.parse(res).data[markerListItem].incident.first_name;
     // inc_last_name = JSON.parse(res).data[markerListItem].incident.last_name;
      inc_description =
        JSON.parse(res).data[markerListItem].incident.incident_description;
      displayedMarkerList[markerListItem].addListener(
        "click",
        (function (inc_title, inc_description,inc_id,inc_user) {
          return function () {

            let contentStringAllMarkers = [
              '<form id="mapForm"  style="background-color: #c9e8c9;padding:1% ;width:400px;">',
              '<div  style="background-color: #c9e8c9;">',
              '<div class="fields">',
              '<div style=font-size:15px;>',
               '<h4 style ="margin-left:20%; margin-bottom: 35px">' + inc_title +'</h4>' ,
              "</div>",
              '<div class="input-field">',
              "<label  style='margin-left:5px'; font-size:17px; margin-botton:0px; margin-top:15px;' >Username </label>",
              '<p style ="margin-left:3%; margin-bottom: 35px">' + inc_user +'</p>' ,
              "<label  style='margin-left:5px'; font-size:17px; margin-botton:0px; margin-top:15px;' >Description</label>",
              '<textarea id="message"  style="margin-left:2%;width: 380px; box-sizing: border-box; border: 2px solid #ccc; border-radius: 4px; background-color: #f8f8f8;font-size: 16px; resize: vertical;"   outline: none;font-size: 11px; font-weight: 400; color: #333; border-radius: 5px;border: 1px solid #aaa;"  name="incident_description" readonly rows="3" cols="33">' +
                inc_description +
                "</textarea>",
              " </div>",
              '<input id="docId" style = "display:none" value=' +
              inc_id + '  name="documentId" readonly rows="3" cols="33"> </input>',
            " </div>",
            '<br></br>',
              '<button  id="nextBtn" type="submit"  style =  " margin-left: 30%; background-color: # #add8e6!important;border-radius: 5px; font-size: 16px; font-family: Source Sans Pro, sans-serif;" >',
              '<span class="btnMapMenu" style ="margin-left:2%" >Solve this incident</span>',
              '<i class="uil uil-navigator"></i>',
              "  </button>",
              "</div>",
              '<br></br>',
              "</div>",
              "</div>",
              "</form>",
            ].join("");

            var infowindowAllMarkers = new google.maps.InfoWindow({
              content: contentStringAllMarkers,
            });
            google.maps.event.addListener(
              infowindowAllMarkers,
              "domready",
              function () {
                document
                  .getElementById("mapForm")
                  .addEventListener("submit", function (e) {
              sessionStorage.setItem("documentId",JSON.stringify(this.querySelector('#docId').value) );
              console.log("test")
              e.preventDefault();
              window.location.replace('SolveIncident.html');
              
                  });
              }
            );

            infowindowAllMarkers.open({
              anchor: this,
              map,
              shouldFocus: true,
            });
          };
        })(inc_title, inc_description,inc_id,inc_user)
      );
    }
  }

  function updateMarkers() {
    fetch("http://localhost:8080/incidents/get", {
      method: "GET",
      header: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      .then((res) => displayAllMarkers(JSON.stringify(res)))
      .catch((error) => {
        console.error("Error:", error).then(
          alertify.alert('Status','Could not read the data, make sure you are connected to internet'));
      });
  }

  setInterval(updateMarkers(), 600000);
}

function makeInfoBox(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement("div");
  controlUI.style.boxShadow = "rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px";
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "2px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.marginTop = "10px";
  controlUI.style.textAlign = "center";
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "100%";
  controlText.style.padding = "6px";
  controlText.textContent =
    "The map shows all clicks made in the last 10 minutes.";
  controlUI.appendChild(controlText);
}

let data = {
  sender: null,
  timestamp: null,
  lat: null,
  lng: null,
};


function logout()
{
   sessionStorage.clear("user_data")
   window.location.href='Main.html'
}