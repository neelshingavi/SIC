import gsap from 'gsap';
import { sound } from './sound.js';
import { createIcons, Network, Users, Code, Briefcase, Banknote, Star, TrendingUp, Rocket, Layers, Award, Lightbulb, Globe, MapPin } from 'lucide';

export function initEcosystem() {
  const container = document.getElementById('ecosystem-graph');
  if (!container) return;

  const svg = document.getElementById('ecosystem-lines');
  const nodesContainer = document.getElementById('ecosystem-nodes');
  const infoCard = document.getElementById('ecosystem-info');
  const infoTitle = document.getElementById('info-title');
  const infoDesc = document.getElementById('info-desc');

  // Hardcoded positions based on a 100x100 virtual grid, which we'll map to percentages
  // This gives a highly controlled radial layout without needing a physics engine
  const nodesData = {
    'sic': { x: 50, y: 50, label: 'SIC PICT', type: 'center', desc: 'The central hub driving innovation and entrepreneurship at PICT.', img: '/images/logo.png' },

    'mentors': { x: 32, y: 32, label: 'Mentors', type: 'cluster', desc: 'A curated network of seasoned founders providing strategic guidance.', icon: 'users' },
    'm1': { x: 12, y: 15, label: 'Tech', type: 'leaf', desc: 'Deep-tech mentoring in AI, Web3, and scalable systems.', icon: 'code' },
    'm2': { x: 38, y: 10, label: 'Business', type: 'leaf', desc: 'Product-market fit, unit economics, and scaling strategies.', icon: 'briefcase' },

    'funding': { x: 68, y: 32, label: 'Funding', type: 'cluster', desc: 'Facilitating access to critical early-stage capital and investment.', icon: 'banknote' },
    'f1': { x: 88, y: 18, label: 'Angels', type: 'leaf', desc: 'Access to seed funds and active angel investor syndicates.', icon: 'star' },
    'f2': { x: 62, y: 10, label: 'VCs', type: 'leaf', desc: 'Direct channels to prominent venture capital firms and funds.', icon: 'trending-up' },

    'startups': { x: 68, y: 68, label: 'Startups', type: 'cluster', desc: 'The core pipeline of high-growth ventures nurtured within SIC.', icon: 'rocket' },
    's1': { x: 88, y: 85, label: 'Incubated', type: 'leaf', desc: 'Ventures currently scaling within our intensive incubation program.', icon: 'layers' },
    's2': { x: 62, y: 90, label: 'Graduated', type: 'leaf', desc: 'Successful alumni ventures that have achieved market scale.', icon: 'award' },
    's3': { x: 88, y: 60, label: 'Pre-Inc', type: 'leaf', desc: 'Early-stage validation and prototyping for student innovators.', icon: 'lightbulb' },

    'alumni': { x: 32, y: 68, label: 'Alumni', type: 'cluster', desc: 'A powerful, global web of PICT alumni and corporate leaders.', icon: 'globe' },
    'a1': { x: 12, y: 82, label: 'Global', type: 'leaf', desc: 'Strategic partnerships with industry giants for resources.', icon: 'map-pin' }
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

  // Render SVG lines
  links.forEach(link => {
    const s = nodesData[link.source];
    const t = nodesData[link.target];

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${s.x}%`);
    line.setAttribute('y1', `${s.y}%`);
    line.setAttribute('x2', `${t.x}%`);
    line.setAttribute('y2', `${t.y}%`);
    line.classList.add('eco-line');
    line.dataset.source = link.source;
    line.dataset.target = link.target;

    svg.appendChild(line);
    lineElements[`${link.source}-${link.target}`] = line;

    // Create energy particle
    const particle = document.createElement('div');
    particle.className = 'eco-particle';
    particle.style.left = `${s.x}%`;
    particle.style.top = `${s.y}%`;
    nodesContainer.appendChild(particle);

    // Animate particle along the line
    gsap.to(particle, {
      left: `${t.x}%`,
      top: `${t.y}%`,
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

    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = `eco-node-wrapper eco-node-${data.type}`;
    nodeWrapper.style.left = `${data.x}%`;
    nodeWrapper.style.top = `${data.y}%`;
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

    // Hover interactions
    nodeWrapper.addEventListener('mouseenter', (e) => {
      sound.hover();
      highlightConnections(id);
      showInfo(e, data);
    });

    nodeWrapper.addEventListener('mouseleave', () => {
      resetConnections();
      hideInfo();
    });
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

  function showInfo(e, data) {
    infoTitle.textContent = data.label;
    infoDesc.textContent = data.desc;

    // Position the info card near the mouse
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

      if (targetX + infoCard.offsetWidth > rect.width) {
        targetX = x - infoCard.offsetWidth - 20;
      }
      if (targetY + infoCard.offsetHeight > rect.height) {
        targetY = rect.height - infoCard.offsetHeight - 20;
      } else if (targetY < 0) {
        targetY = 20;
      }

      gsap.to(infoCard, {
        x: targetX,
        y: targetY,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
  });

  // Reveal Animation on Scroll
  gsap.fromTo(svg.querySelectorAll('.eco-line'),
    { drawSVG: "0%" },
    {
      drawSVG: "100%",
      duration: 1.5,
      stagger: 0.1,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: container,
        start: "top 75%",
      }
    }
  );

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

  // Initialize lucide icons for new nodes
  createIcons({
    icons: { Network, Users, Code, Briefcase, Banknote, Star, TrendingUp, Rocket, Layers, Award, Lightbulb, Globe, MapPin }
  });
}
