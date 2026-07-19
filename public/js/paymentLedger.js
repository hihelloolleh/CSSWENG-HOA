const modal = document.getElementById("modal");

document.getElementById("openModal").onclick = () => {
    modal.style.display = "flex";
};

document.querySelector(".cancel").onclick = () => {
    modal.style.display = "none";
};

document.getElementById("continue").onclick = () => {

    const purpose = document.getElementById("purpose").value;

    if (!purpose) {
        alert("Select a payment purpose.");
        return;
    }

    window.location.href = `/dues/${purpose}`;

};