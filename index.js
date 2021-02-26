if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

window.onload = () => {
  const input = document.getElementById('inp');
  const submit = document.getElementById('sub')
  input.addEventListener('change', event => {
    submit.setAttribute('href', `./renderer/?value=${event.target.value}`)
  })
  input.addEventListener("keyup", event => {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit.click();
    }
  })
}

