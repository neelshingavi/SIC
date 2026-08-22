export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'stats.html']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        HTMLCanvasElement: 'readonly',
        WebGLRenderingContext: 'readonly',
        SVGPathElement: 'readonly',
        SVGCircleElement: 'readonly',
        SVGPolylineElement: 'readonly',
        console: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        Image: 'readonly',
        AudioContext: 'readonly',
        webkitAudioContext: 'readonly',
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        Node: 'readonly',
        alert: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
];
