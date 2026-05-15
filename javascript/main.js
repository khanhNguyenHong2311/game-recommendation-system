const currentPageMain = window.location.pathname.split('/').pop();

document.querySelectorAll('.nav__link').forEach(link => {
  const linkPage = link.getAttribute('href').split('/').pop();
  if (currentPageMain === linkPage || 
     (currentPageMain === '' && linkPage === 'index.html')) {
    link.classList.add('active');
  }
});