const getThemeSwitch = document.querySelector("#theme-switcher")
const body = document.body;

getThemeSwitch.addEventListener("click", () => {

    body.classList.toggle("dark-theme");
})