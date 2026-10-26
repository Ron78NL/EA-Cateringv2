const zoekveld = document.getElementById("zoekveld");
const aantal = document.getElementById("aantal");
const categoriePaneel = document.getElementById("categoriePaneel");
const categorieKop = document.getElementById("categorieKop");
const categorieMenu = document.getElementById("categorieMenu");
const videoGrid = document.getElementById("videoGrid");
const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const videoExtern = document.getElementById("videoExtern");
const sluitKnop = document.getElementById("sluit");

const standaardKop = "📚 KEUKENTECHNIEKEN";
let geselecteerd = ""; // "" = alle categorieën

// Zoeken negeert hoofdletters en accenten: "lieren" vindt "Liëren"
const normaliseer = tekst =>
    tekst.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function bouwMenu() {
    const items = [{ id: "", naam: "Alle video's" }, ...categorieen];

    categorieMenu.replaceChildren(...items.map(c => {
        const knop = document.createElement("button");
        knop.type = "button";
        knop.className = "cat-btn";
        knop.dataset.id = c.id;
        knop.dataset.naam = c.naam;
        knop.addEventListener("click", () => kiesCategorie(c));
        return knop;
    }));

    updateMenu();
}

function kiesCategorie(c) {
    geselecteerd = c.id;
    categorieKop.textContent = c.id === ""
        ? standaardKop
        : "📚 " + c.naam.toUpperCase();
    updateMenu();
    toonVideos();
}

// Is er een categorie gekozen, dan blijven alleen die categorie
// en een terugknop zichtbaar.
function updateMenu() {
    categorieMenu.querySelectorAll(".cat-btn").forEach(knop => {
        const id = knop.dataset.id;
        const isAlle = id === "";
        const isGekozen = id === geselecteerd;

        knop.classList.toggle("active", isGekozen);

        if (geselecteerd === "") {
            knop.hidden = false;
            knop.textContent = isAlle ? "Alle video's" : knop.dataset.naam;
        } else {
            knop.hidden = !(isGekozen || isAlle);
            knop.textContent = isAlle ? "← Alle categorieën" : knop.dataset.naam;
        }
    });
}

function toonVideos() {
    const zoekterm = normaliseer(zoekveld.value.trim());

    const gevonden = videos.filter(v => {

  if (zoekterm) {

    geselecteerd = "";

    return normaliseer(v.titel).includes(zoekterm);
}

    return geselecteerd === "" ||
           v.categorie === geselecteerd;

});

    if (gevonden.length === 0) {
        aantal.textContent = "Geen video's gevonden. Probeer een andere zoekterm.";
    } else if (gevonden.length === 1) {
        aantal.textContent = "1 video gevonden";
    } else {
        aantal.textContent = `${gevonden.length} video's gevonden`;
    }

    videoGrid.replaceChildren(...gevonden.map(maakKaart));
}

function maakKaart(video) {
    const kaart = document.createElement("div");
    kaart.className = "video-card";

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "video-link";
    knop.setAttribute("aria-label", video.titel + " afspelen");
    knop.addEventListener("click", () => openVideo(video));

    const afbeelding = document.createElement("img");
    afbeelding.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
    afbeelding.alt = "";
    afbeelding.loading = "lazy";
    afbeelding.onerror = function () {
        this.onerror = null;
        this.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    };

    const titel = document.createElement("h3");
    titel.textContent = video.titel;

    knop.append(afbeelding, titel);
    kaart.appendChild(knop);
    return kaart;
}

function openVideo(video) {
    videoFrame.replaceChildren();

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.title = video.titel;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    videoFrame.appendChild(iframe);

    videoExtern.href = `https://www.youtube.com/watch?v=${video.id}`;
    videoModal.classList.add("open");
    document.body.style.overflow = "hidden";
    sluitKnop.focus();
}

function sluitVideo() {
    videoModal.classList.remove("open");
    videoFrame.replaceChildren(); // stopt het afspelen
    document.body.style.overflow = "";
}

zoekveld.addEventListener("input", toonVideos);
sluitKnop.addEventListener("click", sluitVideo);
videoModal.addEventListener("click", e => {
    if (e.target === videoModal) sluitVideo();
});
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && videoModal.classList.contains("open")) sluitVideo();
});

bouwMenu();
toonVideos();
