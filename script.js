document.addEventListener('DOMContentLoaded', function() {
    
    // ========================
    // 1. ПЕРЕВОДЫ (без статических стилей)
    // ========================
    const translations = {
        ru: {
            heroName: 'Sacred<br>De Lacrua',
            heroSubtitle: 'Виталий Кузьмин • Северодвинск',
            heroQuote: '«Музыка — это отражение души,<br>ритм моей жизни»',
            heroScrollHint: '↓ Узнать историю',
            bioTitle: 'О себе',
            bioHtml: `
                <p class="lead">Приветствую всех любителей музыки и людей, которые посвятили ей всю жизнь и всего себя без остатка!</p>
                <p>Меня зовут <strong>Виталий Кузьмин</strong>. Я живу в городе Северодвинске — это город у Белого моря. Музыкой я начал заниматься с раннего детства: учился в музыкальной школе, освоил игру на гитаре, клавишных и ударных. Прошёл большую школу по звукоинженерному делу — работе с модулями, захвату звука и мастерингу.</p>
                <p>Мой путь был длинным и извилистым. Я работал диджеем, администратором ночных клубов, организатором мероприятий и сольных концертов, а также музыкальных команд. Но когда делаешь то, к чему кипит душа, дорога в радость, даже если она непростая.</p>
                <p>За всё это время я написал немало песен и много музыки. Я никогда не был фанатом одного артиста, одного стиля или направления. Считаю, что в музыке много интересных направлений, музыкантов и стилей. Поэтому не боялся экспериментировать и применять новые технологии в звуке и методах — что делаю и сейчас.</p>
                <p>Мой псевдоним — <strong>Sacred de Lacrua</strong>: таинственный и духовный, простой и глубокий. Мои проекты: <strong>SDL, Trackzone, PinkIsland</strong> — как сольные, так и командные работы. Я всегда открыт к сотрудничеству и новым людям в нашей отрасли. Дружу с музыкантами нашей страны и не только.</p>
                <p>Если кратко — наверное, всё. Кто хочет узнать меня и моё творчество, может найти мои опубликованные работы в интернете и на моих страницах.</p>
                <p class="signature">Sacred De Lacrua</p>
            `,
            stylesTitle: 'Стили музыки',
            galleryTitle: 'Галерея',
            contactsTitle: 'Контакты',
            contactsIntro: 'Готов к сотрудничеству и интересным проектам'
        },
        en: {
            heroName: 'Sacred<br>De Lacrua',
            heroSubtitle: 'Vitaly Kuzmin • Severodvinsk',
            heroQuote: '«Music is a reflection of the soul,<br>the rhythm of my life»',
            heroScrollHint: '↓ Discover the story',
            bioTitle: 'About Me',
            bioHtml: `
                <p class="lead">Greetings to all music lovers and those who have dedicated their entire lives and themselves without reserve to music!</p>
                <p>My name is <strong>Vitaly Kuzmin</strong>. I live in the city of Severodvinsk — a city by the White Sea. I started making music from early childhood: studied at a music school, learned to play guitar, keyboards, and drums. I went through a great school of sound engineering — working with modules, sound capture, and mastering.</p>
                <p>My path has been long and winding. I've worked as a DJ, nightclub administrator, event organizer, solo concert promoter, and with musical bands. But when you do what your soul burns for, the road is joyful, even if it's not easy.</p>
                <p>Over all this time, I've written many songs and a lot of music. I've never been a fan of just one artist, one style, or one direction. I believe there are many interesting genres, musicians, and styles in music. That's why I wasn't afraid to experiment and apply new technologies in sound and methods — something I still do today.</p>
                <p>My pseudonym is <strong>Sacred de Lacrua</strong>: mysterious and spiritual, simple and deep. My projects: <strong>SDL, Trackzone, PinkIsland</strong> — both solo and collaborative works. I am always open to cooperation and new people in our industry. I'm friends with musicians from my country and beyond.</p>
                <p>In short — that's probably it. Anyone who wants to get to know me and my work can find my published works on the internet and on my pages.</p>
                <p class="signature">Sacred De Lacrua</p>
            `,
            stylesTitle: 'Music Styles',
            galleryTitle: 'Gallery',
            contactsTitle: 'Contacts',
            contactsIntro: 'Open for collaboration and interesting projects'
        }
    };

    // ========================
    // 2. DOM ЭЛЕМЕНТЫ
    // ========================
    const heroNameEl = document.getElementById('heroName');
    const heroSubtitleEl = document.getElementById('heroSubtitle');
    const heroQuoteEl = document.getElementById('heroQuote');
    const heroScrollHintEl = document.getElementById('heroScrollHint');
    const bioTitleEl = document.getElementById('bioTitle');
    const bioTextEl = document.getElementById('bioText');
    const stylesTitleEl = document.getElementById('stylesTitle');
    const stylesGridEl = document.getElementById('stylesGrid');
    const galleryTitleEl = document.getElementById('galleryTitle');
    const contactsTitleEl = document.getElementById('contactsTitle');
    const contactsIntroEl = document.getElementById('contactsIntro');
    const trackNameEl = document.getElementById('trackName');
    const trackAlbumEl = document.getElementById('trackAlbum');
    const langButtons = document.querySelectorAll('.lang-btn');
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('playBtn');
    const progressSlider = document.getElementById('progressSlider');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');
    let animationFrame, isPlaying = false;

    // ========================
    // 3. ДИНАМИЧЕСКАЯ ЗАГРУЗКА МУЗЫКИ
    // ========================
    let allTracks = {}; // { folderPath: [fullUrls] }

    async function loadMusicData() {
        try {
            const response = await fetch('/music_api.php');
            const data = await response.json();
            data.forEach(item => {
                allTracks[item.folder] = item.tracks.map(track => item.folder + track);
            });
            const currentLang = localStorage.getItem('sacredLang') || 'ru';
            if (currentLang === 'ru') {
                translations.ru.styles = data.map(item => ({
                    name: item.name_ru,
                    cover: item.cover,
                    folder: item.folder,
                    desc: item.desc_ru
                }));
            } else {
                translations.en.styles = data.map(item => ({
                    name: item.name_en,
                    cover: item.cover,
                    folder: item.folder,
                    desc: item.desc_en
                }));
            }
            renderContent(currentLang);
        } catch (err) {
            console.error('Ошибка загрузки музыки:', err);
            translations.ru.styles = [];
            translations.en.styles = [];
            renderContent(localStorage.getItem('sacredLang') || 'ru');
        }
    }

    // ========================
    // 4. ОТРИСОВКА КОНТЕНТА
    // ========================
    function renderContent(lang) {
        const t = translations[lang];
        heroNameEl.innerHTML = t.heroName;
        heroSubtitleEl.textContent = t.heroSubtitle;
        heroQuoteEl.innerHTML = t.heroQuote;
        heroScrollHintEl.textContent = t.heroScrollHint;
        bioTitleEl.textContent = t.bioTitle;
        bioTextEl.innerHTML = t.bioHtml;
        stylesTitleEl.textContent = t.stylesTitle;
        galleryTitleEl.textContent = t.galleryTitle;
        contactsTitleEl.textContent = t.contactsTitle;
        contactsIntroEl.textContent = t.contactsIntro;

        // Стили музыки
        if (t.styles && t.styles.length) {
            let stylesHtml = '';
            t.styles.forEach(style => {
                stylesHtml += `
                    <div class="style-card">
                        <div class="style-cover">
                            <img src="${style.cover}" alt="${style.name}" onerror="this.src='assets/Pictures/logo2.jpg'" loading="lazy">
                        </div>
                        <div class="style-info">
                            <h3 class="style-name">${style.name}</h3>
                            <p class="style-desc">${style.desc}</p>
                            <div class="style-player" data-folder="${style.folder}">
                                <button class="mini-play-btn">▶</button>
                                <span class="mini-track-name">Загрузить трек</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            stylesGridEl.innerHTML = stylesHtml;
            // Привязка мини-плееров
            document.querySelectorAll('.style-player').forEach(player => {
                const btn = player.querySelector('.mini-play-btn');
                const folder = player.dataset.folder;
                btn.addEventListener('click', () => loadFirstTrackFromFolder(folder, player));
            });
        } else {
            stylesGridEl.innerHTML = '<div class="loading">Загрузка стилей...</div>';
        }

        document.documentElement.lang = lang;
        langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    }

    // ========================
    // 5. ЗАГРУЗКА ПЕРВОГО ТРЕКА ИЗ ПАПКИ
    // ========================
    async function loadFirstTrackFromFolder(folderPath, playerElement) {
        const trackNameSpan = playerElement.querySelector('.mini-track-name');
        const tracks = allTracks[folderPath];
        if (!tracks || tracks.length === 0) {
            trackNameSpan.textContent = 'Треки не найдены';
            return;
        }
        const firstTrack = tracks[0];
        audio.src = firstTrack;
        const fileName = decodeURIComponent(firstTrack.split('/').pop());
        trackNameEl.textContent = fileName;
        const styleCard = playerElement.closest('.style-card');
        const styleName = styleCard ? styleCard.querySelector('.style-name').textContent : '';
        trackAlbumEl.textContent = styleName;
        trackNameSpan.textContent = fileName;
        audio.load();
        audio.play().catch(e => console.warn('Автовоспроизведение заблокировано'));
        playBtn.textContent = '❚❚';
        isPlaying = true;
        updateProgress();
    }

    // ========================
    // 6. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
    // ========================
    function switchLanguage(lang) {
        renderContent(lang);
        localStorage.setItem('sacredLang', lang);
    }
    langButtons.forEach(btn => btn.addEventListener('click', () => switchLanguage(btn.dataset.lang)));

    // ========================
    // 7. АУДИОПЛЕЕР (с прогресс-баром и сохранением позиции)
    // ========================
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00 / 00:00';
        const totalSecs = Math.floor(seconds);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const durationMins = Math.floor(audio.duration / 60);
        const durationSecs = Math.floor(audio.duration % 60);
        return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')} / ${durationMins.toString().padStart(2,'0')}:${durationSecs.toString().padStart(2,'0')}`;
    }

    function updateProgress() {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percent + '%';
            if (progressSlider) progressSlider.value = percent;
            timeDisplay.textContent = formatTime(audio.currentTime);
        }
        if (isPlaying) {
            animationFrame = requestAnimationFrame(updateProgress);
        }
    }

    function setProgress(e) {
        if (!audio.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let percent = (x / rect.width) * 100;
        percent = Math.min(100, Math.max(0, percent));
        audio.currentTime = (percent / 100) * audio.duration;
        progressBar.style.width = percent + '%';
        if (progressSlider) progressSlider.value = percent;
    }

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.textContent = '❚❚';
                isPlaying = true;
                updateProgress();
            }).catch(e => console.warn('Воспроизведение невозможно'));
        } else {
            audio.pause();
            playBtn.textContent = '▶';
            isPlaying = false;
            cancelAnimationFrame(animationFrame);
        }
    });

    audio.addEventListener('ended', () => {
        playBtn.textContent = '▶';
        isPlaying = false;
        progressBar.style.width = '0%';
        if (progressSlider) progressSlider.value = 0;
        timeDisplay.textContent = formatTime(0);
        cancelAnimationFrame(animationFrame);
    });

    audio.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = formatTime(0);
        if (progressSlider) progressSlider.value = 0;
    });

    // Прогресс-бар по клику и слайдер
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.addEventListener('click', setProgress);
        if (progressSlider) {
            progressSlider.addEventListener('input', (e) => {
                if (!audio.duration) return;
                const percent = parseFloat(e.target.value);
                audio.currentTime = (percent / 100) * audio.duration;
                progressBar.style.width = percent + '%';
                timeDisplay.textContent = formatTime(audio.currentTime);
            });
        }
    }

    // Сохранение позиции в localStorage
    audio.addEventListener('timeupdate', () => {
        if (audio.currentTime && audio.duration) {
            localStorage.setItem('audioCurrentTime', audio.currentTime);
            localStorage.setItem('audioSrc', audio.src);
        }
    });
    // Восстановление позиции при загрузке страницы
    const savedSrc = localStorage.getItem('audioSrc');
    const savedTime = localStorage.getItem('audioCurrentTime');
    if (savedSrc && savedTime && savedSrc !== '') {
        audio.src = savedSrc;
        audio.load();
        audio.currentTime = parseFloat(savedTime);
        trackNameEl.textContent = savedSrc.split('/').pop();
        // Не восстанавливаем автовоспроизведение, чтобы не нарушать политику браузера
    }

    // ========================
    // 8. СЛАЙДЕР ФОТО (динамический)
    // ========================
    const photoFiles = [
        'concert1.jpg','drum.jpg','Im1.jpg','imguitar.jpg','PinkIsland1.jpg','PinkIsland2.jpg',
        'SDLRap.jpg','Trackzone.jpg','Trackzone2.jpg'
    ];
    const slider = document.getElementById('photoSlider');
    const prevBtnSlider = document.getElementById('prevSlide');
    const nextBtnSlider = document.getElementById('nextSlide');
    const dotsContainer = document.getElementById('sliderDots');
    let currentIndex = 0, slideInterval;

    photoFiles.forEach((file, i) => {
        const img = document.createElement('img');
        img.src = `assets/Pictures/Real/${file}`;
        img.alt = `Фото ${i+1}`;
        img.onerror = () => img.src = 'assets/Pictures/logo2.jpg';
        slider.appendChild(img);
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.dataset.index = i;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const slides = document.querySelectorAll('.slider img');
    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        if (photoFiles.length === 0) return;
        if (index < 0) index = photoFiles.length - 1;
        if (index >= photoFiles.length) index = 0;
        currentIndex = index;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }
    function startAutoSlide() { slideInterval = setInterval(nextSlide, 4000); }
    function stopAutoSlide() { clearInterval(slideInterval); }

    if (prevBtnSlider && nextBtnSlider) {
        prevBtnSlider.addEventListener('click', () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });
        nextBtnSlider.addEventListener('click', () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        goToSlide(0);
        startAutoSlide();
    }

    // ========================
    // 9. ПЛАВНЫЙ СКРОЛЛ К БЛОКУ "О СЕБЕ"
    // ========================
    if (heroScrollHintEl) {
        heroScrollHintEl.addEventListener('click', () => {
            document.querySelector('.bio').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ========================
    // 10. ИНИЦИАЛИЗАЦИЯ: загрузка музыки и языка
    // ========================
    loadMusicData().then(() => {
        const savedLang = localStorage.getItem('sacredLang') || 'ru';
        switchLanguage(savedLang);
    }).catch(() => {
        const savedLang = localStorage.getItem('sacredLang') || 'ru';
        switchLanguage(savedLang);
    });
});