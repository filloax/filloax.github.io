document.querySelectorAll("a").forEach((link) => {
    if (link.href.includes("youtube.com")) {
        link.classList.add("youtube-link");
    }
});
