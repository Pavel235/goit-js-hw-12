'use strict'

import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formElement = document.querySelector('.form');
const inputElement = document.querySelector('.input-text');
const loadButton = document.querySelector('.load-btn');
const galleryElement = document.querySelector('.gallery');
const loadingContainer = document.querySelector('.loading-container');

let pageNumber = 1;
let perPage = 40;
let inputValue = ''; 
let totalHits = 0;

const api = axios.create({
    baseURL: "https://pixabay.com/api/",
    params: {
        key: '41688461-d2a05e0fbe969f7f46dd1fb4f',
        q: '',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,  
        page: pageNumber,
        per_page: perPage, 
    }
})

function getGalleryCardHeight() {
    const galleryCard = document.querySelector('.gallery-list');
    const cardReact = galleryCard.getBoundingClientRect();
    return cardReact.height; 
}

function smoothScrollBy(height) {
    window.scrollBy({
        top: height,
        behavior: 'smooth',
    })
}

async function searchImage(params) {
    
    try {
        const response = await api.get('', {
            params: params,
        })
   
        const { hits, totalHits: newTotalHits } = response.data;

            if(hits.length > 0) {
           const rendedImages = hits.reduce((html, 
            {largeImageURL, webformatURL, tags, likes, views, comments, downloads}) => {
            return html + `
                <li class='gallery-list'>
                    <a href='${largeImageURL}'>
                     <img class='img-element' src='${webformatURL}' alt='${tags}'/>
                     <div class='gallery-text-wrapper'>
                     <p>Likes: <span class='img-text'>${likes}</span></p>
                     <p>Views: <span class='img-text'>${views}</span></p>
                     <p>Comments: <span class='img-text'>${comments}</span></p>
                     <p>Downloads: <span class='img-text'>${downloads}</span></p>
                     </div>
                    </a>
                </li>`
            }, "")

            galleryElement.insertAdjacentHTML('beforeend', rendedImages);
            const simpleBoxContent = new SimpleLightbox ('.gallery a', {
                captionType: 'attr',
                captionsData: 'alt',
                captionDelay: 250, 
                captionPosition: 'bottom',
                close: true,
                enableKeyboard: true, 
                docClose: true, 
            })

            simpleBoxContent.refresh();
            pageNumber += 1;
            loadButton.style.display = 'flex';
            
            if (pageNumber > 2) {
                const cardHeight = getGalleryCardHeight();
                smoothScrollBy(2 * cardHeight);
            }
          
            totalHits = newTotalHits;

            if (pageNumber >= Math.ceil(totalHits / perPage)) {

                loadButton.style.display = 'none';

                iziToast.info({
                    position: 'topRight',
                    message: `We're sorry, but you've reached the end of search results.`,
                })
            }

        } else {
            iziToast.error({
                position: 'topRight',
                message: `Sorry, there are no images matching your search query. Please try again!`,
            })

            loadButton.style.display = 'none';
        }
        }  catch(error) {
            iziToast.error({
                title: 'Error',
                message: error.message,
                position: 'topRight',
            })
        }
        finally {
            loadingContainer.style.display = 'none';
        }
        
}

    function loadMoreImages() {
        inputValue = inputElement.value.trim();
        const searchParams = new URLSearchParams({
            ...api.defaults.params,
            page: pageNumber,
            q: inputValue,
        })

        loadingContainer.style.display = 'flex'; 
        loadButton.style.display = 'none'; 

        searchImage(searchParams)
    }


    loadButton.addEventListener('click', loadMoreImages)


    formElement.addEventListener('submit', event => {
        event.preventDefault();

        galleryElement.innerHTML = ""; 


        if(galleryElement.innerHTML === "") {
            loadingContainer.style.display = 'flex';
        }

        pageNumber = 1;

        inputValue = inputElement.value.trim();
        loadButton.style.display = 'none';

        const params = {
            ...api.defaults.params,
            q: inputValue,
            page: pageNumber,
        }

        searchImage(params);
    });
