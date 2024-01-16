'use strict'

//  const initialParams = {
//     key: '41688461-d2a05e0fbe969f7f46dd1fb4f',
//     q: '',
//     image_type: 'photo',
//     orientation: 'horizontal',
//     safesearch: true,
// }

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

let page = 1;
let perPage = 40;
let inputValue = inputElement.value.trim()

const api = axios.create({
    baseURL: "https://pixabay.com/api/",
    params: {
        key: '41688461-d2a05e0fbe969f7f46dd1fb4f',
        q: '',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,  
        page: page,
        per_page: perPage, 
    }
})

function searchImage(params) {
    
    api.get('', {
        params: params,
    })
        .then(response => { 
            const { hits } = response.data;

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
            page += 1;
        } else {
            iziToast.error({
                position: 'topRight',
                message: `Sorry, there are no images matching your search query. Please try again!`,
            })
        }
        })
        .catch(error => {
            iziToast.error({
                title: 'Error',
                message: error.message,
                position: 'topRight',
            })
        })
        .finally(() => {
            loadingContainer.classList.remove('is-open');
            loadButton.classList.add('is-open');
        })
        
}

    function loadMoreImages() {
        page += 1;
        const searchParams = new URLSearchParams({
            page: page,
            q: inputValue,
            ...api.defaults.params,
        })

        searchImage(searchParams)
    }


    loadButton.addEventListener('click', loadMoreImages)


    formElement.addEventListener('submit', event => {
        event.preventDefault();

        galleryElement.innerHTML = ""; 


        if(galleryElement.innerHTML === "") {
            loadingContainer.classList.add('is-open');
        }

        const params = {
            ...api.defaults.params,
            q: inputElement.value,
            page: page,
        }
        searchImage(params);
    });

    