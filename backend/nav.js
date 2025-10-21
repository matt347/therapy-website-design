
const nav_div = document.getElementById("nav_div");
function navbar() {
nav_div.innerHTML = `
<nav>
    <div>
        <a href="index.html">Home</a>
    </div>
    <div>
        <a href="details.html">Pricing & FAQs</a>
    </div>
    <div>
        <a href="formpage.html">Reach Out</a>
    </div>
</nav>`;
}

navbar();