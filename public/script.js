const registrationForm =
    document.getElementById("registrationForm");

const formMessage =
    document.getElementById("formMessage");


function showError(field, message) {
    document.getElementById(field + "Error").textContent = message;
}


function clearErrors() {
    const errors = document.querySelectorAll(".form-error");

    errors.forEach(error => {
        error.textContent = "";
    });

    formMessage.textContent = "";
    formMessage.className = "form-message";
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


registrationForm.addEventListener("submit", async function(event) {

    // Stop the normal form reload
    event.preventDefault();

    clearErrors();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const selectedEvent =
        document.getElementById("event").value;


    let valid = true;


    // Name validation
    if (name.length < 2) {
        showError(
            "name",
            "Please enter your full name."
        );

        valid = false;
    }


    // Email validation
    if (!isValidEmail(email)) {
        showError(
            "email",
            "Please enter a valid email address."
        );

        valid = false;
    }


    // Phone validation
    if (!/^[0-9]{10}$/.test(phone)) {
        showError(
            "phone",
            "Enter a valid 10-digit phone number."
        );

        valid = false;
    }


    // Event validation
    if (!selectedEvent) {
        showError(
            "event",
            "Please select an event."
        );

        valid = false;
    }


    // Stop if validation failed
    if (!valid) {
        return;
    }


    try {

        // Send registration to Express
        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                event: selectedEvent
            })

        });


        const data = await response.json();


        // Server returned an error
        if (!response.ok) {

            formMessage.textContent =
                data.message || "Registration failed.";

            formMessage.className =
                "form-message error";

            return;
        }


        // Save registration for confirmation page
        sessionStorage.setItem(
            "registration",
            JSON.stringify(data.registration)
        );


        // Open confirmation page
        window.location.href = "confirmation.html";


    } catch (error) {

        console.error(error);

        formMessage.textContent =
            "Unable to connect to the server.";

        formMessage.className =
            "form-message error";
    }

});