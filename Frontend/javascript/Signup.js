const form = document.getElementById("form");

// document.querySelector('#fileUpload').addEventListener('change', event => {
//   handleImageUpload(event)
// })


const handleImageUpload = event => {
  const files = event.target.files
  const formData = new FormData()
  formData.append('file', files[0])

  fetch('http://localhost:8080/profile/pic/', {
    method: 'POST',
    body: formData,
    header: {
      'Access-Control-Allow-Origin':'*',
    }
  })
  .then(response => response.json())
  .then(resp => sessionStorage.setItem('image_path', JSON.stringify(resp.data)))
  .catch((error) => { console.error('Error:', error); })
}


function validateForm() {    
    var pw1 = document.getElementById("password").value;  
    var pw2 = document.getElementById("password_confirmation").value;  
    var email = document.getElementById("email").value;  
      
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
    // password confirmation validation
    if(pw1 != pw2) {  
      document.getElementById("message2").innerHTML = "Passwords are not same";  
      return false;  
    } 
    
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!email.match(validRegex)) {
      document.getElementById("message3").innerHTML = "Email structure is not correct";  
  
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
  data["role"]="user"
  data["photo_path"]= sessionStorage.getItem("image_path")
  data = JSON.stringify(data, null, 2);
  console.log(data)


  fetch("http://localhost:8080/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: data,
  }).then((data) => console.log(data)).then(  alertify.alert('Status:','Successfully created your account')).then(setTimeout(4000));}
});
