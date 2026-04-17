        // Change URL to /blog without reloading
        if (window.location.pathname !== '/blog') {
            window.history.replaceState({}, '', '/blog');
        }

        // Handle back button click without hash
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                sessionStorage.setItem('scrollToBlog', 'true');
                window.location.href = '/home.html';
            });
        }

        // Smooth scroll for hash links and keep the URL clean
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                e.preventDefault();
                const target = document.getElementById(href.substring(1));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', window.location.pathname);
                }
            });
        });

        // If the page opened with a hash, scroll smoothly then strip the hash from the URL
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            history.replaceState(null, '', window.location.pathname);
            window.addEventListener('load', () => {
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
