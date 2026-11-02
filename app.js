const zoekveld = document.getElementById("zoekveld");
const aantal = document.getElementById("aantal");
const kop = document.getElementById("kop");
const categorieMenu = document.getElementById("categorieMenu");
const videoGrid = document.getElementById("videoGrid");
const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const videoTitel = document.getElementById("videoTitel");
const videoExtern = document.getElementById("videoExtern");
const sluitKnop = document.getElementById("sluit");

let geselecteerd = ""; // "" = alle categorieën
let laatsteFocus = null;

const naamVan = Object.fromEntries(categorieen.map(c => [c.id, c.naam]));

// Zoeken negeert hoofdletters en accenten: "lieren" vindt "Liëren"
const normaliseer = tekst =>
    tekst.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function bouwMenu() {
    const items = [{ id: "", naam: "Alle video's" }, ...categorieen];

    categorieMenu.replaceChildren(...items.map(c => {
        const knop = document.createElement("button");
        knop.type = "button";
        knop.className = "tab-btn";
        knop.dataset.id = c.id;
        const n = c.id === "" ? videos.length : videos.filter(v => v.categorie === c.id).length;
        knop.innerHTML = `${c.naam}<span class="teller">${n}</span>`;
        knop.addEventListener("click", () => kiesCategorie(c.id, knop));
        return knop;
    }));

    updateMenu();
}

function kiesCategorie(id, knop) {
    geselecteerd = id;
    zoekveld.value = "";
    updateMenu();
    toonVideos();
    if (knop) knop.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
}

function updateMenu() {
    categorieMenu.querySelectorAll(".tab-btn").forEach(knop => {
        const actief = knop.dataset.id === geselecteerd;
        knop.classList.toggle("active", actief);
        knop.setAttribute("aria-pressed", actief);
    });
}

function toonVideos() {
    const zoekterm = normaliseer(zoekveld.value.trim());

    // Bij zoeken wordt altijd in alle categorieën gezocht
    if (zoekterm && geselecteerd !== "") {
        geselecteerd = "";
        updateMenu();
    }

    const gevonden = videos.filter(v =>
        zoekterm
            ? normaliseer(v.titel).includes(zoekterm)
            : geselecteerd === "" || v.categorie === geselecteerd
    );

    kop.textContent = zoekterm
        ? `Zoekresultaten voor "${zoekveld.value.trim()}"`
        : geselecteerd === "" ? "Alle instructievideo's" : naamVan[geselecteerd];

    if (gevonden.length === 0) {
        aantal.textContent = "Geen video's gevonden.";
        const leeg = document.createElement("p");
        leeg.className = "leeg";
        leeg.textContent = "Geen video gevonden. Probeer een ander woord, bijvoorbeeld een deel van de techniek (\"brunoise\", \"saus\").";
        videoGrid.replaceChildren(leeg);
        return;
    }

    aantal.textContent = gevonden.length === 1 ? "1 video gevonden" : `${gevonden.length} video's gevonden`;
    videoGrid.replaceChildren(...gevonden.map(maakKaart));
}

function maakKaart(video) {
    const kaart = document.createElement("article");
    kaart.className = "video-card";

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "video-link";
    knop.setAttribute("aria-label", video.titel + " afspelen");
    knop.addEventListener("click", () => openVideo(video));

    const thumb = document.createElement("div");
    thumb.className = "video-thumb";
    const afbeelding = document.createElement("img");
    afbeelding.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
    afbeelding.alt = "";
    afbeelding.loading = "lazy";
    afbeelding.onerror = function () {
        this.onerror = null;
        this.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    };
    thumb.appendChild(afbeelding);

    const info = document.createElement("div");
    info.className = "video-info";
    const titel = document.createElement("h3");
    titel.textContent = video.titel;
    const cat = document.createElement("span");
    cat.className = "video-cat";
    cat.textContent = naamVan[video.categorie] || "";
    info.append(titel, cat);

    knop.append(thumb, info);
    kaart.appendChild(knop);
    return kaart;
}

function openVideo(video) {
    laatsteFocus = document.activeElement;
    videoFrame.replaceChildren();
    videoTitel.textContent = video.titel;
    const ytLink = `https://www.youtube.com/watch?v=${video.id}`;
    videoExtern.href = ytLink;

    if (location.protocol === "file:") {
        // Lokaal geopend bestand: YouTube staat afspelen in de pagina dan niet toe.
        const poster = document.createElement("a");
        poster.className = "video-poster";
        poster.href = ytLink;
        poster.target = "_blank";
        poster.rel = "noopener noreferrer";
        poster.style.backgroundImage = `url(https://img.youtube.com/vi/${video.id}/hqdefault.jpg)`;
        poster.innerHTML = '<span class="video-play">▶</span><span class="video-poster-tekst">Afspelen op YouTube</span>';
        videoFrame.appendChild(poster);
        videoExtern.hidden = true;
    } else {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        iframe.title = video.titel;
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        videoFrame.appendChild(iframe);
        videoExtern.hidden = false;
    }

    videoModal.classList.add("open");
    document.body.style.overflow = "hidden";
    sluitKnop.focus();
}

function sluitVideo() {
    videoModal.classList.remove("open");
    videoFrame.replaceChildren(); // stopt het afspelen
    document.body.style.overflow = "";
    if (laatsteFocus) laatsteFocus.focus();
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
