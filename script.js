document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen when everything is ready
    setTimeout(() => {
        document.querySelector('.loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.loading-screen').style.display = 'none';
        }, 1000);
    }, 1500);

 
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    
    // stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 200, 500);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 2000;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Solar system parameters
    const planetData = {
        sun: { radius: 20, color: 0xfdb813, rotationSpeed: 0.005 },
        mercury: { radius: 3.2, color: 0xb5b5b5, distance: 60, orbitSpeed: 0.04, rotationSpeed: 0.004 },
        venus: { radius: 6, color: 0xe6c229, distance: 90, orbitSpeed: 0.015, rotationSpeed: 0.002 },
        earth: { radius: 6.3, color: 0x3498db, distance: 130, orbitSpeed: 0.01, rotationSpeed: 0.02 },
        mars: { radius: 3.4, color: 0xe27b58, distance: 180, orbitSpeed: 0.008, rotationSpeed: 0.018 },
        jupiter: { radius: 12, color: 0xe3b07b, distance: 250, orbitSpeed: 0.002, rotationSpeed: 0.04 },
        saturn: { radius: 10, color: 0xf5e3b1, distance: 320, orbitSpeed: 0.0009, rotationSpeed: 0.038, hasRings: true },
        uranus: { radius: 7, color: 0xb5e3e3, distance: 380, orbitSpeed: 0.0004, rotationSpeed: 0.03 },
        neptune: { radius: 6.8, color: 0x5b5ddf, distance: 430, orbitSpeed: 0.0001, rotationSpeed: 0.032 }
    };
    
    // celestial bodies
    const celestialBodies = {};
    const orbits = {};
    const labels = {};
    let simulationSpeed = 1;
    
    // Sun with glow effect
    const sunGeometry = new THREE.SphereGeometry(planetData.sun.radius, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: planetData.sun.color,
        transparent: true,
        opacity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    celestialBodies.sun = sun;
    
    // Sun glow effect
    const sunGlowGeometry = new THREE.SphereGeometry(planetData.sun.radius * 1.5, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: planetData.sun.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);
    
    //   planets
    Object.keys(planetData).forEach((planetName, index) => {
        if (planetName === 'sun') return;
        
        const planet = planetData[planetName];
        
        //   planet mesh
        const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: planet.color,
            shininess: 10
        });
        const planetMesh = new THREE.Mesh(geometry, material);
        
        // Position planet in orbit
        const angle = Math.random() * Math.PI * 2;
        planetMesh.position.x = Math.cos(angle) * planet.distance;
        planetMesh.position.z = Math.sin(angle) * planet.distance;
        
        scene.add(planetMesh);
        celestialBodies[planetName] = planetMesh;
        
        // orbit path
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        const orbitSegments = 128;
        
        for (let i = 0; i <= orbitSegments; i++) {
            const theta = (i / orbitSegments) * Math.PI * 2;
            orbitPoints.push(
                Math.cos(theta) * planet.distance,
                0,
                Math.sin(theta) * planet.distance
            );
        }
        
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
        orbits[planetName] = orbit;
        
        //  rings for Saturn
        if (planetName === 'saturn' && planet.hasRings) {
            const ringGeometry = new THREE.RingGeometry(planet.radius * 1.5, planet.radius * 2.5, 64);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: 0xc0a880,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2 * 0.3;
            rings.rotation.y = Math.PI / 4;
            planetMesh.add(rings);
        }
        
        //  label
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = planetName.charAt(0).toUpperCase() + planetName.slice(1);
        label.style.position = 'absolute';
        label.style.color = 'white';
        label.style.fontFamily = 'Orbitron, sans-serif';
        label.style.fontSize = '14px';
        label.style.pointerEvents = 'none';
        label.style.opacity = '0';
        label.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(label);
        labels[planetName] = label;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // UI Controls
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const autoRotateBtn = document.getElementById('auto-rotate-btn');
    const freeLookBtn = document.getElementById('free-look-btn');
    const planetSelector = document.getElementById('planet-selector');
    const toggleOrbitsBtn = document.getElementById('toggle-orbits-btn');
    const toggleLabelsBtn = document.getElementById('toggle-labels-btn');
    const planetInfoPanel = document.querySelector('.planet-info');
    
    let showOrbits = true;
    let showLabels = false;
    let focusedPlanet = null;
    
    // Update speed display
    speedSlider.addEventListener('input', () => {
        simulationSpeed = parseFloat(speedSlider.value);
        speedValue.textContent = `${simulationSpeed.toFixed(1)}x`;
    });
    
    // Toggle auto rotate
    autoRotateBtn.addEventListener('click', () => {
        controls.autoRotate = true;
        autoRotateBtn.classList.add('active');
        freeLookBtn.classList.remove('active');
    });
    
    freeLookBtn.addEventListener('click', () => {
        controls.autoRotate = false;
        freeLookBtn.classList.add('active');
        autoRotateBtn.classList.remove('active');
    });
    
    // Planet focus
    planetSelector.addEventListener('change', (e) => {
        const planetName = e.target.value;
        focusOnPlanet(planetName);
    });
    
    function focusOnPlanet(planetName) {
        focusedPlanet = planetName;
        
        if (planetName === 'sun') {
            gsap.to(camera.position, {
                x: 0,
                y: 200,
                z: 500,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            
            gsap.to(controls.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            
            updatePlanetInfo('sun');
            return;
        }
        
        const planet = celestialBodies[planetName];
        const distance = planetData[planetName].distance * 1.5;
        
        // Calculate position behind and above the planet
        const planetPosition = planet.position.clone();
        const cameraPosition = planetPosition.clone();
        cameraPosition.x += distance * 0.7;
        cameraPosition.y += distance * 0.5;
        cameraPosition.z += distance * 0.7;
        
        gsap.to(camera.position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            duration: 1.5,
            ease: 'power2.inOut'
        });
        
        gsap.to(controls.target, {
            x: planetPosition.x,
            y: planetPosition.y,
            z: planetPosition.z,
            duration: 1.5,
            ease: 'power2.inOut'
        });
        
        updatePlanetInfo(planetName);
    }
    
    function updatePlanetInfo(planetName) {
        const info = {
            sun: {
                name: 'Sun',
                details: 'Diameter: 1,392,700 km<br>Mass: 1.989 × 10³⁰ kg<br>Surface Temp: 5,500°C'
            },
            mercury: {
                name: 'Mercury',
                details: 'Diameter: 4,879 km<br>Mass: 3.301 × 10²³ kg<br>Surface Temp: -173°C to 427°C'
            },
            venus: {
                name: 'Venus',
                details: 'Diameter: 12,104 km<br>Mass: 4.867 × 10²⁴ kg<br>Surface Temp: 462°C'
            },
            earth: {
                name: 'Earth',
                details: 'Diameter: 12,742 km<br>Mass: 5.972 × 10²⁴ kg<br>Surface Temp: -88°C to 58°C'
            },
            mars: {
                name: 'Mars',
                details: 'Diameter: 6,779 km<br>Mass: 6.417 × 10²³ kg<br>Surface Temp: -153°C to 20°C'
            },
            jupiter: {
                name: 'Jupiter',
                details: 'Diameter: 139,820 km<br>Mass: 1.899 × 10²⁷ kg<br>Cloud Temp: -145°C'
            },
            saturn: {
                name: 'Saturn',
                details: 'Diameter: 116,460 km<br>Mass: 5.685 × 10²⁶ kg<br>Cloud Temp: -178°C'
            },
            uranus: {
                name: 'Uranus',
                details: 'Diameter: 50,724 km<br>Mass: 8.682 × 10²⁵ kg<br>Cloud Temp: -224°C'
            },
            neptune: {
                name: 'Neptune',
                details: 'Diameter: 49,244 km<br>Mass: 1.024 × 10²⁶ kg<br>Cloud Temp: -214°C'
            }
        };
        
        const panel = document.querySelector('.planet-info');
        panel.querySelector('.planet-name').textContent = info[planetName].name;
        panel.querySelector('.planet-details').innerHTML = info[planetName].details;
        panel.classList.add('visible');
    }
    
    // Toggle orbits visibility
    toggleOrbitsBtn.addEventListener('click', () => {
        showOrbits = !showOrbits;
        Object.values(orbits).forEach(orbit => {
            orbit.visible = showOrbits;
        });
        toggleOrbitsBtn.classList.toggle('active');
    });
    
    // Toggle labels visibility
    toggleLabelsBtn.addEventListener('click', () => {
        showLabels = !showLabels;
        Object.values(labels).forEach(label => {
            label.style.opacity = showLabels ? '1' : '0';
        });
        toggleLabelsBtn.classList.toggle('active');
    });
    
    // Raycaster for planet interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseMove(event) {
        // Calculate mouse position in normalized 
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    function onClick(event) {
        // Update the raycaster with the current mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Calculate objects intersecting the ray
        const intersects = raycaster.intersectObjects(Object.values(celestialBodies));
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const planetName = Object.keys(celestialBodies).find(key => celestialBodies[key] === clickedObject);
            if (planetName) {
                focusOnPlanet(planetName);
                document.getElementById('planet-selector').value = planetName;
            }
        }
    }
    
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onClick, false);
    
    // Touch support for mobile
    function onTouchEnd(event) {
        if (event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            const mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            onClick(mouseEvent);
        }
    }
    
    window.addEventListener('touchend', onTouchEnd, false);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the Sun
        sun.rotation.y += planetData.sun.rotationSpeed * simulationSpeed;
        
        // Update planets
        Object.keys(planetData).forEach(planetName => {
            if (planetName === 'sun') return;
            
            const planet = celestialBodies[planetName];
            const data = planetData[planetName];
            
            // Orbit rotation
            planet.position.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                data.orbitSpeed * simulationSpeed
            );
            
            // Planet rotation
            planet.rotation.y += data.rotationSpeed * simulationSpeed;
            
            // Update labels position
            if (showLabels) {
                const label = labels[planetName];
                const planetPosition = planet.position.clone().project();
                
                label.style.left = `${(planetPosition.x * 0.5 + 0.5) * window.innerWidth}px`;
                label.style.top = `${(-(planetPosition.y * 0.5) + 0.5) * window.innerHeight}px`;
            }
        });
        
        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    animate();
});