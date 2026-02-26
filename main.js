
class FDS_App_3D {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.model = null;
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 0, 10);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);

        this.load3DModel();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    load3DModel() {
        const loader = new THREE.GLTFLoader();
        // Corrected path
        loader.load('./Meshy_AI_Cosmic_Exploration_0226042126_generate.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(1.5, 1.5, 1.5);
            this.model.position.set(0, -2.5, 0);
            this.scene.add(this.model);
        }, undefined, (error) => {
            console.error('An error happened during model loading:', error);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        if (this.model) {
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.model.rotation.y = mouseX * 0.5;
            this.model.rotation.x = mouseY * 0.2;
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

class DriverApplicationHandler {
    constructor(container, serviceOptions, closeCallback) {
        this.container = container;
        this.serviceOptions = serviceOptions;
        this.closeCallback = closeCallback;
        this.currentStep = 1;

        this.steps = {
            1: this.container.querySelector('#driver-step-1'),
            1.5: this.container.querySelector('#driver-step-1-5'),
            2: this.container.querySelector('#driver-step-2'),
            3: this.container.querySelector('#driver-step-3'),
        };

        this.inputs = {
            name: this.container.querySelector('#driver-name'),
            phone: this.container.querySelector('#driver-phone'),
            area: this.container.querySelector('#driver-area'),
            dob: this.container.querySelector('#driver-dob'),
            gender: this.container.querySelector('#driver-gender'),
            hasCar: this.container.querySelector('#driver-has-car'),
            termsAgree: this.container.querySelector('#terms-agree'),
            certificateCaregiver: this.container.querySelector('#cert-caregiver'),
            certificateSocialWorker: this.container.querySelector('#cert-social-worker'),
            finalAgree: this.container.querySelector('#final-agree'),
        };

        this.buttons = {
            step1Next: this.container.querySelector('#driver-step-1-next'),
            step1BackToMain: this.container.querySelector('#driver-step-1-back-to-main'),
            step1_5Next: this.container.querySelector('#driver-step-1-5-next'),
            step1_5Back: this.container.querySelector('#driver-step-1-5-back'),
            step2Next: this.container.querySelector('#driver-step-2-next'),
            step2Back: this.container.querySelector('#driver-step-2-back'),
            step3Submit: this.container.querySelector('#driver-step-3-submit'),
            step3Back: this.container.querySelector('#driver-step-3-back'),
        };

        this.serviceSelectionContainer = this.container.querySelector('#service-selection-checkboxes');
        this.serviceTermsDisplay = this.container.querySelector('#service-terms-display');
        this.certificateSection = this.container.querySelector('#certificate-section');
        
        this.init();
    }

    init() {
        this.populateServiceSelection();
        this.addEventListeners();
        this.goToStep(1);
    }

    populateServiceSelection() {
        for (const key in this.serviceOptions) {
            const option = this.serviceOptions[key];
            const div = document.createElement('div');
            div.classList.add('checkbox-group');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `service-${key}`;
            input.name = 'service';
            input.value = key;
            const label = document.createElement('label');
            label.htmlFor = `service-${key}`;
            label.textContent = option.label;
            
            div.appendChild(input);
            div.appendChild(label);
            this.serviceSelectionContainer.appendChild(div);
        }
    }

    addEventListeners() {
        // Navigation
        this.buttons.step1Next.addEventListener('click', () => this.goToStep(1.5));
        this.buttons.step1BackToMain.addEventListener('click', () => this.closeCallback());
        this.buttons.step1_5Next.addEventListener('click', () => this.goToStep(2));
        this.buttons.step1_5Back.addEventListener('click', () => this.goToStep(1));
        this.buttons.step2Next.addEventListener('click', () => this.goToStep(3));
        this.buttons.step2Back.addEventListener('click', () => this.goToStep(1.5));
        this.buttons.step3Back.addEventListener('click', () => this.goToStep(2));
        this.buttons.step3Submit.addEventListener('click', () => this.handleFinalSubmit());

        // Dynamic validation
        Object.values(this.inputs).forEach(input => {
            if(input) input.addEventListener('input', () => this.validateStep1());
        });
        
        this.serviceSelectionContainer.addEventListener('change', () => {
            this.updateTermsDisplay();
            this.validateStep2();
        });

        this.inputs.termsAgree.addEventListener('change', () => this.validateStep2());

        if (this.inputs.certificateCaregiver) {
            this.inputs.certificateCaregiver.addEventListener('change', () => this.validateStep2());
        }
        if (this.inputs.certificateSocialWorker) {
            this.inputs.certificateSocialWorker.addEventListener('change', () => this.validateStep2());
        }
    }

    goToStep(stepNumber) {
        this.currentStep = stepNumber;
        for (const step in this.steps) {
            this.steps[step].classList.add('hidden');
        }
        this.steps[stepNumber].classList.remove('hidden');
        
        // Initial validation for the current step
        if (stepNumber === 1) this.validateStep1();
        if (stepNumber === 2) this.validateStep2();
    }
    
    validateStep1() {
        const isStep1Valid = this.inputs.name.value.trim() !== '' &&
                             this.inputs.phone.value.match(/^\d{10,11}$/) &&
                             this.inputs.area.value.trim() !== '' &&
                             this.inputs.dob.value !== '' &&
                             this.inputs.gender.value !== '';
        this.buttons.step1Next.disabled = !isStep1Valid;
    }
    
    updateTermsDisplay() {
        const selectedServices = Array.from(this.serviceSelectionContainer.querySelectorAll('input:checked')).map(cb => cb.value);
        
        const hospitalEscortSelected = selectedServices.includes('병원동행');
        if (hospitalEscortSelected) {
            this.certificateSection.classList.remove('hidden');
        } else {
            this.certificateSection.classList.add('hidden');
            this.inputs.certificateCaregiver.checked = false;
            this.inputs.certificateSocialWorker.checked = false;
        }

        if (selectedServices.length === 0) {
            this.serviceTermsDisplay.innerHTML = '<p>업무를 선택하면 여기에 해당 주의사항이 표시됩니다.</p>';
            this.inputs.termsAgree.checked = false;
            this.inputs.termsAgree.disabled = true;
        } else {
            this.serviceTermsDisplay.innerHTML = selectedServices.map(name => `<p><b>[${name}]</b> ${this.serviceOptions[name].terms}</p>`).join('');
            this.inputs.termsAgree.disabled = false;
        }
        this.validateStep2();
    }

    validateStep2() {
        const servicesSelected = this.serviceSelectionContainer.querySelector('input:checked');
        const termsAgreed = this.inputs.termsAgree.checked;
        
        let certificateValid = true;
        const hospitalEscortSelected = this.serviceSelectionContainer.querySelector('input[value="병원동행"]').checked;
        
        if (hospitalEscortSelected) {
            certificateValid = this.inputs.certificateCaregiver.checked || this.inputs.certificateSocialWorker.checked;
        }

        this.buttons.step2Next.disabled = !(servicesSelected && termsAgreed && certificateValid);
    }

    handleFinalSubmit() {
        if (!this.inputs.finalAgree.checked) {
            alert('업무 제휴 협약서에 동의해야 합니다.');
            return;
        }

        const hospitalEscortApplied = this.serviceSelectionContainer.querySelector('input[value="병원동행"]').checked;
        let finalMessage = '저희와 파트너가 되심을 축하드립니다!';

        if (hospitalEscortApplied) {
            finalMessage += '\n\n[병원동행] 업무 지원자는 자격증(요양보호사 또는 사회복지사) 사본을 admin@fds.com 으로 제출해주시기 바랍니다.';
        }

        alert(finalMessage);
        this.closeCallback();
    }
    
    reset() {
        // Reset inputs
        this.inputs.name.value = '';
        this.inputs.phone.value = '';
        this.inputs.area.value = '';
        this.inputs.dob.value = '';
        this.inputs.gender.value = '';
        this.inputs.hasCar.checked = false;
        
        // Reset service selection
        Array.from(this.serviceSelectionContainer.querySelectorAll('input:checked')).forEach(cb => cb.checked = false);
        this.updateTermsDisplay();

        // Reset certificates
        this.certificateSection.classList.add('hidden');
        this.inputs.certificateCaregiver.checked = false;
        this.inputs.certificateSocialWorker.checked = false;
        
        // Reset agreements
        this.inputs.termsAgree.checked = false;
        this.inputs.finalAgree.checked = false;
        
        this.goToStep(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // This is where we will instantiate our app
    const appContainer = document.getElementById('app-container');
    const overlay = document.getElementById('service-overlay');
    
    // Initialize the 3D background
    new FDS_App_3D('#app-container');

    const serviceOptions = {
        '병원동행': { label: '병원동행', terms: '자격증(요양보호사, 사회복지사) 소지자만 지원 가능합니다.' },
        '공항의전': { label: '공항의전', terms: '공항 출입 절차 및 규정을 숙지해야 합니다.' },
        '등하원/등하교': { label: '등하원/등하교', terms: '아이들의 안전을 최우선으로 생각해야 합니다.' },
        '실버케어': { label: '실버케어', terms: '어르신에 대한 이해와 존중이 필요합니다.' },
        '골프의전': { label: '골프의전', terms: '골프장 및 클럽하우스 규정을 준수해야 합니다.' },
    };

    const closeOverlay = () => {
        overlay.classList.add('hidden');
        driverApp.reset();
    };

    const driverApp = new DriverApplicationHandler(overlay, serviceOptions, closeOverlay);

    // This is a placeholder for a button or event that will open the driver application form
    // For now, let's assume a button with id="open-driver-app" exists or we can trigger it manually.
    // Example: document.getElementById('open-driver-app-btn').addEventListener('click', () => {
    //    overlay.classList.remove('hidden');
    // });
    
    // For demonstration, let's open it via a click on the canvas or a temporary button.
    appContainer.addEventListener('click', () => {
         overlay.classList.remove('hidden');
    });

});
