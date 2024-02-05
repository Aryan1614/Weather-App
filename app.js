const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const cityNotFound = document.querySelector("[data-apiError]");

// initilally variables need ?? 

let oldTab = userTab;
const API_KEY = "7b6fca3b189d8544f39d50bb3be8ba27";
oldTab.classList.add("current-tab");

getfromSessionStorage();

function switchTab(newTab){

    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            // kya sarch form wala is invisible if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // main pehlw search wale tab par tha ab your weather tab visible karna h
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab weather bhi display karna padega so lets check local storage first
            // for coordinates , if we haved saved them there
            getfromSessionStorage();
        }

    }

}


userTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(userTab)
});

searchTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(searchTab)
});


// if coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local coordinates na mile
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}


async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;

    if(cityNotFound.classList.contains("active")){
        cityNotFound.classList.remove("active");
    }
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    // api call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);


        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    }
    catch(e){
        // HW
        loadingScreen.classList.remove("active");
        cityNotFound.classList.add("active");
    }
}

function renderWeatherInfo(Weatherinfo){
    // firstly we have to fetch all the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherinfo object and put in ui elements

    cityName.innerText = Weatherinfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${Weatherinfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = Weatherinfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${Weatherinfo?.weather?.[0]?.icon}.png`;
    let Temp = `${Weatherinfo?.main?.temp}`;
    let calc = Temp - 273.16;
    let num = calc.toFixed(2);
    temp.innerText = `${num}°C` ;
    windspeed.innerText = `${Weatherinfo?.wind?.speed} m/s`;
    humidity.innerText = `${Weatherinfo?.main?.humidity}%`;
    cloudiness.innerText = `${Weatherinfo?.clouds?.all}%`;

}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        // HW - show an alert for no geolocation support available
    }
}

function showPosition(position){

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener("click",getLocation);


let searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
    
});


async function fetchSearchWeatherInfo(city){

    if(cityNotFound.classList.contains("active")){
        cityNotFound.classList.remove("active");
    }

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);

        if (res.status === 404) {
            // Handle a 404 error (city not found)
            throw new Error("City not found");
        }

        const data = await res.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(e){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        cityNotFound.classList.add("active");
    }
      
}