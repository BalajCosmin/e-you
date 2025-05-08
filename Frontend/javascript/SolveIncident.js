let userList = [JSON.parse(sessionStorage.getItem("user_data")).data.username];

// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  userList.push(inputValue)

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }

  console.log(userList)

}

document.addEventListener('DOMContentLoaded', (event) => {
    event.preventDefault()
    var li = document.createElement("li");
  var t = document.createTextNode(JSON.parse(sessionStorage.getItem("user_data")).data.username);
  li.appendChild(t); 
    document.getElementById("myUL").appendChild(li);
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);
  close.onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }});



  form.addEventListener("submit", function (e) {  
  e.preventDefault();

  

  const payload = new FormData(form);

  let data = {};
     for (let [key, prop] of payload) {
     data[key] = prop;
 }
  data["incidentId"]=JSON.parse(sessionStorage.getItem("documentId"))
  data["usernames"]= userList;
  data = JSON.stringify(data, null, 2);
  console.log(data)

  fetch("http://localhost:8080/incidents/solve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: data,
  }).then((res) => {if(res.status== 400){   alertify.alert('Status','Could not Solve the incident')}})
  .then(
    alertify.alert('Status:','Successfully added the solve request!'))})


