class FDS_App_3D {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.model = null;
        
        // Adjust camera positions for a much closer view
        this.initialCameraPosition = new THREE.Vector3(0, -1, 5); // Start closer
        this.formViewCameraPosition = new THREE.Vector3(0, -1.5, 3); // Zoom-in even more

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.copy(this.initialCameraPosition);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);

        this.load3DModel();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        // No mouse move when form is open
        this.isInteractive = true;
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    load3DModel() {
        const loader = new THREE.GLTFLoader();
        loader.load('./Meshy_AI_Cosmic_Exploration_0226042126_generate.glb', (gltf) => {
            this.model = gltf.scene;
            // Significantly increase scale and adjust position
            this.model.scale.set(4, 4, 4);
            this.model.position.set(0, -3.5, 0);
            this.scene.add(this.model);
        }, undefined, (error) => {
            console.error('An error happened during model loading:', error);
        });
    }

    animateCamera(targetPosition, duration, onComplete) {
        const currentPos = this.camera.position.clone();
        new TWEEN.Tween(currentPos)
            .to(targetPosition, duration)
            .easing(TWEEN.Easing.Circular.InOut) // A more dynamic easing
            .onUpdate(() => {
                this.camera.position.copy(currentPos);
            })
            .onComplete(onComplete || (() => {}))
            .start();
    }
    
    animateToFormView(callback) {
        this.isInteractive = false;
        this.animateCamera(this.formViewCameraPosition, 1200, callback);
    }
    
    animateToIntroView(callback) {
        this.isInteractive = true;
        this.animateCamera(this.initialCameraPosition, 1200, callback);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        if (this.model && this.isInteractive) {
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Reduced rotation for a subtler effect
            this.model.rotation.y = mouseX * 0.25;
            this.model.rotation.x = mouseY * 0.1;
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        TWEEN.update(); 
        this.renderer.render(this.scene, this.camera);
    }
}

class DriverApplicationHandler {
    // ... (DriverApplicationHandler class is unchanged) ...
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('service-overlay');
    const introOverlay = document.querySelector('.intro-overlay');
    const openDriverAppBtn = document.getElementById('open-driver-app-btn');
    
    const fdsApp3D = new FDS_App_3D('#app-container');

    const serviceOptions = {
        '병원동행': { label: '병원동행', terms: '자격증(요양보호사, 사회복지사) 소지자만 지원 가능합니다.' },
        '공항의전': { label: '공항의전', terms: '공항 출입 절차 및 규정을 숙지해야 합니다.' },
        '등하원/등하교': { label: '등하원/등하교', terms: '아이들의 안전을 최우선으로 생각해야 합니다.' },
        '실버케어': { label: '실버케어', terms: '어르신에 대한 이해와 존중이 필요합니다.' },
        '골프의전': { label: '골프의전', terms: '골프장 및 클럽하우스 규정을 준수해야 합니다.' },
    };

    const closeOverlay = () => {
        introOverlay.classList.remove('hidden');
        overlay.classList.add('hidden');
        fdsApp3D.animateToIntroView(); // Animate camera back
        driverApp.reset();
    };

    const driverApp = new DriverApplicationHandler(overlay, serviceOptions, closeOverlay);

    openDriverAppBtn.addEventListener('click', () => {
        introOverlay.classList.add('hidden');
        fdsApp3D.animateToFormView(); // Animate camera forward
        overlay.classList.remove('hidden'); // Show overlay simultaneously
    });
});
