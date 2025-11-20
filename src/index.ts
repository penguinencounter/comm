// don't forget! pnpm exec tsc

function main() {
    /*
    override scrolling behaviour for #anchors
    */
    document.querySelectorAll("a[href^=\"#\"]").forEach((anchor: Element) => {
        if (!(anchor instanceof HTMLAnchorElement))
            throw new Error("the dom lied help");
        anchor.addEventListener("click", e => {
            e.preventDefault();
            history.pushState(null, "", anchor.href)
            const url = new URL(anchor.href)
            document.getElementById(url.hash.substring(1))?.scrollIntoView({
                behavior: "smooth"
            })
        });
    });
}

window.addEventListener("DOMContentLoaded", main);
