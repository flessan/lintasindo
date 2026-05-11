
/* ================================================
   Konfigurasi Aset
   ================================================ */
const ASSETS = {
    bg: {
        landing: './gudang/bg/lintasindo.png'
    },
    chara: {
        polisi: './gudang/man/polpol.png'
    }
};

/* ================================================
   Referensi DOM
   ================================================ */
const $loading = document.getElementById('loading');
const $bgLayer = document.getElementById('bg-layer');
const $titleScreen = document.getElementById('title-screen');
const $inputScreen = document.getElementById('input-screen');
const $nameInput = document.getElementById('name-input');
const $btnLanjut = document.getElementById('btn-lanjut');
const $charaSprite = document.getElementById('chara-sprite');
const $inputHint = document.getElementById('input-hint');
const $transition = document.getElementById('transition');
const $particles = document.getElementById('particles');

/* ================================================
   Preload Gambar
   ================================================ */
function preloadImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

/* ================================================
   Buat Partikel Playful (Warna Lalu Lintas)
   ================================================ */
function createParticles() {
    const jumlah = 30;
    const colors = [
        'rgba(231, 76, 60, #OPAC)',   // Merah
        'rgba(241, 196, 15, #OPAC)',   // Kuning
        'rgba(46, 204, 113, #OPAC)',   // Hijau
        'rgba(52, 152, 219, #OPAC)',   // Biru
        'rgba(255, 255, 255, #OPAC)'   // Putih
    ];

    for (let i = 0; i < jumlah; i++) {
        const el = document.createElement('div');
        el.className = 'particle';

        const ukuran = Math.random() * 8 + 4; // Partikel lebih besar seperti balon
        const posisiX = Math.random() * 100;
        const durasi = Math.random() * 10 + 8;
        const delay = Math.random() * 12;
        const kecerahan = Math.random() * 0.4 + 0.3;

        const warna = colors[Math.floor(Math.random() * colors.length)].replace('#OPAC', kecerahan.toFixed(2));

        Object.assign(el.style, {
            width: ukuran + 'px',
            height: ukuran + 'px',
            left: posisiX + '%',
            bottom: '-20px',
            background: warna,
            animationDuration: durasi + 's',
            animationDelay: delay + 's'
        });

        $particles.appendChild(el);
    }
}

/* ================================================
   Inisialisasi Halaman
   ================================================ */
async function init() {
    await preloadImage(ASSETS.bg.landing);

    $bgLayer.style.backgroundImage = `url('${ASSETS.bg.landing}')`;
    $charaSprite.src = ASSETS.chara.polisi;

    $loading.classList.add('hidden');
    setTimeout(() => {
        $titleScreen.classList.add('visible');
        $bgLayer.classList.add('slow-zoom');
    }, 500);

    createParticles();
}

/* ================================================
   Navigasi: Title Screen → Input Screen
   ================================================ */
let transitioned = false;

function goToInput() {
    if (transitioned) return;
    transitioned = true;

    $titleScreen.classList.add('fade-out');
    setTimeout(() => {
        $titleScreen.style.display = 'none';
        $inputScreen.classList.add('visible');
        $nameInput.focus();
    }, 750);
}

$titleScreen.addEventListener('click', goToInput);
$titleScreen.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') goToInput();
});

/* ================================================
   Validasi Input Nama
   ================================================ */
$nameInput.addEventListener('input', () => {
    const val = $nameInput.value.trim();
    $btnLanjut.disabled = val.length === 0;
    $inputHint.classList.remove('show');
});

$nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); attemptStart(); }
});

$btnLanjut.addEventListener('click', attemptStart);

/* ================================================
   Mulai Game — Navigasi dengan Parameter URL
   ================================================ */
function attemptStart() {
    const nama = $nameInput.value.trim();

    if (!nama) {
        $inputHint.classList.add('show');
        $nameInput.focus();
        return;
    }

    const encodedNama = encodeURIComponent(nama);
    $transition.classList.add('active');

    setTimeout(() => {
        // Mengarah ke halaman 2 sesuai struktur folder
        window.location.href = './halaman/1/persiapan?tio=' + encodedNama;
    }, 1300);
}

/* ================================================
   Jalankan
   ================================================ */
init();