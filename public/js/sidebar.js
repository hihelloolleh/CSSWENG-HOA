document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.querySelector('.sidebar');
    const wrapper = document.querySelector('.main-wrapper');
    const openBtn = document.querySelector('.sidebar-open');

    if (openBtn) {
        openBtn.addEventListener('click', () => {

            // Desktop / tablet
            if (window.innerWidth > 768) {

                sidebar.classList.toggle('collapsed');

                // Adjust dashboard width
                if (sidebar.classList.contains('collapsed')) {
                    wrapper.style.marginLeft = '80px'; // collapsed
                } else {
                    wrapper.style.marginLeft = '240px'; // expanded
                }

            } else {
                // Mobile
                sidebar.classList.toggle('mobile-open');
            }

        });
    }

});
