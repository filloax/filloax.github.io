import { byLetter } from "./split";

export function setupShakyText(from: ParentNode = document) {
    if (!window) return;

    const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
        || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

    if (isReduced) return;

    from.querySelectorAll('.incarnate-word').forEach(el => {
        if (!(el instanceof HTMLElement)) return;

        // Clear previous runs
        [...el.children].filter(c => c instanceof HTMLSpanElement).forEach(c => el.removeChild(c));

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