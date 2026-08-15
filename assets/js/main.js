/**
 * Main JavaScript for Radoslaw Pleskot - German Lessons Website
 * Handles language switching, accordion functionality, and mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {
    const storage = {
        get(key, fallback) {
            try {
                const value = localStorage.getItem(key);
                return value !== null ? value : fallback;
            } catch (error) {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                // Ignore storage errors in restricted modes.
            }
        }
    };

    // ============================================
    // LANGUAGE SWITCHER — static per-URL pages
    // ============================================
    // Language switching is now server-side (per-URL pages). The switcher is a
    // set of links; we only highlight the link matching the current path.
    const langBtns = document.querySelectorAll('.lang-btn');
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    // Landing pages and legal pages carry a static aria-current in the HTML;
    // only fall back to path-based highlighting when no static marker exists.
    const hasStaticActive = Array.from(langBtns).some(btn => btn.getAttribute('aria-current') === 'true');
    if (!hasStaticActive) {
        const path = window.location.pathname;
        const langMap = { '/pl/': 'pl', '/en/': 'en' };
        const current = langMap[path] || (path.startsWith('/pl') ? 'pl' : path.startsWith('/en') ? 'en' : 'de');
        langBtns.forEach(btn => {
            const matches = btn.getAttribute('href') && (
                (current === 'de' && btn.getAttribute('href') === '/') ||
                btn.getAttribute('href') === ('/' + current + '/')
            );
            btn.classList.toggle('active', !!matches);
        });
    }

    // ============================================
    // THEME TOGGLE
    // ============================================
    const savedTheme = storage.get(
        'theme',
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    htmlElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', next);
            storage.set('theme', next);
        });
    }

    // ============================================
    // LOCAL STORAGE NOTICE
    // ============================================
    const localNotice = document.getElementById('localNotice');

    if (localNotice) {
        const noticeKey = 'localNoticeSeen';
        const noticeButtons = localNotice.querySelectorAll('.local-notice__btn');
        const hasSeenNotice = storage.get(noticeKey, '0') === '1';

        if (!hasSeenNotice) {
            localNotice.classList.add('is-visible');
        }

        noticeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                localNotice.classList.remove('is-visible');
                storage.set(noticeKey, '1');
            });
        });
    }

    // ============================================
    // UTM / LANDING PAGE CAPTURE (privacy-first)
    // ============================================
    // Reads UTM parameters from the URL and copies them into the hidden form
    // fields. No cookies, no external trackers, no storage. If the URL has no
    // UTM parameters, the fields stay empty and the form still works.
    //
    // Landing pages have no form of their own: their CTAs point to the
    // homepage contact section (e.g. "/#kontakt"). To keep attribution across
    // the landing -> CTA -> form journey, UTM parameters present on the
    // landing URL are appended to every internal CTA link (before the hash),
    // and the original landing path is carried as "landing_page". The form
    // page then reads both from its own URL — still no cookies, no storage.
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'landing_page'];
    const urlParams = new URLSearchParams(window.location.search);
    const utmForm = document.querySelector('.contact-form form');

    const utmValues = {};
    utmFields.forEach(name => {
        if (name === 'landing_page') {
            // If a landing_page parameter was forwarded from a landing page
            // (landing -> CTA -> form journey), keep the ORIGINAL landing URL.
            // Otherwise fall back to the current page.
            utmValues[name] = urlParams.get('landing_page') || (window.location.pathname + window.location.search);
        } else {
            const value = urlParams.get(name);
            if (value) {
                utmValues[name] = value;
            }
        }
    });

    // Propagate UTM params to internal CTA links (same-origin, hash targets).
    // Only parameters actually present in the URL are forwarded. landing_page
    // is propagated only on non-index pages (landing/legal), where it carries
    // the original landing URL; on index pages it would be self-referential
    // noise ("/") and is left out.
    const isIndexPage = ['/', '/pl/', '/en/'].includes(window.location.pathname);
    const presentParams = utmFields.filter(name => utmValues[name] && (name !== 'landing_page' || !isIndexPage));
    if (presentParams.length > 0) {
        const query = presentParams.map(name => `${name}=${encodeURIComponent(utmValues[name])}`).join('&');
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            const hashIndex = href.indexOf('#');
            const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
            const hashPart = hashIndex === -1 ? '' : href.slice(hashIndex);
            if (pathPart === '') {
                return; // pure same-page anchor — no navigation, leave untouched
            }
            if (pathPart.includes('?')) {
                return; // already has a query string — leave untouched
            }
            link.setAttribute('href', pathPart + '?' + query + hashPart);
        });
    }

    if (utmForm) {
        utmFields.forEach(name => {
            const field = utmForm.querySelector(`input[name="${name}"]`);
            if (!field) {
                return;
            }
            if (utmValues[name]) {
                field.value = utmValues[name];
            }
        });
    }

    // ============================================
    // CONTACT FORM STATUS
    // ============================================
    const contactForm = document.querySelector('.contact-form form');
    const formStatus = document.getElementById('formStatus');
    const formStatusClose = document.querySelector('.form-status-close');

    if (contactForm && formStatus) {
        const nameInput = contactForm.querySelector('input[name="name"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageInput = contactForm.querySelector('textarea[name="message"]');
        const consentInput = contactForm.querySelector('input[name="privacyConsent"]');
        contactForm.dataset.startedAt = String(Date.now());
        const errorStatusEls = formStatus.querySelectorAll('[data-status="error"]');

        errorStatusEls.forEach(el => {
            el.dataset.defaultText = el.textContent;
        });

        const validationMessages = {
            de: {
                name: 'Name erforderlich.',
                email: 'E-Mail-Adresse erforderlich.',
                emailInvalid: 'Ungültige E-Mail-Adresse.',
                message: 'Nachricht erforderlich.',
                consent: 'Bitte akzeptieren Sie die Datenschutzerklärung.',
                spam: 'Bitte versuchen Sie es in einem Moment erneut.'
            },
            en: {
                name: 'Name required.',
                email: 'Email address required.',
                emailInvalid: 'Invalid email address.',
                message: 'Message required.',
                consent: 'Please accept the privacy policy.',
                spam: 'Please try again in a moment.'
            },
            pl: {
                name: 'Imię i nazwisko jest wymagane.',
                email: 'Adres e-mail jest wymagany.',
                emailInvalid: 'Proszę podać poprawny adres e-mail.',
                message: 'Wiadomość jest wymagana.',
                consent: 'Proszę zaakceptować politykę prywatności.',
                spam: 'Spróbuj ponownie za chwilę.'
            }
        };

        const clearValidity = (field) => {
            if (field) {
                field.setCustomValidity('');
            }
        };

        if (emailInput) {
            emailInput.addEventListener('input', () => clearValidity(emailInput));
        }

        if (nameInput) {
            nameInput.addEventListener('input', () => clearValidity(nameInput));
        }

        if (messageInput) {
            messageInput.addEventListener('input', () => clearValidity(messageInput));
        }

        if (consentInput) {
            consentInput.addEventListener('change', () => clearValidity(consentInput));
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentLang = htmlElement.getAttribute('lang') || storage.get('siteLanguage', 'de');
            const messages = validationMessages[currentLang] || validationMessages.de;
            const submitButtons = contactForm.querySelectorAll('button[type="submit"]');
            const honeypotField = contactForm.querySelector('input[name="website"]');
            const formStartTime = Number(contactForm.dataset.startedAt) || Date.now();
            const minFillTimeMs = 3000;

            const hideStatus = () => {
                formStatus.classList.remove('is-visible', 'is-sending', 'is-success', 'is-error');
                submitButtons.forEach(btn => btn.disabled = false);
                errorStatusEls.forEach(el => {
                    if (el.dataset.defaultText) {
                        el.textContent = el.dataset.defaultText;
                    }
                });
            };

            const showFormError = (errorText) => {
                formStatus.classList.remove('is-sending', 'is-success');
                formStatus.classList.add('is-error', 'is-visible');
                if (errorText) {
                    formStatus.querySelectorAll('[data-status="error"]').forEach(el => {
                        el.textContent = errorText;
                    });
                }
                setTimeout(hideStatus, 5000);
            };

            [nameInput, emailInput, messageInput, consentInput].forEach(clearValidity);

            if (honeypotField && honeypotField.value.trim()) {
                showFormError(messages.spam);
                return;
            }

            if (Date.now() - formStartTime < minFillTimeMs) {
                showFormError(messages.spam);
                return;
            }

            if (emailInput && !emailInput.value.trim()) {
                emailInput.setCustomValidity(messages.email);
                emailInput.reportValidity();
                return;
            }

            if (emailInput && emailInput.validity.typeMismatch) {
                emailInput.setCustomValidity(messages.emailInvalid);
                emailInput.reportValidity();
                return;
            }

            if (messageInput && !messageInput.value.trim()) {
                messageInput.setCustomValidity(messages.message);
                messageInput.reportValidity();
                return;
            }

            if (nameInput && !nameInput.value.trim()) {
                nameInput.setCustomValidity(messages.name);
                nameInput.reportValidity();
                return;
            }

            if (consentInput && !consentInput.checked) {
                consentInput.setCustomValidity(messages.consent);
                consentInput.reportValidity();
                return;
            }

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            submitButtons.forEach(btn => {
                btn.disabled = true;
                btn.classList.add('is-loading');
                if (btn.dataset.loading) {
                    btn.textContent = btn.dataset.loading;
                }
            });
            contactForm.setAttribute('aria-busy', 'true');

            formStatus.classList.remove('is-success', 'is-error');
            formStatus.classList.add('is-sending');
            formStatus.classList.add('is-visible');

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method || 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.classList.remove('is-sending');
                    formStatus.classList.add('is-success');
                    formStatus.classList.remove('is-error');
                    contactForm.reset();
                    submitButtons.forEach(btn => btn.disabled = true);
                } else {
                    formStatus.classList.remove('is-sending');
                    formStatus.classList.add('is-error');
                    formStatus.classList.remove('is-success');
                    setTimeout(hideStatus, 5000);
                }
            } catch (err) {
                formStatus.classList.remove('is-sending');
                formStatus.classList.add('is-error');
                formStatus.classList.remove('is-success');
                setTimeout(hideStatus, 5000);
            } finally {
                submitButtons.forEach(btn => {
                    if (!formStatus.classList.contains('is-success')) {
                        btn.disabled = false;
                    }
                    btn.classList.remove('is-loading');
                    if (btn.dataset.label) {
                        btn.textContent = btn.dataset.label;
                    }
                });
                contactForm.removeAttribute('aria-busy');
            }
        });
    }

    if (formStatusClose && formStatus) {
        formStatusClose.addEventListener('click', () => {
            formStatus.classList.remove('is-visible', 'is-sending', 'is-success', 'is-error');
            const submitButtons = contactForm ? contactForm.querySelectorAll('button[type="submit"]') : [];
            submitButtons.forEach(btn => btn.disabled = false);
        });
    }

    // ============================================
    // ACCORDION FUNCTIONALITY
    // ============================================
    const accordionBtns = document.querySelectorAll('.accordion-btn');

    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = document.getElementById(btn.getAttribute('aria-controls'));
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';

            // Close all other accordions
            accordionBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    const otherContent = document.getElementById(otherBtn.getAttribute('aria-controls'));
                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                    }
                }
            });

            // Toggle current accordion
            btn.setAttribute('aria-expanded', !isExpanded);

            if (content) {
                if (!isExpanded) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = null;
                }
            }
        });
    });

    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    const navList = document.querySelector('.nav-list');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('open');
            document.body.style.overflow = !isExpanded ? 'hidden' : ''; // Prevent background scrolling
        });

        // Close mobile menu when clicking a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Only smooth scroll if it's a valid anchor
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    const header = document.querySelector('.header');

    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                header.style.backgroundColor = 'var(--color-bg-header)'; 
            } else {
                header.style.boxShadow = 'none';
                header.style.backgroundColor = 'transparent';
            }

            lastScroll = currentScroll;
        });
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    document.querySelectorAll('section, .card, .offer-item, .contact-info, .element-fade-in').forEach(el => {
        el.classList.add('element-fade-in');
        observer.observe(el);
    });

    // ============================================
    // ACCESSIBILITY: FOCUS STYLES
    // ============================================
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            if (nav && nav.classList.contains('open')) {
                nav.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    });

    // ============================================
    // PERFORMANCE: LAZY LOAD IMAGES
    // ============================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length) {
        const loadImage = (img) => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        };

        if ('loading' in HTMLImageElement.prototype) {
            lazyImages.forEach(loadImage);
        } else if ('IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    loadImage(entry.target);
                    obs.unobserve(entry.target);
                });
            }, { rootMargin: '200px 0px' });

            lazyImages.forEach(img => imgObserver.observe(img));
        } else {
            lazyImages.forEach(loadImage);
        }
    }
});
