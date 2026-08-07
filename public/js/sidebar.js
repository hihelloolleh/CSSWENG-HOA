document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.querySelector('.sidebar');
    const wrapper = document.querySelector('.main-wrapper');
    const openBtn = document.querySelector('.sidebar-open');
    const closeBtn = document.querySelector('.sidebar-close');
    const sidebarClickSound = document.getElementById("sidebarClickSound");

    function playSidebarSound() {
        if (!sidebarClickSound) return;
    
        sidebarClickSound.currentTime = 0;
        sidebarClickSound.play().catch(console.error);
    }

    document.querySelectorAll('.sidebar .nav-item[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            playSidebarSound();

            const url = link.href;

            setTimeout(() => {
                window.location.href = url;
            }, 100);
        });
    });

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            playSidebarSound();
            // desktop or tablet views
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('collapsed');

                // adjust dashboard width
                if (sidebar.classList.contains('collapsed')) {
                    wrapper.style.marginLeft = '80px'; // collapsed
                } else {
                    wrapper.style.marginLeft = '240px'; // expanded
                }

            } else {
                // mobile view: hide sidebar and make hamburger menu visible 
                sidebar.classList.toggle('mobile-open');
            }

        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            playSidebarSound();
            sidebar.classList.remove('mobile-open');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const financeToggle = document.querySelector('.finance-toggle');
    const financeTab = document.querySelector('.main-tab');

    if (financeToggle && financeTab) {
        financeToggle.addEventListener('click', () => {
            financeTab.classList.toggle('open');
        });
    }
});
