const form = document.getElementById("registrationForm");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let isValid = true;

    // Inputs
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    // Errors
    const usernameError = document.getElementById("usernameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const roleError = document.getElementById("roleError");

    // Clear previous errors
    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    roleError.textContent = "";

    // Username validation
    if (username.length < 5) {
        usernameError.textContent = "Username must be at least 5 characters";
        isValid = false;
    }

    // Email validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
        emailError.textContent = "Enter a valid email";
        isValid = false;
    }

    // Password validation
    if (password.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters";
        isValid = false;
    }

    // Confirm password
    if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match";
        isValid = false;
    }

    // Role validation
    if (role === "") {
        roleError.textContent = "Please select a role";
        isValid = false;
    }

    // Success
    if (isValid) {
        alert("Form submitted successfully!");
        form.reset();
    }
});