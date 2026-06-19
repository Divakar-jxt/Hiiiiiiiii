document.addEventListener("DOMContentLoaded", () => {
    // --- AUDIO MANAGEMENT ---
    const bgMusic = document.getElementById("ambient-music");
    const paperSound = document.getElementById("paper-sound");
    const audioToggle = document.getElementById("audio-toggle");
    let isMusicPlaying = false;

    audioToggle.addEventListener("click", () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            audioToggle.style.opacity = "0.5";
        } else {
            bgMusic.play();
            audioToggle.style.opacity = "1";
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // --- CANVAS PARTICLE ENGINE (60 FPS) ---
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    let particleMode = "night"; // Modes: night, magic, garden

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(mode) {
            this.mode = mode;
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.life = Math.random() * 100;
            
            // Mode specific properties
            if(this.mode === 'garden') {
                this.color = `rgba(255, ${182 + Math.random()*50}, ${193 + Math.random()*50}, `; // Petal colors
                this.size = Math.random() * 4 + 2;
                this.speedY = Math.random() * 1 + 0.5; // Falling down
                this.speedX = Math.random() * 2 - 1;
            } else {
                this.color = `rgba(255, 255, 255, `; // Star/Firefly color
            }
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= 0.5;

            if (this.mode === 'garden' && this.y > canvas.height) {
                this.y = 0;
                this.x = Math.random() * canvas.width;
            } else if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.life = Math.random() * 100;
            }
        }
        draw() {
            ctx.fillStyle = this.color + (this.life / 100) + ")";
            ctx.beginPath();
            if(this.mode === 'garden') {
                // Draw petal shape
                ctx.ellipse(this.x, this.y, this.size, this.size/2, this.life, 0, Math.PI * 2);
            } else {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }

    function initParticles(mode, count = 100) {
        particlesArray = [];
        particleMode = mode;
        for (let i = 0; i < count; i++) {
            particlesArray.push(new Particle(mode));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }
    
    initParticles("night", 150);
    animateParticles();

    // --- GSAP CINEMATIC SEQUENCES ---
    
    const landingScene = document.getElementById("landing-scene");
    const envelopeScene = document.getElementById("envelope-scene");
    const gardenScene = document.getElementById("garden-scene");
    const btnBegin = document.getElementById("btn-begin");
    const pandaSeal = document.getElementById("panda-seal");
    const flap = document.querySelector(".flap");
    const letter = document.querySelector(".letter");
    const letterContent = document.querySelector(".letter-content");
    const typewriterText = document.getElementById("typewriter-text");
    const cornerPanda = document.querySelector(".corner-panda");

    // Sequence 1: Begin Button Click
    btnBegin.addEventListener("click", () => {
        // Attempt to auto-play music on user interaction
        if(!isMusicPlaying) {
            bgMusic.play().catch(e => console.log("Audio play prevented"));
            isMusicPlaying = true;
            audioToggle.style.opacity = "1";
        }

        gsap.to(landingScene, {
            opacity: 0, 
            duration: 1, 
            onComplete: () => {
                landingScene.classList.remove("active");
                envelopeScene.classList.add("active");
                gsap.from(".envelope-container", { scale: 0.8, opacity: 0, duration: 1.5, ease: "power3.out" });
            }
        });
    });

    // Sequence 2: Open Envelope
    pandaSeal.addEventListener("click", () => {
        pandaSeal.classList.add("broken");
        if(paperSound) paperSound.play();

        const tl = gsap.timeline();
        
        // Open Flap
        tl.to(flap, { rotateX: 180, duration: 1, ease: "power2.inOut" })
          // Slide Letter Up
          .to(letter, { y: -150, duration: 1, ease: "power2.out" })
          // Bring Letter to front and scale up to read
          .to(letter, { 
              zIndex: 10, 
              y: 0,
              scale: window.innerWidth < 768 ? 1.5 : 2.5, // Scale based on device
              duration: 1.5, 
              ease: "power3.inOut" 
          })
          // Fade in text area
          .to(letterContent, { opacity: 1, duration: 0.5, onComplete: startTypewriter });
    });

    // Sequence 3: Typewriter Effect
    const message = "Happy Birthday! 🎂\n\nYou bring so much light into the world. May your day be as magical, beautiful, and extraordinary as you are.\n\nTake a breath, make a wish, and get ready...";
    
    function startTypewriter() {
        initParticles("magic", 80); // Switch canvas to magic dust
        gsap.to(cornerPanda, { opacity: 1, duration: 1, delay: 0.5 });
        
        let i = 0;
        typewriterText.innerHTML = "";
        
        function typeWriter() {
            if (i < message.length) {
                if(message.charAt(i) === '\n') {
                    typewriterText.innerHTML += "<br>";
                } else {
                    typewriterText.innerHTML += message.charAt(i);
                }
                i++;
                setTimeout(typeWriter, 50); // Typing speed
            } else {
                // Wait 4 seconds after reading, then transition to final scene
                setTimeout(transitionToGarden, 4000);
            }
        }
        typeWriter();
    }

    // Sequence 4: Transition to Garden (Final Surprise)
    function transitionToGarden() {
        const tl = gsap.timeline();
        
        tl.to(envelopeScene, { opacity: 0, duration: 1.5 })
          .call(() => {
              envelopeScene.classList.remove("active");
              gardenScene.classList.add("active");
              initParticles("garden", 150); // Switch to cherry blossoms
          })
          .from(".garden-background", { scale: 1.1, duration: 2, ease: "power1.out" })
          .from("#garden-scene .glass-panel", { y: 30, opacity: 0, duration: 1 }, "-=1");
    }
});
