const form = document.getElementById("form");
let res;
function validateForm() {    
var pw1 = document.getElementById("password").value;   
      
    //minimum password length validation  
    if(pw1.length < 8) {  
      document.getElementById("message1").innerHTML = "Password length must be at least 8 characters";  
      return false;  
    }  
  
    //maximum length of password validation  
    if(pw1.length > 15) {  
      document.getElementById("message1").innerHTML = "Password length must not exceed 15 characters";  
      return false;  
    } 
 
  }


form.addEventListener("submit", function (e) {
  e.preventDefault();
  
  if(validateForm() != false){
  

  const payload = new FormData(form);
  let data = {};
    for (let [key, prop] of payload) {
    data[key] = prop;
  }
  data["roles"]="user"
  data = JSON.stringify(data, null, 2);
  console.log(data)
  fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  })  .then(res => res.json())
  .then(data => res = data).then(() => sessionStorage.setItem('user_data', JSON.stringify(res)))
  .then(() => console.log(res)).then(() => changeWindow(res))
    
}
});

function changeWindow(res){
  console.log(res)

  if(res.data.username != null){ window.location="MainLoggedIn.html"
}else{

  console.log("gresit")
} 

}
