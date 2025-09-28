


// import { BrowserMultiFormatReader } from "https://cdn.jsdelivr.net/npm/@zxing/library@latest/esm/index.min.js";

document.addEventListener("DOMContentLoaded", () => {
    // Inizializza il lettore di codici a barre
    //   const codeReader = new BrowserMultiFormatReader();
      const video = document.getElementById('preview');
      const resultLabel = document.getElementById('result');


      // Avvia lo scanner
    //   codeReader.decodeFromVideoDevice(null, video, (result, err) => {
    //     if (result) {
    //       resultLabel.textContent = "Codice rilevato: " + result.getText();
    //     }
    //     if (err && !(err.name === 'NotFoundException')) {
    //       console.error(err);
    //     }
    //   });

    // Offcanvas laterale figlio di menu1
    const menu1Btn = document.getElementById('menu1-btn');
    const offcanvas = document.getElementById('offcanvas');
    const overlay = document.getElementById('offcanvas-overlay');
    const closeBtn = document.getElementById('close-offcanvas');
    if(menu1Btn && offcanvas && overlay && closeBtn) {
        // Carosello immagini Adizero
        const carouselImgs = [
            'assets/img/Adizero.avif',
            'assets/img/Adizero_Boston_13_Schuh_Schwarz_JS4958_HM3_hover.avif',
            'assets/img/Adizero_Boston_13_Schuh_Schwarz_JS4958_HM4.avif',
            'assets/img/Adizero_Boston_13_Schuh_Schwarz_JS4958_HM5.avif',
            'assets/img/Adizero_Boston_13_Schuh_Schwarz_JS4958_HM7.avif',
            'assets/img/Adizero.bmp'
        ];
        let carouselIndex = 0;
        function updateCarousel() {
            const carouselImg = document.getElementById('carousel-img');
            if(carouselImg) {
                carouselImg.src = carouselImgs[carouselIndex];
                carouselImg.alt = 'Adizero Boston 13 - Immagine ' + (carouselIndex+1);
            }
        }
        function bindCarouselEvents() {
            const prevBtn = document.getElementById('carousel-prev');
            const nextBtn = document.getElementById('carousel-next');
            if(prevBtn && nextBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    carouselIndex = (carouselIndex - 1 + carouselImgs.length) % carouselImgs.length;
                    updateCarousel();
                });
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    carouselIndex = (carouselIndex + 1) % carouselImgs.length;
                    updateCarousel();
                });
            }
        }
        menu1Btn.addEventListener('click', (e) => {
            e.stopPropagation();
            offcanvas.style.display = 'block';
            overlay.style.display = 'block';
            offcanvas.classList.add('open');
            setTimeout(() => {
                offcanvas.style.transform = 'translateX(0)';
                carouselIndex = 0;
                updateCarousel();
                bindCarouselEvents();
            }, 10);
        });
        closeBtn.addEventListener('click', () => {
            offcanvas.style.transform = '';
            offcanvas.classList.remove('open');
            setTimeout(() => {
                offcanvas.style.display = 'none';
                overlay.style.display = 'none';
            }, 250);
        });
        overlay.addEventListener('click', (e) => {
            // Chiudi solo se il click è fuori dall'offcanvas
            if (!offcanvas.contains(e.target)) {
                offcanvas.style.transform = '';
                offcanvas.classList.remove('open');
                setTimeout(() => {
                    offcanvas.style.display = 'none';
                    overlay.style.display = 'none';
                }, 250);
            }
        });
        // Inizializza subito
        updateCarousel();
        bindCarouselEvents();

        // QR code modal
        const buyBtn = document.getElementById('buy-now-btn');
        const qrModal = document.getElementById('qrcode-modal');
        const closeQr = document.getElementById('close-qrcode');
        if(buyBtn && qrModal && closeQr) {
            buyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                qrModal.style.display = 'block';
                qrModal.focus();
            });
            closeQr.addEventListener('click', () => {
                qrModal.style.display = 'none';
            });
            qrModal.addEventListener('click', (e) => {
                if(e.target === qrModal) qrModal.style.display = 'none';
            });
        }
    }
    // Funzione tick sonoro leggero via Web Audio API
    // AudioContext globale sbloccato al primo input utente
    let audioCtx = null;
    function unlockAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('mousedown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });

    function playTick() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1200;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    }
    const focusable = Array.from(document.querySelectorAll("[data-nav]"));
    let currentIndex = 0;

    let lastMouseX = 0;
    let lastMouseY = 0;
    let ignoreNextMouseMove = false; // per ignorare movimenti causati dal reposition

    const THRESHOLD = 5; // px minimi per considerare lo spostamento

    // Variabile di controllo debug
    const DEBUG = false; // Imposta a false per disattivare la debugBox

    // Creazione casella debug solo se DEBUG è true
    let debugBox = null;
    if (DEBUG) {
        debugBox = document.createElement("div");
        debugBox.style.position = "fixed";
        debugBox.style.top = "10px";
        debugBox.style.left = "10px";
        debugBox.style.width = "400px";
        debugBox.style.height = "900px";
        debugBox.style.background = "rgba(0,0,0,0.7)";
        debugBox.style.color = "white";
        debugBox.style.fontFamily = "monospace";
        debugBox.style.fontSize = "12px";
        debugBox.style.padding = "5px";
        debugBox.style.overflowY = "auto";
        debugBox.style.zIndex = "9999";
        document.body.appendChild(debugBox);
        debugBox.textContent = `Mouse: x=XXXXXX, y=YYYYYY, dx=KKKKKKKKKKK, dy=MMMMMMMM`;
    }

    // Funzione di logging
    function logEvent(type, detail) {
        if (!DEBUG || !debugBox) return;
        if (typeof detail === "object") {
            debugBox.innerHTML = `<div>[${type}] ${JSON.stringify(detail)}</div>` + debugBox.innerHTML;
        } else {
            debugBox.innerHTML = `<div>[${type}] ${detail}</div>` + debugBox.innerHTML;
        }
    }

    // Otteniamo TUTTI i nomi degli eventi conosciuti nel browser
    const allEvents = [];
    for (let key in window) {
        if (key.startsWith("on")) {
            allEvents.push(key.slice(2));
        }
    }
    if (DEBUG && debugBox) {
        debugBox.innerHTML += `<br>Known events: ${allEvents.join(", ")}`;
    }

    document.addEventListener('pointermove', e => logEvent('pointermove', e));
    document.addEventListener('pointercancel', e => logEvent('pointercancel', e));
    // document.addEventListener('gotpointercapture', e => logEvent('gotpointercapture', e));
    // document.addEventListener('pointerrawupdate', e => logEvent('pointerrawupdate', e));
    // document.addEventListener('devicemotion', e => logEvent('devicemotion', e));
    // document.addEventListener('animationstart', e => logEvent('animationstart', e));
    document.addEventListener('pointerdown', e => logEvent('pointerdown', e));
    document.addEventListener('pointerup', e => logEvent('pointerup', e));
    // document.addEventListener('pointerrawupdate', e => logEvent('pointerrawupdate', e));

    ['touchstart','touchmove','touchend'].forEach(evt => {
    document.addEventListener(evt, e => logEvent(evt, e.touches.length));
    });

    // Agganciamo un listener per ciascuno
    allEvents.forEach(event => {
      //  document.addEventListener(event, logEvent, true);
    });




    function updateFocus() {
        focusable.forEach((el, i) => {
            if (i === currentIndex) {
                el.classList.add("focused");
                el.scrollIntoView({ block: "nearest", behavior: "smooth" });
                ignoreNextMouseMove = true; // ignora il prossimo mousemove
                playTick();
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
        if (DEBUG && debugBox) {
            debugBox.innerHTML = `<div>Mouse: x=${e.clientX}, y=${e.clientY}, dx=${dx}, dy=${dy}</div>` + debugBox.innerHTML;
        }

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
            "menu3": { up: "menu2", down: null, left: null, right: "content-b1" },
            "content-a": { up: null, down: "content-b1", left: "menu1", right: "col3-1" },
            "content-b1": { up: "content-a", down: null, left: "content-a", right: "content-b2" },
            "content-b2": { up: "content-a", down: null, left: "content-b1", right: "content-b3" },
            "content-b3": { up: "content-a", down: null, left: "content-b2", right: "col3-10" },
            "col3-1": { up: null, down: "col3-2", left: "content-a", right: null },
            "col3-2": { up: "col3-1", down: "col3-3", left: "content-a", right: null },
            "col3-3": { up: "col3-2", down: "col3-4", left: "content-a", right: null },
            "col3-4": { up: "col3-3", down: "col3-5", left: "content-a", right: null },
            "col3-5": { up: "col3-4", down: "col3-6", left: "content-a", right: null },
            "col3-6": { up: "col3-5", down: "col3-7", left: "content-a", right: null },
            "col3-7": { up: "col3-6", down: "col3-8", left: "content-a", right: null },
            "col3-8": { up: "col3-7", down: "col3-9", left: "content-b3", right: null },
            "col3-9": { up: "col3-8", down: "col3-10", left: "content-b3", right: null },
            "col3-10": { up: "col3-9", down: "col3-11", left: "content-b3", right: null },
            "col3-11": { up: "col3-10", down: "col3-12", left: "content-b3", right: null },
            "col3-12": { up: "col3-11", down: "col3-13", left: "content-b3", right: null },
            "col3-13": { up: "col3-12", down: "col3-14", left: "content-b3", right: null },
            "col3-14": { up: "col3-13", down: "col3-15", left: "content-b3", right: null },
            "col3-15": { up: "col3-14", down: null, left: "content-b3", right: null }
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
