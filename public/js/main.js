/**
 * FabNet UAE - Production Core Script
 * Shared across all public site pages
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveLinks();
  initHeroCarousel();
  initScrollReveal();
  initRfqForm();
});

/**
 * Navbar scroll and mobile drawer
 */
function initNavbar() {
  const header = document.querySelector('header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-menu-close');

  // Header background on scroll
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Mobile menu drawer
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

/**
 * Highlight active link in navigation based on current URL
 */
function initActiveLinks() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('.nav-link, #mobile-menu a');

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (!linkPath) return;

    if (linkPath === '/' || linkPath === '/index.html' || linkPath === 'index.html') {
      if (currentPath === '/' || currentPath === '/index.html' || currentPath === '') {
        link.classList.add('active');
      }
    } else if (currentPath.includes(linkPath.replace(/^\//, '').replace('.html', ''))) {
      link.classList.add('active');
    }
  });
}

/**
 * Hero Carousel functionality
 */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  let carouselTimer = null;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    const next = (currentIndex + 1) % slides.length;
    showSlide(next);
  }

  function startTimer() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopTimer();
    carouselTimer = setInterval(nextSlide, 6500);
  }

  function stopTimer() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      showSlide(idx);
      startTimer();
    });
  });

  const carouselContainer = document.getElementById('hero-carousel');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopTimer);
    carouselContainer.addEventListener('mouseleave', startTimer);
  }

  showSlide(0);
  startTimer();
}

/**
 * Scroll Reveal using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item, .reveal-card, .scroll-reveal');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible', 'active');
          }, idx * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible', 'active'));
  }
}

/**
 * Interactive RFQ / Contact Form Handling
 */
function initRfqForm() {
  const rfqForm = document.getElementById('rfq-form') || document.querySelector('form.rfq-form');
  if (!rfqForm) return;

  rfqForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = rfqForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'SUBMIT';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        TRANSMITTING RFQ...
      `;
    }

    // Simulate defense RFQ portal response with a formal ticket ID
    setTimeout(() => {
      const rfqId = 'FBN-' + Math.floor(100000 + Math.random() * 900000);
      
      const successModal = document.createElement('div');
      successModal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
      successModal.innerHTML = `
        <div class="bg-technical-gray border border-industrial-red max-w-md w-full p-8 relative shadow-2xl animate-ken-burns" style="animation-iteration-count: 1; animation-duration: 0.3s;">
          <div class="flex items-center gap-3 text-industrial-red mb-4">
            <span class="material-symbols-outlined text-3xl">verified</span>
            <span class="font-label-caps text-sm tracking-widest">TRANSMISSION CONFIRMED</span>
          </div>
          <h3 class="font-headline-md text-2xl text-white mb-2">RFQ Received</h3>
          <p class="text-sm text-neutral-300 mb-6">
            Your quotation request has been logged into the FabNet Sovereign Procurement Network. A technical defense liaison engineer will review your specifications under NDA.
          </p>
          <div class="bg-black/60 p-4 border border-border-gray mb-6">
            <div class="font-label-caps text-xs text-neutral-400 mb-1">REFERENCE DOSSIER ID</div>
            <div class="font-mono text-xl text-industrial-red font-bold tracking-wider">${rfqId}</div>
          </div>
          <button id="modal-close-btn" class="w-full btn-red py-3">ACKNOWLEDGE &amp; CLOSE</button>
        </div>
      `;

      document.body.appendChild(successModal);

      document.getElementById('modal-close-btn').addEventListener('click', () => {
        successModal.remove();
        rfqForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }, 1200);
  });
}
