// Monu Kumawat - Portfolio Core Script

document.addEventListener('DOMContentLoaded', () => {
  initThemeColorSystem();
  initMobileMenu();
  initScrollSpy();
  initSettingsPanel();
  initThreeBg();
  init3DProfilePhoto();
  initScrollAnimations();
  initTypingEffect();
  initSkillCards();
  initPortfolio();
  initPhotography();
  initContactForm();
  initWhatsAppWidget();
});

/* =========================================================================
   1. COLOR EXTRACTION & THEME SYSTEM
   ========================================================================= */
const DEFAULT_THEME = {
  primary: '#00f0ff',
  secondary: '#bd00ff',
  accent: '#ff0055'
};

function initThemeColorSystem() {
  // Load saved colors or apply default
  const savedPrimary = localStorage.getItem('--primary-color');
  const savedSecondary = localStorage.getItem('--secondary-color');
  const savedAccent = localStorage.getItem('--accent-color');
  
  if (savedPrimary && savedSecondary && savedAccent) {
    applyThemeColors(savedPrimary, savedSecondary, savedAccent);
  } else {
    applyThemeColors(DEFAULT_THEME.primary, DEFAULT_THEME.secondary, DEFAULT_THEME.accent);
  }
}

function applyThemeColors(primary, secondary, accent) {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', primary);
  root.style.setProperty('--secondary-color', secondary);
  root.style.setProperty('--accent-color', accent);
  
  // Set glow utilities
  root.style.setProperty('--primary-glow', hexToRgbA(primary, 0.4));
  root.style.setProperty('--secondary-glow', hexToRgbA(secondary, 0.4));
  root.style.setProperty('--accent-glow', hexToRgbA(accent, 0.4));
  root.style.setProperty('--border-glow', hexToRgbA(primary, 0.25));
}

function hexToRgbA(hex, alpha) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
  }
  return `rgba(0, 240, 255, ${alpha})`;
}

// Convert RGB to HSL for color adjustment
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL back to Hex String
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c / 2,
      r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Analyze image and extract dominant, secondary and accent colors
function extractColorsFromImage(imageElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Downscale image to analyze quickly
  canvas.width = 60;
  canvas.height = 60;
  ctx.drawImage(imageElement, 0, 0, 60, 60);
  
  const imgData = ctx.getImageData(0, 0, 60, 60).data;
  const colorBuckets = {};
  
  // Tally color buckets (rounding RGB values to group similar ones)
  for (let i = 0; i < imgData.length; i += 4) {
    const r = Math.round(imgData[i] / 24) * 24;
    const g = Math.round(imgData[i+1] / 24) * 24;
    const b = Math.round(imgData[i+2] / 24) * 24;
    const a = imgData[i+3];
    
    // Skip transparent, highly dark or highly white pixels to avoid boring colors
    if (a < 150) continue;
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 235) continue;
    
    const key = `${r},${g},${b}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }
  
  // Sort color buckets by frequency
  const sortedColors = Object.keys(colorBuckets).sort((x, y) => colorBuckets[y] - colorBuckets[x]);
  
  // Extract up to 3 dominant RGB values
  const rgbList = [];
  for (let i = 0; i < sortedColors.length && rgbList.length < 3; i++) {
    const [r, g, b] = sortedColors[i].split(',').map(Number);
    // Ensure the color is somewhat distinct from existing ones
    let isDistinct = true;
    for (const color of rgbList) {
      const distance = Math.sqrt(
        Math.pow(color.r - r, 2) + 
        Math.pow(color.g - g, 2) + 
        Math.pow(color.b - b, 2)
      );
      if (distance < 50) isDistinct = false;
    }
    if (isDistinct) rgbList.push({ r, g, b });
  }
  
  // Fill in fallback colors if distinct ones weren't found
  if (rgbList.length < 1) rgbList.push({ r: 0, g: 240, b: 255 }); // cyan
  if (rgbList.length < 2) rgbList.push({ r: 189, g: 0, b: 255 }); // purple
  if (rgbList.length < 3) rgbList.push({ r: 255, g: 0, b: 85 }); // pink
  
  // Transform colors into neon cyberpunk variables using HSL (boosting saturation and clamping brightness)
  const hslColors = rgbList.map(c => rgbToHsl(c.r, c.g, c.b));
  
  // Standardize saturation/lightness for aesthetic cyberpunk glow
  const primaryHex = hslToHex(hslColors[0].h, 95, 52); // Bright primary
  const secondaryHex = hslToHex(hslColors[1]?.h || (hslColors[0].h + 60) % 360, 95, 46); // Complementary secondary
  const accentHex = hslToHex(hslColors[2]?.h || (hslColors[0].h + 120) % 360, 100, 50); // Vibrant accent
  
  // Apply and save
  applyThemeColors(primaryHex, secondaryHex, accentHex);
  localStorage.setItem('--primary-color', primaryHex);
  localStorage.setItem('--secondary-color', secondaryHex);
  localStorage.setItem('--accent-color', accentHex);
}

let profile3DMesh, profile3DTexture;

// Function triggered when user uploads an image
function handleImageUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      // Extract colors
      extractColorsFromImage(img);
      
      // If there's an active 3D profile mesh, update its texture dynamically
      if (profile3DMesh && profile3DTexture) {
        const texLoader = new THREE.TextureLoader();
        texLoader.load(event.target.result, (newTex) => {
          profile3DTexture = newTex;
          if (Array.isArray(profile3DMesh.material)) {
            profile3DMesh.material[4].map = newTex;
            profile3DMesh.material[4].needsUpdate = true;
          }
        });
      }
      
      // Save profile picture source in local storage
      localStorage.setItem('profile-avatar', event.target.result);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}


/* =========================================================================
   2. THREE.JS 3D BACKGROUND ENGINE
   ========================================================================= */
let threeScene, threeCamera, threeRenderer;
let particleSystem, plexusNodes = [], plexusGeometry, plexusLines;
let floatingCodeObjects = [];
const codeSnippets = [
  '<div>', '<section>', '<header>', 'const dev = true;', 'function portfolio() {}',
  'display:flex;', 'position:absolute;', 'margin:0 auto;', 'document.querySelector()',
  '01001010', '11001001', '00110011', '{ }', '</>', 'git commit -m', 'npm run dev',
  'console.log()', 'await fetch()', 'import React from "react"', 'style.css'
];

function initThreeBg() {
  const container = document.createElement('div');
  container.id = 'webgl-bg-container';
  document.body.prepend(container);
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // 1. Scene & Camera
  threeScene = new THREE.Scene();
  threeScene.fog = new THREE.FogExp2(0x07070d, 0.005);
  
  threeCamera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  threeCamera.position.z = 80;
  
  // 2. Renderer
  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(threeRenderer.domElement);
  
  // 3. Ambient Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  threeScene.add(ambientLight);
  
  // 4. Interactive Particle Stars
  const particleCount = 180;
  const particlesGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 200; // x
    particlePositions[i+1] = (Math.random() - 0.5) * 200; // y
    particlePositions[i+2] = (Math.random() - 0.5) * 200; // z
  }
  particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  // Create circular glowing texture for particles
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 16;
  pCanvas.height = 16;
  const pCtx = pCanvas.getContext('2d');
  const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 16, 16);
  const pTexture = new THREE.CanvasTexture(pCanvas);
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 1.2,
    map: pTexture,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  particleSystem = new THREE.Points(particlesGeom, particlesMaterial);
  threeScene.add(particleSystem);
  
  // 5. Digital Connected Nodes (Plexus)
  const nodeCount = 45;
  const nodePositions = [];
  const nodeVelocities = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const x = (Math.random() - 0.5) * 120;
    const y = (Math.random() - 0.5) * 120;
    const z = (Math.random() - 0.5) * 120;
    nodePositions.push(new THREE.Vector3(x, y, z));
    nodeVelocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    ));
  }
  plexusNodes = { positions: nodePositions, velocities: nodeVelocities };
  
  plexusGeometry = new THREE.BufferGeometry();
  plexusLines = new THREE.LineSegments(
    plexusGeometry,
    new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    })
  );
  threeScene.add(plexusLines);
  
  // 6. Floating Canvas Text Sprites (HTML, CSS, JS strings)
  codeSnippets.forEach(text => {
    const textSprite = createTextSprite(text);
    textSprite.position.set(
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 100 - 30
    );
    textSprite.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03 + 0.02, // float upwards slightly
        (Math.random() - 0.5) * 0.01
      ),
      rotSpeed: (Math.random() - 0.5) * 0.005
    };
    threeScene.add(textSprite);
    floatingCodeObjects.push(textSprite);
  });
  
  // 7. Mouse interactions
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    mouseY = (e.clientY - window.innerHeight / 2) / 100;
  });
  
  // 8. Handle resize
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    threeCamera.aspect = w / h;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(w, h);
  });
  
  // 9. Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particle system slowly
    particleSystem.rotation.y += 0.0006;
    particleSystem.rotation.x += 0.0003;
    
    // Update Plexus Nodes & Connections
    const linePositions = [];
    const colors = [];
    
    const themeColorStr = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#00f0ff';
    const threeColor = new THREE.Color(themeColorStr);
    
    // Set matching colors to lines
    plexusLines.material.color = threeColor;
    
    // Move nodes
    for (let i = 0; i < nodeCount; i++) {
      const pos = plexusNodes.positions[i];
      const vel = plexusNodes.velocities[i];
      pos.add(vel);
      
      // Bounce boundaries
      if (Math.abs(pos.x) > 70) vel.x *= -1;
      if (Math.abs(pos.y) > 70) vel.y *= -1;
      if (Math.abs(pos.z) > 70) vel.z *= -1;
    }
    
    // Connect nodes close to each other
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = plexusNodes.positions[i].distanceTo(plexusNodes.positions[j]);
        if (dist < 28) {
          linePositions.push(plexusNodes.positions[i].x, plexusNodes.positions[i].y, plexusNodes.positions[i].z);
          linePositions.push(plexusNodes.positions[j].x, plexusNodes.positions[j].y, plexusNodes.positions[j].z);
        }
      }
    }
    
    plexusGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    plexusGeometry.computeBoundingBox();
    plexusGeometry.computeBoundingSphere();
    
    // Float code objects
    floatingCodeObjects.forEach(sprite => {
      sprite.position.add(sprite.userData.velocity);
      sprite.material.rotation += sprite.userData.rotSpeed;
      
      // Reset boundaries if they go too high
      if (sprite.position.y > 80) {
        sprite.position.y = -80;
        sprite.position.x = (Math.random() - 0.5) * 150;
      }
      if (sprite.position.x > 80 || sprite.position.x < -80) {
        sprite.userData.velocity.x *= -1;
      }
    });
    
    // Parallax mouse camera drift
    threeCamera.position.x += (mouseX - threeCamera.position.x) * 0.05;
    threeCamera.position.y += (-mouseY - threeCamera.position.y) * 0.05;
    threeCamera.lookAt(threeScene.position);
    
    threeRenderer.render(threeScene, threeCamera);
  }
  
  animate();
}

// Generate canvas-rendered texture text sprites dynamically
function createTextSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Custom font rendering on transparent canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 256, 64);
  
  ctx.font = '500 16px "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw glow shadow
  ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
  ctx.shadowBlur = 4;
  
  ctx.fillText(text, 128, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(24, 6, 1);
  return sprite;
}


/* =========================================================================
   3. MOBILE NAVIGATION AND STICKY MENU
   ========================================================================= */
function initMobileMenu() {
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  const stickyHeader = document.querySelector('.main-header');
  
  if (navToggle && mobileSidebar) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      mobileSidebar.classList.toggle('open');
    });
    
    // Close sidebar on link click
    mobileSidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mobileSidebar.classList.remove('open');
      });
    });
  }
  
  // Sticky navbar logic
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      stickyHeader.classList.add('sticky');
    } else {
      stickyHeader.classList.remove('sticky');
    }
  });
  
  // Highlight active navbar elements
  const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-sidebar a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === '#home') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


/* =========================================================================
   3.5 SCROLL SPY & SMOOTH ANCHOR NAV
   ========================================================================= */
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-sidebar a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120; // Offset to trigger early
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${current}` || href.endsWith(`#${current}`)) {
          link.classList.add('active');
        }
      });
    }
  });
  
  // Custom click listener for smooth scroll intercepts with offsets
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(href);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 75,
            behavior: 'smooth'
          });
          
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Update URL hash without scroll jumps
          history.pushState(null, null, href);
        }
      }
    });
  });
}


/* =========================================================================
   4. SETTINGS PANEL (THEME & DYNAMIC LOADER)
   ========================================================================= */
function initSettingsPanel() {
  const settingsPanel = document.querySelector('.settings-panel');
  const settingsToggle = document.querySelector('.settings-toggle');
  const imageUploader = document.querySelector('#theme-image-upload');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const profileUploaders = document.querySelectorAll('.profile-avatar-frame input[type="file"]');
  
  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('open');
    });
    
    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
      if (!settingsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
        settingsPanel.classList.remove('open');
      }
    });
  }
  
  // Widget Image Color Upload
  if (imageUploader) {
    imageUploader.addEventListener('change', (e) => {
      const file = e.target.files[0];
      handleImageUpload(file);
    });
  }
  
  // Profile Picture Direct Image Uploader (e.g. Hero Section Avatar)
  if (profileUploaders.length > 0) {
    profileUploaders.forEach(uploader => {
      uploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
      });
    });
  }
  
  // Restore loaded avatar if exists in LocalStorage
  const savedAvatar = localStorage.getItem('profile-avatar');
  if (savedAvatar) {
    const profileImages = document.querySelectorAll('.profile-img');
    profileImages.forEach(img => {
      img.src = savedAvatar;
    });
  }
  
  // Preset Buttons Action
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('preset-cyber')) {
        applyThemeColors(DEFAULT_THEME.primary, DEFAULT_THEME.secondary, DEFAULT_THEME.accent);
        localStorage.setItem('--primary-color', DEFAULT_THEME.primary);
        localStorage.setItem('--secondary-color', DEFAULT_THEME.secondary);
        localStorage.setItem('--accent-color', DEFAULT_THEME.accent);
      } else if (btn.classList.contains('preset-matrix')) {
        applyThemeColors('#00ff66', '#004d1a', '#00ffcc');
        localStorage.setItem('--primary-color', '#00ff66');
        localStorage.setItem('--secondary-color', '#004d1a');
        localStorage.setItem('--accent-color', '#00ffcc');
      } else if (btn.classList.contains('preset-sunset')) {
        applyThemeColors('#ff0055', '#ff9900', '#ffff00');
        localStorage.setItem('--primary-color', '#ff0055');
        localStorage.setItem('--secondary-color', '#ff9900');
        localStorage.setItem('--accent-color', '#ffff00');
      } else if (btn.classList.contains('preset-ice')) {
        applyThemeColors('#00c6ff', '#0072ff', '#00ffcc');
        localStorage.setItem('--primary-color', '#00c6ff');
        localStorage.setItem('--secondary-color', '#0072ff');
        localStorage.setItem('--accent-color', '#00ffcc');
      }
    });
  });
}


/* =========================================================================
   5. GSAP SCROLL AND TYPING REVEAL ANIMATIONS
   ========================================================================= */
function initScrollAnimations() {
  // Check if GSAP and ScrollTrigger are loaded
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate cards on scroll entrance
    gsap.utils.toArray('.glass-card').forEach(card => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        duration: 0.8,
        ease: 'power3.out'
      });
    });
    
    // Animate section titles
    gsap.utils.toArray('.section-title-wrap').forEach(title => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 85%'
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  } else {
    // Fallback Scroll Animation (IntersectionObserver)
    const elements = document.querySelectorAll('.glass-card, .section-title-wrap');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  }
}

function initTypingEffect() {
  const target = document.querySelector('.typing-container span');
  if (!target) return;
  
  const roles = [
    'Web Developer',
    'Graphic Designer',
    'Photographer',
    'Digital Marketer'
  ];
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function type() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      target.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      target.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }
    
    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingSpeed = 2000; // Wait before deleting
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Short break before next word
    }
    
    setTimeout(type, typingSpeed);
  }
  
  type();
}





/* =========================================================================
   7. SKILLS 3D CARDS & PROGRESS
   ========================================================================= */
function initSkillCards() {
  // 1. Skill progress bars loading triggers
  const progressBars = document.querySelectorAll('.skill-bar-fill');
  const gaugeFills = document.querySelectorAll('.gauge-circle-fill');
  const skillsSection = document.querySelector('.skills-section');
  
  function fillSkills() {
    progressBars.forEach(bar => {
      const targetPercent = bar.getAttribute('data-percent');
      bar.style.width = `${targetPercent}%`;
    });
    
    gaugeFills.forEach(fill => {
      const targetPercent = fill.getAttribute('data-percent');
      // SVG Circle circumference is 339.29 (r = 54)
      const circumference = 339.29;
      const strokeOffset = circumference - (targetPercent / 100) * circumference;
      fill.style.strokeDashoffset = strokeOffset;
    });
  }
  
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fillSkills();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(skillsSection);
  }
  
  // 2. 3D Card Tilt Effect
  const tiltCards = document.querySelectorAll('.skill-category-card');
  
  tiltCards.forEach(card => {
    const inner = card.querySelector('.skill-category-inner');
    if (!inner) return;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within card
      const y = e.clientY - rect.top;  // y coordinate within card
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (-12 to 12 degrees limit)
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0) rotateY(0)';
      inner.style.transition = 'transform 0.5s ease';
    });
    
    card.addEventListener('mouseenter', () => {
      inner.style.transition = 'none';
    });
  });
}


/* =========================================================================
   8. PORTFOLIO FILTER, SEARCH, AND MODAL
   ========================================================================= */
const portfolioData = {
  1: {
    title: 'Futuristic E-Commerce',
    category: 'web-development',
    date: 'February 2026',
    desc: 'A full-stack, high-performance cyberpunk-themed e-commerce platform incorporating Stripe checkout, custom interactive 3D product previews via Three.js, and complex product search filters.',
    tech: ['HTML5', 'CSS3', 'Three.js', 'Node.js', 'Express', 'Stripe API'],
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    link: '#'
  },
  2: {
    title: 'Cyberpunk Portfolio',
    category: 'web-development',
    date: 'May 2026',
    desc: 'An AI-inspired professional portfolio website utilizing advanced 3D shaders, real-time dynamic color schemes extracted from images, custom CSS glassmorphism components, and EmailJS integrations.',
    tech: ['HTML5', 'CSS3', 'Vanilla JS', 'Three.js', 'GSAP', 'EmailJS'],
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    link: '#'
  },
  3: {
    title: 'AI Branding & Identity',
    category: 'graphic-design',
    date: 'November 2025',
    desc: 'A complete branding and visual identity system created for a robotics startup. The project covers corporate logo design, digital UI mocks, neon marketing assets, and a print brand handbook.',
    tech: ['Illustrator', 'Photoshop', 'Figma', 'Vector Rendering'],
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    link: '#'
  },
  4: {
    title: 'Creative UI/UX Asset Pack',
    category: 'graphic-design',
    date: 'January 2026',
    desc: 'A futuristic digital asset package with customized glassmorphic icons, HUD UI elements, cyber glowing buttons, and modular web interfaces styled in neon blue, purple, and hot pink tones.',
    tech: ['Figma', 'Illustrator', 'SVG Manipulation'],
    img: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=800&auto=format&fit=crop',
    link: '#'
  },
  5: {
    title: 'Urban Neon Photo Essay',
    category: 'photography',
    date: 'December 2025',
    desc: 'A curated visual essay documenting night life and cyber aesthetics in bustling markets. Captured using long exposures, specialized color filters, and meticulous digital editing in Lightroom.',
    tech: ['Sony A7III', 'Lightroom Classic', 'Color Grading'],
    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    link: '#'
  },
  6: {
    title: 'Minimal Landscapes',
    category: 'photography',
    date: 'April 2026',
    desc: 'A collection of black-and-white minimalist photographs focusing on geometric symmetry in modern architecture and natural horizons. Emphasizes clean lines, high contrast ratios, and negative space.',
    tech: ['Fujifilm X-T4', 'Adobe Photoshop', 'Monochromatic Print'],
    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    link: '#'
  }
};

function initPortfolio() {
  const grid = document.querySelector('.portfolio-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('#portfolio-search');
  const modal = document.querySelector('#portfolio-modal');
  
  if (!grid) return;
  
  // Render cards
  function renderProjects(items) {
    grid.innerHTML = '';
    if (items.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No projects match your criteria.</div>';
      return;
    }
    
    items.forEach(proj => {
      const card = document.createElement('div');
      card.className = `portfolio-card glass-card`;
      card.setAttribute('data-id', proj.id);
      card.setAttribute('data-category', proj.category);
      
      let tagLabel = 'Web Dev';
      if (proj.category === 'graphic-design') tagLabel = 'Graphic Design';
      if (proj.category === 'photography') tagLabel = 'Photography';
      
      card.innerHTML = `
        <div class="portfolio-img-box">
          <img src="${proj.img}" alt="${proj.title}" loading="lazy">
          <div class="portfolio-overlay">
            <span class="portfolio-tag">${tagLabel}</span>
          </div>
        </div>
        <h3>${proj.title}</h3>
        <p class="portfolio-desc">${proj.desc.substring(0, 80)}...</p>
      `;
      grid.appendChild(card);
      
      // Open modal on click
      card.addEventListener('click', () => {
        openPortfolioModal(proj.id);
      });
    });
    
    // Refresh ScrollTrigger to accommodate new elements
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
  
  // Convert object list to array
  const projectsList = Object.keys(portfolioData).map(key => ({
    id: key,
    ...portfolioData[key]
  }));
  
  renderProjects(projectsList);
  
  // Tag Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      filterAndSearch();
    });
  });
  
  // Search Input Trigger
  if (searchInput) {
    searchInput.addEventListener('input', filterAndSearch);
  }
  
  function filterAndSearch() {
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const filtered = projectsList.filter(proj => {
      const matchesFilter = (activeFilter === 'all' || proj.category === activeFilter);
      const matchesSearch = proj.title.toLowerCase().includes(query) || 
                            proj.desc.toLowerCase().includes(query) ||
                            proj.tech.some(t => t.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
    
    renderProjects(filtered);
  }
  
  // Modal handlers
  function openPortfolioModal(id) {
    const data = portfolioData[id];
    if (!data || !modal) return;
    
    modal.querySelector('.modal-img-box img').src = data.img;
    modal.querySelector('.modal-img-box img').alt = data.title;
    modal.querySelector('.modal-details h2').textContent = data.title;
    modal.querySelector('.modal-meta span').textContent = data.date;
    modal.querySelector('.modal-body').textContent = data.desc;
    
    // Render technology tags
    const tagsContainer = modal.querySelector('.modal-tags');
    tagsContainer.innerHTML = '';
    data.tech.forEach(t => {
      const span = document.createElement('span');
      span.textContent = t;
      tagsContainer.appendChild(span);
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scroll
  }
  
  const closeModalBtn = document.querySelector('.modal-close');
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', closePortfolioModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePortfolioModal();
    });
  }
  
  function closePortfolioModal() {
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}


/* =========================================================================
   9. PHOTOGRAPHY MASONRY GALLERY & LIGHTBOX
   ========================================================================= */
const photoGalleryData = [
  { title: 'Cyber Tokyo Nights', category: 'creative', img: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800&auto=format&fit=crop' },
  { title: 'Forest Radiance', category: 'nature', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop' },
  { title: 'Abstract Reflection', category: 'creative', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop' },
  { title: 'Neon alleyways', category: 'urban', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop' },
  { title: 'Mountain Peak Solitude', category: 'nature', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop' },
  { title: 'Urban Geometry', category: 'urban', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop' },
  { title: 'Futuristic Grid', category: 'creative', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop' },
  { title: 'Silent Lake Morning', category: 'nature', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop' }
];

function initPhotography() {
  const photoGrid = document.querySelector('.photography-grid');
  const filterBtns = document.querySelectorAll('.photo-section .filter-btn');
  const lightbox = document.querySelector('#lightbox');
  
  if (!photoGrid) return;
  
  let currentActivePhotos = [...photoGalleryData];
  let lightboxIndex = 0;
  
  function renderPhotos(list) {
    photoGrid.innerHTML = '';
    
    list.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'photo-item';
      div.setAttribute('data-category', item.category);
      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}" loading="lazy">
        <div class="photo-info">
          <span class="photo-title">${item.title}</span>
          <span class="photo-cat">${item.category.toUpperCase()}</span>
        </div>
      `;
      photoGrid.appendChild(div);
      
      div.addEventListener('click', () => {
        openLightbox(index);
      });
    });
  }
  
  renderPhotos(photoGalleryData);
  
  // Gallery Category Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      currentActivePhotos = photoGalleryData.filter(p => filter === 'all' || p.category === filter);
      renderPhotos(currentActivePhotos);
    });
  });
  
  // Lightbox Implementation
  function openLightbox(index) {
    if (!lightbox) return;
    lightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function updateLightboxImage() {
    const item = currentActivePhotos[lightboxIndex];
    if (!item || !lightbox) return;
    
    lightbox.querySelector('.lightbox-img').src = item.img;
    lightbox.querySelector('.lightbox-img').alt = item.title;
    lightbox.querySelector('.lightbox-caption').textContent = `${item.title} (${item.category.toUpperCase()})`;
  }
  
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  
  if (closeBtn && lightbox) {
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) closeLightbox();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxIndex = (lightboxIndex - 1 + currentActivePhotos.length) % currentActivePhotos.length;
      updateLightboxImage();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxIndex = (lightboxIndex + 1) % currentActivePhotos.length;
      updateLightboxImage();
    });
  }
  
  // Keyboard slider nav
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') {
      lightboxIndex = (lightboxIndex + 1) % currentActivePhotos.length;
      updateLightboxImage();
    } else if (e.key === 'ArrowLeft') {
      lightboxIndex = (lightboxIndex - 1 + currentActivePhotos.length) % currentActivePhotos.length;
      updateLightboxImage();
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });
  
  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}


/* =========================================================================
   10. CONTACT FORM VALIDATION & EMAILJS
   ========================================================================= */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  const formStatus = document.querySelector('.form-status');
  
  if (!form) return;
  
  // Perform inputs check on submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let hasError = false;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    // Clear status
    if (formStatus) {
      formStatus.style.display = 'none';
      formStatus.className = 'form-status';
    }
    
    inputs.forEach(input => {
      const formGroup = input.parentElement;
      if (!input.value.trim()) {
        formGroup.classList.add('error');
        hasError = true;
      } else {
        formGroup.classList.remove('error');
        
        // Email check
        if (input.type === 'email') {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(input.value.trim())) {
            formGroup.classList.add('error');
            hasError = true;
          }
        }
      }
    });
    
    // Check validation hooks
    if (hasError) {
      showStatus('Please fill in all fields correctly.', 'error');
      return;
    }
    
    // EmailJS sending logic
    const sendButton = form.querySelector('button[type="submit"]');
    const originalText = sendButton.innerHTML;
    sendButton.innerHTML = 'Sending... <span class="typing-cursor"></span>';
    sendButton.disabled = true;
    
    // Retrieve variables for template matching
    const serviceID = 'default_service'; // Default service ID (Replace with yours)
    const templateID = 'template_portfolio'; // Replace with yours
    
    // Check if EmailJS sdk is loaded globally
    if (typeof emailjs !== 'undefined') {
      emailjs.sendForm(serviceID, templateID, form)
        .then(() => {
          showStatus('Thank you! Your message has been sent successfully.', 'success');
          form.reset();
          sendButton.innerHTML = originalText;
          sendButton.disabled = false;
        }, (err) => {
          console.error('EmailJS Error: ', err);
          // Fallback sending alert
          showStatus('EmailJS template matches required. Mail delivery simulated.', 'success');
          form.reset();
          sendButton.innerHTML = originalText;
          sendButton.disabled = false;
        });
    } else {
      // Simulate submission when offline/no API
      setTimeout(() => {
        showStatus('Simulated Success: Connect EmailJS in assets/js/script.js.', 'success');
        form.reset();
        sendButton.innerHTML = originalText;
        sendButton.disabled = false;
      }, 1500);
    }
  });
  
  // Real-time clearance of validation errors
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      const formGroup = input.parentElement;
      if (input.value.trim()) {
        formGroup.classList.remove('error');
      }
    });
  });
  
  function showStatus(msg, statusType) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.classList.add(statusType);
    formStatus.style.display = 'block';
  }
}


/* =========================================================================
   11. WHATSAPP FLOATING WIDGET
   ========================================================================= */
function initWhatsAppWidget() {
  const waBtn = document.querySelector('.whatsapp-btn');
  if (!waBtn) return;
  
  waBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const phone = '919772566884';
    const message = encodeURIComponent('Hi Monu Kumawat, I visited your 3D Cyber Portfolio and would like to connect for web/creative services.');
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  });
}


/* =========================================================================
   12. 3D INTERACTIVE PROFILE HOLOGRAM
   ========================================================================= */
let profileScene, profileCamera, profileRenderer;

function init3DProfilePhoto() {
  const container = document.getElementById('profile-3d-canvas-container');
  if (!container) return;
  
  const width = container.clientWidth || 300;
  const height = container.clientHeight || 300;
  
  // Scene Setup
  profileScene = new THREE.Scene();
  
  // Camera Setup
  profileCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  profileCamera.position.z = 24;
  
  // Renderer Setup
  profileRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  profileRenderer.setSize(width, height);
  profileRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(profileRenderer.domElement);
  
  // Handle profile canvas resize dynamically
  window.addEventListener('resize', () => {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 300;
    profileCamera.aspect = w / h;
    profileCamera.updateProjectionMatrix();
    profileRenderer.setSize(w, h);
  });
  
  // Lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 5, 10);
  profileScene.add(dirLight);
  
  const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
  profileScene.add(ambLight);
  
  const savedAvatar = localStorage.getItem('profile-avatar');
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
  
  const textureLoader = new THREE.TextureLoader();
  textureLoader.crossOrigin = 'anonymous';
  
  // Load texture
  textureLoader.load(savedAvatar || defaultAvatar, (texture) => {
    profile3DTexture = texture;
    createProfileMesh();
  }, undefined, () => {
    // Fallback load default if cross-origin fails
    textureLoader.load(defaultAvatar, (texture) => {
      profile3DTexture = texture;
      createProfileMesh();
    });
  });
  
  function createProfileMesh() {
    // 3D Card shape
    const geometry = new THREE.BoxGeometry(10, 10, 0.4);
    
    // Front face material uses profile picture
    const frontMat = new THREE.MeshBasicMaterial({
      map: profile3DTexture,
      side: THREE.DoubleSide
    });
    
    // Side and back materials use dark brushed metallic look
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a14,
      roughness: 0.25,
      metalness: 0.8
    });
    
    const materials = [metalMat, metalMat, metalMat, metalMat, frontMat, metalMat];
    
    profile3DMesh = new THREE.Mesh(geometry, materials);
    
    // Cyber Glowing Edges Outline
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    profile3DMesh.add(wireframe);
    
    profileScene.add(profile3DMesh);
    
    let targetRotX = 0;
    let targetRotY = 0;
    
    window.addEventListener('mousemove', (e) => {
      const mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      
      targetRotY = mouseX * 0.5;
      targetRotX = mouseY * 0.5;
    });
    
    function animateProfile() {
      requestAnimationFrame(animateProfile);
      
      // Floating motion
      profile3DMesh.position.y = Math.sin(Date.now() * 0.0015) * 0.35;
      
      // Get primary color variables
      const themeColorStr = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#00f0ff';
      lineMat.color.set(themeColorStr);
      
      // Parallax mouse follow
      profile3DMesh.rotation.x += (targetRotX - profile3DMesh.rotation.x) * 0.1;
      profile3DMesh.rotation.y += (targetRotY - profile3DMesh.rotation.y) * 0.1;
      
      // Slow background spin offset
      profile3DMesh.rotation.y += Math.sin(Date.now() * 0.0006) * 0.02;
      
      profileRenderer.render(profileScene, profileCamera);
    }
    
    animateProfile();
  }
}
