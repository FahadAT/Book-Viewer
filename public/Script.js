function showPopup(e) {
    let popup = document.createElement("div");
    popup.classList.add("popup");

    let content = `<h3>Extra Information</h3>
                    <p>Additional details about the book.</p>
                    <button onclick="closePopup()">Close</button>`;
    popup.innerHTML = content;
    document.body.appendChild(popup);
}
function closePopup() {
    let popup = document.querySelector(".popup");
    popup.remove();
}