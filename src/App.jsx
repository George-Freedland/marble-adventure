import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// Move levels outside component to prevent recreation on every render
const GAME_LEVELS = [
  null, // Index 0 reserved for menu state
  {
    name: "Getting Started",
    platforms: [
      // Simple large platform for testing - made smaller and positioned better
      { pos: [0, 0, 5], size: [15, 1, 15], color: 0x4a90e2 },
      // Add some small platforms to test the improved jumping
      { pos: [5, 1, 10], size: [2, 1, 2], color: 0xf39c12 }, // Small platform
      { pos: [-5, 2, 12], size: [1.5, 1, 1.5], color: 0xe74c3c }, // Very small platform
      { pos: [0, 3, 8], size: [0.8, 1, 0.8], color: 0x9b59b6 }, // Extremely tiny platform
    ],
    start: [0, 2, -5], // Start in front of platform
    finish: [0, 2, 15], // Finish behind platform
    obstacles: []
  },
  {
    name: "Call to Adventure",
    platforms: [
      // Main starting platform
      { pos: [0, 0, 0], size: [12, 1, 8], color: 0x4a90e2 },
      
      // First jump section
      { pos: [0, 0, 15], size: [8, 1, 6], color: 0x4a90e2 },
      
      // Elevated platform
      { pos: [0, 3, 30], size: [10, 1, 8], color: 0xf39c12 },
      
      // Bridge section
      { pos: [0, 3, 45], size: [6, 1, 12], color: 0xf39c12 },
      
      // Final platform
      { pos: [0, 0, 65], size: [12, 1, 8], color: 0x9b59b6 },
      
      // Side platforms for exploration
      { pos: [15, 0, 15], size: [6, 1, 6], color: 0x2ecc71 },
      { pos: [-15, 0, 30], size: [6, 1, 6], color: 0x2ecc71 },
      { pos: [20, 3, 45], size: [4, 1, 4], color: 0xe74c3c },
      
      // Convert red pillars to jumpable platforms
      { pos: [3, 1.5, 8], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [-3, 1.5, 22], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [2, 4.5, 35], size: [1, 1, 1], color: 0xe74c3c },
    ],
    start: [0, 2, -5],
    finish: [0, 2, 70],
    obstacles: [
      // Keep base of pillars as obstacles for visual effect
      { pos: [3, 0.5, 8], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [-3, 0.5, 22], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [2, 3.5, 35], size: [1, 1, 1], color: 0xe74c3c },
    ]
  },
  {
    name: "Belly of the Beast",
    platforms: [
      // Starting platform - smaller than usual to set the tone
      { pos: [0, 0, 0], size: [8, 1, 6], color: 0x4a90e2 },
      
      // First challenging section - small stepping stones
      { pos: [8, 1, 8], size: [1.5, 1, 1.5], color: 0xf39c12 },
      { pos: [12, 2, 15], size: [1.2, 1, 1.2], color: 0xf39c12 },
      { pos: [15, 3, 22], size: [1, 1, 1], color: 0xe74c3c },
      
      // Elevated narrow bridge section
      { pos: [18, 4, 30], size: [2, 1, 8], color: 0x9b59b6 },
      { pos: [25, 5, 38], size: [1.5, 1, 1.5], color: 0xe74c3c },
      
      // Long dangerous gap with tiny platforms
      { pos: [30, 6, 45], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [35, 7, 52], size: [1.2, 1, 1.2], color: 0xf39c12 },
      { pos: [40, 8, 60], size: [1, 1, 1], color: 0xe74c3c },
      
      // Mid-level checkpoint platform
      { pos: [45, 9, 68], size: [6, 1, 4], color: 0x2ecc71 },
      
      // Descent section with tricky jumps
      { pos: [52, 8, 75], size: [1.5, 1, 1.5], color: 0xf39c12 },
      { pos: [58, 7, 82], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [62, 6, 88], size: [1.2, 1, 1.2], color: 0xf39c12 },
      
      // Zigzag section
      { pos: [65, 5, 95], size: [2, 1, 2], color: 0x9b59b6 },
      { pos: [70, 4, 100], size: [1.5, 1, 1.5], color: 0xe74c3c },
      { pos: [75, 3, 105], size: [1, 1, 1], color: 0xe74c3c },
      
      // Side route with extra challenge
      { pos: [80, 2, 110], size: [1.5, 1, 1.5], color: 0xf39c12 },
      { pos: [85, 1, 115], size: [1, 1, 1], color: 0xe74c3c },
      
      // Final approach - series of small platforms
      { pos: [88, 0, 120], size: [1.2, 1, 1.2], color: 0xf39c12 },
      { pos: [90, 1, 125], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [92, 2, 130], size: [1.5, 1, 1.5], color: 0xe74c3c },
      
      // Final platform before finish
      { pos: [95, 3, 135], size: [4, 1, 4], color: 0x9b59b6 },
      
      // Additional challenging red pillar platforms (jumpable tops)
      { pos: [10, 2.5, 12], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [20, 5.5, 32], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [32, 7.5, 48], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [48, 9.5, 70], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [60, 7.5, 85], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [72, 4.5, 102], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [82, 2.5, 112], size: [1, 1, 1], color: 0xe74c3c },
      { pos: [89, 1.5, 122], size: [1, 1, 1], color: 0xe74c3c },
    ],
    start: [0, 2, -5],
    finish: [95, 5, 145], // High finish requiring a final jump
    obstacles: [
      // Strategic obstacles to increase difficulty
      { pos: [10, 2, 12], size: [1, 3, 1], color: 0x8b4513 },
      { pos: [20, 5, 32], size: [1, 2, 1], color: 0x8b4513 },
      { pos: [32, 7, 48], size: [1, 2, 1], color: 0x8b4513 },
      { pos: [48, 9, 70], size: [1, 3, 1], color: 0x8b4513 },
      { pos: [60, 7, 85], size: [1, 2, 1], color: 0x8b4513 },
      { pos: [72, 4, 102], size: [1, 2, 1], color: 0x8b4513 },
      { pos: [82, 2, 112], size: [1, 3, 1], color: 0x8b4513 },
      { pos: [89, 1, 122], size: [1, 2, 1], color: 0x8b4513 },
    ]
  }
];

const MarbleGame = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const marbleRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const keysRef = useRef({});
  const gameStateRef = useRef({
    velocity: new THREE.Vector3(0, 0, 0),
    onGround: false,
    startTime: null,
    finished: false,
    canJump: true,
    lastGroundTime: 0 // Track when we were last on ground for coyote time
  });
  
  const [gameState, setGameState] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [time, setTime] = useState(0);
  const [bestTimes, setBestTimes] = useState({ 1: null, 2: null, 3: null }); // Level 1 = Getting Started, Level 2 = Call to Adventure, Level 3 = Belly of the Beast
  const [canJumpDisplay, setCanJumpDisplay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  
  // Mobile touch controls state
  const [mobileControls, setMobileControls] = useState({
    movement: { x: 0, y: 0 }, // Joystick position (-1 to 1)
    isJoystickActive: false,
    joystickStartPos: { x: 0, y: 0 },
    joystickCurrentPos: { x: 0, y: 0 }
  });

  // Mobile detection and orientation handling
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
    };

    checkMobile();
    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const loadLevel = useCallback(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) {
      console.log('Scene or renderer not ready for level loading, scene:', !!scene, 'renderer:', !!renderer);
      return;
    }

    const level = GAME_LEVELS[currentLevel];
    if (!level) {
      console.log('No level at index:', currentLevel, '(likely menu state)');
      return;
    }
    
    console.log('Loading level:', currentLevel, level.name);

    // Clear existing level
    const objectsToRemove = scene.children.filter(child => 
      child.userData.isLevelObject || child.userData.isMarble
    );
    objectsToRemove.forEach(obj => scene.remove(obj));

    // Create platforms
    level.platforms.forEach(platform => {
      const geometry = new THREE.BoxGeometry(...platform.size);
      const material = new THREE.MeshLambertMaterial({ 
        color: platform.color,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...platform.pos);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.userData.isLevelObject = true;
      mesh.userData.isPlatform = true;
      scene.add(mesh);
    });

    // Create obstacles
    level.obstacles.forEach(obstacle => {
      const geometry = new THREE.BoxGeometry(...obstacle.size);
      const material = new THREE.MeshLambertMaterial({ 
        color: obstacle.color,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...obstacle.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.isLevelObject = true;
      mesh.userData.isObstacle = true;
      scene.add(mesh);
    });

    // Create start pad - using box geometry for proper collision
    const startGeometry = new THREE.BoxGeometry(6, 0.3, 6); // Box instead of cylinder
    const startMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2ecc71,
      transparent: true,
      opacity: 0.9
    });
    const startPad = new THREE.Mesh(startGeometry, startMaterial);
    startPad.position.set(level.start[0], level.start[1] - 1.5, level.start[2]);
    startPad.receiveShadow = true;
    startPad.userData.isLevelObject = true;
    startPad.userData.isPlatform = true; // Add this for collision detection
    scene.add(startPad);

    // Create finish pad - using box geometry for proper collision
    const finishGeometry = new THREE.BoxGeometry(6, 0.3, 6); // Box instead of cylinder
    const finishMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xe74c3c,
      transparent: true,
      opacity: 0.9
    });
    const finishPad = new THREE.Mesh(finishGeometry, finishMaterial);
    finishPad.position.set(level.finish[0], level.finish[1] - 1.5, level.finish[2]);
    finishPad.receiveShadow = true;
    finishPad.userData.isLevelObject = true;
    finishPad.userData.isPlatform = true; // Add this for collision detection
    finishPad.userData.isFinish = true;
    scene.add(finishPad);

    // Create marble with better physics
    const marbleGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const marbleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      specular: 0x222222
    });
    const marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
    marble.position.set(...level.start);
    marble.castShadow = true;
    marble.userData.isMarble = true;
    marbleRef.current = marble;
    scene.add(marble);

    // Reset game state
    gameStateRef.current = {
      velocity: new THREE.Vector3(0, 0, 0),
      onGround: false,
      startTime: null,
      finished: false,
      canJump: true,
      lastGroundTime: Date.now()
    };

    // Position camera
    const camera = cameraRef.current;
    camera.position.set(level.start[0], level.start[1] + 12, level.start[2] - 15);
    camera.lookAt(level.start[0], level.start[1], level.start[2]);
  }, [currentLevel]);

  const initGame = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Add some point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.5, 30);
    pointLight1.position.set(15, 5, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 30);
    pointLight2.position.set(-15, 5, 30);
    scene.add(pointLight2);

    // Scene initialization complete
    console.log('Scene initialization complete');
    loadLevel(); // This will handle the case where currentLevel=0 gracefully
  }, [loadLevel]);

  const updateCamera = useCallback(() => {
    const marble = marbleRef.current;
    const camera = cameraRef.current;
    if (!marble || !camera) return;

    // Extremely stable camera following
    const idealOffset = new THREE.Vector3(0, 6, -10);
    const idealPosition = marble.position.clone().add(idealOffset);
    
    // Very slow interpolation
    camera.position.lerp(idealPosition, 0.005);
    
    // Smooth look-at target
    const lookAtTarget = new THREE.Vector3(
      marble.position.x,
      marble.position.y,
      marble.position.z + 2
    );
    camera.lookAt(lookAtTarget);
  }, []);

  const resetMarble = useCallback(() => {
    const marble = marbleRef.current;
    if (!marble) return;

    const level = GAME_LEVELS[currentLevel];
    if (!level) return; // No level to reset to (menu state)
    
    marble.position.set(...level.start);
    gameStateRef.current.velocity.set(0, 0, 0);
    gameStateRef.current.startTime = Date.now();
    gameStateRef.current.canJump = true;
    gameStateRef.current.lastGroundTime = Date.now();
  }, [currentLevel]);

  const checkCollisions = useCallback(() => {
    const marble = marbleRef.current;
    const scene = sceneRef.current;
    if (!marble || !scene) return;

    const marbleRadius = 0.6;
    const marblePos = marble.position;
    let onPlatform = false;
    let closestPlatform = null;
    let minDistance = Infinity;
    let nearAnyPlatform = false;

    scene.children.forEach(child => {
      if (child.userData.isPlatform) {
        const platformPos = child.position;
        const platformGeometry = child.geometry.parameters;
        
        // Check if marble is above platform
        const halfHeight = platformGeometry.height / 2;
        const halfWidth = platformGeometry.width / 2;
        const halfDepth = platformGeometry.depth / 2;
        
        const platformTop = platformPos.y + halfHeight;
        const platformLeft = platformPos.x - halfWidth;
        const platformRight = platformPos.x + halfWidth;
        const platformFront = platformPos.z - halfDepth;
        const platformBack = platformPos.z + halfDepth;
        
        // Extra generous bounds checking for very small platforms
        const platformSize = Math.min(halfWidth, halfDepth);
        let jumpBuffer;
        if (platformSize < 1.5) {
          // For very small platforms, be extremely generous
          jumpBuffer = Math.max(2.0, platformSize * 1.5);
        } else {
          // For normal platforms, be more moderate
          jumpBuffer = Math.max(1.0, platformSize * 0.6);
        }
        const extendedLeft = platformPos.x - halfWidth - jumpBuffer;
        const extendedRight = platformPos.x + halfWidth + jumpBuffer;
        const extendedFront = platformPos.z - halfDepth - jumpBuffer;
        const extendedBack = platformPos.z + halfDepth + jumpBuffer;
        
        // Check if marble is within generous platform bounds for jumping
        if (marblePos.x >= extendedLeft && marblePos.x <= extendedRight &&
            marblePos.z >= extendedFront && marblePos.z <= extendedBack) {
          
          const distance = marblePos.y - platformTop;
          // Extra forgiving for very small platforms
          let maxDistance = platformSize < 1.5 ? 1.8 : 1.2; // More generous for small platforms
          if (distance <= maxDistance && distance >= -0.5) {
            nearAnyPlatform = true;
          }
        }
        
        // Additional check: if it's a very small platform, also check by simple distance
        if (platformSize < 1.5) {
          const distanceToCenter = marblePos.distanceTo(platformPos);
          if (distanceToCenter < 2.5 && marblePos.y >= platformTop - 1.0 && marblePos.y <= platformTop + 1.8) {
            nearAnyPlatform = true;
          }
        }
        
        // Check if marble is within strict platform bounds for actual collision
        if (marblePos.x >= platformLeft && marblePos.x <= platformRight &&
            marblePos.z >= platformFront && marblePos.z <= platformBack) {
          
          const distance = marblePos.y - platformTop;
          // More generous collision detection
          if (distance <= marbleRadius && distance >= -marbleRadius) {
            if (distance < minDistance) {
              minDistance = distance;
              closestPlatform = child;
            }
          }
        }
      }

      if (child.userData.isObstacle) {
        const obstaclePos = child.position;
        const obstacleGeometry = child.geometry.parameters;
        
        const halfHeight = obstacleGeometry.height / 2;
        const halfWidth = obstacleGeometry.width / 2;
        const halfDepth = obstacleGeometry.depth / 2;
        
        const obstacleTop = obstaclePos.y + halfHeight;
        const obstacleBottom = obstaclePos.y - halfHeight;
        const obstacleLeft = obstaclePos.x - halfWidth;
        const obstacleRight = obstaclePos.x + halfWidth;
        const obstacleFront = obstaclePos.z - halfDepth;
        const obstacleBack = obstaclePos.z + halfDepth;
        
        // Check collision with obstacle
        if (marblePos.x + marbleRadius >= obstacleLeft && marblePos.x - marbleRadius <= obstacleRight &&
            marblePos.y + marbleRadius >= obstacleBottom && marblePos.y - marbleRadius <= obstacleTop &&
            marblePos.z + marbleRadius >= obstacleFront && marblePos.z - marbleRadius <= obstacleBack) {
          
          // Push marble away from obstacle
          const direction = marblePos.clone().sub(obstaclePos).normalize();
          marblePos.add(direction.multiplyScalar(0.1));
          gameStateRef.current.velocity.multiplyScalar(0.5);
        }
      }

      if (child.userData.isFinish) {
        const finishPos = child.position;
        const distance = marblePos.distanceTo(finishPos);
        
        if (distance < 3 && !gameStateRef.current.finished) {
          // Stop the marble immediately when finishing
          gameStateRef.current.velocity.set(0, 0, 0);
          gameStateRef.current.finished = true;
          const finalTime = (Date.now() - gameStateRef.current.startTime) / 1000;
          setTime(finalTime);
          setBestTimes(prev => ({
            ...prev,
            [currentLevel]: prev[currentLevel] ? Math.min(prev[currentLevel], finalTime) : finalTime
          }));
          setGameState('finished');
          console.log('Level completed! Marble frozen at finish.');
        }
      }
    });

    // Don't handle platform collision or movement if game is finished
    if (gameStateRef.current.finished) return;

    // Handle platform collision
    if (closestPlatform) {
      const platformTop = closestPlatform.position.y + closestPlatform.geometry.parameters.height / 2;
      
      // Keep marble on platform
      if (marblePos.y - marbleRadius <= platformTop + 0.3) { // Slightly more generous collision bounds
        marblePos.y = platformTop + marbleRadius;
        
        // More responsive jump reset - allow jumping even with small downward velocity
        if (gameStateRef.current.velocity.y <= 1.0) { // Even more forgiving
          gameStateRef.current.velocity.y = Math.max(0, gameStateRef.current.velocity.y * 0.1);
          onPlatform = true;
          gameStateRef.current.lastGroundTime = Date.now(); // Update last ground time
        }
      }
    }

    // More balanced jump logic - near platform OR very recent coyote time
    const coyoteTime = 150; // Shorter 150ms grace period after leaving ground
    const timeSinceGround = Date.now() - gameStateRef.current.lastGroundTime;
    
    // Only allow jumping if:
    // 1. Currently on a platform, OR
    // 2. Near a platform (within reasonable distance), OR  
    // 3. Very recently left a platform (coyote time) AND not falling too fast
    if (onPlatform || nearAnyPlatform || (timeSinceGround < coyoteTime && gameStateRef.current.velocity.y > -5)) {
      gameStateRef.current.canJump = true;
      setCanJumpDisplay(true);
      // Debug log for small platform detection
      if (nearAnyPlatform && !onPlatform) {
        console.log('Near small platform - jump enabled');
      }
    } else {
      // If none of the above conditions are met, disable jumping
      gameStateRef.current.canJump = false;
      setCanJumpDisplay(false);
    }

    // Update onGround state
    if (onPlatform) {
      gameStateRef.current.lastGroundTime = Date.now();
    }
    gameStateRef.current.onGround = onPlatform;

    // Fall detection - more forgiving (but don't reset if game is finished)
    if (marblePos.y < -5 && !gameStateRef.current.finished) {
      resetMarble();
    }
  }, [currentLevel, setBestTimes, setTime, setGameState, resetMarble, setCanJumpDisplay]);

  const updatePhysics = useCallback(() => {
    const marble = marbleRef.current;
    if (!marble) return;

    const state = gameStateRef.current;
    
    // Slightly increased gravity for more responsive feel
    if (!state.onGround) {
      state.velocity.y -= 0.095; // Increased from 0.082 for better responsiveness
    }

    // Slightly more friction but still responsive
    state.velocity.x *= 0.99;
    state.velocity.z *= 0.99;
    
    // Moderate ground friction
    if (state.onGround) {
      state.velocity.x *= 0.94;
      state.velocity.z *= 0.94;
    }

    // Higher max speed to match 1.4x movement increase
    const maxSpeed = 7.0; // Increased from 5.0 (5.0 * 1.4)
    if (state.velocity.length() > maxSpeed) {
      state.velocity.normalize().multiplyScalar(maxSpeed);
    }

    // Update position
    const deltaTime = 1/60;
    const scaledVelocity = state.velocity.clone().multiplyScalar(deltaTime);
    marble.position.add(scaledVelocity);
  }, []);

  const handleKeyDown = useCallback((event) => {
    keysRef.current[event.key.toLowerCase()] = true;
    
    if (gameState === 'playing' && !gameStateRef.current.finished && event.key.toLowerCase() === 'j') {
      // Only allow jumping if we can jump (this gets set by collision detection)
      if (gameStateRef.current.canJump) {
        gameStateRef.current.velocity.y = 19.8; // Small increase from 18.9 for slightly higher jumps
        gameStateRef.current.canJump = false; // Disable jumping until collision detection re-enables it
        console.log('Jump activated!');
      }
      event.preventDefault();
    }
  }, [gameState]);

  const handleKeyUp = useCallback((event) => {
    keysRef.current[event.key.toLowerCase()] = false;
  }, []);

  const handleInput = useCallback(() => {
    if (gameState !== 'playing' || gameStateRef.current.finished) return;

    const state = gameStateRef.current;
    const force = 0.28; // 1.4x speed increase (was 0.2, now 0.2 * 1.4)
    const keys = keysRef.current;

    if (!state.startTime) {
      state.startTime = Date.now();
    }

    // Movement - Keyboard
    if (keys['w'] || keys['arrowup']) {
      state.velocity.z += force;
    }
    if (keys['s'] || keys['arrowdown']) {
      state.velocity.z -= force;
    }
    if (keys['a'] || keys['arrowleft']) {
      state.velocity.x += force;
    }
    if (keys['d'] || keys['arrowright']) {
      state.velocity.x -= force;
    }

    // Movement - Mobile Touch Controls
    if (isMobile && !isPortrait) {
      const { movement } = mobileControls;
      if (Math.abs(movement.x) > 0.1 || Math.abs(movement.y) > 0.1) {
        // Convert joystick coordinates to game movement
        // Joystick Y controls forward/backward (Z axis)
        // Joystick X controls left/right (X axis)
        state.velocity.z += movement.y * force;
        state.velocity.x -= movement.x * force; // Negative for correct direction
      }
    }
  }, [gameState, isMobile, isPortrait, mobileControls]);

  // Mobile touch handlers
  const handleJoystickStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMobileControls(prev => ({
      ...prev,
      isJoystickActive: true,
      joystickStartPos: { x: centerX, y: centerY },
      joystickCurrentPos: { x: touch.clientX, y: touch.clientY }
    }));
  }, []);

  const handleJoystickMove = useCallback((e) => {
    e.preventDefault();
    if (!mobileControls.isJoystickActive) return;
    
    const touch = e.touches[0];
    const { joystickStartPos } = mobileControls;
    
    // Calculate distance from center
    const deltaX = touch.clientX - joystickStartPos.x;
    const deltaY = touch.clientY - joystickStartPos.y;
    
    // Limit the distance (joystick radius)
    const maxDistance = 50;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;
    
    // Clamp to circle
    if (distance > maxDistance) {
      normalizedX = (deltaX / distance) * 1;
      normalizedY = (deltaY / distance) * 1;
    }
    
    setMobileControls(prev => ({
      ...prev,
      joystickCurrentPos: { x: touch.clientX, y: touch.clientY },
      movement: { x: normalizedX, y: -normalizedY } // Negative Y for correct forward direction
    }));
  }, [mobileControls]);

  const handleJoystickEnd = useCallback((e) => {
    e.preventDefault();
    setMobileControls(prev => ({
      ...prev,
      isJoystickActive: false,
      movement: { x: 0, y: 0 },
      joystickStartPos: { x: 0, y: 0 },
      joystickCurrentPos: { x: 0, y: 0 }
    }));
  }, []);

  const handleJumpTouch = useCallback((e) => {
    e.preventDefault();
    if (gameState === 'playing' && !gameStateRef.current.finished) {
      if (gameStateRef.current.canJump) {
        gameStateRef.current.velocity.y = 19.8;
        gameStateRef.current.canJump = false;
        console.log('Jump activated via touch!');
      }
    }
  }, [gameState]);

  // Load level when currentLevel changes or when entering playing state
  useEffect(() => {
    if (gameState === 'playing' && sceneRef.current && rendererRef.current) {
      console.log('Loading level:', currentLevel, 'gameState:', gameState);
      loadLevel();
    }
  }, [currentLevel, gameState, loadLevel]);

  useEffect(() => {
    initGame();
    
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    const currentMount = mountRef.current;
    const currentRenderer = rendererRef.current;
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && currentRenderer && currentMount.contains(currentRenderer.domElement)) {
        currentMount.removeChild(currentRenderer.domElement);
      }
    };
  }, [initGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    let lastTime = 0;
    let animationId;
    
    const animate = (currentTime) => {
      // Limit updates to 60 FPS max
      if (currentTime - lastTime > 16) {
        if (gameState === 'playing') {
          // Only run game logic if not finished
          if (!gameStateRef.current.finished) {
            handleInput();
            updatePhysics();
            checkCollisions();
          }
          updateCamera();
          
          // Update timer less frequently to avoid flickering
          if (gameStateRef.current.startTime && !gameStateRef.current.finished && currentTime % 100 < 16) {
            setTime((Date.now() - gameStateRef.current.startTime) / 1000);
          }
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    // CRITICAL: Cancel the animation loop when component unmounts or dependencies change
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, handleInput, updatePhysics, checkCollisions, updateCamera]);

  const startGame = (levelIndex = 1) => {
    console.log('Starting game with level index:', levelIndex);
    
    // Completely reset game state for consistent physics
    gameStateRef.current = {
      velocity: new THREE.Vector3(0, 0, 0),
      onGround: false,
      startTime: null,
      finished: false,
      canJump: true,
      lastGroundTime: Date.now()
    };
    
    setCurrentLevel(levelIndex);
    setGameState('playing');
    setTime(0);
  };

  const restartLevel = () => {
    // Completely reset game state for consistent physics
    gameStateRef.current = {
      velocity: new THREE.Vector3(0, 0, 0),
      onGround: false,
      startTime: null,
      finished: false,
      canJump: true,
      lastGroundTime: Date.now()
    };
    
    setGameState('playing');
    setTime(0);
    resetMarble();
  };

  const backToMenu = () => {
    // Clear keys and game state when going to menu
    keysRef.current = {};
    gameStateRef.current = {
      velocity: new THREE.Vector3(0, 0, 0),
      onGround: false,
      startTime: null,
      finished: false,
      canJump: true,
      lastGroundTime: Date.now()
    };
    
    setGameState('menu');
    setCurrentLevel(0); // Reset to menu state
    setTime(0);
  };

  const nextLevel = () => {
    const nextLevelIndex = currentLevel + 1;
    if (nextLevelIndex < GAME_LEVELS.length && GAME_LEVELS[nextLevelIndex]) {
      startGame(nextLevelIndex);
    } else {
      // No more levels, go back to menu
      backToMenu();
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-auto">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-purple-600/20 to-transparent"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-2">
          <div className="text-center text-white max-w-4xl mx-auto px-4 w-full">
            {/* Game title with glow effect - more compact */}
            <div className="mb-3">
              <h1 className="text-3xl md:text-4xl font-black mb-1 bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                MARBLE
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-white/90 tracking-wider mb-2">
                ADVENTURE
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full shadow-lg shadow-purple-500/50"></div>
            </div>
            
            <p className="text-sm mb-3 text-gray-300 leading-relaxed">
              Navigate your marble through a stunning 3D world. Master physics, avoid obstacles, and race against time!
            </p>
            
            {/* Controls - more compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <div className="text-cyan-300 font-semibold mb-1 text-xs">MOVEMENT</div>
                <div className="text-gray-300 text-xs">WASD or Arrow Keys</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <div className="text-purple-300 font-semibold mb-1 text-xs">JUMP</div>
                <div className="text-gray-300 text-xs">J</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                <div className="text-yellow-300 font-semibold mb-1 text-xs">OBJECTIVE</div>
                <div className="text-gray-300 text-xs">Reach the finish!</div>
              </div>
            </div>
            
            {/* Level Selection - more compact */}
            <div className="space-y-2">
              {GAME_LEVELS.map((level, index) => {
                // Skip the null entry at index 0
                if (!level) return null;
                
                return (
                  <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl shadow-purple-500/20">
                    <div className="flex items-center justify-center mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4 bg-white rounded-full shadow-inner"></div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-1 text-cyan-300">{level.name}</h3>
                    
                    {bestTimes[index] && (
                      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg p-1 mb-2 border border-yellow-400/30">
                        <p className="text-yellow-300 text-xs font-semibold">
                          🏆 Best: {bestTimes[index].toFixed(2)}s
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => startGame(index)}
                      className="group relative w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95"
                    >
                      <span className="relative z-10">PLAY LEVEL</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"></div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-lg"></div>
        <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-purple-400/50 rounded-tr-lg"></div>
        <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-cyan-400/50 rounded-bl-lg"></div>
        <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-purple-400/50 rounded-br-lg"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Mobile Portrait Orientation Blocker */}
      {isMobile && isPortrait && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-blue-900 flex flex-col items-center justify-center z-50 text-white text-center p-8">
          <div className="mb-8">
            <div className="w-20 h-20 border-4 border-white rounded-lg mb-4 mx-auto flex items-center justify-center">
              <div className="w-12 h-8 border-2 border-white rounded transform rotate-90"></div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Rotate Your Device</h1>
            <p className="text-lg mb-2">Please rotate your device to landscape mode</p>
            <p className="text-sm text-gray-300">for the best gaming experience</p>
          </div>
          <div className="text-6xl animate-bounce">📱 ↻</div>
        </div>
      )}
      
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Game UI */}
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 rounded-lg p-4">
        <h3 className="text-xl font-bold">{GAME_LEVELS[currentLevel]?.name}</h3>
        <p className="text-lg">Time: {time.toFixed(2)}s</p>
        {bestTimes[currentLevel] && (
          <p className="text-yellow-300">Best: {bestTimes[currentLevel].toFixed(2)}s</p>
        )}
      </div>
      
      <div className="absolute top-4 right-4">
        <button
          onClick={backToMenu}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold"
        >
          Menu
        </button>
      </div>
      
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 rounded-lg p-4">
        <p>WASD/Arrows: Move</p>
        <p>J: Jump</p>
        <p className={canJumpDisplay ? "text-green-400" : "text-red-400"}>
          Jump: {canJumpDisplay ? "Available" : "Disabled"}
        </p>
      </div>

      {/* Level Complete Overlay */}
      {gameState === 'finished' && (() => {
        const nextLevelIndex = currentLevel + 1;
        const hasNextLevel = nextLevelIndex < GAME_LEVELS.length && GAME_LEVELS[nextLevelIndex];
        
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-green-600 bg-opacity-95 flex items-center justify-center z-50">
            <div className="text-center text-white max-w-lg mx-auto px-8">
              <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">Level Complete!</h1>
              <h2 className="text-2xl mb-4 drop-shadow-md">{GAME_LEVELS[currentLevel]?.name}</h2>
              <p className="text-xl mb-4 drop-shadow-md">Time: {time.toFixed(2)}s</p>
              {bestTimes[currentLevel] === time && (
                <p className="text-yellow-300 text-lg mb-6 drop-shadow-md animate-pulse">🎉 NEW BEST TIME! 🎉</p>
              )}
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
                {hasNextLevel && (
                  <button
                    onClick={nextLevel}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Next Level
                  </button>
                )}
                <button
                  onClick={restartLevel}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Try Again
                </button>
                <button
                  onClick={backToMenu}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mobile Touch Controls - Only show in landscape and during gameplay */}
      {isMobile && !isPortrait && gameState === 'playing' && (
        <>
          {/* Virtual Joystick */}
          <div 
            className="absolute bottom-8 left-8 w-24 h-24 bg-white/20 border-2 border-white/40 rounded-full flex items-center justify-center touch-none z-40"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
          >
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
              <div 
                className="w-8 h-8 bg-white/60 rounded-full transition-transform duration-75"
                style={{
                  transform: mobileControls.isJoystickActive 
                    ? `translate(${mobileControls.movement.x * 20}px, ${mobileControls.movement.y * 20}px)`
                    : 'translate(0px, 0px)'
                }}
              />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-semibold">
              MOVE
            </div>
          </div>

          {/* Jump Button */}
          <div 
            className="absolute bottom-8 right-8 w-20 h-20 bg-purple-500/70 border-2 border-purple-300/60 rounded-full flex items-center justify-center touch-none z-40 active:bg-purple-600/80 transition-colors duration-75"
            onTouchStart={handleJumpTouch}
          >
            <div className="text-white font-bold text-lg">J</div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-semibold">
              JUMP
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarbleGame;