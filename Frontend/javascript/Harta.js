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
                  console.log("Parsed JSON result:", result);
                  console.log("Result type:", typeof result);
                  console.log("Result keys:", Object.keys(result));

                  let incidentId = "";

                  // The response should have a 'response' field based on MessageResponse class
                  if (result && result.response) {
                    incidentId = result.response;
                    console.log("Extracted ID from response field:", incidentId);
                  }

                  console.log("Final incident ID:", incidentId);

                  if (!incidentId || incidentId === "") {
                    console.error("Failed to extract incident ID from response");
                    throw new Error("No incident ID received from server");
                  }

                  // Continue with the rest of your code...
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

                  console.log("Uploading", imageFiles.length, "images for incident:", incidentId);
                  const imageFormData = new FormData();

                  for (let i = 0; i < imageFiles.length; i++) {
                    imageFormData.append("files", imageFiles[i]);
                  }

                  if (incidentId && incidentId !== "") {
                    imageFormData.append("incidentId", incidentId);
                  }

                  for (let pair of imageFormData.entries()) {
                    console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
                  }

                  return fetch("http://localhost:8080/images/incidents/pics", {
                    method: "POST",
                    body: imageFormData,
                  })
                      .then(response => {
                        console.log("Image upload response status:", response.status);
                        console.log("Response headers:", response.headers);

                        if (!response.ok) {
                          return response.text().then(text => {
                            console.error("Error response text:", text);
                            throw new Error("Failed to upload images. Status: " + response.status);
                          });
                        }

                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                          return response.json();
                        } else {
                          return response.text().then(text => {
                            console.log("Image upload response text:", text);
                            return { message: text || "Images uploaded successfully" };
                          });
                        }
                      })
                      .then(uploadResult => {
                        console.log("Images uploaded successfully:", uploadResult);
                        console.log("Upload result type:", typeof uploadResult);
                        console.log("Upload result keys:", Object.keys(uploadResult));

                        if (uploadResult.imageUrls) {
                          console.log("Received image URLs:", uploadResult.imageUrls);
                        }

                        alertify.alert('Status', 'Incident adăugat cu succes!');
                        infoWindow.close();
                        currentFormInfoWindow = null;
                        newIncidentMarker.setMap(null);
                        updateMarkers();

                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                      })
                      .catch(imageError => {
                        console.error("Error uploading images:", imageError);

                        alertify.alert('Atenție', 'Incidentul a fost creat, dar imaginile nu au putut fi încărcate: ' + imageError.message);

                        infoWindow.close();
                        currentFormInfoWindow = null;
                        newIncidentMarker.setMap(null);
                        updateMarkers();

                        // Reset button state
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                      });
                })
                .catch(error => {
                  console.error("Error in form submission:", error);
                  alertify.alert('Eroare', 'Nu s-a putut salva incidentul: ' + error.message);

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

  const filter = document.getElementById('incidentFilter') ? document.getElementById('incidentFilter').value : 'active';
  let url = "http://localhost:8080/incidents/get";

  if (filter) {
    url += `?status=${filter}`;
  }

  fetch(url, {
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
}f

function filterIncidents() {
  updateMarkers();
}

window.filterIncidents = filterIncidents;

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
      // Get current logged-in user
      let currentUser = null;
      if (sessionStorage.getItem("user_data")) {
        currentUser = JSON.parse(sessionStorage.getItem("user_data")).data.username;
      }

      // Create content for info window, including images if available
      let imagesHtml = '';

      if (incident.imageUrls && incident.imageUrls.length > 0) {
        imagesHtml = '<div style="margin-top:10px;"><b>Imagini:</b><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">';
        incident.imageUrls.forEach(imagePath => {
          const imageUrl = imagePath.startsWith('http')
              ? imagePath
              : `http://localhost:8080/images/${imagePath}`;

          imagesHtml += `<img src="${imageUrl}" style="width:80px;height:80px;object-fit:cover;border-radius:4px;cursor:pointer;" 
                        onclick="window.open('${imageUrl}', '_blank')">`;
        });
        imagesHtml += '</div></div>';
      }

      let statusHtml = '';
      if (incident.status === "solved") {
        statusHtml = `<div style="margin-top:8px;color:#4a8c00;font-weight:bold;">Incident rezolvat ✓</div>`;
        if (incident.solvers && incident.solvers.length > 0) {
          statusHtml += `<div style="font-size:14px;color:#666;">Rezolvat de: ${incident.solvers.join(", ")}</div>`;
        }
      }

      let solveButtonHtml = '';
      if (currentUser && currentUser !== incident.username && incident.status !== "solved") {
        solveButtonHtml = `
      <div style="margin-top:15px;border-top:1px solid #e0e0e0;padding-top:15px;">
        <button id="solveIncidentBtn_${incident.id}" 
                style="background:#4CAF50;color:white;padding:10px 20px;border:none;border-radius:22px;cursor:pointer;font-size:16px;width:100%;">
          🔧 Rezolvă Incident
        </button>
      </div>
    `;
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
        ${solveButtonHtml}
      </div>
    `
      });

      infoWindow.open(map, m);

      // Add event listener pentru buton dupa ce InfoWindow are status ready
      if (solveButtonHtml) {
        google.maps.event.addListenerOnce(infoWindow, "domready", function() {
          document.getElementById(`solveIncidentBtn_${incident.id}`).addEventListener("click", function() {
            showSolveIncidentForm(incident.id, currentUser);
          });
        });
      }
    });
  }
}

function showSolveIncidentForm(incidentId, currentUser) {
  if (currentFormInfoWindow) currentFormInfoWindow.close();

  let solveFormContent = `
    <div style="background-color:#f5f9e9;padding:20px;width:360px;border-radius:12px;border:1.5px solid #bbdb9b;box-shadow:0 3px 12px #8fae6a50;">
      <h3 style="color:#133b0d;font-size:20px;font-family:Inconsolata, monospace;margin-top:0;">Rezolvă Incident</h3>
      <p style="color:#666;margin-bottom:15px;">Adaugă participanții care au ajutat la rezolvarea incidentului</p>
      
      <div id="participantsList" style="margin-bottom:15px;">
        <div style="padding:8px;background:#e8f5e8;border-radius:4px;margin-bottom:5px;">
          <strong>${currentUser}</strong> (tu)
        </div>
      </div>
      
      <div style="margin-bottom:15px;">
        <input type="text" id="participantInput" placeholder="Nume utilizator participant" 
               style="width:70%;padding:8px;border:1px solid #ccc;border-radius:4px;">
        <button onclick="addParticipant()" 
                style="background:#88c531;color:white;padding:8px 15px;border:none;border-radius:4px;cursor:pointer;margin-left:5px;">
          Adaugă
        </button>
      </div>
      
      <div id="addedParticipants"></div>
      
      <button onclick="submitSolveIncident('${incidentId}', '${currentUser}')" 
              style="background:#4CAF50;color:white;padding:10px 20px;border:none;border-radius:22px;cursor:pointer;font-size:16px;width:100%;margin-top:10px;">
        Confirmă Rezolvarea
      </button>
      
      <button onclick="alertify.closeAll()" 
              style="background:#f44336;color:white;padding:8px 15px;border:none;border-radius:22px;cursor:pointer;font-size:14px;width:100%;margin-top:5px;">
        Anulează
      </button>
    </div>
  `;

  alertify.alert('Rezolvă Incident', solveFormContent).set('onok', function() { return false; });

  window.solveParticipants = [currentUser];
}

function addParticipant() {
  const input = document.getElementById('participantInput');
  const username = input.value.trim();

  if (username && !window.solveParticipants.includes(username)) {
    window.solveParticipants.push(username);

    const addedDiv = document.getElementById('addedParticipants');
    const participantDiv = document.createElement('div');
    participantDiv.style = "padding:8px;background:#f0f0f0;border-radius:4px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;";
    participantDiv.innerHTML = `
      ${username}
      <button onclick="removeParticipant('${username}')" 
              style="background:#ff5252;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
        Elimină
      </button>
    `;
    addedDiv.appendChild(participantDiv);

    input.value = '';
  }
}

function removeParticipant(username) {
  window.solveParticipants = window.solveParticipants.filter(u => u !== username);

  const addedDiv = document.getElementById('addedParticipants');
  addedDiv.innerHTML = '';

  window.solveParticipants.forEach(participant => {
    if (participant !== JSON.parse(sessionStorage.getItem("user_data")).data.username) {
      const participantDiv = document.createElement('div');
      participantDiv.style = "padding:8px;background:#f0f0f0;border-radius:4px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;";
      participantDiv.innerHTML = `
        ${participant}
        <button onclick="removeParticipant('${participant}')" 
                style="background:#ff5252;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
          Elimină
        </button>
      `;
      addedDiv.appendChild(participantDiv);
    }
  });
}

function submitSolveIncident(incidentId, currentUser) {
  console.log("Solving incident:", incidentId);
  console.log("Participants:", window.solveParticipants);

  const solveData = {
    incidentId: incidentId,
    usernames: window.solveParticipants
  };

  fetch("http://localhost:8080/incidents/solve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(solveData),
  })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to solve incident");
        }
        return response.json();
      })
      .then(result => {
        console.log("Solve incident result:", result);

        alertify.closeAll();
        alertify.success('Incident marcat ca rezolvat! Felicitări!');

        updateMarkers();
      })
      .catch(error => {
        console.error("Error solving incident:", error);
        alertify.error('Eroare la rezolvarea incidentului: ' + error.message);
      });
}

// functii gloale
window.addParticipant = addParticipant;
window.removeParticipant = removeParticipant;
window.submitSolveIncident = submitSolveIncident;

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