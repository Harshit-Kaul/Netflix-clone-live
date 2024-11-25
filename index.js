// Consts
const apikey = "bcaa21a502e9433a7be06b7db2100822";
const apiEndpoint = "https://api.themoviedb.org/3"                               // domain - starting me konse domain pe call maarni hai
const imgPath = "https://image.tmdb.org/t/p/original";                           //inhone saari image host kri hui hain jo jo list me de rhe hain to vo sab is folder ke andar milenge 

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apikey}`,                        // apikey can be changed later so we will insert it as variable here (apikey)
    fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apikey}&with_genres=${id}`,  
    fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apikey}&language=en-US`,
    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyDhd19vY_KgD01XqpmB_gK_w21tv1yNlAg`
}


// Boots up the app
function init() {                              /*all movie data will  come here */
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

function fetchTrendingMovies(){
    fetchAndBuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
    .then(list => {     
        const randomIndex = parseInt(Math.random() * list.length);                                                                      
        buildBannerSection(list[randomIndex]);
    }).catch(err=>{ 
        console.error(err);
    }); 
    
} 

function buildBannerSection(movie){
     const bannerCont = document.getElementById('banner-section');
     bannerCont.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;

     const div = document.createElement('div'); 
     div.innerHTML = `
            <h2 class="banner_title">${movie.title}</h2>
            <p class="banner_info">Trending in movies | Released - ${movie.release_date || "N/A"} </p>
            <p class="banner_overview">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0,200).trim()+ '...': movie.overview || "No description available."}</p>
            <div class="action-buttons-cont">
                 <button class="action-button"> &nbsp;&nbsp; Play</button>                                                       
                 <button class="action-button"> &nbsp;&nbsp; More Info</button>
            </div>`;
     div.className = "banner-content container";       
     bannerCont.append(div);                                                                                  // div banaya div ka html banaya class set kari and append kr diya banner container me
}


function fetchAndBuildAllSections(){                                                   //  is function ka kaam hai API call krke list banvana  // is saari category leke aa rha hai and abhi ke liye array me response de rha hai
    fetch(apiPaths.fetchAllCategories)
    .then(res => res.json())
    .then(res => {
        const categories = res.genres;
        if (Array.isArray(categories) && categories.length){                                     //later if netflix change some features and we get wrong response, so checking if categories are array and should have some data (categories.length>0 == categories.length)
            categories.forEach(category => {                                         // loop  // slice it upto 2 only   
                fetchAndBuildMovieSection(
                    apiPaths.fetchMoviesList(category.id),                                //konsi category ki detail manga rhe hain
                    category.name
                );
        });
    } 
        // console.table(movies);
    })                      
    .catch(err => console.error(err));

}
    // upar poora controller function likha hai kyuki vo alag se kaam kare, possible hai poori list upar aa jaay to vohi se neeche is funtion "function BuildMoviesSection" ko call kara skte hain 
function fetchAndBuildMovieSection(fetchURL, categoryName) {                                 //konse URL pe fetch kr rhe hain   // ye sirf section banane vala generic function hai
    console.log(fetchURL, categoryName);
    return fetch(fetchURL)                                                                  //fetch hi return ho jayga taaki mai isko as a callback use kr paau
    .then(res => res.json())
    .then(res => {
     // console.table(res.results);
     const movies = res.results;
     if(Array.isArray(movies) && movies.length) { 
        BuildMoviesSection(movies.slice(0,6), categoryName);                                   //section build krne ke liye alag se call krega
     }
     return movies;

  })
     .catch(err => console.error(err))
} 

function BuildMoviesSection(list, categoryName){
    console.log(list, categoryName);

    const moviesCont = document.getElementById('movies-cont');
    
    const moviesListHTML = list.map(item => {                                                                          // map required bcoz har list me se movie/item uthayga // return me string me HTML template     
         return `
            <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title}', 'yt${item.id}')">                                                                         
            <img class = "movie-item-img" src="${imgPath}${item.backdrop_path}" alt ="${item.title}">                                     
            <iframe width="245px" height="150px" src="" id="yt${item.id}"></iframe>
            </div>`;                                                                                      //source dynamic hoga (${}) and name bhi dynamic aayga (alt = "${}")
    }).join('');                                                                           // array me join lagao to vo join kr deta hai and join jo bhi pass kro usko vo merge kr deta hai otherwise (,) dalta rehta hai
 
      const moviesSectonHTML = `
           <h2 class="movie-section-heading">${categoryName}Trending Now <span class = "explore-nudge">Explore All</span></h2>
           <div class = "movies-row">
           ${moviesListHTML}
           </div>    
      `                                                                                              // jo hamara HTML tha jiski div movie section vali row dalni thi idhar vo JS ne string me as a string bana di
      console.log(moviesSectonHTML);                                                                                             // basically poora HTML string me convert kr diya hai       

      const div = document.createElement('div');
      div.className = "movies-section"
      div.innerHTML = moviesSectonHTML;

      // append html into movies container
      moviesCont.append(div);

}

function searchMovieTrailer(movieName, iframId) {
    if(!movieName) return;

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(res => res.json())
    .then(res => {
        const bestResult = res.items[0];
        const elements = document.getElementById(iframId);
        console.log(elements, iframId);
        const div = document.createElement('div');                                                                          // Inspect the 'item' property , 0th search result sabse zyada confidence hai ki ye match krega
        window.open(youtubeUrl,'_blank');
        div.innerHTML = `<iframe width="245px" height="150px" src = "https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0"></iframe>` 
        elements.append(div);       
    })
    .catch(err => console.log(err));

}
    window.addEventListener('load', function(){
    init();
    this.window.addEventListener('scroll', function(){
        // header ui update
        const header = document.getElementById('header');
        if(this.window.scrollY > 5) header.classList.add('black-bg')
            else header.classList.remove('black-bg');
    })
})  

