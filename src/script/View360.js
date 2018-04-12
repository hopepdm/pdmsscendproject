class View360 {
    constructor( config ) {
        this.container = config.container;
        this.imgsURL = config.imgsURL;
        this.count = config.count;
        this.currentFrame = 0;

        this.lev1Size = config.lev1Size;
        this.lev2Size = config.lev2Size;
        this.lev3Size = config.lev3Size;

        this._height = this.container.clientHeight;
        this._width = this.container.clientWidth;

        //宽高比比率
        this.proportion = this.lev1Size.width / this.lev1Size.height;
        this._mainCanvas = document.createElement( 'canvas' );
        this._mainContext = this._mainCanvas.getContext( '2d' );

        this._lev1Canvas = document.createElement( 'canvas' );
        this._lev1Context = this._lev1Canvas.getContext( '2d' );

        this._lev2Canvas = document.createElement( 'canvas' );
        this._lev2Context = this._lev2Canvas.getContext( '2d' );

        this._lev3Canvas = document.createElement( 'canvas' );
        this._lev3Context = this._lev3Canvas.getContext( '2d' );

        this._helpCanvas = document.createElement( 'canvas' );
        this._helpContext = this._helpCanvas.getContext( '2d' );

        this._lev1ImgsPath = [];
        this._lev2ImgsPath = [];
        this._lev3ImgsPath = [];
        this._lev1Imgs = [];
        this._lev2Imgs = [];
        this._lev3Imgs = [];

        //初始缩放级别
        this.detai = 1;

        //画布初始着色点
        this._starty = 0;
        this._endx = this._height * this.proportion;
        this._endy = this._height;

        this.mouse = {};

        this.mouseState = {
            down: false,
            move: false
        };
        this.handState = {
            zoom: true,
            turn: true,
            move: false
        };
        this.timer = 0;

        //加载级别数组判定
        this.isloading2 = [];
        this.isloading = [];
        this.isloading.length = this.count;
        for ( let i = 0; i < this.count; i++ ) {
            this.isloading[ i ] = 'false';
            this.isloading2[ i ] = 'false';
        }
        this.horizontal = config.horizontal;
        this.vertical = config.vertical;
        //console.log(this.isloading);
        //设置播放状态
        this.autoplay = false;
    }

    //获取图片路径，基本不用改
    _createImgsPath() {
        for ( let i = 0; i < this.count; i++ ) {
            let src = this.imgsURL + '/1/1_' + i + '.jpg';
            this._lev1ImgsPath.push( src );
        }
        for ( let i = 0; i < this.count; i++ ) {
            let src = this.imgsURL + '/2/2_' + i + '.jpg';
            this._lev2ImgsPath.push( src );
        }
        for ( let i = 0; i < this.count; i++ ) {
            let tmp = [];
            let base = this.imgsURL + '/3/' + i + '/3_' + i;
            for ( let j = 0; j < 96; j++ ) {
                let url = base + '_' + j + '.jpg';
                tmp.push( url );
            }
            this._lev3ImgsPath.push( tmp );

        }
        //console.log(this._lev3ImgsPath);
    }

    //加载一级图片
    _loadimg() {
        //console.log('come loading1');
        // const _this = this;
        const lev1Promise = this._lev1ImgsPath.map( ( item ) => {
            return new Promise( function ( resolve, reject ) {
                const img = new Image();
                img.src = item;
                img.onload = () => resolve( img );
                img.onerror = ( err ) => reject( err );
            } );
        } );

        Promise.all( lev1Promise )
            .then( ( imgs ) => {
                this._lev1Imgs = imgs;
                this.render();
            } )
            .catch( ( err ) => console.log( err ) );
    }

    _loadLev2Img( index = 0 ) {
        //console.log('come loading2');
        let lev2Promise = new Promise( ( resolve, reject ) => {
            const img = new Image();
            img.src = this._lev2ImgsPath[ index ];
            img.onload = () => resolve( img );
            img.onerror = ( err ) => reject( err );
        } );


        lev2Promise.then( ( imgs ) => {
                this._lev2Imgs[ index ] = imgs;
            } )
            .catch( ( err ) => console.log( err ) );
    }

    _loadLev3Img( index = 0 ) {
        //console.log('come loading3');

        var lev3Promise = this._lev3ImgsPath[ index ].map( ( item ) => {
            return new Promise( ( resolve, reject ) => {
                const img = new Image();
                img.src = item;
                img.onload = () => resolve( img );
                img.onerror = ( err ) => reject( err );
            } );
        } );
        Promise.all( lev3Promise )
            .then( ( imgs ) => {
                let offsetW = 0;
                let offsetWs = [];
                let offsetH = 0;
                let offsetHs = [];
                let counts = 0;
                for ( var i = 1; i <= this.vertical; i++ ) {

                    offsetH += imgs[ i * this.horizontal - 1 ].height;
                    offsetW = 0;
                    for ( var j = 1; j <= this.horizontal; j++ ) {
                        counts++;
                        offsetW += imgs[ 1 * j - 1 ].width;
                        //console.log(this._helpCanvas.width, this._helpCanvas.height);

                        offsetHs.push( offsetH - imgs[ i * this.horizontal - 1 ].height );
                        offsetWs.push( offsetW - imgs[ 1 * j - 1 ].width );
                        let m = counts - 1;
                        this._helpContext.drawImage( imgs[ m ], offsetWs[ m ] / 2, offsetHs[ m ] / 2, imgs[ m ].width / 2, imgs[ m ].height / 2 );
                    }


                }

                //console.log(offsetWs, offsetHs);
                const _img = new Image();
                _img.src = this._helpCanvas.toDataURL();
                _img.onload = () => {
                    this._lev3Imgs[ index ] = _img;

                };

            } );
    }
    init() {
        //创建相应的功能按钮,左右切换
        let btn = document.createElement( 'div' );
        btn.setAttribute( 'class', 'btn' );
        let left = document.createElement( 'div' );
        let right = document.createElement( 'div' );
        left.setAttribute( 'class', 'left dir' );
        right.setAttribute( 'class', 'right dir' );
        btn.appendChild( left );
        btn.appendChild( right );
        document.body.appendChild( btn );

        //创建播放按钮
        let playBtn = document.createElement( 'div' );
        playBtn.setAttribute( 'class', 'playBtn play' );
        btn.appendChild( playBtn );

        this._mainCanvas.width = this._width;
        this._mainCanvas.height = this._height;
        this._lev1Canvas.width = this.lev1Size.width;
        this._lev1Canvas.height = this.lev1Size.height;
        this._lev2Canvas.width = this.lev2Size.width;
        this._lev2Canvas.height = this.lev2Size.height;
        this._lev3Canvas.width = this.lev3Size.width;
        this._lev3Canvas.height = this.lev3Size.height;
        this._helpCanvas.width = this.lev3Size.width / 2;
        this._helpCanvas.height = this.lev3Size.height / 2;
        this.container.appendChild( this._mainCanvas );

        this._createImgsPath();
        this._loadimg();
        this.eventHandler();

    }
    drawLev1Img( index = 0 ) {
        const img = this._lev1Imgs[ index ];
        // const num = img.width / img.height;
        this._lev1Context.drawImage( img, 0, 0, img.width, img.height, 0, 0, img.width, img.height );
        return {
            canvas: this._lev1Canvas,
            width: img.width,
            height: img.height
        }
    }
    drawLev2Img( index = 0 ) {
        const img = this._lev2Imgs[ index ];
        // const num = img.width / img.height;
        this._lev2Context.drawImage( img, 0, 0, img.width, img.height, 0, 0, img.width, img.height );
        return {
            canvas: this._lev2Canvas,
            width: img.width,
            height: img.height
        }
    }
    drawLev3Img( index = 0 ) {
        const img = this._lev3Imgs[ index ];
        // const num = img.width / img.height;
        this._lev3Context.drawImage( img, 0, 0, img.width, img.height, 0, 0, img.width, img.height );
        return {
            canvas: this._lev3Canvas,
            width: img.width,
            height: img.height
        }
    }
    mainDraw( canvas, sx, sy, sw, sh, x, y, w, h ) {
        //this._mainContext.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this._mainContext.clearRect( 0, 0, this._width, this._height );
        //this._mainContext.fillRect(0, 0, this._width, this._height);
        this._mainContext.drawImage( canvas, sx, sy, sw, sh, x, y, w, h );
    }
    eventHandler() {
        let mousewheelevt = ( /Firefox/i.test( navigator.userAgent ) ) ? "DOMMouseScroll" : "mousewheel";
        const _this = this;
        const dir = {
            left: false,
            right: false
        }
        const onmouseDown = function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            _this.mouseState.down = true;
            _this.mouse._x = event.clientX;
            _this.mouse._y = event.clientY;

        }
        const onmouseMove = function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            _this.mouseState.move = true;
            _this.mouse.x = event.clientX;
            _this.mouse.y = event.clientY;


            if ( !_this.autoplay ) {
                let deltax = _this.mouse.x - _this.mouse._x
                let deltay = _this.mouse.y - _this.mouse._y;
                dir.left = deltax > 0; //true 向右
                dir.right = deltax < 0;
                // console.log(dir);
                _this.mouse._x = _this.mouse.x;
                _this.mouse._y = _this.mouse.y;
                _this.turn( dir );
                _this.move( _this.mouse.x, _this.mouse.y );
            }
            //console.log(_this.mouse);
            this.mouse = _this.mouse;
            //console.log(this.mouse);
        }
        const onmouseWheel = function ( event ) {
            //event.preventDefault();
            event.stopPropagation();
            const wheelDir = ( event.wheelDelta || -event.detail ) > 0 ? 1 : 0; //0  down 小 1 up 大
            _this.zoom( wheelDir );
            //console.log(event.wheelDelta);

        }
        const onmouseUp = function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            _this.mouseState.down = false;
            dir.left = false;
            dir.right = false;
        }
        const onWindowResize = function ( event ) {
            window.location.reload();

        }
        this._mainCanvas.addEventListener( 'mousedown', onmouseDown, false );
        this._mainCanvas.addEventListener( 'mousemove', onmouseMove, false );
        this._mainCanvas.addEventListener( 'mouseup', onmouseUp, false );
        document.oncontextmenu = function () {
            return false;
        }

        //兼容wheel事件
        if ( document.attachEvent ) {
            document.attachEvent( 'on' + mousewheelevt, ommouseWheel );
        } else {
            this._mainCanvas.addEventListener( mousewheelevt, onmouseWheel, {
                passive: true
            } );

        }

        document.getElementsByClassName( 'playBtn' )[ 0 ].addEventListener( 'click', () => {
            if ( !this.autoplay ) {
                document.getElementsByClassName( 'playBtn' )[ 0 ].setAttribute( 'class', 'playBtn stop' );
                this.autoplay = true;
            } else {
                document.getElementsByClassName( 'playBtn' )[ 0 ].setAttribute( 'class', 'playBtn play' );
                this.autoplay = false;
            }
        } );
        document.getElementsByClassName( 'right' )[ 0 ].addEventListener( 'click', () => {
            this.currentFrame--;
        } );
        document.getElementsByClassName( 'left' )[ 0 ].addEventListener( 'click', () => {
            this.currentFrame++;
        } )
        window.addEventListener( 'resize', onWindowResize, false );
    }
    render() {

        this.timer++;
        //重置当前Frame
        this.currentFrame >= this.count ? this.currentFrame = 0 : ( this.currentFrame < 0 ? this.currentFrame = 44 : this.currentFrame );
        let param = this.drawLev1Img( this.currentFrame );
        if ( this.isloading2[ this.currentFrame ] == 'false' ) {
            this.isloading2[ this.currentFrame ] = 'true';
            this._loadLev2Img( this.currentFrame );
        }

        //按需加载
        if ( this.isloading[ this.currentFrame ] == 'false' && this.detai >= 8 ) {
            this.isloading[ this.currentFrame ] = 'true';
            //console.log(this.isloading, this.currentFrame);
            this._loadLev3Img( this.currentFrame );
        }


        // if (!this._lev2Imgs[this.currentFrame]) this._loadLev2Img(this.currentFrame);
        if ( this._lev2Imgs[ this.currentFrame ] ) {
            param = this.drawLev2Img( this.currentFrame );
        }
        if ( this._lev3Imgs[ this.currentFrame ] ) {
            param = this.drawLev3Img( this.currentFrame );
        }

        //--开始剪切的起始位置 --被剪切图像的宽高 --在画布上放置的图像的起始位置 --使用的图像的宽高

        let centerX = this._width / 2;
        let centerY = this._height / 2;
        let devX = ( this.mouse.x - centerX );
        let devY = ( this.mouse.y - centerY );

        this._startx = ( this._mainCanvas.width - this._endx ) / 2;

        if ( this._endx < this._width ) {
            this.mainDraw( param.canvas, 0, 0, param.width, param.height, this._startx, this._starty - devY * ( this._endy - this._height ) / this._height - ( this._endy - this._height ) / 2, this._endx, this._endy );
        } else {
            this.mainDraw( param.canvas, 0, 0, param.width, param.height, this._startx + 2 * devX * this._startx / this._width, this._starty - devY * ( this._endy - this._height ) / this._height - ( this._endy - this._height ) / 2, this._endx, this._endy );

        }

        requestAnimationFrame( () => {
            this.render()
        } );


        if ( this.autoplay && this.handState.turn ) {
            if ( this.timer % ( 30 ) === 0 ) this.currentFrame++;
        }



    }

    //左右转向
    turn( dir ) {
        if ( !this.handState.turn ) return;
        if ( dir.left && this.mouseState.down && this.detai < 8 ) {

            this.currentFrame--;

        }
        if ( dir.right && this.mouseState.down && this.detai < 8 ) {

            this.currentFrame++;

        }
        this.currentFrame >= this.count ? this.currentFrame = 0 : ( this.currentFrame < 0 ? this.currentFrame = 44 : this.currentFrame );

    }

    //轮滑缩放
    zoom( dir ) {
        if ( !this.handState.zoom ) return;
        if ( dir > 0 ) {
            this.detai += 1;
            let maxdetai = 15;
            this.detai <= maxdetai ? this.detai : this.detai = maxdetai;
            if ( this.detai < maxdetai ) {
                this._endx = this._endx * 1.1;
                this._endy = this._endy * 1.1;
            } else {
                this._endx = this._endx;
                this._endy = this._endy;
            }

        } else {

            this.detai += -1;

            let mindetai = 0;
            this.detai >= mindetai ? this.detai : this.detai = mindetai;
            if ( this.detai > mindetai ) {
                this._endx = this._endx / 1.1;
                this._endy = this._endy / 1.1;
            } else {
                this._endx = this._height * this.proportion;
                this._endy = this._height;
            }
        }
        //console.log(this.detai);

    }
    move( x, y ) {
        const center = {
            x: this._width / 5,
            y: this._height / 5
        };

    }

}
export default View360