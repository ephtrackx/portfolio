let siteData = null;
let currentLang = 'en';
let currentTabId = 'about';
let photoSliderInterval = null;

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('btn-ua').className = `lang-btn ${lang === 'ua' ? 'active' : ''}`;
    document.getElementById('btn-en').className = `lang-btn ${lang === 'en' ? 'active' : ''}`;
    
    const headerLogo = document.getElementById('site-logo-text');
    if (headerLogo) headerLogo.innerText = lang === 'ua' ? 'ОЛЕКСАНДР СТРАТОНОВ' : 'ALEXANDER STRATONOV';

    const footerAuthor = document.getElementById('footer-author-text');
    const footerRights = document.getElementById('footer-rights-text');
    if (footerAuthor) footerAuthor.innerText = lang === 'ua' ? 'ОЛЕКСАНДР СТРАТОНОВ' : 'ALEXANDER STRATONOV';
    if (footerRights) footerRights.innerText = lang === 'ua' ? 'УСІ ПРАВА ЗАХИЩЕНІ.' : 'ALL RIGHTS RESERVED.';

    renderNavigation();
    
    const navItem = siteData.navigation.find(n => n.page_id === currentTabId);
    const title = navItem ? (currentLang === 'ua' ? (navItem.menu_title_ua || navItem.menu_title_en) : (navItem.menu_title_en || navItem.menu_title_ua)) : 'PORTFOLIO';
    switchTab(currentTabId, title);
}

async function loadPortfolioData() {
    try {
        const response = await fetch('data.json');
        siteData = await response.json();
        renderNavigation();
        
        if (siteData.navigation && siteData.navigation.length > 0) {
            const firstNav = siteData.navigation[0];
            const title = currentLang === 'ua' ? (firstNav.menu_title_ua || firstNav.menu_title_en) : (firstNav.menu_title_en || firstNav.menu_title_ua);
            switchTab(firstNav.page_id, title);
        } else {
            switchTab('about', 'ABOUT ME');
        }
    } catch (error) {
        console.error('Error loading data.json:', error);
    }
}

function renderNavigation() {
    const navContainer = document.getElementById('navbar');
    navContainer.innerHTML = '';

    siteData.navigation.forEach(item => {
        const navEl = document.createElement('div');
        navEl.className = 'nav-item';
        const title = currentLang === 'ua' ? (item.menu_title_ua || item.menu_title_en) : (item.menu_title_en || item.menu_title_ua);
        navEl.innerText = title;
        navEl.dataset.pageId = item.page_id;
        navEl.onclick = () => switchTab(item.page_id, title);
        navContainer.appendChild(navEl);
    });
}

function switchTab(pageId, title) {
    currentTabId = pageId;
    if (photoSliderInterval) clearInterval(photoSliderInterval);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.pageId === pageId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    document.getElementById('page-title').innerText = title;
    const contentArea = document.getElementById('content-area');

    if (pageId === 'about') {
        document.getElementById('record-count-box').style.display = 'none';
        renderAboutPage(contentArea);
    } else if (pageId === 'music') {
        document.getElementById('record-count-box').style.display = 'flex';
        renderMusicPage(contentArea);
    } else {
        document.getElementById('record-count-box').style.display = 'flex';
        renderGridPage(pageId, contentArea);
    }
}

function renderAboutPage(container) {
    const about = (siteData.pages && siteData.pages.about) ? siteData.pages.about : {};
    const bioText = currentLang === 'ua' 
        ? (about.bio_ua || about.bio_en || 'Інформація відсутня.') 
        : (about.bio_en || about.bio_ua || 'No information available.');

    const workHistory = currentLang === 'ua' 
        ? (about.work_history_ua && about.work_history_ua.length > 0 ? about.work_history_ua : about.work_history_en)
        : (about.work_history_en && about.work_history_en.length > 0 ? about.work_history_en : about.work_history_ua);

    const photos = about.photos && about.photos.length > 0 ? shuffleArray(about.photos) : [];

    let html = `
        <div class="space-y-12">
            ${photos.length > 0 ? `
                <article class="border border-studio-border bg-studio-alt/40 p-6 md:p-8 space-y-4">
                    <div class="flex justify-between items-center font-mono text-xs text-studio-muted">
                        <span>// ${currentLang === 'ua' ? 'ГАЛЕРЕЯ' : 'GALLERY'}</span>
                        <span id="photo-counter">01 / ${String(photos.length).padStart(2, '0')}</span>
                    </div>
                    <div class="aspect-video sm:aspect-[21/9] studio-border bg-studio-bg overflow-hidden relative flex items-center justify-center">
                        ${photos.map((p, idx) => `
                            <div class="photo-slide absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === 0 ? 'opacity-100 active' : 'opacity-0'} flex items-center justify-center overflow-hidden">
                                <img src="${p}" class="absolute inset-0 w-full h-full object-cover filter blur-md brightness-50 scale-105" alt="Blur Background">
                                <img src="${p}" class="slide-image relative z-10 max-w-full max-h-full object-contain" alt="Alexander Stratonov Photo">
                            </div>
                        `).join('')}
                    </div>
                </article>
            ` : ''}

            <article class="border border-studio-border bg-studio-alt/40 p-6 md:p-8 space-y-4">
                <h2 class="font-mono text-xs text-studio-muted uppercase tracking-widest">// ${currentLang === 'ua' ? 'БІОГРАФІЯ' : 'BIOGRAPHY'}</h2>
                <p class="text-base md:text-lg leading-relaxed text-yellow-100/90 font-sans whitespace-pre-line">${bioText}</p>
            </article>

            ${workHistory && workHistory.length > 0 ? `
                <article class="border border-studio-border bg-studio-alt/40 p-6 md:p-8 space-y-4">
                    <h2 class="font-mono text-xs text-studio-muted uppercase tracking-widest mb-4">// ${currentLang === 'ua' ? 'ДОСВІД РОБОТИ' : 'WORK EXPERIENCE'}</h2>
                    <div class="space-y-3">
                        ${workHistory.map(w => `
                            <div class="flex flex-col sm:flex-row items-stretch gap-2 font-mono text-xs sm:text-sm">
                                <span class="bg-studio-yellow text-studio-bg px-3 py-2 font-bold inline-flex items-center shrink-0 sm:w-44 justify-center sm:justify-start">${w.period}</span>
                                <div class="border border-studio-yellow/40 text-studio-yellow px-3 py-2 uppercase leading-tight inline-flex items-center flex-grow">
                                    ${w.title}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </article>
            ` : ''}

            <article class="border border-studio-border bg-studio-alt/40 p-6 md:p-8 space-y-4">
                <h2 class="font-mono text-xs text-studio-muted uppercase tracking-widest">// ${currentLang === 'ua' ? 'КОНТАКТИ ТА СОЦМЕРЕЖІ' : 'CONTACTS & SOCIALS'}</h2>
                <div class="flex flex-wrap gap-3 font-mono text-xs">
                    ${about.contact_email ? `<a href="mailto:${about.contact_email}" class="btn-primary">EMAIL: ${about.contact_email}</a>` : ''}
                    ${about.contact_facebook ? `<a href="${about.contact_facebook}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">FACEBOOK</a>` : ''}
                    ${about.contact_instagram ? `<a href="${about.contact_instagram}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">INSTAGRAM</a>` : ''}
                    ${about.contact_linkedin ? `<a href="${about.contact_linkedin}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">LINKEDIN</a>` : ''}
                    ${about.contact_youtube ? `<a href="${about.contact_youtube}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">YOUTUBE</a>` : ''}
                    ${about.contact_soundcloud ? `<a href="${about.contact_soundcloud}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">SOUNDCLOUD</a>` : ''}
                    ${about.contact_bandcamp ? `<a href="${about.contact_bandcamp}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">BANDCAMP</a>` : ''}
                    ${about.contact_byumeacoffee ? `<a href="${about.contact_byumeacoffee}" target="_blank" class="border border-studio-border p-3 hover:border-studio-yellow transition-colors">BUY ME A COFFEE</a>` : ''}
                </div>
            </article>
        </div>
    `;

    container.innerHTML = html;

    if (photos.length > 1) {
        let currentIdx = 0;
        const slides = document.querySelectorAll('.photo-slide');
        const counter = document.getElementById('photo-counter');

        photoSliderInterval = setInterval(() => {
            slides[currentIdx].classList.remove('opacity-100', 'active');
            slides[currentIdx].classList.add('opacity-0');
            currentIdx = (currentIdx + 1) % slides.length;
            slides[currentIdx].classList.remove('opacity-0');
            slides[currentIdx].classList.add('opacity-100', 'active');
            if (counter) counter.innerText = `${String(currentIdx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        }, 5000);
    }
}

function renderMusicPage(container) {
    const items = (siteData.pages && siteData.pages.music) ? siteData.pages.music : [];
    document.getElementById('record-count').innerText = items.length;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="p-12 border border-studio-border bg-studio-alt/30 text-center font-mono">
                <p class="text-studio-muted uppercase">[ ${currentLang === 'ua' ? 'ПОКИ ЩО НЕМАЄ ЗАПИСІВ У ЦЬОМУ РОЗДІЛІ' : 'NO RECORDS IN THIS SECTION YET'} ]</p>
            </div>
        `;
        return;
    }

    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">`;

    items.forEach(item => {
        const coverSrc = item.cover_image && item.cover_image.trim() !== '' 
            ? item.cover_image 
            : (item.track_id ? `img/mus/${item.track_id}.jpg` : null);

        const releaseType = currentLang === 'ua' 
            ? (item.release_type_ua || item.release_type_en || '')
            : (item.release_type_en || item.release_type_ua || '');

        const authorClean = item.author ? item.author.trim() : '';
        const isSelfAuthor = !authorClean || 
            authorClean.toLowerCase() === 'alexander stratonov' || 
            authorClean.toLowerCase() === 'олександр стратонов';

        let authorFormatted = '';
        if (!isSelfAuthor) {
            authorFormatted = currentLang === 'ua' ? ` ${authorClean}` : ` by ${authorClean}`;
        }

        const metaSubtext = [item.release_date || '2026', releaseType + authorFormatted].filter(Boolean).join(' // ');

        html += `
            <article class="border border-studio-border bg-studio-alt/40 p-5 flex flex-col justify-between hover:border-studio-yellow transition-colors duration-200">
                <div class="space-y-4">
                    <div class="aspect-square studio-border bg-studio-bg overflow-hidden relative group w-full">
                        ${coverSrc ? `
                            <img src="${coverSrc}" 
                                 alt="${item.title}" 
                                 class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                 onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'aspect-square studio-border bg-studio-bg flex items-center justify-center font-mono text-xs text-studio-muted p-4 text-center\\'>[ MISSING COVER: ${coverSrc} ]</div>';">
                        ` : `
                            <div class="aspect-square studio-border bg-studio-bg flex items-center justify-center font-mono text-xs text-studio-muted">
                                [ NO COVER SPECIFIED ]
                            </div>
                        `}
                    </div>

                    <h2 class="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-studio-yellow leading-tight">
                        ${item.title}
                    </h2>

                    <div class="font-mono text-xs text-studio-muted uppercase tracking-wide border-b border-studio-border/40 pb-3">
                        ${metaSubtext}
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 font-mono text-[11px] pt-4 mt-auto">
                    ${item.youtube_url ? `<a href="${item.youtube_url}" target="_blank" class="border border-studio-border p-2 text-center hover:border-studio-yellow hover:bg-studio-yellow hover:text-studio-bg font-bold transition-colors">YOUTUBE</a>` : '<span class="border border-studio-border/20 p-2 text-center text-studio-muted/30 cursor-not-allowed">YOUTUBE</span>'}
                    ${item.soundcloud_url ? `<a href="${item.soundcloud_url}" target="_blank" class="border border-studio-border p-2 text-center hover:border-studio-yellow hover:bg-studio-yellow hover:text-studio-bg font-bold transition-colors">SOUNDCLOUD</a>` : '<span class="border border-studio-border/20 p-2 text-center text-studio-muted/30 cursor-not-allowed">SOUNDCLOUD</span>'}
                    ${item.bandcamp_url ? `<a href="${item.bandcamp_url}" target="_blank" class="border border-studio-border p-2 text-center hover:border-studio-yellow hover:bg-studio-yellow hover:text-studio-bg font-bold transition-colors">BANDCAMP</a>` : '<span class="border border-studio-border/20 p-2 text-center text-studio-muted/30 cursor-not-allowed">BANDCAMP</span>'}
                </div>
            </article>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderGridPage(pageId, container) {
    const items = (siteData.pages && siteData.pages[pageId]) ? siteData.pages[pageId] : [];
    document.getElementById('record-count').innerText = items.length;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="p-12 border border-studio-border bg-studio-alt/30 text-center font-mono">
                <p class="text-studio-muted uppercase">[ ${currentLang === 'ua' ? 'ПОКИ ЩО НЕМАЄ ЗАПИСІВ У ЦЬОМУ РОЗДІЛІ' : 'NO RECORDS IN THIS SECTION YET'} ]</p>
            </div>
        `;
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        const targetLink = item.video_url || item.external_link;
        const isEven = index % 2 === 0;

        let coverSrc = currentLang === 'ua' 
            ? (item.cover_image_ua || item.cover_image_en) 
            : (item.cover_image_en || item.cover_image_ua);

        if (!coverSrc && item.project_id) {
            coverSrc = `img/doc/${item.project_id}.jpg`;
        }

        const itemTitle = currentLang === 'ua' ? (item.title_ua || item.title_en) : (item.title_en || item.title_ua);
        const itemRole = currentLang === 'ua' ? (item.role_ua || item.role_en) : (item.role_en || item.role_ua);
        const itemDesc = currentLang === 'ua' ? (item.description_ua || item.description_en) : (item.description_en || item.description_ua);
        const descText = itemDesc ? itemDesc.trim() : (currentLang === 'ua' ? 'Опис проєкту відсутній.' : 'No description available.');

        const youtubeBtnText = currentLang === 'ua' ? 'Дивитися на YouTube' : 'Watch on YouTube';

        html += `
            <article class="border border-studio-border bg-studio-alt/40 p-6 md:p-8 hover:border-studio-yellow transition-colors duration-200">
                <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-stretch">
                    <div class="xl:col-span-7 ${isEven ? 'xl:order-1' : 'xl:order-2'} w-full flex flex-col justify-center">
                        ${coverSrc ? `
                            <a href="${targetLink || '#'}" target="_blank" class="${targetLink ? 'cursor-pointer' : 'cursor-default'} block aspect-video studio-border bg-studio-bg overflow-hidden relative group w-full">
                                <img src="${coverSrc}" 
                                     alt="${itemTitle}" 
                                     class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'aspect-video studio-border bg-studio-bg flex items-center justify-center font-mono text-xs text-studio-muted\\'>[ MISSING IMAGE: ${coverSrc} ]</div>';">
                                ${targetLink ? `
                                    <div class="absolute inset-0 bg-studio-bg/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4 backdrop-blur-xs">
                                        <div class="btn-primary transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                                            <span>${youtubeBtnText}</span>
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                        </div>
                                    </div>
                                ` : ''}
                            </a>
                        ` : `
                            <div class="aspect-video studio-border bg-studio-bg flex items-center justify-center font-mono text-xs text-studio-muted">
                                [ NO COVER SPECIFIED ]
                            </div>
                        `}
                    </div>

                    <div class="xl:col-span-5 ${isEven ? 'xl:order-2' : 'xl:order-1'} flex flex-col space-y-4 h-full min-h-0">
                        <div class="flex items-stretch gap-2 font-mono text-xs shrink-0">
                            <span class="bg-studio-yellow text-studio-bg px-2 py-1 font-bold inline-flex items-center shrink-0">${item.year || '2026'}</span>
                            ${itemRole ? `
                                <div class="border border-studio-yellow/40 text-studio-yellow px-2 py-1 uppercase leading-tight inline-flex items-center flex-grow">
                                    ${itemRole}
                                </div>
                            ` : ''}
                        </div>

                        <h2 class="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-studio-yellow leading-tight shrink-0">
                            ${itemTitle}
                        </h2>

                        <div class="desc-scroll overflow-y-auto flex-1 min-h-0 pr-2 text-sm md:text-base leading-relaxed text-yellow-100/90 font-sans whitespace-pre-line">${descText}</div>
                    </div>
                </div>
            </article>
        `;
    });

    container.innerHTML = html;
}

window.onload = loadPortfolioData;