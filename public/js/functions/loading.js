export const loading_hope = () => {
    const tag_p = document.querySelector('.msg-hope');
    const parent = tag_p.parentElement;
    const msg_current = tag_p.textContent;
    
    parent.insertAdjacentHTML('beforeend', `
        <p class="fs-3 text-white mt-4 animate__animated animate__fadeIn msg-hope" data-msg="${msg_current}">
            ${tag_p.dataset.msg}
        </p>
    `);
  
    tag_p.remove();
} 