document.querySelectorAll('form.contact-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var existing = form.querySelector('.demo-shim-note');
    if (existing) return;
    var note = document.createElement('p');
    note.className = 'demo-shim-note';
    note.style.cssText = 'margin-top:16px;padding:14px 18px;border:1px solid rgba(249,198,97,.3);' +
      'border-radius:4px;background:rgba(249,198,97,.08);color:var(--gold,#F9C661);' +
      'font-family:"Jost",sans-serif;font-size:.9rem;';
    note.textContent = 'To jest wersja demonstracyjna - formularz nie wysyła wiadomości. W wersji produkcyjnej zgłoszenie trafi bezpośrednio do Kempen Boutique.';
    form.appendChild(note);
  });
});
