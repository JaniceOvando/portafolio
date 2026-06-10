// =============================================
//  JANICE DEV PORTFOLIO — script.js
// =============================================

const pdfPath = './img/Janice_Ovando_Garcia_CV.pdf';

// ── Cargar PDF.js desde CDN ───────────────────
const pdfjsScript = document.createElement('script');
pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
document.head.appendChild(pdfjsScript);

pdfjsScript.onload = function () {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
};

// ── Estado PDF ────────────────────────────────
let pdfDoc     = null;
let currentPage = 1;
let totalPages  = 1;
let renderTask  = null;

// ── Renderizar página ─────────────────────────
function renderPage(pageNum) {
    if (!pdfDoc) return;

    pdfDoc.getPage(pageNum).then(function (page) {
        const canvas  = document.getElementById('pdfCanvas');
        const ctx     = canvas.getContext('2d');
        const containerW = canvas.parentElement.clientWidth - 32;
        const viewport   = page.getViewport({ scale: 1 });
        const scale      = containerW / viewport.width;
        const scaled     = page.getViewport({ scale });

        canvas.width  = scaled.width;
        canvas.height = scaled.height;

        if (renderTask) renderTask.cancel();

        renderTask = page.render({ canvasContext: ctx, viewport: scaled });
        renderTask.promise.then(function () {
            document.getElementById('pdfPageInfo').textContent =
                'Página ' + pageNum + ' de ' + totalPages;
            document.getElementById('pdfPrev').disabled = (pageNum <= 1);
            document.getElementById('pdfNext').disabled = (pageNum >= totalPages);
            renderTask = null;
        }).catch(function () {});
    });
}

// ── Cargar PDF con PDF.js ─────────────────────
function loadPDF() {
    if (!window.pdfjsLib) {
        setTimeout(loadPDF, 200);
        return;
    }

    document.getElementById('pdfLoading').style.display = 'block';
    document.getElementById('pdfNav').style.display    = 'none';
    document.getElementById('pdfCanvas').style.display = 'none';

    pdfjsLib.getDocument(pdfPath).promise.then(function (pdf) {
        pdfDoc      = pdf;
        totalPages  = pdf.numPages;
        currentPage = 1;

        document.getElementById('pdfLoading').style.display = 'none';
        document.getElementById('pdfCanvas').style.display  = 'block';

        if (totalPages > 1) {
            document.getElementById('pdfNav').style.display = 'flex';
        }

        renderPage(currentPage);
    }).catch(function (err) {
        document.getElementById('pdfLoading').textContent =
            '😢 No se pudo cargar el PDF. Intenta descargarlo directamente.';
        console.error('PDF error:', err);
    });
}

// ── DOM Ready ─────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

    // Navbar scroll shadow
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (link) {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === '#' + entry.target.id
                    );
                });
            }
        });
    }, { threshold: 0.45 });

    sections.forEach(function (s) { sectionObserver.observe(s); });

    // Mobile menu
    const navToggle    = document.getElementById('navToggle');
    const navLinksList = document.getElementById('navLinks');

    navToggle.addEventListener('click', function () {
        navLinksList.classList.toggle('open');
    });

    navLinksList.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinksList.classList.remove('open');
        });
    });

    // ── Modal CV ──────────────────────────────
    const overlay      = document.getElementById('cvModalOverlay');
    const openBtn      = document.getElementById('downloadCVBtn');
    const closeX       = document.getElementById('cvModalClose');
    const closeFooter  = document.getElementById('cvModalCloseBtn');
    const downloadBtn  = document.getElementById('cvDownloadBtn');
    const newTabBtn    = document.getElementById('cvOpenNewTab');
    const prevBtn      = document.getElementById('pdfPrev');
    const nextBtn      = document.getElementById('pdfNext');

    function openModal() {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        loadPDF();
    }

    function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    closeX.addEventListener('click', closeModal);
    closeFooter.addEventListener('click', closeModal);

    // Cerrar al hacer clic en el overlay (fuera del modal)
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    // Descargar
    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.href     = pdfPath;
        link.download = 'Janice_Ovando_Garcia_CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Abrir en nueva pestaña
    newTabBtn.addEventListener('click', function () {
        window.open(pdfPath, '_blank');
    });

    // Navegación de páginas
    prevBtn.addEventListener('click', function () {
        if (currentPage > 1) { currentPage--; renderPage(currentPage); }
    });

    nextBtn.addEventListener('click', function () {
        if (currentPage < totalPages) { currentPage++; renderPage(currentPage); }
    });

    // ── Scroll reveal ─────────────────────────
    const revealEls = document.querySelectorAll(
        '.info-card, .skill-card, .project-card, .cv-card, .contact-card'
    );

    revealEls.forEach(function (el) { el.classList.add('reveal'); });

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

});