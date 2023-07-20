export const eventos_acordion = () => {
    const arrows_section_acoordion = document.querySelectorAll('.arrow-seccion-acordion');

    arrows_section_acoordion.forEach(arrow_section => {
        arrow_section.addEventListener('click', () => {
            arrow_section.classList.toggle('arrow-rotate');
            arrow_section.closest('.accordion-button').classList.toggle('collapsed');
      
            document.querySelectorAll('.arrow-seccion-acordion.arrow-rotate[aria-expanded="false"]').forEach(arrow => {
                arrow.classList.remove('arrow-rotate');
                arrow.classList.add('collapsed');
                arrow.closest('.accordion-button').classList.add('collapsed')
            });
        });
    });
}