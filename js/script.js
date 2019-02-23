
window.onload=function(){
  
		const loadingManager = new THREE.LoadingManager( () => {
		
		const loadingScreen = document.getElementById( 'loading-screen' );
		loadingScreen.classList.add( 'fade-out' );
			
		// optional: remove loader from DOM via event listener
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
			
		} );

		//score
		var score;
	    score = 0;
	    document.getElementById('score').innerHTML = "Artifacts Found: " + score;
	

		var change;

		var camera, scene, renderer, controls;
        var backgroundSound;
		var objects = [];
		var raycaster;
		var combohouse
		var blocker = document.getElementById( 'blocker' );
		var instructions = document.getElementById( 'instructions' );
		var goal = document.getElementById( 'goal' );

		//artifacts
		var sword;
		var scroll;
		var gem;
		var scepter;

		var clock = new THREE.Clock();

		var waterFallGeometry = new THREE.Geometry();

			for ( var i = 0; i < 10500; i ++ ) {
				var water = new THREE.Vector3();
				water.x = THREE.Math.randFloatSpread( 15 );
				water.y = THREE.Math.randFloatSpread( (Math.random() - 10) + 50 );
				water.z = THREE.Math.randFloatSpread( 5 );

				waterFallGeometry.vertices.push( water );
			}

				var waterFallMaterial = new THREE.PointsMaterial({
					color: 0x155dca, 
					size: 10, 
					opacity: 1, 
					transparent: false, 
					lights: false,
					depthTest: true, 
					blending: THREE.AdditiveBlending 
				} );

			
			//}
			//color: 0x174fb4
			var waterFallSystem = new THREE.Points( waterFallGeometry, waterFallMaterial );

		//Haze
			var Textureloader = new THREE.TextureLoader();
     
		///***************************************************
	
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
		if ( havePointerLock ) {
			var element = document.body;
			var pointerlockchange = function ( event ) {
	
				if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
					controlsEnabled = true;
					controls.enabled = true;
					blocker.style.display = 'none';
				} else {
					controls.enabled = false;
					blocker.style.display = 'block';
					instructions.style.display = '';
				}
			};
			var pointerlockerror = function ( event ) {
				instructions.style.display = '';
			};
			// Hook pointer lock state change events
			document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'pointerlockerror', pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
			
			instructions.addEventListener( 'click', function ( event ) {
				instructions.style.display = 'none';
				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();

                if (backgroundSound.context.state === "suspended") {
                    backgroundSound.context.resume();
                }
			}, false );
			goal.addEventListener( 'click', function ( event ) {
				goal.style.display = 'none';
				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
				element.requestPointerLock();
			}, false );
		} else {
			instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
		}
		//****************************************/
		init();
		animate();
		var controlsEnabled = false;
		var moveForward = false;
		var moveBackward = false;
		var moveLeft = false;
		var moveRight = false;
		var canJump = false;
		var prevTime = performance.now();
		var velocity = new THREE.Vector3();
		var direction = new THREE.Vector3();
        var velocityConstant = 800.0;
        var runMultiplier = 1.0;

		function init() {
			// create an AudioListener and add it to the camera
			var listener = new THREE.AudioListener();
			
			// create a global audio source
            backgroundSound = new THREE.Audio( listener );

			// load a sound and set it as the Audio object's buffer
			var audioLoader = new THREE.AudioLoader();
			audioLoader.load( 'Sound/TheEnchantedForest.mp3', function( buffer ) {
                backgroundSound.setBuffer( buffer );
                backgroundSound.setLoop( true );
                backgroundSound.setVolume(0.5);
                backgroundSound.play();
			});

			camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );//1000


			camera.position.y = -3;

			//camera.position.y = 1500;
			//camera.rotation.x = -Math.PI / 2;
			camera.add( listener );
			scene = new THREE.Scene();
			scene.background = new THREE.Color( 0x43dafd );
			change = true;

			// LIGHTS
			
			hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
			hemiLight.color.setHSL( 0.6, 1, 0.6 );
			hemiLight.position.set( 50, 20, 50 );
			scene.add( hemiLight );

			hemiLight1 = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
			hemiLight1.color.setHSL( 0.6, 1, 0.6 );
			hemiLight1.position.set( 100, 60, 100 );
			scene.add( hemiLight1 );

			var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
			directionalLight.position.set(50,50,50);
			directionalLight.castShadow = true;
			directionalHelper = new THREE.DirectionalLightHelper( directionalLight, 10 );
			scene.add( directionalLight );

			var geometry = new THREE.SphereGeometry(1000, 60, 40);  
			var uniforms = {  
			  texture: { type: 't', value: Textureloader.load('Textures/skygradient.jpg') }
			};

			//skybox
			
			var material = new THREE.ShaderMaterial( {  
			  uniforms:       uniforms,
			  side: THREE.DoubleSide,
			  vertexShader:   document.getElementById('sky-vertex').textContent,
			  fragmentShader: document.getElementById('sky-fragment').textContent
			});



			skyBox = new THREE.Mesh(geometry, material);  
			skyBox.scale.set(-1, 1, 1);  
			skyBox.rotation.order = 'XZY';  
			skyBox.renderDepth = 1000.0;  
			scene.add(skyBox);
				

			//waterfall
			scene.add( waterFallSystem );
			waterFallSystem.position.z = -47;
			waterFallSystem.position.x = 315;
			waterFallSystem.rotation.y = -Math.PI/2;


			var waterfall = getModel("JSON/Foliage/waterfallform.json", 320, 0, -50, -Math.PI/2);

			var boxMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
			var columnMaterial = getMaterial('standard', 'rgb(232, 228, 196)');
			var wallMaterial = getMaterial('standard','rgb(75,0,130)');
			var waterMaterial = getMaterial('standard','rgb(29,162,220)');
		
			
			//artifacts
			sword = getModel("JSON/Artifacts/sword.json", -280, 0, -60, 0);
			scroll = getModel("JSON/Artifacts/scroll.json", 10, 0, -350, 0);
			gem = getModel("JSON/Artifacts/gem.json", 300, 5, -40, 0);
			scepter = getModel("JSON/Artifacts/scepter.json", 280, 20, 320, 0);


			var entrance4 = getModel("JSON/leaftree5.json", 60, 0, 450, 0);
			var entrance5 = getModel("JSON/leaftree5.json", -70, 0, 450, 0);
			var entrance6 = getModel("JSON/leaftree5.json", 60, 0, 390, 0);
			var entrance7 = getModel("JSON/leaftree5.json", -40, 0, 400, 0);
			var entrance8 = getModel("JSON/leaftree5.json", 50, 0, 300, 0);
			var entrance9 = getModel("JSON/leaftree5.json", -30, 0, 320, 0);
			
			//treehouses
			var treehouse1 = getModel("JSON/Treehouse/treehouse.json", -350, 0, -80, 0);
			var treehouse2 = getModel("JSON/Treehouse/treehouse.json", -280, 0, -60, 90);
			var treehouse3 = getModel("JSON/Treehouse/treehouse.json", -190, 0, -30, -90);
			var treehouse4 = getModel("JSON/Treehouse/treehouse.json", -350, 0, 60, 0);
			var treehouse5 = getModel("JSON/Treehouse/treehouse.json", -300, 0, 60, 0);
			var treehouse6 = getModel("JSON/Treehouse/treehouse.json", -190, 0, 80,0);
			var treehouse7 = getModel("JSON/Treehouse/treehouse.json", -350, 0, 0,0);
			
			//village
			//getModel(name, x, y, z, rotateY)
			var house1 = getModel("JSON/House/whitehouse.json", -25, 0, -60, 0);
			var house2 = getModel("JSON/House/skinnyhouse.json", -20, 0, -10, -Math.PI/4);
			var house3 = getModel("JSON/House/doublehouse.json", 45, 0, -10, -(Math.PI*3)/4);
			var house4 = getModel("JSON/House/whitehouse.json", 70, 0, 35, Math.PI);
			var house5 = getModel("JSON/House/bluehouse.json", -35, 0, 50, 0);
			var house6 = getModel("JSON/House/whitehouse.json", -15, 0, 100, -5);
			var house7 = getModel("JSON/House/doublehouse.json", -55, 0, 120, (Math.PI*2)/3);
			var house8 = getModel("JSON/House/whitehouse.json", 50, 0, 90, (3*Math.PI)/4);

			var fountain = getModel("JSON/fountain.json", 15, 0, 45, 0);

			//walls(material, length, width, x, y, z)
			
			//castle	
			var castletexture = Textureloader.load( 'Textures/castle.jpg' );

			castletexture.wrapS = THREE.RepeatWrapping;
			castletexture.wrapT = THREE.RepeatWrapping;
			castletexture.repeat.set( 1, 3 );
			castletexture.side = THREE.DoubleSide;
			var castleMaterial = new THREE.MeshBasicMaterial( { map: castletexture, side: THREE.DoubleSide } );
			
			//getBox(material, length, width, width2, x, z, rotate)
			var entryWall = getModel("JSON/Castle/entry_wall.json", 10, 0, -300, 0);
			var castle = getBox(castleMaterial, 50, 50, 200, 10, 0, -400, 0);
			var bordertower = getModel("JSON/Castle/bordertower.json", -20, 0, -370, 0);
			var bordertower1 = getModel("JSON/Castle/bordertower.json", 40, 0, -370, 0);
			var tower = getModel("JSON/Castle/tower.json", -10, 0, -350, 0);
			var tower1 = getModel("JSON/Castle/tower.json", 30, 0, -350, 0);
			var doorwall = getModel("JSON/Castle/door_wall.json", 10, 0, -350, 0);
			var wall = getModel("JSON/Castle/wall.json", -30, 0, -350, 0);
			var wallr = getModel("JSON/Castle/wall.json", 45, 0, -350, 0);

			//walls around
			var wall1 = getModel("JSON/Castle/wall.json", 45, 0, -300, 0);
			var wall4 = getModel("JSON/Castle/wall.json", 80, 0, -300, 0);

			var wall2 = getModel("JSON/Castle/wall.json", -25, 0, -300, 0);
			var wall3 = getModel("JSON/Castle/wall.json", -60, 0, -300, 0);
			//left walls
			var wall4 = getModel("JSON/Castle/wall.json", -71, 0, -325, Math.PI/2);
			var wall5 = getModel("JSON/Castle/wall.json", -71, 0, -360, Math.PI/2);
			var wall6 = getModel("JSON/Castle/wall.json", -71, 0, -395, Math.PI/2);

			//right walls
			var wall8 = getModel("JSON/Castle/wall.json", 92, 0, -325, Math.PI/2);
			var wall9 = getModel("JSON/Castle/wall.json", 92, 0, -360, Math.PI/2);
			var wall10 = getModel("JSON/Castle/wall.json", 92, 0, -395, Math.PI/2);

			var highTower = getModel("JSON/Castle/high_tower.json", 45, 0, -370, 0);
			var roof = getModel("JSON/Castle/roof.json", 40, 0, -350, 0);
			var leftlongbanner = getModel("JSON/Castle/longbanner.json", 0, 50, -375, -Math.PI/2);
			var rightlongbanner = getModel("JSON/Castle/longbanner.json", 20, 50, -375, -Math.PI/2);
			var leftlongbanner1 = getModel("JSON/Castle/longbanner.json", -20, 20, -361, -Math.PI/2);
			var rightlongbanner1 = getModel("JSON/Castle/longbanner.json", 40, 20, -361, -Math.PI/2);


			//right wall getWall("mountain.json", start, end, rotate);
			var rightWall = getWall("JSON/Foliage/mountain.json", 400, -490, "false");
			var leftWall = getWall("JSON/Foliage/mountain.json", -400, -490, "false");
			var topWall = getOtherWall("JSON/Foliage/mountain.json", -380, -500, "true");
			var bottomWall = getOtherWall("JSON/Foliage/mountain.json", -380, 500, "true");

			//Pillar Land
			//getBox(material, length, width, width2, x, y, z, rotate)
			var base = getBox(columnMaterial, 100, 130, 20, 280, 0, 320, -40);
			var stairs = getBox(columnMaterial, 10, 30, 10, 240, 0, 280, -40);
			var leftpillar = getModel("JSON/Castle/pillar.json",220, 9, 335,0);
			var toppillar = getModel("JSON/Castle/pillar.json",290, 9, 260,0);
			var rightpillar = getModel("JSON/Castle/pillar.json",340, 9, 300,0);
			var bottompillar = getModel("JSON/Castle/pillar.json",270, 9, 380,0);
		
			//object.rotation.y = 10;
			
			var tree = getModel("JSON/leaftree5.json",-10, 0, 250,10);
			var tree1 = getModel("JSON/leaftree5.json",-10, 0, 200,-40);
			var tree2 = getModel("JSON/leaftree5.json",40, 0, 220,-90);
			var tree3 = getModel("JSON/leaftree5.json",-350, 0, 140,0);
			var tree4 = getModel("JSON/leaftree5.json",-320, 0, 180,50);
			var tree5 = getModel("JSON/leaftree5.json",-290, 0, 140,0);
			var tree6 = getModel("JSON/leaftree5.json",-120, 0, 280,-90);
			var tree7 = getModel("JSON/leaftree5.json",-120, 0, 135,45);
			var tree8 = getModel("JSON/leaftree5.json",-210, 0, 140,90);
			var tree9 = getModel("JSON/leaftree5.json",-150, 0, 180,90);
			var tree10 = getModel("JSON/leaftree5.json",-220, 0, -100,0);
			var tree11 = getModel("JSON/leaftree5.json",-320, 0, -110,30);
			var tree12 = getModel("JSON/leaftree5.json",-130, 0, -200,0);
			var tree13 = getModel("JSON/leaftree5.json",-290, 0, -230,0);
			var tree14 = getModel("JSON/leaftree5.json",-290, 0, -390,-90);
			var tree15 = getModel("JSON/leaftree5.json",-170, 0, -350,0);
			var tree16 = getModel("JSON/leaftree5.json",140, 0, -380,0);
			var tree17 = getModel("JSON/leaftree5.json",140, 0, -380,-30);
			var tree18 = getModel("JSON/leaftree5.json",320, 0, -380,0);
			var tree19 = getModel("JSON/leaftree5.json",300, 0, -300,50);
			var tree20 = getModel("JSON/leaftree5.json",-310, 0, 270, 0);
			var tree21 = getModel("JSON/leaftree5.json",-320, 0, 340, 90);
			var tree22 = getModel("JSON/leaftree5.json",-250, 0, 300, -50);
			var tree23 = getModel("JSON/leaftree5.json",110, 0, -100, 0);
			var tree24 = getModel("JSON/leaftree5.json",160, 0, -70, 0);
			var tree25 = getModel("JSON/leaftree5.json",145, 0, -10, 120);
			var tree26 = getModel("JSON/leaftree5.json",165, 0, 65, -150);
			var tree27 = getModel("JSON/leaftree5.json",180, 0, 170, 0);
			var tree28 = getModel("JSON/leaftree5.json",330, 0, 220, 0);
			var tree29 = getModel("JSON/leaftree5.json",340, 0, 370, 0);
			var tree30 = getModel("JSON/leaftree5.json",180, 0, 370, 0);
			var tree31 = getModel("JSON/leaftree5.json",-220, 0, 390, 0);
			

			//var utree1 = getModel("JSON/Foliage/umbrellatree1.json", -250, 0, 250, 0);
			

			var talltree = getModel("JSON/Foliage/talltree2.json",-30, 0, 10, 0);
			var talltree1 = getModel("JSON/Foliage/talltree2.json",110, 0, -50, 0);
			var talltree2 = getModel("JSON/Foliage/talltree2.json",-110, 0, 100, -Math.PI/2);
			var talltree3 = getModel("JSON/Foliage/talltree2.json", 200, 0, -250, 0);
			var talltree4 = getModel("JSON/Foliage/talltree2.json", -200, 0, 250, 0);
			var talltree5 = getModel("JSON/Foliage/talltree2.json", 200, 0, -250, Math.PI/2)
			var talltree6 = getModel("JSON/Foliage/talltree2.json", -200, 0, -320, Math.PI/4);
			var talltree7 = getModel("JSON/Foliage/talltree2.json", 230, 0, 100, 0);
			var talltree8 = getModel("JSON/Foliage/talltree2.json", 300, 0, 100, -Math.PI/2);
			var talltree9 = getModel("JSON/Foliage/talltree2.json", 300, 0, -100, 0);
			var talltree10 = getModel("JSON/Foliage/talltree2.json", 350, 0, 50, Math.PI/2);
			var talltree11 = getModel("JSON/Foliage/talltree2.json", -250, 0, 320, -Math.PI/4);
			var talltree12 = getModel("JSON/Foliage/talltree2.json", -100, 0, 340, 0);
			var talltree13 = getModel("JSON/Foliage/talltree2.json", -100, 0, -250, Math.PI/2);
			var talltree14 = getModel("JSON/Foliage/talltree2.json", -120, 0, -200, Math.PI/2);
			var talltree15 = getModel("JSON/Foliage/talltree2.json", 100, 0, 250, Math.PI/2);
			var talltree16 = getModel("JSON/Foliage/talltree2.json", 320, 0, -370, 0);
			//Pillar Trees
			var talltreel = getModel("JSON/Foliage/talltree2.json", 200, 0, 350, 0);
			var talltreer = getModel("JSON/Foliage/talltree2.json", 350, 0, 190, 0);
			
			//lagoon
			var lagoon = getModel("JSON/lagoon/lagoon.json", 300, 0, -40, 0);
			var waterfallside = getModel("JSON/Foliage/mountain.json", 370, 0, -70, Math.PI/2);
			var waterfallside1 = getModel("JSON/Foliage/mountain.json", 370, 0, -30, -Math.PI/2);
			
			getGrass();

			//***************************************
			
			controls = new THREE.PointerLockControls(camera);
			scene.add( controls.getObject() );
			var onKeyDown = function ( event ) {
				switch ( event.keyCode ) {
					case 13:
						change = false;
						//goal.style.display = 'none';
						break;
					case 38: // up
					case 87: // w
						moveForward = true;
						break;
					case 37: // left
					case 65: // a
						moveLeft = true; break;
					case 40: // down
					case 83: // s
						moveBackward = true;
						break;
					case 39: // right
					case 68: // d
						moveRight = true;
						break;
					case 32: // space
						if ( canJump === true ) velocity.y += 200;
						canJump = false;
                        break;
                    case 16: // shift
                        runMultiplier = 3;
				}
			};
			var onKeyUp = function ( event ) {
				switch( event.keyCode ) {
					case 38: // up
					case 87: // w
						moveForward = false;
						break;
					case 37: // left
					case 65: // a
						moveLeft = false;
						break;
					case 40: // down
					case 83: // s
						moveBackward = false;
						break;
					case 39: // right
					case 68: // d
						moveRight = false;
                        break;
                    case 16: // shift
                        runMultiplier = 1;
				}
			};
			document.addEventListener( 'keydown', onKeyDown, false );
			document.addEventListener( 'keyup', onKeyUp, false );
			raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
		
			//***********************************************/
			// floor

			var floorGeometry = new THREE.PlaneGeometry( 800, 1000, 100, 100 );
			floorGeometry.sortFacesByMaterialIndex();
			floorGeometry.rotateX( - Math.PI / 2 );
			for ( var i = 0, l = floorGeometry.vertices.length; i < l; i += 10 ) {
				var vertex = floorGeometry.vertices[i];
		
							vertex.y += Math.random() * 2;					


			}

			
			var texture = Textureloader.load( 'Textures/grassrect.jpg' );
			texture.bumpMap = Textureloader.load( 'Textures/grassrect.jpg' );
			texture.bumpScale = 5;

			var floorMaterial = new THREE.MeshBasicMaterial( { map: texture } );

			var floor = new THREE.Mesh( floorGeometry, floorMaterial );
			floor.position.set(0,0,0);
			floor.recieveShadow = true;
			scene.add( floor );
					//
			renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );
			//
			window.addEventListener( 'resize', onWindowResize, false );
		}


		function getGrass(){
			var grassTexture=Textureloader.load("Textures/grass.png");
	        var grassGeometry = new THREE.PlaneGeometry(6, 6);
	        //grassGeometry.sortFacesByMaterialIndex();
	        var grassMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, map:grassTexture, transparent:true, opacity:1, side: THREE.DoubleSide, depthWrite: false, depthTest: true });
	        var grass = new THREE.Mesh(grassGeometry, grassMaterial);
	        grass.position.y = 2.7;
	        
	    for(var k = 0; k < 70; k++){
	        grass.position.x= (Math.random() * 500) - 250;//Math.random() * (380 - (-370)) + 10;
	        grass.position.z= (Math.random() * 500) - 250;//Math.random() * (380 - (-370)) + 10;
	    
		        var grass0=grass.clone();
		        scene.add(grass0);
		        var grass1=grass.clone();
		        scene.add(grass1);
		        grass1.rotation.y=0.25*Math.PI;
		        var grass2=grass.clone()
		        grass2.rotation.y=-0.25*Math.PI;
		        scene.add(grass2);
		        var grass3=grass.clone()
		        grass3.rotation.y=0.5*Math.PI;
		        scene.add(grass3);
	      }

	       for(var k = 0; k < 70; k++){
	        grass.position.x= (Math.random() * -500) + 250;//Math.random() * (380 - (-370)) + 10;
	        grass.position.z= (Math.random() * -500) + 250;//Math.random() * (380 - (-370)) + 10;
	        //console.log(Math.floor(Math.random() * 401) - 100);
		        var grass0=grass.clone();
		        scene.add(grass0);
		        var grass1=grass.clone();
		        scene.add(grass1);
		        grass1.rotation.y=0.25*Math.PI;
		        var grass2=grass.clone()
		        grass2.rotation.y=-0.25*Math.PI;
		        scene.add(grass2);
		        var grass3=grass.clone()
		        grass3.rotation.y=0.5*Math.PI;
		        scene.add(grass3);
	      }

	       for(var k = 0; k < 70; k++){
	        grass.position.x= (Math.random() * -500) + 250;//Math.random() * (380 - (-370)) + 10;
	        grass.position.z= (Math.random() * 350);//Math.random() * (380 - (-370)) + 10;
	        //console.log(Math.floor(Math.random() * 401) - 100);
		        var grass0=grass.clone();
		        scene.add(grass0);
		        var grass1=grass.clone();
		        scene.add(grass1);
		        grass1.rotation.y=0.25*Math.PI;
		        var grass2=grass.clone()
		        grass2.rotation.y=-0.25*Math.PI;
		        scene.add(grass2);
		        var grass3=grass.clone()
		        grass3.rotation.y=0.5*Math.PI;
		        scene.add(grass3);
	      }

	      grassGeometry.sortFacesByMaterialIndex();

		}

		function getModel(name, x, y, z, rotateY) {
			var loader = new THREE.ObjectLoader(loadingManager);
				loader.load(name,function ( obj ) {
				     obj.position.set(x,y,z);
				     obj.rotation.y = rotateY;
				     obj.castShadow = true;
				     //obj.children[0].geometry.sortFacesByMaterialIndex();
				     //console.log(obj);
				     //objects.push( obj );
				     scene.add( obj );
				     return obj;


		    });
		}

		function getBox(material, length, width, width2, x, y, z, rotate) {
			var geometry = new THREE.BoxGeometry(width, width2, length);
			var obj = new THREE.Mesh(geometry, material);
			geometry.sortFacesByMaterialIndex();
			obj.side = THREE.DoubleSide;
			obj.castShadow = true;
			obj.recieveShadow = true;
			obj.rotation.y = rotate;
			obj.position.x = x;
			obj.position.z = z;
			obj.position.y = y;
			objects.push( obj );
			scene.add(obj);
			return obj;
		}

		function getTreeBox(material, length, width, x, y, z) {
			var geometry = new THREE.BoxGeometry(width, width, length);
			var obj = new THREE.Mesh(geometry, material);
			geometry.sortFacesByMaterialIndex();
			obj.castShadow = true;
			obj.position.x = x;
			obj.position.z = z;
			obj.position.y = y;
			objects.push( obj );
			scene.add(obj);
			return obj;
		}

		function getWall(name, start, end, rotate) {
			var loader = new THREE.ObjectLoader();
				
				loader.load(name,function ( obj ) {
				     var object = obj;
				     	if(start === 400){
				     		object.rotation.y = (Math.PI/2)*2;
				     	}
				 
				     	object.position.set(start,-5,end);
				     	objects.push( object );
				        scene.add( object );
				        //32
				     	if(end < 490){
				     		getWall("JSON/Foliage/mountain.json", start, end+100, "false");
				     	}


		    });
		
		}

		function getOtherWall(name, start, end, rotate) {
			var loader = new THREE.ObjectLoader();
				
				loader.load(name,function ( obj ) {
				     var object = obj;
				    
				     	if(end === 500){
				     		object.rotation.y = (Math.PI/2);
				     	}else{
				     		obj.rotation.y = -Math.PI / 2;
				     	}
				     	
				     	obj.position.set(start,-5,end);
				     	objects.push( obj );
				        scene.add( obj );

				        //35
				     	if(start < 400){
				     		getOtherWall("JSON/Foliage/mountain.json", start+100, end, "true");
				     	} 


		    });
		
		}

		function getMaterial(type, color) {
			var selectedMaterial;
			var materialOptions = {
				color: color === undefined ? 'rgb(255, 255, 255)' : color,
			};

			switch (type) {
				case 'basic':
					selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
					break;
				case 'lambert':
					selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
					break;
				case 'phong':
					selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
					break;
				case 'standard':
					selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
					break;
				default: 
					selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
					break;
			}

			return selectedMaterial;
		}



		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function onTransitionEnd( event ) {

		const element = event.target;
		element.remove();
		
	}

		var x = 0;
		controls.getObject().position.z = 380;
		function animate() {
			requestAnimationFrame( animate );


//Particle System
/*****************************************************************/
			waterFallSystem.geometry.vertices.forEach(function(water) {
		
				water.y += (Math.random() - 0.75) * 0.5;

				if(water.y < 0) {
					water.y = (Math.random() - 2) + 45;

				}

			});
			waterFallSystem.geometry.verticesNeedUpdate = true;
/*****************************************************************/

			if ( controlsEnabled === true ) {
				//console.log(controls.getObject().position);
				raycaster.ray.origin.copy( controls.getObject().position );
				raycaster.ray.origin.y -= 10;
				var intersections = raycaster.intersectObjects( objects );
				var onObject = intersections.length > 0;
				var time = performance.now();
				var delta = ( time - prevTime ) / 1000;
				var timeElapsed = clock.getElapsedTime();
				velocity.x -= velocity.x * 30.0 * delta;
				velocity.z -= velocity.z * 30.0 * delta;
				velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
				direction.z = Number( moveForward ) - Number( moveBackward );
				direction.x = Number( moveLeft ) - Number( moveRight );
				//direction.y = Number( moveUp ) - Number( moveDown );
				direction.normalize(); // this ensures consistent movements in all directions
//Artifacts*******************************************************/				
				if (score === 4 && change === true){
					//goal.style.display = 'block';
					// $("#goal").show();
					document.getElementById('score').innerHTML = "You Won! Feel free to explore the rest of the world";
				}else{
					goal.style.display = 'none';
				}

				if(controls.getObject().position.x <= -279 && controls.getObject().position.x >= -281 && controls.getObject().position.z <= -59 && controls.getObject().position.z >= -61 ){
					//console.log(controls.getObject().position);
					scene.traverse( function ( object ) {
						//console.log(sword.name);
						if(object.name === "sword.json" && object.visible === true){
							console.log("entered");
							object.visible = false;
							score++;
							document.getElementById('score').innerHTML = "Artifacts Found: " + score + "/4";
					
						}

					} );
			
				}

				if(controls.getObject().position.x >= 9 && controls.getObject().position.x <= 11 && controls.getObject().position.z <= -349 && controls.getObject().position.z >= -351){

					scene.traverse( function ( object ) {
						//console.log(sword.name);
						if(object.name === "scroll.json" && object.visible === true){
							//console.log("entered");
							object.visible = false;
							score++;
							document.getElementById('score').innerHTML = "Artifacts Found: " + score + "/4";
					
						}

					} );
				}

				if(controls.getObject().position.x >= 299 && controls.getObject().position.x <= 301 && controls.getObject().position.z <= -39 && controls.getObject().position.z >= -41){

					scene.traverse( function ( object ) {
						//console.log(sword.name);
						if(object.name === "gem.json" && object.visible === true){
							console.log("entered");
							object.visible = false;

							score++;
							document.getElementById('score').innerHTML = "Artifacts Found: " + score + "/4";
					
						}

					} );
				}
				if(controls.getObject().position.x >= 279 && controls.getObject().position.x < 282 && controls.getObject().position.z >= 319 && controls.getObject().position.z < 322){
					//console.log("Found the scepter");
					scene.traverse( function ( object ) {
						//console.log(sword.name);

						if(object.name === "scepter.json" && object.visible === true){
							console.log("entered");
							object.visible = false;
							score++;
							document.getElementById('score').innerHTML = "Artifacts Found: " + score + "/4";
					
						}

					} );
				}
				
/****************************************************************/	
				if(controls.getObject().position.x >= 380){
					controls.getObject().position.x = 379;
				}else if(controls.getObject().position.x <= -380){
					controls.getObject().position.x = -379;
				}else if(controls.getObject().position.z >= 480 ){
					controls.getObject().position.z = 479;
				}else if(controls.getObject().position.z <= -480){
					controls.getObject().position.z = -479;
				}


				if ( moveForward || moveBackward ) {
                    velocity.z -= direction.z * velocityConstant * runMultiplier * delta; 
				}
				if ( moveLeft || moveRight ) velocity.x -= direction.x * velocityConstant * runMultiplier * delta;
				if ( onObject === true ) {
					velocity.y = Math.max( 0, velocity.y );
					canJump = true;
				}
				controls.getObject().translateX( velocity.x * delta );
				controls.getObject().translateY( velocity.y * delta );
				controls.getObject().translateZ( velocity.z * delta );
				if ( controls.getObject().position.y < 10 ) {
					velocity.y = 0;
					controls.getObject().position.y = 10;
					canJump = true;
				}
				prevTime = time;
			}
			renderer.render( scene, camera );
		}
}