import View360 from './script/View360';

//maybe
const imgsize = new Image();
imgsize.src = imgURL + '/1/1_0.jpg';
imgsize.onload = function() {
    const config1 = {
        container: document.getElementById('container'),
        imgsURL: imgURL,
        count: imgCounts,
        lev1Size: {
            width: imgsize.width,
            height: imgsize.height
        },
        lev2Size: {
            width: imgsize.width * 2,
            height: imgsize.height * 2
        },
        lev3Size: {
            width: imgsize.width * 6,
            height: imgsize.height * 6
        },
        horizontal: imgsize.width < imgsize.height ? 8 : 12,
        vertical: imgsize.width < imgsize.height ? 12 : 8,
    };
    const viewer = new View360(config1);
    viewer.init();
}