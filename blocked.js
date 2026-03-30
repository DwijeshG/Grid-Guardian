document.addEventListener('DOMContentLoaded', () => {
    const goBackBtn = document.getElementById('go-back-btn');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
});
