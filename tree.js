/**
 * EcoTrack - Procedural canvas-based fractal tree generator
 * Simulates growth based on user XP/Points and Level.
 * Animates wind sway for dynamic interactive experience.
 */

class SeededRandom {
    constructor(seed = 12345) {
        this.initialSeed = seed;
        this.seed = seed;
    }
    reset() {
        this.seed = this.initialSeed;
    }
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
    nextRange(min, max) {
        return min + this.next() * (max - min);
    }
}

class EcoTree {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.random = new SeededRandom(54321);
        
        // Animation states
        this.animationFrameId = null;
        this.points = 0;
        this.level = 1;
        this.swayTime = 0;
        this.windStrength = 0.03; // Base wind sway
        
        // Settings based on level
        this.maxDepth = 4;
        this.branchScale = 0.77;
        
        // Colors
        this.colors = {
            trunk: '#5c4033', // Brown
            trunkDark: '#3d2b22',
            leaves: ['#10b981', '#34d399', '#059669', '#a7f3d0'], // Emerald/Mint shades
            blossoms: ['#ec4899', '#f472b6', '#f43f5e', '#fda4af'] // Pink blossoms
        };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Adjust Canvas internal size for high-res screens
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0) return; // Don't collapse to 0 when hidden
        this.canvas.width = rect.width * (window.devicePixelRatio || 1);
        this.canvas.height = 450 * (window.devicePixelRatio || 1); // fixed height box
        this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    update(points, level) {
        this.points = points;
        this.level = level;
        
        // Determine recursion depth based on level (4 to 9)
        // Sapling at lvl 1, fully blossomed ancient oak at lvl 5+
        this.maxDepth = Math.min(9, 4 + Math.floor(this.level - 1));
        
        // Higher level trees branch slightly wider
        this.branchAngleRange = 22 + Math.min(8, level * 1.5); 
    }

    start() {
        if (this.animationFrameId) return;
        const tick = () => {
            this.swayTime += 0.015;
            this.draw();
            this.animationFrameId = requestAnimationFrame(tick);
        };
        this.animationFrameId = requestAnimationFrame(tick);
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    draw() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas with a very soft subtle radial gradient representing light source
        this.ctx.clearRect(0, 0, width, height);
        
        const grad = this.ctx.createRadialGradient(width/2, height*0.7, 50, width/2, height*0.7, width/1.5);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.03)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, width, height);

        // Reset our pseudo-random generator so the tree keeps the exact same branch angles/lengths
        this.random.reset();
        
        // Sway calculation (wind effect)
        const windSway = Math.sin(this.swayTime) * this.windStrength;
        
        // Start drawing the trunk from bottom-center
        const startX = width / 2;
        const startY = height - 30;
        
        // Base trunk height scale (grows larger with XP)
        const baseLength = 70 + Math.min(35, Math.sqrt(this.points) * 2.5);
        const baseThickness = 12 + Math.min(10, this.level * 2);
        
        // Ground line
        this.ctx.beginPath();
        this.ctx.moveTo(startX - 60, startY);
        this.ctx.lineTo(startX + 60, startY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.drawBranch(startX, startY, baseLength, -90, baseThickness, 0, windSway);
    }

    drawBranch(x1, y1, length, angle, thickness, depth, windSway) {
        // Calculate endpoint
        const angleRad = (angle * Math.PI) / 180;
        const x2 = x1 + Math.cos(angleRad) * length;
        const y2 = y1 + Math.sin(angleRad) * length;

        // Draw branch line
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        
        // Trunk color gets lighter and greener at the branches
        const ratio = depth / this.maxDepth;
        this.ctx.strokeStyle = this.interpolateColor(this.colors.trunkDark, '#4ade80', ratio * 0.4);
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Recursion base case
        if (depth >= this.maxDepth) {
            this.drawLeaves(x2, y2, depth);
            return;
        }

        // Branching logic: 2 branches for standard levels, sometimes 3 at higher levels
        const nextDepth = depth + 1;
        const nextThickness = thickness * 0.72;
        const nextLength = length * (this.branchScale + this.random.nextRange(-0.05, 0.05));
        
        // Calculate swaying deflection based on height
        const swayOffset = windSway * (depth + 1) * 1.5;
        
        // Left Branch
        const leftAngle = angle - this.random.nextRange(15, 30) + swayOffset;
        this.drawBranch(x2, y2, nextLength, leftAngle, nextThickness, nextDepth, windSway);

        // Right Branch
        const rightAngle = angle + this.random.nextRange(15, 30) + swayOffset;
        this.drawBranch(x2, y2, nextLength, rightAngle, nextThickness, nextDepth, windSway);

        // Rare middle branch on older trees (higher levels)
        if (this.level >= 3 && depth < 3 && this.random.next() > 0.65) {
            const midAngle = angle + this.random.nextRange(-10, 10) + swayOffset;
            this.drawBranch(x2, y2, nextLength * 0.9, midAngle, nextThickness * 0.8, nextDepth, windSway);
        }
    }

    drawLeaves(x, y, depth) {
        // Number of leaves/flowers depends on XP/Points
        // More points = leafier tree!
        const leafDensity = 2 + Math.min(8, Math.floor(this.points / 30));
        
        for (let i = 0; i < leafDensity; i++) {
            const rx = x + this.random.nextRange(-15, 15);
            const ry = y + this.random.nextRange(-15, 15);
            const size = this.random.nextRange(3, 8);
            
            // Randomly select leaf green color
            const leafColorIdx = Math.floor(this.random.next() * this.colors.leaves.length);
            this.ctx.fillStyle = this.colors.leaves[leafColorIdx];
            
            this.ctx.beginPath();
            // Draw leaf shape (ellipse or small circle)
            this.ctx.arc(rx, ry, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw flowers/blossoms if user is high level or completed a lot of challenges
        // Blossoms unlock starting from level 2
        if (this.level >= 2 && this.points > 100) {
            const blossomCount = Math.min(3, Math.floor((this.points - 100) / 100));
            for (let i = 0; i < blossomCount; i++) {
                if (this.random.next() > 0.5) {
                    const bx = x + this.random.nextRange(-10, 10);
                    const by = y + this.random.nextRange(-10, 10);
                    const bSize = this.random.nextRange(2.5, 4.5);
                    
                    const blossomColorIdx = Math.floor(this.random.next() * this.colors.blossoms.length);
                    this.ctx.fillStyle = this.colors.blossoms[blossomColorIdx];
                    
                    this.ctx.beginPath();
                    this.ctx.arc(bx, by, bSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Tiny yellow center
                    this.ctx.fillStyle = '#fef08a';
                    this.ctx.beginPath();
                    this.ctx.arc(bx, by, bSize * 0.3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    interpolateColor(color1, color2, factor) {
        // Simple hex/rgb interpolator
        // Fallback simple colors
        if (factor <= 0) return color1;
        if (factor >= 1) return color2;
        
        // Assuming colors are simple hex (e.g. #5c4033)
        const parseHex = (hex) => {
            if (hex.startsWith('#')) hex = hex.slice(1);
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        };
        
        const c1 = parseHex(color1);
        const c2 = parseHex(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
}
