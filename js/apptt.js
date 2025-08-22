document.addEventListener("DOMContentLoaded", () => {
    const focusable = Array.from(document.querySelectorAll("[data-nav]"));
    let currentIndex = 0;

    let lastMouseX = 0;
    let lastMouseY = 0;
    let ignoreNextMouseMove = false; // per ignorare movimenti causati dal reposition

    const THRESHOLD = 20; // px minimi per considerare lo spostamento


// Creazione casella debug
    const debugBox = document.createElement("div");
    debugBox.style.position = "fixed";
    debugBox.style.top = "0";
    debugBox.style.left = "0";
    debugBox.style.width = "100%";
    debugBox.style.background = "rgba(0,0,0,0.7)";
    debugBox.style.color = "white";
    debugBox.style.fontFamily = "monospace";
    debugBox.style.fontSize = "12px";
    debugBox.style.padding = "5px";
    debugBox.style.zIndex = "9999";
    document.body.appendChild(debugBox)



    function updateFocus() {
        focusable.forEach((el, i) => {
            if (i === currentIndex) {
                el.classList.add("focused");
                el.scrollIntoView({ block: "nearest", behavior: "smooth" });

                // Sposta il mouse al centro del nuovo elemento senza triggerare il movimento
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                ignoreNextMouseMove = true; // ignora il prossimo mousemove
                window.scrollTo(centerX, centerY); // questo è solo visuale, non genera evento su Silk
            } else {
                el.classList.remove("focused");
            }
        });
    }

    updateFocus();

    // Gestione frecce da tastiera
    document.addEventListener("keydown", (e) => handleMove(e.key));

    // Gestione movimento mouse stile telecomando
    document.addEventListener("mousemove", (e) => {
        if (ignoreNextMouseMove) {
            ignoreNextMouseMove = false;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            return;
        }

        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;

        // Aggiorniamo il debug
        debugBox.textContent = `Mouse: x=${e.clientX}, y=${e.clientY}, dx=${dx}, dy=${dy}`;


        if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return; // movimento troppo piccolo

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "ArrowRight" : "ArrowLeft";
        } else {
            direction = dy > 0 ? "ArrowDown" : "ArrowUp";
        }

        handleMove(direction);
    });

    function handleMove(key) {
        const currentEl = focusable[currentIndex];
        const navMap = {
            "menu1": { up: null, down: "menu2", left: null, right: "content-a" },
            "menu2": { up: "menu1", down: "menu3", left: null, right: "content-a" },
            "menu3": { up: "menu2", down: "content-a", left: null, right: "content-a" },
            "content-a": { up: "menu3", down: "content-b1", left: "menu1", right: "content-b1" },
            "content-b1": { up: "content-a", down: "col3-1", left: "content-a", right: "content-b2" },
            "content-b2": { up: "content-a", down: "col3-1", left: "content-b1", right: "content-b3" },
            "content-b3": { up: "content-a", down: "col3-1", left: "content-b2", right: "col3-1" },
        };

        const currentNav = currentEl.getAttribute("data-nav");
        const move = navMap[currentNav];
        if (!move) return;

        let target = null;
        if (key === "ArrowUp") target = move.up;
        if (key === "ArrowDown") target = move.down;
        if (key === "ArrowLeft") target = move.left;
        if (key === "ArrowRight") target = move.right;

        if (target) {
            const nextIndex = focusable.findIndex(el => el.getAttribute("data-nav") === target);
            if (nextIndex !== -1) {
                currentIndex = nextIndex;
                updateFocus();
            }
        }
    }
});
