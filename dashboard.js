fetch('https://<your-github-username>.github.io/<repo-name>/update.json')
  .then(response => response.json())
  .then(data => {
    console.log("Current Version:", data.version);
    // عرض الملاحظات في الصفحة مثلاً
    const container = document.getElementById('patch-notes-container');
    data.patchNotes.forEach(note => {
      const p = document.createElement('p');
      p.textContent = note;
      container.appendChild(p);
    });
  })
  .catch(error => {
    console.error('Error fetching update JSON:', error);
  });
