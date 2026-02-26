class FDS_App {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.state = 'INTRO'; // INTRO, DETAIL
        this.selectedService = null;

        // Basic setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.labelRenderer = new THREE.CSS2DRenderer();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Objects
        this.placeholderCharacter = null;
        this.introOrbs = [];
        this.detailOrbs = [];

        this.init();
    }

    init() {
        // Renderers
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.container.appendChild(this.labelRenderer.domElement);

        // Camera & Lights
        this.camera.position.set(0, 1.8, 9);
        this.camera.lookAt(0, 1.5, 0);
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8), light);

        this.createPlaceholderCharacter();
        this.createIntroOrbs();

        this.animate();
        this.addEventListeners();
    }

    createPlaceholderCharacter() {
        const geometry = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x64FFDA, roughness: 0.4, metalness: 0.2 });
        this.placeholderCharacter = new THREE.Mesh(geometry, material);
        this.placeholderCharacter.position.y = 1;
        this.placeholderCharacter.scale.set(0.01, 0.01, 0.01); // Start small
        this.scene.add(this.placeholderCharacter);
    }

    createIntroOrbs() {
        const businessUnits = [
            { name: '병원동행', pos: new THREE.Vector3(-3, 2.5, 0) },
            { name: '공항의전', pos: new THREE.Vector3(3, 2.5, 0) },
            { name: '등하원/등하교', pos: new THREE.Vector3(-1.8, 4, 0) },
            { name: '실버케어', pos: new THREE.Vector3(1.8, 4, 0) },
        ];
        // Store original position for the return animation
        businessUnits.forEach(u => u.originalPos = u.pos.clone()); 
        this.introOrbs = this.createOrbs(businessUnits, true);
    }
    
    createDetailOrbs() {
        const detailUnits = [
            { name: '알바 지원하기', pos: new THREE.Vector3(-2.5, 1.5, 0), type: 'apply' },
            { name: '일 맡겨보기', pos: new THREE.Vector3(2.5, 1.5, 0), type: 'request' },
        ];
        this.detailOrbs = this.createOrbs(detailUnits, false);
    }

    createOrbs(units, isIntroOrb) {
        return units.map(unit => {
            const material = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x64FFDA, emissiveIntensity: 0, transparent: true, opacity: 0 });
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
            sphere.position.copy(unit.pos);
            sphere.userData = { name: unit.name, type: unit.type, isIntro: isIntroOrb, originalPos: unit.originalPos };
            this.scene.add(sphere);

            const div = document.createElement('div');
            div.className = 'label';
            div.textContent = unit.name;
            const label = new THREE.CSS2DObject(div);
            label.position.copy(sphere.position);
            label.position.y += 0.7;
            sphere.add(label);

            return { sphere, label, div };
        });
    }

    startIntroSequence() {
        document.getElementById('start-intro-btn').style.display = 'none';
        this.revealOrb({ sphere: this.placeholderCharacter }, 0);
        this.introOrbs.forEach((orb, i) => this.revealOrb(orb, 400 + i * 150));
    }

    revealOrb(orb, delay) {
        setTimeout(() => {
            new TWEEN.Tween(orb.sphere.material).to({ opacity: 1 }, 500).start();
            new TWEEN.Tween(orb.sphere.material).to({ emissiveIntensity: 1.5 }, 1000).start();
            orb.sphere.scale.set(0.01, 0.01, 0.01);
            new TWEEN.Tween(orb.sphere.scale).to({ x: 1, y: 1, z: 1 }, 1000).easing(TWEEN.Easing.Elastic.Out).start();
            if (orb.div) setTimeout(() => orb.div.classList.add('visible'), 500);
        }, delay);
    }

    hideOrb(orb, delay) {
        setTimeout(() => {
            new TWEEN.Tween(orb.sphere.material).to({ opacity: 0 }, 300).start();
            new TWEEN.Tween(orb.sphere.scale).to({ x: 0.01, y: 0.01, z: 0.01 }, 300).easing(TWEEN.Easing.Back.In).start();
            if (orb.div) orb.div.classList.remove('visible');
        }, delay);
    }

    transitionToDetail(clickedOrb) {
        this.state = 'DETAIL';
        this.selectedService = clickedOrb;
        this.hideOrb({ sphere: this.placeholderCharacter }, 0);
        this.introOrbs.forEach(orb => {
            if (orb.sphere.uuid !== clickedOrb.sphere.uuid) this.hideOrb(orb, 0);
        });

        const targetPos = new THREE.Vector3(0, 4.5, 0);
        new TWEEN.Tween(clickedOrb.sphere.position).to(targetPos, 800).easing(TWEEN.Easing.Circular.InOut).start();
        new TWEEN.Tween(clickedOrb.label.position).to({ x: targetPos.x, y: targetPos.y + 0.7, z: targetPos.z }, 800).easing(TWEEN.Easing.Circular.InOut).start();

        if (this.detailOrbs.length === 0) this.createDetailOrbs();
        this.detailOrbs.forEach((orb, i) => this.revealOrb(orb, 600 + i * 200));
        document.getElementById('back-btn').style.display = 'block';
    }

    transitionToIntro() {
        this.state = 'INTRO';
        const originalPos = this.selectedService.sphere.userData.originalPos;
        this.detailOrbs.forEach(orb => this.hideOrb(orb, 0));

        new TWEEN.Tween(this.selectedService.sphere.position).to(originalPos, 800).easing(TWEEN.Easing.Circular.InOut)
            .onComplete(() => this.selectedService = null)
            .start();

        this.revealOrb({ sphere: this.placeholderCharacter }, 500);
        this.introOrbs.forEach(orb => {
            if (orb.sphere.uuid !== this.selectedService.sphere.uuid) this.revealOrb(orb, 500);
        });
        
        document.getElementById('back-btn').style.display = 'none';
    }

    addEventListeners() {
        document.getElementById('start-intro-btn').addEventListener('click', () => this.startIntroSequence());
        document.getElementById('back-btn').addEventListener('click', () => this.transitionToIntro());
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e), false);
    }

    getIntersectedObject() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const orbsToCheck = (this.state === 'INTRO') ? this.introOrbs : this.detailOrbs;
        const intersects = this.raycaster.intersectObjects(orbsToCheck.map(o => o.sphere));
        return (intersects.length > 0) ? intersects[0].object : null;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        document.body.style.cursor = this.getIntersectedObject() ? 'pointer' : 'default';
    }

    onMouseClick(event) {
        const clickedObject = this.getIntersectedObject();
        if (!clickedObject) return;

        if (this.state === 'INTRO') {
            const orbData = this.introOrbs.find(o => o.sphere.uuid === clickedObject.uuid);
            if (orbData) this.transitionToDetail(orbData);
        } else if (this.state === 'DETAIL') {
            if (clickedObject.userData.type === 'apply') {
                alert(''알바 지원하기' 폼을 여기에 표시합니다.');
            } else {
                alert(''일 맡겨보기' 폼을 여기에 표시합니다.');
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        TWEEN.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FDS_App('#app-container');
});
