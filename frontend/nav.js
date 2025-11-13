
const nav_div = document.getElementById("nav_div");
function navbar() {
nav_div.innerHTML = `
<nav>
    <div>
        <a href="index.html">About</a>
    </div>
    <div>
        <a href="details.html">Pricing & FAQs</a>
    </div>
    <div>
        <a href="formpage.html">Reach Out</a>
    </div>
    <div>
        <a href="inquire.html">Inquire</a>
    </div>
    <div>
        <a href="admin.html">Admin Page</a>
    </div>
</nav>`;
}

navbar();