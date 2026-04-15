        // Change URL to /blog without reloading
        if (window.location.pathname !== '/blog') {
            window.history.replaceState({}, '', '/blog');
        }

        // Handle back button click without hash
        document.querySelector('.back-btn').addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.setItem('scrollToBlog', 'true');
            window.location.href = '/home.html';
        });
