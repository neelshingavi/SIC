import gsap from 'gsap';
import { sound } from '../services/sound.js';
import { createIcons, Network, Users, Code, Briefcase, Banknote, Star, TrendingUp, Rocket, Layers, Award, Lightbulb, Globe, MapPin } from 'lucide';

let ecosystemResizeHandler = null;

export function initEcosystem() {
  const container = document.getElementById('ecosystem-graph');
  if (!container) return;

  const svg = document.getElementById('ecosystem-lines');
  const nodesContainer = document.getElementById('ecosystem-nodes');
  const infoCard = document.getElementById('ecosystem-info');
  const infoTitle = document.getElementById('info-title');
  const infoDesc = document.getElementById('info-desc');

  // Guard against duplicate initialization (e.g. Vite HMR re-running this module,
  // or any future re-init call) leaving stale nodes/lines/particles behind and
  // stacking a second resize listener on top of the first.
  svg.innerHTML = '';
  nodesContainer.innerHTML = '';
  if (ecosystemResizeHandler) {
    window.removeEventListener('resize', ecosystemResizeHandler);
    ecosystemResizeHandler = null;
  }

  // Hardcoded positions based on a 100x100 virtual grid, which we'll map to percentages
  // This gives a highly controlled radial layout without needing a physics engine
  const nodesData = {
    'sic': { x: 50, y: 50, mobileX: 50, mobileY: 45, label: 'SIC PICT', type: 'center', desc: 'The central hub driving innovation and entrepreneurship at PICT.', img: '/images/logo-optimized.png' },

    'mentors': { x: 32, y: 32, mobileX: 30, mobileY: 20, label: 'Mentors', type: 'cluster', desc: 'A curated network of seasoned founders providing strategic guidance.', icon: 'users' },
    'm1': { x: 12, y: 15, mobileX: 15, mobileY: 8, label: 'Tech', type: 'leaf', desc: 'Deep-tech mentoring in AI, Web3, and scalable systems.', icon: 'code' },
    'm2': { x: 38, y: 10, mobileX: 50, mobileY: 10, label: 'Business', type: 'leaf', desc: 'Product-market fit, unit economics, and scaling strategies.', icon: 'briefcase' },

    'funding': { x: 68, y: 32, mobileX: 70, mobileY: 20, label: 'Funding', type: 'cluster', desc: 'Facilitating access to critical early-stage capital and investment.', icon: 'banknote' },
    'f1': { x: 88, y: 18, mobileX: 85, mobileY: 8, label: 'Angels', type: 'leaf', desc: 'Access to seed funds and active angel investor syndicates.', icon: 'star' },
    'f2': { x: 62, y: 10, mobileX: 65, mobileY: 35, label: 'VCs', type: 'leaf', desc: 'Direct channels to prominent venture capital firms and funds.', icon: 'trending-up' },

    'startups': { x: 68, y: 68, mobileX: 30, mobileY: 70, label: 'Startups', type: 'cluster', desc: 'The core pipeline of high-growth ventures nurtured within SIC.', icon: 'rocket' },
    's1': { x: 88, y: 85, mobileX: 15, mobileY: 85, label: 'Incubated', type: 'leaf', desc: 'Ventures currently scaling within our intensive incubation program.', icon: 'layers' },
    's2': { x: 62, y: 90, mobileX: 45, mobileY: 85, label: 'Graduated', type: 'leaf', desc: 'Successful alumni ventures that have achieved market scale.', icon: 'award' },
    's3': { x: 88, y: 60, mobileX: 15, mobileY: 60, label: 'Pre-Inc', type: 'leaf', desc: 'Early-stage validation and prototyping for student innovators.', icon: 'lightbulb' },

    'alumni': { x: 32, y: 68, mobileX: 70, mobileY: 70, label: 'Alumni', type: 'cluster', desc: 'A powerful, global web of PICT alumni and corporate leaders.', icon: 'globe' },
    'a1': { x: 12, y: 82, mobileX: 85, mobileY: 85, label: 'Global', type: 'leaf', desc: 'Strategic partnerships with industry giants for resources.', icon: 'map-pin' }
  };

  const links = [
    { source: 'sic', target: 'mentors' },
    { source: 'sic', target: 'funding' },
    { source: 'sic', target: 'startups' },
    { source: 'sic', target: 'alumni' },
    { source: 'mentors', target: 'm1' },
    { source: 'mentors', target: 'm2' },
    { source: 'funding', target: 'f1' },
    { source: 'funding', target: 'f2' },
    { source: 'startups', target: 's1' },
    { source: 'startups', target: 's2' },
    { source: 'startups', target: 's3' },
    { source: 'alumni', target: 'a1' },

    // Core Cluster Ring (Constellation web)
    { source: 'mentors', target: 'funding' },
    { source: 'funding', target: 'startups' },
    { source: 'startups', target: 'alumni' },
    { source: 'alumni', target: 'mentors' },

    // Organic Cross-Links (Bridging adjacent leaves)
    { source: 'm2', target: 'f2' }, // Business Strategy aligns with VCs
    { source: 's3', target: 'f1' }  // Pre-Incubated seek Angel Funding
  ];

  const nodeElements = {};
  const lineElements = {};
  const particleElements = {};

  const getCoords = (node) => {
    const isMobile = window.innerWidth <= 768;
    return {
      x: isMobile && node.mobileX ? node.mobileX : node.x,
      y: isMobile && node.mobileY ? node.mobileY : node.y
    };
  };

  // Render SVG lines
  links.forEach(link => {
    const s = nodesData[link.source];
    const t = nodesData[link.target];
    const sCoords = getCoords(s);
    const tCoords = getCoords(t);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${sCoords.x}%`);
    line.setAttribute('y1', `${sCoords.y}%`);
    line.setAttribute('x2', `${tCoords.x}%`);
    line.setAttribute('y2', `${tCoords.y}%`);
    line.classList.add('eco-line');
    line.dataset.source = link.source;
    line.dataset.target = link.target;

    svg.appendChild(line);
    lineElements[`${link.source}-${link.target}`] = line;

    // Create energy particle
    const particle = document.createElement('div');
    particle.className = 'eco-particle';
    particle.style.left = `${sCoords.x}%`;
    particle.style.top = `${sCoords.y}%`;
    nodesContainer.appendChild(particle);
    particleElements[`${link.source}-${link.target}`] = particle;

    // Animate particle along the line
    gsap.to(particle, {
      left: `${tCoords.x}%`,
      top: `${tCoords.y}%`,
      duration: 3 + Math.random() * 2,
      ease: 'none',
      repeat: -1,
      delay: Math.random() * 2,
      opacity: 0,
      keyframes: {
        '0%': { opacity: 0, scale: 0 },
        '20%': { opacity: 1, scale: 1 },
        '80%': { opacity: 1, scale: 1 },
        '100%': { opacity: 0, scale: 0 }
      }
    });
  });

  // Render HTML nodes
  Object.keys(nodesData).forEach(id => {
    const data = nodesData[id];
    const coords = getCoords(data);

    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = `eco-node-wrapper eco-node-${data.type}`;
    nodeWrapper.style.left = `${coords.x}%`;
    nodeWrapper.style.top = `${coords.y}%`;
    nodeWrapper.dataset.id = id;

    const node = document.createElement('div');
    node.className = `eco-node`;
    if (data.img) {
      node.innerHTML = `<img src="${data.img}" alt="${data.label}" class="eco-node-img">`;
    } else {
      node.innerHTML = `<i data-lucide="${data.icon}"></i>`;
    }
    nodeWrapper.appendChild(node);

    const label = document.createElement('span');
    label.className = 'eco-node-label';
    label.textContent = data.label;
    nodeWrapper.appendChild(label);

    nodesContainer.appendChild(nodeWrapper);
    nodeElements[id] = nodeWrapper;

    // Static position only - nodes do not float

    // Mouse interactions
    nodeWrapper.addEventListener('mouseenter', (e) => {
      sound.hover();
      highlightConnections(id);
      showInfo(e, data);
    });

    nodeWrapper.addEventListener('mouseleave', () => {
      resetConnections();
      hideInfo();
    });

    // Touch interactions — mirror mouseenter for touch devices
    nodeWrapper.addEventListener('touchstart', (e) => {
      e.preventDefault(); // prevent synthetic mouse events from double-firing
      sound.hover();
      highlightConnections(id);
      showInfo(e.touches[0], data);
    }, { passive: false });
  });

  // Render Lucide icons for dynamically injected nodes
  createIcons({
    icons: { Network, Users, Code, Briefcase, Banknote, Star, TrendingUp, Rocket, Layers, Award, Lightbulb, Globe, MapPin },
    attrs: {
      'stroke-width': 1.5
    }
  });

  function highlightConnections(hoveredId) {
    // Highlight lines connected to this node
    Object.keys(lineElements).forEach(key => {
      const line = lineElements[key];
      if (line.dataset.source === hoveredId || line.dataset.target === hoveredId) {
        line.classList.add('highlight');
      } else {
        line.classList.remove('highlight');
      }
    });

    // Highlight the node itself and its immediate neighbors
    const neighbors = new Set([hoveredId]);
    links.forEach(l => {
      if (l.source === hoveredId) neighbors.add(l.target);
      if (l.target === hoveredId) neighbors.add(l.source);
    });

    Object.keys(nodeElements).forEach(id => {
      if (neighbors.has(id)) {
        nodeElements[id].classList.add('highlight');
      } else {
        nodeElements[id].classList.remove('highlight');
      }
    });
  }

  function resetConnections() {
    Object.values(lineElements).forEach(line => line.classList.remove('highlight'));
    Object.values(nodeElements).forEach(node => node.classList.remove('highlight'));
  }

  // Accept a point object { clientX, clientY } so both mouse and touch can call this
  function showInfo(point, data) {
    infoTitle.textContent = data.label;
    infoDesc.textContent = data.desc;

    // Derive initial position from the touch/mouse point
    const rect = container.getBoundingClientRect();
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    let targetX = x + 20;
    let targetY = y - 20;
    if (targetX + infoCard.offsetWidth > rect.width) {
      targetX = x - infoCard.offsetWidth - 20;
    }
    targetX = Math.max(10, Math.min(targetX, rect.width - infoCard.offsetWidth - 10));
    targetY = Math.max(10, Math.min(targetY, rect.height - infoCard.offsetHeight - 10));
    gsap.set(infoCard, { x: targetX, y: targetY });

    gsap.to(infoCard, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true
    });
  }

  function hideInfo() {
    gsap.to(infoCard, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: true
    });
  }

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight effect
    container.style.setProperty('--mouse-x', `${x}px`);
    container.style.setProperty('--mouse-y', `${y}px`);

    if (infoCard.style.opacity > 0) {
      let targetX = x + 20;
      let targetY = y - 20;

      // Smart clamping to ensure tooltip never gets cut off by overflow:hidden
      if (targetX + infoCard.offsetWidth > rect.width) {
        targetX = x - infoCard.offsetWidth - 20;
      }
      targetX = Math.max(10, Math.min(targetX, rect.width - infoCard.offsetWidth - 10));
      targetY = Math.max(10, Math.min(targetY, rect.height - infoCard.offsetHeight - 10));

      gsap.to(infoCard, {
        x: targetX,
        y: targetY,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
  });

  // Dismiss info card when tapping the background (touch devices)
  container.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.eco-node-wrapper')) {
      resetConnections();
      hideInfo();
    }
  }, { passive: true });

  // Reveal Animation on Scroll — vanilla strokeDashoffset (no DrawSVGPlugin needed)
  const ecoLines = svg.querySelectorAll('.eco-line');
  const updateLineLengths = () => {
    ecoLines.forEach(line => {
      // SVG <line> elements don't have getTotalLength, so compute length manually
      const x1 = parseFloat(line.getAttribute('x1'));
      const y1 = parseFloat(line.getAttribute('y1'));
      const x2 = parseFloat(line.getAttribute('x2'));
      const y2 = parseFloat(line.getAttribute('y2'));
      // Use container dimensions to resolve percentage values
      const rect = container.getBoundingClientRect();
      const dx = (x2 - x1) * rect.width / 100;
      const dy = (y2 - y1) * rect.height / 100;
      const length = Math.sqrt(dx * dx + dy * dy);
      line.style.strokeDasharray = length;
      
      // Only set offset if the line hasn't been animated yet
      if (line.style.strokeDashoffset !== '0px') {
        line.style.strokeDashoffset = length;
      }
    });
  };
  
  updateLineLengths();

  // Handle dynamic resize for responsive layout changes
  ecosystemResizeHandler = () => {
    links.forEach(link => {
      const sCoords = getCoords(nodesData[link.source]);
      const tCoords = getCoords(nodesData[link.target]);
      
      const line = lineElements[`${link.source}-${link.target}`];
      if (line) {
        line.setAttribute('x1', `${sCoords.x}%`);
        line.setAttribute('y1', `${sCoords.y}%`);
        line.setAttribute('x2', `${tCoords.x}%`);
        line.setAttribute('y2', `${tCoords.y}%`);
      }
      
      const particle = particleElements[`${link.source}-${link.target}`];
      if (particle) {
        gsap.killTweensOf(particle);
        particle.style.left = `${sCoords.x}%`;
        particle.style.top = `${sCoords.y}%`;
        gsap.to(particle, {
          left: `${tCoords.x}%`,
          top: `${tCoords.y}%`,
          duration: 3 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          delay: Math.random() * 2,
          opacity: 0,
          keyframes: {
            '0%': { opacity: 0, scale: 0 },
            '20%': { opacity: 1, scale: 1 },
            '80%': { opacity: 1, scale: 1 },
            '100%': { opacity: 0, scale: 0 }
          }
        });
      }
    });

    Object.keys(nodesData).forEach(id => {
      const coords = getCoords(nodesData[id]);
      const nodeWrapper = nodeElements[id];
      if (nodeWrapper) {
        nodeWrapper.style.left = `${coords.x}%`;
        nodeWrapper.style.top = `${coords.y}%`;
      }
    });

    updateLineLengths();
  };
  
  window.addEventListener('resize', ecosystemResizeHandler);

  gsap.to(ecoLines, {
    strokeDashoffset: 0,
    duration: 1.5,
    stagger: 0.1,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: container,
      start: 'top 75%',
    }
  });

  gsap.fromTo('.eco-node-wrapper',
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: container,
        start: "top 75%",
      }
    }
  );

}
