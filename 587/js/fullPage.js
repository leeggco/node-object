
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

//body的高度
window.onload=function(){
$('.fullPage section').eq(0).addClass('active');
}

$('body').css('height',window.innerHeight + 'px');

		var canswipe = windowHeight*0.1,
			nowpage = 0,
			nextpage = 0,
			sections = $('.fullPage').find('section'),
			prepage = 0;

		function touchStart(){
			//event.preventDefault();  //禁止页面点击
			var touch = event.targetTouches[0];
			startY = touch.pageY;
			moveY = 0;
		}

		sections.bind('touchstart',touchStart);

		sections.bind('touchmove',function(){
			event.preventDefault();
			var touch = event.touches[0];
			endY = touch.pageY;
			moveY = endY - startY;
          
			if(moveY < 0 && nowpage != sections.length - 1){
				//next page
				
				console.log('move next');
				nextpage = nowpage + 1;
				prepage = nowpage - 1;
				
				sections.eq(nowpage).css({
					'transform':'translate3D(0,'+ moveY +'px,0)',
					'-webkit-transform':'translate3D(0,'+ moveY +'px,0)',
					'transition':'all 0s',
					'-webkit-transition':'all 0s',
					'z-index':'20'
				});
				sections.eq(nextpage).css({
					'transform':'translate3D(0,'+ (windowHeight + moveY) +'px,0)',
					'-webkit-transform':'translate3D(0,'+ (windowHeight + moveY) +'px,0)',
					'transition':'all 0s',
					'-webkit-transition':'all 0s',
					'z-index':'20'
				});
				sections.eq(prepage).css({
					'transform':'translate3D(0,100%,0)',
					'-webkit-transform':'translate3D(0,100%,0)'					
				});
				
				
			}else if(moveY > 0 && nowpage != 0){
				//pre page 
				
				
				nextpage = nowpage - 1;
				prepage = nowpage + 1;
				console.log('move prev');
				sections.eq(nowpage).css({
					'transform':'translate3D(0,'+ moveY +'px,0) ',
					'-webkit-transform':'translate3D(0,'+ moveY +'px,0)',
					'transition':'all 0s',
					'-webkit-transition':'all 0s',
					'z-index':'20'
				});
				sections.eq(nextpage).css({
					'transform':'translate3D(0,'+ (windowHeight - moveY)*-1 +'px,0)',
					'-webkit-transform':'translate3D(0,'+ (windowHeight - moveY)*-1 +'px,0)',
					'transition':'all 0s',
					'-webkit-transition':'all 0s',
					'z-index':'20'
				});
				sections.eq(prepage).css({
					'transform':'translate3D(0,100%,0)',
					'-webkit-transform':'translate3D(0,100%,0)'					
				});
			}
			
			
		});

		sections.bind('touchend',function(){
			if(moveY < canswipe*-1 && nowpage != sections.length - 1){
				//next page
			
				sections.eq(nextpage).css({
					'z-index':'20',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s',
					'transform':'translate3D(0,0,0)',
					'-webkit-transform':'translate3D(0,0,0)'
				});
				
				sections.eq(nowpage).css({
					'z-index':'10',
					'transform':'translate3D(0,'+ (windowHeight*-1) +'px,0)',
					'-webkit-transform':'translate3D(0,'+ (windowHeight*-1) +'px,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});
				var nowpage2 = nowpage;
				   //sections.eq(nextpage).find('div').css('display','block');
				setTimeout(function(){
					//sections.eq(nowpage2).find('div').css('display','none');
                    
				},400);
				nowpage = nextpage;
				if(nowpage == sections.length - 1){
					$('#arrow').css('display','none');
				}

			}else if(moveY > canswipe && nowpage != 0){
				//pre page 
				
				sections.eq(nextpage).css({
					//'display':'block',
					'z-index':'20',
					'transform':'translate3D(0,0,0)',
					'-webkit-transform':'translate3D(0,0,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});
				sections.eq(nowpage).css({
					'z-index':'10',
					'transform':'translate3D(0,'+ (windowHeight) +'px,0)',
					'-webkit-transform':'translate3D(0,'+ (windowHeight) +'px,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});

				var nowpage2 = nowpage;
				     //sections.eq(nextpage).find('div').css('display','block');
				setTimeout(function(){
					//sections.eq(nowpage2).find('div').css('display','none');
				},400);

				nowpage = nextpage;
				if(nowpage == sections.length - 2){
					$('#arrow').css('display','block');
				}

			}else if(moveY <= canswipe && moveY > 0 && nowpage != 0){	//pre 没有超过10%
				
				sections.eq(nowpage).css({
					'display':'block',
					'z-index':'20',
					'transform':'translate3D(0,0,0)',
					'-webkit-transform':'translate3D(0,0,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});
				sections.eq(nextpage).css({
					'z-index':'10',
					'transform':'translate3D(0,'+ (windowHeight*-1) +'px,0)',
					'-webkit-transform':'translate3D(0,'+ (windowHeight*-1) +'px,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});
			}else if(moveY >= canswipe*-1 && moveY < 0 && nowpage != sections.length - 1){		//next 没有超过10%
				
				sections.eq(nowpage).css({
					'display':'block',
					'z-index':'20',
					'transform':'translate3D(0,0,0)',
					'-webkit-transform':'translate3D(0,0,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});
				sections.eq(nextpage).css({
					'z-index':'10',
					'transform':'translate3D(0,'+ (windowHeight) +'px,0)',
					'-webkit-transform':'translate3D(0,'+ (windowHeight) +'px,0)',
					'transition':'all 0.5s',
					'-webkit-transition':'all 0.5s'
				});
			}
			
			
			 $('.fullPage section').eq(nowpage).addClass('active');
			 $('.fullPage section').eq(nowpage).siblings().removeClass('active');
			 
			
		});