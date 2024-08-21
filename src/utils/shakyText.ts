import { byLetter } from "./split";

export function setupShakyText() {
    const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
        || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

    if (isReduced) return;

    document.querySelectorAll('.incarnate-word').forEach(el => {
        if (!(el instanceof HTMLElement)) return;

        const split = byLetter(el.innerText)
        split.forEach(letter => {
            if (letter.innerText.toLowerCase().trim() === 'o') {
                letter.classList.add("squash-letter")
            }
        })
        el.firstChild.replaceWith(...split)
        el.classList.add('letter-animation-quiver')
    });
}