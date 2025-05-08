// Harta.js - Complete reimplementation
let map;
let markerLat = null;
let markerLong = null;
let markersObjArray = [];
let currentFormInfoWindow = null; // To close on reload if open

function getclickname(e) {
  sessionStorage.setItem("marker_type", JSON.stringify(e.id));
}

function getIconPath(marker_type) {
  switch (marker_type) {
    case "garbage": return "Markers/gunoi3.jpg";
    case "animals": return "Markers/animal1.jpg";
    case "flood": return "Markers/inundatie.jpg";
    case "biological_hazard": return "Markers/pericolbiologic.png";
    case "fishing": return "Markers/pescuit.png";
    case "air_polution": return "Markers/poluareaer.jpg";
    case "deforesting": return "Markers/defrisare.jpg";
    case "radioactivity": return "Markers/radioactive.jpg";
    case "pandemic": return "Markers/pandemie2.jpg";
    case "fire": return "Markers/incendiu2.png";
    default: return "Markers/generic.png";
  }
}

function initMap() {
  // Default to Bucharest for Romania; change as needed
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.4268, lng: 26.1025 },
    zoom: 6,
    styles: [
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit.station", stylers: [{ visibility: "off" }] }
    ],
    disableDoubleClickZoom: true,
    streetViewControl: true,
  });

  updateMarkers();
  setInterval(updateMarkers, 600000);

  document.getElementById("addIncidentButton").addEventListener("click", function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      alert("Geolocația nu este suportată.");
    }

    function error(msg) {
      alert("Eroare la geolocalizare.");
    }

    function success(position) {
      markerLat = position.coords.latitude;
      markerLong = position.coords.longitude;
      sessionStorage.setItem("marker_lat", JSON.stringify(markerLat));
      sessionStorage.setItem("marker_long", JSON.stringify(markerLong));
      const markerType = JSON.parse(sessionStorage.getItem("marker_type")) || "garbage"; // Default if none selected

      // Place a temporary marker for creating a new incident
      let newIncidentMarker = new google.maps.Marker({
        position: { lat: markerLat, lng: markerLong },
        map: map,
        icon: {
          url: '../' + getIconPath(markerType),
          size: new google.maps.Size(36, 50),
          scaledSize: new google.maps.Size(36, 50),
          anchor: new google.maps.Point(0, 50),
        },
        animation: google.maps.Animation.DROP
      });

      newIncidentMarker.addListener("click", function () {
        if (currentFormInfoWindow) currentFormInfoWindow.close();

        let formContent = `
          <form id="mapForm" style="background-color:#f5f9e9;padding:16px 14px;width:340px;border-radius:12px;border:1.5px solid #bbdb9b;box-shadow:0 3px 12px #8fae6a50;">
            <h3 style="color:#133b0d;font-size:20px;font-family:Inconsolata, monospace;margin-top:0;">Adaugă incident</h3>
            <div style="margin-bottom:10px;">
              <label style="font-weight:bold;">Titlu incident</label><br>
              <input type="text" name="incident_title" placeholder="Introdu titlul incidentului" style="width:98%;padding:6px;margin-bottom:6px;" required>
            </div>
            <div style="margin-bottom:10px;">
              <label style="font-weight:bold;">Descriere incident</label><br>
              <textarea name="incident_description" placeholder="Descrie incidentul" style="width:98%;padding:6px;resize:vertical;" rows="3" required></textarea>
            </div>
            <div style="margin-bottom:10px;">
              <label style="font-weight:bold;">Imagini incident</label><br>
              <input type="file" name="incident_images" id="incident_images" multiple accept="image/*" style="width:98%;padding:6px;margin-bottom:6px;">
              <div id="imagePreview" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;max-height:120px;overflow-y:auto;"></div>
            </div>
            <button type="submit" style="background:#88c531;color:#fff;padding:8px 20px;border:none;border-radius:22px;cursor:pointer;font-size:16px;">Salvează incident</button>
          </form>
        `;

        let infoWindow = new google.maps.InfoWindow({
          content: formContent
        });
        infoWindow.open(map, newIncidentMarker);
        currentFormInfoWindow = infoWindow;

        google.maps.event.addListenerOnce(infoWindow, "domready", function () {
          document.getElementById("incident_images").addEventListener("change", function(e) {
            const imagePreview = document.getElementById("imagePreview");
            imagePreview.innerHTML = "";

            if (this.files) {
              Array.from(this.files).forEach(file => {
                if (file.type.match('image.*')) {
                  const reader = new FileReader();
                  reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '60px';
                    img.style.height = '60px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';
                    imagePreview.appendChild(img);
                  }
                  reader.readAsDataURL(file);
                }
              });
            }
          });

          document.getElementById("mapForm").addEventListener("submit", function(e) {
            e.preventDefault();

            // Display loading indicator
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="spinner" style="display:inline-block;width:16px;height:16px;border:3px solid #f5f9e9;border-top:3px solid #133b0d;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle;"></div> Se salvează...';
            submitBtn.disabled = true;

            // Get form data
            const title = this.querySelector('[name="incident_title"]').value;
            const description = this.querySelector('[name="incident_description"]').value;
            const imageFiles = document.getElementById("incident_images").files;

            // Validate image files if present
            if (imageFiles.length > 0) {
              // Check file size limits
              const maxSize = 5 * 1024 * 1024; // 5MB
              for (let i = 0; i < imageFiles.length; i++) {
                if (imageFiles[i].size > maxSize) {
                  alertify.alert('Eroare', 'Imaginea ' + imageFiles[i].name + ' depășește 5MB.');
                  submitBtn.innerHTML = originalBtnText;
                  submitBtn.disabled = false;
                  return;
                }
              }
            }

            // Create incident data
            const incidentData = {
              incident_title: title,
              incident_description: description,
              latitude: markerLat,
              longitude: markerLong,
              marker_type: markerType
            };

            // Add username if available
            if (sessionStorage.getItem("user_data")) {
              incidentData["username"] = JSON.parse(sessionStorage.getItem("user_data")).data.username;
            }

            console.log("Saving incident:", incidentData);

            fetch("http://localhost:8080/incidents/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(incidentData),
            })
                .then(response => {
                  console.log("Incident save response status:", response.status);
                  if (!response.ok) {
                    throw new Error("Failed to save incident. Status: " + response.status);
                  }
                  return response.json();
                })
                .then(result => {
                  console.log("Incident saved successfully:", result);

                  // Extract incident ID from response
                  let incidentId = "";
                  if (result && result.message) {
                    // The server returns the incident ID in the message field
                    // We need to clean it up if it contains any extra text
                    const idMatch = result.message.match(/[a-zA-Z0-9-]+/);
                    incidentId = idMatch ? idMatch[0] : result.message;
                    console.log("Extracted incident ID:", incidentId);
                  }

                  if (!incidentId) {
                    console.warn("No incident ID received from server");
                    throw new Error("No incident ID received from server");
                  }

                  // If no images, we're done
                  if (imageFiles.length === 0) {
                    console.log("No images to upload, finishing");
                    alertify.alert('Status', 'Incident adăugat cu succes!');
                    infoWindow.close();
                    currentFormInfoWindow = null;
                    newIncidentMarker.setMap(null);
                    updateMarkers();

                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                  }

                  // 2. Upload images if there are any
                  console.log("Uploading", imageFiles.length, "images for incident:", incidentId);
                  const imageFormData = new FormData();

                  // Append all image files
                  for (let i = 0; i < imageFiles.length; i++) {
                    imageFormData.append("files", imageFiles[i]);
                  }

                  // Add incident ID reference - make sure it's valid
                  if (incidentId && incidentId !== "") {
                    imageFormData.append("incidentId", incidentId);
                  }

                  // Debug what's in the form data
                  for (let pair of imageFormData.entries()) {
                    console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
                  }

                  // Upload the images with proper error handling
                  return fetch("http://localhost:8080/images/incidents/pics", {
                    method: "POST",
                    body: imageFormData,
                  })
                      .then(response => {
                        console.log("Image upload response status:", response.status);
                        if (!response.ok) {
                          throw new Error("Failed to upload images. Status: " + response.status);
                        }
                        return response.json();
                      })
                      .then(uploadResult => {
                        console.log("Images uploaded successfully:", uploadResult);

                        // Success message and cleanup
                        alertify.alert('Status', 'Incident adăugat cu succes!');
                        infoWindow.close();
                        currentFormInfoWindow = null;
                        newIncidentMarker.setMap(null);
                        updateMarkers();

                        // Reset button state
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                      })
                      .catch(imageError => {
                        console.error("Error uploading images:", imageError);
                        throw imageError; // Pass to outer catch
                      });
                })
                .catch(error => {
                  console.error("Error in form submission:", error);
                  alertify.alert('Eroare', 'A apărut o eroare la salvarea incidentului: ' + error.message);

                  // Reset button
                  submitBtn.innerHTML = originalBtnText;
                  submitBtn.disabled = false;
                });
          });
        });
      });

      google.maps.event.trigger(newIncidentMarker, "click");
    }
  });
}

function updateMarkers() {
  console.log("Updating markers...");
  fetch("http://localhost:8080/incidents/get", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
      .then(response => {
        console.log("Marker fetch response status:", response.status);
        if (!response.ok) {
          throw new Error("Network response was not ok. Status: " + response.status);
        }
        return response.json();
      })
      .then(res => {
        console.log("Received marker data:", res);
        displayAllMarkers(res);
      })
      .catch(error => {
        console.error("Error fetching markers:", error);
        alertify.alert('Status','Nu s-au putut citi datele, verificați conexiunea la internet');
      });
}

function displayAllMarkers(res) {
  if (markersObjArray.length > 0) {
    for (const oldMarker of markersObjArray) {
      oldMarker.setMap(null);
    }
    markersObjArray = [];
  }

  if (!res.data) {
    console.log("No marker data found");
    return;
  }

  console.log("Displaying", res.data.length, "markers");

  for (let i = 0; i < res.data.length; i++) {
    let incident = res.data[i].incident;
    let markerType = (incident.marker_type || "").replace(/^"(.*)"$/, '$1');

    let m = new google.maps.Marker({
      position: {
        lat: parseFloat(incident.latitude),
        lng: parseFloat(incident.longitude)
      },
      map: map,
      icon: {
        url: '../' + getIconPath(markerType),
        size: new google.maps.Size(36, 50),
        scaledSize: new google.maps.Size(36, 50),
        anchor: new google.maps.Point(0, 50),
      },
    });

    markersObjArray.push(m);

    m.addListener("click", () => {
      // Create content for info window, including images if available
      let imagesHtml = '';

      if (incident.imageUrls && incident.imageUrls.length > 0) {
        imagesHtml = '<div style="margin-top:10px;"><b>Imagini:</b><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">';
        incident.imageUrls.forEach(imagePath => {
          // FIXED: Use the correct endpoint path for images
          const imageUrl = imagePath.startsWith('http')
              ? imagePath
              : `http://localhost:8080/images/${imagePath}`;

          imagesHtml += `<img src="${imageUrl}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;cursor:pointer;" 
                            onclick="window.open('${imageUrl}', '_blank')">`;
        });
        imagesHtml += '</div></div>';
      }

      // Show additional status information if available
      let statusHtml = '';
      if (incident.status === "solved") {
        statusHtml = `<div style="margin-top:8px;color:#4a8c00;font-weight:bold;">Incident rezolvat ✓</div>`;
      }

      let infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:16px 20px; width:320px; background:#f5f9e9; border-radius:12px; border:1.5px solid #bbdb9b; box-shadow:0 3px 12px #8fae6a50;">
            <h3 style="margin:0 0 8px 0; color:#33791d; font-size:21px; font-family:Inconsolata, monospace; letter-spacing:0.5px;">
              ${incident.incident_title}
            </h3>
            <div style="color:#555; margin:7px 0 4px 0; font-size:15px;">
              <b>Utilizator:</b> <span style="color:#76b870">${incident.username || ''}</span>
            </div>
            <div style="color:#333; font-size:16px;">
              <b>Descriere: </b><span>${incident.incident_description || ''}</span>
            </div>
            ${statusHtml}
            ${imagesHtml}
          </div>
        `
      });
      infoWindow.open(map, m);
    });
  }
}

function myFunction() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

function logout() {
  sessionStorage.clear("user_data");
  window.location.href = 'Main.html';
}

// Add CSS for spinner animation
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`);

window.initMap = initMap;