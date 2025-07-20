// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.updateThemeIcon();
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.hasManualPreference()) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(newTheme);
                    this.currentTheme = newTheme;
                    this.updateThemeIcon();
                }
            });
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.currentTheme = newTheme;
        this.storeTheme(newTheme);
        this.updateThemeIcon();
        this.addToggleAnimation();
    }

    applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(`theme-${theme}`);
        body.setAttribute('data-theme', theme);
        this.updateMetaThemeColor(theme);
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        const colors = { light: '#ffffff', dark: '#0f1419' };
        metaThemeColor.content = colors[theme] || colors.light;
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            const icons = { light: 'fas fa-moon', dark: 'fas fa-sun' };
            themeIcon.className = icons[this.currentTheme] || icons.light;
        }
    }

    addToggleAnimation() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => { themeToggle.style.transform = 'scale(1)'; }, 150);
        }
    }

    storeTheme(theme) {
        try {
            localStorage.setItem('portfolio-theme', theme);
            localStorage.setItem('portfolio-theme-manual', 'true');
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('portfolio-theme');
        } catch (error) {
            return null;
        }
    }

    hasManualPreference() {
        try {
            return localStorage.getItem('portfolio-theme-manual') === 'true';
        } catch (error) {
            return false;
        }
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
}

// Portfolio data and functionality
class Portfolio {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.populateContent();
            this.hideLoading();
            this.setCurrentYear();
        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
            this.showError('Failed to load portfolio data. Please try again later.');
        }
    }

    async loadData() {
        try {
            const response = await fetch('portfolio.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Navigation toggle for mobile
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }

        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        });

        // CV Download functionality
        const downloadCV = document.getElementById('downloadCV');
        if (downloadCV) {
            downloadCV.addEventListener('click', () => {
                this.downloadCV();
            });
        }

        this.setupScrollAnimations();
    }

    populateContent() {
        if (!this.data) return;

        this.populateHero();
        this.populateAbout();
        this.populateSkills();
        this.populateExperience();
        this.populateProjects();
        this.populateContact();
    }

    populateHero() {
        const { personal } = this.data;
        document.getElementById('heroName').textContent = personal.name;
        document.getElementById('heroTitle').textContent = personal.title;
        document.getElementById('heroDescription').textContent = personal.description;

        this.setupProfileImage();
    }

    setupProfileImage() {
        const profileImg = document.querySelector('.profile-image');
        const fallbackAvatar = document.getElementById('fallbackAvatar');

        if (profileImg) {
            // Force check if image loaded
            const img = new Image();
            img.src = profileImg.src;

            img.onload = function () {
                // Image loaded successfully
                if (fallbackAvatar) {
                    fallbackAvatar.style.display = 'none';
                }
            };

            img.onerror = function () {
                // Image failed to load
                if (profileImg) profileImg.style.display = 'none';
                if (fallbackAvatar) fallbackAvatar.style.display = 'block';
            };
        }
    }

    populateAbout() {
        const { about } = this.data;

        const aboutText = document.getElementById('aboutText');
        aboutText.innerHTML = about.description.map(paragraph =>
            `<p>${paragraph}</p>`
        ).join('');

        const aboutStats = document.getElementById('aboutStats');
        aboutStats.innerHTML = about.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-number">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    populateSkills() {
        const { skills } = this.data;

        const skillsGrid = document.getElementById('skillsGrid');
        skillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-item">
                <div class="skill-icon">
                    <i class="${skill.icon}"></i>
                </div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">${skill.level}</div>
            </div>
        `).join('');
    }

    populateExperience() {
        const { experience } = this.data;

        const experienceTimeline = document.getElementById('experienceTimeline');
        experienceTimeline.innerHTML = experience.map(exp => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-date">${exp.period}</div>
                    <div class="timeline-title">${exp.position}</div>
                    <div class="timeline-company">${exp.company}</div>
                    <div class="timeline-description">${exp.description}</div>
                </div>
            </div>
        `).join('');
    }

    populateProjects() {
        const { projects } = this.data;

        const projectsGrid = document.getElementById('projectsGrid');
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-image">
                    <i class="${project.icon}"></i>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies.map(tech =>
            `<span class="tech-tag">${tech}</span>`
        ).join('')}
                    </div>
                    <div class="project-links">
                        ${project.liveUrl ?
                `<a href="${project.liveUrl}" class="project-link" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-external-link-alt"></i>
                                Live Demo
                            </a>` : ''
            }
                        ${project.codeUrl ?
                `<a href="${project.codeUrl}" class="project-link" target="_blank" rel="noopener noreferrer">
                                <i class="fab fa-github"></i>
                                Source Code
                            </a>` : ''
            }
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateContact() {
        const { contact } = this.data;

        document.getElementById('contactDescription').textContent = contact.description;

        const contactLinks = document.getElementById('contactLinks');
        contactLinks.innerHTML = contact.links.map(link => `
            <a href="${link.url}" class="contact-link" target="_blank" rel="noopener noreferrer">
                <div class="contact-icon">
                    <i class="${link.icon}"></i>
                </div>
                <div class="contact-label">${link.label}</div>
            </a>
        `).join('');
    }

    async downloadCV() {
        try {
            // Try to download the PDF file first
            const response = await fetch('cv.pdf');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${this.data?.personal?.name || 'Portfolio'}_CV.pdf`;
                link.setAttribute('rel', 'noopener noreferrer');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('CV file not found');
            }
        } catch (error) {
            console.error('Error downloading CV:', error);
            // Fallback: Generate a text CV
            this.downloadTextCV();
        }
    }

    downloadTextCV() {
        try {
            const cvContent = this.generateCVContent();
            const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.data?.personal?.name || 'Portfolio'}_CV.txt`;
            link.setAttribute('rel', 'noopener noreferrer');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating CV:', error);
            alert('CV download is currently unavailable. Please contact me directly.');
        }
    }

    generateCVContent() {
        if (!this.data) return 'CV content unavailable';

        const { personal, about, skills, experience, contact } = this.data;

        return `${personal.name} - CV
${personal.title}

Contact Information:
${contact.links.map(link => `${link.label}: ${link.url}`).join('\n')}

About:
${about.description.join('\n\n')}

Skills:
${skills.map(skill => `• ${skill.name} (${skill.level})`).join('\n')}

Experience:
${experience.map(exp =>
            `${exp.position} at ${exp.company} (${exp.period})
    ${exp.description}`
        ).join('\n\n')}

This CV was generated from portfolio data. For a formatted version, please contact me directly.`;
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll(
            '.skill-item, .project-card, .timeline-item, .stat-item, .contact-link'
        );

        animateElements.forEach(el => observer.observe(el));
    }

    setCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }
    }

    showError(message) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="error-icon" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p style="color: var(--text-color); margin-bottom: 1rem;">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Prevent flash of unstyled content
(function () {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.setAttribute('data-theme', theme);
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    new Portfolio();
});

// Handle navigation active states
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(var(--bg-color-rgb), 0.95)';
        header.style.boxShadow = '0 2px 20px var(--shadow)';
    } else {
        header.style.background = 'rgba(var(--bg-color-rgb), 0.9)';
        header.style.boxShadow = 'none';
    }
});