const form = document.getElementById("form");
let uploadedImagePath = null;
document.querySelector('#fileUpload').addEventListener('change', event => {
    handleImageUpload(event);

    // Show preview
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('fileName').textContent = file.name;
        }
        reader.readAsDataURL(file);
    }
});

const handleImageUpload = event => {
    const files = event.target.files;
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    fetch('http://localhost:8080/images/profile/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            return response.json();
        })
        .then(resp => {
            console.log('Image uploaded:', resp);
            // Store the uploaded image path
            uploadedImagePath = resp.imageUrl || resp.path || resp.data || resp.filename;
            sessionStorage.setItem('image_path', uploadedImagePath);
        })
        .catch((error) => {
            console.error('Error uploading image:', error);
            alertify.error('Eroare la încărcarea imaginii');
            uploadedImagePath = null;
        });
}

function validateForm() {
    var pw1 = document.getElementById("password").value;
    var pw2 = document.getElementById("password_confirmation").value;
    var email = document.getElementById("email").value;

    //minimum password length validation
    if(pw1.length < 8) {
        document.getElementById("message1").innerHTML = "Parola trebuie să aibă cel puțin 8 caractere";
        return false;
    }

    //maximum length of password validation
    if(pw1.length > 15) {
        document.getElementById("message1").innerHTML = "Parola nu poate depăși 15 caractere";
        return false;
    }

    // password confirmation validation
    if(pw1 != pw2) {
        document.getElementById("message2").innerHTML = "Parolele nu coincid";
        return false;
    }

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!email.match(validRegex)) {
        document.getElementById("message3").innerHTML = "Formatul email-ului nu este corect";
        return false;
    }

    // Clear error messages if validation passes
    document.getElementById("message1").innerHTML = "";
    document.getElementById("message2").innerHTML = "";
    document.getElementById("message3").innerHTML = "";

    return true;
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    if(validateForm() === false) {
        return;
    }

    const payload = new FormData(form);

    let data = {};
    for (let [key, prop] of payload) {
        data[key] = prop;
    }

    data["role"] = "user";


    data["photo_path"] = uploadedImagePath || "default_pfp.jpg";

    console.log("Sending user data:", data);

    fetch("http://localhost:8080/users/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Signup failed');
                });
            }
            return response.json();
        })
        .then(result => {
            console.log("Signup successful:", result);
            alertify.alert('Succes', 'Cont creat cu succes!', function() {
                // Clear session storage
                sessionStorage.removeItem('image_path');
                // Redirect to login page
                window.location.href = 'Login.html';
            });
        })
        .catch(error => {
            console.error("Signup error:", error);
            alertify.error('Eroare la crearea contului: ' + error.message);
        });
});

// Cand pagina se incarca se face celar la formular
window.addEventListener('load', function() {
    form.reset();
    uploadedImagePath = null;
    sessionStorage.removeItem('image_path');
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('fileName').textContent = '';
});