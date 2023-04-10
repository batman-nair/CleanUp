// Create a variable to defer the beforeinstallprompt event.
let beforeInstallEvent;

// Reference the install button from DOM.
const installButton = document.getElementById("install");
const installHelper = document.getElementById("install-helper");

// Watch for the beforeinstallevent and defer it.
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    beforeInstallEvent = event;
    installButton.style.display = "block";
});

// Prompt for Installation when install button is clicked.
installButton.addEventListener("click", () => {
    if (beforeInstallEvent == undefined) {
        installButton.disabled = false;
        installHelper.classList.remove("d-none");
        return;
    }
    beforeInstallEvent
        .prompt()
        .then((choice) => {
            // Hide the install button as its purpose is over.
            if (choice.outcome == "accepted") {
                installButton.style.display = "none";
            }
        });
});